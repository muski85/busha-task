# Busha Dashboard

A dashboard built against the [Busha API](https://docs.busha.io), covering the
full money movement flow: balances, live market prices, and buy / sell /
convert through quotes and transfers.

React 19 + TypeScript + Vite. No runtime dependencies beyond React.

## Running locally

```bash
npm install
cp .env.example .env      # then add your sandbox key
npm run dev
```

`.env` is gitignored and must never be committed:

```
BUSHA_BASE_URL=https://api.sandbox.busha.so
BUSHA_API_KEY=your_sandbox_key
```

Note there is no `VITE_` prefix. That is deliberate — see below.

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

Quotes expire after 30 minutes. The review step counts down and refuses to
submit an expired quote, offering a re-quote instead.

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

## Project layout

```
api/          edge function proxy used in production
src/lib/      typed api client, money helpers, status logic
src/hooks/    balances, transactions, markets
src/convert/  quote and transfer flow
src/dashboard/ balances, prices, history
```
