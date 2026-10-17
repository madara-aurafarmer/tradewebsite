// Vercel serverless function: public GET (read data), POST (admin auth + save).
// Password is checked on the server only (env ADMIN_PASSWORD). Data lives in Upstash Redis.
const crypto = require("crypto");
const URL_ = process.env.KV_REST_API_URL, TOKEN = process.env.KV_REST_API_TOKEN;
const redis = async (cmd) =>
  (await fetch(URL_, { method: "POST", headers: { Authorization: "Bearer " + TOKEN }, body: JSON.stringify(cmd) })).json();
const same = (a, b) => {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!URL_ || !TOKEN) return res.status(500).json({ error: "Database not connected" });
  if (req.method === "GET") {
    const r = await redis(["GET", "site"]);
    try { return res.status(200).json(r.result ? JSON.parse(r.result) : {}); } catch { return res.status(200).json({}); }
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const ip = String(req.headers["x-forwarded-for"] || "x").split(",")[0].trim();
  const key = "rl:" + ip;
  const n = (await redis(["INCR", key])).result;
  if (n === 1) await redis(["EXPIRE", key, 900]);
  if (n > 20) return res.status(429).json({ error: "Too many attempts" });
  const { pw, action, data } = req.body || {};
  if (!process.env.ADMIN_PASSWORD || !same(pw, process.env.ADMIN_PASSWORD))
    return res.status(401).json({ error: "Wrong password" });
  if (action === "auth") return res.status(200).json({ ok: true });
  if (action === "save") {
    const str = JSON.stringify(data || {});
    if (str.length > 200000 || !Array.isArray(data?.years)) return res.status(400).json({ error: "Bad data" });
    await redis(["SET", "site", str]);
    return res.status(200).json({ ok: true });
  }
  return res.status(400).json({ error: "Bad request" });
};
