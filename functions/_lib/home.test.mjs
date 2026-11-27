import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { handleEvent, cleanHpVariant } from './events.js';
import { handleHome, resolveVariant } from './home.js';
import { layoutRedirect } from './layout-route.js';
import { createCheckoutSession } from './stripe.js';

function assetEnv(files, fail = new Set()) {
  return {
    ASSETS: {
      async fetch(request) {
        const path = new URL(request.url).pathname;
        if (fail.has(path)) throw new Error('missing ' + path);
        const body = files[path];
        if (!body) return new Response('no', { status: 404 });
        return new Response(body, { status: 200, headers: { 'content-type': 'text/html' } });
      }
    }
  };
}

test('query override beats the cookie and the split falls back to B', () => {
  const queried = resolveVariant(new Request('https://tymhomes.com/?hp=a', { headers: { cookie: 'tym_hp=b' } }));
  assert.equal(queried.variant, 'a');
  assert.equal(queried.setCookie, true);
  const kept = resolveVariant(new Request('https://tymhomes.com/', { headers: { cookie: 'other=1; tym_hp=b' } }), () => 0);
  assert.equal(kept.variant, 'b');
  assert.equal(kept.setCookie, false);
  assert.equal(resolveVariant(new Request('https://tymhomes.com/'), () => 0.1).variant, 'a');
  assert.equal(resolveVariant(new Request('https://tymhomes.com/'), () => 0.9).variant, 'b');
  assert.equal(resolveVariant(new Request('https://tymhomes.com/?hp=nope'), () => 0.9).variant, 'b');
});

test('homepage serves the variant, sets a private 90-day cookie, and falls back to B', async () => {
  const env = assetEnv({ '/index.html': '<h1>Plan your smart home</h1>', '/home-a.html': '<h1>60 seconds</h1>' });
  const b = await handleHome(new Request('https://tymhomes.com/?hp=b'), env);
  assert.equal(b.headers.get('cache-control'), 'private, no-store');
  assert.match(b.headers.get('set-cookie'), /tym_hp=b/);
  assert.match(b.headers.get('set-cookie'), /Max-Age=7776000/);
  assert.match(b.headers.get('set-cookie'), /Secure/);
  assert.match(await b.text(), /Plan your smart home/);
  const a = await handleHome(new Request('http://127.0.0.1/?hp=a'), env);
  assert.match(await a.text(), /60 seconds/);
  assert.equal(a.headers.get('set-cookie').includes('Secure'), false);
  const stuck = await handleHome(new Request('https://tymhomes.com/', { headers: { cookie: 'tym_hp=a' } }), env);
  assert.equal(stuck.headers.get('set-cookie'), null);
  assert.match(await stuck.text(), /60 seconds/);
  const broken = assetEnv(
    { '/index.html': '<h1>Plan your smart home</h1>' },
    new Set(['/home-a.html'])
  );
  const fell = await handleHome(new Request('https://tymhomes.com/?hp=a'), broken);
  assert.match(await fell.text(), /Plan your smart home/);
  assert.match(fell.headers.get('set-cookie'), /tym_hp=b/);
});

test('layout redirects to the tool and leaves the buy path alone', () => {
  const moved = layoutRedirect(new Request('https://tymhomes.com/layout/?buy=1&rooms=kitchen'));
  assert.equal(moved.status, 302);
  assert.equal(moved.headers.get('location'), 'https://tymhomes.com/layout-beta/?buy=1&rooms=kitchen');
  assert.equal(layoutRedirect(new Request('https://tymhomes.com/layout/buy/?rooms=2')), null);
  assert.equal(layoutRedirect(new Request('https://tymhomes.com/layout-beta/')), null);
});

test('events accept the four names and store without echoing secrets', async () => {
  assert.equal(cleanHpVariant('a'), 'a');
  assert.equal(cleanHpVariant('cost'), '');
  let posted = null;
  const res = await handleEvent(new Request('https://tymhomes.com/api/event', {
    method: 'POST',
    body: JSON.stringify({ name: 'hero_cta_click', variant: 'b', path: '/?hp=b', cost: 12 })
  }), {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret'
  }, {
    fetch: async (url, options) => {
      posted = { url: String(url), body: JSON.parse(options.body), auth: options.headers.authorization };
      return new Response(null, { status: 201 });
    }
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.stored, true);
  assert.equal(JSON.stringify(body).includes('service-role-secret'), false);
  assert.equal(posted.body.name, 'hero_cta_click');
  assert.equal(posted.body.variant, 'b');
  assert.equal(Object.hasOwn(posted.body, 'cost'), false);
  const skipped = await handleEvent(new Request('https://tymhomes.com/api/event', {
    method: 'POST',
    body: JSON.stringify({ name: 'instant_quote_completed', variant: 'a', path: '/qualify/' })
  }), {});
  assert.equal(skipped.status, 202);
  const bad = await handleEvent(new Request('https://tymhomes.com/api/event', {
    method: 'POST',
    body: JSON.stringify({ name: 'nope' })
  }), {});
  assert.equal(bad.status, 400);
  const viewed = await handleEvent(new Request('https://tymhomes.com/api/event', {
    method: 'POST',
    body: JSON.stringify({ name: 'demo_viewed', variant: 'b', path: '/layout-beta/' })
  }), {});
  assert.equal(viewed.status, 202);
  const started = await handleEvent(new Request('https://tymhomes.com/api/event', {
    method: 'POST',
    body: JSON.stringify({ name: 'guide_started', variant: 'b', path: '/layout-beta/guide/intro' })
  }), {});
  assert.equal(started.status, 202);
});

test('checkout metadata carries the homepage variant only when it is a or b', async () => {
  let body = '';
  await createCheckoutSession({
    env: { STRIPE_SECRET_KEY: 'sk_test_123' },
    fetchImpl: async (_url, options) => {
      body = options.body;
      return new Response(JSON.stringify({ id: 'cs_test', url: 'https://checkout.stripe.com/c/pay/cs_test' }), { status: 200 });
    },
    priceCents: 2900,
    projectId: '22222222-2222-4222-8222-222222222222',
    userId: '11111111-1111-4111-8111-111111111111',
    origin: 'https://tymhomes.com',
    name: 'Plan',
    seed: { rooms: [], tier: '' },
    hpVariant: 'a'
  });
  assert.match(body, /metadata%5Bhp_variant%5D=a/);
  assert.equal(body.includes('dealer'), false);
});

test('both homepage files keep the public price and the required lines', () => {
  const b = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const a = fs.readFileSync(new URL('../../home-a.html', import.meta.url), 'utf8');
  for (const html of [a, b]) {
    assert.match(html, /15\+/);
    assert.match(html, /All 50/);
    assert.match(html, /28M\+/);
    assert.match(html, /500\+/);
    assert.match(html, /Do I have to talk to a salesperson/);
    assert.match(html, /Fix it on paper, not in drywall/);
    assert.match(html, /images\/Brothers\.webp/);
    assert.match(html, /hero-house-dusk\.webp/);
    assert.match(html, /rel="preload"/);
    assert.equal(html.includes('\u2014'), false);
    assert.equal(html.includes('dealer cost'), false);
    assert.match(html, /href="\/qualify\/"/);
    assert.match(html, /href="\/packages\/aetherion-max\/"/);
    assert.match(html, /href="\/about\/"/);
  }
  assert.match(b, /Plan your smart home on your own floor plan/);
  assert.match(b, /Start My Layout · \$29/);
  assert.match(b, /Your plan\. Your devices\. Your number/);
  assert.match(a, /Know what your smart home will cost\. In 60 seconds/);
  assert.match(a, /Get My Free Instant Quote/);
  assert.match(a, /Got your number\? Put it on your floor plan/);
  assert.match(a, /href="\/layout\/"/);
  const tool = fs.readFileSync(new URL('../../layout-beta/index.html', import.meta.url), 'utf8');
  assert.match(tool, /<title>Layout Tool \| SmartHome Brothers<\/title>/);
  assert.equal(tool.includes('Layout Tool — Beta'), false);
});
