import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const dataPath = path.join(process.cwd(), "data", "panchika.json");
    const raw = fs.readFileSync(dataPath, "utf8");
    let data = {};

    try {
      data = JSON.parse(raw || "{}");
    } catch (err) {
      data = {};
    }

    // ✅ null-safe fallback
    const safe = (val, fallback = "-") => (val !== undefined && val !== null ? val : fallback);

    // --- Example auto-update logic ---
    const now = new Date();
    const updatedData = {
      tithi: safe(data.tithi),
      nakshatra: safe(data.nakshatra),
      sunrise: safe(data.sunrise, "06:00"),
      sunset: safe(data.sunset, "17:00"),
      moonrise: safe(data.moonrise, "14:00"),
      moonset: safe(data.moonset, "02:00"),
      tide: Array.isArray(data.tide) ? data.tide : [],
      ekadashi: data.ekadashi || {
        name: "রমা একাদশী",
        date: "2025-11-15",
        days_left: 12
      },
      updated: now.toISOString()
    };

    fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2), "utf8");

    res.status(200).json({ ok: true, updated: updatedData.updated });
  } catch (err) {
    res.status(500).json({ error: "Engine error", message: err.message });
  }
}
