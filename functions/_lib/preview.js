const PRODUCTION_HOSTS = new Set([
  'tym-website.pages.dev',
  'tymhomes.com',
  'www.tymhomes.com',
  'new.tymhomes.com'
]);

export function requestHost(request) {
  try { return new URL(request.url).hostname.toLowerCase(); } catch (e) { return ''; }
}

export function isPreviewUnlockAllowed(request, env) {
  const src = env || {};
  if (String(src.CF_PAGES || '') !== '1') return false;
  const branch = String(src.CF_PAGES_BRANCH || '').trim().toLowerCase();
  if (!branch || branch === 'main' || branch === 'master' || branch === 'production') return false;
  const host = requestHost(request);
  if (!host || PRODUCTION_HOSTS.has(host)) return false;
  return host.endsWith('.tym-website.pages.dev');
}
