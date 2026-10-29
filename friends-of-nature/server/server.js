/* Референс-бэкенд Friends of Nature. Без зависимостей, Node 18+.
 *   node server/server.js            -> http://localhost:3000
 * Раздаёт сайт (папка выше) и API /api/*. Данные хранятся в server/data.json.
 * Можно использовать как есть или переписать на свой стек — главное сохранить контракт из README.md.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "..");
const DB_FILE = process.env.DB_FILE || path.join(__dirname, "data.json");
const ORIGIN = process.env.CORS_ORIGIN || "*";
const BOARD_MULT = Number(process.env.BOARD_MULT || 8); // очки в режиме доски весят больше
const ROOM_TTL = 1000 * 60 * 60 * 24 * 180; // комнаты (и лес) живут полгода без активности
const MAX_POINTS_PER_REQUEST = 3000;
const GAMES = new Set(["trash", "ocean", "zerowaste", "water", "power", "forest", "rescue", "firewatch", "bee", "survival", "city", "puzzle", "explorer", "planet", "evolution"]);

let db = { rooms: {} };
try { db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch (e) {}
let saveTimer = null;
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(() => fs.writeFile(DB_FILE, JSON.stringify(db), () => {}), 200); }
function cleanup() { const now = Date.now(); for (const c in db.rooms) if (now - (db.rooms[c].touched || db.rooms[c].created) > ROOM_TTL) delete db.rooms[c]; }
setInterval(cleanup, 60 * 60 * 1000);

const rand = (n, a) => Array.from({ length: n }, () => a[Math.random() * a.length | 0]).join("");
const CODE_ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function send(res, code, obj) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(JSON.stringify(obj));
}
function body(req) {
  return new Promise(resolve => {
    let s = ""; req.on("data", d => { s += d; if (s.length > 10000) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(s || "{}")); } catch (e) { resolve({}); } });
  });
}

// простейший лимит запросов на создание комнат (по IP)
const hits = new Map();
function limited(ip) {
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 60000);
  arr.push(now); hits.set(ip, arr); return arr.length > 20;
}

const pub = r => ({ code: r.code, group: r.group, mode: r.mode || "phones", points: r.points || 0, players: (r.players || []).length });

async function api(req, res, url) {
  if (req.method === "OPTIONS") return send(res, 204, {});
  const parts = url.pathname.split("/").filter(Boolean); // ["api","rooms",code,...]
  if (parts[1] !== "rooms") return send(res, 404, { error: "not_found" });

  const pub = r => ({ code: r.code, group: r.group, mode: r.mode, total: r.total, players: r.players.length });

  if (parts.length === 2 && req.method === "POST") {
    if (limited(req.socket.remoteAddress)) return send(res, 429, { error: "too_many" });
    const b = await body(req); const group = Number(b.group);
    if (![0, 1, 2].includes(group)) return send(res, 400, { error: "bad_group" });
    const mode = b.mode === "board" ? "board" : "phones";
    let code; do { code = rand(5, CODE_ALPHA); } while (db.rooms[code]);
    db.rooms[code] = { code, group, mode, total: 0, created: Date.now(), players: [] }; save();
    return send(res, 200, pub(db.rooms[code]));
  }

  const code = String(parts[2] || "").toUpperCase();
  const room = db.rooms[code];
  if (!room) return send(res, 404, { error: "room_not_found" });

  if (parts.length === 3 && req.method === "GET") return send(res, 200, pub(room));

  if (parts[3] === "join" && req.method === "POST") {
    const b = await body(req); const name = String(b.name || "").trim().slice(0, 24);
    if (!name) return send(res, 400, { error: "bad_name" });
    if (room.players.length >= 200) return send(res, 400, { error: "room_full" });
    const id = "p" + rand(8, CODE_ALPHA);
    room.players.push({ id, name, scores: {} }); save();
    return send(res, 200, { playerId: id, group: room.group, mode: room.mode });
  }

  if (parts[3] === "score" && req.method === "POST") {
    const b = await body(req); const score = Number(b.score);
    const p = room.players.find(x => x.id === b.playerId);
    if (!GAMES.has(b.game) || !isFinite(score) || score < 0 || score > 1e5) return send(res, 400, { error: "bad_request" });
    if (!p && room.mode !== "board") return send(res, 400, { error: "bad_player" }); // на телефонах нужен ученик
    const gained = Math.round(score * (room.mode === "board" ? BOARD_MULT : 1));
    room.total += gained;
    if (p) p.scores[b.game] = Math.max(p.scores[b.game] || 0, Math.round(score));
    save();
    return send(res, 200, { ok: true, gained, total: room.total });
  }

  send(res, 404, { error: "not_found" });
}

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname); if (p === "/") p = "/index.html";
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT) || file.startsWith(path.join(ROOT, "server"))) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" }); res.end(data);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname.startsWith("/api/")) api(req, res, url).catch(() => send(res, 500, { error: "server" }));
  else serveStatic(req, res, url);
}).listen(PORT, () => console.log("Friends of Nature: http://localhost:" + PORT));
