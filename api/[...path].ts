/*
 * Production stand-in for the vite dev proxy.
 *
 * The browser calls /api/balances either way. Locally vite forwards it; once
 * deployed this function does, and the secret key stays on the server in both
 * cases. Runs on the edge runtime so it needs no dependencies - the standard
 * Request and Response are all it uses.
 */
export const config = { runtime: 'edge' };

const BASE = process.env.BUSHA_BASE_URL ?? 'https://api.sandbox.busha.so';

export default async function handler(req: Request): Promise<Response> {
  const key = process.env.BUSHA_API_KEY;
  if (!key) {
    return Response.json(
      { error: { name: 'config_error', message: 'BUSHA_API_KEY is not set' } },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, '');
  const method = req.method.toUpperCase();

  // only the verbs the app actually uses
  if (!['GET', 'POST'].includes(method)) {
    return Response.json(
      { error: { name: 'method_not_allowed', message: `${method} is not allowed` } },
      { status: 405 },
    );
  }

  const upstream = await fetch(`${BASE}/v1${path}${url.search}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: method === 'GET' ? undefined : await req.text(),
  });

  // pass payload and status straight through, errors included, so the client
  // keeps reading busha's own error envelope
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
