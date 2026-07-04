import { Client, GatewayIntentBits, Partials } from "discord.js";
import { handleStatus } from "./commands/status";
import { handleRoom } from "./commands/room";
import { handleUsage } from "./commands/usage";
import { startAlertMonitor } from "./alerts";

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error("DISCORD_BOT_TOKEN is not set. Bot cannot start.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once("ready", (c) => {
  console.log(`[Bot] Logged in as ${c.user.tag}`);
  startAlertMonitor(client);
});

client.on("messageCreate", async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  const content = message.content.trim();

  // !status
  if (content.toLowerCase() === "!status") {
    await handleStatus(message);
    return;
  }

  // !room <name>
  if (content.toLowerCase().startsWith("!room ")) {
    const roomName = content.slice(6).trim();
    await handleRoom(message, roomName);
    return;
  }

  // !usage
  if (content.toLowerCase() === "!usage") {
    await handleUsage(message);
    return;
  }

  // !help
  if (content.toLowerCase() === "!help") {
    await message.reply(
      "Here are the commands I know:\n" +
        "• `!status` — Get a summary of all rooms\n" +
        "• `!room <name>` — Check a specific room (e.g. `!room work1`)\n" +
        "• `!usage` — See current power consumption\n" +
        "• `!help` — Show this help message"
    );
    return;
  }
});

client.login(token);
