/* Общие помощники для игр. */
window.FON = window.FON || {};
FON.games = [];
FON.register = g => FON.games.push(g);
FON.board = () => document.body.classList.contains("board");

FON.h = function (tag, props, ...kids) {
  const e = document.createElement(tag);
  if (props) for (const k in props) {
    const v = props[k];
    if (k === "class") e.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(e.style, v);
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k === "html") e.innerHTML = v;
    else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
  }
  kids.flat().forEach(c => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); });
  return e;
};

FON.speak = function (text) {
  try {
    const u = new SpeechSynthesisUtterance(text); u.lang = FON.lang === "ru" ? "ru-RU" : "en-US"; u.rate = 0.9;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) {}
};

FON.R = {
  rnd: (a, b) => a + Math.random() * (b - a),
  ri: n => Math.random() * n | 0,
  pick: a => a[Math.random() * a.length | 0],
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; }
};

/* Иконка + подпись для кнопок. Картинка слева/сверху, подпись мелко. */
FON.item = function (key, label, o) {
  o = o || {};
  return FON.h("span", { class: "item" + (o.cls ? " " + o.cls : "") }, FON.pic(key, { label, size: o.size }), label ? FON.h("span", { class: "cap" }, label) : null);
};

/* Раскраска клетки. o: {bg, ring, fg, txt, pic (ключ), badge (ключ угловой картинки), dim} */
FON.paint = function (btn, o) {
  btn.style.background = o.bg || "#fff"; btn.style.borderColor = o.ring || "#0a2a1a"; btn.style.borderWidth = o.ring ? "4px" : "2px";
  btn.style.color = o.fg || "#0a2a1a"; btn.innerHTML = "";
  if (o.pic) btn.append(FON.pic(o.pic, { cls: "cellpic", label: o.label }));
  if (o.badge) btn.append(FON.pic(o.badge, { cls: "cellbadge", label: o.blabel }));
  if (o.txt != null && o.txt !== "") btn.append(FON.h("span", { class: "celltxt" }, o.txt));
  btn.style.opacity = o.dim ? ".55" : "";
};

/* Контекст игры: всё, что игра создаёт (таймеры, слушатели), чистится автоматически. */
FON.makeCtx = function (el, hooks) {
  const h = FON.h, T = FON.T;
  const cleanups = [];
  const ctx = {
    el, over: false, h, T, R: FON.R,
    raf(fn) {
      let last = performance.now(), id;
      const f = now => {
        if (ctx.over) return;
        const dt = Math.min((now - last) / 1000, 0.05); last = now;
        fn(dt); id = requestAnimationFrame(f);
      };
      id = requestAnimationFrame(f);
      cleanups.push(() => cancelAnimationFrame(id));
    },
    every(fn, ms) { const id = setInterval(() => { if (!ctx.over) fn(); }, ms); cleanups.push(() => clearInterval(id)); return id; },
    after(fn, ms) { const id = setTimeout(() => { if (!ctx.over) fn(); }, ms); cleanups.push(() => clearTimeout(id)); },
    on(target, ev, fn, opts) { target.addEventListener(ev, fn, opts); cleanups.push(() => target.removeEventListener(ev, fn, opts)); },
    hud(defs) {
      const box = h("div", { class: "hud" }), refs = {};
      defs.forEach(d => { const b = h("b", null, d.val == null ? "0" : d.val); refs[d.k] = b; box.append(h("div", { class: "stat" }, h("small", null, d.label), b)); });
      ctx.el.append(box);
      return { set(k, v) { const b = refs[k]; if (!b) return; if (v && v.nodeType) { b.textContent = ""; b.append(v); } else b.textContent = v; } };
    },
    canvas(w, h2) {
      const cv = h("canvas", { class: "cv" }), dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = w * dpr; cv.height = h2 * dpr; cv.style.aspectRatio = w + "/" + h2;
      const g = cv.getContext("2d"); g.scale(dpr, dpr);
      const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * w / r.width, y: (e.clientY - r.top) * h2 / r.height }; };
      return { cv, g, w, h: h2, pos };
    },
    meter(label, cls) {
      const bar = h("i"), val = h("span", null, "0");
      const row = h("div", { class: "mrow" }, h("span", null, label), h("div", { class: "meter " + (cls || "") }, bar), val);
      return { row, set(v, max) { max = max || 100; bar.style.width = FON.R.clamp(v / max * 100, 0, 100) + "%"; val.textContent = Math.round(v); } };
    },
    end(score, win, msg) {
      if (ctx.over) return; ctx.over = true; cleanups.forEach(f => f()); score = Math.max(0, Math.round(score));
      const sub = hooks.submit(score);
      el.innerHTML = "";
      const box = h("div", { class: "gainbox" }), right = h("div");
      const left = h("div", { class: "end" },
        h("h2", null, win ? FON.ui("win") : FON.ui("gameOver")),
        h("div", { class: "big" }, score), h("p", { class: "sub", style: { margin: "6px auto 14px" } }, FON.ui("score") + (msg ? " · " + msg : "")), box,
        h("div", { class: "btnrow", style: { justifyContent: "center" } },
          h("button", { class: "btn", onclick: hooks.restart }, FON.ui("again")),
          h("button", { class: "btn alt", onclick: hooks.exit }, FON.ui("toGames"))));
      el.append(h("div", { class: sub ? "two" : "" }, left, right));
      if (sub) sub.then(r => {
        if (!r || !el.isConnected) return;
        const chip = h("div", { class: "gainchip" }, h("b", null, "+" + r.gained), h("span", null, FON.ui("forestGain")));
        const f = FON.forest({ compact: true }); box.append(chip); right.append(f.el); f.animate(r.total - r.gained, r.total, chip, r.gained);
      }).catch(() => {});
    },
    destroy() { ctx.over = true; cleanups.forEach(f => f()); cleanups.length = 0; }
  };
  return ctx;
};

/* Игровое поле из кнопок-клеток. */
FON.grid = function (ctx, cols, rows, onClick, maxW) {
  const h = ctx.h, k = FON.board() ? 1.6 : 1;
  const box = h("div", { class: "cells", style: { gridTemplateColumns: "repeat(" + cols + ",1fr)", maxWidth: Math.round((maxW || 640) * k) + "px", margin: "0 auto" } });
  const cells = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const b = h("button", { class: "cell", type: "button", onclick: () => onClick(x, y, b) });
    cells.push(b); box.append(b);
  }
  return { box, at: (x, y) => cells[y * cols + x], cells };
};
