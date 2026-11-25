import { testCodeConfigured } from '../_lib/access-code.js';
import { json } from '../_lib/http.js';
import { EDIT_DAYS, authConfigured, paymentsConfigured, resolvePriceCents } from '../_lib/billing.js';

export function publicConfig(env) {
  const price = resolvePriceCents(env && env.YT_SINGLE_USE_PRICE_CENTS);
  const body = {
    supabaseUrl: authConfigured(env) ? String(env.SUPABASE_URL).replace(/\/$/, '') : '',
    supabaseAnonKey: authConfigured(env) ? String(env.SUPABASE_ANON_KEY) : '',
    authConfigured: authConfigured(env),
    paymentsConfigured: paymentsConfigured(env) && !price.error,
    priceCents: price.cents || 2900,
    editDays: EDIT_DAYS,
    testCodesEnabled: testCodeConfigured(env)
  };
  if (price.error) body.priceError = price.error;
  return body;
}

export function onRequestGet(context) {
  return json(200, publicConfig(context.env || {}));
}
