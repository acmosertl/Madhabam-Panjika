import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "data", "panchika.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    // 🧭 আজকের তারিখ
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0];

    // 🔹 একাদশী অটো-রোলওভার
    if (data.ekadashi_list && data.ekadashi_list.length) {
      const nextEka = data.ekadashi_list.find(e => e.date >= todayISO);
      data.ekadashi = nextEka || data.ekadashi_list[data.ekadashi_list.length - 1];
      const diff = (new Date(data.ekadashi.date) - today) / (1000 * 60 * 60 * 24);
      data.ekadashi.days_left = Math.max(0, Math.floor(diff));
    }

    // 🔹 তিথি ও নক্ষত্র (ফেক উদাহরণ, পরে API লিংক হবে)
    data.tithi = "ত্রয়োদশী";
    data.paksha = "কৃষ্ণ পক্ষ";
    data.nakshatra = "অশ্বিনী";
    data.tithiEnd = "১১:৪৫ PM";
    data.nEnd = "০৮:৩০ AM";

    // 🔹 সূর্যোদয়, চন্দ্রোদয়
    data.sunrise = "06:00";
    data.sunset = "17:00";
    data.moonrise = "14:00";
    data.moonset = "02:00";

    // 🔹 ইভেন্ট উদাহরণ
    data.events = [
      { "name": "গীতা জয়ন্তী", "date": "2025-12-05", "days_left": 31 }
    ];

    // 🔹 টাইড উদাহরণ
    data.tide = [
      { time: "12:20" },
      { time: "18:40" },
      { time: "00:48" },
      { time: "12:28" }
    ];

    data.updated = new Date().toISOString();

    res.status(200).json({ ok: true, updated: data.updated, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Engine error", message: err.message });
  }
}
