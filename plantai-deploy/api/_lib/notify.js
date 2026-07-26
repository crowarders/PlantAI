/* Admin-д шинэ VIP хүсэлт ирэхэд шууд push notification илгээнэ (ntfy.sh, бүртгэл
   шаардахгүй үнэгүй үйлчилгээ). QPay холбогдоогүй хугацаанд admin-ын гар аргаар
   баталгаажуулах хугацааг богиносгоно (24 цаг хүлээхийн оронд шууд мэдэгдэнэ). */
export async function notifyAdmin(title, message) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return; // тохируулаагүй бол чимээгүй алгасна
  try {
    await fetch("https://ntfy.sh/" + topic, {
      method: "POST",
      headers: { Title: encodeURIComponent(title), Priority: "high", Tags: "moneybag" },
      body: message,
    });
  } catch (e) { /* мэдэгдэл хүрэхгүй байх нь хүсэлтийг зогсоох шалтгаан биш */ }
}
