import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        devices: {
          orderBy: [{ type: "asc" }, { name: "asc" }],
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(
      rooms.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        devices: r.devices.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          status: d.status,
          powerDraw: d.powerDraw,
          lastChangedAt: d.lastChangedAt.toISOString(),
          roomId: d.roomId,
          room: { id: r.id, name: r.name, slug: r.slug },
        })),
      }))
    );
  } catch (error) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}
