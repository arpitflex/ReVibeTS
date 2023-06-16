# ReVibeTS

Ensure that on trying to run this bot, a `.env` file is populated with the Discord Bot's token set as `CLIENT_TOKEN`.

For example:
```
# discord bot credentials, get it from discord developer portal:
# https://discord.com/developers/applications
CLIENT_TOKEN=NzkyNzE1NDU0MTk2MDg4ODQy.X-hvzA.Ovy4MCQywSkoMRRclStW4xAYK7I
```

## Spotify

Spotify authorization is done through `.data` folder. That folder contains the `spotify.data` file used to store the
Spotify credentials. This folder is not tracked by git, so you will have to create it yourself. Use these
[instructions](https://github.com/play-dl/play-dl/tree/main/instructions) to generate the credentials.

---

This project makes use of [discord-player-plus](https://discordplayerplus.lars-rickert.de/) by Lars Ricket. The original code is licensed under the MIT license.