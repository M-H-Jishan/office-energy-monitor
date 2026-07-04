import { prisma } from "./prisma";
import { sseEmitter } from "./sse";
import { checkAndCreateAlerts } from "./alerts";

const SIMULATOR_INTERVAL = parseInt(
  process.env.SIMULATOR_INTERVAL_MS || "15000",
  10
);

const globalForSim = globalThis as unknown as {
  simulatorStarted: boolean | undefined;
};

export function startSimulator(): void {
  if (globalForSim.simulatorStarted) return;
  globalForSim.simulatorStarted = true;

  console.log(`[Simulator] Starting with interval ${SIMULATOR_INTERVAL}ms`);

  // Run immediately, then on interval
  runSimulationStep();
  setInterval(runSimulationStep, SIMULATOR_INTERVAL);
}

async function runSimulationStep(): Promise<void> {
  try {
    const devices = await prisma.device.findMany({ include: { room: true } });

    if (devices.length === 0) return;

    // Randomly toggle 1-3 devices per step
    const numToToggle = Math.floor(Math.random() * 3) + 1;
    const toggled: number[] = [];

    for (let i = 0; i < numToToggle; i++) {
      const device = devices[Math.floor(Math.random() * devices.length)];
      if (toggled.includes(device.id)) continue;
      toggled.push(device.id);

      const newStatus = !device.status;
      await prisma.device.update({
        where: { id: device.id },
        data: {
          status: newStatus,
          lastChangedAt: new Date(),
        },
      });

      sseEmitter.emit({
        type: "device_update",
        data: {
          id: device.id,
          name: device.name,
          type: device.type,
          status: newStatus,
          powerDraw: device.powerDraw,
          roomId: device.roomId,
          roomName: device.room.name,
          roomSlug: device.room.slug,
          lastChangedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Log current total usage
    const allDevices = await prisma.device.findMany();
    const totalWatts = allDevices
      .filter((d) => d.status)
      .reduce((sum, d) => sum + d.powerDraw, 0);

    await prisma.usageLog.create({
      data: { totalWatts },
    });

    // Emit usage update
    const rooms = await prisma.room.findMany({
      include: { devices: true },
    });
    const roomBreakdown = rooms.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      watts: r.devices
        .filter((d) => d.status)
        .reduce((sum, d) => sum + d.powerDraw, 0),
    }));

    sseEmitter.emit({
      type: "usage",
      data: { totalWatts, rooms: roomBreakdown },
      timestamp: new Date().toISOString(),
    });

    // Check alerts
    await checkAndCreateAlerts();

    console.log(
      `[Simulator] Toggled ${toggled.length} devices. Total power: ${totalWatts}W`
    );
  } catch (error) {
    console.error("[Simulator] Error:", error);
  }
}
