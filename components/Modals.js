"use client";
import { useEffect, useState } from "react";
import { api, bn, getPosition } from "@/lib/client";
import { CROPS } from "@/lib/constants";

export function Modal({ title, onClose, children }) {
  useEffect(() => { const f = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, [onClose]);
  return (
    <div className="ov" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="mh"><h2>{title}</h2><button className="x" onClick={onClose} aria-label="বন্ধ করুন">✕</button></div>
        {children}
      </div>
    </div>
  );
}

const icon = (c) => (c === 0 ? "☀️" : c <= 3 ? "⛅" : c <= 48 ? "🌫️" : c <= 67 ? "🌧️" : c <= 77 ? "❄️" : c <= 82 ? "🌦️" : "⛈️");
const label = (c) => (c === 0 ? "পরিষ্কার" : c <= 3 ? "আংশিক মেঘলা" : c <= 48 ? "কুয়াশা" : c <= 67 ? "বৃষ্টি" : c <= 82 ? "ঝিরিঝিরি বৃষ্টি" : "বজ্রসহ বৃষ্টি");

function tips(w) {
  const c = w.current, p = w.daily.precipitation_probability_max, t = [];
  if (p[0] >= 60 || p[1] >= 60) t.push("আগামী দুই দিনে বৃষ্টির সম্ভাবনা বেশি। স্প্রে ও সার দেওয়া পিছিয়ে দিন।");
  if (c.wind_speed_10m >= 20) t.push("বাতাস জোরে বইছে। এখন স্প্রে করলে ওষুধ উড়ে যাবে।");
  if (c.temperature_2m >= 35) t.push("খুব গরম। ভোরে বা বিকেলে সেচ ও স্প্রে করুন।");
  if (c.relative_humidity_2m >= 85) t.push("আর্দ্রতা বেশি, ছত্রাকজনিত রোগের ঝুঁকি বাড়ে। পাতা নিয়মিত দেখুন।");
  return t.length ? t : ["আবহাওয়া ভালো। ভোরে বা বিকেলে স্প্রে বা সেচের কাজ করতে পারেন।"];
}

export function WeatherModal({ onClose }) {
  const [w, setW] = useState(null), [err, setErr] = useState(""), [approx, setApprox] = useState(false);
  useEffect(() => {
    (async () => {
      let pos = await getPosition();
      if (!pos) { pos = { lat: 23.81, lon: 90.41 }; setApprox(true); }
      try { setW(await api(`/api/weather?lat=${pos.lat}&lon=${pos.lon}`)); } catch (e) { setErr(e.message); }
    })();
  }, []);
  return (
    <Modal title="আজকের আবহাওয়া" onClose={onClose}>
      {err && <p className="alert">{err}</p>}
      {!w && !err && <p>তথ্য আনা হচ্ছে...</p>}
      {w && (<>
        {approx && <p className="note">আপনার অবস্থান পাওয়া যায়নি, তাই ঢাকার আবহাওয়া দেখানো হচ্ছে। ব্রাউজারে লোকেশন চালু করুন।</p>}
        <div className="wnow"><span className="big">{icon(w.current.weather_code)}</span><div><b>{bn(Math.round(w.current.temperature_2m))}°সে</b><p>{label(w.current.weather_code)}, অনুভূত {bn(Math.round(w.current.apparent_temperature))}°</p></div></div>
        <div className="wgrid"><div>আর্দ্রতা<b>{bn(w.current.relative_humidity_2m)}%</b></div><div>বাতাস<b>{bn(Math.round(w.current.wind_speed_10m))} কিমি/ঘ</b></div><div>বৃষ্টি এখন<b>{bn(w.current.precipitation)} মিমি</b></div></div>
        <h3>কৃষকের জন্য আজকের পরামর্শ</h3>
        <ul className="tips">{tips(w).map((x, i) => <li key={i}>{x}</li>)}</ul>
        <h3>আগামী ৫ দিন</h3>
        <div className="days">{w.daily.time.map((d, i) => (
          <div key={d}><small>{i === 0 ? "আজ" : new Date(d).toLocaleDateString("bn-BD", { weekday: "short" })}</small><span>{icon(w.daily.weather_code[i])}</span><b>{bn(Math.round(w.daily.temperature_2m_max[i]))}°</b><small>{bn(Math.round(w.daily.temperature_2m_min[i]))}°</small><small className="rain">বৃষ্টি {bn(w.daily.precipitation_probability_max[i])}%</small></div>
        ))}</div>
      </>)}
    </Modal>
  );
}

export function ProfileModal({ uid, profile, onSaved, onClose }) {
  const [f, setF] = useState({ name: "", age: "", district: "", land: "", crops: [], ...(profile || {}) });
  const [msg, setMsg] = useState("");
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggle = (c) => set("crops", f.crops.includes(c) ? f.crops.filter((x) => x !== c) : [...f.crops, c]);
  const save = async () => {
    try { const j = await api("/api/profile", { method: "PUT", body: JSON.stringify({ ...f, uid }) }); onSaved(j.profile); setMsg("সংরক্ষণ হয়েছে। এখন থেকে পরামর্শ আপনার ফসল ও এলাকা অনুযায়ী হবে।"); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <Modal title="আমার প্রোফাইল" onClose={onClose}>
      <div className="form">
        <label>নাম<input value={f.name} maxLength={60} onChange={(e) => set("name", e.target.value)} /></label>
        <label>বয়স<input type="number" min="10" max="100" value={f.age || ""} onChange={(e) => set("age", e.target.value)} /></label>
        <label>জেলা বা উপজেলা<input value={f.district} maxLength={60} onChange={(e) => set("district", e.target.value)} placeholder="যেমন: রাজশাহী, বাঘা" /></label>
        <label>জমির পরিমাণ<input value={f.land} maxLength={30} onChange={(e) => set("land", e.target.value)} placeholder="যেমন: ৫ বিঘা" /></label>
        <fieldset><legend>প্রধান ফসল</legend><div className="chips">{CROPS.map((c) => <button type="button" key={c} className={f.crops.includes(c) ? "sel" : ""} onClick={() => toggle(c)}>{c}</button>)}</div></fieldset>
        <button className="go" onClick={save}>সংরক্ষণ করুন</button>
        {msg && <p className="note">{msg}</p>}
      </div>
    </Modal>
  );
}

export function HistoryModal({ uid, onOpenItem, onClose }) {
  const [items, setItems] = useState(null), [err, setErr] = useState("");
  const load = () => api(`/api/history?uid=${uid}`).then((j) => setItems(j.items)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const del = async (id) => {
    if (!confirm(id ? "এই পরামর্শ মুছে ফেলবেন?" : "সব ইতিহাস মুছে ফেলবেন?")) return;
    await api(`/api/history?uid=${uid}${id ? `&id=${id}` : ""}`, { method: "DELETE" }).catch((e) => setErr(e.message));
    load();
  };
  return (
    <Modal title="আমার ইতিহাস" onClose={onClose}>
      {err && <p className="alert">{err}</p>}
      {items && !items.length && <p>এখনো কোনো পরামর্শ নেওয়া হয়নি।</p>}
      {items?.map((i) => (
        <div className="hitem" key={i._id}>
          <div><span className={`dot u-${i.urgency === "high" ? "high" : i.urgency === "low" ? "low" : "med"}`} /><b>{i.diagnosis || "নির্ণয় হয়নি"}</b><small>{new Date(i.createdAt).toLocaleString("bn-BD")}</small></div>
          <p>আপনি জানিয়েছিলেন: {i.symptoms || (i.hasImage ? "(শুধু ছবি)" : "-")}</p>
          <div className="row"><button className="mic" onClick={() => onOpenItem(i)}>পরামর্শ দেখুন</button><button className="ghost" onClick={() => del(i._id)}>মুছুন</button></div>
        </div>
      ))}
      {items?.length > 0 && <button className="ghost" onClick={() => del(null)}>সব ইতিহাস মুছুন</button>}
    </Modal>
  );
}
