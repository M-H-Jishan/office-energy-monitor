import type { Message } from "discord.js";
import { prisma } from "@/lib/prisma";
import { generateResponse } from "@/lib/gemini";

export async function handleStatus(message: Message): Promise<void> {
  try {
    if ('sendTyping' in message.channel) await message.channel.sendTyping();

    const rooms = await prisma.room.findMany({
      include: { devices: true },
      orderBy: { id: "asc" },
    });

    // Build raw data for LLM
    const rawData = rooms.map((room) => {
      const fansOn = room.devices.filter((d) => d.type === "fan" && d.status).length;
      const fansOff = room.devices.filter((d) => d.type === "fan" && !d.status).length;
      const lightsOn = room.devices.filter((d) => d.type === "light" && d.status).length;
      const lightsOff = room.devices.filter((d) => d.type === "light" && !d.status).length;
      return {
        room: room.name,
        fansOn,
        fansOff,
        lightsOn,
        lightsOff,
      };
    });

    const prompt = `Here is the current office device status. Give a quick, friendly summary of what's on and off across all rooms:\n\n${JSON.stringify(rawData, null, 2)}`;

    const response = await generateResponse(prompt);
    await message.reply(response);
  } catch (error) {
    console.error("[Bot] !status error:", error);
    await message.reply("Sorry, I couldn't fetch the office status right now. 😅");
  }
}
