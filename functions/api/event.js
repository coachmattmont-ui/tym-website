import { handleEvent } from '../_lib/events.js';

export function onRequestPost(context) {
  return handleEvent(context.request, context.env || {});
}
