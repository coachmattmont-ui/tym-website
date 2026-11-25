import { nextEditUntil, mergeEditUntil, isUuid, cleanProjectName } from './billing.js';

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

export function cleanSeed(input) {
  const src = input && typeof input === 'object' ? input : {};
  const rooms = [];
  const raw = Array.isArray(src.rooms) ? src.rooms : String(src.rooms || '').split('|');
  raw.forEach(room => {
    const name = String(room || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (!name || rooms.indexOf(name) >= 0 || /dealer|cost|fr\b/i.test(name)) return;
    if (rooms.length < 24) rooms.push(name);
  });
  const tier = src.tier === 'good' || src.tier === 'better' ? src.tier : '';
  return { rooms, tier };
}

export function seedLayout(seed, name) {
  const clean = cleanSeed(seed);
  const rooms = clean.rooms.map((label, i) => ({ id: i + 1, name: label }));
  const layout = {
    version: 2,
    name: name || 'Untitled project',
    rooms,
    devices: [],
    nid: rooms.length + 1
  };
  if (clean.tier) layout.defaultTier = clean.tier;
  return layout;
}

export function seedFromSession(session) {
  const meta = (session && session.metadata) || {};
  return cleanSeed({ rooms: meta.seed_rooms || '', tier: meta.seed_tier || '' });
}

export async function applyCheckoutSession(session, db, nowMs = Date.now()) {
  if (!session || session.mode !== 'payment') return { ok: false, reason: 'mode', status: 200 };
  if (session.payment_status !== 'paid') return { ok: false, reason: 'unpaid', status: 200 };
  const projectId = (session.metadata && session.metadata.project_id) || session.client_reference_id;
  const userId = session.metadata && session.metadata.user_id;
  if (!isUuid(projectId) || !isUuid(userId)) return { ok: false, reason: 'metadata', status: 200 };
  let project = await db.getProject(projectId);
  if (project && project.owner !== userId) return { ok: false, reason: 'owner', status: 403 };
  const prior = await db.findEntitlement(session.id);
  if (prior) return { ok: true, idempotent: true, projectId, editUntil: prior.edit_until };
  const granted = nextEditUntil(nowMs);
  const editUntil = mergeEditUntil(project && project.edit_until, granted);
  if (!project) {
    const name = cleanProjectName(session.metadata && session.metadata.project_name);
    const inserted = await db.insertProject({
      id: projectId,
      owner: userId,
      name,
      layout: seedLayout(seedFromSession(session), name),
      edit_until: editUntil
    });
    if (inserted && inserted.error) return { ok: false, reason: 'project_create', status: 500 };
    project = await db.getProject(projectId);
    if (!project || project.owner !== userId) return { ok: false, reason: 'missing_project', status: 500 };
  }
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
  if (typeof db.completeCheckout === 'function') await db.completeCheckout(session.id);
  return { ok: true, projectId, editUntil, kind: 'single_use' };
}
