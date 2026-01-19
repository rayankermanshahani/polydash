import { z } from "zod";

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

const clobFetch = async (
  path: string,
  params?: Record<string, QueryValue>,
  init?: RequestInit
): Promise<unknown> => {
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

  return (await response.json()) as unknown;
};

const stringFromUnknown = z.union([z.string(), z.number()]).transform((value) =>
  String(value)
);

const ClobPriceSchema = z
  .object({
    price: stringFromUnknown,
  })
  .catchall(z.any());

const ClobMidpointSchema = z
  .object({
    mid: stringFromUnknown,
  })
  .catchall(z.any());

const ClobBookEntrySchema = z
  .object({
    price: stringFromUnknown,
    size: stringFromUnknown,
  })
  .catchall(z.any());

const ClobOrderBookSchema = z
  .object({
    market: stringFromUnknown.nullable().optional(),
    asset_id: stringFromUnknown.nullable().optional(),
    bids: z.array(ClobBookEntrySchema),
    asks: z.array(ClobBookEntrySchema),
  })
  .catchall(z.any());

const ClobPriceHistorySchema = z
  .object({
    history: z.array(
      z
        .object({
          t: z.number(),
          p: z.number(),
        })
        .catchall(z.any())
    ),
  })
  .catchall(z.any());

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
  [key: string]: QueryValue;
  market: string;
  startTs?: number;
  endTs?: number;
  interval?: ClobHistoryInterval;
  fidelity?: number;
}

export const getPrice = async (
  tokenId: string,
  side: ClobSide,
  init?: RequestInit
): Promise<ClobPriceResponse> => {
  const data = await clobFetch(
    "/price",
    {
      token_id: tokenId,
      side: side.toUpperCase(),
    },
    init
  );
  return ClobPriceSchema.parse(data) as ClobPriceResponse;
};

export const getMidpoint = async (
  tokenId: string,
  init?: RequestInit
): Promise<ClobMidpointResponse> => {
  const data = await clobFetch("/midpoint", { token_id: tokenId }, init);
  return ClobMidpointSchema.parse(data) as ClobMidpointResponse;
};

export const getOrderBook = async (
  tokenId: string,
  init?: RequestInit
): Promise<ClobOrderBookResponse> => {
  const data = await clobFetch("/book", { token_id: tokenId }, init);
  return ClobOrderBookSchema.parse(data) as ClobOrderBookResponse;
};

export const getPriceHistory = async (
  params: ClobPriceHistoryQuery,
  init?: RequestInit
): Promise<ClobPriceHistoryResponse> => {
  const data = await clobFetch("/prices-history", params, init);
  return ClobPriceHistorySchema.parse(data) as ClobPriceHistoryResponse;
};
