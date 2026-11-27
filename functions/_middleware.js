import { stampAssetVersion } from './_lib/asset-version.js';

export async function onRequest(context) {
  const response = await context.next();
  const type = response.headers.get('content-type') || '';
  const sha = context.env && context.env.CF_PAGES_COMMIT_SHA;
  if (!sha || !type.includes('text/html') || !response.body) return response;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(stampAssetVersion(await response.text(), sha), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
