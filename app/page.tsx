import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function Home() {
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
        </header>

        <section className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Market Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Search markets" />
                <Select defaultValue="volume">
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="liquidity">Liquidity</SelectItem>
                    <SelectItem value="ending-soon">Ending soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Tabs defaultValue="open" className="w-full">
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
                <span>Live markets</span>
                <Badge>214</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>High volume alerts</span>
                <Badge variant="outline">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Upcoming resolutions</span>
                <Badge variant="secondary">38</Badge>
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
                  {[1, 2, 3].map((row) => (
                    <TableRow key={row}>
                      <TableCell>Election predictor {row}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Open</Badge>
                      </TableCell>
                      <TableCell>$1.2m</TableCell>
                      <TableCell>$420k</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
