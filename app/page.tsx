"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarketSearch, useMarkets } from "@/hooks/useMarkets";
import type {
  GammaMarket,
  GammaMarketsQuery,
  GammaPublicSearchQuery,
} from "@/lib/polymarket/gamma";

type MarketStatus = "open" | "resolved" | "all";

type SortOption = "volume" | "liquidity" | "ending-soon";

const SORT_LABELS: Record<SortOption, string> = {
  volume: "Volume",
  liquidity: "Liquidity",
  "ending-soon": "Ending soon",
};

const toNumber = (value: unknown) => {
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
    )
  );
};

const formatStatus = (market: GammaMarket) => {
  if (market.closed) {
    return { label: "Resolved", variant: "secondary" as const };
  }
  if (market.active) {
    return { label: "Open", variant: "default" as const };
  }
  return { label: "Inactive", variant: "outline" as const };
};

const getMarketDisplayName = (market: GammaMarket) =>
  market.question ?? market.slug ?? "Untitled market";

const getVolumeValue = (market: GammaMarket) =>
  market.volumeNum ?? toNumber(market.volume);

const getLiquidityValue = (market: GammaMarket) => market.liquidityNum ?? null;

const getEndDateValue = (market: GammaMarket) => {
  if (market.endDateIso) {
    return Date.parse(market.endDateIso);
  }
  if (market.endDate) {
    return Date.parse(market.endDate);
  }
  return null;
};

const sortMarkets = (markets: GammaMarket[], sortBy: SortOption) => {
  const sorted = [...markets];

  if (sortBy === "volume") {
    sorted.sort(
      (a, b) => (getVolumeValue(b) ?? 0) - (getVolumeValue(a) ?? 0)
    );
  }

  if (sortBy === "liquidity") {
    sorted.sort(
      (a, b) => (getLiquidityValue(b) ?? 0) - (getLiquidityValue(a) ?? 0)
    );
  }

  if (sortBy === "ending-soon") {
    sorted.sort(
      (a, b) => (getEndDateValue(a) ?? 0) - (getEndDateValue(b) ?? 0)
    );
  }

  return sorted;
};

const filterByStatus = (markets: GammaMarket[], status: MarketStatus) => {
  if (status === "all") {
    return markets;
  }
  if (status === "resolved") {
    return markets.filter((market) => market.closed ?? false);
  }
  return markets.filter((market) => market.active ?? !market.closed);
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<MarketStatus>("open");
  const [sortBy, setSortBy] = useState<SortOption>("volume");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const marketsQuery = useMemo(() => {
    const query: GammaMarketsQuery = {
      limit: 50,
    };

    query.order = "id";
    query.ascending = false;

    if (status === "open") {
      query.active = true;
      query.closed = false;
    }

    if (status === "resolved") {
      query.closed = true;
    }

    return query;
  }, [sortBy, status]);

  const searchParams = useMemo<GammaPublicSearchQuery | null>(() => {
    if (!debouncedSearch) {
      return null;
    }

    const query: GammaPublicSearchQuery = {
      q: debouncedSearch,
      limit_per_type: 10,
      search_tags: false,
      search_profiles: false,
    };

    if (status === "open") {
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
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
  } = useMarketSearch(searchParams, { enabled: Boolean(searchParams) });

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
  const baseMarkets = hasSearch ? searchMarkets : markets ?? [];
  const filteredMarkets = useMemo(
    () => filterByStatus(baseMarkets, status),
    [baseMarkets, status]
  );
  const sortedMarkets = useMemo(
    () => sortMarkets(filteredMarkets, sortBy),
    [filteredMarkets, sortBy]
  );

  const isLoading = hasSearch ? searchLoading : marketsLoading;
  const error = hasSearch ? searchError : marketsError;

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2,
      }),
    []
  );

  const formatCurrency = (value: number | null) => {
    if (value === null) {
      return "—";
    }
    return formatter.format(value);
  };

  const liveCount = markets?.filter((market) => market.active).length ?? 0;
  const resolvedCount = markets?.filter((market) => market.closed).length ?? 0;

  const emptyMessage = hasSearch
    ? `No markets match "${debouncedSearch}". Try a different search or clear filters.`
    : status === "resolved"
    ? "No resolved markets available for this view."
    : status === "open"
    ? "No open markets available right now."
    : "No markets found for the current filters.";

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
              <CardTitle>Market Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
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
              </div>
              <Tabs
                value={status}
                onValueChange={(value) => setStatus(value as MarketStatus)}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="open">Open</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="open"
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
                  View every market across statuses.
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
                <span>Live markets (sample)</span>
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

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Top Markets Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Liquidity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        Loading markets...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-destructive">
                        {error.message}
                      </TableCell>
                    </TableRow>
                  ) : sortedMarkets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedMarkets.map((market) => {
                      const statusBadge = formatStatus(market);
                      const displayName = getMarketDisplayName(market);
                      return (
                        <TableRow key={market.id}>
                          <TableCell className="font-medium">
                            {highlightText(displayName, debouncedSearch)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant}>
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(getVolumeValue(market))}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(getLiquidityValue(market))}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
