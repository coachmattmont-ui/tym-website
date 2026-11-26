import { createAttemptLimiter } from '../_lib/access-code.js';
import { cleanLead, leadDestinations, leadReady, schedulingLink } from '../_lib/lead.js';
import { json } from '../_lib/http.js';

const takeLeadAttempt = createAttemptLimiter({ limit: 6, windowMs: 15 * 60 * 1000 });

function clientIp(request) {
  return request.headers.get('cf-connecting-ip')
    || String(request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || 'unknown';
}

export async function handleLead(request, env, deps = {}) {
  const limiter = deps.limiter || takeLeadAttempt;
  const fetchImpl = deps.fetch || fetch;
  const limit = limiter(clientIp(request), deps.now || Date.now());
  if (!limit.ok) return json(429, { error: 'rate_limited', message: 'Too many tries. Wait a few minutes and try again.' });
  const dest = leadDestinations(env || {});
  let body = {};
  try { body = await request.json(); } catch (e) { body = {}; }
  const lead = cleanLead(body);
  const problem = leadReady(lead);
  if (problem) return json(400, { error: 'invalid', message: problem });
  if (dest.webhook) {
    const sent = await fetchImpl(dest.webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(lead)
    });
    if (!sent.ok) return json(502, { error: 'webhook', message: 'The request did not go through. Try again in a moment.' });
  }
  return json(200, { ok: true, leadSent: !!dest.webhook, schedulingUrl: schedulingLink(dest.scheduling, lead) });
}

export function onRequestPost(context) {
  return handleLead(context.request, context.env || {});
}
