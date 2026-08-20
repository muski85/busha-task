# Busha Frontend Test — Business Dashboard

A fintech dashboard built from the provided Figma design, then wired to the
live [Busha API](https://docs.busha.io) sandbox — balances, market prices, and
buy / sell / convert through quotes and transfers.

## Stack

Vite · React · TypeScript · plain CSS with design tokens — no router, no UI
packages, no state or data-fetching libraries.

## Run it

```bash
npm install
cp .env.example .env      # then add your sandbox key
npm run dev
```

Open http://localhost:5173. For the mobile view, resize below 768px or use
DevTools device mode.

`.env` is gitignored and must never be committed:

```
BUSHA_BASE_URL=https://api.sandbox.busha.so
BUSHA_API_KEY=your_sandbox_key
```

Note there is no `VITE_` prefix. That is deliberate — see below.

## Features

**Interface**

- Responsive desktop and mobile layouts (sidebar ↔ bottom nav) down to 320px
- Adaptive accounts table on mobile: Value column collapses into sub-values,
  balances right-aligned
- Layout matches Figma measurements (spacing, sizing, typography) on both
  breakpoints
- Per-account actions menu with click-outside dismiss

**Live data**

- Balances, portfolio total, and per-coin market prices
- Cash / Crypto tabs filtering on the balance type returned by the API
- Searchable coin list with live prices across every tradable market
- Buy, sell and convert: quote → review → confirm → transfer → poll → settled
- Rate locked for 30 minutes with a countdown; an expired quote cannot be
  submitted and offers a re-quote instead
- Minimum trade size and available balance validated before a quote is
  requested, so the API's own limits surface in the form
- Transaction history, with the paired debit and credit legs of a conversion
  collapsed into a single entry

## The API key never reaches the browser

Busha authenticates with a secret key that has full account access. Anything
Vite exposes to client code ends up readable in the built bundle, so the key
is kept server side and the browser only ever calls `/api/*`:

| Environment | Handled by |
| --- | --- |
| local dev | the vite proxy in `vite.config.ts` |
| deployed | the edge function in `api/[...path].ts` |

Both attach the `Authorization` header on the way out and rewrite `/api` to
`/v1`. The client code is identical in either case.

## Endpoints used

| Endpoint | Purpose |
| --- | --- |
| `GET /v1/balances` | balances, portfolio total, cash and crypto split |
| `GET /v1/pairs` | live prices and minimum trade sizes |
| `POST /v1/quotes` | locks a rate before a trade |
| `POST /v1/transfers` | executes a trade from a quote id |
| `GET /v1/transfers/{id}` | polls until the transfer settles |
| `GET /v1/transactions` | transaction history |

## How a trade works

```
quote  ->  review  ->  confirm  ->  transfer  ->  poll  ->  settled
```

A transfer takes nothing but a `quote_id`, so the quote carries the currencies,
amounts, rate and channels. That means the rate a user confirms is the rate
they agreed to, and it is also why buy, sell and convert are one flow rather
than three: only the `pay_in` and `pay_out` channels differ.

## Two things the docs do not mention

- A completed conversion reports `funds_converted`, never `completed`. Polling
  for `completed` alone will never resolve. Terminal status is per category:
  deposits end at `funds_received`, payouts at `funds_delivered`.
- Each conversion writes **two** transaction records sharing one reference, a
  debit leg and a credit leg. Rendered raw, every conversion appears twice.

## Deploying

Vercel picks up both the Vite build and `api/` automatically. Set
`BUSHA_BASE_URL` and `BUSHA_API_KEY` as environment variables in the project
settings — not in the repo.

## Notes

- All spacing, colours and typography extracted from Figma into `tokens.css`
- Inter substitutes Aeonik Pro (licensed font)
- Coin marks are drawn locally from each currency's own glyph; anything without
  artwork falls back to a monogram tinted from a hash of its code
- Not wired up: the chart area (Busha exposes no time-series endpoint), the
  time-range tabs, sidebar navigation, and Deposit / Send / Withdraw

## Project layout

```
api/            edge function proxy used in production
src/lib/        typed api client, money helpers, status logic
src/hooks/      balances, transactions, markets
src/convert/    quote and transfer flow
src/dashboard/  balances, prices, history
src/styles/     design tokens and global styles
```
