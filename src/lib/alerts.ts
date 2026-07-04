import { prisma } from "./prisma";
import { sseEmitter } from "./sse";

const OFFICE_START_HOUR = parseInt(process.env.OFFICE_START_HOUR || "9", 10);
const OFFICE_END_HOUR = parseInt(process.env.OFFICE_END_HOUR || "17", 10);
const TIMEZONE = process.env.OFFICE_TIMEZONE || "Asia/Dhaka";

function getCurrentHour(): number {
  const now = new Date();
  // Convert to local office timezone
  const localStr = now.toLocaleString("en-US", { timeZone: TIMEZONE, hour12: false });
  const hour = parseInt(localStr.split(", ")[1].split(":")[0], 10);
  return hour;
}

function isAfterHours(): boolean {
  const hour = getCurrentHour();
  return hour < OFFICE_START_HOUR || hour >= OFFICE_END_HOUR;
}

export async function checkAndCreateAlerts(): Promise<void> {
  try {
    // 1. After-hours alert: devices ON outside office hours
    if (isAfterHours()) {
      const onDevices = await prisma.device.findMany({
        where: { status: true },
        include: { room: true },
      });

      for (const device of onDevices) {
        // Check if an unresolved after_hours alert already exists for this device
        const existing = await prisma.alert.findFirst({
          where: {
            type: "after_hours",
            deviceId: device.id,
            resolvedAt: null,
          },
        });

        if (!existing) {
          const alert = await prisma.alert.create({
            data: {
              type: "after_hours",
              message: `${device.name} in ${device.room.name} is ON after office hours (after ${OFFICE_END_HOUR}:00).`,
              roomId: device.roomId,
              deviceId: device.id,
            },
          });
          sseEmitter.emit({
            type: "alert",
            data: { id: alert.id, type: alert.type, message: alert.message, roomId: alert.roomId, createdAt: alert.createdAt },
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // 2. All devices ON in a room for more than 2 hours
    const rooms = await prisma.room.findMany({ include: { devices: true } });
    for (const room of rooms) {
      const allOn = room.devices.every((d) => d.status);
      if (!allOn) continue;

      // Check if all devices have been ON for >2 hours
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const allOnFor2Hours = room.devices.every(
        (d) => d.status && d.lastChangedAt < twoHoursAgo
      );

      if (allOnFor2Hours) {
        const existing = await prisma.alert.findFirst({
          where: {
            type: "all_on_2hr",
            roomId: room.id,
            resolvedAt: null,
          },
        });

        if (!existing) {
          const alert = await prisma.alert.create({
            data: {
              type: "all_on_2hr",
              message: `All devices in ${room.name} have been ON for more than 2 hours continuously.`,
              roomId: room.id,
            },
          });
          sseEmitter.emit({
            type: "alert",
            data: { id: alert.id, type: alert.type, message: alert.message, roomId: alert.roomId, createdAt: alert.createdAt },
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // 3. Resolve alerts that are no longer applicable
    await resolveAlerts();
  } catch (error) {
    console.error("Alert check error:", error);
  }
}

async function resolveAlerts(): Promise<void> {
  // Resolve after_hours alerts for devices that are now OFF or within office hours
  const afterHoursAlerts = await prisma.alert.findMany({
    where: { type: "after_hours", resolvedAt: null },
    include: { room: { include: { devices: true } } },
  });

  for (const alert of afterHoursAlerts) {
    if (!alert.deviceId) continue;
    const device = await prisma.device.findUnique({ where: { id: alert.deviceId } });
    if (!device || !device.status || !isAfterHours()) {
      await prisma.alert.update({
        where: { id: alert.id },
        data: { resolvedAt: new Date() },
      });
    }
  }

  // Resolve all_on_2hr alerts where not all devices are ON anymore
  const allOnAlerts = await prisma.alert.findMany({
    where: { type: "all_on_2hr", resolvedAt: null },
    include: { room: { include: { devices: true } } },
  });

  for (const alert of allOnAlerts) {
    if (!alert.room) continue;
    const allOn = alert.room.devices.every((d) => d.status);
    if (!allOn) {
      await prisma.alert.update({
        where: { id: alert.id },
        data: { resolvedAt: new Date() },
      });
    }
  }
}

export async function getActiveAlerts() {
  return prisma.alert.findMany({
    where: { resolvedAt: null },
    include: { room: true },
    orderBy: { createdAt: "desc" },
  });
}
