export default async function handler(req, res) {
  const lat = 22.5411;  // Garden Reach fixed
  const lon = 88.3136;
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=sunrise,sunset,moonrise,moonset&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data?.daily) {
      throw new Error("Sun/Moon data unavailable");
    }

    const d = data.daily;
    const sunrise  = d.sunrise?.[0]  || "";
    const sunset   = d.sunset?.[0]   || "";
    const moonrise = d.moonrise?.[0] || "";
    const moonset  = d.moonset?.[0]  || "";

    // Placeholder fallback for next versions (live soon)
    const tithi = "একাদশী (placeholder)";
    const nakshatra = "রোহিণী (placeholder)";

    const ekadashiDate = "2025-11-15";
    const ekadashi = {
      name: "রমা একাদশী",
      date: ekadashiDate,
      days_left: Math.max(
        0,
        Math.ceil(
          (new Date(ekadashiDate + "T00:00:00+05:30") - new Date()) /
          (1000 * 60 * 60 * 24)
        )
      ),
    };

    const out = {
      sunrise, sunset, moonrise, moonset,
      tithi, nakshatra,
      ekadashi,
      tide: [],
      updated: new Date().toISOString(),
    };

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=1800");
    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({
      error: "Panchika Engine Error",
      message: e?.message || String(e),
    });
  }
}
