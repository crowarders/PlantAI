/* Утасны камерын зураг 3–12MB байдаг — base64 болгоход Vercel-ийн 4.5MB
   хүсэлтийн хязгаар, Claude-ийн 5MB зургийн хязгаараас давж оношлогоо
   бүтэлгүйтдэг. Тиймээс илгээхээс өмнө урт талыг 1568px болгож JPEG-ээр
   шахна (Claude өөрөө ч үүнээс том зургийг энэ хэмжээ рүү багасгадаг тул
   оношлогооны чанар буурахгүй). */

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = (ev) => resolve(ev.target.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const loadImg = (src) =>
  new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });

function drawScaled(img, maxSide, quality) {
  const w0 = img.naturalWidth, h0 = img.naturalHeight;
  const scale = Math.min(1, maxSide / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * scale)), h = Math.max(1, Math.round(h0 * scale));
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff"; // PNG-ийн тунгалаг хэсэг JPEG-д хар болохоос сэргийлнэ
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h); // хөтөч EXIF эргэлтийг автоматаар хэрэгжүүлдэг
  return c.toDataURL("image/jpeg", quality);
}

export async function compressImage(file, maxSide = 1568, quality = 0.85) {
  const url = URL.createObjectURL(file);
  try {
    return drawScaled(await loadImg(url), maxSide, quality);
  } catch {
    return fileToDataURL(file); // задалж чадаагүй формат — анхны файлаар нь
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* Түүхэнд хадгалах жижиг зураг (localStorage-д багтахаар ~10–20KB) */
export async function makeThumb(dataUrl, side = 160) {
  try {
    return drawScaled(await loadImg(dataUrl), side, 0.7);
  } catch {
    return null;
  }
}
