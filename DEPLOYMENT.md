# Tym Website — Deployment Guide

The `website/` folder is a complete, deploy-ready static site. Push it to GitHub, connect Cloudflare Pages, point a domain at it, done.

## What's in here

```
website/
├── index.html               → tymhomes.com/
├── design-service/          → tymhomes.com/design-service
├── theater/                 → tymhomes.com/theater
├── club/                    → tymhomes.com/club
├── about/                   → tymhomes.com/about
├── dealer/                  → tymhomes.com/dealer
└── free-bundle/             → tymhomes.com/free-bundle
```

All internal links use absolute paths (`/design-service`, `/theater`, etc.) that work natively with Cloudflare Pages folder-based routing. No build step required.

## Deployment in 30 minutes

### Step 1 — Create the GitHub repo (5 min)

1. Go to github.com and create a new repo. Suggested name: `tym-website`. Private is fine.
2. From terminal:
```bash
cd ~/Documents/Claude/Projects/Tym/website
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tym-website.git
git push -u origin main
```

### Step 2 — Connect Cloudflare Pages (10 min)

1. Login to Cloudflare → Workers & Pages → Create → Pages → Connect to Git
2. Select your GitHub account, authorize, then pick the `tym-website` repo
3. Build settings: leave EVERYTHING blank
   - Framework preset: None
   - Build command: (empty)
   - Build output directory: `/`
4. Click "Save and Deploy"
5. Within 30 seconds you'll have a live URL like `tym-website-abc.pages.dev` — that's your staging URL

### Step 3 — Custom subdomain for staging (5 min)

In the Cloudflare Pages project:
1. Custom domains → Set up a custom domain
2. Enter `new.tymhomes.com`
3. Cloudflare auto-creates the DNS record (since tymhomes.com is already on Cloudflare)
4. Wait 1–2 minutes for SSL
5. Now `new.tymhomes.com` shows the new site, while the existing `tymhomes.com` keeps running on WPEngine

### Step 4 — Iterate (live, fast)

Any commit to GitHub auto-deploys to Cloudflare Pages within 30 seconds. To make a change:
1. Edit the HTML file (locally, in Cursor/VS Code, or directly in GitHub's web editor)
2. Commit and push
3. Refresh the live URL

For non-trivial changes, come back here and I'll regenerate the page.

### Step 5 — Go live (when ready)

When the new site is approved:
1. In Cloudflare Pages, add `tymhomes.com` and `www.tymhomes.com` as custom domains
2. Cloudflare updates the DNS records automatically
3. WPEngine site goes dark on the next DNS resolution (1–5 min)

## Things to add after deployment

### PostHog analytics + A/B testing (15 min, free)

1. Sign up at posthog.com
2. Create a project, get the snippet
3. Add this `<script>` tag to the `<head>` of every HTML file (or just the homepage to start):
```html
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){...
  posthog.init('YOUR_API_KEY', { api_host: 'https://us.i.posthog.com' })
</script>
```
(Get the actual snippet from PostHog's onboarding flow — it auto-generates with your key)

Then in PostHog you can set up Web Experiments — visually click any element, define variants, see traffic splits and conversions. No code per experiment.

### Kit (ConvertKit) for the email form (30 min)

1. Sign up at kit.com
2. Create a Form (visual builder, takes 5 min)
3. Get the form's POST endpoint (Settings → Embed)
4. In `free-bundle/index.html`, find both `<form action="#">` tags (there are two — hero form and bottom CTA form)
5. Replace `action="#"` with the Kit POST URL
6. Build a 7-email welcome sequence in Kit that delivers the bundle PDF in email #1 and warms toward Design Service in email #6

### Stripe Payment Links for Design Service tiers (15 min)

1. In your Stripe dashboard → Payment Links → Create
2. Make one Payment Link per tier ($497 Blueprint, $997 Blueprint+Strategy, $1,997 Whole-Home)
3. In `design-service/index.html`, find each `<a href="#" class="btn ...">` button on the pricing tiers
4. Replace `href="#"` with the Stripe Payment Link URL for that tier
5. Repeat for Theater Design tiers in `theater/index.html`
6. Repeat for Smart Home Club in `club/index.html`

### Real images (1–2 hours)

The pages have placeholders like `[Photo of Greg + Matt]`, `[Boca Raton theater install photo]`, etc. To swap in real images:

1. Drop image files into `website/images/` (create the folder)
2. Find the placeholder div in each HTML file (search for `[Photo` or `[Boca`)
3. Replace the styled div with an `<img src="/images/your-file.jpg" alt="...">` tag
4. Match the image to the surrounding card dimensions

Highest-priority images to get real:
- Greg + Matt photo (used on Homepage, Design Service, Theater, Club, About — 5 pages)
- Boca Raton theater photo (Design Service + Theater)
- Sample theater design diagram (Theater "What You Get" section)
- Sample design deliverable / floor plan (Lead Magnet form card)

## Domain options

- **Stay on GoDaddy domain registration, route DNS through Cloudflare** (current setup) — works fine, do nothing
- **Transfer domain to Cloudflare Registrar** — at-cost pricing, no markup, slightly cleaner. Optional, not urgent.

## What NOT to do

- Don't use the Cloudflare WAF "Under Attack" mode unless you actually need it. It serves a CAPTCHA and crushes conversion.
- Don't enable Cloudflare's "Auto Minify" for HTML — it can break the inline CSS. Disable it under Speed → Optimization.
- Don't connect a Cloudflare Worker unless you need server-side logic — the site is fully static.

## Support

If you get stuck on any step, come back here and I'll walk through it. The Cloudflare Pages docs are also genuinely good: https://developers.cloudflare.com/pages/

