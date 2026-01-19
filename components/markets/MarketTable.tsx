import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GammaMarket } from "@/lib/polymarket/gamma";
import {
  getMarketDisplayName,
  getMarketEndDateTimestamp,
  getMarketLiquidity,
  getMarketStatusBadge,
  getMarketVolume,
} from "@/lib/markets";
import type { ReactNode } from "react";

interface MarketTableProps {
  markets: GammaMarket[];
  isLoading: boolean;
  error: Error | null;
  emptyMessage: string;
  formatCurrency: (value: number | null) => string;
  renderName?: (name: string) => ReactNode;
}

export function MarketTable({
  markets,
  isLoading,
  error,
  emptyMessage,
  formatCurrency,
  renderName,
}: MarketTableProps) {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Market</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Volume</TableHead>
          <TableHead>Liquidity</TableHead>
          <TableHead className="text-right">End date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-muted-foreground">
              Loading markets...
            </TableCell>
          </TableRow>
        ) : error ? (
          <TableRow>
            <TableCell colSpan={5} className="text-destructive">
              {error.message}
            </TableCell>
          </TableRow>
        ) : markets.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          markets.map((market) => {
            const status = getMarketStatusBadge(market);
            const name = getMarketDisplayName(market);
            const endTimestamp = getMarketEndDateTimestamp(market);
            const endLabel = endTimestamp
              ? dateFormatter.format(new Date(endTimestamp))
              : "—";
            return (
              <TableRow key={market.id}>
                <TableCell className="font-medium">
                  {renderName ? renderName(name) : name}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>{formatCurrency(getMarketVolume(market))}</TableCell>
                <TableCell>
                  {formatCurrency(getMarketLiquidity(market))}
                </TableCell>
                <TableCell className="text-right">{endLabel}</TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
