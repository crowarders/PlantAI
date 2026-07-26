import { readUsers, writeUsers, publicUser } from "../_lib/users.js";
import { getSessionEmail } from "../_lib/auth.js";
import { priceFor, bankInfo } from "../_lib/pricing.js";
import { notifyAdmin } from "../_lib/notify.js";

const PLANS = ["premium", "vip"];
const BILLINGS = ["month", "year", "life"];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Сервер тохиргоо дутуу (JWT_SECRET)" });

  const email = await getSessionEmail(req, secret);
  if (!email) return res.status(401).json({ error: "Эхлээд нэвтэрнэ үү" });

  const { plan, billing } = req.body || {};
  if (!PLANS.includes(plan)) return res.status(400).json({ error: "plan буруу байна" });
  if (!BILLINGS.includes(billing)) return res.status(400).json({ error: "billing буруу байна" });
  if (plan === "premium" && billing === "life") return res.status(400).json({ error: "Premium насан туршийн багц байхгүй" });

  const price = priceFor(plan, billing);
  if (price == null) return res.status(400).json({ error: "Энэ багц одоогоор боломжгүй" });

  const users = await readUsers();
  const record = users[email];
  if (!record) return res.status(401).json({ error: "Хэрэглэгч олдсонгүй" });

  record.vip = {
    status: "pending", plan, billing,
    expiresAt: record.vip?.expiresAt || null,
    requestedAt: new Date().toISOString(),
    approvedAt: null, note: null,
  };
  users[email] = record;
  await writeUsers(users);

  const planL = plan === "vip" ? "VIP" : "Premium";
  const billingL = { month: "сар", year: "жил", life: "насан турш" }[billing];
  await notifyAdmin(
    "💰 Шинэ VIP хүсэлт",
    record.name + " (" + email + ") — " + planL + " · " + billingL + " · " + price.toLocaleString("en-US") + "₮\n" +
      "Батлах: " + "https://plant-ai-five.vercel.app/?admin=1"
  );

  return res.status(200).json({ user: publicUser(record), price, bank: bankInfo() });
}
