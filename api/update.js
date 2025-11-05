// api/update.js
import { computePanchika } from "../lib/panchika-engine.js";
import { verifyWithSources } from "../lib/verify-sources.js";

export default async function handler(req, res){
  try{
    const { mode="drik", lat, lon, tz="Asia/Kolkata", verify="1" } = req.query;
    const latF = isFinite(parseFloat(lat)) ? parseFloat(lat) : 22.5411;  // Kolkata default
    const lonF = isFinite(parseFloat(lon)) ? parseFloat(lon) : 88.3378;

    const now = new Date();
    const data = computePanchika({ date: now, lat: latF, lon: lonF, tz, mode: (mode==="surya"?"surya":"drik") });

    let verifyLog = null;
    if (verify!=="0"){
      const iso = new Date(now.toLocaleString("sv-SE",{ timeZone: tz})).slice(0,10);
      try{ verifyLog = await verifyWithSources(data, iso, tz); }catch{}
    }

    res.setHeader("Cache-Control","s-maxage=900, stale-while-revalidate=900");
    return res.status(200).json({ ok:true, data, verify: verifyLog });
  }catch(err){
    return res.status(200).json({ ok:false, error: err.message });
  }
}
