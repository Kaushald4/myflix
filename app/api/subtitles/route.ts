import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imdbid = searchParams.get("imdbid")?.replace("tt", ""); // Remove "tt" prefix if present
  const type = searchParams.get("type"); // "movie" or "series"
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");
  const language = searchParams.get("language") || "eng";

  if (!imdbid || !type) {
    return NextResponse.json(
      { error: "Missing required parameters: imdbid and type" },
      { status: 400 }
    );
  }

  if (type === "series" && (!season || !episode)) {
    return NextResponse.json(
      { error: "Missing required parameters for series: season and episode" },
      { status: 400 }
    );
  }

  try {
    let url: string;

    if (type === "series") {
      url = `https://rest.opensubtitles.org/search/episode-${episode}/imdbid-${imdbid}/season-${season}/sublanguageid-${language}`;
    } else {
      url = `https://rest.opensubtitles.org/search/imdbid-${imdbid}/sublanguageid-${language}`;
    }
    const response = await fetch(url, {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=urf-8",
        host: "rest.opensubtitles.org",
        origin: "https://cloudnestra.com",
        referer: "https://cloudnestra.com/",
        "User-Agent": `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36`,
        "X-User-Agent": "trailers.to-UA",
      },
    });

    if (!response.ok) {
      throw new Error(`OpenSubtitles API error: ${response.statusText}`);
    }

    const data: SubtitleResult[] = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ subtitles: [] });
    }

    // Find the subtitle with the highest score
    const bestMatch = data.reduce((best, current) => {
      return current.Score > best.Score ? current : best;
    }, data[0]);

    return NextResponse.json({
      subtitleUrl: bestMatch.SubDownloadLink.replace("gz", "srt"),
      format: bestMatch.SubFormat,
      language: bestMatch.LanguageName,
      fileName: bestMatch.SubFileName,
    });
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    return NextResponse.json(
      { error: "Failed to fetch subtitles" },
      { status: 500 }
    );
  }
}
