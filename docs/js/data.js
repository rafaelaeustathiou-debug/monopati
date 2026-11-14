/* ==========================================================================
   TREKO — ΔΕΔΟΜΕΝΑ
   --------------------------------------------------------------------------
   ΕΔΩ αλλάζεις το περιεχόμενο του mockup: προορισμούς, κείμενα, εκδρομές.
   Δεν χρειάζεται τίποτα άλλο — απλώς σώσε το αρχείο και ανανέωσε τη σελίδα.
   ========================================================================== */

/* Λίστες επιλογών για φίλτρα και ερωτηματολόγιο */
var ACTIVITIES = ["Πεζοπορία", "Παραλία", "Ποδηλασία", "Πολιτιστικά"];
var DIFFICULTIES = ["Εύκολη", "Μέτρια", "Δύσκολη"];
var DURATIONS = ["Λίγες ώρες", "Μισή μέρα", "Ολόκληρη μέρα"];

/* --------------------------------------------------------------------------
   ΠΡΟΟΡΙΣΜΟΙ
   Για να προσθέσεις προορισμό, αντίγραψε ένα μπλοκ { ... } και άλλαξέ το.
   Η φωτογραφία μπαίνει στον φάκελο images/ και γράφεις το όνομά της στο image.
   -------------------------------------------------------------------------- */
var DESTINATIONS = [
  {
    id: "vikos",
    name: "Φαράγγι του Βίκου",
    area: "Ζαγόρι, Ήπειρος",
    region: "Ήπειρος",
    landscapes: ["Βουνό", "Δάσος"],
    trails: ["Φαράγγια", "Λίμνες & ποτάμια", "Πέτρινα χωριά"],
    activity: "Πεζοπορία",
    difficulty: "Μέτρια",
    duration: "Ολόκληρη μέρα",
    hours: 6,
    distanceKm: 12.5,
    elevation: 850,
    lat: 39.95,
    lon: 20.73,
    image: "images/vikos-gorge.jpg",
    description:
      "Ένα από τα βαθύτερα φαράγγια του κόσμου, με πέτρινα γεφύρια, τις πηγές του Βοϊδομάτη και θέα στους πύργους της Αστράκας.",
    highlights: ["Πηγές Βοϊδομάτη", "Πέτρινα γεφύρια", "Παραδοσιακά χωριά Μονοδένδρι & Πάπιγκο"],
    tip: "Ξεκίνα νωρίς από το Μονοδένδρι και κανόνισε μεταφορά από το Πάπιγκο."
  },
  {
    id: "plastira",
    name: "Λίμνη Πλαστήρα",
    area: "Καρδίτσα, Θεσσαλία",
    region: "Θεσσαλία",
    landscapes: ["Λίμνη", "Δάσος"],
    trails: ["Λίμνες & ποτάμια", "Δασικά μονοπάτια"],
    activity: "Ποδηλασία",
    difficulty: "Εύκολη",
    duration: "Λίγες ώρες",
    hours: 3,
    distanceKm: 14,
    elevation: 180,
    lat: 39.24,
    lon: 21.75,
    image: "images/lake-plastira.jpg",
    description:
      "Ήρεμη ορεινή λίμνη περιτριγυρισμένη από έλατα, ιδανική για ποδήλατο στην παραλίμνια διαδρομή και καφέ με θέα.",
    highlights: ["Φράγμα Ταυρωπού", "Παραλίμνια διαδρομή", "Βοτανικός κήπος Νεράιδας"],
    tip: "Ενοικίαση ποδηλάτων υπάρχει στο Νεοχώρι — κλείσε από πριν τα Σαββατοκύριακα."
  },
  {
    id: "meteora",
    name: "Μετέωρα",
    area: "Καλαμπάκα, Θεσσαλία",
    region: "Θεσσαλία",
    landscapes: ["Βουνό"],
    trails: ["Κορυφές", "Πέτρινα χωριά"],
    activity: "Πολιτιστικά",
    difficulty: "Εύκολη",
    duration: "Μισή μέρα",
    hours: 4,
    distanceKm: 7,
    elevation: 350,
    lat: 39.72,
    lon: 21.63,
    image: "images/meteora.jpg",
    description:
      "Βυζαντινά μοναστήρια χτισμένα στην κορυφή γιγάντιων βράχων. Παλιά μονοπάτια των μοναχών ενώνουν το Καστράκι με τις μονές.",
    highlights: ["Μονή Μεγάλου Μετεώρου", "Μονοπάτι από Καστράκι", "Ηλιοβασίλεμα στο Σκοπευτήριο"],
    tip: "Οι μονές έχουν διαφορετικές μέρες αργίας — έλεγξε πριν ξεκινήσεις."
  },
  {
    id: "samaria",
    name: "Φαράγγι της Σαμαριάς",
    area: "Χανιά, Κρήτη",
    region: "Κρήτη",
    landscapes: ["Βουνό", "Δάσος", "Θάλασσα"],
    trails: ["Φαράγγια", "Δασικά μονοπάτια"],
    activity: "Πεζοπορία",
    difficulty: "Δύσκολη",
    duration: "Ολόκληρη μέρα",
    hours: 7,
    distanceKm: 16,
    elevation: 1250,
    lat: 35.29,
    lon: 23.96,
    image: "images/samaria.jpg",
    description:
      "Το πιο διάσημο φαράγγι της Ευρώπης: κατάβαση από το Ξυλόσκαλο ως την Αγία Ρουμέλη και βουτιά στο Λιβυκό.",
    highlights: ["Σιδερόπορτες", "Εγκαταλελειμμένο χωριό Σαμαριά", "Τελική βουτιά στην Αγία Ρουμέλη"],
    tip: "Ανοιχτό Μάιο–Οκτώβριο. Το καράβι της επιστροφής φεύγει απόγευμα."
  },
  {
    id: "balos",
    name: "Λιμνοθάλασσα Μπάλου",
    area: "Κίσσαμος, Κρήτη",
    region: "Κρήτη",
    landscapes: ["Θάλασσα"],
    trails: [],
    activity: "Παραλία",
    difficulty: "Εύκολη",
    duration: "Μισή μέρα",
    hours: 4,
    distanceKm: 2.5,
    elevation: 100,
    lat: 35.58,
    lon: 23.59,
    image: "images/balos.jpg",
    description:
      "Τυρκουάζ ρηχά νερά και ροζ άμμος στη χερσόνησο της Γραμβούσας, με μικρή κατάβαση από το πάρκινγκ.",
    highlights: ["Θέα από το μονοπάτι", "Νησί Γραμβούσα", "Ρηχά, ζεστά νερά"],
    tip: "Πήγαινε νωρίς το πρωί για ησυχία και πάρε νερό — δεν υπάρχει σκιά."
  },
  {
    id: "monemvasia",
    name: "Μονεμβασιά",
    area: "Λακωνία, Πελοπόννησος",
    region: "Πελοπόννησος",
    landscapes: ["Θάλασσα"],
    trails: ["Πέτρινα χωριά"],
    activity: "Πολιτιστικά",
    difficulty: "Εύκολη",
    duration: "Μισή μέρα",
    hours: 4,
    distanceKm: 4,
    elevation: 200,
    lat: 36.69,
    lon: 23.06,
    image: "images/monemvasia.jpg",
    description:
      "Μεσαιωνική καστροπολιτεία πάνω σε βράχο στη θάλασσα. Περπάτησε στα καλντερίμια και ανέβα στην Άνω Πόλη.",
    highlights: ["Αγία Σοφία", "Καλντερίμια Κάτω Πόλης", "Θέα από την Άνω Πόλη"],
    tip: "Φόρα παπούτσια με καλή πρόσφυση — τα καλντερίμια γλιστρούν."
  },
  {
    id: "sounion",
    name: "Ναός Ποσειδώνα",
    area: "Σούνιο, Αττική",
    region: "Αττική",
    landscapes: ["Θάλασσα"],
    trails: [],
    activity: "Πολιτιστικά",
    difficulty: "Εύκολη",
    duration: "Λίγες ώρες",
    hours: 2,
    distanceKm: 1.5,
    elevation: 60,
    lat: 37.65,
    lon: 24.02,
    image: "images/sounion.jpg",
    description:
      "Ο αρχαίος ναός στο νοτιότερο άκρο της Αττικής, με ένα από τα πιο όμορφα ηλιοβασιλέματα του Αιγαίου.",
    highlights: ["Ηλιοβασίλεμα", "Παραλία Σουνίου", "Παραλιακή διαδρομή από Αθήνα"],
    tip: "Φτάσε μία ώρα πριν τη δύση — ο χώρος κλείνει με το ηλιοβασίλεμα."
  },
  {
    id: "pelion",
    name: "Μονοπάτια Πηλίου",
    area: "Μακρινίτσα, Θεσσαλία",
    region: "Θεσσαλία",
    landscapes: ["Βουνό", "Δάσος", "Θάλασσα"],
    trails: ["Δασικά μονοπάτια", "Πέτρινα χωριά"],
    activity: "Πεζοπορία",
    difficulty: "Μέτρια",
    duration: "Μισή μέρα",
    hours: 5,
    distanceKm: 10,
    elevation: 600,
    lat: 39.4,
    lon: 22.98,
    image: "images/pelion.jpg",
    description:
      "Πλακόστρωτα μονοπάτια μέσα σε καστανιές και πλατάνια, που ενώνουν πέτρινα χωριά με θέα στον Παγασητικό.",
    highlights: ["Καλντερίμι Μακρινίτσας", "Πλατεία Πορταριάς", "Θέα στον Βόλο"],
    tip: "Το φθινόπωρο τα χρώματα του δάσους είναι εντυπωσιακά."
  },
  {
    id: "lousios",
    name: "Φαράγγι του Λούσιου",
    area: "Αρκαδία, Πελοπόννησος",
    region: "Πελοπόννησος",
    landscapes: ["Βουνό", "Δάσος"],
    trails: ["Φαράγγια", "Λίμνες & ποτάμια", "Δασικά μονοπάτια"],
    activity: "Πεζοπορία",
    difficulty: "Μέτρια",
    duration: "Μισή μέρα",
    hours: 5,
    distanceKm: 13,
    elevation: 500,
    lat: 37.55,
    lon: 22.04,
    image: "images/lousios.jpg",
    description:
      "Μέρος του Menalon Trail: ποτάμι, μοναστήρια σκαρφαλωμένα στα βράχια και πυκνή βλάστηση.",
    highlights: ["Μονή Φιλοσόφου", "Μονή Προδρόμου", "Αρχαία Γόρτυνα"],
    tip: "Το μονοπάτι είναι σηματοδοτημένο — ακολούθησε τα σήματα Menalon Trail."
  },
  {
    id: "olympus",
    name: "Όλυμπος – Καταφύγιο Α",
    area: "Πιερία, Μακεδονία",
    region: "Μακεδονία",
    landscapes: ["Βουνό", "Δάσος"],
    trails: ["Κορυφές", "Δασικά μονοπάτια"],
    activity: "Πεζοπορία",
    difficulty: "Δύσκολη",
    duration: "Ολόκληρη μέρα",
    hours: 8,
    distanceKm: 9,
    elevation: 1050,
    lat: 40.08,
    lon: 22.38,
    image: "images/olympus.jpg",
    description:
      "Ανάβαση από τα Πριόνια στο καταφύγιο Σπήλιος Αγαπητός μέσα σε δάσος από μαύρη πεύκη, στο βουνό των θεών.",
    highlights: ["Πηγή Πριονίων", "Καταφύγιο Σπήλιος Αγαπητός", "Θέα στις κορυφές"],
    tip: "Ο καιρός αλλάζει γρήγορα στο βουνό — πάρε αντιανεμικό ακόμα και το καλοκαίρι."
  },
  {
    id: "sarakiniko",
    name: "Σαρακήνικο",
    area: "Μήλος, Κυκλάδες",
    region: "Κυκλάδες",
    landscapes: ["Θάλασσα", "Νησί"],
    trails: [],
    activity: "Παραλία",
    difficulty: "Εύκολη",
    duration: "Λίγες ώρες",
    hours: 3,
    distanceKm: 1,
    elevation: 20,
    lat: 36.75,
    lon: 24.44,
    image: "images/sarakiniko.jpg",
    description:
      "Σεληνιακό τοπίο από λευκά ηφαιστειακά πετρώματα και καταγάλανα νερά στη βόρεια ακτή της Μήλου.",
    highlights: ["Λευκοί βράχοι", "Θαλάσσιες σπηλιές", "Ναυάγιο Αλίκη"],
    tip: "Με βοριά η θάλασσα έχει κύμα — προτίμησε μέρα με νηνεμία."
  }
];

/* Οι περιοχές βγαίνουν αυτόματα από τους προορισμούς */
var REGIONS = DESTINATIONS.map(function (d) {
  return d.region;
}).filter(function (r, i, all) {
  return all.indexOf(r) === i;
});

function getDestination(id) {
  for (var i = 0; i < DESTINATIONS.length; i++) {
    if (DESTINATIONS[i].id === id) return DESTINATIONS[i];
  }
  return null;
}

/* --------------------------------------------------------------------------
   ΈΤΟΙΜΕΣ ΟΜΑΔΙΚΕΣ ΕΚΔΡΟΜΕΣ (demo)
   Οι ημερομηνίες υπολογίζονται από τη σημερινή μέρα, ώστε το demo να είναι
   πάντα "επερχόμενο".
   -------------------------------------------------------------------------- */
function seedTrips() {
  return [
    {
      id: "t-vikos",
      destinationId: "vikos",
      date: addDays(3),
      time: "08:00",
      meetingPoint: "Πλατεία Μονοδενδρίου",
      organizer: { name: "Νίκος Π.", email: "nikos@treko.gr" },
      maxPeople: 10,
      participants: [
        { name: "Νίκος Π.", email: "nikos@treko.gr" },
        { name: "Ελένη Δ." },
        { name: "Άρης Κ." },
        { name: "Φωτεινή Μ." },
        { name: "Στέλιος Β." }
      ],
      description: "Διάσχιση από Μονοδένδρι προς Πάπιγκο με στάση στις πηγές του Βοϊδομάτη.",
      messages: [
        {
          id: "m1",
          author: { name: "Νίκος Π.", email: "nikos@treko.gr" },
          text: "Καλησπέρα σε όλους! Θα έχω ένα αυτοκίνητο για τη μεταφορά από το Πάπιγκο.",
          at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "m2",
          author: { name: "Ελένη Δ." },
          text: "Τέλεια! Χρειάζονται μπατόν;",
          at: new Date(Date.now() - 80000000).toISOString()
        }
      ]
    },
    {
      id: "t-plastira",
      destinationId: "plastira",
      date: addDays(5),
      time: "10:00",
      meetingPoint: "Φράγμα Ταυρωπού",
      organizer: { name: "Κατερίνα Λ." },
      maxPeople: 8,
      participants: [{ name: "Κατερίνα Λ." }, { name: "Γιάννης Τ." }, { name: "Μαρίνα Σ." }],
      description: "Χαλαρή βόλτα με ποδήλατα γύρω από τη λίμνη και φαγητό στο Νεοχώρι.",
      messages: []
    },
    {
      id: "t-meteora",
      destinationId: "meteora",
      date: addDays(6),
      time: "16:00",
      meetingPoint: "Κεντρική πλατεία Καστρακίου",
      organizer: { name: "Γιώργος Μ." },
      maxPeople: 12,
      participants: [
        { name: "Γιώργος Μ." },
        { name: "Δανάη Ρ." },
        { name: "Πέτρος Λ." },
        { name: "Ιωάννα Κ." },
        { name: "Μιχάλης Ζ." },
        { name: "Χαρά Π." },
        { name: "Λευτέρης Ν." }
      ],
      description: "Ανάβαση από τα παλιά μονοπάτια των μοναχών και ηλιοβασίλεμα στα Μετέωρα.",
      messages: []
    },
    {
      id: "t-sounion",
      destinationId: "sounion",
      date: addDays(2),
      time: "17:30",
      meetingPoint: "Είσοδος αρχαιολογικού χώρου",
      organizer: { name: "Σοφία Κ." },
      maxPeople: 6,
      participants: [
        { name: "Σοφία Κ." },
        { name: "Αλέξης Β." },
        { name: "Νεφέλη Χ." },
        { name: "Θοδωρής Ι." },
        { name: "Ρένα Α." },
        { name: "Βασίλης Ε." }
      ],
      description: "Απογευματινή εξόρμηση για ηλιοβασίλεμα και βουτιά.",
      messages: []
    },
    {
      id: "t-lousios",
      destinationId: "lousios",
      date: addDays(10),
      time: "09:00",
      meetingPoint: "Δημητσάνα, πλατεία",
      organizer: { name: "Δημήτρης Α." },
      maxPeople: 15,
      participants: [{ name: "Δημήτρης Α." }, { name: "Ζωή Φ." }],
      description: "Menalon Trail από Δημητσάνα έως Στεμνίτσα με επίσκεψη στα μοναστήρια.",
      messages: []
    },
    {
      id: "t-olympus",
      destinationId: "olympus",
      date: addDays(13),
      time: "07:30",
      meetingPoint: "Πάρκινγκ Πριονίων",
      organizer: { name: "Άννα Γ." },
      maxPeople: 8,
      participants: [{ name: "Άννα Γ." }, { name: "Κώστας Μ." }, { name: "Λίνα Β." }],
      description: "Ανάβαση στο καταφύγιο Α με διανυκτέρευση. Απαιτείται καλή φυσική κατάσταση.",
      messages: []
    }
  ];
}

/* Προτιμήσεις χρήστη */
var EMPTY_PREFS = { trails: [], difficulty: null, duration: null, company: null };

function normalizePrefs(prefs) {
  prefs = prefs || {};
  return {
    trails: Array.isArray(prefs.trails) ? prefs.trails : [],
    difficulty: prefs.difficulty || null,
    duration: prefs.duration || null,
    company: prefs.company || null
  };
}

var DEFAULT_FILTERS = {
  query: "",
  regions: [],
  activities: [],
  difficulties: [],
  durations: [],
  weather: null,
  groupOnly: false
};
