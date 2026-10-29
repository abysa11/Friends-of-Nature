/* Слой работы с сервером. Весь сайт ходит на бэкенд ТОЛЬКО через этот объект.
 * Контракт (см. README.md):
 *   POST /api/rooms                 {group, mode}                      -> {code, group, mode, points}
 *   GET  /api/rooms/:code                                              -> {code, group, mode, points, players}   | 404
 *   POST /api/rooms/:code/join      {name}                             -> {playerId, group, mode, points}        | 404
 *   POST /api/rooms/:code/score     {playerId?, game, score, points}   -> {ok:true, points}                      | 404
 *   mode: "board" (интерактивная доска) | "phones" (ученики по коду)
 *   points — очки леса, которые игра добавляет комнате. Общая сумма хранится в комнате.
 */
(function () {
  const C = window.FON_CONFIG || {};
  const base = (C.API_BASE || "") + "/api";
  let demo = false;
  const listeners = [];

  function setDemo(v) { if (demo !== v) { demo = v; listeners.forEach(f => f(v)); } }

  async function http(method, path, body) {
    let res;
    try {
      res = await fetch(base + path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (e) { const err = new Error("network"); err.network = true; throw err; }
    const ct = res.headers.get("content-type") || "";
    if (res.status === 404 && ct.includes("json")) { const err = new Error("notfound"); err.status = 404; throw err; }
    if (!res.ok || !ct.includes("json")) { const err = new Error("server"); err.network = true; err.status = res.status; throw err; }
    return res.json();
  }

  /* ---------- локальное демо-хранилище ---------- */
  const LS = {
    get(k) { try { return JSON.parse(localStorage.getItem("fon_" + k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem("fon_" + k, JSON.stringify(v)); } catch (e) {} }
  };
  const rnd = n => Array.from({ length: n }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.random() * 32 | 0]).join("");
  const nf = () => { const e = new Error("notfound"); e.status = 404; return e; };
  const pub = r => ({ code: r.code, group: r.group, mode: r.mode, total: r.total, players: r.players.length });
  const local = {
    async createRoom(group, mode) {
      let code; do { code = rnd(5); } while (LS.get("room_" + code));
      const r = { code, group, mode: mode === "board" ? "board" : "phones", total: 0, players: [] };
      LS.set("room_" + code, r); return pub(r);
    },
    async getRoom(code) { const r = LS.get("room_" + code); if (!r) throw nf(); return pub(r); },
    async join(code, name) {
      const r = LS.get("room_" + code); if (!r) throw nf(); const id = "p" + rnd(6);
      r.players.push({ id, name, scores: {} }); LS.set("room_" + code, r); return { playerId: id, group: r.group, mode: r.mode };
    },
    async score(code, playerId, game, score) {
      const r = LS.get("room_" + code); if (!r) throw nf();
      const mult = r.mode === "board" ? (C.BOARD_MULT || 8) : 1, gained = Math.round(score * mult);
      r.total += gained; const p = r.players.find(x => x.id === playerId);
      if (p) p.scores[game] = Math.max(p.scores[game] || 0, score);
      LS.set("room_" + code, r); return { ok: true, gained, total: r.total };
    }
  };

  /* Пробуем сервер; при сетевой ошибке (и если разрешено) — демо. */
  async function call(remote, localFn) {
    if (demo) return localFn();
    try { return await remote(); }
    catch (e) {
      if (e.network && C.ALLOW_DEMO) { setDemo(true); return localFn(); }
      throw e;
    }
  }
  const enc = encodeURIComponent;

  window.FON_API = {
    isDemo: () => demo,
    onDemo: f => listeners.push(f),
    createRoom: (group, mode) => call(() => http("POST", "/rooms", { group, mode }), () => local.createRoom(group, mode)),
    getRoom: code => call(() => http("GET", "/rooms/" + encodeURIComponent(code)), () => local.getRoom(code)),
    join: (code, name) => call(() => http("POST", "/rooms/" + encodeURIComponent(code) + "/join", { name }), () => local.join(code, name)),
    sendScore: (code, playerId, game, score) => call(
      () => http("POST", "/rooms/" + encodeURIComponent(code) + "/score", { playerId, game, score }),
      () => local.score(code, playerId, game, score))
  };
})();
