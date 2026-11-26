import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import fs from 'node:fs';
import { publicConfig } from '../api/config.js';
import { handleLead } from '../api/lead.js';
import { createAttemptLimiter } from './access-code.js';

const quote = {
  projectName: 'Kitchen plan',
  control: 'Josh.ai',
  date: 'November 25, 2026',
  total: 200,
  tbdCount: 1,
  floors: [{ name: 'Main', rooms: [{ name: 'Kitchen', subtotal: 200, lines: [
    { name: 'Speaker', qty: 2, unit: 100, tbd: false, dealerCost: 40, fr: 0.62 },
    { name: 'Touchscreen', qty: 1, unit: 649, tbd: true }
  ] }] }],
  wholeHome: { subtotal: 0, lines: [] }
};

test('quote totals leave out price TBD and dealer fields', () => {
  const sandbox = { window: {} };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(new URL('../../layout-beta/quote-model.js', import.meta.url), 'utf8'), sandbox);
  const model = sandbox.YTQuote.buildQuote({
    projectName: 'Kitchen plan',
    control: 'Josh.ai',
    floors: quote.floors,
    wholeHome: []
  });
  assert.equal(model.floors[0].rooms[0].subtotal, 200);
  assert.equal(model.total, 200);
  assert.equal(model.tbdCount, 1);
  assert.equal(model.floors[0].rooms[0].lines[1].tbd, true);
  assert.equal(model.floors[0].rooms[0].lines[1].total, null);
  const raw = JSON.stringify(model);
  assert.equal(raw.includes('dealer'), false);
  assert.equal(raw.includes('"fr"'), false);
});

test('lead forwarding uses the webhook and scheduling URL and drops dealer cost', async () => {
  let forwarded = null;
  const fetchImpl = async (url, options) => {
    forwarded = { url, body: JSON.parse(options.body) };
    return new Response('ok', { status: 200 });
  };
  const env = {
    YT_LEAD_WEBHOOK_URL: 'https://leads.example/hook',
    YT_SCHEDULING_URL: 'https://calendly.com/tym/call'
  };
  const missing = await handleLead(new Request('https://tymhomes.com/api/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.8' },
    body: JSON.stringify({ contact: { name: 'Ada', email: 'ada@example.com' }, quote })
  }), {}, { limiter: createAttemptLimiter(), fetch: fetchImpl });
  assert.equal(missing.status, 200);
  const fallback = await missing.json();
  assert.equal(forwarded, null);
  const params = new URL(fallback.schedulingUrl).searchParams;
  assert.equal(new URL(fallback.schedulingUrl).pathname, '/smartdesigns/quick-call-project-review');
  assert.equal(params.get('name'), 'Ada');
  assert.equal(params.get('email'), 'ada@example.com');
  assert.equal(params.get('a1'), 'Layout quote: Kitchen plan. Total $200. Control: Josh.ai.');
  assert.equal(fallback.schedulingUrl.includes('dealer'), false);
  const res = await handleLead(new Request('https://tymhomes.com/api/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.8' },
    body: JSON.stringify({ contact: { name: 'Ada', email: 'ada@example.com', phone: '555', notes: 'Evening' }, quote, dealerCost: 9, fr: 0.5 })
  }), env, { limiter: createAttemptLimiter(), fetch: fetchImpl });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(new URL(body.schedulingUrl).pathname, '/tym/call');
  assert.equal(new URL(body.schedulingUrl).searchParams.get('a1').includes('dealer'), false);
  assert.equal(body.leadSent, true);
  assert.equal(forwarded.url, 'https://leads.example/hook');
  assert.equal(forwarded.body.contact.email, 'ada@example.com');
  assert.equal(forwarded.body.quote.floors[0].rooms[0].lines[0].dealerCost, undefined);
  assert.equal(JSON.stringify(forwarded.body).includes('"fr"'), false);
  const cfg = publicConfig(env);
  assert.equal(cfg.leadsConfigured, true);
  assert.equal(cfg.schedulingConfigured, true);
  assert.equal(JSON.stringify(cfg).includes('leads.example'), false);
  assert.equal(JSON.stringify(cfg).includes('calendly.com'), false);
});
