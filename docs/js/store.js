/* ==========================================================================
   TREKO — ΚΑΤΑΣΤΑΣΗ ΕΦΑΡΜΟΓΗΣ
   --------------------------------------------------------------------------
   Όλα τα δεδομένα μένουν στη συσκευή (localStorage). Δεν φεύγει τίποτα σε
   server. Η "σύνδεση" κρατάει μόνο όσο είναι ανοιχτή η σελίδα, ώστε το demo
   να ξεκινάει πάντα από την οθόνη καλωσορίσματος.
   ========================================================================== */

var GUEST = "guest";

function storageGet(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* αγνοούμε χαλασμένο ή κλειδωμένο storage */
  }
  return fallback;
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* π.χ. ιδιωτική περιήγηση — συνεχίζουμε κανονικά */
  }
}

try {
  localStorage.removeItem("treko:session");
} catch (e) {}

/* --------------------------------------------------------------------------
   Η ΚΑΤΑΣΤΑΣΗ
   -------------------------------------------------------------------------- */
var S = {
  users: storageGet("treko:users", []),
  session: null,
  favoritesByUser: storageGet("treko:favorites", {}),
  trips: storageGet("treko:trips", null) || seedTrips(),
  filters: JSON.parse(JSON.stringify(DEFAULT_FILTERS)),
  stack: [{ name: "welcome" }],
  toast: null,
  authPrompt: null,
  ui: {}
};

function resetUi() {
  S.ui = {
    sheet: null, // "filters" | "notifications" | null
    filterDraft: null,
    homeDate: null,
    homeActivity: "Όλα",
    homeShowAll: false,
    tripsTab: "upcoming",
    confirmCancel: false,
    submitted: false,
    formError: null,
    onboarding: null,
    createTrip: null
  };
}
resetUi();

/* --------------------------------------------------------------------------
   ΠΛΟΗΓΗΣΗ
   -------------------------------------------------------------------------- */
function route() {
  return S.stack[S.stack.length - 1];
}

function canGoBack() {
  return S.stack.length > 1;
}

function go(next) {
  S.stack.push(next);
  afterNavigate();
}

function replaceRoute(next) {
  S.stack[S.stack.length - 1] = next;
  afterNavigate();
}

function resetTo(next) {
  S.stack = [next];
  afterNavigate();
}

function back() {
  if (S.stack.length > 1) S.stack.pop();
  else S.stack = [{ name: "home" }];
  afterNavigate();
}

/* Κάθε αλλαγή οθόνης καθαρίζει τις προσωρινές καταστάσεις της προηγούμενης */
function afterNavigate() {
  var r = route();
  var keepToast = S.toast;
  resetUi();
  S.toast = keepToast;
  if (r.name === "explore" && r.openFilters) S.ui.sheet = "filters";
  render();
  window.scrollTo(0, 0);
  if (r.name === "explore" && r.focus) {
    var input = document.querySelector('[data-field="query"]');
    if (input) input.focus();
  }
}

/* --------------------------------------------------------------------------
   ΧΡΗΣΤΗΣ
   -------------------------------------------------------------------------- */
function sameEmail(a, b) {
  return !!a && !!b && String(a).toLowerCase() === String(b).toLowerCase();
}

function isGuest() {
  return S.session === GUEST;
}

function currentUser() {
  var stored = null;
  if (isGuest()) {
    for (var i = 0; i < S.users.length; i++) {
      if (S.users[i].email === GUEST) stored = S.users[i];
    }
    if (!stored) {
      stored = {
        name: "Επισκέπτη",
        email: GUEST,
        passwordHash: "",
        prefs: EMPTY_PREFS,
        onboarded: true
      };
    }
  } else if (S.session) {
    for (var j = 0; j < S.users.length; j++) {
      if (sameEmail(S.users[j].email, S.session)) stored = S.users[j];
    }
  }
  if (!stored) return null;
  return {
    name: stored.name,
    email: stored.email,
    passwordHash: stored.passwordHash,
    prefs: normalizePrefs(stored.prefs),
    onboarded: stored.onboarded
  };
}

/* Ο "εγώ" ως συμμετέχοντας — ο επισκέπτης δεν μετράει */
function me() {
  var user = currentUser();
  if (!user || isGuest()) return null;
  return { name: user.name, email: user.email };
}

function favorites() {
  return S.favoritesByUser[S.session || ""] || [];
}

/* Κρυπτογράφηση κωδικού. Σε http:// ή file:// το crypto.subtle δεν υπάρχει,
   οπότε το mockup κρατάει τον κωδικό ως έχει — είναι demo, τοπικά μόνο. */
function hashPassword(value) {
  if (!window.crypto || !window.crypto.subtle) return Promise.resolve(value);
  return window.crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(value))
    .then(function (bytes) {
      return Array.prototype.map
        .call(new Uint8Array(bytes), function (b) {
          return b.toString(16).padStart(2, "0");
        })
        .join("");
    })
    .catch(function () {
      return value;
    });
}

function signup(name, email, password) {
  var exists = S.users.some(function (u) {
    return sameEmail(u.email, email);
  });
  if (exists) return Promise.resolve("Υπάρχει ήδη λογαριασμός με αυτό το email.");

  return hashPassword(password).then(function (passwordHash) {
    var guestUser = null;
    S.users.forEach(function (u) {
      if (u.email === GUEST) guestUser = u;
    });
    var created = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: passwordHash,
      prefs: guestUser ? normalizePrefs(guestUser.prefs) : EMPTY_PREFS,
      onboarded: false
    };
    S.users = S.users.concat([created]);
    storageSet("treko:users", S.users);

    if (isGuest() && (S.favoritesByUser[GUEST] || []).length) {
      S.favoritesByUser[created.email] = S.favoritesByUser[GUEST].slice();
      storageSet("treko:favorites", S.favoritesByUser);
    }
    S.session = created.email;
    resetTo({ name: "onboarding" });
    return null;
  });
}

function login(email, password) {
  return hashPassword(password).then(function (passwordHash) {
    var found = null;
    S.users.forEach(function (u) {
      if (sameEmail(u.email, email) && u.email !== GUEST) found = u;
    });
    if (!found || found.passwordHash !== passwordHash) {
      return "Λάθος email ή κωδικός πρόσβασης.";
    }
    S.session = found.email;
    resetTo(found.onboarded ? { name: "home" } : { name: "onboarding" });
    return null;
  });
}

function continueAsGuest() {
  var exists = S.users.some(function (u) {
    return u.email === GUEST;
  });
  if (!exists) {
    S.users = S.users.concat([
      { name: "Επισκέπτη", email: GUEST, passwordHash: "", prefs: EMPTY_PREFS, onboarded: true }
    ]);
    storageSet("treko:users", S.users);
  }
  S.session = GUEST;
  resetTo({ name: "home" });
}

function logout(to) {
  S.session = null;
  resetTo(to || { name: "welcome" });
}

function updatePrefs(prefs) {
  var user = currentUser();
  if (!user) return;
  S.users = S.users.map(function (u) {
    if (u.email === user.email) {
      return {
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        prefs: prefs,
        onboarded: true
      };
    }
    return u;
  });
  storageSet("treko:users", S.users);
}

/* --------------------------------------------------------------------------
   ΑΓΑΠΗΜΕΝΑ
   -------------------------------------------------------------------------- */
function toggleFavorite(id) {
  var key = S.session || GUEST;
  var list = S.favoritesByUser[key] || [];
  var has = list.indexOf(id) !== -1;
  S.favoritesByUser[key] = has
    ? list.filter(function (x) {
        return x !== id;
      })
    : list.concat([id]);
  storageSet("treko:favorites", S.favoritesByUser);
  showToast(has ? "Αφαιρέθηκε από τα αγαπημένα" : "Προστέθηκε στα αγαπημένα");
}

/* --------------------------------------------------------------------------
   ΕΚΔΡΟΜΕΣ
   -------------------------------------------------------------------------- */
function saveTrips() {
  storageSet("treko:trips", S.trips);
}

function isParticipant(trip) {
  var m = me();
  if (!m) return false;
  return trip.participants.some(function (p) {
    return sameEmail(p.email, m.email);
  });
}

function isOrganizer(trip) {
  var m = me();
  return !!m && sameEmail(trip.organizer.email, m.email);
}

/* Επιστρέφει false όταν ο επισκέπτης χρειάζεται λογαριασμό */
function requireAccount(reason) {
  if (me()) return true;
  S.authPrompt = reason;
  render();
  return false;
}

function joinTrip(id) {
  if (!requireAccount("Για να συμμετέχεις σε ομαδική εκδρομή χρειάζεσαι λογαριασμό.")) return;
  var m = me();
  S.trips = S.trips.map(function (t) {
    if (t.id === id && t.participants.length < t.maxPeople && !isParticipant(t)) {
      var copy = Object.assign({}, t);
      copy.participants = t.participants.concat([m]);
      return copy;
    }
    return t;
  });
  saveTrips();
  showToast("Μπήκες στην ομάδα! Τα λέμε στην εκδρομή.");
}

function leaveTrip(id) {
  var m = me();
  S.trips = S.trips.map(function (t) {
    if (t.id === id) {
      var copy = Object.assign({}, t);
      copy.participants = t.participants.filter(function (p) {
        return !sameEmail(p.email, m && m.email);
      });
      return copy;
    }
    return t;
  });
  saveTrips();
  showToast("Αποχώρησες από την εκδρομή");
}

function createTrip(data) {
  var m = me();
  if (!m) return null;
  var id = "t-" + Date.now();
  var trip = Object.assign({}, data, {
    id: id,
    organizer: m,
    participants: [m],
    messages: []
  });
  S.trips = S.trips.concat([trip]);
  saveTrips();
  showToast("Η ομαδική εκδρομή δημιουργήθηκε");
  return id;
}

function cancelTrip(id) {
  S.trips = S.trips.filter(function (t) {
    return t.id !== id;
  });
  saveTrips();
  showToast("Η εκδρομή ακυρώθηκε");
}

function sendMessage(id, text) {
  var m = me();
  if (!m || !text.trim()) return;
  S.trips = S.trips.map(function (t) {
    if (t.id === id) {
      var copy = Object.assign({}, t);
      copy.messages = t.messages.concat([
        { id: "m-" + Date.now(), author: m, text: text.trim(), at: new Date().toISOString() }
      ]);
      return copy;
    }
    return t;
  });
  saveTrips();
}

function resetDemo() {
  S.trips = seedTrips();
  saveTrips();
  showToast("Οι ομαδικές εκδρομές επαναφέρθηκαν");
}

/* --------------------------------------------------------------------------
   TOAST
   -------------------------------------------------------------------------- */
var toastTimer = null;

function showToast(message) {
  S.toast = message;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    S.toast = null;
    render();
  }, 2600);
  render();
}

function setFilters(next) {
  S.filters = next;
  render();
}
