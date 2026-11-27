export function stampAssetVersion(html, sha) {
  const version = String(sha || '').replace(/[^a-fA-F0-9]/g, '').slice(0, 7);
  if (!version || typeof html !== 'string' || !html) return html;
  return html.replace(
    /\/assets\/([A-Za-z0-9._-]+\.(?:css|js))(?:\?v=[^"'\\\s>]*)?/g,
    '/assets/$1?v=' + version
  );
}
