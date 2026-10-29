/* Лес класса: 4 фазы. Картинки forest/phase1..4 из manifest.js; пока файлов нет, рисуется запасной SVG. */
(function () {
  const h = FON.h, ui = FON.ui;
  const steps = () => (window.FON_CONFIG && FON_CONFIG.FOREST_STEPS) || [1500, 5000, 12000];
  FON.forestPhase = total => steps().filter(s => total >= s).length;           // 0..3
  FON.forestProgress = total => {
    const st = steps(), p = FON.forestPhase(total); if (p >= st.length) return 1;
    const lo = p === 0 ? 0 : st[p - 1]; return Math.min(1, (total - lo) / (st[p] - lo));
  };
  const overall = total => { const p = FON.forestPhase(total); return p >= 3 ? 1 : (p + FON.forestProgress(total)) / 3; };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- запасная картинка ---------- */
  const S = 'stroke="none"';
  const trunk = (x, y, s) => `<rect x="${x - 4 * s}" y="${y - 18 * s}" width="${8 * s}" height="${20 * s}" rx="4" fill="#a77e58"/>`;
  const round = (x, y, s, c) => trunk(x, y, s) + `<circle cx="${x}" cy="${y - 30 * s}" r="${20 * s}" fill="${c}"/><circle cx="${x - 9 * s}" cy="${y - 36 * s}" r="${8 * s}" fill="#ffffff" opacity=".18"/>`;
  const pine = (x, y, s, c) => trunk(x, y, s) + `<path d="M${x} ${y - 68 * s}Q${x + 4 * s} ${y - 66 * s} ${x + 22 * s} ${y - 14 * s}Q${x + 22 * s} ${y - 10 * s} ${x} ${y - 14 * s}Q${x - 22 * s} ${y - 10 * s} ${x - 22 * s} ${y - 14 * s}Q${x - 4 * s} ${y - 66 * s} ${x} ${y - 68 * s}Z" fill="${c}"/>`;
  const flower = (x, y, c) => `<path d="M${x} ${y + 3}v13" stroke="#82a879" stroke-width="2.5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="3.2" fill="${c}"/><circle cx="${x - 3}" cy="${y - 3}" r="3" fill="${c}"/><circle cx="${x + 3}" cy="${y - 3}" r="3" fill="${c}"/><circle cx="${x}" cy="${y - 5}" r="3" fill="${c}"/><circle cx="${x}" cy="${y - 3}" r="1.8" fill="#f4d978"/>`;
  const bird = (x, y) => `<path d="M${x - 9} ${y}q5-7 9 0q4-7 9 0" fill="none" stroke="#688e74" stroke-width="2.5" stroke-linecap="round"/>`;
  function fallback(p) {
    const G = ["#76ad79", "#91bf83", "#548d69", "#a2c987"];
    let o = `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="240" fill="#edf4e7"/><circle cx="335" cy="46" r="25" fill="#f3df9a"/><circle cx="335" cy="46" r="34" fill="#f3df9a" opacity=".18"/>`;
    o += `<ellipse cx="90" cy="270" rx="270" ry="112" fill="#d8e8ce"/><ellipse cx="320" cy="280" rx="250" ry="108" fill="#c6dfbd"/><ellipse cx="200" cy="300" rx="330" ry="100" fill="#afcf9f"/>`;
    const t = [];
    if (p === 0) o += `<path d="M200 205C200 190 200 180 200 168" stroke="#0a2a1a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M200 172C178 176 164 160 162 144C184 144 198 154 200 172Z" fill="#c4f542" ${S}/><path d="M200 172C222 176 236 160 238 144C216 144 202 154 200 172Z" fill="#19d466" ${S}/>`;
    if (p === 1) { t.push([110, 200, .8, 0], [215, 208, 1, 1], [305, 198, .7, 0]); o += flower(160, 214, "#ff6b57") + flower(260, 220, "#ffd23f"); }
    if (p === 2) { t.push([60, 196, .9, 1], [130, 188, .8, 0], [190, 205, 1.1, 2], [255, 190, .85, 1], [320, 202, 1, 0], [360, 190, .7, 3]); o += flower(100, 218, "#ff6b57") + flower(230, 222, "#ffd23f") + flower(290, 220, "#ff9ccf"); }
    if (p === 3) { o += `<ellipse cx="205" cy="212" rx="55" ry="14" fill="#7fd1ff" ${S}/>` + bird(110, 60) + bird(170, 40) + bird(250, 70); t.push([40, 192, 1, 1], [95, 186, .8, 0], [145, 200, 1.1, 2], [270, 200, 1.1, 0], [330, 188, .9, 1], [375, 200, 1, 2], [70, 222, 1.2, 3], [330, 226, 1.2, 0], [20, 226, .9, 0], [385, 230, 1, 1], [120, 230, 1, 1], [290, 232, .9, 2]); o += flower(180, 232, "#ff6b57") + flower(240, 236, "#ff9ccf") + flower(40, 238, "#ffd23f"); }
    t.sort((a, b) => a[1] - b[1]).forEach(a => { o += a[3] % 2 ? pine(a[0], a[1], a[2], G[a[3]]) : round(a[0], a[1], a[2], G[a[3]]); });
    return o + "</svg>";
  }
  const LEAF = '<svg viewBox="0 0 24 24"><path d="M3 21C3 10 10 3 21 3C21 14 14 21 3 21Z" fill="#19d466" stroke="#0a2a1a" stroke-width="2" stroke-linejoin="round"/><path d="M5 19L14 10" stroke="#0a2a1a" stroke-width="1.8" stroke-linecap="round"/></svg>';

  /* ---------- компонент ---------- */
  FON.forest = function (opt) {
    opt = opt || {};
    const names = ui("phaseNames");
    const layers = [0, 1, 2, 3].map(i => {
      const L = h("div", { class: "fl", html: fallback(i) });
      if (FON.loadImg) FON.loadImg("forest/phase" + (i + 1)).then(im => { if (im) L.innerHTML = '<img alt="" src="' + im.src + '">'; });
      return L;
    });
    const banner = h("div", { class: "fbanner" }, h("b"), h("span"));
    const scene = h("div", { class: "fscene" }, layers, banner);
    const stageEl = h("div", { class: "fstage" }), nameEl = h("div", { class: "fname" }), ptsEl = h("div", { class: "fpts" });
    const fill = h("i"), ticks = [0, 1, 2, 3].map(i => h("div", { class: "tick", style: { left: i / 3 * 100 + "%" } }, String(i + 1)));
    const next = h("div", { class: "fnext" });
    const root = h("div", { class: "forest" + (opt.compact ? " compact" : "") }, scene,
      h("div", { class: "finfo" }, h("div", { class: "frow" }, h("div", null, stageEl, nameEl), ptsEl),
        h("div", { class: "fbar" }, h("div", { class: "ftrack" }, fill), ticks), next));
    let shown = -1;
    function phase(p) {
      layers.forEach((L, i) => L.classList.toggle("on", i === p)); ticks.forEach((t, i) => t.classList.toggle("on", i <= p));
      stageEl.textContent = ui("stage") + " " + (p + 1) + "/4"; nameEl.textContent = names[p]; shown = p;
    }
    function info(total) {
      const st = steps(), p = FON.forestPhase(total);
      next.textContent = p >= st.length ? ui("fullGrown") : ui("toNext") + ": " + (st[p] - Math.floor(total));
    }
    function set(total) {
      phase(FON.forestPhase(total)); fill.style.transition = "none"; fill.style.width = overall(total) * 100 + "%";
      ptsEl.textContent = Math.round(total) + " " + ui("points"); info(total);
    }
    function tween(a, b, ms, fn) { return new Promise(res => { const t0 = performance.now(); (function f(n) { const k = Math.min(1, (n - t0) / ms); fn(a + (b - a) * (1 - Math.pow(1 - k, 3))); k < 1 ? requestAnimationFrame(f) : res(); })(t0); }); }
    function burst(n) {
      const r = scene.getBoundingClientRect(); if (!r.width) return; const cols = ["#c4f542", "#ffd23f", "#19d466", "#ff9ccf"];
      for (let i = 0; i < n; i++) {
        const p = h("div", { class: "spark" }); p.style.background = cols[i % 4]; p.style.left = r.left + r.width / 2 + "px"; p.style.top = r.top + r.height / 2 + "px"; document.body.append(p);
        const a = Math.random() * 6.283, d = 90 + Math.random() * 170;
        p.animate([{ transform: "translate(-50%,-50%) scale(1)", opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d}px)) scale(.2)`, opacity: 0 }], { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => p.remove();
      }
    }
    function fly(from, n) {
      if (!from || !from.isConnected) return Promise.resolve();
      const a = from.getBoundingClientRect(), b = scene.getBoundingClientRect(); let last;
      for (let i = 0; i < n; i++) {
        const p = h("div", { class: "fleaf", html: LEAF }); document.body.append(p);
        const sx = a.left + a.width / 2 - 13 + (Math.random() - .5) * 40, sy = a.top + a.height / 2 - 13, tx = b.left + b.width * (.25 + Math.random() * .5), ty = b.top + b.height * (.45 + Math.random() * .3);
        const an = p.animate([{ transform: `translate(${sx}px,${sy}px) rotate(0) scale(.6)`, opacity: 0 }, { transform: `translate(${sx + (Math.random() - .5) * 140}px,${sy - 70 - Math.random() * 60}px) rotate(120deg) scale(1)`, opacity: 1, offset: .3 }, { transform: `translate(${tx}px,${ty}px) rotate(360deg) scale(.5)`, opacity: .9 }], { duration: 1100 + i * 70, delay: i * 55, easing: "cubic-bezier(.5,0,.3,1)", fill: "both" });
        an.onfinish = () => p.remove(); last = an;
      }
      return last ? last.finished.catch(() => {}) : Promise.resolve();
    }
    async function animate(from, to, origin, gained) {
      set(from); await sleep(250);
      await fly(origin, Math.min(18, 6 + Math.round((gained || 0) / 120)));
      scene.classList.add("pulse"); const st = steps(); let cur = from;
      while (cur < to && root.isConnected) {
        const p = FON.forestPhase(cur), bound = p < st.length ? st[p] : Infinity, target = Math.min(to, bound), c0 = cur, o0 = overall(cur);
        const o1 = target >= bound ? (p + 1) / 3 : overall(target);
        fill.style.transition = "none"; fill.style.width = o0 * 100 + "%";
        await tween(c0, target, 1100, v => { ptsEl.textContent = Math.round(v) + " " + ui("points"); fill.style.width = (o0 + (o1 - o0) * ((v - c0) / Math.max(1, target - c0))) * 100 + "%"; });
        cur = target;
        if (cur >= bound) {
          phase(p + 1); burst(26); banner.querySelector("b").textContent = names[p + 1]; banner.querySelector("span").textContent = ui("newPhase");
          banner.classList.remove("show"); void banner.offsetWidth; banner.classList.add("show");
          scene.animate([{ transform: "scale(1)" }, { transform: "scale(1.04)" }, { transform: "scale(1)" }], { duration: 700, easing: "ease-out" });
          await sleep(1400);
        }
      }
      set(to);
    }
    set(0);
    return { el: root, set, animate };
  };
})();
