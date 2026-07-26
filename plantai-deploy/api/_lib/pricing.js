export const PRICING = {
  premium: { month: 59900, year: 599000 },
  vip: { month: 79000, year: 490000, life: 1500000 },
};

export function priceFor(plan, billing) {
  return PRICING[plan]?.[billing] ?? null;
}

export function computeExpiry(billing, from = new Date()) {
  if (billing === "life") return null;
  const d = new Date(from);
  if (billing === "year") d.setDate(d.getDate() + 365);
  else d.setDate(d.getDate() + 30);
  return d.toISOString();
}

/* Гар аргаар шилжүүлэг баталгаажуулах шатанд ашиглах банкны мэдээлэл.
   Жинхэнэ утгыг Vercel env var-аар тохируулна (BANK_NAME/BANK_ACCOUNT/BANK_HOLDER) —
   тохируулаагүй бол "тодорхойгүй" гэдгийг тодорхой харуулна, бодит мэт хуурамч дугаар үзүүлэхгүй. */
export function bankInfo() {
  const notSet = "⚠️ Тохируулаагүй — админтай холбогдоно уу";
  return {
    bank: process.env.BANK_NAME || notSet,
    account: process.env.BANK_ACCOUNT || notSet,
    holder: process.env.BANK_HOLDER || notSet,
  };
}
