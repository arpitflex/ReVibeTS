import {
  PlayerEngine,
  PlayerOptions,
  Playlist,
  SearchOptions,
  SearchResult,
  Track,
  TrackStream,
} from "discord-player-plus";
import play, {
  Spotify,
  SpotifyAlbum,
  SpotifyPlaylist,
  SpotifyTrack,
} from "play-dl";

const responsibleRegex = /^https?:\/\/open.spotify.com\//;

export const customSpotifyEngine: PlayerEngine = {
  source: "spotify",
  isResponsible(query) {
    return responsibleRegex.test(query);
  },
  async search(
    query: string,
    playerOptions: PlayerOptions,
    searchOptions: SearchOptions
  ): Promise<SearchResult | null> {
    if (play.is_expired()) {
      await play.refreshToken(); // This will check if access token has expired or not. If yes, then refresh the token.
    }
    const spData: Spotify = await play.spotify(query);
    if (spData.type === "track") {
      return {
        tracks: [mapSpotifyTrack(spData as SpotifyTrack)],
        source: this.source,
      };
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
      return {
        tracks: tracks.map((t) => mapSpotifyTrack(t, playlist)),
        playlist: playlist,
        source: this.source,
      };
    }
  },
  async getStream(
    track: Track,
    playerOptions: PlayerOptions
  ): Promise<TrackStream | null> {
    const search = await play.search(
      track.artist ? `${track.title} ${track.artist}` : track.title,
      { limit: 1 }
    );

    if (search.length === 0) return null;

    return await play.stream(search[0].url, {
      quality:
        playerOptions.quality === "low"
          ? 0
          : playerOptions.quality === "medium"
            ? 1
            : 2,
      seek: track?.seek ? track.seek / 1000 : undefined,
    });
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
