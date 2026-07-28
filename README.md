# 🚌 Tedbus

<p align="center">
  <a href="https://github.com/">
    <img src="https://img.shields.io/badge/GitHub-Explore%20the%20project-181717?logo=github&logoColor=white" alt="GitHub" />
  </a>
  <img src="https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white" alt="Angular 21" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.9" />
</p>

Tedbus is a responsive Angular single-page application that demonstrates an online bus-ticket booking journey. It recreates the core user experience of searching routes, reviewing a bus, choosing seats, entering traveller details, and viewing a payment summary.

> This repository currently contains the frontend only. Its routes, buses, fares, and profile data are demo data; no backend, authentication, persistence, or payment gateway is connected.

## ✨ Features

- Search from a curated set of origin and destination cities with a Material date picker.
- Display available demo routes in a dialog when the selected journey is not supported.
- Browse a bus-results page with route context, filters, sorting controls, safety messaging, and bus details.
- Expand bus detail tabs for amenities, boarding information, policies, and seat selection.
- Select available seats from a 40-seat layout and see the running fare total.
- Collect passenger and contact details in a booking drawer, with optional business-travel and insurance selections.
- Navigate to a payment-summary experience offering card, wallet, net-banking, and UPI UI options.
- Provide a profile area with My Trips, profile, and wallet views.
- Use responsive layouts, Angular Material components, Tailwind CSS utilities, and local visual assets.

## 🛠️ Technology

| Area | Tools |
| --- | --- |
| Framework | Angular 21 with TypeScript 5.9 |
| UI | Angular Material and Tailwind CSS 4 |
| Routing and forms | Angular Router and template-driven forms |
| Build tooling | Angular CLI / `@angular/build` |
| Testing | Vitest with jsdom via Angular CLI |
| Package manager | pnpm lockfile (npm scripts are also available) |

## 🗂️ Project layout

```text
.
├── README.md
└── frontend/
    ├── public/assets/              # Logos, hero image, and offer artwork
    ├── src/
    │   ├── app/
    │   │   ├── Components/
    │   │   │   ├── landing-page/   # Search hero, offers, FAQ, route dialog
    │   │   │   ├── select-bus-page/ # Results, filters, bus card, seats, booking form
    │   │   │   ├── payment-page/   # Payment options and booking summary
    │   │   │   ├── profile-page/   # Trips, profile, and wallet views
    │   │   │   ├── navbar/         # Global navigation
    │   │   │   └── footer/         # Global footer
    │   │   ├── app-module.ts       # Root Angular module
    │   │   └── app-routing-module.ts
    │   ├── angular.json            # Angular build/serve/test configuration
    │   ├── package.json            # Scripts and dependencies
    │   └── pnpm-lock.yaml          # Locked dependency tree
```

## 🚀 Getting started

### 📋 Prerequisites

- A current Node.js LTS release compatible with Angular 21.
- [pnpm](https://pnpm.io/), recommended because the repository includes `pnpm-lock.yaml`; npm can also run the provided scripts.

### ▶️ Install and run

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm start
```

Open `http://localhost:4200/` in your browser. The dev server reloads when source files change.

If you prefer npm, run `npm install` and then `npm start` from `frontend/`.

## ⌨️ Available commands

Run these from the `frontend/` directory.

| Command | Purpose |
| --- | --- |
| `pnpm start` | Start the Angular development server. |
| `pnpm build` | Create an optimized production build in `dist/`. |
| `pnpm watch` | Rebuild in development mode when files change. |
| `pnpm test` | Run the Angular/Vitest unit-test suite. |
| `pnpm ng -- <command>` | Invoke Angular CLI commands directly. |

## 🧭 Application routes

| Path | View |
| --- | --- |
| `/` | Landing page and bus search |
| `/select-bus` | Bus results and seat-selection flow |
| `/payment/...` | Payment options and booking summary; parameters are passed by the booking form |
| `/profile` | Account dashboard and trip/profile placeholders |

## 🎟️ Booking flow

```text
Landing search → Bus results → Bus details → Seat selection
      → Traveller form → Payment summary
```

Supported demo journeys include Delhi–Jaipur, Mumbai–Goa, Bangalore–Mysore, Kolkata–Darjeeling, and Chennai–Pondicherry. Other origin/destination combinations surface an availability dialog rather than navigating to results.

## 🧑‍💻 Development notes

- Components are declared in a module-based Angular application (`AppModule`), not standalone components.
- Angular Material provides the menus, date picker, dialogs, table, drawer, divider, list, and icons; the primary responsive layout is styled with Tailwind utilities and component CSS.
- The current bus-results page renders a single hard-coded `TravelXpress` sleeper bus for the Delhi–Jaipur route context. Filter and sort controls are presentational at this stage.
- The payment view is UI-only. No payment action is wired to Stripe or the listed payment methods.
- Existing component tests are basic creation tests. Add behavioural and integration coverage before production use.

## 🔒 Production considerations

To evolve this prototype into a production product, add a backend/API layer for route search, operator inventory, seat locks, booking records, authentication, and payments. Validate all traveller inputs, preserve booking state safely across navigation, replace placeholder data, and integrate a PCI-compliant payment provider.
