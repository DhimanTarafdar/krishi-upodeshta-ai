import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { UID_RE } from "@/lib/constants";
export const dynamic = "force-dynamic";

const off = () => NextResponse.json({ error: "ডাটাবেস সংযুক্ত নেই" }, { status: 503 });
const uidOf = (req) => { const u = new URL(req.url).searchParams.get("uid"); return UID_RE.test(u || "") ? u : null; };

export async function GET(req) {
  const uid = uidOf(req); if (!uid) return NextResponse.json({ error: "ভুল অনুরোধ" }, { status: 400 });
  const db = await getDb(); if (!db) return off();
  const items = await db.collection("history").find({ uid }).sort({ createdAt: -1 }).limit(30).toArray();
  return NextResponse.json({ items: items.map((i) => ({ ...i, _id: String(i._id) })) });
}

export async function DELETE(req) {
  const uid = uidOf(req); if (!uid) return NextResponse.json({ error: "ভুল অনুরোধ" }, { status: 400 });
  const id = new URL(req.url).searchParams.get("id");
  const db = await getDb(); if (!db) return off();
  const filter = id ? (ObjectId.isValid(id) ? { uid, _id: new ObjectId(id) } : null) : { uid };
  if (!filter) return NextResponse.json({ error: "ভুল অনুরোধ" }, { status: 400 });
  await db.collection("history").deleteMany(filter);
  return NextResponse.json({ ok: true });
}
