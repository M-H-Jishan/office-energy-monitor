import type { Message } from "discord.js";
import { prisma } from "@/lib/prisma";
import { generateResponse } from "@/lib/gemini";

export async function handleRoom(message: Message, roomName: string): Promise<void> {
  try {
    if ('sendTyping' in message.channel) await message.channel.sendTyping();

    // Match room by slug or name (case-insensitive)
    const slug = roomName.toLowerCase().replace(/\s+/g, "");
    const lowerName = roomName.toLowerCase();
    const room = await prisma.room.findFirst({
      where: {
        OR: [
          { slug: { equals: slug } },
          { slug: { equals: lowerName } },
          { name: { equals: roomName } },
        ],
      },
      include: { devices: true },
    });

    if (!room) {
      await message.reply(
        `I couldn't find a room called "${roomName}". Try one of these: Drawing Room, Work Room 1, Work Room 2 (or use: drawing, work1, work2).`
      );
      return;
    }

    const devices = room.devices.map((d) => ({
      name: d.name,
      type: d.type,
      status: d.status ? "ON" : "OFF",
      powerDraw: d.powerDraw,
      lastChanged: d.lastChangedAt.toISOString(),
    }));

    const prompt = `Here is the current status of ${room.name}. Give a friendly, conversational summary of what's on and off in this room:\n\n${JSON.stringify(devices, null, 2)}`;

    const response = await generateResponse(prompt);
    await message.reply(response);
  } catch (error) {
    console.error("[Bot] !room error:", error);
    await message.reply("Sorry, I couldn't check that room right now. 😅");
  }
}
