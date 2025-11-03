// /api/panchika.js — Madhabam Panchika Engine vB3 (12h time, stable layout)
let CACHE = { data: null, ts: 0, tideTs: 0 };

export default async function handler(req, res) {
  const lat = Number(req.query.lat || 22.5726);
  const lon = Number(req.query.lon || 88.3639);
  const now = Date.now();

  try {
    const PANCHIKA_TTL = 1000 * 60 * 60 * 3; // 3h
    const TIDE_TTL     = 1000 * 60 * 60 * 6; // 6h

    if (CACHE.data && (now - CACHE.ts) < PANCHIKA_TTL) {
      return res.status(200).json(CACHE.data);
    }

    // Sun/Moon
    let sunrise="06:00", sunset="17:00", moonrise="14:00", moonset="02:00";
    try {
      const urlAstro = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,moonrise,moonset&timezone=auto`;
      const astro = await fetch(urlAstro, { cache: "no-store" }).then(r => r.json());
      sunrise  = to12h(astro?.daily?.sunrise?.[0])  || sunrise;
      sunset   = to12h(astro?.daily?.sunset?.[0])   || sunset;
      moonrise = to12h(astro?.daily?.moonrise?.[0]) || moonrise;
      moonset  = to12h(astro?.daily?.moonset?.[0])  || moonset;
    } catch (_) {}

    // Tithi/Nakshatra (placeholder until siddhanta engine wired)
    const tithi = "—";
    const nakshatra = "—";

    // Tide (cached placeholder structure)
    let tide = CACHE.data?.tide || [
      { label: "উচ্চ জোয়ার", time: "—", height: "—" },
      { label: "উচ্চ জোয়ার", time: "—", height: "—" },
      { label: "নিম্ন ভাটা",  time: "—", height: "—" },
      { label: "নিম্ন ভাটা",  time: "—", height: "—" }
    ];
    if ((now - CACHE.tideTs) >= TIDE_TTL) {
      CACHE.tideTs = now;
    }

    // Ekadashi (placeholder but correct formatting)
    const ekadashiDate = "2025-11-15";
    const ekadashi = {
      name: "রমা একাদশী",
      date: ekadashiDate,
      days_left: daysLeft(ekadashiDate)
    };

    const out = {
      tithi, nakshatra,
      sunrise, sunset, moonrise, moonset,
      tide, ekadashi,
      updated: new Date().toISOString()
    };

    CACHE = { ...CACHE, data: out, ts: now };
    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: "Engine error", message: e?.message || String(e) });
  }
}

function daysLeft(dateStr) {
  try {
    const now = new Date();
    const d = new Date(dateStr + "T00:00:00");
    return Math.max(0, Math.ceil((d - now) / (1000*60*60*24)));
  } catch { return 0; }
}

function to12h(isoLike) {
  if (!isoLike) return null;
  // accepts "YYYY-MM-DDTHH:MM", or "HH:MM"
  let s = isoLike.includes("T") ? isoLike.split("T")[1] : isoLike;
  const [hStr, m] = s.split(":");
  let h = Number(hStr);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${pad(h)}:${m} ${ampm}`;
}
function pad(n){ return String(n).padStart(2,"0"); }
