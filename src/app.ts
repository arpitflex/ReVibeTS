import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import {
  Command,
  createClearCommand,
  createHelpCommand,
  createInsertCommand,
  createJumpCommand,
  createPauseCommand,
  createPlayCommand,
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
  PlayerManager,
  trackToMarkdown,
  Translations,
  urlToMarkdown,
} from "discord-player-plus";
import { config } from "./config";
import { playTracks } from "discord-player-plus/lib/commands";

// Discord client for the Music Bot
const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const customTranslations: Translations = en;

customTranslations.play.description = "Plays a song/playlist.";
customTranslations.stop.success = ":wave: | Hou doe!";

export const playerManager = new PlayerManager({
  playerDefault: config.player,
  translations: customTranslations,
});

const myPlayCommand: Command = createPlayCommand(playerManager);

myPlayCommand.run = async function run(interaction) {
  const searchResult = await playTracks(interaction, playerManager, false);
  if (!searchResult) return false;

  if (searchResult.playlist) {
    await interaction.followUp({
      content: playerManager.translations.play.successPlaylist.replace(
        "{playlist}",
        urlToMarkdown(searchResult.playlist.title, searchResult.playlist.url)
      ),
    });
    return true;
  }

  await interaction.followUp({
    content: playerManager.translations.play.successTrack.replace(
      "{track}",
      trackToMarkdown(searchResult.tracks[0])
    ),
  });
  return true;
};

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
