# Layout Tool: account save and single-use editing

The Layout Tool at `/layout-beta/` still works in the browser with no account. Save downloads a project file, and the last layout stays in this browser (localStorage and IndexedDB). Instant Quote (`/qualify/`) is unchanged and stays free.

One payment unlocks **one project**, including every floor and page in it:

- Save it to the account and open it on any device.
- Edit it for 30 days.
- Export the priced quote.

After 30 days the project stays in the account and can be viewed, but edits are rejected in the page and in the database. Paying again opens another 30 days and reprices every line from the current list-price catalog. The catalog in `layout-beta/index.html` is list price only. Dealer cost is not stored and is not shown.

A later dealer subscription can grant access by inserting `entitlements.kind = 'subscription'` and setting `projects.edit_until`. That billing is not built here.

If the environment variables below are missing, the page stays usable and cloud actions say **Payments not configured**.

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

1. The signed-in client calls `POST /api/checkout` with the project id and project name. The function creates the project row if needed (empty layout, `edit_until` null) and opens Stripe Checkout.
2. `checkout.session.completed` with `payment_status = paid` sets `edit_until` to now + 30 days and writes one `single_use` entitlement.
3. The return URL calls `POST /api/checkout/confirm`, which reads the Checkout Session from Stripe and applies the same grant if the webhook has not landed yet. A second call with the same session does not extend the window again.
4. The browser then uploads the layout and the floor-plan PDF. That update is allowed only while `edit_until` is still ahead.

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

- **Save** downloads a project file. It stays free.
- **Save to account**, **Projects**, and **Quote** need a paid, open edit window.
- **Sign in** emails a link. No password.
- A locked project shows **Unlock editing** and ignores edits. Pan, zoom, and page changes still work.
- The quote is an HTML file of current list prices. It is an estimate, not an invoice.
