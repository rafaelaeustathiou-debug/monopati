/* ==========================================================================
   TREKO — ΣΥΝΔΕΣΗ ΟΛΩΝ
   --------------------------------------------------------------------------
   1) render()  → ζωγραφίζει την τρέχουσα οθόνη
   2) ένας listener για τα κλικ, έναν για τις φόρμες, έναν για τα πεδία
   Κάθε κουμπί δηλώνει τι κάνει με data-action="..." και το βρίσκουμε εδώ.
   ========================================================================== */

/* --------------------------------------------------------------------------
   RENDER
   -------------------------------------------------------------------------- */
function currentScreenHtml() {
  var r = route();

  if (r.name === "welcome") return welcomeScreen();
  if (r.name === "login") return loginScreen();
  if (r.name === "signup") return signupScreen();

  var user = currentUser();
  if (!user) return welcomeScreen();

  /* Το ερωτηματολόγιο δείχνεται σε πλήρη οθόνη, χωρίς το κάτω μενού */
  if (r.name === "onboarding") return onboardingScreen(!!r.edit);

  var page;
  switch (r.name) {
    case "explore":
      page = exploreScreen();
      break;
    case "trips":
      page = tripsScreen();
      break;
    case "favorites":
      page = favoritesScreen();
      break;
    case "profile":
      page = profileScreen();
      break;
    case "destination":
      page = destinationScreen(r.id);
      break;
    case "trip":
      page = tripDetailScreen(r.id);
      break;
    case "createTrip":
      page = createTripScreen(r.destinationId);
      break;
    default:
      page = homeScreen();
  }
  return '<div class="app-shell">' + page + bottomNav() + "</div>";
}

function overlaysHtml() {
  var out = "";
  if (S.ui.sheet === "filters") out += filterSheet();
  if (S.ui.sheet === "notifications") out += notificationsSheet();
  out += authPromptHtml();
  out += toastHtml();
  return out;
}

function render() {
  var root = document.getElementById("root");
  var focus = captureFocus();

  root.innerHTML = currentScreenHtml() + overlaysHtml();

  restoreFocus(focus);
  document.querySelectorAll("[data-scroll-bottom]").forEach(function (box) {
    box.scrollTop = box.scrollHeight;
  });
}

/* Κρατάει το πεδίο που έγραφε ο χρήστης ενεργό μετά το redraw */
function captureFocus() {
  var el = document.activeElement;
  if (!el || !el.dataset || !el.dataset.field) return null;
  return {
    field: el.dataset.field,
    start: el.selectionStart,
    end: el.selectionEnd
  };
}

function restoreFocus(focus) {
  if (!focus) return;
  var el = document.querySelector('[data-field="' + focus.field + '"]');
  if (!el) return;
  el.focus();
  if (focus.start != null && el.setSelectionRange) {
    try {
      el.setSelectionRange(focus.start, focus.end);
    } catch (e) {
      /* τα date/time/select πεδία δεν υποστηρίζουν selection */
    }
  }
}

/* --------------------------------------------------------------------------
   ΚΛΙΚ
   -------------------------------------------------------------------------- */
var emailOk = function (email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

function closeOverlays() {
  S.ui.sheet = null;
  S.ui.filterDraft = null;
  S.authPrompt = null;
}

document.addEventListener("click", function (event) {
  /* Τα πεδία φόρμας τα χειρίζονται οι listeners input/change */
  if (event.target.closest("input, select, textarea")) return;

  var el = event.target.closest("[data-action]");
  if (!el || el.tagName === "FORM") return;

  var action = el.dataset.action;
  var id = el.dataset.id;
  var value = el.dataset.value;
  var draft;

  switch (action) {
    /* --- Πλοήγηση --- */
    case "back":
      back();
      return;
    case "goSignup":
      closeOverlays();
      go({ name: "signup" });
      return;
    case "goLogin":
      closeOverlays();
      go({ name: "login" });
      return;
    case "replaceLogin":
      replaceRoute({ name: "login" });
      return;
    case "replaceSignup":
      replaceRoute({ name: "signup" });
      return;
    case "continueAsGuest":
      continueAsGuest();
      return;
    case "logout":
      logout();
      return;
    case "navTab":
      closeOverlays();
      resetTo(
        el.dataset.tab === "explore" ? { name: "explore", focus: true } : { name: el.dataset.tab }
      );
      return;
    case "openDestination":
      go({ name: "destination", id: id });
      return;
    case "openTrip":
      go({ name: "trip", id: id });
      return;
    case "openTripFromNotification":
      closeOverlays();
      go({ name: "trip", id: id });
      return;
    case "createTripHere":
      if (requireAccount("Για να οργανώσεις ομαδική εκδρομή χρειάζεσαι λογαριασμό.")) {
        go({ name: "createTrip", destinationId: id });
      }
      return;
    case "createTripNew":
      if (requireAccount("Για να οργανώσεις ομαδική εκδρομή χρειάζεσαι λογαριασμό.")) {
        go({ name: "createTrip" });
      }
      return;
    case "editPrefs":
      go({ name: "onboarding", edit: true });
      return;
    case "goExploreFocus":
      go({ name: "explore", focus: true });
      return;
    case "goExploreFilters":
      go({ name: "explore", openFilters: true });
      return;
    case "promptSignup":
      S.authPrompt = null;
      go({ name: "signup" });
      return;
    case "promptLogin":
      S.authPrompt = null;
      logout({ name: "login" });
      return;

    /* --- Αρχική --- */
    case "setHomeActivity":
      S.ui.homeActivity = value;
      render();
      return;
    case "toggleHomeDate":
      S.ui.homeDate = S.ui.homeDate ? null : nextSaturday();
      render();
      return;
    case "toggleShowAll":
      S.ui.homeShowAll = !S.ui.homeShowAll;
      render();
      return;
    case "openNotifications":
      S.ui.sheet = "notifications";
      render();
      return;

    /* --- Αναζήτηση & φίλτρα --- */
    case "openFilters":
      S.ui.sheet = "filters";
      S.ui.filterDraft = JSON.parse(JSON.stringify(S.filters));
      render();
      return;
    case "closeSheet":
      closeOverlays();
      render();
      return;
    case "clearQuery":
      S.filters = Object.assign({}, S.filters, { query: "" });
      render();
      return;
    case "clearAllFilters":
      S.filters = JSON.parse(JSON.stringify(DEFAULT_FILTERS));
      render();
      return;
    case "removeFilterChip": {
      var key = el.dataset.key;
      var next = Object.assign({}, S.filters);
      if (key === "weather") next.weather = null;
      else if (key === "groupOnly") next.groupOnly = false;
      else
        next[key] = next[key].filter(function (x) {
          return x !== value;
        });
      S.filters = next;
      render();
      return;
    }
    case "toggleFilter": {
      draft = S.ui.filterDraft;
      var list = draft[el.dataset.key];
      draft[el.dataset.key] =
        list.indexOf(value) !== -1
          ? list.filter(function (x) {
              return x !== value;
            })
          : list.concat([value]);
      render();
      return;
    }
    case "setFilterWeather":
      draft = S.ui.filterDraft;
      draft.weather = draft.weather === value ? null : value;
      render();
      return;
    case "clearFilterDraft":
      S.ui.filterDraft = Object.assign(JSON.parse(JSON.stringify(DEFAULT_FILTERS)), {
        query: S.ui.filterDraft.query
      });
      render();
      return;
    case "applyFilters":
      S.filters = S.ui.filterDraft;
      closeOverlays();
      render();
      return;

    /* --- Ερωτηματολόγιο --- */
    case "toggleTrail":
      draft = onboardingDraft();
      draft.trails =
        draft.trails.indexOf(value) !== -1
          ? draft.trails.filter(function (x) {
              return x !== value;
            })
          : draft.trails.concat([value]);
      render();
      return;
    case "pickDifficulty":
      draft = onboardingDraft();
      draft.difficulty = draft.difficulty === value ? null : value;
      render();
      return;
    case "pickDuration":
      draft = onboardingDraft();
      draft.duration = draft.duration === value ? null : value;
      render();
      return;
    case "pickCompany":
      draft = onboardingDraft();
      draft.company = draft.company === value ? null : value;
      render();
      return;
    case "onboardingBack":
      draft = onboardingDraft();
      if (draft.step > 0) {
        draft.step -= 1;
        render();
      } else {
        back();
      }
      return;
    case "onboardingNext": {
      draft = onboardingDraft();
      var edit = !!route().edit;
      if (draft.step < 3) {
        draft.step += 1;
        render();
        return;
      }
      updatePrefs({
        trails: draft.trails,
        difficulty: draft.difficulty,
        duration: draft.duration,
        company: draft.company
      });
      showToast(
        edit ? "Οι προτιμήσεις σου ενημερώθηκαν" : "Έτοιμοι! Ορίστε οι πεζοπορίες για σένα."
      );
      if (edit) back();
      else resetTo({ name: "home" });
      return;
    }

    /* --- Εκδρομές --- */
    case "setTripsTab":
      S.ui.tripsTab = value;
      render();
      return;
    case "joinTrip":
      joinTrip(id);
      return;
    case "leaveTrip":
      leaveTrip(id);
      return;
    case "askCancel":
      S.ui.confirmCancel = true;
      render();
      return;
    case "dismissCancel":
      S.ui.confirmCancel = false;
      render();
      return;
    case "cancelTrip":
      cancelTrip(id);
      back();
      return;

    /* --- Διάφορα --- */
    case "toggleFavorite":
      toggleFavorite(id);
      return;
    case "resetDemo":
      resetDemo();
      return;
    case "stepPeople": {
      var t = createTripDraft();
      var step = Number(el.dataset.step);
      t.maxPeople = Math.min(30, Math.max(2, t.maxPeople + step));
      render();
      return;
    }
    default:
      return;
  }
});

/* Πληκτρολόγιο: Escape κλείνει τα φύλλα, Enter/Space ενεργοποιεί τις κάρτες */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    if (S.ui.sheet || S.authPrompt) {
      closeOverlays();
      render();
    }
    return;
  }
  if (event.key !== "Enter" && event.key !== " ") return;
  var el = event.target;
  if (!el.dataset || !el.dataset.action || el.getAttribute("role") !== "button") return;
  event.preventDefault();
  el.click();
});

/* --------------------------------------------------------------------------
   ΠΕΔΙΑ: γράψιμο (input) και αλλαγή (change)
   -------------------------------------------------------------------------- */
document.addEventListener("input", function (event) {
  var el = event.target;
  var field = el.dataset ? el.dataset.field : null;
  if (!field) return;

  /* Η αναζήτηση φιλτράρει καθώς γράφεις */
  if (field === "query") {
    S.filters = Object.assign({}, S.filters, { query: el.value });
    render();
    return;
  }

  /* Τα υπόλοιπα κρατιούνται σιωπηλά — δεν χρειάζεται redraw σε κάθε γράμμα */
  if (field === "meetingPoint" || field === "description") {
    createTripDraft()[field] = el.value;
    return;
  }
  if (route().name === "signup") {
    S.ui.signupDraft = S.ui.signupDraft || { name: "", email: "", password: "", accepted: true };
    if (field === "name" || field === "email" || field === "password") {
      S.ui.signupDraft[field] = el.value;
    }
    return;
  }
  if (route().name === "login") {
    S.ui.loginDraft = S.ui.loginDraft || { email: "", password: "" };
    if (field === "email" || field === "password") S.ui.loginDraft[field] = el.value;
  }
});

document.addEventListener("change", function (event) {
  var el = event.target;
  var action = el.dataset ? el.dataset.action : null;
  var field = el.dataset ? el.dataset.field : null;

  if (action === "toggleGroupOnly") {
    S.ui.filterDraft.groupOnly = el.checked;
    render();
    return;
  }
  if (field === "accepted") {
    S.ui.signupDraft = S.ui.signupDraft || { name: "", email: "", password: "", accepted: true };
    S.ui.signupDraft.accepted = el.checked;
    render();
    return;
  }
  /* Προορισμός / ημερομηνία / ώρα: αλλάζουν την πρόγνωση, άρα ξανασχεδιάζουμε */
  if (field === "dest" || field === "date" || field === "time") {
    createTripDraft()[field] = el.value;
    render();
  }
});

/* --------------------------------------------------------------------------
   ΦΟΡΜΕΣ
   -------------------------------------------------------------------------- */
function readForm(form) {
  var values = {};
  form.querySelectorAll("[data-field]").forEach(function (el) {
    values[el.dataset.field] = el.type === "checkbox" ? el.checked : el.value;
  });
  return values;
}

document.addEventListener("submit", function (event) {
  var form = event.target.closest("form[data-action]");
  if (!form) return;
  event.preventDefault();
  var action = form.dataset.action;

  if (action === "submitSignup") {
    var v = readForm(form);
    S.ui.signupDraft = {
      name: v.name || "",
      email: v.email || "",
      password: v.password || "",
      accepted: !!v.accepted
    };
    S.ui.submitted = true;
    S.ui.errors = {
      name: (v.name || "").trim().length < 2 ? "Γράψε τουλάχιστον 2 χαρακτήρες." : "",
      email: !emailOk(v.email || "") ? "Γράψε ένα έγκυρο email." : "",
      password: (v.password || "").length < 6 ? "Τουλάχιστον 6 χαρακτήρες." : ""
    };
    var valid =
      !S.ui.errors.name && !S.ui.errors.email && !S.ui.errors.password && S.ui.signupDraft.accepted;
    if (!valid) {
      render();
      return;
    }
    signup(v.name, v.email, v.password).then(function (error) {
      if (error) {
        S.ui.errors = { email: error };
        render();
      }
    });
    return;
  }

  if (action === "submitLogin") {
    var l = readForm(form);
    S.ui.loginDraft = { email: l.email || "", password: l.password || "" };
    if (!emailOk(l.email || "") || !l.password) {
      S.ui.formError = "Συμπλήρωσε email και κωδικό πρόσβασης.";
      render();
      return;
    }
    login(l.email, l.password).then(function (error) {
      if (error) {
        S.ui.formError = error;
        render();
      }
    });
    return;
  }

  if (action === "submitTrip") {
    var t = createTripDraft();
    var f = readForm(form);
    t.dest = f.dest || t.dest;
    t.date = f.date || t.date;
    t.time = f.time || t.time;
    t.meetingPoint = f.meetingPoint || "";
    t.description = f.description || "";
    S.ui.submitted = true;

    if (t.date < todayISO() || t.meetingPoint.trim().length < 3) {
      render();
      return;
    }
    var newId = createTrip({
      destinationId: t.dest,
      date: t.date,
      time: t.time,
      meetingPoint: t.meetingPoint.trim(),
      maxPeople: t.maxPeople,
      description: t.description.trim() || "Ομαδική εξόρμηση — έλα να γνωριστούμε!"
    });
    if (newId) replaceRoute({ name: "trip", id: newId });
    return;
  }

  if (action === "sendMessage") {
    var input = form.querySelector('[data-field="message"]');
    var text = input ? input.value : "";
    if (!text.trim()) return;
    sendMessage(form.dataset.id, text);
    render();
    var box = document.querySelector("[data-scroll-bottom]");
    if (box) box.scrollTop = box.scrollHeight;
  }
});

/* --------------------------------------------------------------------------
   ΕΚΚΙΝΗΣΗ
   -------------------------------------------------------------------------- */
render();
loadForecasts(render);
