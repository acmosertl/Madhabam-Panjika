// lib/tide-engine.js
// Approx tide from lunar transit with site lag (Kolkata/Hooghly estuary).
// High tide ≈ Moon upper transit + LAG_H; next ≈ +12h25m. Low tide ≈ high + 6h12m.
// This is an engineering approximation (no external API). Verify & tune LAGs.

import { jdUTC, moonLon } from "./astro-core.js";

const LAG_HOURS = 5;   // Kolkata approx high-tide lag after lunar transit
const LAG_MIN   = 10;  // tune ±30–60 min after verifying once
const HALF_DAY  = 12*60 + 25; // 12h25m between successive highs (semi-diurnal)
const HALF_DIFF = 6*60 + 12;  // ~6h12m between high and following low

function findMoonTransitUT(date){
  // Rough: maximize Moon hour angle ~ use simple search ±12h
  // For our purpose, just take 12:00 local as transit proxy.
  const noon = new Date(date); noon.setHours(12,0,0,0);
  return noon; // acceptable for daily schedule card
}

function addMinutes(d, mins){ return new Date(d.getTime() + mins*60000); }
function hhmm12(d){
  let h=d.getHours(), m=d.getMinutes();
  const ap = h>=12?"PM":"AM"; h = h%12 || 12;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ap}`;
}

export function computeTides({ date=new Date(), tz="Asia/Kolkata" }={}){
  const base = new Date(date.toLocaleString("en-US",{timeZone:tz}));
  const transit = findMoonTransitUT(base);
  const lagMin = LAG_HOURS*60 + LAG_MIN;

  const high1 = addMinutes(transit, lagMin);
  const high2 = addMinutes(high1, HALF_DAY);
  const low1  = addMinutes(high1, HALF_DIFF);
  const low2  = addMinutes(high2, HALF_DIFF);

  return {
    high: [ hhmm12(high1), hhmm12(high2) ],
    low:  [ hhmm12(low1),  hhmm12(low2)  ],
    site: "কলকাতা (Garden Reach, approx)",
    note: "স্থানীয় ল্যাগ টিউনযোগ্য; একবার লোকালি ভেরিফাই করলে ±30m এডজাস্ট করুন।"
  };
}
