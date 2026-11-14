/* ==========================================================================
   TREKO — ΟΘΟΝΕΣ
   --------------------------------------------------------------------------
   Κάθε συνάρτηση επιστρέφει HTML. Τα κλικ δουλεύουν με data-action="..."
   και εκτελούνται από το js/app.js.
   ========================================================================== */

/* --------------------------------------------------------------------------
   ΚΟΙΝΑ ΚΟΜΜΑΤΙΑ
   -------------------------------------------------------------------------- */
function backButton(action) {
  return `<button class="back-button" data-action="${action || "back"}" aria-label="Πίσω">
      ${icon("back")}
    </button>`;
}

function favoriteButton(id, className) {
  var active = favorites().indexOf(id) !== -1;
  return `<button class="${cls(className || "favorite", active && "active")}"
      data-action="toggleFavorite" data-id="${esc(id)}" aria-pressed="${active}"
      aria-label="${active ? "Αφαίρεση από αγαπημένα" : "Προσθήκη στα αγαπημένα"}">
      ${icon("heart")}
    </button>`;
}

function weatherBadge(weather, loading) {
  if (!weather) {
    return loading ? '<span class="weather muted">Φόρτωση καιρού…</span>' : "";
  }
  return `<span class="${cls("weather", weather.rainy && "rainy")}">
      ${weatherIcon(weather.code, 14)}${weather.temp}° · ${esc(weather.label)}
    </span>`;
}

function featuredCard(d, weather, loading, reason) {
  return `<article class="destination-card featured clickable" role="button" tabindex="0"
      data-action="openDestination" data-id="${esc(d.id)}" aria-label="${esc(d.name)}">
      <div class="destination-photo">
        <img src="${esc(assetUrl(d.image))}" alt="${esc(d.name)}" loading="lazy">
        ${favoriteButton(d.id)}
        ${weatherBadge(weather, loading)}
      </div>
      <div class="destination-body">
        <div>
          <h3>${esc(d.name)}</h3>
          <p>${esc(d.area)}</p>
        </div>
        <div class="meta">
          <span>${icon("mountain")}${esc(d.activity)}</span>
          <span>${icon("sliders")}${esc(d.difficulty)}</span>
          <span>${icon("clock")}${d.hours} ώρες</span>
        </div>
        <div class="reason">${icon("compass")}${esc(reason)}</div>
      </div>
    </article>`;
}

function compactCard(d, weather, note, showFavorite) {
  return `<article class="destination-card compact clickable" role="button" tabindex="0"
      data-action="openDestination" data-id="${esc(d.id)}" aria-label="${esc(d.name)}">
      <img class="compact-photo" src="${esc(assetUrl(d.image))}" alt="${esc(d.name)}" loading="lazy">
      <div>
        <h3>${esc(d.name)}</h3>
        <p>${esc(d.area.split(",")[0])} · ${esc(d.difficulty)} · ${d.hours} ώρες</p>
        ${note ? `<b>${esc(note)}</b>` : ""}
        ${
          weather
            ? `<span class="${cls("inline-weather", weather.rainy && "rainy")}">
                ${weatherIcon(weather.code, 14)}${weather.temp}° · ${esc(weather.label)}
              </span>`
            : ""
        }
      </div>
      ${showFavorite ? favoriteButton(d.id, "favorite inline") : ""}
    </article>`;
}

function avatarsHtml(people, max) {
  max = max || 4;
  var shown = people.slice(0, max).map(function (p) {
    return `<i title="${esc(p.name)}">${esc(initials(p.name))}</i>`;
  });
  var extra = people.length > max ? `<i class="more">+${people.length - max}</i>` : "";
  return `<span class="avatars">${shown.join("")}${extra}</span>`;
}

function tripCardHtml(trip) {
  var d = getDestination(trip.destinationId);
  if (!d) return "";
  var full = trip.participants.length >= trip.maxPeople;
  var joined = isParticipant(trip);
  var spots = trip.maxPeople - trip.participants.length;
  var status = isOrganizer(trip)
    ? "Διοργανωτής"
    : joined
      ? "Συμμετέχεις"
      : full
        ? "Πλήρης"
        : spots + " θέσεις";
  return `<article class="trip-card clickable" role="button" tabindex="0"
      data-action="openTrip" data-id="${esc(trip.id)}"
      aria-label="${esc(d.name)}, ${esc(formatDay(trip.date))}">
      <img src="${esc(assetUrl(d.image))}" alt="${esc(d.name)}" loading="lazy">
      <div class="trip-card-body">
        <span class="trip-date">${esc(formatDay(trip.date))} · ${esc(trip.time)}</span>
        <h3>${esc(d.name)}</h3>
        <p>${esc(trip.meetingPoint)}</p>
        <div class="trip-card-foot">
          ${avatarsHtml(trip.participants, 3)}
          <span class="${cls("status", joined && "joined", !joined && full && "full")}">
            ${esc(status)}
          </span>
        </div>
      </div>
    </article>`;
}

function sheetHtml(title, body, action) {
  return `<div class="filter-layer" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <button class="scrim" data-action="closeSheet" aria-label="Κλείσιμο"></button>
      <section class="filter-sheet">
        <div class="grabber"></div>
        <header>
          <h2>${esc(title)}</h2>
          ${
            action ||
            `<button class="sheet-close" data-action="closeSheet" aria-label="Κλείσιμο">
              ${svgIcon("close")}
            </button>`
          }
        </header>
        ${body}
      </section>
    </div>`;
}

function emptyState(iconHtml, title, text, action) {
  return `<div class="empty-state">
      <span>${iconHtml}</span>
      <h2>${esc(title)}</h2>
      ${text ? `<p>${esc(text)}</p>` : ""}
      ${action || ""}
    </div>`;
}

var NAV_TABS = [
  { id: "home", label: "Αρχική", icon: "mountain" },
  { id: "explore", label: "Αναζήτηση", icon: "search" },
  { id: "trips", label: "Εκδρομές", svg: "users" },
  { id: "favorites", label: "Αγαπημένα", icon: "heart" },
  { id: "profile", label: "Προφίλ", icon: "user" }
];

var NAV_PARENT = {
  destination: "explore",
  trip: "trips",
  createTrip: "trips",
  onboarding: "profile"
};

function bottomNav() {
  var name = route().name;
  var isTab = NAV_TABS.some(function (t) {
    return t.id === name;
  });
  var active = isTab ? name : NAV_PARENT[name];
  var buttons = NAV_TABS.map(function (tab) {
    var on = active === tab.id;
    return `<button class="${on ? "active" : ""}" data-action="navTab" data-tab="${tab.id}"
        ${on ? 'aria-current="page"' : ""}>
        <span>${tab.icon ? icon(tab.icon) : svgIcon(tab.svg)}</span>${tab.label}
      </button>`;
  });
  return `<nav class="bottom-nav" aria-label="Κύριο μενού">${buttons.join("")}</nav>`;
}

function toastHtml() {
  if (!S.toast) return "";
  return `<div class="toast" role="status">${esc(S.toast)}</div>`;
}

function authPromptHtml() {
  if (!S.authPrompt) return "";
  return sheetHtml(
    "Χρειάζεσαι λογαριασμό",
    `<p class="sheet-text">${esc(S.authPrompt)}</p>
      <button class="button button-dark" data-action="promptSignup">Δημιουργία λογαριασμού</button>
      <button class="text-button" data-action="promptLogin">Έχω λογαριασμό — Σύνδεση</button>`
  );
}

/* --------------------------------------------------------------------------
   01 ΚΑΛΩΣΟΡΙΣΜΑ
   -------------------------------------------------------------------------- */
function welcomeScreen() {
  return `<main class="welcome">
      <div class="welcome-inner">
        <div class="brand" aria-label="Treko">
          ${icon("brandCircle", "brand-circle")}
          <i class="brand-mountain"></i>
          <i class="brand-word"></i>
        </div>

        <div class="hero-stage">
          <section class="hero-art">
            <div class="hero-label">STAY PEAKY.</div>
            <img src="${assetUrl('assets/hero.jpg')}" alt="Τρεις πεζοπόροι ανεβαίνουν ένα βουνό">
          </section>
        </div>

        <section class="welcome-copy">
          <h1>Βρες πού θέλεις να πας. Βρες την παρέα σου.</h1>
          <p>
            Προτάσεις εκδρομών στην Ελλάδα, πρόγνωση καιρού και ομαδικές εξορμήσεις — όλα σε ένα
            μέρος.
          </p>
        </section>

        <div class="welcome-actions">
          <button class="button button-light" data-action="goSignup">Δημιουργία λογαριασμού</button>
          <button class="button button-outline" data-action="goLogin">Σύνδεση</button>
          <button class="text-button light-text" data-action="continueAsGuest">
            Συνέχεια ως επισκέπτης
          </button>
        </div>
      </div>
    </main>`;
}

/* --------------------------------------------------------------------------
   02 ΕΓΓΡΑΦΗ / ΣΥΝΔΕΣΗ
   -------------------------------------------------------------------------- */
function fieldHtml(opts) {
  var error = opts.error;
  return `<label class="${cls("field", error && "has-error")}">
      <span>${esc(opts.label)}</span>
      <div class="input-shell">
        ${icon(opts.icon)}
        <input type="${opts.type || "text"}" name="${opts.name}" data-field="${opts.name}"
          placeholder="${esc(opts.placeholder)}" value="${esc(opts.value || "")}"
          ${opts.autoComplete ? `autocomplete="${opts.autoComplete}"` : ""}
          aria-invalid="${!!error}">
      </div>
      ${
        error
          ? `<small class="error">${esc(error)}</small>`
          : opts.hint
            ? `<small>${esc(opts.hint)}</small>`
            : ""
      }
    </label>`;
}

function signupScreen() {
  var d = S.ui.signupDraft || { name: "", email: "", password: "", accepted: true };
  var e = S.ui.submitted ? S.ui.errors || {} : {};
  return `<main class="paper-page auth-page">
      <div class="form-layout">
        ${backButton()}
        <header class="signup-heading">
          <h1>Δημιουργία λογαριασμού</h1>
          <p>Χρειαζόμαστε μόνο τα απαραίτητα. Εξηγούμε γιατί ζητάμε κάθε στοιχείο.</p>
        </header>

        <form class="signup-form" data-action="submitSignup" novalidate>
          <div class="fields">
            ${fieldHtml({
              label: "Εμφανιζόμενο όνομα",
              name: "name",
              placeholder: "π.χ. Μαρία Κ.",
              icon: "user",
              hint: "Το βλέπουν οι υπόλοιποι στις ομαδικές εκδρομές.",
              value: d.name,
              autoComplete: "nickname",
              error: e.name
            })}
            ${fieldHtml({
              label: "Email",
              name: "email",
              placeholder: "maria@email.com",
              icon: "mail",
              type: "email",
              hint: "Για επιβεβαίωση και ειδοποιήσεις εκδρομών.",
              value: d.email,
              autoComplete: "email",
              error: e.email
            })}
            ${fieldHtml({
              label: "Κωδικός πρόσβασης",
              name: "password",
              placeholder: "••••••••••",
              icon: "lock",
              type: "password",
              value: d.password,
              autoComplete: "new-password",
              error: e.password
            })}
          </div>

          <label class="terms">
            <input type="checkbox" name="accepted" data-field="accepted"
              ${d.accepted ? "checked" : ""}>
            <span class="check">${icon("check")}</span>
            <span>Αποδέχομαι τους Όρους Χρήσης και την Πολιτική Απορρήτου.</span>
          </label>

          <div class="signup-bottom">
            <div class="privacy-note">
              ${icon("shield")}
              <span>Δεν ζητάμε ηλικία ή άλλα ευαίσθητα στοιχεία.</span>
            </div>
            <button class="button button-dark" type="submit" ${d.accepted ? "" : "disabled"}>
              Συνέχεια
            </button>
            <p class="login-link">
              Έχεις ήδη λογαριασμό;
              <button type="button" data-action="replaceLogin">Σύνδεση</button>
            </p>
          </div>
        </form>
      </div>
    </main>`;
}

function loginScreen() {
  var d = S.ui.loginDraft || { email: "", password: "" };
  return `<main class="paper-page auth-page">
      <div class="form-layout">
        ${backButton()}
        <header class="signup-heading">
          <h1>Καλώς ήρθες ξανά</h1>
          <p>Συνδέσου για να δεις τις προτάσεις, τα αγαπημένα και τις εκδρομές σου.</p>
        </header>
        <form class="signup-form" data-action="submitLogin" novalidate>
          <div class="fields">
            ${fieldHtml({
              label: "Email",
              name: "email",
              placeholder: "maria@email.com",
              icon: "mail",
              type: "email",
              value: d.email,
              autoComplete: "email"
            })}
            ${fieldHtml({
              label: "Κωδικός πρόσβασης",
              name: "password",
              placeholder: "••••••••••",
              icon: "lock",
              type: "password",
              value: d.password,
              autoComplete: "current-password",
              error: S.ui.formError
            })}
          </div>
          <div class="signup-bottom">
            <div class="privacy-note">
              ${icon("shield")}
              <span>Τα στοιχεία σου αποθηκεύονται μόνο σε αυτή τη συσκευή.</span>
            </div>
            <button class="button button-dark" type="submit">Σύνδεση</button>
            <p class="login-link">
              Δεν έχεις λογαριασμό;
              <button type="button" data-action="replaceSignup">Δημιουργία</button>
            </p>
          </div>
        </form>
      </div>
    </main>`;
}

/* --------------------------------------------------------------------------
   03 ΕΡΩΤΗΜΑΤΟΛΟΓΙΟ ΠΡΟΤΙΜΗΣΕΩΝ
   -------------------------------------------------------------------------- */
var TRAIL_OPTIONS = [
  { name: "Κορυφές", icon: "peaks" },
  { name: "Φαράγγια", svg: "elevation" },
  { name: "Δασικά μονοπάτια", icon: "tree" },
  { name: "Λίμνες & ποτάμια", icon: "droplet" },
  { name: "Πέτρινα χωριά", svg: "landmark" },
  { name: "Συνδυασμός", icon: "layers" }
];

var DIFFICULTY_TEXT = {
  Εύκολη: "Ομαλά μονοπάτια, μικρή υψομετρική, ιδανικό για αρχάριους",
  Μέτρια: "Ανηφόρες και κατηφόρες, έως ~800 m υψομετρική",
  Δύσκολη: "Μεγάλες αναβάσεις, απαιτεί καλή φυσική κατάσταση"
};

var DURATION_TEXT = {
  "Λίγες ώρες": "Έως 3 ώρες περπάτημα",
  "Μισή μέρα": "Περίπου 4–5 ώρες στο μονοπάτι",
  "Ολόκληρη μέρα": "6+ ώρες, πρωί μέχρι απόγευμα"
};

var COMPANY_OPTIONS = [
  { name: "Με ομάδα", text: "Θέλω να βρίσκω ομαδικές πεζοπορίες και νέα παρέα", svg: "users" },
  { name: "Με φίλους", text: "Οργανώνω πεζοπορίες με τη δική μου παρέα", icon: "user" },
  { name: "Μόνος/η", text: "Περπατάω στο δικό μου ρυθμό", icon: "compass" }
];

function optionButton(opts) {
  return `<button class="${cls("landscape-option", opts.active && "active")}"
      data-action="${opts.action}" data-value="${esc(opts.value)}" aria-pressed="${!!opts.active}">
      <span>${opts.iconHtml}</span>
      <b>${esc(opts.label)}</b>
      ${opts.text ? `<small>${esc(opts.text)}</small>` : ""}
    </button>`;
}

function onboardingDraft() {
  if (!S.ui.onboarding) {
    var user = currentUser();
    var prefs = user ? user.prefs : EMPTY_PREFS;
    S.ui.onboarding = {
      step: 0,
      trails: prefs.trails.slice(),
      difficulty: prefs.difficulty,
      duration: prefs.duration,
      company: prefs.company
    };
  }
  return S.ui.onboarding;
}

function onboardingSteps(draft) {
  return [
    {
      title: "Τι μονοπάτια σε τραβούν στο βουνό;",
      text: "Μπορείς να διαλέξεις περισσότερα από ένα. Αλλάζει ανά πάσα στιγμή από το προφίλ σου.",
      single: false,
      content: TRAIL_OPTIONS.map(function (o) {
        return optionButton({
          active: draft.trails.indexOf(o.name) !== -1,
          action: "toggleTrail",
          value: o.name,
          iconHtml: o.icon ? icon(o.icon) : svgIcon(o.svg, 22),
          label: o.name
        });
      }).join("")
    },
    {
      title: "Πόσο απαιτητική πεζοπορία θέλεις;",
      text: "Διάλεξε το επίπεδο που σου ταιριάζει. Θα βλέπεις πρώτα αυτές τις διαδρομές.",
      single: true,
      content: DIFFICULTIES.map(function (d) {
        return optionButton({
          active: draft.difficulty === d,
          action: "pickDifficulty",
          value: d,
          iconHtml: icon("sliders"),
          label: d,
          text: DIFFICULTY_TEXT[d]
        });
      }).join("")
    },
    {
      title: "Πόση ώρα θέλεις να περπατάς;",
      text: "Η συνολική διάρκεια της πεζοπορίας, μαζί με τις στάσεις.",
      single: true,
      content: DURATIONS.map(function (d) {
        return optionButton({
          active: draft.duration === d,
          action: "pickDuration",
          value: d,
          iconHtml: icon("clock"),
          label: d,
          text: DURATION_TEXT[d]
        });
      }).join("")
    },
    {
      title: "Με ποιον ανεβαίνεις στο βουνό;",
      text: "Αν σου αρέσει η παρέα, θα σου προτείνουμε ομαδικές πεζοπορίες με ελεύθερες θέσεις.",
      single: true,
      content: COMPANY_OPTIONS.map(function (o) {
        return optionButton({
          active: draft.company === o.name,
          action: "pickCompany",
          value: o.name,
          iconHtml: o.icon ? icon(o.icon) : svgIcon(o.svg, 22),
          label: o.name,
          text: o.text
        });
      }).join("")
    }
  ];
}

function onboardingScreen(edit) {
  var draft = onboardingDraft();
  var steps = onboardingSteps(draft);
  var current = steps[draft.step];
  var last = draft.step === steps.length - 1;
  var dots = steps
    .map(function (_, i) {
      return `<i class="${i <= draft.step ? "done" : ""}"></i>`;
    })
    .join("");

  return `<main class="paper-page onboarding-page">
      <div class="preferences-layout">
        <div class="progress-row">
          ${
            draft.step > 0 || edit
              ? backButton("onboardingBack")
              : '<span class="back-placeholder"></span>'
          }
          <div class="progress" aria-label="Ερώτηση ${draft.step + 1} από ${steps.length}">
            ${dots}
          </div>
          <span>${draft.step + 1} από ${steps.length}</span>
        </div>

        <header class="preferences-heading">
          <h1>${esc(current.title)}</h1>
          <p>${esc(current.text)}</p>
        </header>

        <div class="${cls("landscape-grid", current.single && "single")}">${current.content}</div>

        <div class="preferences-actions">
          <button class="button button-dark" data-action="onboardingNext">
            ${last ? (edit ? "Αποθήκευση" : "Δες τις πεζοπορίες σου") : "Συνέχεια"}
          </button>
          <button class="text-button" data-action="onboardingNext">Παράλειψη</button>
        </div>
      </div>
    </main>`;
}

/* --------------------------------------------------------------------------
   ΕΙΔΟΠΟΙΗΣΕΙΣ
   -------------------------------------------------------------------------- */
function notificationItems() {
  var items = [];
  S.trips
    .filter(function (t) {
      return isParticipant(t) && t.date >= todayISO() && daysUntil(t.date) <= 7;
    })
    .sort(function (a, b) {
      return a.date.localeCompare(b.date);
    })
    .forEach(function (t) {
      var d = getDestination(t.destinationId);
      if (!d) return;
      items.push({
        id: "soon-" + t.id,
        tripId: t.id,
        title: relativeDay(t.date) + ": " + d.name,
        text: "Συνάντηση " + t.time + " — " + t.meetingPoint
      });
      var w = weatherOf(d.id, t.date);
      if (w && w.rainy) {
        items.push({
          id: "rain-" + t.id,
          tripId: t.id,
          title: "Πιθανή βροχή στο " + d.name,
          text: w.rain + "% πιθανότητα βροχής την " + formatDay(t.date) + ". Πάρε αδιάβροχο.",
          warn: true
        });
      }
    });
  return items;
}

function notificationsSheet() {
  var items = notificationItems();
  var body =
    items.length === 0
      ? `<p class="sheet-text">
          Δεν έχεις νέες ειδοποιήσεις. Μπες σε μια ομαδική εκδρομή για να λαμβάνεις υπενθυμίσεις και
          ειδοποιήσεις καιρού.
        </p>`
      : `<div class="notification-list">
          ${items
            .map(function (n) {
              return `<button class="${cls("notification", n.warn && "warn")}"
                data-action="openTripFromNotification" data-id="${esc(n.tripId)}">
                <span>${n.warn ? svgIcon("warning", 18) : svgIcon("calendar", 18)}</span>
                <div>
                  <b>${esc(n.title)}</b>
                  <small>${esc(n.text)}</small>
                </div>
                ${svgIcon("chevron", 18)}
              </button>`;
            })
            .join("")}
        </div>`;
  return sheetHtml("Ειδοποιήσεις", body);
}

/* --------------------------------------------------------------------------
   04 ΑΡΧΙΚΗ
   -------------------------------------------------------------------------- */
function homeScreen() {
  var user = currentUser();
  var prefs = user ? user.prefs : EMPTY_PREFS;
  var date = S.ui.homeDate;
  var activity = S.ui.homeActivity;
  var saturday = nextSaturday();

  var ranked = DESTINATIONS.filter(function (d) {
    return activity === "Όλα" || d.activity === activity;
  })
    .map(function (d) {
      var weather = weatherOf(d.id, date);
      var r = recommend(d, prefs, weather, openTripsFor(d.id, S.trips).length);
      return { d: d, weather: weather, score: r.score, reason: r.reason };
    })
    .sort(function (a, b) {
      return b.score - a.score;
    });

  var list = S.ui.homeShowAll ? ranked : ranked.slice(0, 4);
  var first = list[0];
  var rest = list.slice(1);

  var upcoming = S.trips
    .filter(function (t) {
      return t.date >= todayISO();
    })
    .sort(function (a, b) {
      return a.date.localeCompare(b.date);
    })
    .slice(0, 6);

  var notifications = notificationItems();
  var showPrefsCallout = !prefs.trails.length && !prefs.difficulty;

  var chips = ["Όλα"].concat(ACTIVITIES).map(function (chip) {
    return `<button class="${activity === chip ? "active" : ""}"
        data-action="setHomeActivity" data-value="${esc(chip)}">${esc(chip)}</button>`;
  });

  return `<main class="paper-page home-page">
      <div class="home-layout">
        <header class="home-heading top-bar">
          <div>
            <span>${greeting()}, ${esc(
              isGuest() ? "επισκέπτη" : user ? user.name.split(" ")[0] : ""
            )}</span>
            <h1>Πού θέλεις να πας;</h1>
          </div>
          <button class="circle-button" aria-label="Ειδοποιήσεις" data-action="openNotifications">
            ${icon("bell")}
            ${notifications.length > 0 ? '<i class="dot"></i>' : ""}
          </button>
        </header>

        <div class="search-box">
          ${icon("search")}
          <button class="search-trigger" data-action="goExploreFocus">
            Αναζήτηση μέρους ή περιοχής
          </button>
          <button class="filter-button" data-action="goExploreFilters" aria-label="Άνοιγμα φίλτρων">
            ${icon("filter")}
          </button>
        </div>

        <div class="category-scroll">
          <button class="${date ? "active" : ""}" data-action="toggleHomeDate"
            aria-pressed="${!!date}">${esc(formatDay(saturday))}</button>
          ${chips.join("")}
        </div>

        ${
          date
            ? `<p class="context-note">
                Προτάσεις και καιρός για ${esc(formatDay(date))}. Πάτησε ξανά την ημερομηνία για
                σήμερα.
              </p>`
            : ""
        }

        <div class="section-title">
          <h2>Προτείνεται για εσένα</h2>
          ${
            ranked.length > 4
              ? `<button data-action="toggleShowAll">${
                  S.ui.homeShowAll ? "Λιγότερα" : "Όλα"
                }</button>`
              : ""
          }
        </div>

        ${
          showPrefsCallout
            ? `<button class="prefs-callout" data-action="editPrefs">
                ${icon("compass")}
                <span>Πες μας τι πεζοπορίες σου αρέσουν για πιο προσωπικές προτάσεις</span>
                ${svgIcon("chevron", 18)}
              </button>`
            : ""
        }

        ${
          first
            ? `<div class="feed">
                ${featuredCard(first.d, first.weather, weatherState.loading, first.reason)}
                <div class="feed-list">
                  ${rest
                    .map(function (item) {
                      return compactCard(item.d, item.weather, item.reason, false);
                    })
                    .join("")}
                </div>
              </div>`
            : emptyState(
                icon("search"),
                "Δεν βρέθηκαν προορισμοί",
                "Δοκίμασε άλλη δραστηριότητα."
              )
        }

        <div class="section-title">
          <h2>Ομαδικές εκδρομές σύντομα</h2>
          <button data-action="navTab" data-tab="trips">Όλες</button>
        </div>
        <div class="trip-scroll">
          ${upcoming.map(tripCardHtml).join("")}
        </div>
      </div>
    </main>`;
}

/* --------------------------------------------------------------------------
   05 ΑΝΑΖΗΤΗΣΗ & ΦΙΛΤΡΑ
   -------------------------------------------------------------------------- */
function filterSheet() {
  if (!S.ui.filterDraft) S.ui.filterDraft = JSON.parse(JSON.stringify(S.filters));
  var draft = S.ui.filterDraft;

  var count = DESTINATIONS.filter(function (d) {
    return matchesFilters(d, draft, S.trips, weatherOf(d.id, null));
  }).length;

  var groups = [
    { title: "Περιοχή", key: "regions", items: REGIONS },
    { title: "Δραστηριότητα", key: "activities", items: ACTIVITIES },
    { title: "Δυσκολία", key: "difficulties", items: DIFFICULTIES },
    { title: "Διάρκεια", key: "durations", items: DURATIONS }
  ];

  var groupsHtml = groups
    .map(function (group) {
      var chips = group.items
        .map(function (item) {
          var selected = draft[group.key].indexOf(item) !== -1;
          return `<button class="${selected ? "selected" : ""}" aria-pressed="${selected}"
            data-action="toggleFilter" data-key="${group.key}" data-value="${esc(item)}">
            ${esc(item)}
          </button>`;
        })
        .join("");
      return `<div class="filter-group">
          <h3>${esc(group.title)}</h3>
          <div class="filter-chips">${chips}</div>
        </div>`;
    })
    .join("");

  var weatherChips = [
    ["avoid-rain", "Απόφυγε τη βροχή"],
    ["any", "Δεν με πειράζει η βροχή"]
  ]
    .map(function (pair) {
      var selected = draft.weather === pair[0];
      return `<button class="${selected ? "selected" : ""}" aria-pressed="${selected}"
        data-action="setFilterWeather" data-value="${pair[0]}">${esc(pair[1])}</button>`;
    })
    .join("");

  var body = `${groupsHtml}
    <div class="filter-group">
      <h3>Καιρός</h3>
      <div class="filter-chips">${weatherChips}</div>
    </div>
    <label class="toggle-row">
      <span>Μόνο με διαθέσιμη ομαδική εκδρομή</span>
      <input type="checkbox" data-action="toggleGroupOnly" ${draft.groupOnly ? "checked" : ""}>
      <i></i>
    </label>
    <button class="button button-dark" data-action="applyFilters" ${count === 0 ? "disabled" : ""}>
      ${
        count === 0
          ? "Κανένα αποτέλεσμα"
          : "Εμφάνιση " + count + " " + (count === 1 ? "αποτελέσματος" : "αποτελεσμάτων")
      }
    </button>`;

  return sheetHtml(
    "Φίλτρα",
    body,
    '<button data-action="clearFilterDraft">Καθαρισμός φίλτρων</button>'
  );
}

function exploreScreen() {
  var user = currentUser();
  var f = S.filters;

  var results = DESTINATIONS.map(function (d) {
    var weather = weatherOf(d.id, null);
    var r = recommend(
      d,
      user ? user.prefs : EMPTY_PREFS,
      weather,
      openTripsFor(d.id, S.trips).length
    );
    return { d: d, weather: weather, score: r.score, reason: r.reason };
  })
    .filter(function (r) {
      return matchesFilters(r.d, f, S.trips, r.weather);
    })
    .sort(function (a, b) {
      return b.score - a.score;
    });

  var activeCount = activeFilterCount(f);

  var chips = [];
  ["regions", "activities", "difficulties", "durations"].forEach(function (key) {
    f[key].forEach(function (value) {
      chips.push({ label: value, key: key, value: value });
    });
  });
  if (f.weather === "avoid-rain") chips.push({ label: "Χωρίς βροχή", key: "weather" });
  if (f.groupOnly) chips.push({ label: "Με ομαδική εκδρομή", key: "groupOnly" });

  return `<main class="paper-page">
      <div class="home-layout">
        <header class="home-heading top-bar stacked">
          <h1>Αναζήτηση</h1>
          <div class="search-box">
            ${icon("search")}
            <input data-field="query" aria-label="Αναζήτηση"
              placeholder="Αναζήτηση μέρους ή περιοχής" value="${esc(f.query)}">
            ${
              f.query
                ? `<button class="clear-search" data-action="clearQuery"
                    aria-label="Καθαρισμός αναζήτησης">${svgIcon("close", 16)}</button>`
                : ""
            }
            <button class="filter-button" data-action="openFilters" aria-label="Άνοιγμα φίλτρων">
              ${icon("filter")}
              ${activeCount > 0 ? `<i class="count">${activeCount}</i>` : ""}
            </button>
          </div>
        </header>

        ${
          chips.length
            ? `<div class="category-scroll">
                ${chips
                  .map(function (chip) {
                    return `<button class="active removable" data-action="removeFilterChip"
                      data-key="${chip.key}" data-value="${esc(chip.value || "")}">
                      ${esc(chip.label)}${svgIcon("close", 14)}
                    </button>`;
                  })
                  .join("")}
              </div>`
            : ""
        }

        <div class="section-title">
          <h2>${results.length} ${results.length === 1 ? "προορισμός" : "προορισμοί"}</h2>
          ${
            activeCount > 0 || f.query
              ? '<button data-action="clearAllFilters">Καθαρισμός</button>'
              : ""
          }
        </div>

        ${
          results.length
            ? `<div class="results-grid">
                ${results
                  .map(function (r) {
                    return compactCard(r.d, r.weather, r.reason, true);
                  })
                  .join("")}
              </div>`
            : emptyState(
                icon("search"),
                "Δεν βρέθηκε κάτι",
                "Δοκίμασε άλλη λέξη ή λιγότερα φίλτρα.",
                `<button class="button button-dark" data-action="clearAllFilters">
                  Καθαρισμός όλων
                </button>`
              )
        }
      </div>
    </main>`;
}

/* --------------------------------------------------------------------------
   06 ΣΕΛΙΔΑ ΠΡΟΟΡΙΣΜΟΥ (+ 07 καιρός 7 ημερών)
   -------------------------------------------------------------------------- */
function destinationScreen(id) {
  var d = getDestination(id);
  if (!d) {
    return `<main class="paper-page"><div class="home-layout">
        ${emptyState(icon("search"), "Ο προορισμός δεν βρέθηκε", "")}
      </div></main>`;
  }

  var forecast = weatherState.data ? weatherState.data[d.id] : null;
  var now = weatherFor(forecast, null);
  var week = forecast ? forecast.daily.slice(0, 7) : [];
  var rainyDays = week.filter(function (day) {
    var w = weatherFor(forecast, day.date);
    return w && w.rainy;
  });
  var bestDay = week
    .filter(function (day) {
      var w = weatherFor(forecast, day.date);
      return w && !w.rainy;
    })
    .sort(function (a, b) {
      return a.rain - b.rain;
    })[0];

  var groupTrips = S.trips
    .filter(function (t) {
      return t.destinationId === d.id && t.date >= todayISO();
    })
    .sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });

  var stats = [
    { icon: icon("sliders"), label: "Δυσκολία", value: d.difficulty },
    { icon: icon("clock"), label: "Διάρκεια", value: d.hours + " ώρες" },
    { icon: svgIcon("route", 16), label: "Απόσταση", value: d.distanceKm + " km" },
    { icon: svgIcon("elevation", 16), label: "Υψομετρική", value: d.elevation + " m" }
  ];

  return `<main class="paper-page">
      <div class="home-layout detail-layout">
        <header class="detail-bar top-bar">
          ${backButton()}
          <div>
            <b>${esc(d.name)}</b>
            <small>${esc(d.region)}</small>
          </div>
          ${favoriteButton(d.id, "favorite bar")}
        </header>

        <div class="detail-hero">
          <img src="${esc(assetUrl(d.image))}" alt="${esc(d.name)}">
          ${
            now
              ? `<span class="${cls("weather", now.rainy && "rainy")}">
                  ${weatherIcon(now.code, 14)}Τώρα ${now.temp}° · ${esc(now.label)}
                </span>`
              : ""
          }
        </div>

        <section class="detail-intro">
          <div class="tags">
            <span>${esc(d.activity)}</span>
            ${d.landscapes
              .map(function (l) {
                return `<span>${esc(l)}</span>`;
              })
              .join("")}
          </div>
          <h1>${esc(d.name)}</h1>
          <p class="area">${esc(d.area)}</p>
          <p>${esc(d.description)}</p>
        </section>

        <div class="stat-grid">
          ${stats
            .map(function (s) {
              return `<div>${s.icon}<small>${esc(s.label)}</small><b>${esc(s.value)}</b></div>`;
            })
            .join("")}
        </div>

        <section class="panel">
          <h2>Πρόγνωση 7 ημερών</h2>
          ${weatherState.loading ? '<p class="muted-text">Φόρτωση πρόγνωσης…</p>' : ""}
          ${
            weatherState.error
              ? '<p class="muted-text">Η πρόγνωση δεν είναι διαθέσιμη αυτή τη στιγμή.</p>'
              : ""
          }
          ${
            week.length
              ? `<div class="forecast-row">
                  ${week
                    .map(function (day) {
                      var w = weatherFor(forecast, day.date);
                      return `<div class="${cls(
                        "forecast-day",
                        w && w.rainy && "rainy",
                        bestDay && bestDay.date === day.date && "best"
                      )}">
                        <small>${esc(weekdayShort(day.date))}</small>
                        ${weatherIcon(day.code, 22)}
                        <b>${day.max}°</b>
                        <small>${day.min}°</small>
                        <small class="rain">${day.rain}%</small>
                      </div>`;
                    })
                    .join("")}
                </div>
                ${
                  bestDay
                    ? `<div class="reason">${icon("compass")}
                        Καλύτερη μέρα για εξόρμηση: ${esc(formatDay(bestDay.date))}
                        (${bestDay.max}°, ${bestDay.rain}% βροχή).
                      </div>`
                    : ""
                }
                ${
                  rainyDays.length
                    ? `<div class="reason warn">${svgIcon("warning", 14)}
                        Πιθανή βροχή: ${esc(
                          rainyDays
                            .map(function (day) {
                              return weekdayShort(day.date);
                            })
                            .join(", ")
                        )}.
                      </div>`
                    : ""
                }`
              : ""
          }
        </section>

        <section class="panel">
          <h2>Αξίζει να δεις</h2>
          <ul class="highlights">
            ${d.highlights
              .map(function (h) {
                return `<li>${esc(h)}</li>`;
              })
              .join("")}
          </ul>
          <div class="privacy-note">${icon("shield")}<span>${esc(d.tip)}</span></div>
        </section>

        <section class="detail-trips">
          <div class="section-title">
            <h2>Ομαδικές εκδρομές</h2>
            <span class="muted-text">${groupTrips.length} διαθέσιμες</span>
          </div>
          ${
            groupTrips.length
              ? `<div class="trip-list">${groupTrips.map(tripCardHtml).join("")}</div>`
              : emptyState(
                  svgIcon("users", 26),
                  "Καμία ομάδα ακόμα",
                  "Γίνε ο πρώτος που θα οργανώσει εκδρομή εδώ."
                )
          }
          <button class="button button-dark with-icon" data-action="createTripHere"
            data-id="${esc(d.id)}">
            ${svgIcon("plus", 18)}Οργάνωσε ομαδική εκδρομή
          </button>
        </section>
      </div>
    </main>`;
}

/* --------------------------------------------------------------------------
   08 ΕΚΔΡΟΜΕΣ
   -------------------------------------------------------------------------- */
function tripsScreen() {
  var tab = S.ui.tripsTab;
  var upcoming = S.trips
    .filter(function (t) {
      return t.date >= todayISO();
    })
    .sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });
  var mine = S.trips.filter(isParticipant).sort(function (a, b) {
    return a.date.localeCompare(b.date);
  });
  var list = tab === "upcoming" ? upcoming : mine;

  return `<main class="paper-page">
      <div class="home-layout">
        <header class="home-heading top-bar">
          <div>
            <span>Βρες την παρέα σου</span>
            <h1>Ομαδικές εκδρομές</h1>
          </div>
          <button class="circle-button dark" aria-label="Νέα εκδρομή" data-action="createTripNew">
            ${svgIcon("plus")}
          </button>
        </header>

        <div class="segmented" role="tablist">
          <button role="tab" aria-selected="${tab === "upcoming"}"
            class="${tab === "upcoming" ? "active" : ""}"
            data-action="setTripsTab" data-value="upcoming">
            Επερχόμενες (${upcoming.length})
          </button>
          <button role="tab" aria-selected="${tab === "mine"}"
            class="${tab === "mine" ? "active" : ""}"
            data-action="setTripsTab" data-value="mine">
            Οι δικές μου (${mine.length})
          </button>
        </div>

        ${
          list.length
            ? `<div class="trip-list">${list.map(tripCardHtml).join("")}</div>`
            : emptyState(
                svgIcon("users", 26),
                tab === "mine" ? "Δεν συμμετέχεις σε εκδρομές" : "Καμία επερχόμενη εκδρομή",
                "Μπες σε μια ομάδα ή οργάνωσε τη δική σου εξόρμηση.",
                tab === "mine"
                  ? `<button class="button button-dark" data-action="setTripsTab"
                      data-value="upcoming">Δες τις επερχόμενες</button>`
                  : `<button class="button button-dark" data-action="createTripNew">
                      Οργάνωσε εκδρομή</button>`
              )
        }
      </div>
    </main>`;
}

/* --------------------------------------------------------------------------
   10 ΛΕΠΤΟΜΕΡΕΙΕΣ ΕΚΔΡΟΜΗΣ & ΟΜΑΔΙΚΗ ΣΥΝΟΜΙΛΙΑ
   -------------------------------------------------------------------------- */
function tripDetailScreen(id) {
  var trip = null;
  S.trips.forEach(function (t) {
    if (t.id === id) trip = t;
  });
  var d = trip ? getDestination(trip.destinationId) : null;

  if (!trip || !d) {
    return `<main class="paper-page"><div class="home-layout">
        <header class="detail-bar top-bar">${backButton()}</header>
        ${emptyState(
          svgIcon("users", 26),
          "Η εκδρομή δεν υπάρχει πια",
          "Μπορεί να ακυρώθηκε από τον διοργανωτή."
        )}
      </div></main>`;
  }

  var m = me();
  var joined = isParticipant(trip);
  var organizer = isOrganizer(trip);
  var spots = trip.maxPeople - trip.participants.length;
  var past = trip.date < todayISO();
  var weather = weatherOf(d.id, trip.date);

  var actions;
  if (past) {
    actions = '<p class="muted-text">Αυτή η εκδρομή έχει ολοκληρωθεί.</p>';
  } else if (organizer) {
    actions = S.ui.confirmCancel
      ? `<div class="confirm">
          <p>Σίγουρα θέλεις να ακυρώσεις την εκδρομή για όλους;</p>
          <button class="button button-danger" data-action="cancelTrip" data-id="${esc(trip.id)}">
            Ναι, ακύρωση
          </button>
          <button class="text-button" data-action="dismissCancel">Όχι</button>
        </div>`
      : `<button class="button button-outline-dark" data-action="askCancel">
          Ακύρωση εκδρομής
        </button>`;
  } else if (joined) {
    actions = `<button class="button button-outline-dark" data-action="leaveTrip"
        data-id="${esc(trip.id)}">Αποχώρηση από την ομάδα</button>`;
  } else {
    actions = `<button class="button button-dark" data-action="joinTrip" data-id="${esc(trip.id)}"
        ${spots <= 0 ? "disabled" : ""}>
        ${
          spots <= 0
            ? "Η ομάδα είναι πλήρης"
            : "Συμμετοχή · " + spots + " " + (spots === 1 ? "θέση" : "θέσεις")
        }
      </button>`;
  }

  var chat = joined
    ? `<div class="messages" data-scroll-bottom>
        ${trip.messages.length === 0 ? '<p class="muted-text">Πες ένα γεια στην ομάδα!</p>' : ""}
        ${trip.messages
          .map(function (msg) {
            var mineMsg = !!m && msg.author.email === m.email;
            return `<div class="${cls("message", mineMsg && "mine")}">
              ${!mineMsg ? `<b>${esc(msg.author.name)}</b>` : ""}
              <p>${esc(msg.text)}</p>
              <small>${esc(formatTime(msg.at))}</small>
            </div>`;
          })
          .join("")}
      </div>
      <form class="chat-input" data-action="sendMessage" data-id="${esc(trip.id)}">
        <input name="text" data-field="message" placeholder="Γράψε ένα μήνυμα…" aria-label="Μήνυμα">
        <button type="submit" aria-label="Αποστολή">${svgIcon("send", 18)}</button>
      </form>`
    : '<p class="muted-text">Η συνομιλία είναι διαθέσιμη μόνο στα μέλη της ομάδας.</p>';

  return `<main class="paper-page">
      <div class="home-layout detail-layout">
        <header class="detail-bar top-bar">
          ${backButton()}
          <div>
            <b>${esc(d.name)}</b>
            <small>Ομαδική εκδρομή</small>
          </div>
          <span class="back-placeholder"></span>
        </header>

        <button class="detail-hero small" data-action="openDestination" data-id="${esc(d.id)}">
          <img src="${esc(assetUrl(d.image))}" alt="${esc(d.name)}">
          <span class="weather">Δες τον προορισμό</span>
        </button>

        <section class="detail-intro">
          <span class="trip-date">${esc(relativeDay(trip.date))}</span>
          <h1>${esc(d.name)}</h1>
          <p>${esc(trip.description)}</p>
        </section>

        <section class="panel info-list">
          <div>
            ${svgIcon("calendar", 18)}
            <span>
              <b>${esc(formatLongDay(trip.date))}</b>
              <small>Συνάντηση στις ${esc(trip.time)}</small>
            </span>
          </div>
          <div>
            ${svgIcon("pin", 18)}
            <span>
              <b>${esc(trip.meetingPoint)}</b>
              <small>${esc(d.area)}</small>
            </span>
          </div>
          <div>
            ${weather ? weatherIcon(weather.code, 18) : svgIcon("warning", 18)}
            <span>
              <b>${
                weather ? weather.temp + "° · " + esc(weather.label) : "Πρόγνωση σύντομα"
              }</b>
              <small>${
                weather
                  ? weather.rain + "% πιθανότητα βροχής" + (weather.rainy ? " — πάρε αδιάβροχο" : "")
                  : daysUntil(trip.date) > 13
                    ? "Θα εμφανιστεί πιο κοντά στην ημερομηνία."
                    : "Φόρτωση πρόγνωσης…"
              }</small>
            </span>
          </div>
        </section>

        <section class="panel">
          <div class="section-title">
            <h2>Συμμετέχοντες</h2>
            <span class="muted-text">${trip.participants.length}/${trip.maxPeople}</span>
          </div>
          <div class="capacity">
            <i style="width: ${(trip.participants.length / trip.maxPeople) * 100}%"></i>
          </div>
          <ul class="people">
            ${trip.participants
              .map(function (p) {
                var isOrg = p.email && p.email === trip.organizer.email;
                var isMe = m && p.email === m.email && !isOrg;
                return `<li>
                  <i>${esc(initials(p.name))}</i>
                  <span>${esc(p.name)}</span>
                  ${isOrg ? "<small>Διοργανωτής</small>" : ""}
                  ${isMe ? "<small>Εσύ</small>" : ""}
                </li>`;
              })
              .join("")}
          </ul>
        </section>

        <section class="panel chat">
          <h2>${svgIcon("chat", 18)} Συνομιλία ομάδας</h2>
          ${chat}
        </section>

        <div class="trip-actions">${actions}</div>
      </div>
    </main>`;
}

/* --------------------------------------------------------------------------
   09 ΔΗΜΙΟΥΡΓΙΑ ΕΚΔΡΟΜΗΣ
   -------------------------------------------------------------------------- */
function createTripDraft(destinationId) {
  if (!S.ui.createTrip) {
    S.ui.createTrip = {
      dest: destinationId || DESTINATIONS[0].id,
      date: addDays(7),
      time: "09:00",
      meetingPoint: "",
      maxPeople: 8,
      description: ""
    };
  }
  return S.ui.createTrip;
}

function createTripScreen(destinationId) {
  var t = createTripDraft(destinationId);
  var weather = weatherOf(t.dest, t.date);
  var errors = S.ui.submitted
    ? {
        date: t.date < todayISO() ? "Διάλεξε μελλοντική ημερομηνία." : "",
        meetingPoint: t.meetingPoint.trim().length < 3 ? "Γράψε σημείο συνάντησης." : ""
      }
    : {};

  return `<main class="paper-page">
      <div class="home-layout">
        <header class="detail-bar top-bar">
          ${backButton()}
          <div>
            <b>Νέα ομαδική εκδρομή</b>
            <small>Οργάνωσε και βρες παρέα</small>
          </div>
          <span class="back-placeholder"></span>
        </header>

        <form class="trip-form" data-action="submitTrip" novalidate>
          <label class="field">
            <span>Προορισμός</span>
            <div class="input-shell">
              ${svgIcon("pin", 20)}
              <select data-field="dest" data-action="updateTripField">
                ${DESTINATIONS.map(function (d) {
                  return `<option value="${esc(d.id)}" ${t.dest === d.id ? "selected" : ""}>
                    ${esc(d.name)} — ${esc(d.region)}
                  </option>`;
                }).join("")}
              </select>
            </div>
          </label>

          <div class="field-row">
            <label class="${cls("field", errors.date && "has-error")}">
              <span>Ημερομηνία</span>
              <div class="input-shell">
                <input type="date" min="${todayISO()}" value="${esc(t.date)}"
                  data-field="date" data-action="updateTripField">
              </div>
              ${errors.date ? `<small class="error">${esc(errors.date)}</small>` : ""}
            </label>
            <label class="field">
              <span>Ώρα</span>
              <div class="input-shell">
                <input type="time" value="${esc(t.time)}" data-field="time"
                  data-action="updateTripField">
              </div>
            </label>
          </div>

          ${
            weather
              ? `<div class="${cls("reason", weather.rainy && "warn")}">
                  ${weatherIcon(weather.code, 14)}
                  Πρόγνωση: ${weather.temp}° · ${esc(weather.label)} · ${weather.rain}% βροχή
                </div>`
              : ""
          }

          <label class="${cls("field", errors.meetingPoint && "has-error")}">
            <span>Σημείο συνάντησης</span>
            <div class="input-shell">
              ${svgIcon("pin", 20)}
              <input value="${esc(t.meetingPoint)}" data-field="meetingPoint"
                placeholder="π.χ. Κεντρική πλατεία">
            </div>
            ${
              errors.meetingPoint
                ? `<small class="error">${esc(errors.meetingPoint)}</small>`
                : ""
            }
          </label>

          <div class="field">
            <span>Μέγιστος αριθμός ατόμων</span>
            <div class="stepper">
              <button type="button" data-action="stepPeople" data-step="-1" aria-label="Λιγότερα">
                −
              </button>
              <b>${t.maxPeople}</b>
              <button type="button" data-action="stepPeople" data-step="1" aria-label="Περισσότερα">
                +
              </button>
            </div>
          </div>

          <label class="field">
            <span>Περιγραφή</span>
            <textarea rows="4" data-field="description"
              placeholder="Διαδρομή, ρυθμός, τι να φέρουν οι συμμετέχοντες…">${esc(
                t.description
              )}</textarea>
          </label>

          <button class="button button-dark" type="submit">Δημιουργία εκδρομής</button>
        </form>
      </div>
    </main>`;
}

/* --------------------------------------------------------------------------
   ΑΓΑΠΗΜΕΝΑ
   -------------------------------------------------------------------------- */
function favoritesScreen() {
  var list = favorites()
    .map(getDestination)
    .filter(function (d) {
      return !!d;
    });

  return `<main class="paper-page">
      <div class="home-layout">
        <header class="home-heading top-bar">
          <div>
            <span>Οι επιλογές σου</span>
            <h1>Αγαπημένα</h1>
          </div>
        </header>
        ${
          list.length
            ? `<div class="results-grid">
                ${list
                  .map(function (d) {
                    return compactCard(d, weatherOf(d.id, null), null, true);
                  })
                  .join("")}
              </div>`
            : emptyState(
                icon("heart"),
                "Δεν έχεις αγαπημένα ακόμα",
                "Πάτησε την καρδιά σε έναν προορισμό για να τον αποθηκεύσεις εδώ.",
                `<button class="button button-dark" data-action="navTab" data-tab="explore">
                  Εξερεύνηση προορισμών
                </button>`
              )
        }
      </div>
    </main>`;
}

/* --------------------------------------------------------------------------
   11 ΠΡΟΦΙΛ
   -------------------------------------------------------------------------- */
function profileScreen() {
  var user = currentUser();
  if (!user) return "";
  var guest = isGuest();
  var joined = S.trips.filter(isParticipant).length;
  var organized = S.trips.filter(isOrganizer).length;
  var prefs = []
    .concat(user.prefs.trails, [user.prefs.difficulty, user.prefs.duration, user.prefs.company])
    .filter(function (p) {
      return !!p;
    });

  return `<main class="paper-page">
      <div class="home-layout">
        <header class="home-heading top-bar">
          <div>
            <span>Ο λογαριασμός σου</span>
            <h1>Προφίλ</h1>
          </div>
        </header>

        <section class="profile-card">
          <span class="avatar">${guest ? "?" : esc(initials(user.name))}</span>
          <div>
            <h2>${guest ? "Επισκέπτης" : esc(user.name)}</h2>
            <p>${guest ? "Χωρίς λογαριασμό" : esc(user.email)}</p>
          </div>
        </section>

        ${
          guest
            ? `<section class="guest-callout">
                <b>Δημιούργησε λογαριασμό</b>
                <p>
                  Για να μπαίνεις σε ομαδικές εκδρομές, να οργανώνεις τις δικές σου και να
                  συνομιλείς με την ομάδα.
                </p>
                <button class="button button-light" data-action="goSignup">
                  Δημιουργία λογαριασμού
                </button>
              </section>`
            : ""
        }

        <div class="stat-grid three">
          <div><b>${joined}</b><small>Εκδρομές</small></div>
          <div><b>${organized}</b><small>Διοργάνωσες</small></div>
          <div><b>${favorites().length}</b><small>Αγαπημένα</small></div>
        </div>

        <section class="panel">
          <div class="section-title">
            <h2>Οι προτιμήσεις πεζοπορίας σου</h2>
            <button data-action="editPrefs">Επεξεργασία</button>
          </div>
          ${
            prefs.length
              ? `<div class="tags">${prefs
                  .map(function (p) {
                    return `<span>${esc(p)}</span>`;
                  })
                  .join("")}</div>`
              : '<p class="muted-text">Δεν έχεις ορίσει προτιμήσεις ακόμα.</p>'
          }
        </section>

        <div class="profile-actions">
          <button data-action="navTab" data-tab="trips">
            ${svgIcon("users")}Οι εκδρομές μου${svgIcon("chevron", 18)}
          </button>
          <button data-action="navTab" data-tab="favorites">
            ${icon("heart")}Αγαπημένα${svgIcon("chevron", 18)}
          </button>
          <button data-action="editPrefs">
            ${icon("peaks")}Προτιμήσεις πεζοπορίας${svgIcon("chevron", 18)}
          </button>
          <button data-action="resetDemo">
            ${icon("layers")}Επαναφορά δεδομένων demo${svgIcon("chevron", 18)}
          </button>
        </div>

        <button class="button button-outline-dark with-icon" data-action="logout">
          ${svgIcon("logout", 18)}${guest ? "Έξοδος" : "Αποσύνδεση"}
        </button>
        <p class="footnote">
          Τα δεδομένα αποθηκεύονται τοπικά σε αυτή τη συσκευή. Καιρός: Open-Meteo.
        </p>
      </div>
    </main>`;
}
