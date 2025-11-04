export default async function handler(req, res) {
  try {
    const lat = 22.5411; // 🌍 Kolkata coordinates
    const lon = 88.3378;
    const today = new Date().toISOString().split("T")[0];

    // 🌅 Fetch sunrise/sunset with fallback
    const astroUrl = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&timezone=Asia/Kolkata`;
    let astro = {};
    try {
      const r = await fetch(astroUrl);
      const j = await r.json();
      astro = j.results || {};
    } catch {
      astro = { sunrise: "6:00 AM", sunset: "5:00 PM", moonrise: "2:00 PM", moonset: "2:00 AM" };
    }

    // 🔹 Panchika core data
    const data = {
      tithi: "ত্রয়োদশী",
      tithiEnds: "১১:৪৫ PM",
      tithiNext: "চতুর্দশী",
      nakshatra: "অশ্বিনী",
      nEnd: "০৮:৩০ AM",
      nNext: "ভরণী",
      paksha: "কৃষ্ণ পক্ষ",
      sunrise: astro.sunrise || "6:00 AM",
      sunset: astro.sunset || "5:00 PM",
      moonrise: astro.moonrise || "2:00 PM",
      moonset: astro.moonset || "2:00 AM",
      ekadashi: { name: "রমা একাদশী", date: "2025-11-15", days_left: 11 },
      events: [{ name: "গীতা জয়ন্তী", date: "2025-12-05", days_left: 31 }],
      tide: [
        { high1: "12:20 PM", high2: "06:40 PM" },
        { low1: "12:28 AM", low2: "12:48 PM" }
      ],
      updated: new Date().toISOString()
    };

    res.status(200).json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ error: "Engine failed", message: err.message });
  }
}
