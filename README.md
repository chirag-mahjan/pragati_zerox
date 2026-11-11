# PRAGATI DIGITAL & XEROX CENTER

View-only site for the shop at Shop 8, Rohini Park, Andada, Ankleshwar, Bharuch, Gujarat, 393010. Visitors can read services, schemes, and exam notices, then call or walk in. There is no application form, payment, or customer account.

## Run it on this laptop

```
npm install
npm run dev
```

Open [http://127.0.0.1:4321/](http://127.0.0.1:4321/).

Pages: `/`, `/services`, `/government-schemes`, `/exam-notifications`, `/contact`.

## Refresh exams and schemes

```
npm run update
```

That runs `scripts/fetch-updates.mjs` and rewrites `src/data/updates.json`. Phone, hours, and address stay in `src/data/site.ts`.

Every morning, `scripts/daily-update.ps1` fetches the five-state notices and rebuilds `dist`. The laptop has to be on. A page someone already has open does not phone the government sites itself. See [UPDATES.md](UPDATES.md).

## Build

```
npm run build
```

The static site is written to `dist/`.
