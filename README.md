# Polymarket Dashboard

An internal operations dashboard for managing and monitoring Polymarket prediction markets using real-time API and blockchain data.

## Features

- **Market Operations**: browse, search, and analyze prediction markets
- **Customer Intelligence**: look up trader profiles, positions, and history
- **Real-time Monitoring**: websocket-powered live price updates and alerts
- **Analytics Dashboard**: platform metrics and top traders

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Data**: Polymarket APIs
- **Charts**: Recharts / TradingView Lightweight Charts

## APIs Used

- [Gamma API](https://gamma-api.polymarket.com) - market metadata
- [CLOB API](https://clob.polymarket.com) - order book & prices
- [Data API](https://data-api.polymarket.com) - positions & trades
- [WebSocket](wss://ws-subscriptions-clob.polymarket.com) - real-time updates

## Running Locally

```bash
# clone repo
git clone https://github.com/rayankermanshahani/polydash

# install dependencies
bun install

# run dev server
bun run dev
```
