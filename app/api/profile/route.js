import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { CROPS, UID_RE } from "@/lib/constants";
export const dynamic = "force-dynamic";

const off = () => NextResponse.json({ error: "ডাটাবেস সংযুক্ত নেই" }, { status: 503 });

export async function GET(req) {
  const uid = new URL(req.url).searchParams.get("uid");
  if (!UID_RE.test(uid || "")) return NextResponse.json({ error: "ভুল অনুরোধ" }, { status: 400 });
  const db = await getDb(); if (!db) return off();
  return NextResponse.json({ profile: await db.collection("profiles").findOne({ uid }, { projection: { _id: 0 } }) });
}

export async function PUT(req) {
  const b = await req.json().catch(() => ({}));
  if (!UID_RE.test(b.uid || "")) return NextResponse.json({ error: "ভুল অনুরোধ" }, { status: 400 });
  const age = Math.round(Number(b.age));
  const doc = {
    name: String(b.name || "").slice(0, 60),
    age: age >= 10 && age <= 100 ? age : null,
    district: String(b.district || "").slice(0, 60),
    land: String(b.land || "").slice(0, 30),
    crops: (Array.isArray(b.crops) ? b.crops : []).filter((c) => CROPS.includes(c)),
    updatedAt: new Date(),
  };
  const db = await getDb(); if (!db) return off();
  await db.collection("profiles").updateOne({ uid: b.uid }, { $set: doc, $setOnInsert: { uid: b.uid } }, { upsert: true });
  return NextResponse.json({ profile: { uid: b.uid, ...doc } });
}
