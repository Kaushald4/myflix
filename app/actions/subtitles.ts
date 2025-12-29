import axios from "axios";

export interface SubtitleResult {
  MatchedBy: string;
  IDSubMovieFile: string;
  MovieHash: string;
  MovieByteSize: string;
  MovieTimeMS: string;
  IDSubtitleFile: string;
  SubFileName: string;
  SubActualCD: string;
  SubSize: string;
  SubHash: string;
  SubLastTS: string;
  SubTSGroup?: string;
  InfoReleaseGroup?: string;
  InfoFormat?: string;
  InfoOther?: string;
  IDSubtitle: string;
  UserID: string;
  SubLanguageID: string;
  SubFormat: string;
  SubSumCD: string;
  SubAuthorComment: string;
  SubAddDate: string;
  SubBad: string;
  SubRating: string;
  SubSumVotes: string;
  SubDownloadsCnt: string;
  MovieReleaseName: string;
  MovieFPS: string;
  IDMovie: string;
  IDMovieImdb: string;
  MovieName: string;
  MovieNameEng: string | null;
  MovieYear: string;
  MovieImdbRating: string;
  SubFeatured: string;
  UserNickName?: string;
  SubTranslator: string;
  ISO639: string;
  LanguageName: string;
  SubComments: string;
  SubHearingImpaired: string;
  UserRank?: string;
  SeriesSeason: string;
  SeriesEpisode: string;
  MovieKind: string;
  SubHD: string;
  SeriesIMDBParent: string;
  SubEncoding: string;
  SubAutoTranslation: string;
  SubForeignPartsOnly: string;
  SubFromTrusted: string;
  QueryCached: number;
  SubTSGroupHash?: string;
  SubDownloadLink: string;
  ZipDownloadLink: string;
  SubtitlesLink: string;
  QueryNumber: string;
  QueryParameters: QueryParameters;
  Score: number;
}

export interface QueryParameters {
  episode: number;
  season: number;
  imdbid: string;
  sublanguageid: string;
}

export interface SubtitleResponse {
  subtitleUrl: string | null;
  format: string | null;
  language: string | null;
  fileName: string | null;
}

export async function fetchSubtitles(
  imdbid: string,
  type: "movie" | "series",
  season?: number,
  episode?: number,
  language: string = "eng"
): Promise<SubtitleResponse> {
  if (!imdbid || !type) {
    return { subtitleUrl: null, format: null, language: null, fileName: null };
  }

  if (type === "series" && (!season || !episode)) {
    return { subtitleUrl: null, format: null, language: null, fileName: null };
  }

  try {
    let url: string;

    if (type === "series") {
      url = `https://rest.opensubtitles.org/search/episode-${episode}/imdbid-${imdbid}/season-${season}/sublanguageid-${language}`;
    } else {
      url = `https://rest.opensubtitles.org/search/imdbid-${imdbid}/sublanguageid-${language}`;
    }

    const response = await axios.get<SubtitleResult[]>(url);

    if (!response.data || response.data.length === 0) {
      return {
        subtitleUrl: null,
        format: null,
        language: null,
        fileName: null,
      };
    }

    // Find the subtitle with the highest score
    const bestMatch = response.data.reduce((best, current) => {
      return current.Score > best.Score ? current : best;
    }, response.data[0]);

    return {
      subtitleUrl: bestMatch.SubDownloadLink.replace("gz", bestMatch.SubFormat),
      format: bestMatch.SubFormat,
      language: bestMatch.LanguageName,
      fileName: bestMatch.SubFileName,
    };
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    return { subtitleUrl: null, format: null, language: null, fileName: null };
  }
}
