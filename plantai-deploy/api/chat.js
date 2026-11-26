import { getSessionEmail, setCors } from "./_lib/auth.js";
import { readUsers, effectiveTier } from "./_lib/users.js";

/* Anthropic руу дамжуулах прокси.
   Өмнө нь ирсэн ямар ч body-г серверийн API key-ээр дамжуулдаг нээлттэй
   прокси байсан — одоо зөвхөн нэвтэрсэн хэрэглэгч, зөвхөн зөвшөөрөгдсөн
   загвар/талбараар, серверт шинээр бүтээсэн хүсэлт явуулна. */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export const ALLOWED_MODELS = ["claude-sonnet-5"]; // src/PlantAI.jsx-д ашиглаж буй загвар
export const MAX_TOKENS_CAP = 3000;
const DEFAULT_MAX_TOKENS = 1500;
const MAX_MESSAGES = 24;      // чат сүүлийн 12 мессежийг л илгээдэг
const MAX_BLOCKS = 20;
const THINKING_TYPES = ["disabled", "adaptive"]; // claude-sonnet-5: budget_tokens → 400
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const DEFAULT_FREE_DAILY_LIMIT = 30;
const freeDailyLimit = () => Number(process.env.FREE_DAILY_AI_LIMIT) || DEFAULT_FREE_DAILY_LIMIT;

/* ─── Хүсэлтийн body-г allow-list-ээр дахин бүтээх ─── */

function cleanBlock(b) {
  if (!b || typeof b !== "object") return null;
  if (b.type === "text" && typeof b.text === "string") return { type: "text", text: b.text };
  if (b.type === "image") {
    const s = b.source;
    if (s?.type === "base64" && IMAGE_TYPES.includes(s.media_type) && typeof s.data === "string" && s.data)
      return { type: "image", source: { type: "base64", media_type: s.media_type, data: s.data } };
  }
  return null;
}

function cleanContent(content) {
  if (typeof content === "string") return content ? content : null;
  if (!Array.isArray(content) || content.length === 0 || content.length > MAX_BLOCKS) return null;
  const out = content.map(cleanBlock);
  return out.includes(null) ? null : out;
}

function cleanMessage(m) {
  if (!m || (m.role !== "user" && m.role !== "assistant")) return null;
  const content = cleanContent(m.content);
  return content ? { role: m.role, content } : null;
}

function cleanSystem(system) {
  if (typeof system === "string") return system;
  if (Array.isArray(system) && system.every((b) => b?.type === "text" && typeof b.text === "string"))
    return system.map((b) => ({ type: "text", text: b.text }));
  return null;
}

function clampTokens(n) {
  const v = Math.floor(Number(n));
  return Number.isFinite(v) && v > 0 ? Math.min(v, MAX_TOKENS_CAP) : DEFAULT_MAX_TOKENS;
}

/* { body } эсвэл { error } буцаана */
export function buildAnthropicBody(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { error: "Хүсэлтийн бүтэц буруу байна" };
  const { model, system, messages, max_tokens, thinking } = input;

  if (!ALLOWED_MODELS.includes(model))
    return { error: "Энэ AI загварыг ашиглах боломжгүй: " + String(model).slice(0, 60) };

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES)
    return { error: "messages буруу байна" };
  const cleanMessages = messages.map(cleanMessage);
  if (cleanMessages.includes(null)) return { error: "messages буруу байна (зөвхөн текст, зураг)" };

  const body = { model, max_tokens: clampTokens(max_tokens), messages: cleanMessages };

  if (system !== undefined) {
    const s = cleanSystem(system);
    if (s === null) return { error: "system буруу байна" };
    body.system = s;
  }
  if (thinking !== undefined) {
    if (!thinking || !THINKING_TYPES.includes(thinking.type)) return { error: "thinking буруу байна" };
    body.thinking = { type: thinking.type };
  }
  return { body };
}

/* ─── Үнэгүй багцын өдрийн хязгаар ───
   Санах ойд (serverless instance тус бүрт) тоолно: users.json-д хүсэлт бүрт
   бичих, Blob-ын үйлдлийн квот зарцуулахаас зайлсхийсэн. Cold start болон
   олон instance үед тоолуур тэглэгдэх тул "best-effort" хамгаалалт.
   Багцыг (free/premium/vip) зөвхөн хязгаарт хүрсэн үед users.json-оос уншина. */

const usage = new Map();      // email → өнөөдрийн хүсэлтийн тоо
const tierCache = new Map();  // email → { tier, at }
let usageDay = "";
const TIER_TTL_MS = 10 * 60 * 1000;

// Монголын цагаар (UTC+8) өдөр солигдоно
const ubDay = () => new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);

async function defaultLookupTier(email) {
  const users = await readUsers();
  return effectiveTier(users[email]);
}

/* Тестэд солих боломжтой хамаарал */
export const _internals = {
  lookupTier: defaultLookupTier,
  reset() { usage.clear(); tierCache.clear(); usageDay = ""; },
};

async function tierFor(email) {
  const hit = tierCache.get(email);
  if (hit && Date.now() - hit.at < TIER_TTL_MS) return hit.tier;
  const tier = await _internals.lookupTier(email);
  tierCache.set(email, { tier, at: Date.now() });
  return tier;
}

async function takeQuota(email) {
  const today = ubDay();
  if (today !== usageDay) { usage.clear(); tierCache.clear(); usageDay = today; }
  const limit = freeDailyLimit();
  if ((usage.get(email) || 0) >= limit && (await tierFor(email)) === "free") return { ok: false, limit };
  usage.set(email, (usage.get(email) || 0) + 1);
  return { ok: true };
}

// Anthropic алдаа буцаавал (төлбөр гараагүй) тоолуурыг буцаана
function refundQuota(email) {
  const n = usage.get(email) || 0;
  if (n > 0) usage.set(email, n - 1);
}

/* ─── Handler ─── */

export default async function handler(req, res) {
  setCors(req, res, "POST");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key тохируулаагүй байна" });
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Сервер тохиргоо дутуу (JWT_SECRET)" });

  const email = await getSessionEmail(req, secret);
  if (!email) return res.status(401).json({ error: "Нэвтрээгүй байна. Дахин нэвтэрнэ үү.", code: "auth_required" });

  let input = req.body;
  if (typeof input === "string") {
    try { input = JSON.parse(input); } catch { input = null; }
  }
  const { body, error } = buildAnthropicBody(input);
  if (error) return res.status(400).json({ error, code: "bad_request" });

  const quota = await takeQuota(email);
  if (!quota.ok) {
    return res.status(429).json({
      // "(30)" гэж бичвэл чатын дугаарласан жагсаалтын формат "30)"-г хувааж харуулдаг
      error: "Өнөөдрийн үнэгүй " + quota.limit + " AI хүсэлт дууслаа. " +
        "Маргааш дахин оролдох эсвэл Premium багц аваарай.",
      code: "daily_limit",
    });
  }

  let response;
  try {
    response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    refundQuota(email);
    return res.status(502).json({ error: "AI серверт холбогдож чадсангүй: " + e.message });
  }

  if (!response.ok) refundQuota(email);
  const text = await response.text();

  // Серверийн API key-ийн алдааг 401 хэвээр дамжуулбал апп хэрэглэгчийг гаргачихна
  if (response.status === 401 || response.status === 403) {
    console.error("Anthropic auth error", response.status, text.slice(0, 300));
    return res.status(502).json({ error: "AI үйлчилгээний тохиргооны алдаа. Админд мэдэгдэнэ үү." });
  }

  let data;
  try { data = JSON.parse(text); } catch {
    return res.status(502).json({ error: "AI серверээс буруу хариу ирлээ (" + response.status + ")" });
  }
  return res.status(response.status).json(data);
}
