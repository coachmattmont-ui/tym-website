# Layout Tool: account save and single-use editing

The Layout Tool at `/layout-beta/` does not open until a project is purchased. There is no free design mode. Instant Quote (`/qualify/`) stays free. At the end of that quote, a card links to the Layout Tool with the room names and a good or better starting point. It does not send prices or dealer cost.

The shareable buy URL is `/layout/buy`. It lands on `/layout-beta/?buy=1` and keeps any `rooms` and `tier` query. Promo pages can use either URL.

One payment unlocks **one project**, including every floor and page in it:

- Save it to the account and open it on any device.
- Edit it for 30 days.
- Export the priced quote.

After 30 days the project stays in the account and can be viewed, but edits are rejected in the page and in the database. Paying again opens another 30 days and reprices every line from the current list-price catalog. The catalog in `layout-beta/index.html` is list price only. Dealer cost is not stored and is not shown.

A later dealer subscription can grant access by inserting `entitlements.kind = 'subscription'` and setting `projects.edit_until`. That billing is not built here.

If the environment variables below are missing, the page shows the purchase screen and **Payments not configured**. The plan stays locked.

## Environment variables

Set these on the Cloudflare Pages project (Production and Preview). Mark the three secrets as encrypted. Do not commit them.

| Name | Where it is used | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | Pages Function `/api/config` and server calls | `https://YOUR_PROJECT.supabase.co` |
| `SUPABASE_ANON_KEY` | Returned to the browser by `/api/config` | Public anon key. Row level security limits what it can read. |
| `SUPABASE_SERVICE_ROLE_KEY` | Checkout and the Stripe webhook only | Secret. Bypasses row level security. Never put it in the page. |
| `STRIPE_SECRET_KEY` | Checkout and payment confirm | Test mode: `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `POST /api/stripe-webhook` | Signing secret, `whsec_...` |
| `YT_SINGLE_USE_PRICE_CENTS` | Checkout amount | Optional. Whole cents. Default **2900** ($29.00). Use `1500` for $15 or `5000` for $50. No code change. |

`/api/config` is public. It returns the Supabase URL, the anon key, whether payments are configured, the price in cents, and `editDays` (30). It does not return the service role key, the Stripe secret, or the webhook secret.

## Supabase

1. Create a project. Authentication, Email, enable email sign-in. Magic link is enough. Leave phone off.
2. Authentication, URL configuration. Add every origin the tool is opened from, with path `/layout-beta/`. Include production (`https://tymhomes.com/layout-beta/` or the live host), the Pages preview URL, and `http://localhost:8788/layout-beta/` if you use Wrangler locally.
3. Open the SQL editor and run `supabase/migrations/20261125120000_layout_projects.sql`.
4. Copy the project URL, anon key, and service role key into the Pages variables above.

The migration also creates `pending_checkouts` for an in-flight Stripe session. That is not a project. A second click while one is open returns the same Checkout URL. The project row is inserted only when the payment is paid, together with the entitlement.

The migration creates:

- `projects`: owner, name, layout JSON (schema v2), `edit_until`, plan PDF path, timestamps. No phone, address, or customer name column. The only account identity is the Supabase email.
- `entitlements`: one row per grant. `kind` is `single_use` today. `subscription` is allowed and unused. `stripe_session_id` is unique so a repeated webhook does not add a second 30 days.
- Row level security: a signed-in user can read only their rows. They can update a project only while `edit_until` is in the future. They cannot change `owner` or `edit_until`. They cannot insert or delete projects. Projects are kept.
- Private Storage bucket `plan-pdfs`. Read is limited to the owner's folder. Upload and replace require an open edit window. Files are `{user id}/{project id}.pdf`, up to 20 MB.

Prices are not a column. On open, the page resolves each device to the current catalog key and drops any stored price, dealer, or `fr` field.

## Stripe (test mode)

1. Use a test-mode secret key (`sk_test_...`). There is no live key yet.
2. Webhook endpoint: `https://YOUR_PAGES_HOST/api/stripe-webhook`
   - Event: `checkout.session.completed`
   - The function checks the `Stripe-Signature` header. A bad signature is rejected.
3. Put that endpoint's signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Card for a test purchase: `4242 4242 4242 4242`, any future date, any CVC, any ZIP. Do not collect a shipping address. Stripe emails the receipt to the account email. That email is not copied into `projects` or `entitlements`.

Checkout uses `price_data`, so you do not create a Price in the Dashboard. Change `YT_SINGLE_USE_PRICE_CENTS` and redeploy the Pages env (no repo change) to try another amount.

Flow:

1. Sign in with an email link, then `POST /api/checkout`. No project row is written yet. If this user already has an open Checkout for the same purpose, that URL is returned instead of a second charge.
2. `checkout.session.completed` with `payment_status = paid` creates the project (room names and good or better only, when the quote sent them) and one `single_use` entitlement, with `edit_until` set to now + 30 days.
3. The return URL calls `POST /api/checkout/confirm`, which reads the Checkout Session from Stripe and applies the same grant if the webhook has not landed yet. A second call with the same session does not extend the window again.
4. The browser opens that project. Uploads are allowed only while `edit_until` is still ahead.

While a window is already open, Checkout is not started again. Paying after it expires sets a new `edit_until` of now + 30 days (the later of the old timestamp and the new one, so a replay cannot shorten it).

Local Wrangler check, from the repo root, with a gitignored `.dev.vars` file holding the same variable names:

```bash
npx wrangler pages dev . --port 8788
```

Server logic without Stripe or Supabase:

```bash
node --test functions/_lib/billing.test.mjs
```

## What the client sees

- With no purchase, the page is a purchase screen: one project, every floor, 30 days of editing, kept to view, pay again to edit, and the price from `YT_SINGLE_USE_PRICE_CENTS`.
- Sign in emails a link. No password. After the link, Checkout starts when they came from `/layout/buy` or `?buy=1`.
- An open edit window goes straight into the tool. An expired project opens view only, with **Unlock editing**.
- The priced quote download is available during the open window.
- The old preview password no longer blocks the page. Payment is the gate.
