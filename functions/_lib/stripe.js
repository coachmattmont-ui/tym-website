export async function createCheckoutSession({ env, fetchImpl = fetch, priceCents, projectId, userId, email, origin }) {
  const success = origin + '/layout-beta/?checkout=success&project_id=' + encodeURIComponent(projectId) + '&session_id={CHECKOUT_SESSION_ID}';
  const cancel = origin + '/layout-beta/?checkout=cancel&project_id=' + encodeURIComponent(projectId);
  const pairs = [
    ['mode', 'payment'],
    ['success_url', success],
    ['cancel_url', cancel],
    ['client_reference_id', projectId],
    ['metadata[project_id]', projectId],
    ['metadata[user_id]', userId],
    ['line_items[0][quantity]', '1'],
    ['line_items[0][price_data][currency]', 'usd'],
    ['line_items[0][price_data][unit_amount]', String(priceCents)],
    ['line_items[0][price_data][product_data][name]', 'Layout project editing, 30 days'],
    ['line_items[0][price_data][product_data][description]', 'One project. Save, reopen on any device, and export the priced quote. Editing stays open for 30 days.']
  ];
  if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) pairs.push(['customer_email', email]);
  let body = pairs.map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value)).join('&');
  body = body.replace('session_id%3D%7BCHECKOUT_SESSION_ID%7D', 'session_id={CHECKOUT_SESSION_ID}');
  const res = await fetchImpl('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + env.STRIPE_SECRET_KEY,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data && data.error && data.error.message ? data.error.message : 'Stripe could not start checkout.';
    return { error: message };
  }
  return { id: data.id, url: data.url };
}

export async function retrieveCheckoutSession(env, sessionId, fetchImpl = fetch) {
  const res = await fetchImpl('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId), {
    headers: { authorization: 'Bearer ' + env.STRIPE_SECRET_KEY }
  });
  const data = await res.json();
  if (!res.ok) return { error: data && data.error && data.error.message ? data.error.message : 'Could not read the payment.' };
  return { session: data };
}
