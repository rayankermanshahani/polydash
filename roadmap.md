# Development Roadmap (Expanded)

This roadmap breaks the project into incremental, testable milestones. Each week includes deliverables, acceptance criteria, and key risks to watch.

---

## Week 1 — Foundation & Data Access

**Goal:** Establish project skeleton, core data clients, and a navigable UI shell.

### Deliverables
- Project setup with Next.js 14 (App Router), TypeScript, Tailwind, and shadcn/ui
- Base layout (sidebar/header/content), responsive grid system, and route scaffolding
- API client layer for Gamma, CLOB, and Data APIs
- Market browser page with search/filter/sort and basic cards/table
- Shared utilities (formatting, parsing, date helpers)

### Tasks (Granular)
- Scaffold Next.js app + base styling
- Add shadcn/ui primitives used across pages (Card, Table, Badge, Tabs, Input, Select)
- Implement `lib/polymarket/gamma.ts`, `clob.ts`, `data.ts` with typed responses
- Create query hooks for markets list and search (`hooks/useMarkets.ts`)
- Build basic `MarketCard` + `MarketTable` components
- Add filters: category, status, volume threshold, date range, sort order
- Add basic error and loading UI states
- Seed a sample “Top Markets” section on dashboard home

### Acceptance Criteria
- App boots with no runtime errors
- Users can browse markets and apply filters/search
- API calls succeed with real data from Gamma/CLOB/Data endpoints
- Layout is stable on mobile and desktop

### Risks / Dependencies
- API rate limits or inconsistencies
- Mapping between market slugs and token IDs

---

## Week 2 — Market Operations Module

**Goal:** Deliver full Market Detail experience with real-time pricing and health metrics.

### Deliverables
- Market detail page with price chart and order book
- WebSocket integration for live updates
- Market health scoring + alert flags
- Outcome distribution visualization

### Tasks (Granular)
- Implement detail route `/markets/[slug]` with server/client data loading
- Fetch: market metadata (Gamma), order book (CLOB), price midpoint (CLOB)
- Add WebSocket manager + hook (`lib/polymarket/websocket.ts`, `hooks/useMarketPrice.ts`)
- Build `OrderBookChart` and `PriceChart` components
- Implement `calculateMarketHealth()` and surface alerts
- Add time-to-resolution countdown and spread calculations
- Add UI: status chips, health score badge, alert list

### Acceptance Criteria
- Market detail page loads without errors for multiple slugs
- Live price updates render within seconds
- Order book view reflects current bids/asks
- Health score and alerts displayed for every market

### Risks / Dependencies
- WebSocket reliability and reconnect logic
- Charting library configuration

---

## Week 3 — Customer Intelligence Module

**Goal:** Enable wallet-based investigations with positions, trades, and activity views.

### Deliverables
- Customer lookup page and profile view
- Positions table with live valuations
- Trade history with pagination
- Activity timeline for user events
- “Quick Actions” summary panel

### Tasks (Granular)
- Build `/customers` search and `/customers/[address]` profile layout
- Implement `useCustomer.ts` hook (positions + trades + summary stats)
- Add `PositionsTable`, `TradeHistory`, `ActivityTimeline`
- Compute live position values from CLOB midpoints
- Add PnL calculations and win rate summary
- Enable CSV export for trade history
- Add empty states and not-found handling

### Acceptance Criteria
- Address lookup resolves and loads data consistently
- Positions and trades render with correct totals
- CSV export works with filtered trade sets
- UI handles empty wallets gracefully

### Risks / Dependencies
- Data API pagination and rate limits
- Matching positions to market metadata

---

## Week 4 — Analytics, Monitoring, and Polish

**Goal:** Deliver a high-level analytics dashboard, live monitoring feed, and production readiness.

### Deliverables
- Platform overview dashboard (volume, active markets, category breakdown)
- Top traders leaderboard and filters
- Real-time activity monitor with whale alerts
- Connection status indicator
- Error boundaries, loading skeletons, and final UI polish
- Documentation (README + usage notes)

### Tasks (Granular)
- Build `/analytics` dashboard with volume + category charts
- Implement leaderboard using Data API aggregates
- Add monitoring page with live feed and whale alert panel
- Build `WhaleAlertService` + alert badge UX
- Add WebSocket status indicator in header
- Add global error boundary and per-page fallback states
- Validate mobile responsiveness for all pages
- Write README with setup, routes, and data sources

### Acceptance Criteria
- Analytics dashboard renders with real aggregate data
- Whale alerts trigger on large trades
- WebSocket status indicator is accurate
- No unhandled errors in UI flows
- Documentation matches implemented features

### Risks / Dependencies
- Data API coverage for leaderboard stats
- Rate limits during high-frequency live streams

---

## Optional Week 5 — Hardening & Extensions

**Goal:** Improve reliability, performance, and add bonus capabilities.

### Deliverables
- Caching layer (Redis or in-memory LRU)
- Background job for periodic data refresh
- Extended charts (historical trends, cohort comparisons)
- Admin-style audit log or market change tracker
- End-to-end test pass

### Tasks (Granular)
- Add caching for Gamma + Data API endpoints
- Implement data refresh scheduler (server cron or Vercel cron)
- Add historical trend pages (volume, market creation, categories)
- Implement basic audit log (create/update events for markets)
- Add E2E smoke tests (Playwright or Cypress)

### Acceptance Criteria
- Caching reduces repeated calls and improves latency
- Scheduled refresh works without manual intervention
- E2E test passes for core user flows

### Risks / Dependencies
- Cron job support in hosting environment
- Storage strategy for audit logs

---

## Cross-Cutting Quality Checklist (Apply Weekly)

- [ ] Type-safe API responses + Zod validation on critical endpoints
- [ ] Loading, error, and empty states for every data fetch
- [ ] Mobile responsiveness verified for each new page
- [ ] Clear user-facing labels and minimal jargon
- [ ] Performance check: no page exceeds acceptable load time
- [ ] WebSocket reconnects cleanly after network hiccups
- [ ] Basic unit tests for utilities and calculations

---

## Milestone Gates

**Gate 1 (End of Week 1)**
- Markets browsing is functional and stable
- Core APIs are integrated with typed clients

**Gate 2 (End of Week 2)**
- Real-time market detail view with health scoring

**Gate 3 (End of Week 3)**
- Customer intelligence module operational end-to-end

**Gate 4 (End of Week 4)**
- Analytics + monitoring complete, with polished UX and docs

---

## Suggested Next Steps After MVP

- Add authentication and role-based access (if needed)
- Integrate on-chain data from subgraphs for richer metrics
- Add alert subscriptions (email/Slack) for ops teams
- Add market creation workflow with validation + preview
- Introduce alert rule builder for ops users
