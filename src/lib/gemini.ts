import OpenAI from "openai";

const groqKey = process.env.GROQ_API_KEY || "";
const geminiKey = process.env.GEMINI_API_KEY || "";

let groqClient: OpenAI | null = null;

function getGroqClient(): OpenAI | null {
  if (!groqKey) return null;
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: groqKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return groqClient;
}

const SYSTEM_PROMPT = `You are a friendly, conversational office assistant bot.
Given raw device data about an office's lights and fans, respond in a warm, human, and concise way.
The boss hates robotic data dumps — be natural, like a helpful colleague giving a quick update.
Keep responses under 3 sentences unless asked for detail. Use emojis sparingly.
Format device counts naturally (e.g., "2 fans and 1 light are on" not "Fan1: ON, Fan2: ON, Light1: ON").`;

export async function generateResponse(prompt: string): Promise<string> {
  // Try Groq first (free, fast)
  const groq = getGroqClient();
  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });
      const text = completion.choices[0]?.message?.content;
      if (text) return text;
    } catch (error) {
      console.error("[Groq] Error:", error);
    }
  }

  // Fallback to local response
  return localFallback(prompt);
}

function localFallback(prompt: string): string {
  try {
    const data = JSON.parse(prompt.split("\n").find((l) => l.trim().startsWith("[")) || prompt.split("\n").find((l) => l.trim().startsWith("{")) || "{}");

    // Status command: array of rooms
    if (Array.isArray(data)) {
      const parts = data.map((r: any) => {
        const fanStr = `${r.fansOn} fan${r.fansOn !== 1 ? "s" : ""} ON`;
        const lightStr = `${r.lightsOn} light${r.lightsOn !== 1 ? "s" : ""} ON`;
        if (r.fansOn === 0 && r.lightsOn === 0) return `${r.room}: everything's off`;
        return `${r.room}: ${fanStr}, ${lightStr}`;
      });
      return `Here's the office rundown: ${parts.join(". ")}. That's the current state! 👀`;
    }

    // Room command: array of devices
    if (Array.isArray(data) && data.length > 0 && data[0].name && data[0].status) {
      const on = data.filter((d: any) => d.status === "ON");
      const off = data.filter((d: any) => d.status === "OFF");
      if (on.length === 0) return `Looks like everything in this room is currently off. Nice and quiet! 🌙`;
      const onList = on.map((d: any) => d.name).join(", ");
      const watts = on.reduce((sum: number, d: any) => sum + d.powerDraw, 0);
      return `In this room, ${onList} ${on.length === 1 ? "is" : "are"} currently running, drawing about ${watts}W. ${off.length > 0 ? `The rest (${off.length}) are off.` : ""} 💡`;
    }

    // Room command: single room with devices array
    if (data.devices) {
      const on = data.devices.filter((d: any) => d.status === "ON");
      const off = data.devices.filter((d: any) => d.status === "OFF");
      if (on.length === 0) return `Looks like everything in this room is currently off. Nice and quiet! 🌙`;
      const onList = on.map((d: any) => d.name).join(", ");
      const watts = on.reduce((sum: number, d: any) => sum + d.powerDraw, 0);
      return `In this room, ${onList} ${on.length === 1 ? "is" : "are"} currently running, drawing about ${watts}W. ${off.length > 0 ? `The rest (${off.length}) are off.` : ""} 💡`;
    }

    // Usage command
    if (prompt.includes("Total power")) {
      const wattsMatch = prompt.match(/Total power: (\d+)W/);
      const kwhMatch = prompt.match(/estimated usage: ([\d.]+) kWh/);
      const watts = wattsMatch ? wattsMatch[1] : "?";
      const kwh = kwhMatch ? kwhMatch[1] : "?";
      return `Right now the office is drawing ${watts}W. Today's estimated usage so far is about ${kwh} kWh. ⚡`;
    }
  } catch {
    // If parsing fails, return generic
  }

  return "I'm here but having trouble with the AI service right now. The data is flowing though — try again in a moment! 🙏";
}
