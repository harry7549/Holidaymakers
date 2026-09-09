# Roamly Holidays

A holiday-packages marketplace: browse curated trip packages, compare and wishlist them, build a fully custom itinerary, and book — all in one flexible, engaging website.

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

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- React Router v7
- Framer Motion for entrance animations
- All state (wishlist, compare list, bookings, quote requests, mock auth) persists to `localStorage` — there is no backend; data is mocked in `src/data`.

## Development

```bash
npm install
npm run dev       # start dev server
npm run build     # type-check + production build
npm run preview   # preview the production build
npm run lint       # oxlint
```

## Notes

- All imagery is hotlinked from Unsplash. Swap `src/data/*.ts` image URLs for your own brand photography before going live.
- Payments, email delivery, and the login/signup flow are mocked for demo purposes — wire up a real backend (auth, payments, supplier inventory API) before launch.
