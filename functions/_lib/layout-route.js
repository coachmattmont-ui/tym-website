export function layoutRedirect(request) {
  const url = new URL(request.url);
  if (url.pathname !== '/layout' && url.pathname !== '/layout/') return null;
  const dest = new URL('/layout-beta/', url.origin);
  dest.search = url.search;
  return Response.redirect(dest.toString(), 302);
}
