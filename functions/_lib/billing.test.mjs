import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { EDIT_DAYS, cleanProjectName, editWindowOpen, mergeEditUntil, nextEditUntil, paymentsConfigured, resolvePriceCents, signStripePayload, verifyStripeSignature } from './billing.js';
import { publicConfig } from '../api/config.js';
import { handleCheckout } from '../api/checkout.js';
import { handleConfirm } from '../api/checkout/confirm.js';
import { handleWebhook } from '../api/stripe-webhook.js';
import { applyCheckoutSession, cleanSeed, stripStoredPrices } from './grant.js';

const ENV = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'service',
  STRIPE_SECRET_KEY: 'sk_test_123',
  STRIPE_WEBHOOK_SECRET: 'whsec_test'
};

const USER = '11111111-1111-4111-8111-111111111111';
const PROJECT = '22222222-2222-4222-8222-222222222222';

function fakeDb(seed = {}) {
  const state = {
    project: seed.project || null,
    entitlements: [],
    edits: []
  };
  return {
    state,
    async getProject() { return state.project; },
    async findEntitlement(sessionId) {
      return state.entitlements.find(row => row.stripe_session_id === sessionId) || null;
    },
    async insertEntitlement(row) {
      if (state.entitlements.some(item => item.stripe_session_id === row.stripe_session_id)) return false;
      state.entitlements.push({ ...row });
      return true;
    },
    async setEditUntil(id, editUntil) {
      state.edits.push(editUntil);
      if (state.project) state.project.edit_until = editUntil;
    },
    async insertProject(row) {
      state.project = { ...row };
      return { row: state.project };
    },
    async completeCheckout() {}
  };
}

function paidSession(extra = {}) {
  return {
    id: 'cs_test_abc',
    mode: 'payment',
    payment_status: 'paid',
    amount_total: 2900,
    currency: 'usd',
    payment_intent: 'pi_test_abc',
    customer_email: 'person@example.com',
    customer_details: { name: 'Should Not Store', address: { line1: '1 Main' } },
    client_reference_id: PROJECT,
    metadata: { project_id: PROJECT, user_id: USER },
    ...extra
  };
}

test('price defaults to 2900 cents and accepts a test range', () => {
  assert.equal(resolvePriceCents(undefined).cents, 2900);
  assert.equal(resolvePriceCents('').cents, 2900);
  assert.equal(resolvePriceCents('1500').cents, 1500);
  assert.equal(resolvePriceCents('5000').cents, 5000);
  assert.ok(resolvePriceCents('15').error);
  assert.ok(resolvePriceCents('15.5').error);
  assert.ok(resolvePriceCents('nope').error);
});

test('payments stay unconfigured until every secret is set', () => {
  assert.equal(paymentsConfigured({}), false);
  assert.equal(paymentsConfigured({ ...ENV, STRIPE_WEBHOOK_SECRET: ' ' }), false);
  assert.equal(paymentsConfigured(ENV), true);
  const cfg = publicConfig({});
  assert.equal(cfg.paymentsConfigured, false);
  assert.equal(cfg.authConfigured, false);
  assert.equal(cfg.supabaseUrl, '');
  assert.equal(cfg.priceCents, 2900);
  assert.equal(cfg.editDays, EDIT_DAYS);
  const ready = publicConfig({ ...ENV, YT_SINGLE_USE_PRICE_CENTS: '1500' });
  assert.equal(ready.paymentsConfigured, true);
  assert.equal(ready.priceCents, 1500);
  assert.equal(ready.supabaseAnonKey, 'anon');
  assert.equal(JSON.stringify(ready).includes('service'), false);
  assert.equal(JSON.stringify(ready).includes('sk_test'), false);
});

test('stripe signatures reject stale, missing, and tampered bodies', async () => {
  const payload = JSON.stringify({ id: 'evt_1' });
  const now = 1_700_000_000;
  const header = await signStripePayload(payload, ENV.STRIPE_WEBHOOK_SECRET, now);
  assert.equal((await verifyStripeSignature(payload, header, ENV.STRIPE_WEBHOOK_SECRET, now)).ok, true);
  assert.equal((await verifyStripeSignature(payload + ' ', header, ENV.STRIPE_WEBHOOK_SECRET, now)).ok, false);
  assert.equal((await verifyStripeSignature(payload, header, ENV.STRIPE_WEBHOOK_SECRET, now + 1000)).reason, 'stale');
  assert.equal((await verifyStripeSignature(payload, '', ENV.STRIPE_WEBHOOK_SECRET, now)).reason, 'missing');
});

test('a paid session opens 30 days once and does not store customer details', async () => {
  const now = Date.parse('2026-11-25T12:00:00Z');
  const db = fakeDb({ project: { id: PROJECT, owner: USER, edit_until: null } });
  const first = await applyCheckoutSession(paidSession(), db, now);
  assert.equal(first.ok, true);
  assert.equal(first.editUntil, nextEditUntil(now));
  assert.equal(db.state.entitlements.length, 1);
  const stored = JSON.stringify(db.state.entitlements[0]);
  assert.equal(stored.includes('person@example.com'), false);
  assert.equal(stored.includes('Should Not Store'), false);
  assert.equal(stored.includes('1 Main'), false);
  assert.equal(db.state.entitlements[0].kind, 'single_use');
  const second = await applyCheckoutSession(paidSession(), db, now + 86_400_000);
  assert.equal(second.idempotent, true);
  assert.equal(second.editUntil, first.editUntil);
  assert.equal(db.state.edits.length, 1);
});

test('an unpaid session and a different owner do not grant editing', async () => {
  const db = fakeDb({ project: { id: PROJECT, owner: USER, edit_until: null } });
  const unpaid = await applyCheckoutSession(paidSession({ payment_status: 'unpaid' }), db);
  assert.equal(unpaid.ok, false);
  assert.equal(db.state.entitlements.length, 0);
  const other = await applyCheckoutSession(paidSession({
    metadata: { project_id: PROJECT, user_id: '33333333-3333-4333-8333-333333333333' }
  }), db);
  assert.equal(other.reason, 'owner');
  assert.equal(db.state.project.edit_until, null);
});

test('reopening keeps the later edit window and strips stored prices', () => {
  const now = Date.parse('2026-11-25T12:00:00Z');
  const later = nextEditUntil(now);
  const sooner = new Date(now + 5 * 86_400_000).toISOString();
  assert.equal(mergeEditUntil(later, sooner), later);
  assert.equal(editWindowOpen(later, now), true);
  assert.equal(editWindowOpen(sooner, now + 10 * 86_400_000), false);
  assert.equal(editWindowOpen(null, now), false);
  const stripped = stripStoredPrices({
    version: 2,
    email: 'hidden@example.com',
    devices: [{ type: 'tv', catalogKey: 'K65XR50', price: 1, dealerCost: 2, fr: 0.5, list: 9 }]
  });
  assert.equal(stripped.email, undefined);
  assert.deepEqual(Object.keys(stripped.devices[0]).sort(), ['catalogKey', 'type']);
});

test('a paid session creates the project and keeps only room names', async () => {
  const db = fakeDb();
  const session = paidSession({
    metadata: {
      project_id: PROJECT,
      user_id: USER,
      project_name: 'Kitchen',
      seed_rooms: 'Great Room|Kitchen|dealer cost',
      seed_tier: 'better'
    }
  });
  const result = await applyCheckoutSession(session, db, Date.parse('2026-11-25T12:00:00Z'));
  assert.equal(result.ok, true);
  assert.equal(db.state.project.owner, USER);
  assert.equal(db.state.project.edit_until, result.editUntil);
  assert.deepEqual(db.state.project.layout.rooms.map(room => room.name), ['Great Room', 'Kitchen']);
  assert.equal(db.state.project.layout.defaultTier, 'better');
  assert.equal(JSON.stringify(db.state.project).includes('person@example.com'), false);
  assert.equal(JSON.stringify(db.state.project).includes('dealer'), false);
  assert.deepEqual(cleanSeed({ rooms: ['Office', 'Office'], tier: 'core', fr: 0.6 }), { rooms: ['Office'], tier: '' });
});

test('checkout uses the env price, refuses a locked-out config, and will not double charge an open project', async () => {
  let stripeCreates = 0;
  const fetchImpl = async (url, options = {}) => {
    const path = String(url);
    if (path.endsWith('/auth/v1/user')) {
      return new Response(JSON.stringify({ id: USER, email: 'person@example.com' }), { status: 200 });
    }
    if (path.includes('/rest/v1/projects?id=eq.') && (!options.method || options.method === 'GET')) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    if (path.includes('/rest/v1/projects') && options.method === 'POST') {
      throw new Error('project row must wait for payment');
    }
    if (path.includes('/rest/v1/pending_checkouts?') && (!options.method || options.method === 'GET')) {
      return new Response('[]', { status: 200 });
    }
    if (path.endsWith('/rest/v1/pending_checkouts') && options.method === 'POST') {
      const row = JSON.parse(options.body);
      assert.equal(row.owner, USER);
      assert.equal(row.status, 'open');
      assert.equal(row.project_id, null);
      assert.equal(JSON.stringify(row.seed).includes('dealer'), false);
      return new Response(JSON.stringify([{ ...row, id: '33333333-3333-4333-8333-333333333333' }]), { status: 201 });
    }
    if (path.includes('/rest/v1/pending_checkouts?id=eq.') && options.method === 'PATCH') {
      return new Response(null, { status: 204 });
    }
    if (path.includes('api.stripe.com')) {
      stripeCreates += 1;
      const body = String(options.body);
      assert.match(body, /unit_amount%5D=1500/);
      assert.match(body, /session_id=\{CHECKOUT_SESSION_ID\}/);
      assert.match(body, /seed_rooms%5D=Great%20Room%7CKitchen/);
      assert.equal(body.includes('dealer'), false);
      assert.equal(options.headers['Idempotency-Key'], 'yt_33333333-3333-4333-8333-333333333333');
      return new Response(JSON.stringify({ id: 'cs_test_new', url: 'https://checkout.stripe.com/c/pay/cs_test_new' }), { status: 200 });
    }
    return new Response('{}', { status: 500 });
  };
  const missing = await handleCheckout(new Request('https://tymhomes.com/api/checkout', { method: 'POST', body: '{}' }), {}, fetchImpl);
  assert.equal(missing.status, 503);
  const anon = await handleCheckout(new Request('https://tymhomes.com/api/checkout', { method: 'POST', body: '{}' }), { ...ENV, YT_SINGLE_USE_PRICE_CENTS: '1500' }, fetchImpl);
  assert.equal(anon.status, 401);
  const ok = await handleCheckout(new Request('https://tymhomes.com/api/checkout', {
    method: 'POST',
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({ name: 'Kitchen\nplan', priceCents: 100, seed: { rooms: ['Great Room', 'Kitchen', 'dealer cost'], tier: 'better', fr: 0.5 } })
  }), { ...ENV, YT_SINGLE_USE_PRICE_CENTS: '1500' }, fetchImpl);
  assert.equal(ok.status, 200);
  const payload = await ok.json();
  assert.equal(payload.priceCents, 1500);
  assert.equal(stripeCreates, 1);
  assert.match(payload.url, /^https:\/\/checkout\.stripe\.com\//);
  const again = await handleCheckout(new Request('https://tymhomes.com/api/checkout', {
    method: 'POST',
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({ name: 'Kitchen plan' })
  }), { ...ENV, YT_SINGLE_USE_PRICE_CENTS: '1500' }, async (url, options = {}) => {
    const path = String(url);
    if (path.endsWith('/auth/v1/user')) return new Response(JSON.stringify({ id: USER, email: 'person@example.com' }), { status: 200 });
    if (path.includes('pending_checkouts?') && (!options.method || options.method === 'GET')) {
      return new Response(JSON.stringify([{ id: '33333333-3333-4333-8333-333333333333', reserved_project_id: PROJECT, stripe_session_id: 'cs_test_new', checkout_url: 'https://checkout.stripe.com/c/pay/cs_test_new' }]), { status: 200 });
    }
    if (path.includes('/v1/checkout/sessions/cs_test_new')) {
      return new Response(JSON.stringify({ id: 'cs_test_new', status: 'open', url: 'https://checkout.stripe.com/c/pay/cs_test_new' }), { status: 200 });
    }
    if (path.includes('api.stripe.com') && options.method === 'POST') throw new Error('second checkout');
    return new Response('[]', { status: 200 });
  });
  const reused = await again.json();
  assert.equal(reused.reused, true);
  assert.equal(reused.url, 'https://checkout.stripe.com/c/pay/cs_test_new');

  const openFetch = async (url) => {
    if (String(url).endsWith('/auth/v1/user')) return new Response(JSON.stringify({ id: USER, email: 'person@example.com' }), { status: 200 });
    if (String(url).includes('/rest/v1/projects')) {
      return new Response(JSON.stringify([{ id: PROJECT, owner: USER, edit_until: nextEditUntil(Date.now()) }]), { status: 200 });
    }
    throw new Error('stripe should not be called');
  };
  const already = await handleCheckout(new Request('https://tymhomes.com/api/checkout', {
    method: 'POST',
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({ projectId: PROJECT })
  }), ENV, openFetch);
  const alreadyBody = await already.json();
  assert.equal(alreadyBody.alreadyOpen, true);
});

test('webhook requires a signature and confirm applies a paid Stripe session', async () => {
  const now = Math.floor(Date.now() / 1000);
  const event = {
    type: 'checkout.session.completed',
    data: { object: paidSession() }
  };
  const payload = JSON.stringify(event);
  const header = await signStripePayload(payload, ENV.STRIPE_WEBHOOK_SECRET, now);
  let editUntil = null;
  const fetchImpl = async (url, options = {}) => {
    const path = String(url);
    if (path.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: USER, email: 'person@example.com' }), { status: 200 });
    if (path.includes('/rest/v1/projects?id=eq.') && (!options.method || options.method === 'GET')) {
      return new Response(JSON.stringify([{ id: PROJECT, owner: USER, edit_until: editUntil }]), { status: 200 });
    }
    if (path.includes('/rest/v1/entitlements?stripe_session_id=')) {
      return new Response('[]', { status: 200 });
    }
    if (path.endsWith('/rest/v1/entitlements') && options.method === 'POST') {
      const row = JSON.parse(options.body);
      assert.equal(row.kind, 'single_use');
      assert.equal(Object.hasOwn(row, 'email'), false);
      return new Response(null, { status: 201 });
    }
    if (path.includes('/rest/v1/projects?id=eq.') && options.method === 'PATCH') {
      editUntil = JSON.parse(options.body).edit_until;
      return new Response(null, { status: 204 });
    }
    if (path.includes('/v1/checkout/sessions/')) {
      return new Response(JSON.stringify(paidSession()), { status: 200 });
    }
    return new Response('{}', { status: 404 });
  };
  const bad = await handleWebhook(new Request('https://tymhomes.com/api/stripe-webhook', {
    method: 'POST',
    headers: { 'stripe-signature': 't=1,v1=nope' },
    body: payload
  }), ENV, fetchImpl);
  assert.equal(bad.status, 400);
  const good = await handleWebhook(new Request('https://tymhomes.com/api/stripe-webhook', {
    method: 'POST',
    headers: { 'stripe-signature': header },
    body: payload
  }), ENV, fetchImpl);
  assert.equal(good.status, 200);
  assert.ok(editUntil);

  const confirm = await handleConfirm(new Request('https://tymhomes.com/api/checkout/confirm', {
    method: 'POST',
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({ sessionId: 'cs_test_abc' })
  }), ENV, fetchImpl);
  assert.equal(confirm.status, 200);
  const confirmed = await confirm.json();
  assert.equal(confirmed.projectId, PROJECT);
  assert.ok(confirmed.editUntil);
});

test('project names are labels, not multi-line notes', () => {
  assert.equal(cleanProjectName('  Living\nroom  '), 'Living room');
  assert.equal(cleanProjectName(''), 'Untitled project');
  assert.equal(cleanProjectName('x'.repeat(200)).length, 120);
});

test('layout page does not import the qualify engine and reprices from the current key', () => {
  const html = fs.readFileSync(new URL('../../layout-beta/index.html', import.meta.url), 'utf8');
  assert.equal(/<script[^>]+src=[^>]*YTEngine/i.test(html), false);
  assert.match(html, /id="buyScreen"/);
  assert.match(html, /Payments not configured/);
  assert.match(html, /Unlock editing/);
  assert.match(html, /function repriceLoadedDevices/);
  assert.equal(html.includes('You can still design here'), false);
  assert.match(html, /class="locked"/);
  const quote = fs.readFileSync(new URL('../../qualify/index.html', import.meta.url), 'utf8');
  assert.match(quote, /Get the Layout Tool/);
  assert.match(quote, /\/layout\/buy/);
  assert.equal(html.includes('qualify/'), false);
  assert.equal(html.includes('"dealer"'), false);
  assert.equal(html.includes('costRatio'), false);
  const sandbox = { window: {}, Date, isFinite };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(new URL('../../layout-beta/yt-access.js', import.meta.url), 'utf8'), sandbox);
  const now = Date.parse('2026-01-01T00:00:00Z');
  assert.equal(sandbox.YTAccess.editWindowOpen('2026-02-01T00:00:00Z', now), true);
  assert.equal(sandbox.YTAccess.editWindowOpen('2025-01-01T00:00:00Z', now), false);
  const rows = sandbox.YTAccess.repriceDeviceList(
    [{ type: 'stereo', tier: 'better', catalogKey: 'OLD', price: 10, dealerCost: 4, fr: 0.62 }],
    () => 'PG-6'
  );
  assert.equal(rows[0].catalogKey, 'PG-6');
  assert.equal(rows[0].price, undefined);
  assert.equal(rows[0].dealerCost, undefined);
  assert.equal(rows[0].fr, undefined);
});
