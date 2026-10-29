/* Группа 2: Дикая природа */
(function () {
  const reg = FON.register;
  const paint = FON.paint;

  /* ============ 6. FOREST GUARDIAN ============ */
  reg({
    id: "forest", group: 1, name: ["Forest Guardian", "Forest Guardian"],
    desc: ["Сажай деревья, береги животных и тушите пожары", "Plant trees, protect animals and fight fires"],
    start(ctx) {
      const { h, T, R } = ctx; const W = 10, H = 7, TURNS = 20;
      const tiles = Array.from({ length: W * H }, () => ({ s: Math.random() < 0.35 ? "t" : "g", an: false, sh: 0, age: 0 }));
      const idx = (x, y) => y * W + x, nb = i => { const x = i % W, y = i / W | 0, r = []; if (x > 0) r.push(i - 1); if (x < W - 1) r.push(i + 1); if (y > 0) r.push(i - W); if (y < H - 1) r.push(i + W); return r; };
      R.shuffle(tiles.map((t, i) => i).filter(i => tiles[i].s === "t")).slice(0, 3).forEach(i => tiles[i].an = true);
      let turn = 1, ap = 3, tool = "plant", lost = 0;
      const hud = ctx.hud([{ k: "t", label: T("Ход", "Turn"), val: "1/" + TURNS }, { k: "a", label: T("Действия", "Actions"), val: 3 }, { k: "tr", label: T("Деревья", "Trees"), val: 0 }, { k: "an", label: T("Животные", "Animals"), val: 0 }]);
      const log = h("div", { class: "log" });
      const grid = FON.grid(ctx, W, H, (x, y) => act(idx(x, y)), 680);
      const toolBtns = {};
      const tb = h("div", { class: "opts", style: { gridTemplateColumns: "repeat(3,1fr)" } }, [["plant", T("Посадить дерево", "Plant a tree"), T("на траве или гари", "on grass or ash"), "forest/sapling"], ["water", T("Тушить огонь", "Put out fire"), T("на горящей клетке", "on a burning tile"), "forest/bucket"], ["shield", T("Защитить дерево", "Protect a tree"), T("2 хода без огня", "2 turns fire-proof"), "forest/shield"]].map(a => { const b = h("button", { class: "opt pico", type: "button", onclick: () => { tool = a[0]; refresh(); } }, FON.pic(a[3], { label: a[1] }), h("span", null, a[1], h("small", null, a[2]))); toolBtns[a[0]] = b; return b; }));
      const endB = h("button", { class: "btn sun", type: "button", onclick: endTurn }, T("Закончить ход", "End turn"));
      ctx.el.append(grid.box, tb, h("div", { class: "btnrow" }, endB), log);
      function counts() { let tr = 0, an = 0; tiles.forEach(t => { if (t.s === "t") tr++; if (t.an) an++; }); return [tr, an]; }
      function refresh() {
        tiles.forEach((t, i) => {
          const o = { bg: t.s === "t" ? "#c8f2b0" : t.s === "f" ? "#ffd9a8" : t.s === "b" ? "#d6d6d6" : "#eefbe0" };
          if (t.s === "t") o.pic = "forest/tree"; if (t.s === "f") o.pic = "forest/fire"; if (t.s === "b") o.pic = "forest/burnt";
          if (t.an) o.badge = "nature/deer"; if (t.sh > 0) o.ring = "#1d8fe0"; paint(grid.cells[i], o);
        });
        Object.keys(toolBtns).forEach(k => toolBtns[k].classList.toggle("on", k === tool));
        const [tr, an] = counts(); hud.set("t", turn + "/" + TURNS); hud.set("a", ap); hud.set("tr", tr); hud.set("an", an);
      }
      function act(i) {
        if (ap <= 0) { log.textContent = T("Действия кончились. Закончи ход.", "No actions left. End the turn."); return; }
        const t = tiles[i];
        if (tool === "plant" && (t.s === "g" || t.s === "b")) t.s = "t";
        else if (tool === "water" && t.s === "f") t.s = t.age < 1 ? "t" : "b";
        else if (tool === "shield" && t.s === "t") t.sh = 2;
        else { log.textContent = T("Это действие тут не работает.", "That action doesn't work here."); return; }
        log.textContent = ""; ap--; refresh();
      }
      function ignite(i) {
        const t = tiles[i]; t.s = "f"; t.age = 0;
        if (t.an) { t.an = false; const dest = R.shuffle(nb(i)).find(j => tiles[j].s === "t" && !tiles[j].an); if (dest != null) tiles[dest].an = true; else lost++; }
      }
      function endTurn() {
        const burning = tiles.map((t, i) => t.s === "f" ? i : -1).filter(i => i >= 0);
        const fresh = [];
        burning.forEach(i => { nb(i).forEach(j => { if (tiles[j].s === "t" && tiles[j].sh === 0 && Math.random() < 0.55) fresh.push(j); }); tiles[i].s = "b"; tiles[i].an = false; });
        fresh.forEach(j => { if (tiles[j].s === "t") ignite(j); });
        if (Math.random() < 0.3 + turn * 0.012) { const c = R.shuffle(tiles.map((t, i) => i).filter(i => tiles[i].s === "t" && tiles[i].sh === 0))[0]; if (c != null) { ignite(c); log.textContent = T("Загорелось дерево!", "A tree caught fire!"); } }
        tiles.forEach(t => { if (t.sh > 0) t.sh--; if (t.s === "f") t.age++; });
        const [tr, an] = counts();
        tiles.forEach((t, i) => { if (t.s === "t" && !t.an && an < tr / 4 && nb(i).filter(j => tiles[j].s === "t").length >= 2 && Math.random() < 0.07) t.an = true; });
        turn++; ap = 3;
        if (turn > TURNS) { const [a, b] = counts(); return ctx.end(a * 3 + b * 15, a > 15 && b > 0, a + " " + T("деревьев", "trees") + ", " + b + " " + T("животных", "animals")); }
        refresh();
      }
      refresh();
    }
  });

  /* ============ 7. WILDLIFE RESCUE ============ */
  reg({
    id: "rescue", group: 1, name: ["Wildlife Rescue", "Wildlife Rescue"],
    desc: ["Исследуй карту, находи животных и выбирай правильную помощь", "Explore the map, find animals and pick the right help"],
    start(ctx) {
      const { h, T, R } = ctx; const W = 9, H = 9, ENERGY = 30;
      const CASES = [
        [T("Лиса", "Fox"), T("попала лапой в петлю.", "has a paw caught in a snare."), [T("Осторожно снять петлю и позвать ветеринара", "Carefully remove the snare and call a vet"), T("Сильно дёрнуть за лапу", "Pull hard on the paw"), T("Оставить как есть", "Leave it as it is"), T("Накормить шоколадом", "Feed it chocolate")]],
        [T("Совёнок", "Owlet"), T("выпал из гнезда.", "fell out of its nest."), [T("Вернуть в гнездо, если оно рядом", "Put it back in the nest if it's near"), T("Забрать домой", "Take it home"), T("Дать молока", "Give it milk"), T("Отнести к реке", "Carry it to the river")]],
        [T("Чайка", "Seagull"), T("вся в нефти.", "is covered in oil."), [T("Отдать в центр реабилитации птиц", "Hand over to a bird rehab centre"), T("Вытереть бумагой", "Wipe with paper"), T("Облить холодной водой", "Splash cold water"), T("Отпустить", "Just let it go")]],
        [T("Ёж", "Hedgehog"), T("худой и замёрзший.", "is thin and cold."), [T("Коробка, вода и влажный корм для кошек", "A box, water and wet cat food"), T("Хлеб с молоком", "Bread and milk"), T("Положить на дорогу", "Put it on the road"), T("Искупать", "Give it a bath")]],
        [T("Олень", "Deer"), T("запутался в проволоке забора.", "is tangled in fence wire."), [T("Позвать егеря, самому не лезть близко", "Call a ranger and keep your distance"), T("Дёргать за рога", "Pull its antlers"), T("Громко кричать", "Shout loudly"), T("Подождать неделю", "Wait a week")]],
        [T("Черепаха", "Turtle"), T("ползёт по дороге.", "is crossing a road."), [T("Перенести в ту же сторону, куда ползла", "Carry it the way it was heading"), T("Вернуть откуда пришла", "Put it back where it came from"), T("Забрать домой", "Take it home"), T("Не трогать, пусть едут", "Leave it for the cars")]],
        [T("Крольчонок", "Baby rabbit"), T("один в траве.", "is alone in the grass."), [T("Не трогать: мама вернётся", "Leave it: the mother will return"), T("Забрать и кормить", "Take it and feed it"), T("Унести далеко", "Carry it far away"), T("Гладить", "Pet it")]],
        [T("Летучая мышь", "Bat"), T("залетела в дом.", "flew into a house."), [T("Открыть окно и выключить свет", "Open a window and turn the light off"), T("Ловить голыми руками", "Catch it with bare hands"), T("Прогнать шваброй", "Chase it with a broom"), T("Запереть в шкафу", "Lock it in a closet")]]];
      const KEYS = ["fox", "owl", "seagull", "hedgehog", "deer", "turtle", "rabbit", "bat"];
      const HK = [["vet", "pull", "leave", "feed"], ["nest", "home", "feed", "carry"], ["vet", "pull", "shout", "leave"], ["box", "feed", "shout", "pull"], ["vet", "pull", "shout", "leave"], ["carry", "pull", "home", "leave"], ["leave", "home", "carry", "feed"], ["window", "pull", "shout", "home"]];
      const picks = R.shuffle(CASES).slice(0, 6);
      const animals = new Map(); const cells = Array.from({ length: W * H }, (_, i) => i);
      R.shuffle(cells).slice(0, 6).forEach((c, k) => animals.set(c, picks[k]));
      let energy = ENERGY, found = 0, rescued = 0, score = 0, mist = 0, open = new Set(), busy = null;
      const hud = ctx.hud([{ k: "e", label: T("Энергия", "Energy"), val: ENERGY }, { k: "f", label: T("Спасено", "Rescued"), val: "0/6" }, { k: "s", label: T("Очки", "Score"), val: 0 }]);
      const grid = FON.grid(ctx, W, H, (x, y) => click(y * W + x), 560);
      const panel = h("div", { class: "card", style: { marginTop: "12px", display: "none" } });
      const log = h("div", { class: "log" }, T("Нажми на клетку, чтобы обыскать её. Число показывает, сколько животных рядом.", "Tap a tile to search it. The number tells how many animals are nearby."));
      ctx.el.append(grid.box, panel, log);
      const near = i => { let n = 0; const x = i % W, y = i / W | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < W && yy >= 0 && yy < H && animals.has(yy * W + xx)) n++; } return n; };
      function refresh() {
        grid.cells.forEach((b, i) => {
          if (!open.has(i)) paint(b, { bg: "#a7d99b", txt: "" });
          else if (animals.has(i)) paint(b, { bg: "#ffd23f", pic: "nature/" + KEYS[CASES.indexOf(animals.get(i))] });
          else paint(b, { bg: "#eafbe0", txt: near(i) || "" });
        });
        hud.set("e", energy); hud.set("f", rescued + "/6"); hud.set("s", score);
      }
      function check() { if (rescued === 6) ctx.end(score + energy * 5, true, T("все животные спасены", "all animals rescued")); else if (energy <= 0 && !busy) ctx.end(score, rescued >= 4, rescued + "/6"); }
      function click(i) {
        if (busy || open.has(i) || energy <= 0) return;
        open.add(i); energy--; log.textContent = "";
        if (animals.has(i)) { busy = i; showCase(i); }
        refresh(); check();
      }
      function showCase(i) {
        const c = animals.get(i), right = c[2][0], ci = CASES.indexOf(c);
        panel.style.display = ""; panel.innerHTML = "";
        panel.append(h("div", { style: { display: "flex", alignItems: "center", gap: "12px" } }, h("span", { style: { width: FON.board() ? "110px" : "72px", height: FON.board() ? "110px" : "72px", flex: "none" } }, FON.pic("nature/" + KEYS[ci], { label: c[0] })), h("h2", { style: { fontSize: "20px" } }, c[0] + " " + c[1])), h("p", { class: "sub", style: { margin: "0 0 4px" } }, T("Что делаем?", "What do we do?")),
          h("div", { class: "opts", style: { gridTemplateColumns: "1fr 1fr" } }, R.shuffle(c[2].map((t, k) => [t, k])).map(([o, k]) => {
            const b = h("button", { class: "opt vert", type: "button", onclick: () => {
              if (o === right) { rescued++; score += 100; busy = null; panel.style.display = "none"; log.textContent = T("Спасено!", "Rescued!"); refresh(); check(); }
              else { b.disabled = true; energy -= 2; mist++; score = Math.max(0, score - 20); log.textContent = T("Не помогло. Животному хуже, потеряно 2 энергии.", "That didn't help. Lost 2 energy."); refresh(); if (energy <= 0) { busy = null; check(); } }
            } }, FON.pic("help/" + HK[ci][k], { label: o }), o); return b;
          })));
      }
      refresh();
    }
  });

  /* ============ 8. FIREWATCH ============ */
  reg({
    id: "firewatch", group: 1, name: ["Firewatch", "Firewatch"],
    desc: ["Ты диспетчер: ставь пожарные команды с учётом ветра и рельефа", "You're the dispatcher: place crews using wind and terrain"],
    start(ctx) {
      const { h, T, R } = ctx; const W = 12, H = 8, TICKS = 70;
      const T_ = { grass: { bg: "#d9f5a5", f: 0.5, e: 1 }, forest: { bg: "#2fbf6a", f: 0.42, e: 1 }, hill: { bg: "#a98f5f", f: 0.36, e: 2 }, water: { bg: "#7fd1ff", f: 0, e: 0 }, rock: { bg: "#b9b9b9", f: 0, e: 0 }, village: { bg: "#ffd23f", f: 0.6, e: 1 } };
      const map = Array.from({ length: W * H }, () => { const r = Math.random(); return r < 0.08 ? "water" : r < 0.15 ? "rock" : r < 0.33 ? "hill" : r < 0.72 ? "forest" : "grass"; });
      R.shuffle(map.map((m, i) => i).filter(i => T_[map[i]].f > 0)).slice(0, 3).forEach(i => map[i] = "village");
      const st = map.map(() => ({ fire: 0, burnt: false, wet: 0 }));
      const flam = map.map((m, i) => T_[m].f > 0 ? i : -1).filter(i => i >= 0);
      const WINDS = [[1, 0, T("на восток", "east"), "→"], [-1, 0, T("на запад", "west"), "←"], [0, -1, T("на север", "north"), "↑"], [0, 1, T("на юг", "south"), "↓"]];
      let wind = R.pick(WINDS), tick = 0, crews = [0, 0, 0];
      const hud = ctx.hud([{ k: "t", label: T("Время", "Time"), val: TICKS }, { k: "w", label: T("Ветер", "Wind"), val: "" }, { k: "c", label: T("Команды", "Crews"), val: "" }, { k: "s", label: T("Сохранено", "Saved"), val: "100%" }]);
      const grid = FON.grid(ctx, W, H, (x, y) => dispatch(y * W + x), 720);
      const log = h("div", { class: "log" }, T("Нажми на клетку: команда потушит огонь рядом и намочит землю. Огонь идёт по ветру и вверх по склону.", "Tap a tile: a crew puts out nearby fire and wets the ground. Fire runs downwind and uphill."));
      ctx.el.append(grid.box, log);
      const nb4 = i => { const x = i % W, y = i / W | 0, r = []; if (x > 0) r.push(i - 1); if (x < W - 1) r.push(i + 1); if (y > 0) r.push(i - W); if (y < H - 1) r.push(i + W); return r; };
      const around = i => { const x = i % W, y = i / W | 0, r = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < W && yy >= 0 && yy < H) r.push(yy * W + xx); } return r; };
      const setFire = i => { if (!st[i].burnt && !st[i].fire && !st[i].wet && T_[map[i]].f > 0) st[i].fire = 2; };
      setFire(flam[R.ri(flam.length)]); setFire(flam[R.ri(flam.length)]);
      function dispatch(i) {
        const c = crews.findIndex(v => v <= 0); if (c < 0) { log.textContent = T("Все команды заняты.", "All crews are busy."); return; }
        crews[c] = 5; around(i).forEach(j => { st[j].fire = 0; if (!st[j].burnt) st[j].wet = 7; }); log.textContent = ""; draw();
      }
      function saved() { return flam.filter(i => !st[i].burnt && !(st[i].fire > 0)).length / flam.length; }
      function draw() {
        map.forEach((m, i) => {
          const s = st[i], o = { bg: s.burnt ? "#d6d6d6" : T_[m].bg };
          if (s.fire) { o.bg = "#ffd9a8"; o.pic = "forest/fire"; } else if (s.burnt) { o.pic = "forest/burnt"; }
          else { if (s.wet) o.ring = "#1d8fe0"; if (m === "village") o.pic = "fw/house"; else if (m === "hill") o.pic = "fw/hill"; else if (m === "forest") o.pic = "forest/tree"; }
          paint(grid.cells[i], o);
        });
        hud.set("t", TICKS - tick); hud.set("w", wind[3] + " " + wind[2]); hud.set("c", h("span", { class: "crews" }, crews.map(v => { const p = FON.pic("fw/truck", { size: 30 }); if (v > 0) p.classList.add("busy"); return p; }))); hud.set("s", Math.round(saved() * 100) + "%");
      }
      function step() {
        tick++;
        if (tick % 14 === 0) { wind = R.pick(WINDS.filter(w => w !== wind)); log.textContent = T("Ветер сменился!", "The wind has changed!"); }
        crews = crews.map(v => v - 1);
        const next = [];
        st.forEach((s, i) => {
          if (s.wet > 0) s.wet--;
          if (s.fire > 0) {
            nb4(i).forEach(j => {
              const sj = st[j]; if (sj.burnt || sj.fire || sj.wet || T_[map[j]].f === 0) return;
              const dx = (j % W) - (i % W), dy = (j / W | 0) - (i / W | 0), dot = dx * wind[0] + dy * wind[1];
              let p = T_[map[j]].f * Math.max(0.12, 1 + 1.2 * dot) * (T_[map[j]].e > T_[map[i]].e ? 1.5 : 1);
              if (Math.random() < Math.min(0.92, p)) next.push(j);
            });
            s.fire--; if (s.fire <= 0) s.burnt = true;
          }
        });
        next.forEach(setFire);
        if (tick % 11 === 0) setFire(flam[R.ri(flam.length)]);
        draw();
        const sv = saved(), vill = map.filter((m, i) => m === "village" && !st[i].burnt).length;
        if (tick >= TICKS) return ctx.end(Math.round(sv * 1000) + vill * 150, sv > 0.6, Math.round(sv * 100) + "% " + T("леса цело", "of land saved"));
      }
      draw(); ctx.every(step, 1100);
    }
  });

  /* ============ 9. BEE EMPIRE ============ */
  reg({
    id: "bee", group: 1, name: ["Bee Empire", "Bee Empire"],
    desc: ["Развивай улей и верни цветы на заброшенные поля", "Grow your hive and bring flowers back to barren fields"],
    start(ctx) {
      const { h, T, R } = ctx; const COLS = 5, ROWS = 4, N = COLS * ROWS, LIMIT = 300;
      let nectar = 20, bees = 1, level = 1, time = 0, plots = Array.from({ length: N }, () => ({ s: 0, t: 0 })), msg = "";
      const hud = ctx.hud([{ k: "n", label: T("Нектар", "Nectar"), val: 20 }, { k: "b", label: T("Пчёлы", "Bees"), val: "1/10" }, { k: "r", label: T("В секунду", "Per second"), val: 0 }, { k: "f", label: T("Цветы", "Flowers"), val: "0/" + N }, { k: "t", label: T("Время", "Time"), val: 0 }]);
      const cap = () => 5 + level * 5, bloomN = () => plots.filter(p => p.s === 2).length, rate = () => +(bees * 0.35 * (1 + bloomN() * 0.18)).toFixed(1);
      const plantCost = () => 12, hireCost = () => 10 + bees * 4, upCost = () => 60 * level;
      const grid = FON.grid(ctx, COLS, ROWS, (x, y) => plant(y * COLS + x), 420);
      const forage = h("button", { class: "btn", type: "button", onclick: () => { nectar += 1 + bloomN() * 0.3; refresh(); } }, FON.pic("bee/honey", { size: 30, label: "" }), T("Собрать нектар", "Forage nectar"));
      const hireB = h("button", { class: "opt pico", type: "button", onclick: hire }), upB = h("button", { class: "opt pico", type: "button", onclick: upgrade }), log = h("div", { class: "log" });
      ctx.el.append(h("p", { class: "sub", style: { margin: "0 0 10px" } }, T("Нажми на пустую клетку, чтобы посеять цветы. Чем больше цветов, тем больше нектара приносит каждая пчела.", "Tap a barren plot to sow flowers. The more flowers, the more nectar each bee brings.")), grid.box, h("div", { class: "btnrow" }, forage), h("div", { class: "opts" }, hireB, upB), log);
      function plant(i) { const p = plots[i]; if (p.s !== 0) return; if (nectar < plantCost()) { log.textContent = T("Не хватает нектара.", "Not enough nectar."); return; } nectar -= plantCost(); p.s = 1; p.t = 8; log.textContent = ""; refresh(); }
      function hire() { if (bees >= cap() || nectar < hireCost()) return; nectar -= hireCost(); bees++; refresh(); }
      function upgrade() { if (nectar < upCost()) return; nectar -= upCost(); level++; refresh(); }
      function refresh() {
        plots.forEach((p, i) => paint(grid.cells[i], p.s === 0 ? { bg: "#e9d3b4", txt: "+" } : p.s === 1 ? { bg: "#d9f6c2", pic: "bee/sprout", txt: p.t } : { bg: "#ffe3f1", pic: "bee/flower" }));
        hireB.innerHTML = ""; hireB.append(FON.pic("bee/bee", { label: T("Пчела", "Bee") }), h("span", null, T("Нанять пчелу — ", "Hire a bee — ") + hireCost(), h("small", null, T("Вместимость улья: ", "Hive capacity: ") + bees + "/" + cap()))); hireB.disabled = bees >= cap() || nectar < hireCost();
        upB.innerHTML = ""; upB.append(FON.pic("bee/hive", { label: T("Улей", "Hive") }), h("span", null, T("Улучшить улей — ", "Upgrade hive — ") + upCost(), h("small", null, T("+5 к вместимости", "+5 capacity")))); upB.disabled = nectar < upCost();
        hud.set("n", Math.floor(nectar)); hud.set("b", bees + "/" + cap()); hud.set("r", rate()); hud.set("f", bloomN() + "/" + N); hud.set("t", Math.floor(time));
      }
      ctx.every(() => {
        time++; nectar += rate();
        plots.forEach(p => { if (p.s === 1 && --p.t <= 0) p.s = 2; });
        if (time % 25 === 0) { const b = plots.map((p, i) => p.s === 2 ? i : -1).filter(i => i >= 0); if (b.length > 2) { plots[R.pick(b)].s = 0; log.textContent = T("Пестицид с соседнего поля: цветы засохли.", "Pesticide drift: a flower plot withered."); } }
        refresh();
        if (bloomN() === N) ctx.end(Math.max(200, 2000 - time * 6) + bees * 10, true, T("все цветы вернулись", "all flowers are back"));
        else if (time >= LIMIT) ctx.end(bloomN() * 50 + bees * 5, false);
      }, 1000);
      refresh();
    }
  });

  /* ============ 10. SURVIVAL: WILD ============ */
  reg({
    id: "survival", group: 1, name: ["Survival: Wild", "Survival: Wild"],
    desc: ["Дикое животное, один сезон: еда, вода и хищники", "A wild animal, one season: food, water and predators"],
    start(ctx) {
      const { h, T, R } = ctx; const W = 13, H = 9, TURNS = 60;
      const SP = [{ k: "rabbit", n: T("Кролик", "Rabbit"), hu: 1, th: 1, pr: 0.8, d: T("Лёгкий, но хищники быстрые", "Light, but predators are quick") }, { k: "deer", n: T("Олень", "Deer"), hu: 1.4, th: 1.3, pr: 0.5, d: T("Быстро бегает, но голоден и хочет пить", "Fast runner, but hungry and thirsty") }, { k: "fox", n: T("Лиса", "Fox"), hu: 1.1, th: 1.0, pr: 0.7, d: T("Универсальная", "All-rounder") }];
      const pick = h("div", { class: "opts", style: { gridTemplateColumns: "repeat(3,1fr)" } }, SP.map(s => h("button", { class: "opt vert", type: "button", onclick: () => run(s) }, FON.pic("nature/" + s.k, { label: s.n }), s.n, h("small", null, s.d))));
      ctx.el.append(h("h2", { style: { fontSize: "20px" } }, T("Кем ты будешь?", "Who will you be?")), pick);
      function run(sp) {
        ctx.el.innerHTML = "";
        const map = Array.from({ length: W * H }, () => Math.random() < 0.12 ? "tree" : Math.random() < 0.05 ? "rock" : "ground");
        const cx = R.ri(W - 6) + 3, cy = R.ri(H - 4) + 2;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) map[(cy + dy) * W + cx + dx] = "water";
        const free = () => { let i; do { i = R.ri(W * H); } while (map[i] !== "ground"); return i; };
        const berries = new Set(); for (let k = 0; k < 9; k++) berries.add(free());
        const dens = [free(), free()]; dens.forEach(i => map[i] = "den");
        let p = free(), preds = [free(), free()], food = 80, water = 80, turn = 0, regrow = [];
        while (Math.abs((p % W) - (preds[0] % W)) + Math.abs((p / W | 0) - (preds[0] / W | 0)) < 5) preds[0] = free();
        const season = () => turn < 15 ? T("Лето", "Summer") : turn < 30 ? T("Осень", "Autumn") : turn < 45 ? T("Зима", "Winter") : T("Весна", "Spring");
        const hud = ctx.hud([{ k: "t", label: T("День", "Day"), val: "0/" + TURNS }, { k: "s", label: T("Сезон", "Season"), val: "" }]);
        const fM = ctx.meter(T("Еда", "Food"), "sun"), wM = ctx.meter(T("Вода", "Water"), "sky");
        const grid = FON.grid(ctx, W, H, (x, y) => stepTo(x, y), 700);
        const log = h("div", { class: "log" }, T("Ходи стрелками/WASD или нажимай на клетку. Красные точки — хищники, коричневые клетки — норы (там безопасно). Красные кружки на траве — ягоды.", "Move with arrows/WASD or tap a tile. Red dots are predators, brown tiles are dens (safe). Red circles are berries."));
        ctx.el.append(h("div", { style: { maxWidth: "420px" } }, fM.row, wM.row), grid.box, log);
        const X = i => i % W, Y = i => i / W | 0, dist = (a, b) => Math.abs(X(a) - X(b)) + Math.abs(Y(a) - Y(b));
        const ok = i => i >= 0 && map[i] !== "tree" && map[i] !== "rock";
        function draw() {
          map.forEach((m, i) => {
            const o = { bg: m === "tree" ? "#c8f2b0" : m === "rock" ? "#e6e6e6" : m === "water" ? "#7fd1ff" : m === "den" ? "#e8cfa8" : "#eefbe0" };
            if (m === "tree") o.pic = "forest/tree"; else if (m === "rock") o.pic = "surv/rock"; else if (m === "den") o.pic = "surv/den";
            if (berries.has(i)) o.pic = "surv/berries"; if (preds.includes(i)) o.pic = "nature/wolf";
            if (i === p) { if (preds.includes(i)) o.badge = "nature/wolf"; o.pic = "nature/" + sp.k; o.ring = "#ffd23f"; }
            paint(grid.cells[i], o);
          });
          fM.set(food); wM.set(water); hud.set("t", turn + "/" + TURNS); hud.set("s", season());
        }
        function stepTo(x, y) {
          let dx = x - X(p), dy = y - Y(p); if (!dx && !dy) { dx = 0; dy = 0; }
          if (Math.abs(dx) >= Math.abs(dy)) { dx = Math.sign(dx); dy = 0; } else { dy = Math.sign(dy); dx = 0; }
          move(dx, dy);
        }
        function move(dx, dy) {
          if (ctx.over) return;
          const nx = X(p) + dx, ny = Y(p) + dy; if (nx < 0 || nx >= W || ny < 0 || ny >= H) return; const ni = ny * W + nx; if (!ok(ni) && (dx || dy)) return;
          p = ni; turn++; const winter = turn >= 30 && turn < 45;
          food -= 1.1 * sp.hu * (winter ? 1.3 : 1); water -= 1.1 * sp.th;
          if (berries.has(p)) { berries.delete(p); food = Math.min(100, food + 32); regrow.push(turn + (winter ? 18 : 8)); }
          if (map[p] === "water") water = Math.min(100, water + 40);
          regrow = regrow.filter(t => { if (turn >= t) { berries.add(free()); return false; } return true; });
          if (map[p] === "water") { /* пьёт стоя в воде; вода не блокирует */ }
          const np = winter ? 3 : 2; while (preds.length < np) preds.push(free());
          preds = preds.map(q => {
            if (Math.random() > sp.pr) return q; let best = q;
            const chase = dist(q, p) <= 6 && map[p] !== "den";
            const opts = [q - 1, q + 1, q - W, q + W].filter(j => j >= 0 && j < W * H && ok(j) && Math.abs(X(j) - X(q)) <= 1);
            if (!opts.length) return q;
            if (chase) { opts.sort((a, b) => dist(a, p) - dist(b, p)); best = opts[0]; } else best = R.pick(opts); return best;
          });
          draw();
          if (preds.includes(p) && map[p] !== "den") return ctx.end(turn * 8, false, T("тебя поймал хищник", "a predator caught you"));
          if (food <= 0) return ctx.end(turn * 8, false, T("умер от голода", "starved"));
          if (water <= 0) return ctx.end(turn * 8, false, T("умер от жажды", "died of thirst"));
          if (turn >= TURNS) return ctx.end(600 + Math.round(food + water) / 2, true, T("сезон пережит", "season survived"));
        }
        ctx.on(document, "keydown", e => {
          const k = e.key.toLowerCase(), m = { arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0], arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1] }[k];
          if (m) { e.preventDefault(); move(m[0], m[1]); }
        });
        draw();
      }
    }
  });
})();
