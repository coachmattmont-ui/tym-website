import { json } from '../_lib/http.js';
import { paymentsConfigured, verifyStripeSignature } from '../_lib/billing.js';
import { applyCheckoutSession } from '../_lib/grant.js';
import { dbFromEnv } from '../_lib/supabase.js';

export async function handleWebhook(request, env, fetchImpl = fetch) {
  if (!paymentsConfigured(env)) {
    return json(503, { error: 'payments_not_configured', message: 'Payments are not configured yet.' });
  }
  const payload = await request.text();
  const header = request.headers.get('stripe-signature') || '';
  const verified = await verifyStripeSignature(payload, header, env.STRIPE_WEBHOOK_SECRET);
  if (!verified.ok) return json(400, { error: 'invalid_signature' });
  let event;
  try { event = JSON.parse(payload); } catch (e) { return json(400, { error: 'invalid_json' }); }
  if (!event || event.type !== 'checkout.session.completed') {
    return json(200, { received: true, ignored: event && event.type });
  }
  const session = event.data && event.data.object;
  try {
    const result = await applyCheckoutSession(session, dbFromEnv(env, fetchImpl));
    if (!result.ok && result.status >= 500) return json(500, { error: result.reason });
    return json(200, { received: true, applied: result.ok, reason: result.reason || null });
  } catch (e) {
    return json(500, { error: 'grant_failed' });
  }
}

export function onRequestPost(context) {
  return handleWebhook(context.request, context.env);
}
