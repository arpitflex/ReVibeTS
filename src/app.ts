import {ActivityType, Client, GatewayIntentBits} from "discord.js";
import {
    Command,
    createAddCommand,
    createClearCommand,
    createHelpCommand,
    createPauseCommand,
    createPlayCommand,
    createQueueCommand,
    createRepeatCommand,
    createResumeCommand,
    createSeekCommand,
    createShuffleCommand,
    createSkipCommand,
    createSongCommand,
    createStopCommand,
    handleSlashCommand,
    PlayerManager,
} from "discord-player-plus";
import {config} from "./config";

// Discord client for the Music Bot
const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

export const playerManager = new PlayerManager({
    playerDefault: config.player,
});

// All slash commands for the bot
const slashCommands: Command[] = [
    createAddCommand(playerManager),
    createClearCommand(playerManager),
    createPauseCommand(playerManager),
    createPlayCommand(playerManager),
    createQueueCommand(playerManager, {ephemeral: true}),
    createResumeCommand(playerManager),
    createShuffleCommand(playerManager),
    createSkipCommand(playerManager),
    createSongCommand(playerManager, {ephemeral: true}),
    createStopCommand(playerManager),
    createRepeatCommand(playerManager),
    createSeekCommand(playerManager),
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
        client.user.setActivity({name: "/help", type: ActivityType.Listening});
    })
    .on("interactionCreate", async (interaction) => {
        await handleSlashCommand(
            interaction,
            slashCommands,
            playerManager.translations
        );
    });

client.login(config.app.clientToken);
