import type { GammaMarket } from "@/lib/polymarket/gamma";

export type MarketStatusBadge = {
  label: string;
  variant: "default" | "secondary" | "outline";
};

export const toNumber = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const getMarketDisplayName = (market: GammaMarket) =>
  market.question ?? market.slug ?? "Untitled market";

export const getMarketCategory = (market: GammaMarket) => {
  if (market.category) {
    return market.category;
  }
  const categoryFallback = market.categories?.[0];
  if (categoryFallback?.label) {
    return categoryFallback.label;
  }
  // Also check tags as categories (Polymarket often uses tags for categorization)
  const tagFallback = market.tags?.[0];
  if (tagFallback?.label) {
    return tagFallback.label;
  }
  // Check event category if market has events
  const eventCategory = market.events?.[0]?.category;
  if (eventCategory) {
    return eventCategory;
  }
  return null;
};

export const getMarketVolume = (market: GammaMarket) =>
  market.volumeNum ?? toNumber(market.volume);

export const getMarketLiquidity = (market: GammaMarket) =>
  market.liquidityNum ?? null;

export const getMarketEndDateTimestamp = (market: GammaMarket) => {
  if (market.endDateIso) {
    return Date.parse(market.endDateIso);
  }
  if (market.endDate) {
    return Date.parse(market.endDate);
  }
  return null;
};

export const getMarketStatusBadge = (market: GammaMarket): MarketStatusBadge => {
  if (market.closed) {
    return { label: "Resolved", variant: "secondary" };
  }
  if (market.active) {
    return { label: "Active", variant: "default" };
  }
  return { label: "Inactive", variant: "outline" };
};
