import { handleHome } from './_lib/home.js';

export function onRequest(context) {
  return handleHome(context.request, context.env);
}
