import {
  Command,
  PlayerManager,
  Translations,
  createAddCommand,
  createClearCommand,
  createHelpCommand,
  createInsertCommand,
  createJumpCommand,
  createPauseCommand,
  createQueueCommand,
  createRemoveCommand,
  createRepeatCommand,
  createResumeCommand,
  createSeekCommand,
  createShuffleCommand,
  createSkipCommand,
  createSongCommand,
  createStopCommand,
  en,
  handleSlashCommand,
} from "discord-player-plus";
import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import { config } from "./config";

// Discord client for the Music Bot
const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const customTranslations: Translations = en;

customTranslations.stop.success = ":wave: | Hou doe!";

export const playerManager = new PlayerManager({
  playerDefault: config.player,
  translations: customTranslations,
});

const myPlayCommand: Command = createAddCommand(playerManager);
myPlayCommand.name = "play";

// All slash commands for the bot
const slashCommands: Command[] = [
  createClearCommand(playerManager),
  createPauseCommand(playerManager),
  createQueueCommand(playerManager, { ephemeral: true }),
  createResumeCommand(playerManager),
  createShuffleCommand(playerManager),
  createSkipCommand(playerManager),
  createSongCommand(playerManager, { ephemeral: true }),
  createStopCommand(playerManager),
  createRepeatCommand(playerManager),
  createSeekCommand(playerManager),
  createInsertCommand(playerManager),
  createJumpCommand(playerManager),
  createRemoveCommand(playerManager),
  myPlayCommand,
];

slashCommands.push(
  createHelpCommand(playerManager, {
    commands: slashCommands,
    title: "ReVibe",
    author: {
      name: "Arpit Agrawal",
    },
    footerText: "Thanks for using ReVibe",
  })
);

client
  .on("ready", async (client) => {
    console.log(`Bot ready and logged in as ${client.user.tag}`);
    await client.application.commands.set(slashCommands);
    client.user.setActivity({ name: "/help", type: ActivityType.Listening });
  })
  .on("interactionCreate", async (interaction) => {
    await handleSlashCommand(
      interaction,
      slashCommands,
      playerManager.translations
    );
  });

client.login(config.app.clientToken);
