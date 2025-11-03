// api/panchika.js
export default async function handler(req, res) {
  try {
    // Default: Garden Reach, Kolkata (fallback)
    const lat = +(req.query.lat ?? 22.5411);
    const lon = +(req.query.lon ?? 88.3136);

    // Open-Meteo: sunrise/sunset/moonrise/moonset (keyless)
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=sunrise,sunset,moonrise,moonset&timezone=auto`;

    const r = await fetch(url);
    const j = await r.json();

    const d = (j.daily && j.daily.time && j.daily.time[0]) ? 0 : null;

    const out = {
      tithi: "—",       // vC1-এ লাইভ হবে
      nakshatra: "—",   // vC1-এ লাইভ হবে
      sunrise:  d !== null ? (j.daily.sunrise[0]  ?? "")  : "",
      sunset:   d !== null ? (j.daily.sunset[0]   ?? "")  : "",
      moonrise: d !== null ? (j.daily.moonrise[0] ?? "")  : "",
      moonset:  d !== null ? (j.daily.moonset[0]  ?? "")  : "",
      tide: [], // vC1-এ keyless/fallback tide যোগ করব → UI এখনো স্মার্টলি "—" দেখাবে

      // Ekadashi placeholder (vC1-এ engine driven হবে)
      ekadashi: {
        name: "রমা একাদশী",
        date: "2025-11-15",
        days_left: Math.max(
          0,
          Math.ceil(
            (new Date("2025-11-15T00:00:00+05:30") - new Date()) / (1000 * 60 * 60 * 24)
          )
        ),
      },
      updated: new Date().toISOString(),
    };

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=1800");
    return res.status(200).json(out);
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Engine error", message: e?.message || "Unknown" });
  }
}
