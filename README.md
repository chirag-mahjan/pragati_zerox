# PRAGATI DIGITAL & XEROX CENTER

View-only site for the shop at Rohini Park, Andada. Visitors can read services, schemes, and exam notices, then call or walk in. There is no application form, payment, or customer account.

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

That runs `scripts/fetch-updates.mjs` and rewrites `src/data/updates.json`. Phone, hours, and address stay in `src/data/site.ts`. See [UPDATES.md](UPDATES.md) for the sources and a daily schedule.

## Build

```
npm run build
```

The static site is written to `dist/`.
