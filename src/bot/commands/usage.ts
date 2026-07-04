import type { Message } from "discord.js";
import { prisma } from "@/lib/prisma";
import { generateResponse } from "@/lib/gemini";

export async function handleUsage(message: Message): Promise<void> {
  try {
    if ('sendTyping' in message.channel) await message.channel.sendTyping();

    const rooms = await prisma.room.findMany({
      include: { devices: true },
      orderBy: { id: "asc" },
    });

    const roomBreakdown = rooms.map((r) => ({
      room: r.name,
      watts: r.devices
        .filter((d) => d.status)
        .reduce((sum, d) => sum + d.powerDraw, 0),
    }));

    const totalWatts = roomBreakdown.reduce((sum, r) => sum + r.watts, 0);

    // Daily kWh estimate
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const usageLogs = await prisma.usageLog.findMany({
      where: { timestamp: { gte: todayStart } },
    });

    let dailyKwh = 0;
    if (usageLogs.length > 0) {
      const avgWatts =
        usageLogs.reduce((sum, log) => sum + log.totalWatts, 0) / usageLogs.length;
      const hoursElapsed = (Date.now() - todayStart.getTime()) / (1000 * 60 * 60);
      dailyKwh = (avgWatts * hoursElapsed) / 1000;
    }

    const prompt = `Here is the current office power consumption data. Give a friendly, conversational summary including total power right now and today's estimated usage:\n\nTotal power: ${totalWatts}W\nToday's estimated usage: ${dailyKwh.toFixed(2)} kWh\nPer-room breakdown: ${JSON.stringify(roomBreakdown, null, 2)}`;

    const response = await generateResponse(prompt);
    await message.reply(response);
  } catch (error) {
    console.error("[Bot] !usage error:", error);
    await message.reply("Sorry, I couldn't fetch the power usage right now. 😅");
  }
}
