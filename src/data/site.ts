export const site = {
  name: "PRAGATI DIGITAL & XEROX CENTER",
  lockupTop: "PRAGATI",
  lockupBottom: "XEROX & GOVT. SCHEMES CENTER",
  heroTitle: "Pragati Xerox & Govt. Schemes Center",
  heroSub: "Your trusted partner for all digital services & government applications",
  owners: ["Pravinbhai Jire", "Gururaj Jire"],
  phoneDisplay: "9016769144",
  phoneTel: "tel:+919016769144",
  phoneAltDisplay: "8200736673",
  phoneAltTel: "tel:+918200736673",
  callLabel: "Call Now 9016769144",
  location: "Shop 8, Rohini Park, Andada, Ankleshwar, Bharuch, Gujarat, 393010",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Shop%208%20Rohini%20Park%20Andada%20Ankleshwar%20Bharuch%20Gujarat%20393010",
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
      "Color xerox",
      "Bulk printouts",
      "Email and WhatsApp printouts",
      "Lamination",
      "Book binding",
      "Spiral binding",
      "Project binding",
      "PVC card printing",
      "Aadhaar card printing",
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
    title: "Travel, Telecom & Utilities",
    tone: "teal",
    icon: "plane",
    items: [
      "Railway tickets",
      "Bus tickets",
      "Flight tickets",
      "SIM activation and upgrade",
      "Mobile recharges",
      "Scan and email",
      "Online bill payments",
    ],
  },
];

export const printTiles = [
  { icon: "print", tone: "teal", title: "Xerox & Printing", text: "B&W and color copies, scanning", href: "/services#printing" },
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
  { icon: "form", tone: "teal", title: "Online Applications", text: "Exam forms at the shop", href: "/exam-notifications" },
  { icon: "shield", tone: "teal", title: "Vehicle Insurance", text: "Insurance forms", href: "/government-schemes#business" },
  { icon: "plane", tone: "teal", title: "Booking", text: "Rail and air tickets", href: "/services#digital" },
];
