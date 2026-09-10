# Roamly Holidays

A holiday-packages marketplace: browse curated trip packages, compare and wishlist them, build a fully custom itinerary, and book — all in one flexible, engaging website. Includes a real backend (Supabase) and an `/admin` panel for managing the catalogue and incoming leads.

## Highlights

- **Home** — animated hero with a full search widget (destination autocomplete, dates, travelers), trending destinations, featured packages with live category filters, countdown-timer flash deals, "how it works", supplier network, testimonials.
- **Explore** — filterable/sortable package catalogue (category, price, duration, rating, destination), grid/list views, shareable URL filters.
- **Package Detail** — gallery, tabbed overview/itinerary/inclusions/reviews/supplier/FAQs, sticky booking widget with date + traveler selection and live pricing.
- **Build Your Trip** — a step-by-step custom itinerary builder: pick destinations and days, travel style, add-ons, live price estimate, then submit a quote request.
- **Checkout** — multi-step booking flow (review → traveler details → add-ons → payment) ending in a confirmation page with a booking ID.
- **Wishlist / Compare** — save packages and compare up to 3 side by side.
- **Suppliers** — showcases the online + offline supplier network and includes a "Become a Partner" application form.
- **Dashboard** — mock auth, booking history, custom quote requests, wishlist summary.
- Destinations directory, Deals page, About, Contact (with FAQ), and a floating WhatsApp button + mobile bottom nav.
- **`/admin`** — a login-gated panel where you can add/edit/delete packages, destinations, suppliers and deals, and see/act on every booking, custom trip quote, contact message and supplier partner application that comes in.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- React Router v7
- Framer Motion for entrance animations
- **Supabase** (Postgres + Auth) for the database and admin login
- **Vercel serverless functions** (`/api`) for anything that writes data or needs to stay secret
- Wishlist and compare-list stay in `localStorage` (per-visitor UI convenience) — everything else (packages, bookings, quotes, messages, applications) lives in the database once it's connected.

**Without Supabase configured**, the site still works exactly as before — it falls back to the demo catalogue in `src/data/*.ts`, and the admin login page shows a setup notice instead of a login form. This means you can develop and deploy immediately, then wire up the backend whenever you're ready.

## Backend setup (do this once)

1. **Create a free Supabase project** at [supabase.com](https://supabase.com).
2. **Run the schema**: open your project's SQL Editor and paste the contents of `supabase/schema.sql`, then run it. This creates all the tables and Row Level Security policies.
3. **Seed the demo catalogue** (optional but recommended, so the site isn't empty): from your machine, run
   ```bash
   npm install
   SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your-service-role-key npx tsx scripts/seed.ts
   ```
   Get both values from Supabase Dashboard → Project Settings → API. This is idempotent — safe to re-run any time.
4. **Create your admin login**: Supabase Dashboard → Authentication → Users → Add user. Use your own email and a strong password. Also go to Authentication → Settings and turn **off** "Allow new user signups" — this app treats any account that can sign in as an admin, so it should only ever be you (and anyone else you explicitly add the same way).
5. **Add environment variables** in your Vercel project (Settings → Environment Variables) — or in a local `.env.local` for development (see `.env.example`):
   - `VITE_SUPABASE_URL` — your project URL (safe to expose to the browser)
   - `VITE_SUPABASE_ANON_KEY` — your anon public key (safe to expose to the browser)
   - `SUPABASE_SERVICE_ROLE_KEY` — **never** prefix this with `VITE_`. It must stay server-side only; the `/api` functions use it to bypass Row Level Security for writes. Don't commit it, don't put it in a `VITE_` variable, don't paste it anywhere public.
6. **Redeploy.** Once the env vars are set, visit `/admin/login` on your live site and sign in.

## Development

```bash
npm install
npm run dev       # start dev server
npm run build     # type-check + production build
npm run preview   # preview the production build
npm run lint       # oxlint
```

Note: the `/api` serverless functions only run when deployed on Vercel (or via `vercel dev` locally) — `npm run dev` serves the frontend only. The public site still works locally without them (falls back to demo data); admin writes and the public forms (checkout, contact, supplier applications, trip quotes) need `vercel dev` or a real deployment to actually reach the database.

## Notes

- All imagery is hotlinked from Unsplash. Swap the `image` fields (in `src/data/*.ts` for the demo data, or directly in `/admin` once connected) for your own brand photography before going live.
- Payments and the customer-facing login/signup flow are still mocked for demo purposes — the admin side is real, but wiring up an actual payment gateway and customer accounts is a separate step.
- Testimonials on the homepage are static marketing copy (`src/data/testimonials.ts`) — edit that file directly to change them.
