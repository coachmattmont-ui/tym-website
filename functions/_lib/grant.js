import { nextEditUntil, mergeEditUntil, isUuid } from './billing.js';

const PRICE_FIELDS = ['price', 'list', 'unit', 'cost', 'dealer', 'dealerCost', 'fr', 'msrp', 'email', 'phone', 'address'];

export function stripStoredPrices(layout) {
  if (!layout || typeof layout !== 'object') return layout;
  const next = { ...layout };
  if (Array.isArray(next.devices)) {
    next.devices = next.devices.map(device => {
      if (!device || typeof device !== 'object') return device;
      const copy = { ...device };
      PRICE_FIELDS.forEach(key => { delete copy[key]; });
      return copy;
    });
  }
  delete next.email;
  delete next.phone;
  delete next.address;
  delete next.customer;
  return next;
}

export async function applyCheckoutSession(session, db, nowMs = Date.now()) {
  if (!session || session.mode !== 'payment') return { ok: false, reason: 'mode', status: 200 };
  if (session.payment_status !== 'paid') return { ok: false, reason: 'unpaid', status: 200 };
  const projectId = (session.metadata && session.metadata.project_id) || session.client_reference_id;
  const userId = session.metadata && session.metadata.user_id;
  if (!isUuid(projectId) || !isUuid(userId)) return { ok: false, reason: 'metadata', status: 200 };
  const project = await db.getProject(projectId);
  if (!project) return { ok: false, reason: 'missing_project', status: 500 };
  if (project.owner !== userId) return { ok: false, reason: 'owner', status: 403 };
  const prior = await db.findEntitlement(session.id);
  if (prior) return { ok: true, idempotent: true, projectId, editUntil: prior.edit_until };
  const granted = nextEditUntil(nowMs);
  const editUntil = mergeEditUntil(project.edit_until, granted);
  const row = {
    project_id: projectId,
    owner: userId,
    kind: 'single_use',
    status: 'active',
    source: 'stripe_checkout',
    stripe_session_id: session.id,
    stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    amount_cents: Number.isInteger(session.amount_total) ? session.amount_total : null,
    currency: session.currency || 'usd',
    edit_until: editUntil
  };
  const inserted = await db.insertEntitlement(row);
  if (!inserted) {
    const again = await db.findEntitlement(session.id);
    return { ok: true, idempotent: true, projectId, editUntil: again ? again.edit_until : project.edit_until };
  }
  await db.setEditUntil(projectId, editUntil);
  return { ok: true, projectId, editUntil, kind: 'single_use' };
}
