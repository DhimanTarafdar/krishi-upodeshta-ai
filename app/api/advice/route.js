import { NextResponse } from "next/server";
import { askGemma } from "@/lib/gemma";
import { buildPrompt } from "@/lib/prompts";
import { getWeather } from "@/lib/weather";
import { getDb } from "@/lib/db";
import { UID_RE } from "@/lib/constants";

export const maxDuration = 60;

const hits = new Map(); // tiny in-memory rate limit: 12 requests/minute/IP
const limited = (ip) => { const n = Date.now(), a = (hits.get(ip) || []).filter((t) => n - t < 60000); a.push(n); hits.set(ip, a); return a.length > 12; };
const bnCount = (o) => (JSON.stringify(o).match(/[\u0980-\u09FF]/g) || []).length;

async function ensureBangla(data) {
  if (bnCount(data) >= 40) return data;
  try {
    return await askGemma(`নিচের JSON-এর সব লেখা সহজ মুখের বাংলায় (বাংলা অক্ষরে) অনুবাদ করো। key, সংখ্যা, "low/medium/high" আর true/false হুবহু রাখো। শুধু JSON ফেরত দাও।\n${JSON.stringify(data)}`);
  } catch { return data; }
}

export async function POST(req) {
  try {
    if (limited(req.headers.get("x-forwarded-for") || "local")) return NextResponse.json({ error: "অনেকবার চেষ্টা হয়েছে, এক মিনিট পরে আবার চেষ্টা করুন।" }, { status: 429 });
    const b = await req.json();
    const symptoms = String(b.symptoms || "").slice(0, 1000);
    const image = typeof b.image === "string" && b.image.length < 3500000 ? b.image : null;
    const mime = ["image/jpeg", "image/png", "image/webp"].includes(b.mime) ? b.mime : "image/jpeg";
    const uid = UID_RE.test(b.uid || "") ? b.uid : null;
    if (!image && !symptoms.trim()) return NextResponse.json({ error: "ছবি অথবা লক্ষণ দিন।" }, { status: 400 });

    const hasPos = typeof b.lat === "number" && typeof b.lon === "number";
    const [weather, db] = await Promise.all([hasPos ? getWeather(b.lat, b.lon) : null, uid ? getDb() : null]);
    const profile = db ? await db.collection("profiles").findOne({ uid }, { projection: { _id: 0 } }).catch(() => null) : null;

    let data, note;
    try { data = await askGemma(buildPrompt({ symptoms, hasImage: !!image, weather, profile }), image, mime); }
    catch (e) {
      if (!image || !symptoms.trim()) throw e;
      data = await askGemma(buildPrompt({ symptoms, hasImage: false, weather, profile }));
      note = "ছবি পড়া যায়নি, লেখা দেখে উত্তর দেওয়া হয়েছে।";
    }
    data = await ensureBangla(data);

    let saved = false;
    if (db) {
      try { await db.collection("history").insertOne({ uid, symptoms, hasImage: !!image, diagnosis: data.diagnosis || "", urgency: data.urgency || "medium", data, weather, note: note || null, createdAt: new Date() }); saved = true; } catch {}
    }
    return NextResponse.json({ data, weather, note, saved });
  } catch (e) {
    return NextResponse.json({ error: e.message || "কিছু একটা ভুল হয়েছে" }, { status: 500 });
  }
}
