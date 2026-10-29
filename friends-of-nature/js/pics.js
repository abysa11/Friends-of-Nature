/* Загрузчик картинок. Ищет assets/img/<ключ>.png|jpg|webp.
 * Если файла нет — рисует цветную заглушку с подписью (игра всё равно работает).
 * Белый фон картинок "вычитается" через mix-blend-mode: multiply, поэтому
 * картинки на белом фоне выглядят как с прозрачным. Прозрачные PNG тоже подходят.
 */
window.FON = window.FON || {};
(function () {
  const EXT = ["png", "jpg", "webp"];
  const cache = {}, ok = {}, miss = {};
  const alias = k => (FON.ALIAS && FON.ALIAS[k]) || k;
  const url = (k, i) => "assets/img/" + k.replace(/\//g, "-") + "." + EXT[i];


  FON.loadImg = function (key) {
    key = alias(key);
    if (cache[key]) return cache[key];
    return (cache[key] = new Promise(res => {
      let i = 0;
      const next = () => {
        if (i >= EXT.length) { miss[key] = true; return res(null); }
        const im = new Image();
        im.onload = () => { ok[key] = im; res(im); };
        im.onerror = () => { i++; next(); };
        im.src = url(key, i);
      };
      next();
    }));
  };
  FON.preload = keys => Promise.all(keys.map(FON.loadImg));
  FON.imgOk = key => ok[alias(key)] || null;

  function color(key) {
    let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 360;
    return "hsl(" + h + ",65%,86%)";
  }
  function labelOf(key, label) {
    if (label) return label;
    const e = FON.entry && FON.entry(key);
    return e ? FON.T(e.item[1], e.item[2]) : key.split("/")[1];
  }

  /* DOM-элемент с картинкой. o: {size (px), label, cls} */
  FON.pic = function (key, o) {
    o = o || {};
    const el = document.createElement("span");
    el.className = "pic" + (o.cls ? " " + o.cls : "");
    if (o.size) { el.style.width = o.size + "px"; el.style.height = o.size + "px"; }
    const label = labelOf(key, o.label);
    el.dataset.key = key;
    const apply = im => {
      if (im) {
        const i = document.createElement("img");
        i.src = im.src; i.alt = ""; i.draggable = false;
        el.append(i);
      } else {
        el.classList.add("missing"); el.style.setProperty("--ph", color(key));
        const s = document.createElement("span"); s.className = "ph"; s.textContent = label; el.append(s);
      }
    };
    const k = alias(key);
    if (ok[k]) apply(ok[k]); else if (miss[k]) apply(null); else FON.loadImg(k).then(apply);
    return el;
  };

  /* Рисование на canvas. Нужна предзагрузка (FON.preload), иначе нарисуется заглушка. */
  FON.drawPic = function (g, key, x, y, w, h, o) {
    o = o || {};
    const im = ok[alias(key)];
    g.save();
    if (im) {
      g.globalCompositeOperation = "multiply";
      if (o.flip) { g.translate(x + w / 2, 0); g.scale(-1, 1); g.translate(-(x + w / 2), 0); }
      const r = Math.min(w / im.width, h / im.height), dw = im.width * r, dh = im.height * r;
      g.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    } else {
      g.fillStyle = color(key); g.strokeStyle = "rgba(10,42,26,.5)"; g.lineWidth = 2;
      g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, 8) : g.rect(x, y, w, h); g.fill(); g.stroke();
      g.fillStyle = "#0a2a1a"; g.font = "800 " + Math.max(9, Math.min(13, w / 4.5)) + "px Montserrat,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(labelOf(key, o.label).slice(0, 9), x + w / 2, y + h / 2);
    }
    g.restore();
  };
})();
