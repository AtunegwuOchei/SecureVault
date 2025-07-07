// client/lib/queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Optional base URL (e.g., from environment variables)
  // This should now be undefined or "" if VITE_API_BASE_URL is removed from .env
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

  // DEBUGGING LOGS: Verify what baseUrl resolves to
  console.log("DEBUG: VITE_API_BASE_URL raw:", import.meta.env.VITE_API_BASE_URL);
  console.log("DEBUG: Resolved baseUrl for apiRequest:", baseUrl);

  // If baseUrl is empty, fullUrl will be a relative path (e.g., /api/passwords)
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  console.log("📡 API Request →", {
    method,
    url: fullUrl,
    payload: data,
  });

  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error("❌ API Error Response →", {
      status: res.status,
      body: text,
    });
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // This part also needs to respect the baseUrl logic
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const fullUrl = (queryKey[0] as string).startsWith("http") ? (queryKey[0] as string) : `${baseUrl}${queryKey[0]}`;

    // DEBUGGING LOGS: Verify what baseUrl resolves to for getQueryFn
    console.log("DEBUG: VITE_API_BASE_URL raw (getQueryFn):", import.meta.env.VITE_API_BASE_URL);
    console.log("DEBUG: Resolved baseUrl for getQueryFn:", baseUrl);
    console.log("DEBUG: Full URL for getQueryFn:", fullUrl);


    const res = await fetch(fullUrl, { // Use fullUrl here
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});