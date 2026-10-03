"use client";
export const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#f2b705" /><path d="M20 31V19" stroke="#14532d" strokeWidth="2.6" strokeLinecap="round" /><path d="M20 20c-6 0-9-3-9-8 6 0 9 3 9 8Z" fill="#14532d" /><path d="M20 23c5 0 8-2.5 8-7-5 0-8 2.5-8 7Z" fill="#2f7d3a" /></svg>
);

export default function Header({ profile, onOpen }) {
  return (
    <header className="top">
      <div className="brand"><Logo /><div><b>কৃষি উপদেষ্টা</b><small>Gemma চালিত ফসল সহায়ক</small></div></div>
      <nav aria-label="প্রধান মেনু">
        <button onClick={() => onOpen("weather")}>আজকের আবহাওয়া</button>
        <button onClick={() => onOpen("history")}>আমার ইতিহাস</button>
        <a className="call" href="tel:16123">কৃষি কল ১৬১২৩</a>
        <button className="me" onClick={() => onOpen("profile")}>
          <span className="av">{(profile?.name || "ক").trim()[0]}</span>
          <span>{profile?.name ? `${profile.name}${profile.age ? `, ${Number(profile.age).toLocaleString("bn-BD")} বছর` : ""}` : "প্রোফাইল"}</span>
        </button>
      </nav>
    </header>
  );
}
