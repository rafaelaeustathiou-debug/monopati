/* ==========================================================================
   TREKO — ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ
   Ημερομηνίες στα ελληνικά, αναζήτηση/φίλτρα και ο αλγόριθμος προτάσεων.
   ========================================================================== */

/* Διαδρομές αρχείων.
   Στην κανονική έκδοση επιστρέφει τη διαδρομή όπως είναι ("images/vikos-gorge.jpg").
   Στην έκδοση ΕΝΟΣ αρχείου ο πίνακας INLINE_ASSETS είναι γεμάτος και επιστρέφει
   την ενσωματωμένη εικόνα, ώστε να μη χρειάζεται κανένα εξωτερικό αρχείο. */
var INLINE_ASSETS = {};

function assetUrl(path) {
  return INLINE_ASSETS[path] || path;
}

/* Ασφαλής εμφάνιση κειμένου μέσα σε HTML (π.χ. ονόματα, μηνύματα χρηστών) */
function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cls() {
  var out = [];
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i]) out.push(arguments[i]);
  }
  return out.join(" ");
}

/* --------------------------------------------------------------------------
   ΗΜΕΡΟΜΗΝΙΕΣ
   -------------------------------------------------------------------------- */
function pad(n) {
  return String(n).padStart(2, "0");
}

function toISO(date) {
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}

function todayISO() {
  return toISO(new Date());
}

function addDays(days, from) {
  var date = new Date(from || new Date());
  date.setDate(date.getDate() + days);
  return toISO(date);
}

function nextSaturday() {
  var now = new Date();
  var diff = (6 - now.getDay() + 7) % 7;
  return addDays(diff, now);
}

function parseISO(iso) {
  return new Date(iso + "T12:00:00");
}

function formatDay(iso) {
  return new Intl.DateTimeFormat("el-GR", { weekday: "short", day: "numeric", month: "short" })
    .format(parseISO(iso))
    .replace(",", "");
}

function formatLongDay(iso) {
  return new Intl.DateTimeFormat("el-GR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(parseISO(iso));
}

function weekdayShort(iso) {
  if (iso === todayISO()) return "Σήμερα";
  return new Intl.DateTimeFormat("el-GR", { weekday: "short" }).format(parseISO(iso));
}

function daysUntil(iso) {
  return Math.round((parseISO(iso).getTime() - parseISO(todayISO()).getTime()) / 86400000);
}

function relativeDay(iso) {
  var days = daysUntil(iso);
  if (days === 0) return "Σήμερα";
  if (days === 1) return "Αύριο";
  if (days > 1) return "Σε " + days + " μέρες";
  return "Ολοκληρώθηκε";
}

function formatTime(iso) {
  return new Intl.DateTimeFormat("el-GR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
}

/* --------------------------------------------------------------------------
   ΑΝΑΖΗΤΗΣΗ & ΦΙΛΤΡΑ
   -------------------------------------------------------------------------- */
/* Αγνοεί τόνους και κεφαλαία, ώστε "βικος" να βρίσκει το "Βίκου" */
function normalizeText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function openTripsFor(destinationId, trips) {
  return trips.filter(function (t) {
    return (
      t.destinationId === destinationId &&
      t.date >= todayISO() &&
      t.participants.length < t.maxPeople
    );
  });
}

function matchesFilters(d, f, trips, weather) {
  if (f.query) {
    var haystack = normalizeText(
      d.name +
        " " +
        d.area +
        " " +
        d.region +
        " " +
        d.activity +
        " " +
        d.landscapes.join(" ") +
        " " +
        d.trails.join(" ")
    );
    if (haystack.indexOf(normalizeText(f.query)) === -1) return false;
  }
  if (f.regions.length && f.regions.indexOf(d.region) === -1) return false;
  if (f.activities.length && f.activities.indexOf(d.activity) === -1) return false;
  if (f.difficulties.length && f.difficulties.indexOf(d.difficulty) === -1) return false;
  if (f.durations.length && f.durations.indexOf(d.duration) === -1) return false;
  if (f.weather === "avoid-rain" && weather && weather.rainy) return false;
  if (f.groupOnly && openTripsFor(d.id, trips).length === 0) return false;
  return true;
}

function activeFilterCount(f) {
  return (
    f.regions.length +
    f.activities.length +
    f.difficulties.length +
    f.durations.length +
    (f.weather ? 1 : 0) +
    (f.groupOnly ? 1 : 0)
  );
}

/* --------------------------------------------------------------------------
   ΠΡΟΤΑΣΕΙΣ
   Το Treko είναι για βουνό: οι πεζοπορίες προηγούνται πάντα. Μετά μετράει
   πόσο ταιριάζει ο προορισμός στις προτιμήσεις και στον καιρό.
   -------------------------------------------------------------------------- */
function recommend(d, prefs, weather, openTrips) {
  var score = 0;
  var reasons = [];
  var hiking = d.activity === "Πεζοπορία";
  var trails = prefs.trails.filter(function (t) {
    return t === "Συνδυασμός" ? d.trails.length > 1 : d.trails.indexOf(t) !== -1;
  });

  score += hiking ? 4 : d.trails.length ? 0 : -3;
  if (trails.length) {
    score += 2 * trails.length;
    reasons.push("Σου αρέσουν: " + trails.join(", ").toLowerCase() + ".");
  }
  if (prefs.difficulty === d.difficulty) {
    score += 2;
    reasons.push("Πεζοπορία στο επίπεδό σου: " + d.difficulty.toLowerCase() + ".");
  }
  if (prefs.duration === d.duration) {
    score += 2;
    reasons.push("Διάρκεια όπως τη θέλεις: " + d.duration.toLowerCase() + ".");
  }
  if (prefs.company === "Με ομάδα" && openTrips > 0) {
    score += 2;
    reasons.push("Υπάρχει ομαδική εκδρομή με ελεύθερες θέσεις.");
  }
  if (weather) {
    if (weather.rainy) {
      score -= 3;
    } else {
      score += 1;
      reasons.push(
        "Καλός καιρός στο βουνό: " + weather.temp + "° και " + weather.label.toLowerCase() + "."
      );
    }
  }
  return { score: score, reason: reasons[0] || d.highlights[0] };
}

/* Αρχικά ονόματος για τα avatar: "Μαρία Κ." → "ΜΚ" */
function initials(name) {
  return String(name)
    .split(" ")
    .map(function (part) {
      return part[0] || "";
    })
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function greeting() {
  var hour = new Date().getHours();
  if (hour < 12) return "Καλημέρα";
  if (hour < 19) return "Καλό απόγευμα";
  return "Καλησπέρα";
}
