function parseJson(text) {
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a < 0 || b < 0) throw new Error("Model did not return JSON. Got: " + text.slice(0, 200));
  return JSON.parse(text.slice(a, b + 1));
}

async function viaApi(prompt, image, mime) {
  const model = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
  const parts = [{ text: prompt }];
  if (image) parts.push({ inline_data: { mime_type: mime || "image/jpeg", data: image } });
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMMA_API_KEY || "" },
    body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { temperature: 0.3, maxOutputTokens: 4000, thinkingConfig: { thinkingLevel: "minimal" } } }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || `API error ${r.status}`);
  const c = j.candidates?.[0];
  const text = (c?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || "").join("");
  if (!text) throw new Error("Empty reply. finishReason: " + (c?.finishReason || j?.promptFeedback?.blockReason || "unknown"));
  return text;
}

async function viaOllama(prompt, image) {
  const r = await fetch(`${process.env.OLLAMA_URL || "http://localhost:11434"}/api/chat`, {
    method: "POST",
    body: JSON.stringify({ model: process.env.OLLAMA_MODEL || "gemma3:4b", stream: false,
      messages: [{ role: "user", content: prompt, ...(image ? { images: [image] } : {}) }] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Ollama error");
  return j.message.content;
}

export async function askGemma(prompt, image, mime) {
  const run = process.env.USE_LOCAL === "true" ? viaOllama : viaApi;
  try { return parseJson(await run(prompt, image, mime)); }
  catch (e) {
    if (!String(e.message).startsWith("Model did not") && !(e instanceof SyntaxError)) throw e;
    return parseJson(await run(prompt + "\nশুধু একটি বৈধ JSON object দাও।", image, mime)); // one retry
  }
}
