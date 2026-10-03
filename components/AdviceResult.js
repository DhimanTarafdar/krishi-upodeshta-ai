"use client";
import Disclaimer from "./Disclaimer";

const U = { low: ["কম ঝুঁকি", "u-low"], medium: ["মাঝারি ঝুঁকি", "u-med"], high: ["জরুরি", "u-high"] };
const L = ({ t, items, cls }) => items?.length ? (<section className={`blk ${cls || ""}`}><h3>{t}</h3><ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul></section>) : null;

export function speak(text) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = "bn-BD"; u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export default function AdviceResult({ d, weather, note, onFollow }) {
  const [ul, uc] = U[d.urgency] || U.medium;
  const conf = Math.max(0, Math.min(100, Number(d.confidence) || 0));
  return (
    <article className="result">
      <header>
        <span className={`badge ${uc}`}>{ul}</span>
        <h2>{d.diagnosis || "নির্ণয় করা যায়নি"}</h2>
        {d.crop && <p className="crop">ফসল: {d.crop}</p>}
        <div className="conf"><i style={{ width: `${conf}%` }} /></div>
        <small>নিশ্চয়তা {conf}%</small>
        <button className="say" onClick={() => speak(d.spoken || d.diagnosis)}>শুনুন</button>
      </header>
      {note && <p className="note">{note}</p>}
      {(d.needsOfficer || conf < 50) && <p className="alert">নিশ্চিত হওয়া যাচ্ছে না। কৃষি কল সেন্টার ১৬১২৩-এ ফোন করুন বা কৃষি অফিসারকে ছবি দেখান।</p>}
      {d.cause && <section className="blk"><h3>কারণ</h3><p>{d.cause}</p></section>}
      <L t="আজই যা করবেন" items={d.today} cls="today" />
      <L t="জৈব ও সহজ প্রতিকার" items={d.organic} />
      <L t="রাসায়নিক (কৃষি অফিসারের পরামর্শে)" items={d.chemical} />
      {(d.weatherAdvice || weather) && <section className="blk wx"><h3>আজকের আবহাওয়া</h3>{weather && <small>{weather}</small>}<p>{d.weatherAdvice}</p></section>}
      <L t="ভবিষ্যতে সাবধানতা" items={d.prevention} />
      {d.followUp?.length > 0 && <section className="blk"><h3>আরও নিখুঁত উত্তরের জন্য জানান</h3><div className="chips">{d.followUp.map((q, i) => <button key={i} onClick={() => onFollow(q)}>{q}</button>)}</div></section>}
      <Disclaimer />
    </article>
  );
}
