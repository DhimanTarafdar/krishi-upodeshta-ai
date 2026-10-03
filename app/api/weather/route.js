import { NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const lat = Number(q.get("lat")), lon = Number(q.get("lon"));
  if (!(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) || !q.get("lat")) return NextResponse.json({ error: "অবস্থান পাওয়া যায়নি" }, { status: 400 });
  try { return NextResponse.json(await fetchWeather(lat, lon)); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 502 }); }
}
