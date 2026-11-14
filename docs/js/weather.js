/* ==========================================================================
   TREKO — ΚΑΙΡΟΣ (Open-Meteo, χωρίς API key)
   --------------------------------------------------------------------------
   Μία κλήση φέρνει την πρόγνωση 14 ημερών για όλους τους προορισμούς μαζί.
   Αν δεν υπάρχει internet, η εφαρμογή δουλεύει κανονικά — απλώς δεν δείχνει
   καιρό.
   ========================================================================== */

var weatherState = { data: null, error: false, loading: true };
var weatherRequested = false;

function loadForecasts(onDone) {
  if (weatherRequested) return;
  weatherRequested = true;

  var params =
    "latitude=" +
    DESTINATIONS.map(function (d) {
      return d.lat;
    }).join(",") +
    "&longitude=" +
    DESTINATIONS.map(function (d) {
      return d.lon;
    }).join(",") +
    "&current=temperature_2m,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
    "&timezone=Europe%2FAthens&forecast_days=14";

  fetch("https://api.open-meteo.com/v1/forecast?" + params)
    .then(function (response) {
      if (!response.ok) throw new Error("Weather request failed");
      return response.json();
    })
    .then(function (json) {
      var locations = Array.isArray(json) ? json : [json];
      var result = {};
      locations.forEach(function (loc, index) {
        var dest = DESTINATIONS[index];
        if (!dest || !loc || !loc.daily) return;
        result[dest.id] = {
          temp: Math.round(loc.current.temperature_2m),
          code: loc.current.weather_code,
          daily: loc.daily.time.map(function (date, i) {
            return {
              date: date,
              code: loc.daily.weather_code[i],
              max: Math.round(loc.daily.temperature_2m_max[i]),
              min: Math.round(loc.daily.temperature_2m_min[i]),
              rain: loc.daily.precipitation_probability_max[i] || 0
            };
          })
        };
      });
      weatherState = { data: result, error: false, loading: false };
      if (onDone) onDone();
    })
    .catch(function () {
      weatherState = { data: null, error: true, loading: false };
      if (onDone) onDone();
    });
}

/* Κωδικοί Open-Meteo → κατηγορία καιρού */
function weatherKind(code) {
  if (code === 0) return "sun";
  if (code <= 2) return "partly";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "rain";
}

var WEATHER_LABELS = {
  sun: "Ηλιοφάνεια",
  partly: "Λίγα σύννεφα",
  cloud: "Συννεφιά",
  fog: "Ομίχλη",
  rain: "Βροχή",
  snow: "Χιόνι",
  storm: "Καταιγίδα"
};

function weatherLabel(code) {
  return WEATHER_LABELS[weatherKind(code)];
}

function isRainy(code, rain) {
  var kind = weatherKind(code);
  return rain >= 50 || kind === "rain" || kind === "storm" || kind === "snow";
}

/* Ο καιρός τώρα, ή η πρόγνωση συγκεκριμένης ημέρας όταν δίνεται date */
function weatherFor(forecast, date) {
  if (!forecast) return null;
  if (date) {
    var day = null;
    for (var i = 0; i < forecast.daily.length; i++) {
      if (forecast.daily[i].date === date) {
        day = forecast.daily[i];
        break;
      }
    }
    if (!day) return null;
    return {
      code: day.code,
      temp: day.max,
      rain: day.rain,
      label: weatherLabel(day.code),
      rainy: isRainy(day.code, day.rain)
    };
  }
  var rain = forecast.daily[0] ? forecast.daily[0].rain : 0;
  return {
    code: forecast.code,
    temp: forecast.temp,
    rain: rain,
    label: weatherLabel(forecast.code),
    rainy: isRainy(forecast.code, rain)
  };
}

/* Σύντομο: ο καιρός για έναν προορισμό */
function weatherOf(destinationId, date) {
  if (!weatherState.data) return null;
  return weatherFor(weatherState.data[destinationId], date || null);
}
