import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { codesMatch, createAttemptLimiter, testCodeConfigured } from './access-code.js';
import { publicConfig } from '../api/config.js';
import { handleTestAccess } from '../api/test-access.js';

const FIXTURE = 'test-fixture-code';
const NOW = Date.parse('2026-11-25T12:00:00Z');

function request(code, extra = {}) {
  return new Request('https://tymhomes.com/api/test-access', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': extra.ip || '203.0.113.10' },
    body: JSON.stringify({ code, seed: extra.seed || { rooms: ['Kitchen'], tier: 'better' } })
  });
}

test('codes stay disabled until the env var is set, and config never returns the value', async () => {
  assert.equal(testCodeConfigured({}), false);
  assert.equal(testCodeConfigured({ YT_TEST_ACCESS_CODE: '   ' }), false);
  const hidden = publicConfig({ YT_TEST_ACCESS_CODE: FIXTURE });
  assert.equal(hidden.testCodesEnabled, true);
  assert.equal(JSON.stringify(hidden).includes(FIXTURE), false);
  const off = await handleTestAccess(request(FIXTURE), {}, { now: NOW, limiter: createAttemptLimiter() });
  assert.equal(off.status, 404);
});

test('a matching code without Supabase opens a local test session and does not echo the code', async () => {
  const limiter = createAttemptLimiter();
  const bad = await handleTestAccess(request('nope'), { YT_TEST_ACCESS_CODE: FIXTURE }, { now: NOW, limiter });
  assert.equal(bad.status, 401);
  const ok = await handleTestAccess(request('  ' + FIXTURE + '  '), { YT_TEST_ACCESS_CODE: FIXTURE }, { now: NOW, limiter });
  assert.equal(ok.status, 200);
  const body = await ok.json();
  assert.equal(body.mode, 'local');
  assert.equal(body.testMode, true);
  assert.equal(body.source, 'test_code');
  assert.equal(body.editUntil, new Date(NOW + 30 * 24 * 60 * 60 * 1000).toISOString());
  assert.equal(JSON.stringify(body).includes(FIXTURE), false);
  assert.equal(await codesMatch(FIXTURE, FIXTURE), true);
  assert.equal(await codesMatch('short', FIXTURE + '-extra'), false);
});

test('too many tries are rejected before another guess can succeed', async () => {
  const limiter = createAttemptLimiter({ limit: 2, windowMs: 60000 });
  const env = { YT_TEST_ACCESS_CODE: FIXTURE };
  assert.equal((await handleTestAccess(request('nope', { ip: '198.51.100.4' }), env, { now: NOW, limiter })).status, 401);
  assert.equal((await handleTestAccess(request('nope', { ip: '198.51.100.4' }), env, { now: NOW + 1000, limiter })).status, 401);
  const blocked = await handleTestAccess(request(FIXTURE, { ip: '198.51.100.4' }), env, { now: NOW + 2000, limiter });
  assert.equal(blocked.status, 429);
  const other = await handleTestAccess(request(FIXTURE, { ip: '198.51.100.5' }), env, { now: NOW + 2000, limiter });
  assert.equal(other.status, 200);
});

test('with Supabase the code creates a project entitlement flagged test_code', async () => {
  const env = {
    YT_TEST_ACCESS_CODE: FIXTURE,
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'anon',
    SUPABASE_SERVICE_ROLE_KEY: 'service'
  };
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url: String(url), body: options.body || '' });
    if (String(url).endsWith('/auth/v1/user')) {
      return new Response(JSON.stringify({ id: '11111111-1111-4111-8111-111111111111', email: 'person@example.com' }), { status: 200 });
    }
    if (String(url).endsWith('/rest/v1/projects') && options.method === 'POST') {
      const row = JSON.parse(options.body);
      assert.equal(row.owner, '11111111-1111-4111-8111-111111111111');
      assert.equal(row.layout.defaultTier, 'better');
      assert.equal(JSON.stringify(row).includes(FIXTURE), false);
      assert.equal(JSON.stringify(row).includes('person@example.com'), false);
      return new Response(JSON.stringify([row]), { status: 201 });
    }
    if (String(url).includes('/rest/v1/projects?id=eq.')) {
      return new Response(JSON.stringify([{ id: '22222222-2222-4222-8222-222222222222', owner: '11111111-1111-4111-8111-111111111111', edit_until: '2026-12-25T12:00:00.000Z' }]), { status: 200 });
    }
    if (String(url).endsWith('/rest/v1/entitlements') && options.method === 'POST') {
      const row = JSON.parse(options.body);
      assert.equal(row.source, 'test_code');
      assert.equal(row.kind, 'single_use');
      assert.equal(row.stripe_session_id, null);
      assert.equal(JSON.stringify(row).includes(FIXTURE), false);
      return new Response(null, { status: 201 });
    }
    return new Response('{}', { status: 500 });
  };
  const signed = new Request('https://tymhomes.com/api/test-access', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer token', 'cf-connecting-ip': '203.0.113.50' },
    body: JSON.stringify({ code: FIXTURE, seed: { rooms: ['Kitchen'], tier: 'better', dealerCost: 4 } })
  });
  const res = await handleTestAccess(signed, env, { now: NOW, limiter: createAttemptLimiter(), fetch: fetchImpl });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.mode, 'account');
  assert.equal(body.source, 'test_code');
  assert.ok(body.projectId);
  assert.equal(calls.some(call => String(call.body).includes('test_code')), true);
});

test('the page asks for an access code without embedding a secret', () => {
  const html = fs.readFileSync(new URL('../../layout-beta/index.html', import.meta.url), 'utf8');
  assert.match(html, /Have an access code\?/);
  assert.match(html, /\/api\/test-access/);
  assert.equal(html.includes('YT_TEST_ACCESS_CODE'), false);
  assert.equal(html.includes(FIXTURE), false);
});
