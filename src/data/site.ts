export const site = {
  name: "PRAGATI DIGITAL & XEROX CENTER",
  lockupTop: "PRAGATI",
  lockupBottom: "XEROX & ONLINE CENTER",
  heroTitle: "Pragati Xerox & Online Center",
  heroSub: "Your trusted partner for all digital services & government applications",
  owners: ["Pravinbhai Jire", "Gururaj Jire"],
  phoneDisplay: "9016769144",
  phoneTel: "tel:+919016769144",
  phoneAltDisplay: "8200736673",
  phoneAltTel: "tel:+918200736673",
  callLabel: "Call Now 9016769144",
  location: "Shop 8, Rohini Park, near Sai Temple, Andada, Ankleshwar, Bharuch, Gujarat, 393010",
  mapUrl: "https://maps.app.goo.gl/LUBiyUzFzqSS99td8?g_st=aw",
  hours: "Mon–Sat 8:30 AM to 8:30 PM",
  hoursLong: "Monday–Saturday, 8:30 AM to 8:30 PM",
  tagline: "અમારે ત્યાં દરેક પ્રકારના કામ સચોટ અને ઝડપી કરવામાં આવે છે.",
  schemeCta:
    "Confused about eligibility? Bring your documents to our center, and we will find the perfect scheme and apply for you safely.",
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Xerox & Printing" },
  { href: "/government-schemes", label: "Govt. Schemes" },
  { href: "/exam-notifications", label: "Exam Notifications" },
  { href: "/#about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Xerox & Printing" },
  { href: "/government-schemes", label: "Govt. Schemes" },
  { href: "/services#digital", label: "Digital Services" },
  { href: "/exam-notifications", label: "Exam Notifications" },
  { href: "/contact", label: "Contact" },
];

export const serviceGroups = [
  {
    id: "printing",
    title: "Printing, Copying & Finishing",
    tone: "teal",
    icon: "print",
    items: [
      "B&W xerox",
      "Color print and color xerox",
      "Printouts",
      "Email and WhatsApp printouts",
      "Lamination",
      "Certificate book binding",
      "Book binding",
      "Spiral binding",
      "Project binding",
      "Passport size photos",
      "PVC card printing",
      "Smart card printing",
      "Aadhaar card printing",
      "Document scanning",
    ],
  },
  {
    id: "writing",
    title: "Writing & Document Creation",
    tone: "gold",
    icon: "form",
    items: ["Gujarati typing", "English typing", "Biodata writing", "Resume writing"],
  },
  {
    id: "digital",
    title: "Digital Services",
    tone: "teal",
    icon: "plane",
    items: [
      "PAN card application",
      "Passport application",
      "Online Aadhaar card",
      "Voter ID card",
      "Money transfer for all banks",
      "Aadhaar cash withdrawal",
      "ATM and card cash withdrawal",
      "Bank account opening",
      "FASTag",
      "Mobile recharge",
      "DTH recharge",
      "SIM card",
      "IRCTC railway tickets",
      "Flight tickets",
      "Bus tickets",
      "Loan and EMI payment",
      "Electricity bill",
      "Gas bill",
      "PF work",
      "Atal Pension Yojana",
      "PMSBY",
      "PMJJBY",
      "All types of insurance",
    ],
  },
];

export const printTiles = [
  { icon: "print", tone: "teal", title: "Xerox & Printing", text: "B&W and color copies, lamination, binding", href: "/services#printing" },
  { icon: "card", tone: "gold", title: "PVC Card Print", text: "Aadhaar, voter ID", href: "/services#printing" },
  { icon: "scan", tone: "teal", title: "Document Scan", text: "Scan and email", href: "/services#digital" },
  { icon: "form", tone: "gold", title: "Document Card", text: "Scheme forms and applications", href: "/government-schemes" },
];

export const schemeTiles = [
  { icon: "card", tone: "gold", title: "Ayushman Card", text: "Scheme forms", href: "/government-schemes#health" },
  { icon: "id", tone: "gold", title: "E-Shram Card", text: "Benefit forms", href: "/government-schemes#labor" },
  { icon: "form", tone: "gold", title: "Income Certificates", text: "Apply and forms", href: "/government-schemes#certificates" },
];

export const digitalTiles = [
  { icon: "id", tone: "teal", title: "PAN & Passport", text: "PAN, passport, Aadhaar, voter ID", href: "/services#digital" },
  { icon: "card", tone: "teal", title: "Banking & Bills", text: "Money transfer, FASTag, light and gas bills", href: "/services#digital" },
  { icon: "plane", tone: "teal", title: "Tickets & Insurance", text: "IRCTC, bus, flight, PMSBY, PMJJBY", href: "/services#digital" },
];
