import axios from "axios";

export interface Root {
  metas: Meta[];
  hasMore: boolean;
  cacheMaxAge: number;
  staleRevalidate: number;
  staleError: number;
}

export interface Meta {
  imdb_id: string;
  popularities: Popularities;
  name: string;
  year: string;
  runtime: string;
  genre: string[];
  released?: string;
  director?: string[];
  writer?: string[];
  cast: string[];
  imdbRating: string;
  poster: string;
  description: string;
  country: string;
  awards?: string;
  dvdRelease: any;
  type: string;
  tvdb_id: any;
  status: string;
  popularity: number;
  moviedb_id: number;
  background: string;
  logo: string;
  slug: string;
  trailers?: Trailer[];
  id: string;
  videos: Video[];
  genres: string[];
  releaseInfo: string;
  trailerStreams?: TrailerStream[];
  links: Link[];
  behaviorHints: BehaviorHints;
}

export interface Popularities {
  trakt: number;
  moviedb: number;
  stremio: number;
  stremio_lib: number;
  PXS_TEST?: number;
  PXS?: number;
  SCM?: number;
  EXMD?: number;
  ALLIANCE?: number;
  EJD?: number;
}

export interface Trailer {
  source: string;
  type: string;
}

export interface Video {
  name: string;
  season: number;
  number: number;
  firstAired: string;
  tvdb_id: number;
  rating: number;
  overview?: string;
  thumbnail: string;
  id: string;
  released: string;
  episode: number;
  description?: string;
}

export interface TrailerStream {
  title: string;
  ytId: string;
}

export interface Link {
  name: string;
  category: string;
  url: string;
}

export interface BehaviorHints {
  defaultVideoId: any;
  hasScheduledVideos: boolean;
}

export type ContentType = "movie" | "series";

export interface FetchContentParams {
  type: ContentType;
  skip?: number;
  genre?: string;
}

const BASE_URL_MOVIE =
  "https://cinemeta-catalogs.strem.io/top/catalog/movie/top";
const BASE_URL_SERIES =
  "https://cinemeta-catalogs.strem.io/top/catalog/series/top";

export const fetchContent = async ({
  type,
  skip = 0,
  genre,
}: FetchContentParams) => {
  let url = type === "movie" ? BASE_URL_MOVIE : BASE_URL_SERIES;

  if (genre && skip > 0) {
    url += `/skip=${skip}&genre=${genre}.json`;
  } else if (genre) {
    url += `/genre=${genre}.json`;
  } else if (skip > 0) {
    url += `/skip=${skip}.json`;
  } else {
    url += `.json`;
  }

  try {
    const response = await axios.get<Root>(url);
    return response.data.metas;
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return [];
  }
};

export const fetchMovies = async (
  params: Omit<FetchContentParams, "type"> = {}
) => {
  return fetchContent({ ...params, type: "movie" });
};

export const fetchSeries = async (
  params: Omit<FetchContentParams, "type"> = {}
) => {
  return fetchContent({ ...params, type: "series" });
};

const SEARCH_URL_MOVIE = "https://v3-cinemeta.strem.io/catalog/movie/top";
const SEARCH_URL_SERIES = "https://v3-cinemeta.strem.io/catalog/series/top";

export const searchContent = async (
  query: string,
  type: ContentType = "movie"
) => {
  const baseUrl = type === "movie" ? SEARCH_URL_MOVIE : SEARCH_URL_SERIES;
  const url = `${baseUrl}/search=${encodeURIComponent(query)}.json`;
  try {
    const response = await axios.get<Root>(url);
    return response.data.metas;
  } catch (error) {
    console.error(`Error searching ${type}:`, error);
    return [];
  }
};

export const fetchMetaDetails = async (type: string, id: string) => {
  const url = `https://v3-cinemeta.strem.io/meta/${type}/${id}.json`;
  try {
    const response = await axios.get<{ meta: Meta }>(url);
    return response.data.meta;
  } catch (error) {
    console.error(`Error fetching ${type} details:`, error);
    return null;
  }
};

export const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Sport",
  "Thriller",
  "War",
  "Western",
];
