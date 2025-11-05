// lib/ekadashi-layer.js
import { jdUTC, sunLon, moonLon } from "./astro-core.js";
import { sunriseSunset, to12h } from "./astro-core.js";

const EK_START = 120; // degrees
const EK_END   = 132;

function isEkadashiAt(jd){
  const sun = sunLon(jd), moon = moonLon(jd);
  const diff = (moon - sun + 360) % 360;
  return (diff>=EK_START && diff<EK_END);
}

export function computeEkadashiAndParan({ date, lat, lon, tz="Asia/Kolkata", tzHours=5.5 }){
  const today = new Date(date);
  const todayJD = jdUTC(today.getUTCFullYear(), today.getUTCMonth()+1, today.getUTCDate(), 6,0,0); // ~morning check
  const ekToday = isEkadashiAt(todayJD);

  // next-day sunrise (local)
  const next = new Date(today.getTime() + 86400000);
  const { sunrise: nextSunRise } = sunriseSunset(next, lat, lon, tzHours);
  // parse nextSunRise "hh:mm AM/PM" back to 24h (rough)
  function parse12h(s){
    const [hm, ap] = s.split(" ");
    let [h,m] = hm.split(":").map(x=>parseInt(x,10));
    if(ap==="PM" && h!==12) h+=12;
    if(ap==="AM" && h===12) h=0;
    return {h,m};
  }
  const {h:nsH, m:nsM} = parse12h(nextSunRise);
  const nextSunRiseJD = jdUTC(next.getUTCFullYear(), next.getUTCMonth()+1, next.getUTCDate(),
                              nsH - tzHours, nsM, 0); // convert to UTC JD approximately

  const ekAtNextSunrise = isEkadashiAt(nextSunRiseJD);

  // Paran day rule (ISKCON): if Ekadashi still running at next sunrise → paran shifts to following day
  let paranDay = new Date(next);
  if (ekAtNextSunrise) paranDay = new Date(next.getTime() + 86400000);

  // Paran window = sunrise .. sunrise + 4h
  const { sunrise: paranSunrise } = sunriseSunset(paranDay, lat, lon, tzHours);
  const {h:ph, m:pm} = parse12h(paranSunrise);
  const ps = new Date(paranDay); ps.setHours(ph,pm,0,0);
  const pe = new Date(ps.getTime() + 4*3600*1000);

  const fmt = d => to12h(`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`);

  return {
    isEkadashiToday: ekToday,
    paran_date: paranDay.toISOString().slice(0,10),
    paran_start: fmt(ps),
    paran_end: fmt(pe)
  };
}
