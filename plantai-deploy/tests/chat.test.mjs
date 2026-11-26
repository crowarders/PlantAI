/* api/chat.js-ийн unit тест — жинхэнэ Anthropic дуудлагагүй (fetch-ийг орлуулна).
   Ажиллуулах: npm test */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import handler, { _internals, MAX_TOKENS_CAP } from "../api/chat.js";
import { signJWT } from "../api/_lib/auth.js";

const SECRET = "test-jwt-secret";
const realFetch = globalThis.fetch;
let calls;
let upstream; // дараагийн fetch-ийн хариу

function mockRes() {
  const res = { statusCode: 200, headers: {}, body: undefined, ended: false };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; res.ended = true; return res; };
  res.end = () => { res.ended = true; return res; };
  return res;
}

async function call({ method = "POST", headers = {}, body } = {}) {
  const req = { method, headers: { origin: "https://plant-ai-five.vercel.app", ...headers }, body };
  const res = mockRes();
  await handler(req, res);
  return res;
}

const bearer = async (email = "farmer@example.mn", ttl) =>
  ({ authorization: "Bearer " + (await signJWT({ email }, SECRET, ttl)) });

const goodBody = () => ({
  model: "claude-sonnet-5",
  max_tokens: 1500,
  thinking: { type: "disabled" },
  system: "Чи агрономч AI.",
  messages: [{ role: "user", content: "Улаан буудай шарлаж байна" }],
});

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
  process.env.JWT_SECRET = SECRET;
  delete process.env.FREE_DAILY_AI_LIMIT;
  _internals.reset();
  _internals.lookupTier = async () => "free";
  calls = [];
  upstream = { status: 200, body: { id: "msg_1", content: [{ type: "text", text: "Сайн уу" }] } };
  globalThis.fetch = async (url, opts) => {
    calls.push({ url, opts, body: JSON.parse(opts.body) });
    const b = typeof upstream.body === "string" ? upstream.body : JSON.stringify(upstream.body);
    return new Response(b, { status: upstream.status, headers: { "content-type": "application/json" } });
  };
});
afterEach(() => { globalThis.fetch = realFetch; });

test("OPTIONS preflight: 200, origin-г буцаана, credentials зөвшөөрнө", async () => {
  const res = await call({ method: "OPTIONS" });
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["access-control-allow-origin"], "https://plant-ai-five.vercel.app");
  assert.equal(res.headers["access-control-allow-credentials"], "true");
  assert.equal(calls.length, 0);
});

test("GET → 405", async () => {
  const res = await call({ method: "GET" });
  assert.equal(res.statusCode, 405);
});

test("нэвтрэлтгүй → 401, Anthropic дуудагдахгүй", async () => {
  const res = await call({ body: goodBody() });
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.code, "auth_required");
  assert.equal(calls.length, 0);
});

test("өөр нууц үгээр гарын үсэг зурсан токен → 401", async () => {
  const forged = await signJWT({ email: "x@y.mn" }, "wrong-secret");
  const res = await call({ headers: { authorization: "Bearer " + forged }, body: goodBody() });
  assert.equal(res.statusCode, 401);
  assert.equal(calls.length, 0);
});

test("хугацаа нь дууссан токен → 401", async () => {
  const res = await call({ headers: await bearer("farmer@example.mn", -10), body: goodBody() });
  assert.equal(res.statusCode, 401);
  assert.equal(calls.length, 0);
});

test("зөвшөөрөгдөөгүй загвар → 400, Anthropic дуудагдахгүй", async () => {
  const res = await call({ headers: await bearer(), body: { ...goodBody(), model: "claude-fable-5-2" } });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, "bad_request");
  assert.equal(calls.length, 0);
});

test("budget_tokens-тэй thinking, URL зураг, tool_use блок → 400", async () => {
  const h = await bearer();
  const bad = [
    { ...goodBody(), thinking: { type: "enabled", budget_tokens: 50000 } },
    { ...goodBody(), messages: [{ role: "user", content: [{ type: "image", source: { type: "url", url: "https://evil.example/x.png" } }] }] },
    { ...goodBody(), messages: [{ role: "user", content: [{ type: "tool_use", id: "t", name: "x", input: {} }] }] },
    { ...goodBody(), messages: [] },
    { ...goodBody(), messages: [{ role: "system", content: "hi" }] },
  ];
  for (const body of bad) {
    const res = await call({ headers: h, body });
    assert.equal(res.statusCode, 400, JSON.stringify(body).slice(0, 120));
  }
  assert.equal(calls.length, 0);
});

test("200: цэвэрлэсэн body-г л дамжуулж, хариуг буцаана (Bearer)", async () => {
  const img = { type: "image", source: { type: "base64", media_type: "image/jpeg", data: "AAAA" }, cache_control: { type: "ephemeral" } };
  const res = await call({
    headers: await bearer(),
    body: {
      ...goodBody(),
      max_tokens: 100000,
      stream: true,
      temperature: 1,
      tools: [{ name: "x", input_schema: { type: "object" } }],
      metadata: { user_id: "x" },
      messages: [{ role: "user", content: [img, { type: "text", text: "Энэ юу вэ?", extra: 1 }] }],
    },
  });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, upstream.body);
  assert.equal(calls.length, 1);

  const { url, opts, body } = calls[0];
  assert.equal(url, "https://api.anthropic.com/v1/messages");
  assert.equal(opts.headers["x-api-key"], "test-anthropic-key");
  assert.deepEqual(Object.keys(body).sort(), ["max_tokens", "messages", "model", "system", "thinking"]);
  assert.equal(body.model, "claude-sonnet-5");
  assert.equal(body.max_tokens, MAX_TOKENS_CAP);
  assert.deepEqual(body.thinking, { type: "disabled" });
  assert.deepEqual(body.messages, [{ role: "user", content: [
    { type: "image", source: { type: "base64", media_type: "image/jpeg", data: "AAAA" } },
    { type: "text", text: "Энэ юу вэ?" },
  ] }]);
});

test("200: вэбийн pa_session cookie-оор, string body-той ажиллана", async () => {
  const token = await signJWT({ email: "web@example.mn" }, SECRET);
  const res = await call({ headers: { cookie: "pa_session=" + token }, body: JSON.stringify(goodBody()) });
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.max_tokens, 1500);
});

test("Anthropic 401 (серверийн key буруу) → 502, хэрэглэгчийг гаргахгүй", async () => {
  upstream = { status: 401, body: { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } } };
  const orig = console.error; console.error = () => {};
  try {
    const res = await call({ headers: await bearer(), body: goodBody() });
    assert.equal(res.statusCode, 502);
  } finally { console.error = orig; }
});

test("Anthropic 529 алдааг статус, body-тойгоор нь дамжуулна", async () => {
  upstream = { status: 529, body: { type: "error", error: { type: "overloaded_error", message: "Overloaded" } } };
  const res = await call({ headers: await bearer(), body: goodBody() });
  assert.equal(res.statusCode, 529);
  assert.equal(res.body.error.message, "Overloaded");
});

test("үнэгүй багц: өдрийн хязгаарт хүрвэл 429, багцыг зөвхөн тэр үед шалгана", async () => {
  process.env.FREE_DAILY_AI_LIMIT = "3";
  let lookups = 0;
  _internals.lookupTier = async () => { lookups++; return "free"; };
  const h = await bearer("free@example.mn");
  for (let i = 0; i < 3; i++) assert.equal((await call({ headers: h, body: goodBody() })).statusCode, 200);
  assert.equal(lookups, 0);
  const res = await call({ headers: h, body: goodBody() });
  assert.equal(res.statusCode, 429);
  assert.equal(res.body.code, "daily_limit");
  assert.equal(calls.length, 3);
  assert.equal(lookups, 1);
  // өөр хэрэглэгчид нөлөөлөхгүй
  assert.equal((await call({ headers: await bearer("other@example.mn"), body: goodBody() })).statusCode, 200);
});

test("Premium/VIP хэрэглэгч хязгаараас давж ашиглана", async () => {
  process.env.FREE_DAILY_AI_LIMIT = "2";
  _internals.lookupTier = async () => "vip";
  const h = await bearer("vip@example.mn");
  for (let i = 0; i < 5; i++) assert.equal((await call({ headers: h, body: goodBody() })).statusCode, 200);
  assert.equal(calls.length, 5);
});

test("Anthropic алдаа буцаасан хүсэлт хязгаарт тоологдохгүй", async () => {
  process.env.FREE_DAILY_AI_LIMIT = "1";
  const h = await bearer("retry@example.mn");
  upstream = { status: 529, body: { type: "error", error: { type: "overloaded_error", message: "x" } } };
  assert.equal((await call({ headers: h, body: goodBody() })).statusCode, 529);
  upstream = { status: 200, body: { content: [] } };
  assert.equal((await call({ headers: h, body: goodBody() })).statusCode, 200);
  assert.equal((await call({ headers: h, body: goodBody() })).statusCode, 429);
});
