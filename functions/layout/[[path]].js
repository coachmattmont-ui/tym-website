import { layoutRedirect } from '../_lib/layout-route.js';

export function onRequest(context) {
  const redirect = layoutRedirect(context.request);
  if (redirect) return redirect;
  return context.next();
}
