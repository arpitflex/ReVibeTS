import { PlayerEngine, Playlist, Track } from "discord-player-plus";
import play, {
  Spotify,
  SpotifyAlbum,
  SpotifyPlaylist,
  SpotifyTrack,
} from "play-dl";
import { youtubeEngine } from "discord-player-plus/lib/engines/youtube";

const responsibleRegex = /^https?:\/\/open.spotify.com\//;

export const customSpotifyEngine: PlayerEngine = {
  source: "spotify",
  isResponsible(query) {
    return responsibleRegex.test(query);
  },
  async search(query, playerOptions, searchOptions) {
    if (play.is_expired()) {
      await play.refreshToken(); // This will check if access token has expired or not. If yes, then refresh the token.
    }
    const spData: Spotify = await play.spotify(query);
    if (spData.type === "track") {
      return [
        {
          tracks: [mapSpotifyTrack(spData as SpotifyTrack)],
          source: this.source,
        },
      ];
    } else {
      let tracks: SpotifyTrack[] = await (
        spData as SpotifyPlaylist | SpotifyAlbum
      ).all_tracks();
      if (searchOptions?.limit && tracks.length > searchOptions?.limit) {
        tracks = tracks.slice(0, searchOptions.limit);
      }
      const playlist: Playlist = {
        title: (spData as SpotifyPlaylist | SpotifyAlbum).name,
        url: (spData as SpotifyPlaylist | SpotifyAlbum).url,
        thumbnailUrl: (spData as SpotifyPlaylist | SpotifyAlbum).thumbnail.url,
      };
      return [
        {
          tracks: tracks.map((t) => mapSpotifyTrack(t, playlist)),
          playlist: playlist,
          source: this.source,
        },
      ];
    }
  },
  async getStream(track, playerOptions) {
    const searchResults = await youtubeEngine.search(
      track.artist ? `${track.title} ${track.artist}` : track.title,
      playerOptions,
      { limit: 1 }
    );

    if (!searchResults.length || !searchResults[0].tracks.length) return null;
    const mappedTrack = searchResults[0].tracks[0];
    mappedTrack.seek = track.seek;

    return youtubeEngine.getStream(mappedTrack, playerOptions);
  },
};

function mapSpotifyTrack(track: SpotifyTrack, playlist?: Playlist): Track {
  return {
    title: track.name,
    url: track.url,
    duration: track.durationInSec,
    artist: track.artists?.map((a) => a.name).join(", "),
    source: customSpotifyEngine.source,
    playlist: playlist,
  };
}
