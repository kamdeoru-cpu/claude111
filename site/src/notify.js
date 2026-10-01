/* Сигналы о новом: число непрочитанных в иконке вкладки (мигает, пока вкладка в фоне)
   и мягкий звук. Настройки — на этом устройстве, в «Уведомления → Настройки». */
(() => {
  const { store } = VO;
  const N = VO.notify = {
    get sound() { return store.get("vo_sound", true) !== false; },
    set sound(v) { store.set("vo_sound", !!v); },
    get tab() { return store.get("vo_tabbadge", true) !== false; },
    set tab(v) { store.set("vo_tabbadge", !!v); paint(); },
  };

  /* ---------- иконка вкладки ---------- */
  const link = document.querySelector('link[rel="icon"]');
  const base = link ? decodeURIComponent(link.getAttribute("href").replace(/^data:image\/svg\+xml,/, "")) : "";
  const inner = base.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const svgUrl = s => "data:image/svg+xml," + encodeURIComponent(s);
  const plain = link ? link.getAttribute("href") : "";
  // логотип сдвигаем влево, справа сверху — красный кружок с числом
  const badged = n => {
    const t = n > 9 ? "9+" : String(n);
    return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220"><svg x="0" y="3" width="150" height="214" viewBox="0 0 150 214">${inner}</svg><circle cx="150" cy="70" r="70" fill="#FF4F3A" stroke="#fff" stroke-width="12"/><text x="150" y="70" dy=".36em" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="${t.length > 1 ? 80 : 100}" fill="#fff">${t}</text></svg>`);
  };
  const baseTitle = () => document.title.replace(/^\(\d+\+?\)\s|^✉ .*? — /, "");
  let count = 0, blinkOn = true, timer = 0, lastHref = "";
  const setIcon = href => { if (link && href !== lastHref) { link.setAttribute("href", href); lastHref = href; } };
  function paint() {
    const show = N.tab && count > 0, bt = baseTitle();
    if (!show) { clearInterval(timer); timer = 0; setIcon(plain); if (document.title !== bt) document.title = bt; return; }
    const label = count > 9 ? "9+" : count;
    if (document.hidden) {
      // вкладка в фоне — число мигает, в заголовке чередуется «новое сообщение»
      if (!timer) timer = setInterval(() => { blinkOn = !blinkOn; tick(); }, 900);
      tick();
    } else { clearInterval(timer); timer = 0; blinkOn = true; setIcon(badged(count)); document.title = `(${label}) ${bt}`; }
    function tick() {
      setIcon(blinkOn ? badged(count) : plain);
      document.title = blinkOn ? `(${label}) ${bt}` : `✉ ${count === 1 ? "Новое сообщение" : "Новые сообщения: " + label} — ${bt}`;
    }
  }
  // VO.show переписывает заголовок — подхватываем
  new MutationObserver(() => { if (count && N.tab && !document.hidden && !/^\(\d/.test(document.title)) paint(); }).observe(document.querySelector("title"), { childList: true });
  document.addEventListener("visibilitychange", () => paint());

  /* ---------- мягкий звук: синтез, без файлов ---------- */
  let ctx = null;
  const unlock = () => { if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); } if (ctx && ctx.state === "suspended") ctx.resume(); };
  ["pointerdown", "keydown", "touchstart"].forEach(e => addEventListener(e, unlock, { passive: true }));
  let lastDing = 0;
  // msg — две ноты вверх (как «капля»), note — одна тихая нота
  N.ding = (kind = "msg", force = false) => {
    if ((!N.sound && !force) || !ctx || ctx.state !== "running" || VO.reduceSound) return;
    const now = Date.now(); if (now - lastDing < 1200 && !force) return; lastDing = now;
    const t0 = ctx.currentTime + .02, out = ctx.createGain();
    out.gain.value = .9; out.connect(ctx.destination);
    const note = (f, at, dur, vol) => {
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f; o2.type = "triangle"; o2.frequency.value = f * 2; // мягкий обертон
      const g2 = ctx.createGain(); g2.gain.value = .12;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(out);
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + .012); g.gain.exponentialRampToValueAtTime(.0001, at + dur);
      o.start(at); o2.start(at); o.stop(at + dur + .05); o2.stop(at + dur + .05);
    };
    if (kind === "msg") { note(880, t0, .32, .11); note(1318.5, t0 + .11, .55, .09); }
    else note(987.8, t0, .45, .07);
  };

  /* ---------- следим за новым ---------- */
  const unread = () => VO.user() && VO.chats ? VO.chats.unread() : 0;
  count = unread();
  let lastNote = (VO.myNotes()[0] || {}).id;
  VO.on("chats", () => { const n = unread(); if (n > count) N.ding("msg"); count = n; paint(); });
  VO.on("user", () => { count = unread(); paint(); });
  VO.on("notes", () => {
    const top = VO.myNotes()[0]; if (!top || top.id === lastNote) return; lastNote = top.id;
    // о сообщениях звенит счётчик чатов; здесь — сделки и отзывы
    if (!top.read && ["deal", "review"].includes(top.cat)) N.ding("note");
  });
  paint();
})();
