/* ==========================================================================
   TREKO — ΕΙΚΟΝΙΔΙΑ
   --------------------------------------------------------------------------
   Δύο είδη:
   1) icon("search")  → εικονίδια-αρχεία από τον φάκελο assets/ (ήρθαν από το Figma)
   2) svgIcon("plus") → εικονίδια γραμμένα σε κώδικα (παίρνουν το χρώμα του κειμένου)
   ========================================================================== */

/* Φιλικό όνομα → αρχείο στον φάκελο assets/ */
var ICON_FILES = {
  back: "5098e.svg",
  heart: "2da5e.svg",
  mountain: "f6982.svg",
  sliders: "d0279.svg",
  clock: "e7b69.svg",
  compass: "9cc40.svg",
  user: "114a0.svg",
  mail: "5ee6b.svg",
  lock: "8a3ea.svg",
  check: "4af68.svg",
  shield: "0ef00.svg",
  search: "0d31e.svg",
  filter: "8f669.svg",
  bell: "f584c.svg",
  peaks: "a471a.svg",
  tree: "61b5c.svg",
  droplet: "a9422.svg",
  layers: "ef07e.svg",
  brandCircle: "e3ef7.svg"
};

function icon(name, className) {
  var file = ICON_FILES[name] || name;
  return (
    '<img class="' +
    (className || "") +
    '" src="' +
    assetUrl("assets/" + file) +
    '" alt="" aria-hidden="true">'
  );
}

/* Εικονίδια σε κώδικα: ακολουθούν το χρώμα του κειμένου (currentColor) */
var SVG_PATHS = {
  bike:
    '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/>' +
    '<path d="M5.5 16.5 9 9h6l3.5 7.5M9 9 7.5 6H5.5M15 9l-3.5 7.5"/>',
  landmark: '<path d="M3 21h18M5 21v-9M9.7 21v-9M14.3 21v-9M19 21v-9M3 12h18L12 4z"/>',
  umbrella: '<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9zM12 12v6.5a2 2 0 0 0 4 0"/>',
  users:
    '<circle cx="9" cy="8" r="3.5"/>' +
    '<path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  pin:
    '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/>' +
    '<circle cx="12" cy="9.5" r="2.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  route:
    '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/>' +
    '<path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
  elevation: '<path d="m2.5 19 6-8 4 5 3-4 6 7zM16 3.5v5M13.5 6 16 3.5 18.5 6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  warning: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>'
};

function svgIcon(name, size) {
  size = size || 20;
  return (
    '<svg width="' +
    size +
    '" height="' +
    size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (SVG_PATHS[name] || "") +
    "</svg>"
  );
}

/* --------------------------------------------------------------------------
   ΕΙΚΟΝΙΔΙΑ ΚΑΙΡΟΥ — ένα για κάθε κατάσταση
   -------------------------------------------------------------------------- */
var CLOUD_PATH = "M7 16h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 7.5 4.3 4.3 0 0 0 7 16z";

var WEATHER_PATHS = {
  sun:
    '<circle cx="12" cy="12" r="4"/>' +
    '<path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2' +
    'M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  partly:
    '<path d="M8 2.5V4M2.5 8H4M4.1 4.1l1 1M12.3 5.6A3.6 3.6 0 0 0 5.4 9.6"/>' +
    '<path d="M9 20h8a3.5 3.5 0 0 0 .5-7 5 5 0 0 0-9.4-.6A3.8 3.8 0 0 0 9 20z"/>',
  cloud: '<path d="M7 19h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 10.5 4.3 4.3 0 0 0 7 19z"/>',
  fog: '<path d="M4 8h16M3 12h18M5 16h14M8 20h8"/>',
  rain: '<path d="' + CLOUD_PATH + '"/><path d="M8.5 19l-1 2.5M12.5 19l-1 2.5M16.5 19l-1 2.5"/>',
  storm: '<path d="' + CLOUD_PATH + '"/><path d="m12.5 16-2 3.5h3l-2 3"/>',
  snow:
    '<path d="' + CLOUD_PATH + '"/>' +
    '<path d="M8 19.5h.01M12 19.5h.01M16 19.5h.01M10 22h.01M14 22h.01"/>'
};

function weatherIcon(code, size) {
  size = size || 16;
  return (
    '<svg width="' +
    size +
    '" height="' +
    size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (WEATHER_PATHS[weatherKind(code)] || "") +
    "</svg>"
  );
}
