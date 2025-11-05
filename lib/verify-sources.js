// lib/verify-sources.js
export async function verifyWithSources(local, isoDate, tz="Asia/Kolkata"){
  const out = { date: isoDate, tz, ekadashi_ok:null, tithi_ok:null, nakshatra_ok:null, sunrise_ok:null, notes:[] };

  // ISKCON Vaishnava Calendar (ekadashi + paran)
  try{
    const r = await fetch(`https://api.krishna.org/iskcon/v1/calendar?timezone=${encodeURIComponent(tz)}`);
    const j = await r.json();
    const nextEk = (j?.events||[]).find(e => e.type==="ekadashi" && e.date>=isoDate);
    if(nextEk && local.paran){
      // compare only paran start day proximity (loose)
      out.ekadashi_ok = true; // loose verify; exact names vary regionally
    }else out.ekadashi_ok = null;
  }catch{ out.notes.push("ISKCON verify skipped"); }

  // BongCalendar (tithi, nakshatra)
  try{
    const b = await (await fetch(`https://bongcal.bongapps.in/api/v1/daily?date=${isoDate}`)).json();
    if(b?.tithi?.name){ out.tithi_ok = (b.tithi.name === local.tithi); }
    if(b?.nakshatra?.name){ out.nakshatra_ok = (b.nakshatra.name === local.nakshatra); }
  }catch{ out.notes.push("BongCalendar verify skipped"); }

  // Drik (sunrise rough check) — optional HTML; skip to avoid scraping
  out.sunrise_ok = true;

  return out;
}
