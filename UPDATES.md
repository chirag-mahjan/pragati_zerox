# How exam and scheme lists stay current

Phone, hours, and address live in `src/data/site.ts`. They are not written by this fetch.

`node scripts/fetch-updates.mjs` reads public pages and writes `src/data/updates.json`. The site renders the ticker, scheme groups, scheme notices, and exam rows from that file. The script replaces sample exam rows when a fetch succeeds. If every exam source fails, the sample rows stay and each one is marked sample.

Run it once a day, before the shop opens, from this folder:

```
node scripts/fetch-updates.mjs
npm run build
```

While `npm run dev` is running, saving `updates.json` refreshes the local site without a build. A published static copy needs the build.

Windows Task Scheduler, daily at 8:00 AM India time, can run the fetch. Rebuild or republish after it if the live site is the `dist` folder:

```
schtasks /Create /TN "Pragati notice update" /SC DAILY /ST 08:00 /TR "cmd /c cd /d C:\Users\TUSHAR\OneDrive\Documents\soumya_projects\pragati_zerox && node scripts\fetch-updates.mjs"
```

The script makes one read per source, identifies itself as `PragatiXeroxUpdater/1.0`, and does not log in, solve a CAPTCHA, or send a spoofed Origin.

## Sources used

| Source | What is read | Why it is included |
| --- | --- | --- |
| GPSC open recruitments | `https://gpsc.gujarat.gov.in/RecruitmentOpen` | Official HTML table: advertisement number, post, posts, last apply date |
| Employment News job highlights | `https://employmentnews.gov.in/newemp/home.aspx` | Official public table: organisation, post, appointment method, last date |
| GSSSB notifications | `https://gsssb.gujarat.gov.in/Notification` then the same page’s public search | Official first page of advertisements. The listing does not include a last date, so the row says the date is on the notice |
| Press Information Bureau RSS | `https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3` | Official feed, published for reuse. Only items whose title matches a scheme keyword are kept |

Each kept row stores the source name and URL.

## Sources skipped

- **RRB.** `https://rrb.indianrailways.gov.in/mumbai/whatsNew?contentType=page` is the JSON call the public Mumbai page makes. It returned an empty body. `https://rrbcdg.gov.in/employment-notices.php` and `https://www.rrbbbs.gov.in/notice.php` did not connect. No railway row is invented. The sample “Indian Railways (RRB)” row remains only when every exam source fails.
- **Gujarat Police Recruitment Board.** `https://gprb.gujarat.gov.in/` repeats undated template lines and does not publish a stable notice table on the first HTML response. Those lines are not imported.
- **myScheme.** `https://api.myscheme.gov.in/search/v6/schemes` answers Unauthorized without a client key. The updater does not send a spoofed Origin to get around that.
- **Job aggregators** such as Sarkari Result and FreeJobAlert are not read. A wrong date copied from a third party is worse than a shorter official list.

Employment News rows are the short facts on the public highlights table. The paid e-paper is not copied. Highlight links that point at `eneversion.nic.in` are not followed; the row links to the highlights page instead.

The shop’s own scheme help (Ayushman, E-Shram, ration card, the three Gujarati certificates, GST, UDYAM, FSSAI, driving licence, vehicle insurance) is the service list in the fetch script. It is rewritten into `updates.json` on every run so the schemes page does not depend on a hand edit. It is not a scrape of eligibility rules.
