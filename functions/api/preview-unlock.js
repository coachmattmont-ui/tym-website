import { nextEditUntil } from '../_lib/billing.js';
import { json } from '../_lib/http.js';
import { isPreviewUnlockAllowed } from '../_lib/preview.js';

export async function handlePreviewUnlock(request, env, deps = {}) {
  if (!isPreviewUnlockAllowed(request, env || {})) {
    return json(404, { error: 'not_found' });
  }
  const now = deps.now || Date.now();
  return json(200, {
    mode: 'local',
    testMode: true,
    preview: true,
    source: 'preview_unlock',
    editUntil: nextEditUntil(now)
  });
}

export function onRequestPost(context) {
  return handlePreviewUnlock(context.request, context.env || {});
}
