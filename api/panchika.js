// /api/panchika.js — Madhabam Panchika Engine vB2 (Self-updating, Low-hit)
let CACHE = { data: null, ts: 0, tideTs: 0 };

export default async function handler(req, res) {
  const lat = Number(req.query.lat || 22.5726);
  const lon = Number(req.query.lon || 88.3639);
  const now = Date.now();

  try {
    // ---- CACHE WINDOWS ----
    const PANCHIKA_TTL = 1000 * 60 * 60 * 3; // 3h
    const TIDE_TTL     = 1000 * 60 * 60 * 6; // 6h

    // if fresh cache exists, serve immediately
    if (CACHE.data && (now - CACHE.ts) < PANCHIKA_TTL) {
      return res.status(200).json(CACHE.data);
    }

    // --- 1) SUN/MOON (Open-Meteo, keyless) ---
    let sunrise="06:00", sunset="17:00", moonrise="14:00", moonset="02:00";
    try {
      const urlAstro = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,moonrise,moonset&timezone=auto`;
      const astro = await fetch(urlAstro, { cache: "no-store" }).then(r => r.json());
      const i = 0;
      sunrise  = astro?.daily?.sunrise?.[i]  || sunrise;
      sunset   = astro?.daily?.sunset?.[i]   || sunset;
      moonrise = astro?.daily?.moonrise?.[i] || moonrise;
      moonset  = astro?.daily?.moonset?.[i]  || moonset;
    } catch (_) { /* safe fallback above */ }

    // --- 2) TITHI/NAKSHATRA (placeholder until free stable source wired) ---
    // We expose fields now; when your Dik/Sūrya Siddhānta endpoint is ready, just replace below.
    const tithi     = "—";
    const nakshatra = "—";

    // --- 3) TIDES (low-hit; placeholder grid until free keyless confirmed) ---
    // Only refresh if tide cache stale; we keep simple 4 slots: High1, High2, Low1, Low2
    let tide = CACHE.data?.tide || [];
    if ((now - CACHE.tideTs) >= TIDE_TTL || !tide.length) {
      // No stable keyless high/low API → provide structured placeholders
      // (Once your free source is locked, fetch & fill here.)
      tide = [
        { label: "উচ্চ জোয়ার", time: "—", height: "—" },
        { label: "উচ্চ জোয়ার", time: "—", height: "—" },
        { label: "নিম্ন ভাটা",  time: "—", height: "—" },
        { label: "নিম্ন ভাটা",  time: "—", height: "—" }
      ];
      CACHE.tideTs = now;
    }

    // --- 4) EKADASHI (stable fallback; can be swapped to your source) ---
    const ekadashi = CACHE.data?.ekadashi || {
      name: "রমা একাদশী",
      date: "2025-11-15",
      days_left: daysLeft("2025-11-15")
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
