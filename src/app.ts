import {ActivityType, ApplicationCommandOptionType, Client, GatewayIntentBits,} from "discord.js";
import {
    Command,
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
    en,
    handleSlashCommand,
    PlayerManager,
    Track,
    trackToMarkdown,
    Translations,
    urlToMarkdown,
} from "discord-player-plus";
import {config} from "./config";
import {playTracks} from "discord-player-plus/lib/commands";

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

const myRemoveCommand: Command = {
    name: "remove",
    description: "Removes a song from the queue.",
    options: [
        {
            name: "track_number",
            description: "Track number of song to remove.",
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],
    run: async (interaction) => {
        const player = playerManager.find(interaction.guildId);

        if (!player) {
            await interaction.reply({
                content: ":robot: I am currently not in the channel.",
                ephemeral: true,
            });
            return false;
        }

        const queue: Track[] = player.getQueue();
        const trackNumber: number = interaction.options.getInteger(
            "track_number",
            true
        );
        const removed: Track | undefined = player.remove(trackNumber - 1);

        if (!removed) {
            await interaction.reply({
                content: `Track **${trackNumber}** is not in queue of currently **${queue.length}** tracks`,
                ephemeral: true,
            });
            return false;
        }

        await interaction.reply({
            content: `:wastebasket: | Removed **${removed.title}** from queue`,
        });
        return true;
    },
};

const myJumpCommand: Command = {
    name: "jump",
    description: "Jumps to a track in the queue.",
    options: [
        {
            name: "track_number",
            description: "Track number of song to jump to.",
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],
    run: async (interaction) => {
        const player = playerManager.find(interaction.guildId);

        if (!player) {
            await interaction.reply({
                content: ":robot: I am currently not in the channel.",
                ephemeral: true,
            });
            return false;
        }

        const channel = player.getVoiceChannel();

        if (!channel) {
            await interaction.reply({
                content: ":robot: I am currently not in the voice channel.",
                ephemeral: true,
            });
            return false;
        }

        const queue: Track[] = player.getQueue();
        const trackNumber: number = interaction.options.getInteger(
            "track_number",
            true
        );

        if (trackNumber <= 0 || trackNumber > queue.length) {
            await interaction.reply({
                content: `Track **${trackNumber}** is not in queue of currently **${queue.length}** tracks`,
            });
            return false;
        }

        player.clear();
        await player.play({
            tracks: queue.slice(trackNumber - 1),
            channel: channel,
        });

        await interaction.reply({
            content: `:arrow_right_hook: | Jumped to track **${trackNumber}** in queue`,
        });
        return true;
    },
};

const myInsertCommand: Command = {
    name: "insert",
    description: "Add track to a specific place in the queue",
    options: [
        {
            name: "query",
            description: playerManager.translations.play.optionDescription,
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "location_number",
            description: "Location number to insert the song into.",
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ],
    run: async (interaction) => {
        const player = playerManager.find(interaction.guildId);

        if (!player) {
            await interaction.reply({
                content: ":robot: I am currently not in the channel.",
                ephemeral: true,
            });
            return false;
        }

        const channel = player.getVoiceChannel();

        if (!channel) {
            await interaction.reply({
                content: ":robot: I am currently not in the voice channel.",
                ephemeral: true,
            });
            return false;
        }

        const query = interaction.options.getString("query", true);
        const searchResult = await player.search(query);
        const firstResult = searchResult[0];

        if (!firstResult || !firstResult.tracks.length) {
            await interaction.reply({
                content: playerManager.translations.play.noTracksFound.replace(
                    "{query}",
                    query
                ),
            });
            return false;
        }

        const track = firstResult.tracks[0];
        const index = interaction.options.getInteger("location_number", true) - 1;
        player.insert(track, index);

        let readableIndex = index + 1;
        if (index < 0) {
            readableIndex = 1;
        }
        const queueLength = player.getQueue().length;
        if (index > queueLength) {
            readableIndex = queueLength;
        }

        await interaction.reply({
            content: playerManager.translations.add.successTrack
                .replace(
                    ".",
                    ` at position ${readableIndex}.`
                )
                .replace(
                    "{track}",
                    trackToMarkdown(track, true)
                )
        });
        return true;
    }
}

// All slash commands for the bot
const slashCommands: Command[] = [
    createClearCommand(playerManager),
    createPauseCommand(playerManager),
    createQueueCommand(playerManager, {ephemeral: true}),
    createResumeCommand(playerManager),
    createShuffleCommand(playerManager),
    createSkipCommand(playerManager),
    createSongCommand(playerManager, {ephemeral: true}),
    createStopCommand(playerManager),
    createRepeatCommand(playerManager),
    createSeekCommand(playerManager),
    myPlayCommand,
    myRemoveCommand,
    myJumpCommand,
    myInsertCommand
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
