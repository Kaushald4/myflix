import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchContent,
  fetchMetaDetails,
  searchContent,
  ContentType,
  FetchContentParams,
} from "@/lib/api";

export const useInfiniteContent = (type: ContentType, genre?: string) => {
  return useInfiniteQuery({
    queryKey: ["content", type, genre],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchContent({ type, skip: pageParam, genre });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0
        ? allPages.flatMap((p) => p).length
        : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useContentDetails = (type: string, id: string) => {
  return useQuery({
    queryKey: ["details", type, id],
    queryFn: () => fetchMetaDetails(type, id),
    enabled: !!type && !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useSearchContent = (query: string, type: ContentType) => {
  return useQuery({
    queryKey: ["search", type, query],
    queryFn: () => searchContent(query, type),
    enabled: !!query,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
