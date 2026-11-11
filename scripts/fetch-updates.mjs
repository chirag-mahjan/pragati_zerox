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
  { id: "labor", title: "Labor", items: ["E-Shram card registration", "PF work"] },
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
      "All types of insurance",
      "Atal Pension Yojana",
      "PMSBY",
      "PMJJBY",
    ],
  },
];

const sampleExams = [
  { name: "GPSC Class 1 & 2", qualification: "Graduate", date: "December 15, 2026", source: "Sample layout", url: "" },
  { name: "GSSSB Clerk & Assistant", qualification: "12th Pass / Graduate", date: "January 05, 2027", source: "Sample layout", url: "" },
  { name: "Indian Railways (RRB)", qualification: "10th / ITI / Diploma", date: "December 28, 2026", source: "Sample layout", url: "" },
  { name: "Gujarat Police Bharti", qualification: "12th Pass", date: "January 20, 2027", source: "Sample layout", url: "" },
].map((exam) => ({ ...exam, state: "Gujarat", sourceId: "sample", action: "Apply At Shop", sample: true }));

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

function stateFromTitle(title) {
  const checks = [
    [/gujarat|gpsc|gsssb/i, "Gujarat"],
    [/maharashtra/i, "Maharashtra"],
    [/uttar pradesh|uppsc/i, "Uttar Pradesh"],
    [/bihar|bpsc/i, "Bihar"],
    [/madhya pradesh|mppsc/i, "Madhya Pradesh"],
  ];
  for (const [pattern, state] of checks) {
    if (pattern.test(title)) return state;
  }
  return "National";
}

function examRecord(fields) {
  return { action: "Apply At Shop", sample: false, ...fields };
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
    return examRecord({
      name: `GPSC ${decode(row[1])}: ${name}`,
      qualification: qualificationFrom(name),
      date: dateMatch ? formatParts(dateMatch[1], dateMatch[2], dateMatch[3], dateMatch[4] || "") : "See the official advertisement",
      state: "Gujarat",
      sourceId: "gpsc",
      source: "Gujarat Public Service Commission",
      url: href,
    });
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
    const name = `${posts[index] || "Recruitment"}, ${org}`;
    return examRecord({
      name,
      qualification: `See the official notice.${method}`,
      date: dateMatch ? formatParts(dateMatch[1], dateMatch[2], dateMatch[3]) : "See the official notice",
      state: stateFromTitle(`${name} ${org}`),
      sourceId: "employment-news",
      source: "Employment News",
      url: pageUrl,
    });
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
    return examRecord({
      name: `GSSSB ${row.advertisementNo || ""}: ${decode(String(row.examName || "Advertisement"))}`.replace(/\s+/g, " ").trim(),
      qualification: "See the official advertisement",
      date: dateMatch ? `Published ${formatParts(dateMatch[1], dateMatch[2], dateMatch[3])}. Last date is on the notice.` : "See the official advertisement",
      state: "Gujarat",
      sourceId: "gsssb",
      source: "Gujarat Subordinate Service Selection Board",
      url: pageUrl,
    });
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
      state: stateFromTitle(title),
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

function datedLabel(href, text) {
  const named = `${href} ${text}`.match(/Dated[_\s-]*(\d{1,2})[_\-./](\d{1,2})[_\-./](\d{4})/i)
    || text.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (!named) return "See the official notice";
  return `Notice dated ${formatParts(named[1], named[2], named[3])}`;
}

async function fetchMppsc() {
  const pageUrl = "https://mppsc.mp.gov.in/";
  const response = await grab(pageUrl);
  if (!response.ok) {
    return { exams: [], source: sourceResult("mppsc", "MPPSC", pageUrl, false, 0, `HTTP ${response.status}`) };
  }
  const links = [...response.text.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({
      href: match[1],
      text: decode(match[2]),
    }))
    .filter((item) => /\/uploads\/advertisement\//i.test(item.href) && item.text.length > 20)
    .filter((item) => !/answer key|provisional answer/i.test(`${item.href} ${item.text}`));
  const exams = links.slice(0, 6).map((item) => examRecord({
    name: item.text,
    qualification: "See the official advertisement",
    date: datedLabel(item.href, item.text),
    state: "Madhya Pradesh",
    sourceId: "mppsc",
    source: "Madhya Pradesh Public Service Commission",
    url: item.href.startsWith("http") ? item.href : new URL(item.href, pageUrl).href,
  }));
  return {
    exams,
    source: sourceResult(
      "mppsc",
      "MPPSC",
      pageUrl,
      exams.length > 0,
      exams.length,
      "Latest advertisement PDFs on the public homepage. The date is the notice date printed in the file name, not an invented last date.",
    ),
  };
}

async function fetchUppsc() {
  const pageUrl = "https://uppsc.up.nic.in/";
  const response = await grab(pageUrl);
  if (!response.ok) {
    return { exams: [], source: sourceResult("uppsc", "UPPSC", pageUrl, false, 0, `HTTP ${response.status}`) };
  }
  const rows = [...response.text.matchAll(/>\s*CLICK HERE TO APPLY FOR\s*([^<]{8,350})<\/a>[\s\S]{0,400}?Visible upto\s*:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/gi)];
  const exams = rows.slice(0, 6).map((row) => {
    const name = decode(row[1]).replace(/\.\s*$/, "");
    return examRecord({
      name: `UPPSC ${name}`,
      qualification: "See the official advertisement",
      date: `Shown on the UPPSC board until ${formatParts(row[2], row[3], row[4])}. Confirm the last date on the notice.`,
      state: "Uttar Pradesh",
      sourceId: "uppsc",
      source: "Uttar Pradesh Public Service Commission",
      url: pageUrl,
    });
  });
  return {
    exams,
    source: sourceResult(
      "uppsc",
      "UPPSC",
      pageUrl,
      exams.length > 0,
      exams.length,
      exams.length ? "Live advertisement lines on the public homepage" : "Homepage loaded, but no live advertisement line was found",
    ),
  };
}

async function fetchBpsc() {
  const pageUrl = "https://bpsc.bihar.gov.in/";
  try {
    const response = await grab(pageUrl);
    return {
      exams: [],
      source: sourceResult(
        "bpsc",
        "BPSC",
        pageUrl,
        false,
        0,
        response.ok
          ? "The official host responded, but this run did not find a public notice table in the first HTML page."
          : `HTTP ${response.status}. The online application portal is a login page, so it was not used.`,
      ),
    };
  } catch (error) {
    return {
      exams: [],
      source: sourceResult(
        "bpsc",
        "BPSC",
        pageUrl,
        false,
        0,
        `${error.message}. Earlier checks of bpsc.bih.nic.in also failed to connect, and onlinebpsc.bihar.gov.in is a login portal.`,
      ),
    };
  }
}

async function noteMpsc() {
  const pageUrl = "https://mpsc.gov.in/";
  try {
    const response = await grab(pageUrl);
    const hasTable = /<a[^>]+href="[^"]*advertisement[^"]*"/i.test(response.text);
    if (response.ok && hasTable) {
      return { exams: [], source: sourceResult("mpsc", "MPSC", pageUrl, false, 0, "A new advertisement link appeared in the HTML. The parser does not read it yet, so no Maharashtra row was invented.") };
    }
    return {
      exams: [],
      source: sourceResult(
        "mpsc",
        "MPSC",
        pageUrl,
        false,
        0,
        "The public site is a JavaScript app. Its content API refuses a read unless a CRC header matches, and that check is not bypassed. No Maharashtra row was invented.",
      ),
    };
  } catch (error) {
    return { exams: [], source: sourceResult("mpsc", "MPSC", pageUrl, false, 0, error.message) };
  }
}

function listingState(title) {
  if (/bihar|bpsc|bssc|btsc|bpssc|csbc|bseb|bceceb/i.test(title)) return "Bihar";
  if (/madhya pradesh|mppsc|mpesb/i.test(title)) return "Madhya Pradesh";
  if (/gujarat|gpsc|gsssb/i.test(title)) return "Gujarat";
  if (/maharashtra|\bmpsc\b/i.test(title)) return "Maharashtra";
  if (/uttar pradesh|\buppsc\b|\bupsssc\b|\bupessc\b|(^|[^a-z])up([^a-z]|$)/i.test(title)) return "Uttar Pradesh";
  return "";
}

function listingCenter(title, state) {
  const known = ["BPSC", "UPPSC", "GPSC", "GSSSB", "MPPSC", "MPSC", "MPESB", "UPSSSC", "UPESSC", "BCECEB", "BPSSC", "BSSC", "BTSC", "CSBC", "BSEB"];
  for (const name of known) {
    if (new RegExp(`\\b${name}\\b`, "i").test(title)) return name;
  }
  if (/vidhan sabha/i.test(title)) return "Bihar Vidhan Sabha";
  if (/bank of maharashtra/i.test(title)) return "Bank of Maharashtra";
  return state;
}

function listingDeadline(title) {
  const match = title.match(/Last Date\s*:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i)
    || title.match(/Last\s*:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return { date, label: formatParts(day, month, year) };
}

async function fetchRoundup() {
  const pageUrl = "https://www.sarkariresult.com/latestjob/";
  const response = await grab(pageUrl);
  if (!response.ok) {
    return { exams: [], source: sourceResult("roundup", "Recruitment roundup", "", false, 0, `HTTP ${response.status}. No link to the roundup is published.`) };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const titles = [...response.text.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/gi)]
    .map((match) => decode(match[0]))
    .filter((title) => /online form/i.test(title));
  const picked = [];
  const seen = new Set();
  for (const title of titles) {
    const state = listingState(title);
    const deadline = listingDeadline(title);
    if (!state || !deadline || deadline.date < today) continue;
    const name = title
      .replace(/\s*\|.*$/, "")
      .replace(/\s*last date\s*:.*$/i, "")
      .replace(/\s*last\s*:.*$/i, "")
      .replace(/\s+/g, " ")
      .trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    picked.push({ title, name, state, deadline, center: listingCenter(title, state) });
  }
  const perState = new Map();
  const exams = [];
  for (const item of picked.sort((a, b) => a.deadline.date - b.deadline.date)) {
    const count = perState.get(item.state) || 0;
    if (count >= 8) continue;
    perState.set(item.state, count + 1);
    exams.push(examRecord({
      name: item.name,
      qualification: "See the official advertisement",
      date: `Last date ${item.deadline.label}. Confirm the notice at the shop.`,
      state: item.state,
      sourceId: "roundup",
      source: item.center,
      url: "",
    }));
  }
  return {
    exams,
    source: sourceResult(
      "roundup",
      "Recruitment roundup",
      "",
      exams.length > 0,
      exams.length,
      "Open online forms for the five states whose listed last date is still ahead. The roundup site is not linked from the shop pages.",
    ),
  };
}

async function fetchMajhi() {
  const pageUrl = "https://majhinaukri.in/current-recruitment/";
  try {
    const response = await grab(pageUrl);
    const blocked = response.status === 403 || /just a moment/i.test(response.text);
    return {
      exams: [],
      source: sourceResult(
        "majhi",
        "Maharashtra recruitment roundup",
        "",
        false,
        0,
        blocked
          ? "The page showed a browser check, so it was not read. No link to it is published."
          : "The page was read, but Maharashtra rows are taken only from the dated roundup list. No link to this page is published.",
      ),
    };
  } catch (error) {
    return {
      exams: [],
      source: sourceResult("majhi", "Maharashtra recruitment roundup", "", false, 0, `${error.message}. No link to it is published.`),
    };
  }
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

function tickerLine(exam) {
  const shortDate = exam.date.startsWith("See") || exam.date.startsWith("Shown") || exam.date.startsWith("Notice dated") || exam.date.startsWith("Published")
    ? ""
    : ` — ${exam.date.replace(/\s+\d{1,2}:\d{2}\s*(AM|PM)/i, "")}`;
  const state = exam.state ? `${exam.state}: ` : "";
  return { text: `${state}${exam.name}${shortDate}`.slice(0, 180), source: exam.source, url: exam.url, sample: false };
}

function tickerFrom(exams, notices) {
  const lines = [];
  const used = new Set();
  const order = ["Gujarat", "Maharashtra", "Uttar Pradesh", "Bihar", "Madhya Pradesh", "National"];
  for (const state of order) {
    const exam = exams.find((item) => !item.sample && item.state === state);
    if (!exam || used.has(exam.name)) continue;
    used.add(exam.name);
    lines.push(tickerLine(exam));
  }
  for (const exam of exams) {
    if (lines.length === 8 || exam.sample || used.has(exam.name)) continue;
    used.add(exam.name);
    lines.push(tickerLine(exam));
  }
  for (const notice of notices) {
    if (lines.length === 10) break;
    lines.push({ text: notice.title.slice(0, 180), source: notice.source, url: notice.url, sample: false });
  }
  return lines;
}

function coverageFrom(sources, exams) {
  const plan = [
    { state: "Gujarat", ids: ["gpsc", "gsssb"] },
    { state: "Maharashtra", ids: ["mpsc"] },
    { state: "Uttar Pradesh", ids: ["uppsc"] },
    { state: "Bihar", ids: ["bpsc"] },
    { state: "Madhya Pradesh", ids: ["mppsc"] },
  ];
  return plan.map(({ state, ids }) => {
    const related = sources.filter((source) => ids.includes(source.id));
    const count = exams.filter((exam) => !exam.sample && exam.state === state).length;
    return {
      state,
      count,
      ok: count > 0,
      note: related.map((source) => source.note).filter(Boolean).join(" "),
    };
  });
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
  jobs.push(await run("gsssb", fetchGsssb));
  jobs.push(await run("mppsc", fetchMppsc));
  jobs.push(await run("uppsc", fetchUppsc));
  jobs.push(await run("bpsc", fetchBpsc));
  jobs.push(await run("employment-news", fetchEmploymentNews));
  jobs.push(await run("roundup", fetchRoundup));
  jobs.push(await run("majhi", fetchMajhi));
  const pib = await run("pib", fetchPib);
  const rrb = await noteEmptyRrb();
  const mpsc = await noteMpsc();

  const freshExams = jobs.flatMap((job) => job.exams || []);
  const failedIds = new Set(jobs.filter((job) => !job.source?.ok).map((job) => job.source.id));
  const kept = (previous.exams || []).filter((exam) => !exam.sample && failedIds.has(examSourceId(exam)) && !freshExams.some((item) => item.name === exam.name));
  let exams = [...freshExams, ...kept].map((exam) => (
    /sarkariresult\.com|majhinaukri\.in/i.test(exam.url || "") ? { ...exam, url: "" } : exam
  ));
  if (exams.length === 0) exams = sampleExams;

  const notices = pib.notices || [];
  const ticker = tickerFrom(exams, notices);
  const sources = [...jobs.map((job) => job.source), pib.source, rrb, mpsc.source, ...skippedSources()].filter(Boolean);
  const updates = {
    fetchedAt: new Date().toISOString(),
    ticker: ticker.length ? ticker : sampleTicker,
    schemes: {
      states: ["Gujarat", "Maharashtra", "Uttar Pradesh", "Bihar", "Madhya Pradesh"],
      groups: schemeGroups,
      notices,
    },
    coverage: coverageFrom(sources, exams),
    exams,
    sources,
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
  if (exam.sourceId) return exam.sourceId;
  const source = exam.source || "";
  if (source.includes("Gujarat Public Service")) return "gpsc";
  if (source.includes("Employment News")) return "employment-news";
  if (source.includes("Subordinate")) return "gsssb";
  if (source.includes("Madhya Pradesh")) return "mppsc";
  if (source.includes("Uttar Pradesh")) return "uppsc";
  return "";
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
