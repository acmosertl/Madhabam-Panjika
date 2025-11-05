// lib/astro-core.js
const DEG = Math.PI/180, RAD = 180/Math.PI;
export const clamp360 = x => (x%360+360)%360;

export function to12h(hhmm){ // "HH:MM" -> "hh:mm AM/PM"
  if(!hhmm || hhmm==="—") return "—";
  let [H,M] = hhmm.split(":").map(n=>parseInt(n,10));
  if(isNaN(H)||isNaN(M)) return hhmm;
  const ampm = H>=12 ? "PM":"AM"; H = H%12 || 12;
  return `${String(H).padStart(2,"0")}:${String(M).padStart(2,"0")} ${ampm}`;
}

// Gregorian → JD (UTC)
export function jdUTC(y,m,d,h=0,mi=0,s=0){
  if(m<=2){ y-=1; m+=12; }
  const A=Math.floor(y/100);
  const B=2 - A + Math.floor(A/4);
  const day = Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + d + B - 1524.5;
  return day + (h + mi/60 + s/3600)/24;
}
export const Tcent = jd => (jd - 2451545.0)/36525.0;

// Sun apparent ecliptic longitude (Meeus low-precision)
export function sunLon(jd){
  const T=Tcent(jd);
  let L0 = 280.46646 + 36000.76983*T + 0.0003032*T*T;
  let M  = 357.52911 + 35999.05029*T - 0.0001537*T*T;
  const C = (1.914602 - 0.004817*T - 0.000014*T*T)*Math.sin(M*DEG)
          + (0.019993 - 0.000101*T)*Math.sin(2*M*DEG)
          + 0.000289*Math.sin(3*M*DEG);
  const trueLon = L0 + C;
  const omega = 125.04 - 1934.136*T;
  return clamp360(trueLon - 0.00569 - 0.00478*Math.sin(omega*DEG));
}

// Moon ecliptic longitude (simplified series, ~1° accuracy)
export function moonLon(jd){
  const T=Tcent(jd);
  const Lp = 218.3164477 + 481267.88123421*T - 0.0015786*T*T + T*T*T/538841 - T*T*T*T/65194000;
  const D  = 297.8501921 + 445267.1114034*T - 0.0018819*T*T + T*T*T/545868 - T*T*T*T/113065000;
  const M  = 357.5291092 + 35999.0502909*T - 0.0001536*T*T + T*T*T/24490000;
  const Mp = 134.9633964 + 477198.8675055*T + 0.0087414*T*T + T*T*T/69699 - T*T*T*T/14712000;
  const lon = Lp
    + 6.289 * Math.sin(Mp*DEG)
    + 1.274 * Math.sin((2*D - Mp)*DEG)
    + 0.658 * Math.sin((2*D)*DEG)
    + 0.214 * Math.sin((2*Mp)*DEG)
    + 0.110 * Math.sin(D*DEG)
    - 0.059 * Math.sin((M)*DEG)
    - 0.057 * Math.sin((2*D - M - Mp)*DEG)
    + 0.053 * Math.sin((2*D + Mp)*DEG)
    + 0.046 * Math.sin((2*D - M)*DEG);
  return clamp360(lon);
}

// Lahiri ayanamsa (approx)
export function lahiriAyanamsa(jd){
  const T=Tcent(jd);
  return 22.460148 + 1.396042*T + 0.000308*T*T; // deg
}
export const toSidereal = (lambda, jd) => clamp360(lambda - lahiriAyanamsa(jd));

// Sun declination (for sunrise/sunset)
function obliquity(jd){
  const T=Tcent(jd);
  return 23 + (26 + ((21.448 - 46.8150*T - 0.00059*T*T + 0.001813*T*T*T)/60))/60;
}
function solarDecl(jd){
  const eps = obliquity(jd)*DEG, lam = sunLon(jd)*DEG;
  return Math.asin(Math.sin(eps)*Math.sin(lam)); // rad
}
function hourAngleSun(lat, dec, altDeg){
  const s = (Math.sin(altDeg*DEG) - Math.sin(lat*DEG)*Math.sin(dec))/(Math.cos(lat*DEG)*Math.cos(dec));
  if (s<=-1) return Math.PI; // polar day
  if (s>=1)  return 0;       // polar night
  return Math.acos(s); // rad
}
export function sunriseSunset(localDate, lat, lon, tzHours){
  const y=localDate.getFullYear(), m=localDate.getMonth()+1, d=localDate.getDate();
  const jdNoon = jdUTC(y,m,d,12-tzHours,0,0); // local noon → UTC JD
  const dec = solarDecl(jdNoon);
  const H = hourAngleSun(lat, dec, -0.833); // std refraction
  const deltaHrs = (H*RAD)/15;
  const noonLocal = 12 + lon/15 - tzHours;
  const rise = noonLocal - deltaHrs, set = noonLocal + deltaHrs;
  const toHM = hrs => {
    const h=((Math.floor(hrs)%24)+24)%24, m=Math.round((hrs-Math.floor(hrs))*60);
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  };
  return { sunrise: to12h(toHM(rise)), sunset: to12h(toHM(set)) };
                                                                           }
