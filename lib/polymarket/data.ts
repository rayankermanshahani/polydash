import { z } from "zod";

export const DATA_BASE_URL = "https://data-api.polymarket.com";

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

const buildUrl = (path: string, params?: Record<string, QueryValue>) => {
  const url = new URL(path, DATA_BASE_URL);

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

const dataFetch = async (
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
    throw new Error(`Data API error ${response.status}: ${message}`);
  }

  return (await response.json()) as unknown;
};

const DataApiHealthSchema = z
  .object({
    data: z.string(),
  })
  .catchall(z.any());

export interface DataApiHealthResponse {
  data: string;
}

export const getHealth = async (
  init?: RequestInit
): Promise<DataApiHealthResponse> => {
  const data = await dataFetch("/", undefined, init);
  return DataApiHealthSchema.parse(data) as DataApiHealthResponse;
};
