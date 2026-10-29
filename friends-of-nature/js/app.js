(function () {
  const h = FON.h, ui = FON.ui, API = FON_API;
  const app = document.getElementById("app");
  let S = { view: "home" }, session = null, room = null, current = null, timers = [];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const load = (st, k) => { try { return JSON.parse(st.getItem(k)); } catch (e) { return null; } };
  const save = (st, k, v) => { try { st.setItem(k, JSON.stringify(v)); } catch (e) {} };
  session = load(sessionStorage, "fon_session"); room = load(localStorage, "fon_room");

  const ICO = {
    speak: '<svg viewBox="0 0 24 24" fill="none" stroke="#0a2a1a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#ffd23f"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="#0a2a1a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    board: '<svg viewBox="0 0 100 80" fill="none" stroke="#0a2a1a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="84" height="50" rx="6" fill="#d6f0ff"/><path d="M30 44l12-14 10 10 8-8 10 12" stroke="#0b8f43"/><path d="M50 58v10M34 72h32"/></svg>',
    phone: '<svg viewBox="0 0 100 80" fill="none" stroke="#0a2a1a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="4" width="40" height="72" rx="8" fill="#fff3c4"/><path d="M46 66h8M42 16h16"/><circle cx="50" cy="38" r="9" fill="#c4f542"/></svg>'
  };
  const ico = (n, cls) => h("span", { class: "ico " + (cls || ""), html: ICO[n] });

  function stopAll() { if (current) { current.destroy(); current = null; } timers.forEach(t => { clearInterval(t); clearTimeout(t); }); timers = []; }
  function go(view, extra) { stopAll(); S = Object.assign({ view }, extra || {}); render(); window.scrollTo(0, 0); }
  const gname = g => FON.T(g.name[0], g.name[1]);
  const gdesc = g => FON.T(g.desc[0], g.desc[1]);
  const inGroup = gr => FON.games.filter(g => g.group === gr);
  const GROUP_KEYS = ["group/waste", "group/wild", "group/planet"];

  function setLang(l) {
    if (FON.lang === l) return;
    const values = [...app.querySelectorAll("input")].map(input => ({ value: input.value, start: input.selectionStart, end: input.selectionEnd, focused: document.activeElement === input }));
    FON.lang = l; try { localStorage.setItem("fon_lang", l); } catch (e) {}
    render();
    [...app.querySelectorAll("input")].forEach((input, i) => {
      if (!values[i]) return;
      input.value = values[i].value;
      if (values[i].focused) input.focus();
      if (values[i].focused && values[i].start != null) input.setSelectionRange(values[i].start, values[i].end);
    });
  }
  document.getElementById("lru").onclick = () => setLang("ru");
  document.getElementById("len").onclick = () => setLang("en");
  document.getElementById("brand").onclick = () => go("home");
  function banner() { const d = document.getElementById("banner"); if (!d) return; d.innerHTML = ""; if (API.isDemo()) d.append(h("div", null, ui("demo"))); }
  API.onDemo(banner);

  function goalBar(id) {
    const txt = FON.T(FON.goals[id][0], FON.goals[id][1]);
    return h("div", { class: "goal" }, h("p", { style: { flex: 1 } }, txt),
      h("button", { class: "speak", type: "button", onclick: () => FON.speak(txt) }, ico("speak"), ui("speak")));
  }
  function gameCards(gr, playable, board) {
    return h("div", { class: "gcards" }, inGroup(gr).map(g => {
      const inner = [h("div", { class: "gthumb" }, FON.pic("game/" + g.id, { label: gname(g) })), h("b", null, gname(g)), h("small", null, gdesc(g))];
      if (playable) inner.push(h("span", { class: "btn sm" }, ui("play")));
      return h(playable ? "button" : "div", { class: "gcard" + (playable ? "" : " static"), onclick: playable ? () => go("play", { id: g.id, board }) : null }, inner);
    }));
  }
  function watchForest(code, f, joinedEl) {
    const tick = async () => { try { const r = await API.getRoom(code); f.set(r.total); if (joinedEl) joinedEl.textContent = r.players + " " + ui("joined"); } catch (e) {} };
    timers.push(setInterval(tick, 5000));
  }
  function fsBtn() {
    const b = h("button", { class: "btn alt sm", type: "button" });
    const upd = () => { b.innerHTML = ""; b.append(ico("full"), document.fullscreenElement ? ui("exitFs") : ui("fullscreen")); };
    b.onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) {} setTimeout(upd, 300); };
    upd(); return b;
  }
  function roomBar(code, onBack, extra) {
    return h("div", { class: "roombar" }, h("button", { class: "back", onclick: onBack }, "← " + ui("back")),
      h("span", { class: "codechip" }, ui("roomCode") + ": ", h("b", null, code)), extra, fsBtn());
  }

  const views = {
    home() {
      return [h("section", { class: "hero hero-reimagined" },
        h("div", { class: "hero-heading" },
          h("span", { class: "hero-eyebrow" }, FON.T("Играем — и помогаем природе", "Play, learn, and care for nature")),
          h("h1", null, ui("h1a"), h("span", null, ui("h1b"))),
          h("p", null, ui("tagline"))),
        h("div", { class: "hero-stage", "aria-label": FON.T("Друзья природы", "Friends of Nature") },
          h("img", { class: "hero-art", src: "assets/img/hero-home.png", alt: FON.T("Дети и взрослый вместе сажают дерево на зелёной поляне", "Children and an adult plant a tree together in a green meadow"), onload: e => e.currentTarget.parentElement.classList.add("has-hero-art") }),
          h("span", { class: "hero-chip chip-forest" }, h("i", null, "✳"), FON.T("Лес", "Forest")),
          h("span", { class: "hero-chip chip-water" }, h("i", null, "≈"), FON.T("Чистая вода", "Clean water")),
          h("span", { class: "hero-chip chip-wild" }, h("i", null, "✿"), FON.T("Живая природа", "Wildlife")),
          h("div", { class: "hero-sun" }),
          h("div", { class: "hero-hill hill-back" }), h("div", { class: "hero-hill hill-front" }),
          h("img", { class: "hero-mascot", src: "assets/logo-mark.png", alt: FON.T("Росток — символ Friends of Nature", "Friends of Nature sprout mascot") }),
          h("span", { class: "hero-leaf leaf-a" }), h("span", { class: "hero-leaf leaf-b" }), h("span", { class: "hero-leaf leaf-c" })),
        h("div", { class: "who" },
          h("button", { class: "role s", onclick: () => go(session ? "sroom" : "student") }, h("span", { class: "role-icon" }, "↗"), h("b", null, ui("student")), h("span", null, ui("studentD")), h("strong", null, FON.T("Войти в игру", "Join a game"))),
          h("button", { class: "role t", onclick: () => go("tchoice") }, h("span", { class: "role-icon" }, "＋"), h("b", null, ui("teacher")), h("span", null, ui("teacherD")), h("strong", null, FON.T("Создать комнату", "Create a room")))) )];
    },
    tchoice() {
      const cards = [];
      if (room) cards.push(h("button", { class: "card pick c1", onclick: () => go("troom") }, h("b", null, ui("tContinue")), h("small", null, ui("roomCode") + ": " + room.code + " · " + ui("groups")[room.group])));
      cards.push(h("button", { class: "card pick c2", onclick: () => go("tgroup") }, h("b", null, ui("tNew")), h("small", null, ui("tNewD"))));
      cards.push(h("button", { class: "card pick c0", onclick: () => go("topen") }, h("b", null, ui("tOpen")), h("small", null, ui("tOpenD"))));
      return [h("section", { class: "teacher-choice" },
        h("button", { class: "back", onclick: () => go("home") }, "← " + ui("back")),
        h("h2", null, ui("teacher")),
        h("div", { class: "grid teacher-actions" }, cards))];
    },
    topen() {
      const code = h("input", { class: "in", placeholder: ui("enterCode"), maxlength: "5", autocapitalize: "characters", style: { textTransform: "uppercase", letterSpacing: ".15em" } });
      const err = h("p", { class: "err" }), btn = h("button", { class: "btn", onclick: open }, ui("openBtn"));
      async function open() {
        const c = code.value.trim().toUpperCase(); if (!c) return err.textContent = ui("needCode");
        btn.disabled = true; err.textContent = "";
        try { const r = await API.getRoom(c); room = { code: r.code, group: r.group, mode: r.mode }; save(localStorage, "fon_room", room); go("troom"); }
        catch (e) { err.textContent = e.status === 404 ? ui("notFound") : ui("netErr"); btn.disabled = false; }
      }
      code.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
      return [h("section", { class: "center-flow form-flow" },
        h("button", { class: "back", onclick: () => go("tchoice") }, "← " + ui("back")),
        h("div", { class: "flow-content" }, h("h2", null, ui("tOpen")), h("p", { class: "sub" }, ui("tOpenD")),
          h("div", { class: "card flow-form" }, code, btn, err)))];
    },
    tgroup() {
      const groups = [0, 1, 2].map(i => h("button", { class: "card pick c" + i, onclick: () => go("tmode", { group: i }) },
        h("div", { class: "gcover" }, FON.pic(GROUP_KEYS[i], { label: ui("groups")[i] })),
        h("b", null, ui("groups")[i]), h("small", null, ui("groupsD")[i]), h("small", null, inGroup(i).map(gname).join(" · "))));
      return [h("section", { class: "center-flow choice-flow" },
        h("button", { class: "back", onclick: () => go("tchoice") }, "← " + ui("back")),
        h("div", { class: "flow-content flow-wide" }, h("h2", null, ui("chooseGroup")), h("p", { class: "sub" }, ui("chooseGroupD")),
          h("div", { class: "grid group-options" }, groups)))];
    },
    tmode() {
      const opt = (mode, icon, t, d, cls) => h("button", { class: "card pick " + cls, onclick: () => makeRoom(S.group, mode) }, ico(icon, "xl"), h("b", null, t), h("small", null, d));
      return [h("section", { class: "center-flow choice-flow" },
        h("button", { class: "back", onclick: () => go("tgroup") }, "← " + ui("back")),
        h("div", { class: "flow-content" }, h("h2", null, ui("chooseMode")), h("p", { class: "sub" }, ui("chooseModeD")),
          h("div", { class: "grid mode-options" }, opt("board", "board", ui("board"), ui("boardD"), "c1"), opt("phones", "phone", ui("phones"), ui("phonesD"), "c0"))))];
    },
    tmake() {
      const DUR = 3.6, step = h("p", { class: "step" }, ui("steps")[0]); let i = 0;
      timers.push(setInterval(() => { i = Math.min(i + 1, 3); step.textContent = ui("steps")[i]; }, DUR * 1000 / 4));
      return [h("div", { class: "creating" },
        h("div", { class: "loading-garden" },
          h("span", { class: "loading-orbit orbit-one" }), h("span", { class: "loading-orbit orbit-two" }),
          h("span", { class: "loading-dot dot-one" }, "✦"), h("span", { class: "loading-dot dot-two" }, "✿"),
          h("img", { class: "loading-mascot", src: "assets/logo-mark.png", alt: "" })),
        h("h2", null, ui("creating")), step, h("div", { class: "cbar" }, h("i", { style: { animationDuration: DUR + "s" } })) )];
    },
    treveal() {
      const board = room.mode === "board";
      const copy = h("button", { class: "btn alt", onclick: () => { try { navigator.clipboard.writeText(room.code); copy.textContent = ui("copied"); } catch (e) {} } }, ui("copy"));
      return [h("div", { class: "reveal" }, h("span", { class: "tag" }, ui("groups")[room.group] + " · " + (board ? ui("board") : ui("phones"))),
        h("p", { class: "sub", style: { margin: "14px auto 0" } }, ui("yourCode")),
        h("div", { class: "code" }, [...room.code].map((c, i) => h("span", { class: "dg", style: { animationDelay: i * 0.18 + "s" } }, c))),
        h("p", { class: "sub", style: { margin: "0 auto 18px" } }, board ? ui("revealBoardD") : ui("revealPhonesD")),
        h("div", { class: "btnrow", style: { justifyContent: "center" } }, copy, h("button", { class: "btn", onclick: () => go("troom") }, ui("next"))))];
    },
    troom() {
      if (!room) { S.view = "home"; return views.home(); }
      const board = room.mode === "board", f = FON.forest({ compact: !board });
      const joined = board ? null : h("span", { class: "tag" });
      API.getRoom(room.code).then(r => { f.set(r.total); if (joined) joined.textContent = r.players + " " + ui("joined"); }).catch(() => {});
      watchForest(room.code, f, joined);
      const bar = roomBar(room.code, () => go("home"), h("span", { class: "tag" }, ui("groups")[room.group]));
      if (board) return [bar, h("div", { class: "two" },
        h("div", null, h("h2", { class: "ftitle" }, ui("forestTitle")), f.el),
        h("div", null, h("h2", { class: "ftitle" }, ui("games")), gameCards(room.group, true, true)))];
      return [bar, joined, h("h2", { class: "ftitle" }, ui("forestTitle")), f.el, h("h2", { class: "ftitle", style: { marginTop: "22px" } }, ui("games")), gameCards(room.group, false, true)];
    },
    student() {
      const code = h("input", { class: "in", placeholder: ui("enterCode"), maxlength: "5", autocapitalize: "characters", style: { textTransform: "uppercase", letterSpacing: ".15em" } });
      const name = h("input", { class: "in", placeholder: ui("yourName"), maxlength: "24" });
      const err = h("p", { class: "err" }), btn = h("button", { class: "btn", onclick: join }, ui("join"));
      async function join() {
        const c = code.value.trim().toUpperCase(), n = name.value.trim();
        if (!c) return err.textContent = ui("needCode"); if (!n) return err.textContent = ui("needName");
        btn.disabled = true; err.textContent = "";
        try { const r = await API.join(c, n); session = { code: c, group: r.group, playerId: r.playerId, name: n }; save(sessionStorage, "fon_session", session); go("sroom"); }
        catch (e) { err.textContent = e.status === 404 ? ui("notFound") : ui("netErr"); btn.disabled = false; }
      }
      [code, name].forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") join(); }));
      return [h("section", { class: "student-page" },
        h("button", { class: "back", onclick: () => go("home") }, "← " + ui("back")),
        h("div", { class: "student-panel" },
          h("h2", null, ui("student")), h("p", { class: "sub" }, ui("studentD")),
          h("div", { class: "card student-form" }, code, name, btn, err)))];
    },
    sroom() {
      if (!session) { S.view = "student"; return views.student(); }
      const f = FON.forest({ compact: true });
      API.getRoom(session.code).then(r => f.set(r.total)).catch(() => {}); watchForest(session.code, f);
      return [roomBar(session.code, () => { session = null; save(sessionStorage, "fon_session", null); go("home"); }, h("span", { class: "tag" }, ui("groups")[session.group])),
        h("h2", { class: "ftitle" }, ui("hello") + ", " + session.name), f.el, h("h2", { class: "ftitle", style: { marginTop: "22px" } }, ui("games")), gameCards(session.group, true, false)];
    },
    play() {
      const g = FON.games.find(x => x.id === S.id), teacher = !!S.board, stage = h("div", { class: "stage" });
      const exit = () => go(teacher ? "troom" : "sroom");
      const start = () => {
        if (current) current.destroy(); stage.innerHTML = "";
        current = FON.makeCtx(stage, { restart: start, exit, submit: score => {
          const src = teacher ? room : session; if (!src) return null;
          return API.sendScore(src.code, teacher ? null : src.playerId, g.id, score);
        } });
        try { g.start(current); } catch (e) { console.error(e); stage.textContent = "Error: " + e.message; }
      };
      requestAnimationFrame(start);
      return [h("div", { class: "gamebar" }, h("button", { class: "back", onclick: exit }, "← " + ui("toGames")), h("h2", { style: { margin: 0 } }, gname(g))), goalBar(g.id), stage];
    }
  };

  async function makeRoom(group, mode) {
    go("tmake"); const t0 = Date.now(); let r;
    try { r = await API.createRoom(group, mode); } catch (e) { go("tmode", { group }); alert(ui("netErr")); return; }
    await sleep(Math.max(0, 3700 - (Date.now() - t0)));
    if (S.view !== "tmake") return;
    room = { code: r.code, group: r.group, mode: r.mode }; save(localStorage, "fon_room", room); go("treveal");
  }

  function render() {
    document.getElementById("lru").className = FON.lang === "ru" ? "on" : "";
    document.getElementById("len").className = FON.lang === "en" ? "on" : "";
    document.querySelector(".lang").classList.toggle("is-en", FON.lang === "en");
    document.documentElement.lang = FON.lang;
    const board = !!(room && room.mode === "board" && (S.view === "troom" || S.view === "treveal" || (S.view === "play" && S.board)));
    document.body.classList.toggle("board", board); document.body.dataset.view = S.view;
    banner(); app.innerHTML = "";
    if (S.view !== "play" && current) { current.destroy(); current = null; }
    timers.forEach(t => { clearInterval(t); clearTimeout(t); }); timers = [];
    app.append(...views[S.view]().filter(Boolean));
  }
  render();
})();
