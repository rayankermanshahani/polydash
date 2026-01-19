import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { GammaMarket } from "@/lib/polymarket/gamma";
import {
  getMarketCategory,
  getMarketDisplayName,
  getMarketEndDateTimestamp,
  getMarketLiquidity,
  getMarketStatusBadge,
  getMarketVolume,
} from "@/lib/markets";
import type { ReactNode } from "react";

interface MarketCardProps {
  market: GammaMarket;
  formatCurrency: (value: number | null) => string;
  renderName?: (name: string) => ReactNode;
}

export function MarketCard({
  market,
  formatCurrency,
  renderName,
}: MarketCardProps) {
  const status = getMarketStatusBadge(market);
  const name = getMarketDisplayName(market);
  const category = getMarketCategory(market);
  const endTimestamp = getMarketEndDateTimestamp(market);
  const endLabel = endTimestamp
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(endTimestamp))
    : "—";

  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm font-semibold">
            {renderName ? renderName(name) : name}
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        {category ? (
          <div className="text-xs text-muted-foreground">{category}</div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Volume</span>
          <span>{formatCurrency(getMarketVolume(market))}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Liquidity</span>
          <span>{formatCurrency(getMarketLiquidity(market))}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Ends</span>
          <span>{endLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
