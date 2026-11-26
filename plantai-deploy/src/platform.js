/* Веб болон гар утасны апп (Capacitor) хоёрын ялгааг нэг газар нуудаг.

   Веб:  API нь ижил origin дээр (/api/...), нэвтрэлт нь HttpOnly cookie.
   Апп:  код утсан дотроос ачаалагддаг тул API-г production серверээс бүтэн
         URL-аар дуудаж, нэвтрэлтийн токеныг өөрөө хадгалан Bearer header-ээр
         илгээнэ (өөр origin руу cookie найдвартай дамждаггүй). */
import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform();

const PROD_API = "https://plant-ai-five.vercel.app";
export const API_BASE = isNative ? (import.meta.env.VITE_API_BASE || PROD_API) : "";

const TOKEN_KEY = "plantai.token";
export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage дүүрсэн */ }
};

/* fetch-ийн оронд — API_BASE, апп-ын header, токен/cookie-г өөрөө тохируулна */
export function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (isNative) {
    headers["X-PlantAI-Client"] = "app";
    const t = getToken();
    if (t) headers.Authorization = "Bearer " + t;
  }
  return fetch(API_BASE + path, {
    ...opts,
    headers,
    credentials: isNative ? "omit" : "include",
  });
}

/* Гадаад холбоос — апп дотор системийн хөтчөөр нээгдэнэ (Capacitor гадаад
   домэйн руу шилжихийг автоматаар хөтөч рүү дамжуулдаг) */
export function openExternal(url) {
  if (isNative) window.location.href = url;
  else window.open(url, "_blank", "noopener");
}
