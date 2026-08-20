// Typed client for the Busha API.
//
// Every call goes through /api, which the vite dev proxy rewrites to /v1 and
// signs with the secret key. Nothing here ever sees the key.
//
// Shapes below were taken from real sandbox responses, not the docs, so a few
// fields the reference omits (Amount.fiat, Transfer.category) are included.

const BASE = '/api';

/* ---------------------------------------------------------------- types */

export interface Amount {
  amount: string;            // decimal string - never parseFloat for maths
  currency: string;
  fiat?: { amount: string; currency: string };  // NGN equivalent, undocumented
}

export interface Balance {
  id: string;
  currency: string;
  name: string;
  type: 'fiat' | 'crypto';
  available: Amount;
  pending: Amount;
  total: Amount;
  savings: Amount;
  investments: Amount;
}

export interface Rate {
  product: string;
  rate: string;
  rate_explained: string;    // "1 USDT = 1,396.72 NGN" - display ready
  side: 'buy' | 'sell';
  type: string;
  source_currency: string;
  target_currency: string;
}

export interface Fee {
  name: string;
  type: string;
  amount: { amount: string; currency: string };
}

export interface Channel {
  type: 'balance' | 'temporary_bank_account' | string;
  expires_at?: string;
  recipient_details?: {
    account_name: string;
    account_number: string;
    bank_code: string;
    bank_name: string;
    email: string;
  };
}

export interface Quote {
  id: string;
  reference: string;
  source_currency: string;
  target_currency: string;
  source_amount: string;
  target_amount: string;
  rate: Rate;
  fees: Fee[];               // empty for conversions - render conditionally
  status: string;
  expires_at?: string;       // absent on deposit quotes
  created_at: string;
  updated_at: string;
  pay_in?: Channel;
  pay_out?: Channel;
}

export type TransferStatus =
  | 'pending'
  | 'processing'
  | 'funds_received'          // terminal for deposits
  | 'funds_converted'         // terminal for conversions
  | 'outgoing_payment_sent'
  | 'funds_delivered'         // terminal for payouts
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'funds_refunded'
  | 'funds_not_delivered';

export interface Transfer {
  id: string;
  quote_id: string;
  reference: string;
  category: 'deposit' | 'conversion' | string;
  stages: string[];
  description: string;
  sub_description: string;
  source_currency: string;
  target_currency: string;
  source_amount: string;
  target_amount: string;
  trade?: 'buy' | 'sell';
  rate: Rate;
  fees: Fee[];
  status: TransferStatus;
  pay_in?: Channel;
  pay_out?: Channel;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  status: string;
  created_at: string;
  reference: string;         // conversions emit TWO rows sharing this
  type: string;              // buys | sells | deposits | withdrawals | ...
  description: string;
  sub_description: string;
  amount: string;
  currency: string;
  is_fiat: boolean;
  is_credit: boolean;        // false = debit leg
  status_description: string;
  meta?: {
    balance?: { available: string; total: string };
    conversion?: {
      rate: string;
      rate_explained: string;
      source_amount: string;
      source_currency: string;
      target_amount: string;
      target_currency: string;
    };
    fee?: { amount: string; currency: string };
  };
}

/* ---------------------------------------------------------------- errors */

/**
 * Busha signals failure with a completely different envelope to success:
 *   ok:   { status, message, data }
 *   fail: { error: { name, message }, fields? }
 * There is no `status` field on errors, so we branch on `error` being present.
 */
export class BushaError extends Error {
  code: string;
  fields?: Record<string, { reason: string }[]>;

  constructor(
    code: string,
    message: string,
    fields?: Record<string, { reason: string }[]>,
  ) {
    super(message);
    this.name = 'BushaError';
    this.code = code;
    this.fields = fields;
  }
}

interface Envelope<T> {
  status?: string;
  message?: string;
  data?: T;
  error?: { name: string; message: string };
  fields?: Record<string, { reason: string }[]>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  let body: Envelope<T>;
  try {
    body = await res.json();
  } catch {
    throw new BushaError('invalid_response', `Unexpected response (HTTP ${res.status})`);
  }

  if (body.error) {
    throw new BushaError(body.error.name, body.error.message, body.fields);
  }
  if (!res.ok) {
    throw new BushaError('http_error', body.message ?? `Request failed (HTTP ${res.status})`);
  }
  return body.data as T;
}

/* ---------------------------------------------------------------- calls */

export function getBalances(currency?: string) {
  const q = currency ? `?currency=${encodeURIComponent(currency)}` : '';
  return request<Balance[]>(`/balances${q}`);
}

export interface CreateQuoteInput {
  source_currency: string;
  target_currency: string;
  source_amount?: string;    // send exactly one of source_amount
  target_amount?: string;    // or target_amount, never both
  pay_in?: Channel;
  pay_out?: Channel;
}

export function createQuote(input: CreateQuoteInput) {
  return request<Quote>('/quotes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Conversion: spend one balance, receive into another. */
export function createConversionQuote(
  source_currency: string,
  target_currency: string,
  source_amount: string,
) {
  return createQuote({
    source_currency,
    target_currency,
    source_amount,
    pay_in: { type: 'balance' },
    pay_out: { type: 'balance' },
  });
}

/** The transfer body is only ever the quote id - the quote holds everything. */
export function createTransfer(quote_id: string) {
  return request<Transfer>('/transfers', {
    method: 'POST',
    body: JSON.stringify({ quote_id }),
  });
}

export function getTransfer(id: string) {
  return request<Transfer>(`/transfers/${id}`);
}

export interface Pair {
  id: string;
  base: string;
  base_currency_name: string;
  counter: string;
  counter_currency_name: string;
  type: string;
  buy_price: { amount: string; currency: string };
  sell_price: { amount: string; currency: string };
  is_buy_supported: boolean;
  is_sell_supported: boolean;
  // the counter leg is the limit expressed in the currency being spent, which
  // is what the amount field is validated against
  min_buy_amount?: { amount: string; currency: string; counter?: { amount: string; currency: string } };
  min_sell_amount?: { amount: string; currency: string; counter?: { amount: string; currency: string } };
}

/** Tradable markets. `currency` filters to pairs quoted in that currency. */
export function getPairs(currency?: string) {
  const q = currency ? `?currency=${encodeURIComponent(currency)}` : '';
  return request<Pair[]>(`/pairs${q}`);
}

export function getTransactions(limit = 20) {
  return request<Transaction[]>(`/transactions?limit=${limit}`);
}

/* ---------------------------------------------------------------- status */

// Success is category dependent: a completed conversion never says "completed",
// so polling for that alone would hang forever.
const SUCCESS_BY_CATEGORY: Record<string, TransferStatus[]> = {
  deposit: ['funds_received'],
  conversion: ['funds_converted'],
  payout: ['funds_delivered', 'outgoing_payment_sent'],
};

const FAILED: TransferStatus[] = [
  'failed',
  'cancelled',
  'funds_refunded',
  'funds_not_delivered',
];

export function isSettled(t: Transfer): boolean {
  const ok = SUCCESS_BY_CATEGORY[t.category] ?? ['completed'];
  return ok.includes(t.status) || t.status === 'completed';
}

export function isFailed(t: Transfer): boolean {
  return FAILED.includes(t.status);
}

export function isTerminal(t: Transfer): boolean {
  return isSettled(t) || isFailed(t);
}

/** Poll until the transfer settles or fails. Sandbox takes ~3s. */
export async function pollTransfer(
  id: string,
  { intervalMs = 2000, timeoutMs = 60000 }: { intervalMs?: number; timeoutMs?: number } = {},
  onUpdate?: (t: Transfer) => void,
): Promise<Transfer> {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const transfer = await getTransfer(id);
    onUpdate?.(transfer);

    if (isTerminal(transfer)) return transfer;
    if (Date.now() >= deadline) {
      throw new BushaError('poll_timeout', 'Transfer is taking longer than expected');
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/* ---------------------------------------------------------------- helpers */

export function isQuoteExpired(q: Quote): boolean {
  return q.expires_at ? Date.parse(q.expires_at) <= Date.now() : false;
}

export function msUntilExpiry(q: Quote): number {
  return q.expires_at ? Math.max(0, Date.parse(q.expires_at) - Date.now()) : 0;
}

/** Format a decimal string for display without losing precision to floats. */
export function formatAmount(amount: string, currency: string): string {
  const [whole, fraction] = amount.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${fraction ? `${grouped}.${fraction}` : grouped} ${currency}`;
}

/** Split into grouped whole and fixed-width fraction, for styling them apart. */
export function amountParts(amount: string, decimals = 2) {
  const [whole = '0', fraction = ''] = amount.split('.');
  return {
    whole: whole.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    fraction: (fraction + '0'.repeat(decimals)).slice(0, decimals),
  };
}

/*
 * Money maths on decimal strings via BigInt.
 *
 * Balances arrive as strings precisely so they survive values like
 * 14.31926227 USDT. Adding them with Number would reintroduce the float error
 * the string representation exists to avoid, so everything is scaled to
 * integers, summed exactly, then scaled back.
 */
const SCALE = 8;

function toScaled(value: string): bigint {
  const negative = value.startsWith('-');
  const digits = negative ? value.slice(1) : value;
  const [whole = '0', fraction = ''] = digits.split('.');
  const padded = (fraction + '0'.repeat(SCALE)).slice(0, SCALE);
  const scaled = BigInt((whole || '0') + padded);
  return negative ? -scaled : scaled;
}

function fromScaled(value: bigint): string {
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().padStart(SCALE + 1, '0');
  const whole = digits.slice(0, -SCALE);
  const fraction = digits.slice(-SCALE).replace(/0+$/, '');
  return `${negative ? '-' : ''}${fraction ? `${whole}.${fraction}` : whole}`;
}

export function sumAmounts(values: string[]): string {
  return fromScaled(values.reduce((total, v) => total + toScaled(v || '0'), 0n));
}
