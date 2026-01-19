export const CLOB_BASE_URL = "https://clob.polymarket.com";

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

const buildUrl = (path: string, params?: Record<string, QueryValue>) => {
  const url = new URL(path, CLOB_BASE_URL);

  if (!params) {
    return url.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry === null || entry === undefined) {
          return;
        }
        url.searchParams.append(key, String(entry));
      });
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

const clobFetch = async <T>(
  path: string,
  params?: Record<string, QueryValue>,
  init?: RequestInit
): Promise<T> => {
  const url = buildUrl(path, params);
  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const message = text ? text.slice(0, 200) : response.statusText;
    throw new Error(`CLOB API error ${response.status}: ${message}`);
  }

  return (await response.json()) as T;
};

export type ClobSide = "BUY" | "SELL" | "buy" | "sell";

export interface ClobPriceResponse {
  price: string;
}

export interface ClobMidpointResponse {
  mid: string;
}

export interface ClobBookEntry {
  price: string;
  size: string;
}

export interface ClobOrderBookResponse {
  market?: string | null;
  asset_id?: string | null;
  bids: ClobBookEntry[];
  asks: ClobBookEntry[];
  [key: string]: unknown;
}

export interface ClobPriceHistoryPoint {
  t: number;
  p: number;
}

export interface ClobPriceHistoryResponse {
  history: ClobPriceHistoryPoint[];
}

export type ClobHistoryInterval = "1m" | "1h" | "6h" | "1d" | "1w" | "max";

export interface ClobPriceHistoryQuery {
  market: string;
  startTs?: number;
  endTs?: number;
  interval?: ClobHistoryInterval;
  fidelity?: number;
}

export const getPrice = (
  tokenId: string,
  side: ClobSide,
  init?: RequestInit
): Promise<ClobPriceResponse> =>
  clobFetch<ClobPriceResponse>(
    "/price",
    {
      token_id: tokenId,
      side: side.toUpperCase(),
    },
    init
  );

export const getMidpoint = (
  tokenId: string,
  init?: RequestInit
): Promise<ClobMidpointResponse> =>
  clobFetch<ClobMidpointResponse>("/midpoint", { token_id: tokenId }, init);

export const getOrderBook = (
  tokenId: string,
  init?: RequestInit
): Promise<ClobOrderBookResponse> =>
  clobFetch<ClobOrderBookResponse>("/book", { token_id: tokenId }, init);

export const getPriceHistory = (
  params: ClobPriceHistoryQuery,
  init?: RequestInit
): Promise<ClobPriceHistoryResponse> =>
  clobFetch<ClobPriceHistoryResponse>("/prices-history", params, init);
