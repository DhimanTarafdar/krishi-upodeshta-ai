"use client";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import AdviceResult from "@/components/AdviceResult";
import { WeatherModal, ProfileModal, HistoryModal } from "@/components/Modals";
import { api, getPosition, getUid } from "@/lib/client";

const QUICK = ["পাতায় বাদামি দাগ", "পাতা হলুদ হয়ে যাচ্ছে", "পাতা কুঁকড়ে যাচ্ছে", "গোড়া পচে যাচ্ছে", "পোকা দেখা যাচ্ছে"];

export default function Home() {
  const [uid, setUid] = useState(null);
  const [profile, setProfile] = useState(null);
  const [modal, setModal] = useState(null);
  const [image, setImage] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [useWx, setUseWx] = useState(true);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [rec, setRec] = useState(false);
  const recRef = useRef(); const boxRef = useRef(); const outRef = useRef();

  useEffect(() => {
    const u = getUid(); setUid(u);
    api(`/api/profile?uid=${u}`).then((j) => setProfile(j.profile)).catch(() => {});
  }, []);

  const listen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setErr("এই ব্রাউজারে ভয়েস ইনপুট নেই। Chrome ব্যবহার করুন।");
    if (rec) return recRef.current?.stop();
    const r = new SR(); r.lang = "bn-BD"; r.interimResults = false;
    r.onresult = (e) => setSymptoms((s) => (s ? s + " " : "") + e.results[0][0].transcript);
    r.onend = () => setRec(false); r.onerror = () => setRec(false);
    recRef.current = r; setRec(true); r.start();
  };

  const submit = async () => {
    setErr(""); setRes(null); setLoading(true);
    if (window.innerWidth < 1000) outRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const pos = useWx ? await getPosition() : null;
      const j = await api("/api/advice", { method: "POST", body: JSON.stringify({ image: image?.base64, mime: image?.mime, symptoms, uid, ...(pos || {}) }) });
      setRes(j);
    } catch (e) { setErr(e.message || "আবার চেষ্টা করুন"); }
    setLoading(false);
  };

  const follow = (q) => { setSymptoms((s) => `${s}\n${q} `); boxRef.current?.focus(); };
  const openItem = (i) => { setRes({ data: i.data, weather: i.weather, note: i.note }); setModal(null); outRef.current?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <>
      <Header profile={profile} onOpen={setModal} />
      <section className="banner">
        <div>
          <h1>{profile?.name ? `স্বাগতম, ${profile.name}` : "ফসলের সমস্যা? ছবি তুলুন।"}</h1>
          <p>ছবি তুলুন বা মুখে বলুন। বাংলায় রোগ চিনে প্রতিকার বলে দেব, আজকের আবহাওয়া মিলিয়ে।</p>
        </div>
      </section>

      <main className="work">
        <aside className="inbox" aria-label="আপনার তথ্য দিন">
          <h2>সমস্যার তথ্য দিন</h2>
          <ImageUploader image={image} onChange={setImage} />
          <label htmlFor="sym">কী সমস্যা দেখছেন?</label>
          <div className="chips">{QUICK.map((q) => <button key={q} onClick={() => setSymptoms((s) => (s ? s + ", " : "") + q)}>{q}</button>)}</div>
          <textarea id="sym" ref={boxRef} rows={3} value={symptoms} maxLength={1000} onChange={(e) => setSymptoms(e.target.value)} placeholder="যেমন: ধানের পাতায় চোখের মতো দাগ, তিন দিন ধরে বাড়ছে" />
          <div className="row">
            <button className={`mic ${rec ? "on" : ""}`} onClick={listen}>{rec ? "শুনছি... থামাতে চাপুন" : "মুখে বলুন"}</button>
            <label className="chk"><input type="checkbox" checked={useWx} onChange={(e) => setUseWx(e.target.checked)} /> আবহাওয়া মিলিয়ে দেখুন</label>
          </div>
          <button className="go" disabled={loading || (!image && !symptoms.trim())} onClick={submit}>{loading ? "বিশ্লেষণ চলছে..." : "পরামর্শ নিন"}</button>
          {err && <p className="alert" role="alert">{err}</p>}
        </aside>

        <section className="outbox" ref={outRef} aria-live="polite">
          {loading && <div className="empty"><div className="bar"><i /></div><p>ছবি ও লক্ষণ দেখে পরামর্শ তৈরি হচ্ছে...</p></div>}
          {!loading && !res && <div className="empty"><h2>আপনার পরামর্শ এখানে দেখা যাবে</h2><p>বাঁ দিকে ছবি দিন বা সমস্যা লিখুন। রোগের নাম, কারণ, আজকের করণীয় আর জৈব প্রতিকার পাবেন।</p></div>}
          {!loading && res && <AdviceResult d={res.data} weather={res.weather} note={res.note} onFollow={follow} />}
          {!loading && res && res.saved === false && <small className="muted">ইতিহাসে সংরক্ষণ হয়নি (ডাটাবেস সংযুক্ত নেই)।</small>}
        </section>
      </main>

      <footer className="foot">
        <b>কৃষি উপদেষ্টা</b>
        <p>এটি প্রাথমিক পরামর্শ, বিশেষজ্ঞের বিকল্প নয়। জরুরি হলে কৃষি কল সেন্টার ১৬১২৩ বা উপজেলা কৃষি অফিসে যোগাযোগ করুন।</p>
        <small>Open model Gemma দিয়ে তৈরি। আবহাওয়া: Open-Meteo।</small>
      </footer>

      {modal === "weather" && <WeatherModal onClose={() => setModal(null)} />}
      {modal === "profile" && uid && <ProfileModal uid={uid} profile={profile} onSaved={setProfile} onClose={() => setModal(null)} />}
      {modal === "history" && uid && <HistoryModal uid={uid} onOpenItem={openItem} onClose={() => setModal(null)} />}
    </>
  );
}
