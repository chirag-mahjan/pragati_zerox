import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "src", "data", "updates.json");
const userAgent = "PragatiXeroxUpdater/1.0 (Andada shop notice board; one public read per source)";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const schemeGroups = [
  { id: "health", title: "Health", items: ["Ayushman card activation and printing"] },
  { id: "labor", title: "Labor", items: ["E-Shram card registration"] },
  { id: "family", title: "Family", items: ["New ration card", "Duplicate ration card"] },
  {
    id: "certificates",
    title: "Certificates",
    items: [
      "Income certificate (આવક દાખલો)",
      "Caste certificate (જ્ઞાતિ દાખલો)",
      "Residence certificate (રહેઠાણ દાખલો)",
    ],
  },
  {
    id: "business",
    title: "Business",
    items: [
      "GST registration and filing",
      "UDYAM / MSME",
      "FSSAI",
      "Driving licence form assistance",
      "Vehicle insurance",
    ],
  },
];

const sampleExams = [
  { name: "GPSC Class 1 & 2", qualification: "Graduate", date: "December 15, 2026", source: "Sample layout", url: "" },
  { name: "GSSSB Clerk & Assistant", qualification: "12th Pass / Graduate", date: "January 05, 2027", source: "Sample layout", url: "" },
  { name: "Indian Railways (RRB)", qualification: "10th / ITI / Diploma", date: "December 28, 2026", source: "Sample layout", url: "" },
  { name: "Gujarat Police Bharti", qualification: "12th Pass", date: "January 20, 2027", source: "Sample layout", url: "" },
].map((exam) => ({ ...exam, action: "Apply At Shop", sample: true }));

const sampleTicker = [
  { text: "PM Shram Yogi Maandhan Yojana", source: "Sample", url: "", sample: true },
  { text: "Gujarat Police Bharti 2026", source: "Sample", url: "", sample: true },
];

function decode(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatParts(day, month, year, extra = "") {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || m < 1 || m > 12 || y < 2000) return "";
  return `${d} ${months[m - 1]} ${y}${extra ? ` ${extra.trim()}` : ""}`;
}

function qualificationFrom(title) {
  const match = title.match(/Class-\s*\d+/i);
  if (!match) return "See the official advertisement";
  return `${match[0].replace(/\s+/, "")} post. Other conditions are in the official advertisement.`;
}

async function grab(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      ...options,
      headers: { "User-Agent": userAgent, "Accept-Language": "en", ...(options.headers || {}) },
      signal: controller.signal,
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, url: response.url, text, headers: response.headers };
  } finally {
    clearTimeout(timer);
  }
}

function sourceResult(id, name, url, ok, count, note) {
  return { id, name, url, ok, count, note };
}

async function fetchGpsc() {
  const pageUrl = "https://gpsc.gujarat.gov.in/RecruitmentOpen";
  const response = await grab(pageUrl);
  if (!response.ok) {
    return { exams: [], source: sourceResult("gpsc", "GPSC", pageUrl, false, 0, `HTTP ${response.status}`) };
  }
  const rows = [...response.text.matchAll(/<tr>\s*<td>\s*([^<]+?)\s*<\/td>\s*<td>\s*<a href="([^"]+)"[^>]*>\s*([\s\S]*?)<\/a>\s*<\/td>\s*<td>\s*([^<]*?)\s*<\/td>\s*<td[^>]*>\s*([^<]*?)\s*<\/td>/gi)];
  const exams = rows.slice(0, 12).map((row) => {
    const name = decode(row[3]);
    const href = row[2].startsWith("http") ? row[2] : new URL(row[2], pageUrl).href;
    const dateMatch = decode(row[5]).match(/(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(.+))?/);
    return {
      name: `GPSC ${decode(row[1])}: ${name}`,
      qualification: qualificationFrom(name),
      date: dateMatch ? formatParts(dateMatch[1], dateMatch[2], dateMatch[3], dateMatch[4] || "") : "See the official advertisement",
      action: "Apply At Shop",
      sample: false,
      source: "Gujarat Public Service Commission",
      url: href,
    };
  });
  return {
    exams,
    source: sourceResult("gpsc", "GPSC", pageUrl, exams.length > 0, exams.length, exams.length ? "Open recruitment table" : "Page loaded, but the open-recruitment table was empty"),
  };
}

async function fetchEmploymentNews() {
  const pageUrl = "https://employmentnews.gov.in/newemp/home.aspx";
  const response = await grab(pageUrl);
  if (!response.ok) {
    return { exams: [], source: sourceResult("employment-news", "Employment News", pageUrl, false, 0, `HTTP ${response.status}`) };
  }
  const orgs = [...response.text.matchAll(/RepDetails_Label3_\d+"[^>]*>([\s\S]*?)<\/span>/g)].map((match) => decode(match[1]));
  const posts = [...response.text.matchAll(/RepDetails_Label4_\d+"[^>]*>([\s\S]*?)<\/span>/g)].map((match) => decode(match[1]));
  const methods = [...response.text.matchAll(/RepDetails_Label5_\d+"[^>]*>([\s\S]*?)<\/span>/g)].map((match) => decode(match[1]));
  const dates = [...response.text.matchAll(/RepDetails_Label6_\d+"[^>]*>([\s\S]*?)<\/span>/g)].map((match) => decode(match[1]));
  const exams = orgs.slice(0, 8).map((org, index) => {
    const dateMatch = (dates[index] || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    const method = methods[index] ? ` Appointment method on the listing: ${methods[index]}.` : "";
    return {
      name: `${posts[index] || "Recruitment"}, ${org}`,
      qualification: `See the official notice.${method}`,
      date: dateMatch ? formatParts(dateMatch[1], dateMatch[2], dateMatch[3]) : "See the official notice",
      action: "Apply At Shop",
      sample: false,
      source: "Employment News",
      url: pageUrl,
    };
  }).filter((exam) => exam.name.trim() !== ",");
  return {
    exams,
    source: sourceResult(
      "employment-news",
      "Employment News",
      pageUrl,
      exams.length > 0,
      exams.length,
      "Public job-highlights table only. The paid e-paper is not copied.",
    ),
  };
}

async function fetchGsssb() {
  const pageUrl = "https://gsssb.gujarat.gov.in/Notification";
  const page = await grab(pageUrl);
  if (!page.ok) {
    return { exams: [], source: sourceResult("gsssb", "GSSSB", pageUrl, false, 0, `HTTP ${page.status}`) };
  }
  const token = page.text.match(/name="AntiforgeryFieldname"[^>]*value="([^"]+)"/)?.[1];
  const cookie = typeof page.headers.getSetCookie === "function"
    ? page.headers.getSetCookie().map((item) => item.split(";")[0]).join("; ")
    : "";
  if (!token || !cookie) {
    return { exams: [], source: sourceResult("gsssb", "GSSSB", pageUrl, false, 0, "The public page did not include the token its own list uses") };
  }
  const body = new URLSearchParams({
    AntiforgeryFieldname: token,
    txtSearch: "",
    ddlExam: "0",
    ddlYear: "0",
    ddlDepartment: "0",
    Betch: "8",
    pageCount: "8",
    currentPage: "1",
    prop: "",
    asc: "true",
  });
  const response = await grab("https://gsssb.gujarat.gov.in/SearchNotificationResult", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
      Referer: pageUrl,
      "X-Requested-With": "XMLHttpRequest",
    },
    body,
  });
  if (!response.ok) {
    return { exams: [], source: sourceResult("gsssb", "GSSSB", pageUrl, false, 0, `List request HTTP ${response.status}`) };
  }
  let payload;
  try {
    payload = JSON.parse(response.text);
  } catch {
    return { exams: [], source: sourceResult("gsssb", "GSSSB", pageUrl, false, 0, "List response was not JSON") };
  }
  const rows = Array.isArray(payload.civilListOfOfficerMasterModels) ? payload.civilListOfOfficerMasterModels : [];
  const exams = rows.slice(0, 8).map((row) => {
    const published = typeof row.publishDate === "string" ? row.publishDate : "";
    const dateMatch = published.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    return {
      name: `GSSSB ${row.advertisementNo || ""}: ${decode(String(row.examName || "Advertisement"))}`.replace(/\s+/g, " ").trim(),
      qualification: "See the official advertisement",
      date: dateMatch ? `Published ${formatParts(dateMatch[1], dateMatch[2], dateMatch[3])}. Last date is on the notice.` : "See the official advertisement",
      action: "Apply At Shop",
      sample: false,
      source: "Gujarat Subordinate Service Selection Board",
      url: pageUrl,
    };
  });
  return {
    exams,
    source: sourceResult("gsssb", "GSSSB", pageUrl, exams.length > 0, exams.length, "Public notification search, first page"),
  };
}

async function fetchPib() {
  const pageUrl = "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3";
  const response = await grab(pageUrl, { headers: { Accept: "application/rss+xml, application/xml, text/xml" } });
  if (!response.ok) {
    return { notices: [], source: sourceResult("pib", "Press Information Bureau", pageUrl, false, 0, `HTTP ${response.status}`) };
  }
  const keyword = /योजना|आयुष्मान|ई[-\s]?श्रम|राशन कार्ड|उद्यम|छात्रवृत्ति|scheme|ayushman|e-?shram|ration card|udyam|pm-?jay|fssai/i;
  const items = [...response.text.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  const notices = [];
  for (const item of items) {
    const title = decode(item[1].match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
    const link = decode(item[1].match(/<link>([\s\S]*?)<\/link>/)?.[1] || "");
    if (!title || title === "Press Information Bureau" || !keyword.test(title)) continue;
    notices.push({
      title,
      source: "Press Information Bureau",
      url: link || response.url,
      sample: false,
    });
    if (notices.length === 6) break;
  }
  const languageNote = response.url.includes("Lang=2")
    ? "The official feed redirected to Hindi from this network."
    : "Official press-release RSS.";
  return {
    notices,
    source: sourceResult("pib", "Press Information Bureau", response.url || pageUrl, true, notices.length, languageNote),
  };
}

async function noteEmptyRrb() {
  const pageUrl = "https://rrb.indianrailways.gov.in/mumbai/whatsNew?contentType=page";
  try {
    const response = await grab(pageUrl, {
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        Referer: "https://rrb.indianrailways.gov.in/mumbai",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    const empty = !response.text.trim();
    return sourceResult(
      "rrb",
      "RRB",
      "https://rrb.indianrailways.gov.in/mumbai",
      false,
      0,
      empty
        ? "The public Mumbai notice endpoint returned an empty body, so no railway row was imported. rrbcdg.gov.in did not connect on an earlier check."
        : `Unexpected response HTTP ${response.status}, length ${response.text.length}. Rows were not imported.`,
    );
  } catch (error) {
    return sourceResult("rrb", "RRB", "https://rrb.indianrailways.gov.in/mumbai", false, 0, error.message);
  }
}

function skippedSources() {
  return [
    sourceResult(
      "gprb",
      "Gujarat Police Recruitment Board",
      "https://gprb.gujarat.gov.in/",
      false,
      0,
      "The public homepage repeats undated template lines and does not expose a stable notice table. No police row was invented.",
    ),
    sourceResult(
      "myscheme",
      "myScheme",
      "https://api.myscheme.gov.in/search/v6/schemes",
      false,
      0,
      "The JSON endpoint answers Unauthorized without a client key. The key is not used here, and the request is not sent with a spoofed Origin.",
    ),
  ];
}

function tickerFrom(exams, notices) {
  const lines = [];
  for (const exam of exams) {
    if (exam.sample) continue;
    const shortDate = exam.date.startsWith("See") ? "" : ` — ${exam.date.replace(/\s+\d{1,2}:\d{2}\s*(AM|PM)/i, "")}`;
    lines.push({ text: `${exam.name}${shortDate}`.slice(0, 180), source: exam.source, url: exam.url, sample: false });
    if (lines.length === 8) break;
  }
  for (const notice of notices) {
    if (lines.length === 10) break;
    lines.push({ text: notice.title.slice(0, 180), source: notice.source, url: notice.url, sample: false });
  }
  return lines;
}

async function main() {
  let previous = { exams: [] };
  try {
    previous = JSON.parse(await readFile(outPath, "utf8"));
  } catch {
    previous = { exams: [] };
  }

  const jobs = [];
  const run = async (label, fn) => {
    try {
      return await fn();
    } catch (error) {
      return { exams: [], notices: [], source: sourceResult(label, label, "", false, 0, error.message) };
    }
  };

  jobs.push(await run("gpsc", fetchGpsc));
  jobs.push(await run("employment-news", fetchEmploymentNews));
  jobs.push(await run("gsssb", fetchGsssb));
  const pib = await run("pib", fetchPib);
  const rrb = await noteEmptyRrb();

  const freshExams = jobs.flatMap((job) => job.exams || []);
  const failedIds = new Set(jobs.filter((job) => !job.source?.ok).map((job) => job.source.id));
  const kept = (previous.exams || []).filter((exam) => !exam.sample && failedIds.has(examSourceId(exam)) && !freshExams.some((item) => item.name === exam.name));
  let exams = [...freshExams, ...kept];
  if (exams.length === 0) exams = sampleExams;

  const notices = pib.notices || [];
  const ticker = tickerFrom(exams, notices);
  const updates = {
    fetchedAt: new Date().toISOString(),
    ticker: ticker.length ? ticker : sampleTicker,
    schemes: { groups: schemeGroups, notices },
    exams,
    sources: [...jobs.map((job) => job.source), pib.source, rrb, ...skippedSources()].filter(Boolean),
  };

  await writeFile(outPath, `${JSON.stringify(updates, null, 2)}\n`);
  const real = exams.filter((exam) => !exam.sample).length;
  console.log(`Wrote ${outPath}`);
  console.log(`Exams: ${exams.length} (${real} fetched). Scheme notices: ${notices.length}.`);
  for (const source of updates.sources) {
    console.log(`${source.ok ? "ok" : "skip"} ${source.name}: ${source.count} — ${source.note}`);
  }
}

function examSourceId(exam) {
  const source = exam.source || "";
  if (source.includes("Public Service")) return "gpsc";
  if (source.includes("Employment News")) return "employment-news";
  if (source.includes("Subordinate")) return "gsssb";
  return "";
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
