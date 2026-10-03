const URL_ = (lat, lon) => `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&forecast_days=5&timezone=auto`;

export async function fetchWeather(lat, lon) {
  const r = await fetch(URL_(lat, lon), { cache: "no-store" });
  if (!r.ok) throw new Error("আবহাওয়ার তথ্য আনা যায়নি");
  return r.json();
}

export async function getWeather(lat, lon) {
  try {
    const j = await fetchWeather(lat, lon);
    const c = j.current, d = j.daily.precipitation_probability_max;
    return `${c.temperature_2m}°C, আর্দ্রতা ${c.relative_humidity_2m}%, বাতাস ${c.wind_speed_10m} কিমি/ঘণ্টা, এখন বৃষ্টি ${c.precipitation}মিমি, বৃষ্টির সম্ভাবনা আজ ${d[0]}% আগামীকাল ${d[1]}%`;
  } catch { return null; }
}
