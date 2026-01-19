import { listMarkets } from "@/lib/polymarket/gamma";
import type { GammaMarketsQuery } from "@/lib/polymarket/gamma";

const parseSearchParams = (searchParams: URLSearchParams) => {
  const params: Record<string, string | string[]> = {};

  for (const key of new Set(Array.from(searchParams.keys()))) {
    const values = searchParams.getAll(key).filter((value) => value.length > 0);
    if (values.length === 0) {
      continue;
    }
    params[key] = values.length > 1 ? values : values[0];
  }

  return params as GammaMarketsQuery;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = parseSearchParams(searchParams);
    const data = await listMarkets(params, { cache: "no-store" });
    return Response.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 502 });
  }
}
