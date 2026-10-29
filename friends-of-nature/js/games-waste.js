/* Группа 1: Отходы и ресурсы */
(function () {
  const reg = FON.register;
  const easy = () => (FON.board() ? 0.65 : 1);     // на доске игры медленнее и добрее
  const longer = () => (FON.board() ? 1.7 : 1);    // и времени на раунд больше

  /* ============ 1. TRASH RUSH ============ */
  reg({
    id: "trash", group: 0, name: ["Trash Rush", "Trash Rush"],
    desc: ["Сортируй мусор на конвейере на скорость", "Sort the waste on a speeding conveyor"],
    start(ctx) {
      const { h, T, R } = ctx, E = easy();
      const BINS = [["bin/plastic", T("Пластик", "Plastic"), "b0"], ["bin/paper", T("Бумага", "Paper"), "b1"], ["bin/glass", T("Стекло", "Glass"), "b2"], ["bin/organic", T("Органика", "Organic"), "b3"]];
      const ITEMS = [
        ["trash/bottle", "Бутылка", "Bottle", 0], ["trash/bag", "Пакет", "Bag", 0], ["trash/cup", "Стаканчик", "Cup", 0],
        ["trash/newspaper", "Газета", "Newspaper", 1], ["trash/box", "Коробка", "Box", 1], ["trash/notebook", "Тетрадь", "Notebook", 1],
        ["trash/jar", "Банка", "Jar", 2], ["trash/wine", "Бутылка", "Glass bottle", 2], ["trash/perfume", "Флакон", "Vial", 2],
        ["trash/peel", "Кожура", "Peel", 3], ["trash/core", "Огрызок", "Apple core", 3], ["trash/eggshell", "Скорлупа", "Eggshell", 3],
        ["trash/toy", "Уточка", "Duck toy", 0, 1], ["trash/comic", "Книжка", "Book", 1, 1], ["trash/vase", "Ваза", "Vase", 2, 1], ["trash/fruit", "Ананас", "Pineapple", 3, 1]];
      const hud = ctx.hud([{ k: "s", label: T("Очки", "Score"), val: 0 }, { k: "l", label: T("Жизни", "Lives"), val: FON.board() ? 5 : 3 }, { k: "c", label: T("Комбо", "Combo"), val: "x1.0" }]);
      const belt = h("div", { class: "belt" }, h("div", { class: "exit" }));
      const row = h("div", { class: "bins" }, BINS.map((b, i) => h("button", { class: "bin " + b[2], type: "button", onclick: () => sort(i) }, FON.pic(b[0], { label: b[1] }), h("span", null, b[1]), h("small", null, String(i + 1)))));
      ctx.el.append(belt, row);
      let q = [], score = 0, lives = FON.board() ? 5 : 3, combo = 0, spawn = 0.2, t = 0;
      const mult = () => 1 + Math.min(combo, 10) * 0.2;
      const upd = () => { hud.set("s", score); hud.set("l", lives); hud.set("c", "x" + mult().toFixed(1)); };
      const mark = () => q.forEach((o, i) => o.el.classList.toggle("first", i === 0));
      function lose() { lives--; combo = 0; upd(); if (lives <= 0) ctx.end(score, false); }
      function sort(i) {
        const o = q.shift(); if (!o) return; o.el.remove();
        if (o.cat === i) { combo++; score += Math.round((o.rare ? 30 : 10) * mult()); upd(); } else lose();
        mark();
      }
      ctx.on(document, "keydown", e => { const n = +e.key; if (n >= 1 && n <= 4) sort(n - 1); });
      ctx.raf(dt => {
        t += dt; const w = belt.clientWidth || 600; spawn -= dt;
        if (spawn <= 0) {
          const it = Math.random() < 0.14 ? R.pick(ITEMS.filter(i => i[4])) : R.pick(ITEMS.filter(i => !i[4]));
          const el = h("div", { class: "titem" + (it[4] ? " rare" : "") }, FON.pic(it[0], { label: T(it[1], it[2]) }));
          el.style.transform = "translateX(" + w + "px)"; belt.append(el);
          q.push({ el, x: w, cat: it[3], rare: !!it[4] }); mark();
          spawn = Math.max(0.7, 2.1 - t / 45) / E;
        }
        const sp = Math.min(90 + t * 3.5, 420) * E;
        for (const o of q) { o.x -= sp * dt; o.el.style.transform = "translateX(" + o.x.toFixed(1) + "px)"; }
        while (q.length && q[0].x < -150) { q.shift().el.remove(); lose(); mark(); if (ctx.over) return; }
      });
    }
  });

  /* ============ 2. CLEAN THE OCEAN ============ */
  reg({
    id: "ocean", group: 0, name: ["Clean the Ocean", "Clean the Ocean"],
    desc: ["Корабль, топливо и мусор: что собирать первым?", "Ship, fuel and litter: what to collect first?"],
    start(ctx) {
      const { h, T, R } = ctx;
      const W = 900, H = 520, cvs = ctx.canvas(W, H), g = cvs.g, TIME = Math.round(120 * longer());
      FON.preload(["ocean/bottle", "ocean/bag", "ocean/net", "ocean/barrel", "ocean/ship", "ocean/port"]);
      const hud = ctx.hud([{ k: "s", label: T("В порту", "Banked"), val: 0 }, { k: "t", label: T("Время", "Time"), val: TIME }, { k: "c", label: T("Трюм", "Cargo"), val: "0/6" }, { k: "o", label: T("Мусора", "Litter"), val: 0 }]);
      const fuelM = ctx.meter(T("Топливо", "Fuel"), "sun"); const healthM = ctx.meter(T("Океан", "Ocean"), "sky");
      ctx.el.append(h("div", { style: { maxWidth: "420px", marginBottom: "10px" } }, fuelM.row, healthM.row), cvs.cv);
      const TYPES = [{ k: "ocean/bottle", v: 1, slot: 1, r: 17 }, { k: "ocean/bag", v: 2, slot: 1, r: 19 }, { k: "ocean/net", v: 4, slot: 1, r: 21 }, { k: "ocean/barrel", v: 7, slot: 2, r: 23 }];
      const port = { x: 70, y: H - 70, r: 58 };
      const ship = { x: port.x + 90, y: port.y - 10, left: false };
      let fuel = 100, cargo = [], banked = 0, time = TIME, target = null, trash = [], spawnT = 0, keys = {}, down = false, tt = 0, stranded = 0;
      const addTrash = () => { const ty = R.pick([TYPES[0], TYPES[0], TYPES[1], TYPES[1], TYPES[2], TYPES[3]]); trash.push({ t: ty, x: R.rnd(170, W - 30), y: R.rnd(30, H - 30), vx: R.rnd(-6, 6), vy: R.rnd(-4, 4) }); };
      for (let i = 0; i < 9; i++) addTrash();
      ctx.on(cvs.cv, "pointerdown", e => { down = true; target = cvs.pos(e); cvs.cv.setPointerCapture(e.pointerId); });
      ctx.on(cvs.cv, "pointermove", e => { if (down) target = cvs.pos(e); });
      ctx.on(cvs.cv, "pointerup", () => { down = false; });
      ctx.on(document, "keydown", e => { keys[e.key.toLowerCase()] = true; if (e.key.startsWith("Arrow")) e.preventDefault(); });
      ctx.on(document, "keyup", e => { keys[e.key.toLowerCase()] = false; });
      const slots = () => cargo.reduce((a, t) => a + t.slot, 0);
      ctx.raf(dt => {
        tt += dt; time -= dt; spawnT -= dt;
        if (spawnT <= 0 && trash.length < 26) { addTrash(); spawnT = 3.2; }
        let dx = 0, dy = 0;
        if (keys.arrowleft || keys.a) dx -= 1; if (keys.arrowright || keys.d) dx += 1; if (keys.arrowup || keys.w) dy -= 1; if (keys.arrowdown || keys.s) dy += 1;
        if (dx || dy) { target = null; } else if (target) { dx = target.x - ship.x; dy = target.y - ship.y; if (Math.hypot(dx, dy) < 6) { target = null; dx = dy = 0; } }
        const L = Math.hypot(dx, dy), docked = Math.hypot(ship.x - port.x, ship.y - port.y) < port.r + 10;
        if (L > 0 && fuel > 0) {
          const step = Math.min(190 * dt, target ? Math.hypot(target.x - ship.x, target.y - ship.y) : 1e9);
          ship.x = R.clamp(ship.x + dx / L * step, 24, W - 24); ship.y = R.clamp(ship.y + dy / L * step, 24, H - 24); if (Math.abs(dx) > 0.1) ship.left = dx < 0;
          if (!docked) fuel -= step * 0.045 * easy();
        }
        if (docked) {
          if (cargo.length) { banked += cargo.reduce((a, t) => a + t.v, 0); cargo = []; }
          fuel = Math.min(100, fuel + 45 * dt);
        }
        for (const t of trash) { t.x = R.clamp(t.x + t.vx * dt, 24, W - 24); t.y = R.clamp(t.y + t.vy * dt, 24, H - 24); if (t.x <= 24 || t.x >= W - 24) t.vx *= -1; if (t.y <= 24 || t.y >= H - 24) t.vy *= -1; }
        for (let i = trash.length - 1; i >= 0; i--) {
          const t = trash[i];
          if (Math.hypot(t.x - ship.x, t.y - ship.y) < t.t.r + 22 && slots() + t.t.slot <= 6) { cargo.push(t.t); trash.splice(i, 1); }
        }
        const health = 100 - trash.length * 4;
        fuelM.set(fuel); healthM.set(health);
        hud.set("s", banked); hud.set("t", Math.max(0, Math.ceil(time))); hud.set("c", slots() + "/6"); hud.set("o", trash.length);
        if (fuel <= 0 && !docked) { stranded += dt; if (stranded > 1.2) return ctx.end(banked, false, T("кончилось топливо", "out of fuel")); }
        if (time <= 0) return ctx.end(banked + (trash.length === 0 ? 50 : 0), trash.length < 5, "");
        if (health <= 0) return ctx.end(banked, false, T("океан заполнен мусором", "the ocean is choked"));
        /* рисуем */
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#7fe0ff"); gr.addColorStop(1, "#2a9be0"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 2;
        for (let r = 0; r < 7; r++) { g.beginPath(); for (let x = 0; x <= W; x += 20) { const y = 40 + r * 70 + Math.sin(x / 40 + tt * 1.5 + r) * 5; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
        g.fillStyle = "#f6d98c"; g.strokeStyle = "#0a2a1a"; g.lineWidth = 3; g.beginPath(); g.arc(port.x, port.y, port.r, 0, 7); g.fill(); g.stroke();
        FON.drawPic(g, "ocean/port", port.x - 46, port.y - 46, 92, 92, { label: T("Порт", "Port") });
        for (const t of trash) {
          g.fillStyle = "#fff"; g.strokeStyle = "#0a2a1a"; g.lineWidth = 2.5; g.beginPath(); g.arc(t.x, t.y, t.t.r + 4, 0, 7); g.fill(); g.stroke();
          FON.drawPic(g, t.t.k, t.x - t.t.r, t.y - t.t.r, t.t.r * 2, t.t.r * 2);
          g.fillStyle = "#0a2a1a"; g.font = "800 12px Montserrat,sans-serif"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillText("+" + t.t.v, t.x, t.y - t.t.r - 8);
        }
        FON.drawPic(g, "ocean/ship", ship.x - 40, ship.y - 32, 80, 64, { flip: ship.left, label: T("Кораблик", "Boat") });
        if (target) { g.strokeStyle = "rgba(10,42,26,.5)"; g.lineWidth = 2; g.beginPath(); g.arc(target.x, target.y, 8, 0, 7); g.stroke(); }
      });
    }
  });

  /* ============ 3. ZERO WASTE ============ */
  reg({
    id: "zerowaste", group: 0, name: ["Zero Waste", "Zero Waste"],
    desc: ["Разбери дом на отходы: переработай, используй снова, отдай", "Clear the house of waste: recycle, reuse, donate"],
    start(ctx) {
      const { h, T, R } = ctx; const TIME = Math.round(90 * longer());
      const A = [["recycle", "act/recycle", T("Переработать", "Recycle")], ["reuse", "act/reuse", T("Использовать снова", "Reuse")], ["compost", "act/compost", T("В компост", "Compost")], ["donate", "act/donate", T("Отдать", "Donate")], ["landfill", "act/landfill", T("В мусор", "Landfill")]];
      const ROOMS = [["room/kitchen", T("Кухня", "Kitchen")], ["room/bathroom", T("Ванная", "Bathroom")], ["room/bedroom", T("Спальня", "Bedroom")], ["room/garage", T("Гараж", "Garage")]];
      const ALL = [
        [0, "trash/peel", "Банановая кожура", "Banana peel", "compost"], [0, "trash/jar", "Стеклянная банка", "Glass jar", "reuse"], [0, "trash/bottle", "Пластиковая бутылка", "Plastic bottle", "recycle"], [0, "zw/pizza", "Коробка от пиццы", "Greasy pizza box", "landfill"],
        [1, "zw/shampoo", "Пустой шампунь", "Empty shampoo", "recycle"], [1, "zw/toothbrush", "Старая щётка", "Old toothbrush", "landfill"], [1, "zw/towel", "Хорошее полотенце", "Good towel", "donate"], [1, "zw/rag", "Рваное полотенце", "Torn towel", "reuse"],
        [2, "zw/jacket", "Тёплая куртка", "Warm jacket", "donate"], [2, "zw/socks", "Рваные носки", "Torn socks", "reuse"], [2, "trash/newspaper", "Старые газеты", "Old newspapers", "recycle"], [2, "zw/tissue", "Салфетка", "Used tissue", "landfill"],
        [3, "trash/box", "Картонные коробки", "Cardboard boxes", "reuse"], [3, "zw/scrap", "Металлолом", "Scrap metal", "recycle"], [3, "zw/clippings", "Скошенная трава", "Grass clippings", "compost"], [3, "zw/bike", "Рабочий велосипед", "Working bike", "donate"]];
      const items = ALL.map(i => ({ room: i[0], key: i[1], name: T(i[2], i[3]), ans: i[4], done: false }));
      const hud = ctx.hud([{ k: "w", label: T("Отходов осталось", "Waste left"), val: items.length }, { k: "t", label: T("Время", "Time"), val: TIME }, { k: "m", label: T("Ошибки", "Mistakes"), val: 0 }, { k: "s", label: T("Очки", "Score"), val: 0 }]);
      const log = h("div", { class: "log" }, T("Выбери вещь, потом действие.", "Pick a thing, then an action."));
      let sel = null, mist = 0, score = 0, time = TIME;
      const btns = [];
      const houseEl = h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" } }, ROOMS.map((rm, r) =>
        h("div", { class: "card", style: { padding: "12px" } }, h("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, FON.pic(rm[0], { size: 48, label: rm[1] }), h("span", { class: "tag" }, rm[1])),
          h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px" } }, items.filter(i => i.room === r).map(it => {
            const b = h("button", { class: "opt vert", type: "button", onclick: () => { if (it.done) return; sel = it; btns.forEach(x => x.b.classList.toggle("on", x.it === it)); } }, FON.pic(it.key, { label: it.name }), h("span", { class: "cap" }, it.name)); btns.push({ b, it }); return b;
          })))));
      const acts = h("div", { class: "opts", style: { gridTemplateColumns: "repeat(5,1fr)", background: "#fff", padding: "6px", border: "3px solid var(--ink)", borderRadius: "14px" } }, A.map(a => h("button", { class: "opt vert", type: "button", onclick: () => act(a[0]) }, FON.pic(a[1], { label: a[2] }), h("span", { class: "cap" }, a[2]))));
      ctx.el.append(houseEl, h("div", { style: { position: "sticky", bottom: "8px", marginTop: "12px", zIndex: 5 } }, acts), log);
      function act(a) {
        if (!sel || sel.done) { log.textContent = T("Сначала выбери вещь.", "Pick a thing first."); return; }
        if (a === sel.ans) {
          sel.done = true; score += 10; const b = btns.find(x => x.it === sel).b; b.disabled = true; b.classList.remove("on");
          log.textContent = T("Верно!", "Correct!"); sel = null;
          const left = items.filter(i => !i.done).length; hud.set("w", left); hud.set("s", score);
          if (!left) ctx.end(score + Math.round(time) * 3 - mist * 5, true, T("дом без отходов", "a waste-free house"));
        } else {
          mist++; score = Math.max(0, score - 5); hud.set("m", mist); hud.set("s", score);
          log.textContent = T("Не подходит. Подумай: можно ли это использовать снова или отдать?", "Not quite. Can it be reused or donated instead?");
        }
      }
      ctx.every(() => { time--; hud.set("t", time); if (time <= 0) ctx.end(score, false, T("время вышло", "time is up")); }, 1000);
    }
  });

  /* ============ 4. WATER CRISIS ============ */
  reg({
    id: "water", group: 0, name: ["Water Crisis", "Water Crisis"],
    desc: ["Раздели ограниченный запас воды и не допусти кризиса", "Share a shrinking water supply and avoid a crisis"],
    start(ctx) {
      const { h, T, R } = ctx;
      const DAYS = FON.board() ? 8 : 12, soft = FON.board() ? 0.8 : 1;
      const C = [{ k: "home", img: "water/home", n: T("Дома", "Homes"), need: 35, m: T("Жители", "Residents") }, { k: "farm", img: "water/farm", n: T("Фермы", "Farms"), need: 40, m: T("Еда", "Food") }, { k: "ind", img: "water/factory", n: T("Предприятия", "Industry"), need: 30, m: T("Экономика", "Economy") }, { k: "hosp", img: "water/hospital", n: T("Больница", "Hospital"), need: 15, m: T("Здоровье", "Health") }];
      let day = 1, reservoir = 30, eff = 1, inflow = 0, event = "", farmBoost = 1, effCd = 0;
      const mood = { home: 80, farm: 80, ind: 80, hosp: 90 }, alloc = { home: 0, farm: 0, ind: 0, hosp: 0 };
      const hud = ctx.hud([{ k: "d", label: T("День", "Day"), val: "1/" + DAYS }, { k: "a", label: T("Воды", "Water"), val: 0 }, { k: "r", label: T("Роздано", "Assigned"), val: 0 }]);
      const evEl = h("div", { class: "log", style: { fontWeight: 800, color: "#0a2a1a" } });
      const rows = {}, ms = {};
      const wrap = h("div", { class: "card", style: { marginBottom: "12px" } });
      const needOf = c => Math.round(c.need * soft * eff * (1 + day * 0.02) * (c.k === "farm" ? farmBoost : 1));
      const avail = () => reservoir + inflow;
      const used = () => C.reduce((a, c) => a + alloc[c.k], 0);
      C.forEach(c => {
        const v = h("b", { style: { minWidth: "38px", textAlign: "center", fontSize: "20px" } }, "0"), drops = h("div", { class: "drops" });
        const plus = h("button", { class: "btn sm", type: "button", "aria-label": "+", onclick: () => set(c.k, 5) }, "+"), minus = h("button", { class: "btn alt sm", type: "button", "aria-label": "-", onclick: () => set(c.k, -5) }, "−");
        rows[c.k] = { v, drops }; ms[c.k] = ctx.meter(c.m);
        wrap.append(h("div", { class: "wrow" }, FON.pic(c.img, { label: c.n }), h("div", null, h("b", null, c.n), drops, ms[c.k].row),
          h("div", { style: { display: "flex", gap: "6px", alignItems: "center" } }, minus, v, plus)));
      });
      const effBtn = h("button", { class: "btn alt", type: "button", onclick: invest }, "");
      const nextBtn = h("button", { class: "btn sun", type: "button", onclick: endDay }, T("Закончить день", "End day"));
      ctx.el.append(evEl, wrap, h("div", { class: "btnrow" }, nextBtn, effBtn));
      function refresh() {
        hud.set("d", day + "/" + DAYS); hud.set("a", avail()); hud.set("r", used());
        C.forEach(c => {
          rows[c.k].v.textContent = alloc[c.k]; ms[c.k].set(mood[c.k]);
          const have = Math.round(alloc[c.k] / 5), need = Math.max(0, Math.ceil((needOf(c) - alloc[c.k]) / 5));
          rows[c.k].drops.innerHTML = ""; for (let i = 0; i < Math.min(14, have); i++) rows[c.k].drops.append(h("span", { class: "drop" }));
          for (let i = 0; i < Math.min(14 - Math.min(14, have), need); i++) rows[c.k].drops.append(h("span", { class: "drop need" }));
        });
        effBtn.textContent = T("Починить трубы (−10 воды, нужно меньше)", "Fix pipes (−10 water, demand drops)");
        effBtn.disabled = effCd > 0 || avail() - used() < 10; evEl.textContent = event;
      }
      function set(k, d) { const nv = alloc[k] + d; if (nv < 0 || (d > 0 && used() + d > avail())) return; alloc[k] = nv; refresh(); }
      function invest() {
        if (effCd > 0 || avail() - used() < 10) return;
        if (reservoir >= 10) reservoir -= 10; else { inflow -= 10 - reservoir; reservoir = 0; }
        eff *= 0.92; effCd = 3; refresh();
      }
      function newDay() {
        inflow = Math.max(35, Math.round(115 - day * 5 + R.rnd(-10, 10))); event = ""; farmBoost = 1;
        const e = Math.random();
        if (day > 1 && e < 0.2) { event = T("Жара: фермам нужно на 25% больше воды.", "Heatwave: farms need 25% more water."); farmBoost = 1.25; }
        else if (day > 2 && e < 0.35) { event = T("Утечка в магистрали: −15 воды.", "Main pipe leak: −15 water."); inflow -= 15; }
        else if (e > 0.88) { event = T("Дождь: +20 воды.", "Rain: +20 water."); inflow += 20; }
        C.forEach(c => alloc[c.k] = 0);
        if (effCd > 0) effCd--;
      }
      function endDay() {
        let worst = 100;
        C.forEach(c => {
          const frac = Math.min(1, alloc[c.k] / needOf(c));
          mood[c.k] = R.clamp(mood[c.k] + (frac >= 1 ? 6 : -(1 - frac) * 38), 0, 100); worst = Math.min(worst, mood[c.k]);
        });
        reservoir = Math.min(80, avail() - used());
        const total = C.reduce((a, c) => a + mood[c.k], 0);
        if (worst <= 0) { refresh(); return ctx.end(day * 20 + total / 4, false, T("водный кризис", "water crisis")); }
        day++;
        if (day > DAYS) return ctx.end(DAYS * 20 + total + reservoir, true, T("город пережил засуху", "the city survived the drought"));
        newDay(); refresh();
      }
      newDay(); refresh();
    }
  });

  /* ============ 5. POWER GRID ============ */
  reg({
    id: "power", group: 0, name: ["Power Grid", "Power Grid"],
    desc: ["Построй энергосистему города: солнце, ветер, вода и батареи", "Build the city's power: solar, wind, hydro and batteries"],
    start(ctx) {
      const { h, T, R } = ctx;
      const TICKS = 48;
      const S = { solar: { img: "power/solar", n: T("Солнечная панель", "Solar panel"), c: 30, d: T("днём, когда светит солнце", "by day, when the sun shines"), cnt: 0 }, wind: { img: "power/wind", n: T("Ветряк", "Wind turbine"), c: 28, d: T("когда дует ветер", "when the wind blows"), cnt: 0 }, hydro: { img: "power/hydro", n: T("ГЭС", "Hydro plant"), c: 70, d: T("всегда, максимум 2", "always, max 2"), cnt: 0, max: 2 }, gas: { img: "power/gas", n: T("Газовая станция", "Gas plant"), c: 25, d: T("всегда, но загрязняет", "always, but pollutes"), cnt: 0 }, bat: { img: "power/battery", n: T("Батарея", "Battery"), c: 40, d: T("копит энергию", "stores energy"), cnt: 0 } };
      let t = 0, money = FON.board() ? 140 : 100, black = 0, pollution = 0, wind = 1, charge = 0, served = 0, needSum = 0, supply = 0, demand = 0;
      const MAXB = FON.board() ? 18 : 12, hist = [];
      const hud = ctx.hud([{ k: "h", label: T("Час", "Hour"), val: "00:00" }, { k: "m", label: T("Деньги", "Money"), val: money }, { k: "b", label: T("Блэкауты", "Blackouts"), val: "0/" + MAXB }, { k: "p", label: T("Загрязнение", "Pollution"), val: 0 }]);
      const dM = ctx.meter(T("Спрос", "Demand"), "sun"), sM = ctx.meter(T("Выработка", "Supply")), cM = ctx.meter(T("Батареи", "Batteries"), "sky");
      const cvs = ctx.canvas(640, 150), g = cvs.g;
      const log = h("div", { class: "log" }, "");
      const built = h("div", { class: "builtrow" });
      const opts = h("div", { class: "opts" });
      const btn = {};
      Object.keys(S).forEach(k => { const b = h("button", { class: "opt pico", type: "button", onclick: () => build(k) }); btn[k] = b; opts.append(b); });
      ctx.el.append(h("div", { style: { maxWidth: "520px" } }, dM.row, sM.row, cM.row), cvs.cv, built, opts, log);
      const sun = hr => (hr >= 6 && hr <= 18) ? Math.sin(Math.PI * (hr - 6) / 12) : 0;
      const dem = (hr, tk) => (28 + 24 * (hr >= 17 && hr <= 22 ? 1 : hr >= 7 && hr <= 9 ? 0.6 : hr >= 10 && hr <= 16 ? 0.45 : hr < 5 ? 0 : 0.25)) * (1 + tk / TICKS * 0.5);
      function build(k) { const s = S[k]; if (money < s.c || (s.max && s.cnt >= s.max)) return; money -= s.c; s.cnt++; ui(); }
      function ui() {
        Object.keys(S).forEach(k => { const s = S[k]; btn[k].innerHTML = ""; btn[k].append(FON.pic(s.img, { label: s.n }), h("span", null, s.n + " — " + s.c, h("small", null, s.d + " · " + T("построено: ", "built: ") + s.cnt))); btn[k].disabled = money < s.c || (s.max && s.cnt >= s.max); });
        built.innerHTML = ""; Object.keys(S).forEach(k => { for (let i = 0; i < Math.min(S[k].cnt, 12); i++) built.append(FON.pic(S[k].img, { label: S[k].n })); });
        hud.set("m", Math.round(money));
      }
      function draw() {
        g.clearRect(0, 0, 640, 150); g.fillStyle = "#f1fff6"; g.fillRect(0, 0, 640, 150);
        const mx = 140, line = (key, col) => { g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); hist.forEach((p, i) => { const x = 10 + i * (620 / TICKS), y = 140 - p[key] / mx * 130; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); };
        line("d", "#e6a800"); line("s", "#0b8f43");
        g.fillStyle = "#0a2a1a"; g.font = "800 11px Montserrat,sans-serif"; g.fillText(T("жёлтая — сколько нужно, зелёная — сколько есть", "yellow — needed, green — available"), 10, 14);
      }
      function tick() {
        const hr = t % 24; wind = R.clamp(wind + R.rnd(-0.25, 0.25), 0.1, 1.6);
        demand = dem(hr, t);
        supply = S.solar.cnt * 9 * sun(hr) + S.wind.cnt * 7 * wind + S.hydro.cnt * 14 + S.gas.cnt * 16;
        pollution += S.gas.cnt * 1.6; const cap = S.bat.cnt * 25;
        let out = supply;
        if (out < demand) { const use = Math.min(charge, demand - out, S.bat.cnt * 10); charge -= use; out += use; } else { const add = Math.min(out - demand, cap - charge, S.bat.cnt * 10); charge += add; }
        if (charge > cap) charge = cap;
        needSum += demand; served += Math.min(out, demand);
        if (out < demand * 0.97) { black++; log.textContent = T("Блэкаут! Не хватает энергии.", "Blackout! Not enough power."); } else log.textContent = "";
        hist.push({ d: demand, s: out }); t++; money += 12;
        hud.set("h", String(t % 24).padStart(2, "0") + ":00"); hud.set("b", black + "/" + MAXB); hud.set("p", Math.round(pollution));
        dM.set(demand, 120); sM.set(out, 120); cM.set(charge, Math.max(1, cap)); ui(); draw();
        const sc = () => Math.round(Math.max(0, served / Math.max(1, needSum) * 1000 - pollution * 2));
        if (black >= MAXB) ctx.end(sc(), false, T("сеть рухнула", "the grid collapsed"));
        else if (t >= TICKS) ctx.end(sc(), black < MAXB / 2, Math.round(served / needSum * 100) + "% " + T("спроса закрыто", "of demand met"));
      }
      ui(); ctx.every(tick, FON.board() ? 1800 : 1200);
    }
  });
})();
