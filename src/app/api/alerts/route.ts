import { NextResponse } from "next/server";
import { getActiveAlerts } from "@/lib/alerts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const alerts = await getActiveAlerts();

    return NextResponse.json(
      alerts.map((a) => ({
        id: a.id,
        type: a.type,
        message: a.message,
        roomId: a.roomId,
        room: a.room ? { name: a.room.name, slug: a.room.slug } : null,
        createdAt: a.createdAt.toISOString(),
        resolvedAt: a.resolvedAt?.toISOString() || null,
      }))
    );
  } catch (error) {
    console.error("GET /api/alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
