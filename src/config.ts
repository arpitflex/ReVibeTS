import { PlayerOptions } from "discord-player-plus";
import "dotenv/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "url";
import { customSpotifyEngine } from "./engines/CustomSpotify";

export const config = {
  app: {
    clientToken: process.env.CLIENT_TOKEN ?? "",
  },
  player: {
    customEngines: {
      spotify: customSpotifyEngine,
    },
    initialVolume: 20,
    fileRoot: resolve(dirname(fileURLToPath(import.meta.url)), "../public"),
  } satisfies PlayerOptions,
};
