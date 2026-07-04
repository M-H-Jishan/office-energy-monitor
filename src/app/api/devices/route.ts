import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      include: { room: true },
      orderBy: [{ roomId: "asc" }, { type: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(
      devices.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        status: d.status,
        powerDraw: d.powerDraw,
        lastChangedAt: d.lastChangedAt.toISOString(),
        roomId: d.roomId,
        room: {
          id: d.room.id,
          name: d.room.name,
          slug: d.room.slug,
        },
      }))
    );
  } catch (error) {
    console.error("GET /api/devices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 }
    );
  }
}
