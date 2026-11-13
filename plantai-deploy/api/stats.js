import { get, put } from '@vercel/blob';

const FILE = 'stats.json';
const FARMERS_BASE = 15; // Хэрэглэгчийн тоолуур энэ тооноос эхэлнэ (src/PlantAI.jsx-тэй ижил байх ёстой)
const DEFAULTS = { farmers: FARMERS_BASE, diagnoses: 10 };

async function readStats() {
  try {
    const result = await get(FILE, { access: 'private', useCache: false });
    if (!result) return { ...DEFAULTS };
    const text = await new Response(result.stream).text();
    const data = JSON.parse(text);
    return {
      farmers: Number.isFinite(data.farmers) ? Math.max(FARMERS_BASE, data.farmers) : DEFAULTS.farmers,
      diagnoses: Number.isFinite(data.diagnoses) ? data.diagnoses : DEFAULTS.diagnoses,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

async function writeStats(stats) {
  await put(FILE, JSON.stringify(stats), {
    access: 'private',
    contentType: 'application/json',
    allowOverwrite: true,
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const stats = await readStats();
    return res.status(200).json(stats);
  }

  if (req.method === 'POST') {
    const key = req.body?.key;
    if (key !== 'farmers' && key !== 'diagnoses') {
      return res.status(400).json({ error: 'key нь farmers эсвэл diagnoses байх ёстой' });
    }
    const stats = await readStats();
    stats[key] = (stats[key] || 0) + 1;
    await writeStats(stats);
    return res.status(200).json(stats);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
