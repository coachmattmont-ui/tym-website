import { json } from '../_lib/http.js';
import { cleanProjectName, editWindowOpen, isUuid, paymentsConfigured, resolvePriceCents } from '../_lib/billing.js';
import { createCheckoutSession } from '../_lib/stripe.js';
import { dbFromEnv, getUser } from '../_lib/supabase.js';

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
  const projectId = isUuid(body.projectId) ? body.projectId : crypto.randomUUID();
  const name = cleanProjectName(body.name);
  const db = dbFromEnv(env, fetchImpl);
  let project = await db.getProject(projectId);
  if (project && project.owner !== user.id) {
    return json(403, { error: 'forbidden', message: 'That project belongs to another account.' });
  }
  if (project && editWindowOpen(project.edit_until)) {
    return json(200, { alreadyOpen: true, projectId, editUntil: project.edit_until, priceCents: price.cents });
  }
  if (!project) {
    const inserted = await db.insertProject({
      id: projectId,
      owner: user.id,
      name,
      layout: { version: 2 },
      edit_until: null
    });
    if (inserted.error) return json(502, { error: 'project_create', message: inserted.error });
    if (inserted.conflict) {
      project = await db.getProject(projectId);
      if (!project || project.owner !== user.id) {
        return json(403, { error: 'forbidden', message: 'That project belongs to another account.' });
      }
    }
  }

  const origin = new URL(request.url).origin;
  const session = await createCheckoutSession({
    env,
    fetchImpl,
    origin,
    priceCents: price.cents,
    projectId,
    userId: user.id,
    email: user.email
  });
  if (session.error || !session.url) {
    return json(502, { error: 'stripe', message: session.error || 'Stripe could not start checkout.' });
  }
  return json(200, { url: session.url, projectId, priceCents: price.cents });
}

export function onRequestPost(context) {
  return handleCheckout(context.request, context.env);
}
