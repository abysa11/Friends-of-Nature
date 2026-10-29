/* Группа 3: Планета и города */
(function () {
  const reg = FON.register, paint = FON.paint;

  /* ============ 11. ECO CITY ============ */
  reg({
    id: "city", group: 2, name: ["Eco City", "Eco City"],
    desc: ["Построй экологичный город: деньги, воздух, счастье и природа", "Build a green city: money, air, happiness and nature"],
    start(ctx) {
      const { h, T, R } = ctx; const W = 8, H = 6, MONTHS = 24;
      const B = {
        house: { n: T("Жильё", "Housing"), l: "H", bg: "#ffd23f", c: 25, inc: 3, pol: 1, d: T("+жители, +3 денег", "+residents, +3 money") },
        factory: { n: T("Завод", "Factory"), l: "F", bg: "#b9b9b9", c: 40, inc: 14, pol: 6, d: T("+14 денег, грязный", "+14 money, dirty") },
        park: { n: T("Парк", "Park"), l: "P", bg: "#8df0b5", c: 20, inc: 0, pol: -1, d: T("+счастье, +природа", "+happiness, +nature") },
        solar: { n: T("Солнечная станция", "Solar plant"), l: "S", bg: "#7fd1ff", c: 35, inc: 6, pol: 0, d: T("+6 денег, чисто", "+6 money, clean") },
        recycle: { n: T("Центр переработки", "Recycling hub"), l: "R", bg: "#c4f542", c: 40, inc: 2, pol: -5, d: T("−5 загрязнения", "−5 pollution") },
        forest: { n: T("Лесопосадка", "Tree belt"), l: "T", bg: "#2fbf6a", c: 15, inc: 0, pol: -2, d: T("+природа, фильтрует воздух", "+nature, filters air") }
      };
      const IMG = { house: "city/house", factory: "city/factory", park: "city/park", solar: "city/solar", recycle: "city/recycle", forest: "city/trees" };
      const cells = Array(W * H).fill(null);
      let money = 120, pol = 20, month = 1, sel = "house";
      const hud = ctx.hud([{ k: "m", label: T("Месяц", "Month"), val: "1/" + MONTHS }, { k: "$", label: T("Деньги", "Money"), val: money }, { k: "p", label: T("Жители", "Residents"), val: 0 }]);
      const polM = ctx.meter(T("Загрязнение", "Pollution"), "bad"), hapM = ctx.meter(T("Счастье", "Happiness")), natM = ctx.meter(T("Природа", "Nature"));
      const grid = FON.grid(ctx, W, H, (x, y) => build(y * W + x), 560);
      const log = h("div", { class: "log" });
      const bb = {}, tb = h("div", { class: "opts" }, Object.keys(B).map(k => { const b = h("button", { class: "opt pico", type: "button", onclick: () => { sel = k; draw(); } }, FON.pic(IMG[k], { label: B[k].n }), h("span", null, B[k].n + " — " + B[k].c, h("small", null, B[k].d))); bb[k] = b; return b; }));
      const endB = h("button", { class: "btn sun", type: "button", onclick: endMonth }, T("Закончить месяц", "End month"));
      ctx.el.append(h("div", { style: { maxWidth: "420px" } }, polM.row, hapM.row, natM.row), grid.box, tb, h("div", { class: "btnrow" }, endB), log);
      const cnt = k => cells.filter(c => c === k).length;
      function stats() {
        const hs = cnt("house"), pk = cnt("park"), fo = cnt("forest"), fa = cnt("factory");
        const happy = R.clamp(45 + hs * 1.5 + pk * 5 + fo * 2 - pol * 0.55 - fa * 1.5 - (hs > 0 ? 0 : 20), 0, 100);
        const nature = R.clamp(30 + pk * 5 + fo * 7 - fa * 3 - hs * 0.8, 0, 100);
        return { happy, nature, pop: hs * 10 };
      }
      function draw() {
        cells.forEach((c, i) => paint(grid.cells[i], c ? { bg: "#f1fff6", pic: IMG[c] } : { bg: "#f1fff6", txt: "" }));
        Object.keys(bb).forEach(k => { bb[k].classList.toggle("on", k === sel); bb[k].disabled = money < B[k].c; });
        const s = stats(); polM.set(pol); hapM.set(s.happy); natM.set(s.nature);
        hud.set("m", month + "/" + MONTHS); hud.set("$", Math.round(money)); hud.set("p", s.pop);
      }
      function build(i) {
        if (cells[i]) { money += Math.floor(B[cells[i]].c / 2); cells[i] = null; log.textContent = T("Здание снесено, возвращена половина стоимости.", "Demolished, half the cost refunded."); draw(); return; }
        if (money < B[sel].c) { log.textContent = T("Не хватает денег.", "Not enough money."); return; }
        money -= B[sel].c; cells[i] = sel; log.textContent = ""; draw();
      }
      function endMonth() {
        let inc = 8, p = 0; cells.forEach(c => { if (c) { inc += B[c].inc; p += B[c].pol; } });
        const fo = cnt("forest"), pk = cnt("park"); p -= (fo + pk) * 0.6;
        money += inc; pol = R.clamp(pol + p - 1.5, 0, 100); month++;
        const s = stats();
        if (pol >= 100) return ctx.end(month * 5, false, T("город задохнулся", "the city choked on smog"));
        if (s.happy <= 0) return ctx.end(month * 5, false, T("жители уехали", "residents left"));
        if (s.nature <= 0) return ctx.end(month * 5, false, T("природа исчезла", "nature is gone"));
        if (month > MONTHS) { const sc = s.pop * 2 + s.happy * 3 + s.nature * 3 + (100 - pol) * 3 + money / 2; return ctx.end(sc, pol < 50 && s.happy > 50 && s.nature > 40, T("город процветает", "the city thrives")); }
        log.textContent = T("Доход за месяц: ", "Monthly income: ") + inc; draw();
      }
      draw();
    }
  });

  /* ============ 12. ECOSYSTEM PUZZLE ============ */
  reg({
    id: "puzzle", group: 2, name: ["Ecosystem Puzzle", "Ecosystem Puzzle"],
    desc: ["Соедини цепочки питания, не нарушив баланс", "Link the food chains without breaking the balance"],
    start(ctx) {
      const { h, T } = ctx; const NS = "http://www.w3.org/2000/svg";
      const LV = [
        { t: T("Луг", "Meadow"), n: { sun: [T("Солнце", "Sun"), 0], grass: [T("Трава", "Grass"), 1], hop: [T("Кузнечик", "Grasshopper"), 2], frog: [T("Лягушка", "Frog"), 3], snake: [T("Уж", "Grass snake"), 4], hawk: [T("Ястреб", "Hawk"), 5] }, e: [["sun", "grass"], ["grass", "hop"], ["hop", "frog"], ["frog", "snake"], ["snake", "hawk"]] },
        { t: T("Пруд", "Pond"), n: { sun: [T("Солнце", "Sun"), 0], alg: [T("Водоросли", "Algae"), 1], flea: [T("Дафния", "Water flea"), 2], fish: [T("Плотва", "Roach"), 3], pike: [T("Щука", "Pike"), 4], heron: [T("Цапля", "Heron"), 5], bac: [T("Бактерии", "Bacteria"), 3] }, e: [["sun", "alg"], ["alg", "flea"], ["flea", "fish"], ["fish", "pike"], ["pike", "heron"], ["heron", "bac"], ["bac", "alg"]] },
        { t: T("Лес", "Forest"), n: { sun: [T("Солнце", "Sun"), 0], soil: [T("Почва", "Soil"), 0], oak: [T("Дуб", "Oak"), 1], cat: [T("Гусеница", "Caterpillar"), 2], deer: [T("Олень", "Deer"), 2], bird: [T("Певчая птица", "Songbird"), 3], wolf: [T("Волк", "Wolf"), 3], owl: [T("Сова", "Owl"), 4], fun: [T("Грибы", "Fungi"), 5] }, e: [["sun", "oak"], ["soil", "oak"], ["oak", "cat"], ["oak", "deer"], ["cat", "bird"], ["bird", "owl"], ["deer", "wolf"], ["wolf", "fun"], ["owl", "fun"], ["fun", "soil"]] },
        { t: T("Океан", "Ocean"), n: { sun: [T("Солнце", "Sun"), 0], phy: [T("Фитопланктон", "Phytoplankton"), 1], krill: [T("Криль", "Krill"), 2], sar: [T("Сардина", "Sardine"), 3], whale: [T("Кит", "Whale"), 3], tuna: [T("Тунец", "Tuna"), 4], shark: [T("Акула", "Shark"), 5], bac: [T("Бактерии", "Bacteria"), 6] }, e: [["sun", "phy"], ["phy", "krill"], ["krill", "sar"], ["krill", "whale"], ["sar", "tuna"], ["tuna", "shark"], ["shark", "bac"], ["whale", "bac"], ["bac", "phy"]] }];
      let li = 0, lives = 5, score = 0, sel = null, found = new Set();
      const hud = ctx.hud([{ k: "l", label: T("Уровень", "Level"), val: "1/4" }, { k: "v", label: T("Баланс", "Balance"), val: 5 }, { k: "f", label: T("Связи", "Links"), val: "0" }, { k: "s", label: T("Очки", "Score"), val: 0 }]);
      const log = h("div", { class: "log" }, T("Стрелка идёт от того, кого едят (или кто даёт энергию), к тому, кто ест.", "Arrows go from what is eaten (or gives energy) to what eats it."));
      const holder = h("div"); ctx.el.append(holder, log);
      const NK = { sun: "sun", grass: "grass", hop: "grasshopper", frog: "frog", snake: "snake", hawk: "hawk", alg: "algae", flea: "waterflea", fish: "roach", pike: "pike", heron: "heron", bac: "bacteria", soil: "soil", oak: "oak", cat: "caterpillar", deer: "deer", bird: "songbird", wolf: "wolf", owl: "owl", fun: "fungi", phy: "phytoplankton", krill: "krill", sar: "sardine", whale: "whale", tuna: "tuna", shark: "shark" };
      function level() {
        const L = LV[li], keys = Object.keys(L.n), Wd = 600, Hd = 470, pos = {};
        keys.forEach((k, i) => { const an = -Math.PI / 2 + i * 2 * Math.PI / keys.length; pos[k] = { x: Wd / 2 + Math.cos(an) * 215, y: Hd / 2 + Math.sin(an) * 170 }; });
        const svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 " + Wd + " " + Hd); svg.setAttribute("class", "pz");
        svg.innerHTML = '<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#0b8f43"/></marker></defs>';
        const lines = document.createElementNS(NS, "g"); svg.append(lines);
        const nodes = {};
        keys.forEach(k => {
          const g = document.createElementNS(NS, "g"); g.setAttribute("class", "nd"); g.setAttribute("transform", "translate(" + (pos[k].x - 58) + "," + (pos[k].y - 36) + ")");
          const r = document.createElementNS(NS, "rect"); r.setAttribute("width", 116); r.setAttribute("height", 72); r.setAttribute("rx", 12);
          const t = document.createElementNS(NS, "text"); t.setAttribute("x", 58); t.setAttribute("y", 64); t.setAttribute("text-anchor", "middle"); t.textContent = L.n[k][0];
          const ph = document.createElementNS(NS, "rect"); ph.setAttribute("x", 36); ph.setAttribute("y", 5); ph.setAttribute("width", 44); ph.setAttribute("height", 44); ph.setAttribute("rx", 8); ph.setAttribute("fill", "#e6f6ec");
          const im = document.createElementNS(NS, "image"); im.setAttribute("x", 36); im.setAttribute("y", 5); im.setAttribute("width", 44); im.setAttribute("height", 44);
          if (FON.loadImg) FON.loadImg("nature/" + NK[k]).then(r2 => { if (r2) im.setAttribute("href", r2.src); });
          g.append(r, ph, im, t); g.addEventListener("click", () => pickNode(k, L, pos, lines)); svg.append(g); nodes[k] = g;
        });
        svg._nodes = nodes; holder.innerHTML = ""; holder.append(h("h2", { style: { fontSize: "20px", margin: "0 0 8px" } }, L.t), svg);
        found = new Set(); sel = null; upd();
      }
      function upd() { hud.set("l", (li + 1) + "/" + LV.length); hud.set("v", lives); hud.set("f", found.size + "/" + LV[li].e.length); hud.set("s", score); }
      function pickNode(k, L, pos, lines) {
        const nodes = holder.querySelector("svg")._nodes;
        if (sel === null) { sel = k; nodes[k].classList.add("sel"); return; }
        if (sel === k) { nodes[k].classList.remove("sel"); sel = null; return; }
        const a = sel, b = k; nodes[a].classList.remove("sel"); sel = null;
        const key = a + ">" + b;
        if (found.has(key)) return;
        if (L.e.some(e => e[0] === a && e[1] === b)) {
          found.add(key); score += 20;
          const ln = document.createElementNS(NS, "line"); const dx = pos[b].x - pos[a].x, dy = pos[b].y - pos[a].y, d = Math.hypot(dx, dy) || 1;
          const ux = dx / d, uy = dy / d, ex = v => Math.min(58 / Math.abs(v[0] || 1e-9), 35 / Math.abs(v[1] || 1e-9)) + 4;
          const o = ex([ux, uy]), sx = pos[a].x + ux * o, sy = pos[a].y + uy * o, tx = pos[b].x - ux * (o + 3), ty = pos[b].y - uy * (o + 3);
          ln.setAttribute("x1", sx); ln.setAttribute("y1", sy); ln.setAttribute("x2", tx); ln.setAttribute("y2", ty); ln.setAttribute("stroke", "#0b8f43"); ln.setAttribute("stroke-width", 3.5); ln.setAttribute("marker-end", "url(#ar)"); lines.append(ln);
          log.textContent = T("Верная связь!", "Correct link!"); upd();
          if (found.size === L.e.length) { score += 50 + lives * 10; li++; if (lives < 5) lives++; if (li >= LV.length) return ctx.end(score, true, T("все экосистемы в балансе", "every ecosystem balanced")); log.textContent = T("Экосистема в балансе!", "Ecosystem balanced!"); ctx.after(level, 600); }
        } else { lives--; log.textContent = T("Нет такой связи. Баланс нарушен.", "No such link. Balance disturbed."); upd(); if (lives <= 0) ctx.end(score, false, T("баланс разрушен", "balance destroyed")); }
      }
      level();
    }
  });

  /* ============ 13. NATURE EXPLORER ============ */
  reg({
    id: "explorer", group: 2, name: ["Nature Explorer", "Nature Explorer"],
    desc: ["Исследуй мир, фотографируй редких существ и заполни Nature Book", "Explore the world, photograph rare life and fill your Nature Book"],
    start(ctx) {
      const { h, T, R } = ctx; const W = 30, H = 20, TS = 30, FILM = 22;
      const BIO = { water: "#6fc8ff", forest: "#35b36b", meadow: "#c9f08f", desert: "#f2d98c", mountain: "#a8a39a" };
      const BN = { forest: T("лес", "forest"), meadow: T("луг", "meadow"), desert: T("пустыня", "desert"), mountain: T("горы", "mountains"), shore: T("берег", "shore") };
      const SPEC = [
        ["squirrel", T("Белка", "Red squirrel"), "forest", 1, T("Прячет орехи и тем самым сажает деревья.", "Buries nuts and so plants trees.")], ["owl", T("Сова", "Owl"), "forest", 2, T("Охотится ночью и почти беззвучно летает.", "Hunts at night and flies almost silently.")], ["agaric", T("Мухомор", "Fly agaric"), "forest", 1, T("Дружит с корнями деревьев.", "Partners with tree roots.")], ["lynx", T("Рысь", "Lynx"), "forest", 3, T("Редкая и осторожная лесная кошка.", "A rare and shy forest cat.")],
        ["butterfly", T("Бабочка-монарх", "Monarch butterfly"), "meadow", 1, T("Мигрирует на тысячи километров.", "Migrates thousands of kilometres.")], ["hare", T("Заяц", "Hare"), "meadow", 2, T("Бежит быстрее 60 км/ч.", "Runs faster than 60 km/h.")], ["lily", T("Луговой цветок", "Meadow flower"), "meadow", 1, T("Кормит пчёл и бабочек.", "Feeds bees and butterflies.")],
        ["fennec", T("Фенёк", "Fennec fox"), "desert", 3, T("Огромные уши помогают остывать в жару.", "Huge ears help it cool down.")], ["cactus", T("Цветущий кактус", "Blooming cactus"), "desert", 2, T("Запасает воду в стебле.", "Stores water in its stem.")],
        ["goat", T("Горный козёл", "Mountain goat"), "mountain", 2, T("Ловко ходит по отвесным скалам.", "Climbs sheer cliffs with ease.")], ["leopard", T("Снежный барс", "Snow leopard"), "mountain", 3, T("Очень редкий, живёт высоко в горах.", "Very rare, lives high in the mountains.")], ["kingfisher", T("Зимородок", "Kingfisher"), "shore", 2, T("Ныряет за рыбой с ветки.", "Dives for fish from a branch.")]];
      const a = Math.random() * 6, b = Math.random() * 6, c = Math.random() * 6, d = Math.random() * 6, e2 = Math.random() * 6, f = Math.random() * 6;
      const fE = (x, y) => (Math.sin(x * .21 + a) + Math.sin(y * .27 + b) + Math.sin((x + y) * .13 + c) + Math.sin((x - y) * .17 + d)) / 4;
      const fM = (x, y) => (Math.sin(x * .19 + e2) + Math.sin(y * .23 + f) + Math.sin((x - y) * .15 + a)) / 3;
      const map = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const e = fE(x, y), m = fM(x, y); map.push(e < -0.38 ? "water" : e > 0.42 ? "mountain" : m > 0.12 ? "forest" : m < -0.3 ? "desert" : "meadow"); }
      const land = i => map[i] !== "water", nbs = i => [i - 1, i + 1, i - W, i + W].filter(j => j >= 0 && j < W * H && Math.abs((j % W) - (i % W)) <= 1);
      const landTiles = map.map((m, i) => i).filter(land);
      const ents = SPEC.map(s => {
        let pool = s[2] === "shore" ? landTiles.filter(i => nbs(i).some(j => map[j] === "water")) : landTiles.filter(i => map[i] === s[2]);
        if (!pool.length) pool = landTiles; return { s, i: R.pick(pool), got: false };
      });
      let p = landTiles.reduce((best, i) => (map[i] === "meadow" || map[i] === "forest") && Math.hypot(i % W - W / 2, (i / W | 0) - H / 2) < Math.hypot(best % W - W / 2, (best / W | 0) - H / 2) ? i : best, landTiles[0]);
      const seen = new Set(); let film = FILM, score = 0, moveT = 0, goal = null, shoot = null;
      const hud = ctx.hud([{ k: "f", label: T("Плёнка", "Film"), val: FILM }, { k: "b", label: T("Nature Book", "Nature Book"), val: "0/" + SPEC.length }, { k: "s", label: T("Очки", "Score"), val: 0 }]);
      const cvs = ctx.canvas(W * TS, H * TS), g = cvs.g;
      const panel = h("div", { class: "card", style: { marginTop: "12px" } }), book = h("div", { class: "nbook" });
      const NKEY = { squirrel: "squirrel", owl: "owl", agaric: "fungi", lynx: "lynx", butterfly: "butterfly", hare: "rabbit", lily: "wildflowers", fennec: "fennec", cactus: "cactus", goat: "goat", leopard: "leopard", kingfisher: "kingfisher" };
      if (FON.preload) FON.preload(Object.values(NKEY).map(k => "nature/" + k));
      const log = h("div", { class: "log" }, T("Веди персонажа стрелками/WASD или нажимай на карту. Существа видны только рядом.", "Move with arrows/WASD or tap the map. Creatures are visible only nearby."));
      const finish = h("button", { class: "btn alt sm", type: "button", onclick: () => ctx.end(score + film * 5, got() >= 8, got() + "/" + SPEC.length) }, T("Завершить экспедицию", "Finish expedition"));
      ctx.el.append(cvs.cv, panel, h("div", { class: "btnrow" }, finish), h("h2", { style: { fontSize: "20px", marginTop: "14px" } }, "Nature Book"), book, log);
      const got = () => ents.filter(x => x.got).length;
      const X = i => i % W, Y = i => i / W | 0;
      function reveal() { for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const x = X(p) + dx, y = Y(p) + dy; if (x >= 0 && x < W && y >= 0 && y < H && dx * dx + dy * dy <= 26) seen.add(y * W + x); } }
      function nearby() { return ents.find(x => !x.got && Math.hypot(X(x.i) - X(p), Y(x.i) - Y(p)) <= 2.2); }
      function bookUI() {
        book.innerHTML = ""; ents.forEach(x => book.append(h("div", { class: "nbcard " + (x.got ? "got" : "lock") }, FON.pic("nature/" + NKEY[x.s[0]], { label: x.s[1] }),
          h("div", null, x.got ? x.s[1] : "???", h("small", null, x.got ? x.s[4] : T("Ещё не найдено", "Not found yet"))))));
        hud.set("f", film); hud.set("b", got() + "/" + SPEC.length); hud.set("s", score);
      }
      function panelUI() {
        panel.innerHTML = ""; const n = nearby();
        if (shoot) {
          const marker = h("div", { style: { position: "absolute", top: 0, bottom: 0, width: "6px", background: "#0a2a1a", left: "0%" } });
          const bar = h("div", { style: { position: "relative", height: "26px", background: "#e6f6ec", border: "3px solid #0a2a1a", borderRadius: "10px", overflow: "hidden" } }, h("div", { style: { position: "absolute", top: 0, bottom: 0, left: (50 - shoot.zone / 2) + "%", width: shoot.zone + "%", background: "#19d466" } }), marker);
          shoot.marker = marker; panel.append(h("b", null, T("Наведи и снимай!", "Line it up and shoot!")), h("div", { style: { margin: "8px 0" } }, bar), h("button", { class: "btn", type: "button", onclick: snap }, T("Снять (пробел)", "Shoot (space)")));
        } else if (n) panel.append(h("b", null, T("Рядом кто-то есть!", "Something is nearby!")), h("div", { class: "btnrow" }, h("button", { class: "btn", type: "button", onclick: startShoot }, T("Сфотографировать", "Photograph"))));
        else panel.append(h("span", { style: { color: "var(--mute)", fontWeight: 600 } }, T("Ищи существ: подойди ближе к цветным кружкам.", "Look for creatures: get close to the coloured circles.")));
      }
      function startShoot() { const n = nearby(); if (!n || film <= 0) return; shoot = { ent: n, pos: 0, dir: 1, speed: 0.55 + n.s[3] * 0.35, zone: 34 - n.s[3] * 8 }; panelUI(); }
      function snap() {
        if (!shoot) return; const ok = Math.abs(shoot.pos - 0.5) < shoot.zone / 200; film--;
        if (ok) { shoot.ent.got = true; score += shoot.ent.s[3] * 50; log.textContent = T("Отличный кадр: ", "Great shot: ") + shoot.ent.s[1]; } else log.textContent = T("Смазанный кадр. Попробуй ещё раз.", "Blurry shot. Try again.");
        shoot = null; bookUI(); panelUI();
        if (got() === SPEC.length) ctx.end(score + film * 5, true, T("книга заполнена", "book complete")); else if (film <= 0) ctx.end(score, got() >= 8, got() + "/" + SPEC.length);
      }
      ctx.on(cvs.cv, "pointerdown", ev => { const q = cvs.pos(ev); goal = { x: Math.floor(q.x / TS), y: Math.floor(q.y / TS) }; });
      ctx.on(document, "keydown", ev => {
        const k = ev.key.toLowerCase(); if (k === " " && shoot) { ev.preventDefault(); snap(); return; }
        const m = { arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0], arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1] }[k]; if (m) { ev.preventDefault(); tryMove(m[0], m[1]); goal = null; }
      });
      function tryMove(dx, dy) { if (shoot) return; const nx = X(p) + dx, ny = Y(p) + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) return; const ni = ny * W + nx; if (!land(ni)) return; p = ni; reveal(); const wasNear = panelState; panelUI(); }
      let panelState = 0;
      ctx.raf(dt => {
        moveT += dt;
        if (shoot) { shoot.pos += shoot.dir * shoot.speed * dt; if (shoot.pos >= 1) { shoot.pos = 1; shoot.dir = -1; } if (shoot.pos <= 0) { shoot.pos = 0; shoot.dir = 1; } shoot.marker.style.left = "calc(" + (shoot.pos * 100) + "% - 3px)"; }
        else if (goal && moveT > 0.11) {
          moveT = 0; const dx = goal.x - X(p), dy = goal.y - Y(p); if (!dx && !dy) goal = null;
          else { const tryX = Math.abs(dx) >= Math.abs(dy); const order = tryX ? [[Math.sign(dx), 0], [0, Math.sign(dy)]] : [[0, Math.sign(dy)], [Math.sign(dx), 0]]; const before = p; for (const o of order) { if (!o[0] && !o[1]) continue; tryMove(o[0], o[1]); if (p !== before) break; } if (p === before) goal = null; }
        }
        for (let i = 0; i < W * H; i++) {
          const x = X(i) * TS, y = Y(i) * TS; g.fillStyle = seen.has(i) ? BIO[map[i]] : "#26382e"; g.fillRect(x, y, TS, TS);
        }
        ents.forEach(en => { if (en.got) return; const dd = Math.hypot(X(en.i) - X(p), Y(en.i) - Y(p)); if (dd <= 3.6) { FON.drawPic(g, "nature/" + NKEY[en.s[0]], X(en.i) * TS - 8, Y(en.i) * TS - 8, 46, 46, { label: en.s[1] });  } });
        g.fillStyle = "#ff2d6f"; g.strokeStyle = "#0a2a1a"; g.lineWidth = 3; g.beginPath(); g.arc(X(p) * TS + TS / 2, Y(p) * TS + TS / 2, 11, 0, 7); g.fill(); g.stroke();
        if (!shoot && (!!nearby()) !== (panelState === 1)) { panelState = nearby() ? 1 : 0; panelUI(); }
      });
      reveal(); bookUI(); panelUI();
    }
  });

  /* ============ 14. RESTORE THE PLANET ============ */
  reg({
    id: "planet", group: 2, name: ["Restore the Planet", "Restore the Planet"],
    desc: ["Восстанавливай регионы планеты: леса, океаны, пустыни, горы", "Restore the planet's regions: forests, oceans, deserts, mountains"],
    start(ctx) {
      const { h, T, R } = ctx; const TURNS = 30;
      const REG = [
        { k: "forest", n: T("Леса", "Forests"), hp: 25, a: [[T("Посадить деревья", "Plant trees"), 12, 0], [T("Остановить вырубку", "Stop illegal logging"), 7, 1], [T("Патрули против пожаров", "Fire patrols"), 6, 0]], ev: T("Лесной пожар в регионе «Леса»: −10", "Wildfire in Forests: −10") },
        { k: "ocean", n: T("Океаны", "Oceans"), hp: 20, a: [[T("Очистить от пластика", "Clean up plastic"), 12, 0], [T("Запретить одноразовый пластик", "Ban single-use plastic"), 7, 1], [T("Защитить рифы", "Protect reefs"), 9, 0]], ev: T("Разлив нефти в «Океанах»: −10", "Oil spill in Oceans: −10") },
        { k: "desert", n: T("Пустыни", "Deserts"), hp: 30, a: [[T("Орошение", "Irrigation"), 10, 0], [T("Посадить кустарники", "Plant shrubs"), 12, 0], [T("Солнечные колодцы", "Solar-powered wells"), 8, 1]], ev: T("Засуха в «Пустынях»: −10", "Drought in Deserts: −10") },
        { k: "mount", n: T("Горы", "Mountains"), hp: 35, a: [[T("Сократить выбросы", "Cut emissions"), 9, 1], [T("Защитить ледники", "Protect glaciers"), 10, 0], [T("Восстановить склоны", "Restore slopes"), 12, 0]], ev: T("Лавина в «Горах»: −10", "Avalanche in Mountains: −10") }];
      const hp = REG.map(r => r.hp), prot = REG.map(() => 0), unlocked = [true, false, false, false];
      let turn = 1, ap = 3, msg = "";
      const hud = ctx.hud([{ k: "t", label: T("Ход", "Turn"), val: "1/" + TURNS }, { k: "a", label: T("Действия", "Actions"), val: 3 }, { k: "h", label: T("Здоровье планеты", "Planet health"), val: "0%" }]);
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("viewBox", "0 0 200 200"); svg.style.cssText = "width:100%;max-width:230px;display:block;margin:0 auto";
      const cards = h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" } });
      const log = h("div", { class: "log" });
      const endB = h("button", { class: "btn sun", type: "button", onclick: endTurn }, T("Закончить ход", "End turn"));
      ctx.el.append(h("div", { style: { display: "grid", gridTemplateColumns: "230px 1fr", gap: "16px", alignItems: "center" }, class: "plan-top" }, svg, h("div", null, cards)), h("div", { class: "btnrow" }, endB), log);
      const mix = (t) => { const c0 = [150, 150, 150], c1 = [25, 212, 102]; return "rgb(" + c0.map((v, i) => Math.round(v + (c1[i] - v) * t)).join(",") + ")"; };
      const RK = ["forest", "ocean", "desert", "mountain"], mets = REG.map(r => ctx.meter(r.n));
      const btns = REG.map((r, ri) => r.a.map((a, ai) => h("button", { class: "opt", type: "button", onclick: () => act(ri, ai) }, a[0], h("small", null, "+" + a[1]))));
      REG.forEach((r, ri) => cards.append(h("div", { class: "card regcard", style: { padding: "12px" } }, FON.pic("planet/" + RK[ri], { label: r.n }), h("div", null, mets[ri].row, h("div", { style: { display: "grid", gap: "6px" } }, btns[ri])))));
      const pts = [[100, 100, 100, 0], [100, 100, 200, 100], [100, 100, 100, 200], [100, 100, 0, 100]];
      function arc(i) { const a0 = i * Math.PI / 2 - Math.PI / 2, a1 = a0 + Math.PI / 2, r = 90, c = 100; return "M" + c + " " + c + " L" + (c + r * Math.cos(a0)) + " " + (c + r * Math.sin(a0)) + " A" + r + " " + r + " 0 0 1 " + (c + r * Math.cos(a1)) + " " + (c + r * Math.sin(a1)) + " Z"; }
      function draw() {
        svg.innerHTML = ""; REG.forEach((r, i) => {
          const p = document.createElementNS(svg.namespaceURI, "path"); p.setAttribute("d", arc(i)); p.setAttribute("fill", unlocked[i] ? mix(hp[i] / 100) : "#444"); p.setAttribute("stroke", "#0a2a1a"); p.setAttribute("stroke-width", 3); svg.append(p);
          const a = i * Math.PI / 2 - Math.PI / 4, t = document.createElementNS(svg.namespaceURI, "text"); t.setAttribute("x", 100 + 52 * Math.cos(a)); t.setAttribute("y", 104 + 52 * Math.sin(a)); t.setAttribute("text-anchor", "middle"); t.setAttribute("style", "font:800 11px Montserrat,sans-serif;fill:#fff;paint-order:stroke;stroke:#0a2a1a;stroke-width:3px"); t.textContent = unlocked[i] ? Math.round(hp[i]) : T("закрыто", "locked"); svg.append(t);
        });
        REG.forEach((r, i) => { mets[i].set(hp[i]); btns[i].forEach(b => b.disabled = !unlocked[i] || ap <= 0); });
        const avg = hp.reduce((s, v, i) => s + (unlocked[i] ? v : 0), 0) / 4; hud.set("t", turn + "/" + TURNS); hud.set("a", ap); hud.set("h", Math.round(avg) + "%");
      }
      function checkUnlock() { for (let i = 1; i < 4; i++) if (!unlocked[i] && unlocked[i - 1] && hp[i - 1] >= 55) { unlocked[i] = true; log.textContent = T("Открыт новый регион: ", "New region unlocked: ") + REG[i].n; } }
      function act(ri, ai) { if (ap <= 0 || !unlocked[ri]) return; const a = REG[ri].a[ai]; hp[ri] = Math.min(100, hp[ri] + a[1]); if (a[2] && prot[ri] < 2) prot[ri]++; ap--; log.textContent = ""; checkUnlock(); draw(); if (win()) finishUp(true); }
      const win = () => unlocked.every(Boolean) && hp.every(v => v >= 80);
      function finishUp(w) { const avg = hp.reduce((s, v, i) => s + (unlocked[i] ? v : 0), 0) / 4; ctx.end(avg * 10 + (TURNS - turn) * 15, w, Math.round(avg) + "%"); }
      function endTurn() {
        REG.forEach((r, i) => { if (unlocked[i]) hp[i] = Math.max(0, hp[i] - (3 - prot[i])); });
        const ul = REG.map((r, i) => i).filter(i => unlocked[i]); const e = R.pick(ul);
        if (Math.random() < 0.45) { hp[e] = Math.max(0, hp[e] - 10); log.textContent = REG[e].ev; } else log.textContent = "";
        turn++; ap = 3; checkUnlock();
        if (turn > TURNS) return finishUp(win()); draw();
      }
      draw();
    }
  });

  /* ============ 15. ECO EVOLUTION ============ */
  reg({
    id: "evolution", group: 2, name: ["Eco Evolution", "Eco Evolution"],
    desc: ["Развивай маленькую экосистему: твои решения решают, кто появится", "Grow a tiny ecosystem: your choices decide who appears"],
    start(ctx) {
      const { h, T, R } = ctx; const TURNS = 12;
      const SP = [
        ["alg", T("Водоросли", "Algae"), { w: [30, 100], n: [20, 100] }, []], ["moss", T("Мох", "Moss"), { w: [40, 100], t: [0, 60] }, []], ["grass", T("Трава", "Grass"), { w: [25, 80], t: [20, 75], n: [25, 100] }, []], ["flow", T("Полевые цветы", "Wildflowers"), { w: [30, 70], n: [30, 100] }, ["grass"]],
        ["cact", T("Кактусы", "Cacti"), { w: [0, 45], t: [55, 100] }, []], ["ins", T("Насекомые", "Insects"), { t: [20, 90] }, ["grass"]], ["bee", T("Пчёлы", "Bees"), { t: [25, 85] }, ["flow", "ins"]], ["frog", T("Лягушки", "Frogs"), { w: [50, 100] }, ["ins"]],
        ["fish", T("Рыбы", "Fish"), { w: [65, 100] }, ["alg"]], ["rab", T("Кролики", "Rabbits"), { t: [15, 70] }, ["grass"]], ["fox", T("Лисы", "Foxes"), {}, ["rab"]], ["oak", T("Дубы", "Oaks"), { w: [40, 80], t: [25, 70], n: [50, 100] }, []], ["deer", T("Олени", "Deer"), {}, ["oak", "grass"]], ["heron", T("Цапли", "Herons"), { w: [55, 100] }, ["fish", "frog"]]];
      const EK = { alg: "nature/algae", moss: "nature/moss", grass: "nature/grass", flow: "nature/wildflowers", cact: "nature/cactus", ins: "nature/grasshopper", bee: "bee/bee", frog: "nature/frog", fish: "nature/roach", rab: "nature/rabbit", fox: "nature/fox", oak: "nature/oak", deer: "nature/deer", heron: "nature/heron" };
      const NAME = Object.fromEntries(SP.map(s => [s[0], s[1]]));
      const env = { w: 45, t: 45, n: 35 }; let turn = 1, best = 0, prev = new Set();
      const D = [[T("Сезон дождей", "Rainy season"), { w: 15 }], [T("Вырыть пруд", "Dig a pond"), { w: 10, n: 5 }], [T("Отвести реку", "Divert the river"), { w: -15 }], [T("Потепление", "Warmer climate"), { t: 12 }], [T("Тень и прохлада", "Cool shade"), { t: -12 }], [T("Компост", "Compost"), { n: 15 }], [T("Заболоченный берег", "Wetland shore"), { w: 8, n: 8 }], [T("Контролируемый пал", "Controlled burn"), { n: 10, t: 4 }], [T("Орошение", "Irrigation"), { w: 12, t: -3 }], [T("Засушливый год", "Dry year"), { w: -10, t: 8 }], [T("Удобрения из листвы", "Leaf mulch"), { n: 12, w: 3 }]];
      const KN = { w: T("вода", "water"), t: T("тепло", "warmth"), n: T("питание", "nutrients") };
      const hud = ctx.hud([{ k: "t", label: T("Эпоха", "Era"), val: "1/" + TURNS }, { k: "s", label: T("Видов", "Species"), val: 0 }, { k: "m", label: T("Максимум", "Peak"), val: 0 }]);
      const mW = ctx.meter(KN.w, "sky"), mT = ctx.meter(KN.t, "sun"), mN = ctx.meter(KN.n);
      const chips = h("div", { class: "legend", style: { gap: "8px" } }), opts = h("div", { class: "opts" }), log = h("div", { class: "log" });
      ctx.el.append(h("div", { style: { maxWidth: "420px" } }, mW.row, mT.row, mN.row), chips, h("h2", { style: { fontSize: "18px", marginTop: "14px" } }, T("Решение этой эпохи", "This era's decision")), opts, log);
      function present() { const have = new Set(); SP.forEach(s => { const c = s[2]; const ok = ["w", "t", "n"].every(k => !c[k] || (env[k] >= c[k][0] && env[k] <= c[k][1])) && s[3].every(x => have.has(x)); if (ok) have.add(s[0]); }); return have; }
      function req(s) { const c = s[2], r = []; ["w", "t", "n"].forEach(k => { if (c[k]) r.push(KN[k] + " " + (c[k][0] > 0 && c[k][1] < 100 ? c[k][0] + "–" + c[k][1] : c[k][0] > 0 ? "≥" + c[k][0] : "≤" + c[k][1])); }); s[3].forEach(x => r.push(NAME[x])); return r.join(", ") || T("без условий", "no conditions"); }
      function draw() {
        mW.set(env.w); mT.set(env.t); mN.set(env.n); const have = present();
        chips.innerHTML = ""; SP.forEach(s => chips.append(h("div", { class: "sp-chip" + (have.has(s[0]) ? "" : " off") }, FON.pic(EK[s[0]], { label: s[1] }), s[1], h("small", null, have.has(s[0]) ? T("живёт здесь", "thriving") : req(s)))));
        best = Math.max(best, have.size); hud.set("t", turn + "/" + TURNS); hud.set("s", have.size); hud.set("m", best);
        opts.innerHTML = ""; R.shuffle(D).slice(0, 4).forEach(d => opts.append(h("button", { class: "opt", type: "button", onclick: () => choose(d) }, d[0], h("small", null, Object.keys(d[1]).map(k => (d[1][k] > 0 ? "+" : "") + d[1][k] + " " + KN[k]).join(", ")))));
        prev = have;
      }
      function choose(d) {
        const before = prev; Object.keys(d[1]).forEach(k => env[k] = R.clamp(env[k] + d[1][k], 0, 100));
        const now = present(), born = [...now].filter(x => !before.has(x)).map(x => NAME[x]), died = [...before].filter(x => !now.has(x)).map(x => NAME[x]);
        log.textContent = (born.length ? T("Появились: ", "New: ") + born.join(", ") + ". " : "") + (died.length ? T("Исчезли: ", "Lost: ") + died.join(", ") + "." : "");
        turn++;
        if (turn > TURNS) { best = Math.max(best, now.size); return ctx.end(now.size * 60 + best * 20, now.size >= 8, now.size + " " + T("видов", "species")); }
        draw();
      }
      draw();
    }
  });
})();
