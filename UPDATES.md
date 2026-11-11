# How exam and scheme lists stay current

Phone, hours, and address live in `src/data/site.ts`. They are not written by this fetch.

`node scripts/fetch-updates.mjs` reads public pages and writes `src/data/updates.json`. The site renders the ticker, scheme groups, scheme notices, and exam rows from that file. The script replaces sample exam rows when a fetch succeeds. If every exam source fails, the sample rows stay and each one is marked sample.

The site does not pull new notices by itself while someone is only looking at a page. A daily job on this computer rewrites `src/data/updates.json`, then rebuilds the static site. The local dev server refreshes when that file changes. A copy already published as plain files changes only after `npm run build`. Nothing is pushed to GitHub by this job, so a public URL stays as it was until someone publishes the new `dist` folder.

`scripts/daily-update.ps1` runs both steps from this folder. The scheduled task **Pragati notice update** on this computer runs it every day at 8:00 AM India time. The next run is 12 November 2026 at 8:00 AM. The computer has to be on and someone has to be logged in, because the task is set to run only when a user is logged on. To run it by hand:

```
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\daily-update.ps1
```

The script makes one read per source, identifies itself as `PragatiXeroxUpdater/1.0`, and does not log in, solve a CAPTCHA, or send a spoofed Origin.

States watched: Gujarat, Maharashtra, Uttar Pradesh, Bihar, and Madhya Pradesh. A state with no public list stays empty. The script does not invent a row for it.

## Sources used

| Source | What is read | Why it is included |
| --- | --- | --- |
| GPSC open recruitments | `https://gpsc.gujarat.gov.in/RecruitmentOpen` | Gujarat. Official HTML table: advertisement number, post, posts, last apply date |
| GSSSB notifications | `https://gsssb.gujarat.gov.in/Notification` then the same page’s public search | Gujarat. Official first page of advertisements. The listing does not include a last date, so the row says the date is on the notice |
| MPPSC advertisements | `https://mppsc.mp.gov.in/` | Madhya Pradesh. Latest advertisement PDFs linked on the public homepage. The date is the notice date in the file name |
| UPPSC live advertisements | `https://uppsc.up.nic.in/` | Uttar Pradesh. Live advertisement lines on the public homepage, with the board’s “visible upto” date |
| Employment News job highlights | `https://employmentnews.gov.in/newemp/home.aspx` | National, unless the title names one of the five states. Official public table only |
| Press Information Bureau RSS | `https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3` | Official feed, published for reuse. Only items whose title matches a scheme keyword are kept |

Each kept row stores the source name and URL.

## Sources skipped

- **RRB.** `https://rrb.indianrailways.gov.in/mumbai/whatsNew?contentType=page` is the JSON call the public Mumbai page makes. It returned an empty body. `https://rrbcdg.gov.in/employment-notices.php` and `https://www.rrbbbs.gov.in/notice.php` did not connect. No railway row is invented. The sample “Indian Railways (RRB)” row remains only when every exam source fails.
- **Gujarat Police Recruitment Board.** `https://gprb.gujarat.gov.in/` repeats undated template lines and does not publish a stable notice table on the first HTML response. Those lines are not imported.
- **myScheme.** `https://api.myscheme.gov.in/search/v6/schemes` answers Unauthorized without a client key. The updater does not send a spoofed Origin to get around that.
- **MPSC (Maharashtra).** `https://mpsc.gov.in/` is a JavaScript application. Its public content API answers that a CRC header is missing. That check is not bypassed, so Maharashtra stays empty until the board publishes a plain list.
- **BPSC (Bihar).** `https://bpsc.bihar.gov.in/` did not connect from this network. `onlinebpsc.bihar.gov.in` is a login portal and is not used. No Bihar row is invented.
- **Sarkari Result latest jobs** and **Majhi Naukri current recruitment** are read only as a dated checklist for Gujarat, Maharashtra, Uttar Pradesh, Bihar, and Madhya Pradesh. A row is kept when the title says Online Form and the printed last date is today or later. The shop pages do not link to either site. Majhi Naukri currently returns a browser check, so nothing is copied from it.

Employment News rows are the short facts on the public highlights table. The paid e-paper is not copied. Highlight links that point at `eneversion.nic.in` are not followed; the row links to the highlights page instead.

The shop’s own scheme help (Ayushman, E-Shram, ration card, the three Gujarati certificates, GST, UDYAM, FSSAI, driving licence, vehicle insurance) is the service list in the fetch script. It is rewritten into `updates.json` on every run so the schemes page does not depend on a hand edit. It is not a scrape of eligibility rules.
