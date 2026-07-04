import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: { devices: true },
      orderBy: { id: "asc" },
    });

    const roomBreakdown = rooms.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      watts: r.devices
        .filter((d) => d.status)
        .reduce((sum, d) => sum + d.powerDraw, 0),
    }));

    const totalWatts = roomBreakdown.reduce((sum, r) => sum + r.watts, 0);

    // Calculate daily kWh from usage logs
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const usageLogs = await prisma.usageLog.findMany({
      where: { timestamp: { gte: todayStart } },
      orderBy: { timestamp: "asc" },
    });

    let dailyKwh = 0;
    if (usageLogs.length > 0) {
      // Average wattage * hours elapsed / 1000
      const avgWatts =
        usageLogs.reduce((sum, log) => sum + log.totalWatts, 0) / usageLogs.length;
      const hoursElapsed = (Date.now() - todayStart.getTime()) / (1000 * 60 * 60);
      dailyKwh = (avgWatts * hoursElapsed) / 1000;
    }

    return NextResponse.json({
      totalWatts,
      rooms: roomBreakdown,
      dailyKwh,
    });
  } catch (error) {
    console.error("GET /api/usage error:", error);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
