import type { Client, TextChannel } from "discord.js";
import { prisma } from "@/lib/prisma";
import { checkAndCreateAlerts } from "@/lib/alerts";

const ALERT_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const postedAlertIds = new Set<number>();

export function startAlertMonitor(client: Client): void {
  console.log("[Bot] Alert monitor started");

  // Check immediately, then on interval
  checkAndPostAlerts(client);
  setInterval(() => checkAndPostAlerts(client), ALERT_CHECK_INTERVAL);
}

async function checkAndPostAlerts(client: Client): Promise<void> {
  try {
    // Run alert detection
    await checkAndCreateAlerts();

    // Get all active alerts
    const alerts = await prisma.alert.findMany({
      where: { resolvedAt: null },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });

    const channelId = process.env.DISCORD_ALERT_CHANNEL_ID;
    if (!channelId) return;

    const channel = (await client.channels.fetch(channelId)) as TextChannel | null;
    if (!channel) return;
    if (!('send' in channel)) return;

    // Post only new alerts that haven't been posted yet
    for (const alert of alerts) {
      if (postedAlertIds.has(alert.id)) continue;
      postedAlertIds.add(alert.id);

      let message: string;
      if (alert.type === "after_hours") {
        const time = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: process.env.OFFICE_TIMEZONE || "Asia/Dhaka",
        });
        message = `Hey! ${alert.message} It's ${time} — did someone forget to leave? 💡`;
      } else if (alert.type === "all_on_2hr") {
        message = `Heads up! ${alert.message} Might want to check if that's intentional. ⚠️`;
      } else {
        message = alert.message;
      }

      await channel.send(message);
    }

    // Clean up posted IDs for resolved alerts
    const activeIds = new Set(alerts.map((a) => a.id));
    for (const id of postedAlertIds) {
      if (!activeIds.has(id)) postedAlertIds.delete(id);
    }
  } catch (error) {
    console.error("[Bot] Alert monitor error:", error);
  }
}
