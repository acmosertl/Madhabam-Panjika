// ✅ Madhabam Panchika API Serverless Function (Node 18+)

// Panchika Engine import (fixed function name)
import { getPanchikaData as computePanchika } from "../lib/panchika-core.js";

// Main API handler function for Vercel
export default async function handler(req, res) {
  try {
    // Extract query parameters (lat, lon, mode, tz)
    const { lat, lon, mode = "drik", tz = "Asia/Kolkata" } = req.query || {};

    // Default to Kolkata if GPS not available
    const latitude = isFinite(lat) ? +lat : 22.5411;
    const longitude = isFinite(lon) ? +lon : 88.3378;

    // Fetch Panchika data using our computation engine
    const data = await computePanchika({
      latitude,
      longitude,
      tz,
      mode,
    });

    // Cache response for 15 min (to reduce API load)
    res.setHeader(
      "Cache-Control",
      "s-maxage=900, stale-while-revalidate=3600"
    );

    // Send Panchika JSON response
    res.status(200).json(data);
  } catch (e) {
    // Error handling with message
    console.error("❌ Panchika Engine Error:", e);
    res.status(500).json({
      error: "Panchika Engine Error",
      message: String(e?.message || e),
    });
  }
}
