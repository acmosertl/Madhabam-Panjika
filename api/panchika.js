// /api/panchika.js — vC1.2 Kolkata-Lock Fixed Engine
export default async function handler(req, res) {
  const lat = 22.5411; // Garden Reach (Kolkata)
  const lon = 88.3136;
  try {
    // ✅ Corrected Open-Meteo endpoint
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,moonrise,moonset&timezone=Asia%2FKolkata`;

    const response = await fetch(url);
    const data = await response.json();

    let sunrise = "06:00", sunset = "17:00", moonrise = "14:00", moonset = "02:00";
    if (data && data.daily) {
      sunrise  = data.daily.sunrise?.[0]?.split("T")[1]?.substring(0,5)  || sunrise;
      sunset   = data.daily.sunset?.[0]?.split("T")[1]?.substring(0,5)   || sunset;
      moonrise = data.daily.moonrise?.[0]?.split("T")[1]?.substring(0,5) || moonrise;
      moonset  = data.daily.moonset?.[0]?.split("T")[1]?.substring(0,5)  || moonset;
    }

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

    const output = {
      sunrise,
      sunset,
      moonrise,
      moonset,
      tithi,
      nakshatra,
      ekadashi,
      tide: [],
      updated: new Date().toISOString(),
    };

    res.setHeader("Cache-Control", "s-maxage=10800, stale-while-revalidate=5400");
    return res.status(200).json(output);
  } catch (err) {
    return res.status(500).json({
      error: "Panchika Engine Error",
      message: err?.message || String(err),
    });
  }
}
