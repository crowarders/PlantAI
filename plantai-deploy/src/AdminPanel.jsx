import { useState, useEffect } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&display=swap');
:root{--bg:#060d06;--bg2:#0c160c;--bg3:#142014;--card:rgba(12,22,12,.85);--border:#1a2e1a;--border2:#254025;--g:#4ade80;--g2:#22c55e;--g3:#16a34a;--gold:#fbbf24;--t:#e8f5e9;--t2:#94c896;--t3:#5a805c;--red:#ef4444;--vip:#a78bfa}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Noto Sans',sans-serif;background:var(--bg);color:var(--t)}
.inp{background:var(--bg2);border:1px solid var(--border);color:var(--t);padding:11px 15px;border-radius:11px;font-size:14px;width:100%;outline:none;font-family:inherit}
.btn{border:none;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-g{background:linear-gradient(135deg,var(--g3),var(--g2));color:#fff}
.btn-r{background:var(--red);color:#fff}
.btn-o{background:transparent;color:var(--t2);border:1px solid var(--border2)}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px}
`;

const STATUS_L = { pending: "⏳ Хүлээгдэж байна", active: "✅ Идэвхтэй", none: "— Байхгүй" };
const PLAN_L = { premium: "⭐ Premium", vip: "💎 VIP" };
const BILLING_L = { month: "Сар", year: "Жил", life: "Насан турш" };

export default function AdminPanel() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async (secret) => {
    setLoading(true); setMsg("");
    try {
      const r = await fetch("/api/admin/pending", { headers: { "X-Admin-Secret": secret } });
      const data = await r.json();
      if (!r.ok) { setMsg(data.error || "Алдаа"); setAuthed(false); return; }
      setUsers(data.users); setAuthed(true);
      try { sessionStorage.setItem("pa_admin_key", secret); } catch {}
    } catch (e) { setMsg("Холболтын алдаа"); }
    setLoading(false);
  };

  useEffect(() => {
    let saved = "";
    try { saved = sessionStorage.getItem("pa_admin_key") || ""; } catch {}
    if (saved) { setKey(saved); load(saved); }
  }, []);

  const act = async (email, action) => {
    setMsg("");
    try {
      const r = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Secret": key },
        body: JSON.stringify({ email, action }),
      });
      const data = await r.json();
      if (!r.ok) { setMsg(data.error || "Алдаа"); return; }
      load(key);
    } catch (e) { setMsg("Холболтын алдаа"); }
  };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <style>{CSS}</style>
        <div className="card" style={{ maxWidth: 340, width: "100%" }}>
          <h2 style={{ fontSize: 18, marginBottom: 14, color: "var(--gold)" }}>🔒 Admin нэвтрэлт</h2>
          {msg && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 10 }}>{msg}</div>}
          <input className="inp" type="password" placeholder="Admin нууц үг" value={key}
            onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(key)}
            style={{ marginBottom: 10 }} />
          <button className="btn btn-g" style={{ width: "100%" }} disabled={loading} onClick={() => load(key)}>
            {loading ? "..." : "Нэвтрэх"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <style>{CSS}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, color: "var(--gold)" }}>👤 VIP гишүүнчлэл — Admin</h2>
        <button className="btn btn-o" onClick={() => load(key)} disabled={loading}>{loading ? "..." : "🔄 Шинэчлэх"}</button>
      </div>
      {msg && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 12 }}>{msg}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {users.length === 0 && <div className="card" style={{ color: "var(--t3)", textAlign: "center" }}>Хэрэглэгч алга</div>}
        {users.map((u) => (
          <div key={u.email} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name} <span style={{ color: "var(--t3)", fontWeight: 400 }}>· {u.email}</span></div>
              <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 4 }}>
                {STATUS_L[u.status] || u.status}
                {u.plan && <> · {PLAN_L[u.plan] || u.plan} ({BILLING_L[u.billing] || u.billing})</>}
                {u.requestedAt && <> · хүсэлт: {new Date(u.requestedAt).toLocaleString("mn-MN")}</>}
                {u.expiresAt && <> · дуусах: {new Date(u.expiresAt).toLocaleDateString("mn-MN")}</>}
                {!u.expiresAt && u.status === "active" && u.billing === "life" && <> · насан туршийн</>}
              </div>
            </div>
            {u.status === "pending" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-g" onClick={() => act(u.email, "approve")}>✅ Батлах</button>
                <button className="btn btn-r" onClick={() => act(u.email, "reject")}>✕ Татгалзах</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
