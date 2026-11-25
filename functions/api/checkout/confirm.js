import { json } from '../../_lib/http.js';
import { paymentsConfigured } from '../../_lib/billing.js';
import { applyCheckoutSession } from '../../_lib/grant.js';
import { retrieveCheckoutSession } from '../../_lib/stripe.js';
import { dbFromEnv, getUser } from '../../_lib/supabase.js';

export async function handleConfirm(request, env, fetchImpl = fetch) {
  if (!paymentsConfigured(env)) {
    return json(503, { error: 'payments_not_configured', message: 'Payments are not configured yet.' });
  }
  const user = await getUser(env, request, fetchImpl);
  if (!user) return json(401, { error: 'unauthorized', message: 'Sign in, then try the payment again.' });
  let body = {};
  try { body = await request.json(); } catch (e) { body = {}; }
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return json(400, { error: 'session', message: 'Missing the payment session.' });
  }
  const loaded = await retrieveCheckoutSession(env, sessionId, fetchImpl);
  if (loaded.error) return json(502, { error: 'stripe', message: loaded.error });
  const session = loaded.session;
  if ((session.metadata && session.metadata.user_id) !== user.id) {
    return json(403, { error: 'forbidden', message: 'That payment belongs to another account.' });
  }
  const result = await applyCheckoutSession(session, dbFromEnv(env, fetchImpl));
  if (!result.ok) {
    const status = result.status && result.status >= 400 ? result.status : 409;
    const message = result.reason === 'unpaid'
      ? 'The payment is not complete yet.'
      : 'The payment could not be applied.';
    return json(status, { error: result.reason, message });
  }
  return json(200, {
    projectId: result.projectId,
    editUntil: result.editUntil,
    idempotent: !!result.idempotent
  });
}

export function onRequestPost(context) {
  return handleConfirm(context.request, context.env);
}
