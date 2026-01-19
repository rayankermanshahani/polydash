"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketCard } from "@/components/markets/MarketCard";
import { MarketTable } from "@/components/markets/MarketTable";
import { useMarketSearch, useMarkets } from "@/hooks/useMarkets";
import type {
  GammaMarket,
  GammaMarketsQuery,
  GammaPublicSearchQuery,
} from "@/lib/polymarket/gamma";
import {
  getMarketCategory,
  getMarketEndDateTimestamp,
  getMarketLiquidity,
  getMarketVolume,
} from "@/lib/markets";

type MarketStatus = "active" | "resolved" | "all";

type SortOption = "volume" | "liquidity" | "ending-soon";
type SortDirection = "desc" | "asc";

const SORT_LABELS: Record<SortOption, string> = {
  volume: "Volume",
  liquidity: "Liquidity",
  "ending-soon": "Ending soon",
};

const SORT_DIRECTION_LABELS: Record<SortDirection, string> = {
  desc: "Descending",
  asc: "Ascending",
};

const DEFAULT_FILTERS = {
  q: "",
  status: "active" as MarketStatus,
  sortBy: "volume" as SortOption,
  sortDirection: "desc" as SortDirection,
  category: "all",
  volumeThreshold: "any",
  dateFrom: "",
  dateTo: "",
};

const SAMPLE_TOP_MARKETS: GammaMarket[] = [
  {
    id: "sample-1",
    conditionId: "sample-condition-1",
    question: "Will the Fed cut rates by Q3 2026?",
    category: "Macro",
    volumeNum: 4200000,
    liquidityNum: 780000,
    endDate: "2026-09-30T00:00:00.000Z",
    active: true,
    closed: false,
  },
  {
    id: "sample-2",
    conditionId: "sample-condition-2",
    question: "Will Bitcoin close above $100k this year?",
    category: "Crypto",
    volumeNum: 3100000,
    liquidityNum: 640000,
    endDate: "2026-12-31T00:00:00.000Z",
    active: true,
    closed: false,
  },
  {
    id: "sample-3",
    conditionId: "sample-condition-3",
    question: "Will a new AI model beat GPT-5 on MMLU?",
    category: "Technology",
    volumeNum: 1550000,
    liquidityNum: 320000,
    endDate: "2026-11-15T00:00:00.000Z",
    active: true,
    closed: false,
  },
];

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightText = (text: string, query: string): ReactNode => {
  if (!query) {
    return text;
  }

  const escaped = escapeRegExp(query);
  const regex = new RegExp(`(${escaped})`, "ig");
  const queryLower = query.toLowerCase();
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === queryLower ? (
      <mark
        key={`${part}-${index}`}
        className="rounded-sm bg-amber-200/60 px-0.5 text-foreground"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
};

const VOLUME_OPTIONS = [
  { label: "Any volume", value: "any" },
  { label: "≥ $10k", value: "10000" },
  { label: "≥ $100k", value: "100000" },
  { label: "≥ $1m", value: "1000000" },
  { label: "≥ $10m", value: "10000000" },
];

const sortMarkets = (
  markets: GammaMarket[],
  sortBy: SortOption,
  direction: SortDirection,
) => {
  const sorted = [...markets];
  const factor = direction === "asc" ? 1 : -1;

  if (sortBy === "volume") {
    sorted.sort(
      (a, b) =>
        ((getMarketVolume(a) ?? 0) - (getMarketVolume(b) ?? 0)) * factor,
    );
  }

  if (sortBy === "liquidity") {
    sorted.sort(
      (a, b) =>
        ((getMarketLiquidity(a) ?? 0) - (getMarketLiquidity(b) ?? 0)) * factor,
    );
  }

  if (sortBy === "ending-soon") {
    sorted.sort(
      (a, b) =>
        ((getMarketEndDateTimestamp(a) ?? 0) -
          (getMarketEndDateTimestamp(b) ?? 0)) *
        factor,
    );
  }

  return sorted;
};

const matchesStatus = (market: GammaMarket, status: MarketStatus) => {
  if (status === "all") {
    return true;
  }
  if (status === "resolved") {
    return market.closed === true;
  }
  // "active" status: must be active AND not closed
  return market.active === true && market.closed !== true;
};

const parseDateInput = (value: string, endOfDay: boolean) => {
  if (!value) {
    return null;
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }
  return date.getTime();
};

const parseFiltersFromParams = (params: URLSearchParams) => {
  const statusParam = params.get("status");
  const sortParam = params.get("sort");
  const directionParam = params.get("dir");
  const categoryParam = params.get("category");
  const volumeParam = params.get("minVolume");
  const fromParam = params.get("from");
  const toParam = params.get("to");

  const status: MarketStatus =
    statusParam === "active" || statusParam === "resolved" || statusParam === "all"
      ? statusParam
      : DEFAULT_FILTERS.status;
  const sortBy: SortOption =
    sortParam === "liquidity" || sortParam === "ending-soon"
      ? sortParam
      : DEFAULT_FILTERS.sortBy;
  const sortDirection: SortDirection =
    directionParam === "asc" ? "asc" : DEFAULT_FILTERS.sortDirection;

  const volumeValue =
    volumeParam && VOLUME_OPTIONS.some((option) => option.value === volumeParam)
      ? volumeParam
      : DEFAULT_FILTERS.volumeThreshold;

  return {
    q: params.get("q") ?? DEFAULT_FILTERS.q,
    status,
    sortBy,
    sortDirection,
    category: categoryParam ?? DEFAULT_FILTERS.category,
    volumeThreshold: volumeValue,
    dateFrom: fromParam ?? DEFAULT_FILTERS.dateFrom,
    dateTo: toParam ?? DEFAULT_FILTERS.dateTo,
  };
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasInitializedFilters = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const [searchTerm, setSearchTerm] = useState(DEFAULT_FILTERS.q);
  const [debouncedSearch, setDebouncedSearch] = useState(DEFAULT_FILTERS.q);
  const [status, setStatus] = useState<MarketStatus>(DEFAULT_FILTERS.status);
  const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_FILTERS.sortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    DEFAULT_FILTERS.sortDirection,
  );
  const [category, setCategory] = useState(DEFAULT_FILTERS.category);
  const [volumeThreshold, setVolumeThreshold] = useState(
    DEFAULT_FILTERS.volumeThreshold,
  );
  const [dateFrom, setDateFrom] = useState(DEFAULT_FILTERS.dateFrom);
  const [dateTo, setDateTo] = useState(DEFAULT_FILTERS.dateTo);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (hasInitializedFilters.current) {
      return;
    }
    hasInitializedFilters.current = true;
    const parsed = parseFiltersFromParams(searchParams);
    setSearchTerm(parsed.q);
    setDebouncedSearch(parsed.q);
    setStatus(parsed.status);
    setSortBy(parsed.sortBy);
    setSortDirection(parsed.sortDirection);
    setCategory(parsed.category);
    setVolumeThreshold(parsed.volumeThreshold);
    setDateFrom(parsed.dateFrom);
    setDateTo(parsed.dateTo);
    setIsReady(true);
  }, [searchParams]);

  const marketsQuery = useMemo(() => {
    const query: GammaMarketsQuery = {
      limit: 50,
    };

    query.order = "id";
    query.ascending = false;

    if (status === "active" || status === "all") {
      query.active = true;
      query.closed = false;
    }

    if (status === "resolved") {
      query.closed = true;
    }

    return query;
  }, [status]);

  const closedMarketsQuery = useMemo(() => {
    if (status !== "all") {
      return null;
    }

    const query: GammaMarketsQuery = {
      limit: 50,
      order: "id",
      ascending: false,
      closed: true,
    };

    return query;
  }, [status]);

  const searchQueryParams = useMemo<GammaPublicSearchQuery | null>(() => {
    if (!debouncedSearch) {
      return null;
    }

    const query: GammaPublicSearchQuery = {
      q: debouncedSearch,
      limit_per_type: 10,
      search_tags: false,
      search_profiles: false,
    };

    if (status === "active") {
      query.events_status = "active";
    }

    if (status === "resolved") {
      query.events_status = "closed";
    }

    return query;
  }, [debouncedSearch, status]);

  const {
    data: markets,
    isLoading: marketsLoading,
    error: marketsError,
  } = useMarkets(marketsQuery);

  const {
    data: closedMarkets,
    isLoading: closedMarketsLoading,
    error: closedMarketsError,
  } = useMarkets(closedMarketsQuery ?? undefined, {
    enabled: closedMarketsQuery !== null,
  });

  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
  } = useMarketSearch(searchQueryParams, {
    enabled: Boolean(searchQueryParams),
  });

  const searchMarkets = useMemo(() => {
    if (!searchResults?.events) {
      return [];
    }

    const seen = new Set<string>();
    const collected: GammaMarket[] = [];

    searchResults.events.forEach((event) => {
      event?.markets?.forEach((market) => {
        const key = String(market.id ?? "");
        if (!key || seen.has(key)) {
          return;
        }
        seen.add(key);
        collected.push(market);
      });
    });

    return collected;
  }, [searchResults]);

  const hasSearch = debouncedSearch.length > 0;

  const combinedMarkets = useMemo(() => {
    const allMarkets = [...(markets ?? [])];

    if (closedMarkets) {
      const existingIds = new Set(allMarkets.map((m) => m.id));
      closedMarkets.forEach((market) => {
        if (!existingIds.has(market.id)) {
          allMarkets.push(market);
        }
      });
    }

    return allMarkets;
  }, [markets, closedMarkets]);

  const baseMarkets = hasSearch ? searchMarkets : combinedMarkets;
  const categories = useMemo(() => {
    const set = new Set<string>();
    baseMarkets.forEach((market) => {
      const value = getMarketCategory(market);
      if (value) {
        set.add(value);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [baseMarkets]);

  useEffect(() => {
    if (category !== "all" && !categories.includes(category)) {
      setCategory("all");
    }
  }, [category, categories]);

  const dateFromTimestamp = useMemo(
    () => parseDateInput(dateFrom, false),
    [dateFrom],
  );
  const dateToTimestamp = useMemo(() => parseDateInput(dateTo, true), [dateTo]);
  const minVolume = useMemo(
    () =>
      volumeThreshold === "any"
        ? null
        : Number.isFinite(Number(volumeThreshold))
          ? Number(volumeThreshold)
          : null,
    [volumeThreshold],
  );

  const filteredMarkets = useMemo(() => {
    return baseMarkets.filter((market) => {
      if (!matchesStatus(market, status)) {
        return false;
      }

      if (category !== "all") {
        const value = getMarketCategory(market);
        if (!value || value !== category) {
          return false;
        }
      }

      if (minVolume !== null) {
        const volume = getMarketVolume(market);
        if (volume === null || volume < minVolume) {
          return false;
        }
      }

      if (dateFromTimestamp !== null || dateToTimestamp !== null) {
        const endDate = getMarketEndDateTimestamp(market);
        if (endDate === null) {
          return false;
        }
        if (dateFromTimestamp !== null && endDate < dateFromTimestamp) {
          return false;
        }
        if (dateToTimestamp !== null && endDate > dateToTimestamp) {
          return false;
        }
      }

      return true;
    });
  }, [
    baseMarkets,
    status,
    category,
    minVolume,
    dateFromTimestamp,
    dateToTimestamp,
  ]);

  const sortedMarkets = useMemo(
    () => sortMarkets(filteredMarkets, sortBy, sortDirection),
    [filteredMarkets, sortBy, sortDirection],
  );

  const isLoading = hasSearch
    ? searchLoading
    : marketsLoading || closedMarketsLoading;
  const error = hasSearch
    ? searchError
    : marketsError ?? closedMarketsError;

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2,
      }),
    [],
  );

  const formatCurrency = (value: number | null) => {
    if (value === null) {
      return "—";
    }
    return formatter.format(value);
  };

  const liveCount =
    combinedMarkets.filter((market) => market.active).length ?? 0;
  const resolvedCount =
    combinedMarkets.filter((market) => market.closed).length ?? 0;

  const emptyMessage = hasSearch
    ? `No markets match "${debouncedSearch}". Try a different search or clear filters.`
    : status === "resolved"
      ? "No resolved markets available for this view."
      : status === "active"
        ? "No active markets available right now."
        : "No markets found for the current filters.";

  const highlightedName = useMemo(
    () => (name: string) => highlightText(name, debouncedSearch),
    [debouncedSearch],
  );

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatus("active");
    setSortBy("volume");
    setSortDirection("desc");
    setCategory("all");
    setVolumeThreshold("any");
    setDateFrom("");
    setDateTo("");
  };

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    }
    if (status !== "active") {
      params.set("status", status);
    }
    if (sortBy !== "volume") {
      params.set("sort", sortBy);
    }
    if (sortDirection !== "desc") {
      params.set("dir", sortDirection);
    }
    if (category !== "all") {
      params.set("category", category);
    }
    if (volumeThreshold !== "any") {
      params.set("minVolume", volumeThreshold);
    }
    if (dateFrom) {
      params.set("from", dateFrom);
    }
    if (dateTo) {
      params.set("to", dateTo);
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [
    debouncedSearch,
    status,
    sortBy,
    sortDirection,
    category,
    volumeThreshold,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const currentQuery = searchParams.toString();
    const nextQuery = queryString.startsWith("?")
      ? queryString.slice(1)
      : queryString;
    if (currentQuery === nextQuery) {
      return;
    }
    router.replace(`/${queryString}`, { scroll: false });
  }, [isReady, queryString, router, searchParams]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">Polydash</h1>
            <Badge variant="secondary">Foundation</Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Establishing the core layout, shared UI primitives, and styling
            tokens for Polymarket operations.
          </p>
          <div className="text-sm text-muted-foreground">
            {hasSearch
              ? `Search results for "${debouncedSearch}"`
              : "Showing market snapshots from Gamma"}
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Market Controls</CardTitle>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Clear filters
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  placeholder="Search markets"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortOption)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SORT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={sortDirection}
                  onValueChange={(value) =>
                    setSortDirection(value as SortDirection)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SORT_DIRECTION_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={volumeThreshold}
                  onValueChange={(value) => setVolumeThreshold(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Volume threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    {VOLUME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  aria-label="Filter start date"
                  placeholder="From date"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  aria-label="Filter end date"
                  placeholder="To date"
                />
              </div>
              <Tabs
                value={status}
                onValueChange={(value) => setStatus(value as MarketStatus)}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="active"
                  className="text-sm text-muted-foreground"
                >
                  Filter markets that are currently trading.
                </TabsContent>
                <TabsContent
                  value="resolved"
                  className="text-sm text-muted-foreground"
                >
                  Review markets that have resolved outcomes.
                </TabsContent>
                <TabsContent
                  value="all"
                  className="text-sm text-muted-foreground"
                >
                  Filter via resolution status.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle>Quick Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Active markets (sample)</span>
                <Badge>{marketsLoading ? "..." : liveCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Resolved markets (sample)</span>
                <Badge variant="outline">
                  {marketsLoading ? "..." : resolvedCount}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Showing results</span>
                <Badge variant="secondary">
                  {isLoading ? "..." : sortedMarkets.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Top Markets</h2>
              <Badge variant="outline">Sample</Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              Seeded examples for the dashboard
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_TOP_MARKETS.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Top Markets Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <MarketTable
                markets={sortedMarkets}
                isLoading={isLoading}
                error={error}
                emptyMessage={emptyMessage}
                formatCurrency={formatCurrency}
                renderName={hasSearch ? highlightedName : undefined}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
