/*
 * Production stand-in for the vite dev proxy.
 *
 * The browser calls /api/balances either way. Locally vite forwards it; once
 * deployed this function does, and the secret key stays on the server in both
 * cases. Runs on the edge runtime so it needs no dependencies - the standard
 * Request and Response are all it uses.
 *
 * vercel.json rewrites every /api/* path here and passes the original path as
 * __path. A filename catch-all only matches a single segment on vercel, which
 * silently broke /api/transfers/{id} - the polling call.
 */
export const config = { runtime: 'edge' };

// declared locally rather than pulling in @types/node: the edge runtime only
// exposes process.env, and relying on node's full types makes the build
// depend on devDependencies being installed
declare const process: { env: Record<string, string | undefined> };

const BASE = process.env.BUSHA_BASE_URL ?? 'https://api.sandbox.busha.so';

export default async function handler(req: Request): Promise<Response> {
  const key = process.env.BUSHA_API_KEY;
  if (!key) {
    return Response.json(
      { error: { name: 'config_error', message: 'BUSHA_API_KEY is not set' } },
      { status: 500 },
    );
  }

  const method = req.method.toUpperCase();
  if (!['GET', 'POST'].includes(method)) {
    return Response.json(
      { error: { name: 'method_not_allowed', message: `${method} is not allowed` } },
      { status: 405 },
    );
  }

  // the rewrite carries the real path here; everything else is a real query param
  const url = new URL(req.url);
  const params = new URLSearchParams(url.searchParams);
  const path = params.get('__path') ?? '';
  params.delete('__path');
  const query = params.toString();

  const upstream = await fetch(`${BASE}/v1/${path}${query ? `?${query}` : ''}`, {
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
