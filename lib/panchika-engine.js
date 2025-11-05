// 🔮 Mādhābam Panchika Engine (Drik Mode Default + Hybrid Verification)

export async function generatePanchika() {
  const now = new Date();
  const lat = 22.5726; // Kolkata
  const lon = 88.3639;
  const tz = 'Asia/Kolkata';

  try {
    // ☀️ Open-Meteo Astronomical API
    const astroURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,moonrise,moonset&timezone=${encodeURIComponent(tz)}`;
    const res = await fetch(astroURL);
    const json = await res.json();

    const d = json.daily || {};
    const sunrise = formatTime(d.sunrise?.[0]);
    const sunset = formatTime(d.sunset?.[0]);
    const moonrise = formatTime(d.moonrise?.[0]);
    const moonset = formatTime(d.moonset?.[0]);

    // Placeholder till Drik Panchang API integration
    const tithi = "ত্রয়োদশী";
    const tithi_end = "১১:৪৫ PM";
    const tithi_next = "চতুর্দশী";
    const nakshatra = "অশ্বিনী";
    const nak_end = "০৮:৩০ AM";
    const nak_next = "ভরণী";
    const paksha = "কৃষ্ণ পক্ষ";

    return {
      tithi, tithi_end, tithi_next,
      nakshatra, nak_end, nak_next,
      paksha, sunrise, sunset, moonrise, moonset
    };

  } catch (err) {
    console.error("Panchika Engine Error:", err);
    return { error: err.message };
  }

  function formatTime(val) {
    if (!val) return "—";
    try {
      const time = val.split("T")[1] || val;
      const [h, m] = time.split(":");
      const date = new Date();
      date.setHours(parseInt(h), parseInt(m));
      return date.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return val;
    }
  }
}
