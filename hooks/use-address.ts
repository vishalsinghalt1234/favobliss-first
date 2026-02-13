import fetcher from "@/lib/fetcher";
import { useSession } from "next-auth/react";
import { useMemo } from "react"; 
import useSWR from "swr";
import { useEffect } from "react";
export const useAddress = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoadingSession = status === "loading";

  const shouldFetch = isAuthenticated;
const userId = session?.user?.id;
  const swrKey = shouldFetch && userId ? `/api/v1/address?uid=${userId}` : null;
  const {
    data: rawData,
    error,
    isLoading: swrLoading,
    mutate,
  } = useSWR(swrKey, fetcher, {
    revalidateIfStale: false,
    revalidateOnReconnect: true,
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });
  // Extra safety: when user changes / logs out, clear old data immediately
  useEffect(() => {
    if (!shouldFetch) {
      mutate([], { revalidate: false });
    }
  }, [shouldFetch, mutate]);
  const data = useMemo(
    () => (shouldFetch ? rawData || [] : []),
    [rawData, shouldFetch]
  );

  return {
    data, 
    error,
    isLoading: swrLoading || isLoadingSession,
    mutate,
  };
};
