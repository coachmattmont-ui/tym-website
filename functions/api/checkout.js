import { json } from '../_lib/http.js';
import { cleanProjectName, editWindowOpen, isUuid, paymentsConfigured, resolvePriceCents } from '../_lib/billing.js';
import { cleanSeed } from '../_lib/grant.js';
import { applyCheckoutSession } from '../_lib/grant.js';
import { cleanHpVariant } from '../_lib/events.js';
import { createCheckoutSession, retrieveCheckoutSession } from '../_lib/stripe.js';
import { dbFromEnv, getUser } from '../_lib/supabase.js';

async function reuseOrExpire(db, env, open, fetchImpl) {
  if (!open) return null;
  if (!open.stripe_session_id) return { pending: true };
  const loaded = await retrieveCheckoutSession(env, open.stripe_session_id, fetchImpl);
  const session = loaded.session;
  if (session && session.status === 'open' && (open.checkout_url || session.url)) {
    return { url: open.checkout_url || session.url, projectId: open.reserved_project_id, reused: true };
  }
  if (session && session.payment_status === 'paid') {
    const applied = await applyCheckoutSession(session, db);
    await db.markCheckout(open.id, 'complete');
    if (applied.ok) return { alreadyOpen: true, projectId: applied.projectId, editUntil: applied.editUntil };
  }
  await db.markCheckout(open.id, 'expired');
  return null;
}

export async function handleCheckout(request, env, fetchImpl = fetch) {
  if (!paymentsConfigured(env)) {
    return json(503, { error: 'payments_not_configured', message: 'Payments are not configured yet.' });
  }
  const price = resolvePriceCents(env.YT_SINGLE_USE_PRICE_CENTS);
  if (price.error) return json(500, { error: 'price_config', message: price.error });
  const user = await getUser(env, request, fetchImpl);
  if (!user) return json(401, { error: 'unauthorized', message: 'Sign in, then try the payment again.' });

  let body = {};
  try { body = await request.json(); } catch (e) { body = {}; }
  const requestedId = isUuid(body.projectId) ? body.projectId : null;
  const name = cleanProjectName(body.name);
  const seed = cleanSeed(body.seed);
  const db = dbFromEnv(env, fetchImpl);
  let existing = null;
  if (requestedId) {
    existing = await db.getProject(requestedId);
    if (existing && existing.owner !== user.id) {
      return json(403, { error: 'forbidden', message: 'That project belongs to another account.' });
    }
    if (existing && editWindowOpen(existing.edit_until)) {
      return json(200, { alreadyOpen: true, projectId: requestedId, editUntil: existing.edit_until, priceCents: price.cents });
    }
  }

  const purposeId = existing ? requestedId : null;
  const open = await db.findOpenCheckout(user.id, purposeId);
  const reused = await reuseOrExpire(db, env, open, fetchImpl);
  if (reused && reused.pending) {
    return json(409, { error: 'checkout_in_progress', message: 'A payment is already starting. Try again in a moment.' });
  }
  if (reused && reused.url) {
    return json(200, { url: reused.url, projectId: reused.projectId, reused: true, priceCents: price.cents });
  }
  if (reused && reused.alreadyOpen) {
    return json(200, { alreadyOpen: true, projectId: reused.projectId, editUntil: reused.editUntil, priceCents: price.cents });
  }

  const reservedId = existing ? requestedId : (requestedId || crypto.randomUUID());
  const inserted = await db.insertPending({
    owner: user.id,
    project_id: purposeId,
    reserved_project_id: reservedId,
    status: 'open',
    seed
  });
  if (inserted.error) return json(502, { error: 'checkout_create', message: inserted.error });
  if (inserted.conflict) {
    const winner = await db.findOpenCheckout(user.id, purposeId);
    if (winner && winner.checkout_url) {
      return json(200, { url: winner.checkout_url, projectId: winner.reserved_project_id, reused: true, priceCents: price.cents });
    }
    return json(409, { error: 'checkout_in_progress', message: 'A payment is already starting. Try again in a moment.' });
  }

  const origin = new URL(request.url).origin;
  const session = await createCheckoutSession({
    env,
    fetchImpl,
    origin,
    priceCents: price.cents,
    projectId: reservedId,
    userId: user.id,
    email: user.email,
    name,
    seed,
    hpVariant: cleanHpVariant(body.hpVariant),
    idempotencyKey: 'yt_' + inserted.row.id
  });
  if (session.error || !session.url) {
    await db.markCheckout(inserted.row.id, 'expired');
    return json(502, { error: 'stripe', message: session.error || 'Stripe could not start checkout.' });
  }
  await db.attachSession(inserted.row.id, session.id, session.url);
  return json(200, { url: session.url, projectId: reservedId, priceCents: price.cents });
}

export function onRequestPost(context) {
  return handleCheckout(context.request, context.env);
}
