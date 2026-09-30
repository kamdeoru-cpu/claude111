/* =========================================================
   Все объявления — ядро: состояние, утилиты, карточки, шапка, маршрутизация.
   Сервера пока нет: всё хранится в браузере (localStorage).
   Модули (feed, search, ad, auth, cabinet, post, info, docs) подключаются через window.VO.
   ========================================================= */
(() => {
  const VO = window.VO = {};
  const $ = VO.$ = (s, r = document) => r.querySelector(s);
  const $$ = VO.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = VO.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const store = VO.store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  VO.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  VO.CATS = window.VO_CATS || [];
  VO.catName = id => (VO.CATS.find(c => c.id === id) || {}).name || "";
  VO.catIcon = id => (VO.CATS.find(c => c.id === id) || {}).icon || "";
  const LOADED = Date.now();
  VO.DEMO = true;   // заглушка: пока нет сервера — код входа показываем в «почтовом ящике», просмотры своих объявлений моделируем

  /* ---------- события ---------- */
  const bus = {};
  VO.on = (e, f) => (bus[e] = bus[e] || []).push(f);
  VO.emit = (e, d) => (bus[e] || []).forEach(f => f(d));

  /* ---------- тосты ---------- */
  VO.toast = (html, ms = 3200) => {
    const t = document.createElement("div");
    t.className = "toast"; t.innerHTML = `<i></i><span>${html}</span>`;
    $("#toasts").appendChild(t);
    setTimeout(() => { t.classList.add("out"); t.addEventListener("animationend", () => t.remove()); }, ms);
  };

  /* ---------- состояние ---------- */
  const S = VO.state = {
    session: store.get("vo_session", null),      // email вошедшего
    accounts: store.get("vo_accounts", {}),      // профили по email
    favs: new Set(store.get("vo_favs", [])),
    mine: store.get("vo_my_ads", []),
    notes: store.get("vo_notes", null),
    views: store.get("vo_views", {}),
    searches: store.get("vo_searches", []),
  };
  if (!S.notes) { S.notes = [{ id: 1, t: Date.now(), title: "Добро пожаловать", text: "Размещение объявлений бесплатное. Загляните в «Как это работает».", read: false }]; store.set("vo_notes", S.notes); }
  VO.user = () => S.session ? S.accounts[S.session] || null : null;
  VO.saveUser = u => { S.accounts[u.email] = u; store.set("vo_accounts", S.accounts); VO.emit("user"); };
  VO.saveMine = () => store.set("vo_my_ads", S.mine);
  VO.uid = email => "u" + [...email].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36);

  VO.allAds = (all = false) => [...S.mine.filter(a => all || a.status !== "archived").map(a => ({ ...a, mine: VO.user() && a.owner === VO.user().email })), ...window.VO_ADS];
  VO.findAd = id => VO.allAds(true).find(a => a.id === id);
  VO.seller = a => {
    if (a.owner) { const u = S.accounts[a.owner] || { name: a.sellerName || "Продавец" }; return { id: VO.uid(a.owner), name: u.name, since: new Date(u.created || Date.now()).getFullYear(), phone: !!u.showPhone, phoneNum: u.phone, color: u.color }; }
    const s = window.VO_SELLERS[a.seller] || { name: "Продавец", since: 2025 };
    return { id: a.seller, ...s };
  };
  VO.addNote = (title, text) => { S.notes.unshift({ id: Date.now(), t: Date.now(), title, text, read: false }); S.notes = S.notes.slice(0, 30); store.set("vo_notes", S.notes); VO.emit("notes"); };

  /* ---------- просмотры ---------- */
  const day = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);
  VO.countView = a => {
    if (a.mine) return;
    const v = S.views[a.id] || (S.views[a.id] = { n: 0, d: {} });
    v.n++; v.d[day()] = (v.d[day()] || 0) + 1; store.set("vo_views", S.views);
  };
  // Демо (заглушка до сервера): просмотры своих объявлений «набегают» со временем
  const simAt = (a, t) => { const m = Math.max(0, (t - a.created) / 60000); return m <= 0 ? 0 : Math.floor(Math.sqrt(m) * 5 + 2); };
  VO.views = a => a.owner ? simAt(a, Date.now()) : (a.views || 0) + ((S.views[a.id] || {}).n || 0);
  VO.viewsByDay = (a, days = 7) => {
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const end = Date.now() - i * 864e5, start = end - 864e5;
      out.push(a.owner ? simAt(a, end) - simAt(a, start) : ((S.views[a.id] || {}).d || {})[day(end)] || 0);
    }
    return out;
  };

  /* ---------- форматирование ---------- */
  VO.rub = n => n.toLocaleString("ru-RU") + " ₽";
  VO.price = a => a.price === 0 ? '<span class="free">Даром</span>' : `${VO.rub(a.price)}${a.per ? `<small>${a.per === "выезд" ? "за выезд" : "в " + a.per}</small>` : ""}`;
  VO.minutesAgo = a => a.created ? Math.floor((Date.now() - a.created) / 60000) : a.ago + Math.floor((Date.now() - LOADED) / 60000);
  VO.agoText = a => {
    const m = VO.minutesAgo(a);
    if (m < 1) return "только что";
    if (m < 60) return `${m} мин назад`;
    if (m < 1440) return `${Math.floor(m / 60)} ч назад`;
    const d = Math.floor(m / 1440); return d === 1 ? "вчера" : `${d} дн назад`;
  };
  VO.plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; };
  VO.media = a => a.photo ? `<img src="${a.photo}" alt="">` : (window.VO_ILL[a.ill] || "");
  VO.tag = a => a.status === "archived" ? '<span class="card__tag">Снято</span>' : a.price === 0 ? '<span class="card__tag card__tag--free">Даром</span>'
    : a.cond === "Новое" ? '<span class="card__tag card__tag--new">Новое</span>' : `<span class="card__tag">${esc(a.cond)}</span>`;
  VO.heart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.7 12 20 12 20Z"/></svg>';
  VO.ico = {
    eye: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    share: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7.5 7.5 12 3l4.5 4.5M5 12v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6"/></svg>',
    msg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4.5 4.5h10a5.5 5.5 0 0 1 0 11H8.5l-4 4Z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    flag: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4h11l-2 4 2 4H5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-5.9-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.1 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.3"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16Z"/></svg>',
    chev: '<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>',
  };

  VO.cardHTML = (a, i = 0) => `<article class="card${a.mine ? " card--mine" : ""}" data-id="${a.id}" tabindex="0" style="--d:${Math.min(i, 12) * 45}ms" aria-label="${esc(a.title)}">
      <div class="card__media" data-v="0" style="--bg:${a.bg}">
        <span class="card__blob"></span>
        <div class="card__art">${VO.media(a)}</div>
        ${VO.tag(a)}
        ${a.photo ? "" : '<span class="card__bars"><i></i><i></i><i></i></span>'}
      </div>
      <button class="heart-b${S.favs.has(a.id) ? " is-on" : ""}" type="button" data-fav="${a.id}" aria-pressed="${S.favs.has(a.id)}" aria-label="В избранное">${VO.heart}</button>
      <div class="card__body">
        <div class="card__price">${VO.price(a)}${a.bargain ? '<span class="card__bargain">Торг</span>' : ""}</div>
        <h3 class="card__title">${esc(a.title)}</h3>
        <div class="card__meta">${esc(a.city)} · ${VO.agoText(a)}</div>
      </div>
    </article>`;
  // карточки появляются при прокрутке
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -40px" }) : null;
  VO.animateCards = root => $$(".card:not(.in)", root).forEach(c => io && !VO.reduce ? io.observe(c) : c.classList.add("in"));

  // «фото» на карточке меняются при движении мыши
  document.addEventListener("pointermove", e => {
    const m = e.target.closest && e.target.closest(".card .card__media"); if (!m) return;
    const r = m.getBoundingClientRect(); m.dataset.v = Math.min(2, Math.floor((e.clientX - r.left) / r.width * 3));
  });
  document.addEventListener("pointerout", e => { const m = e.target.closest && e.target.closest(".card .card__media"); if (m && !m.contains(e.relatedTarget)) m.dataset.v = 0; });

  /* ---------- избранное ---------- */
  VO.toggleFav = (id, btn) => {
    const on = !S.favs.has(id);
    on ? S.favs.add(id) : S.favs.delete(id);
    store.set("vo_favs", [...S.favs]);
    $$(`[data-fav="${id}"]`).forEach(b => { b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on); const l = b.querySelector(".lbl"); if (l) l.textContent = on ? "В избранном" : "В избранное"; });
    if (btn && on && !VO.reduce) {
      btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
      const burst = document.createElement("span"); burst.className = "burst";
      burst.innerHTML = [0, 60, 120, 180, 240, 300].map(a => `<i style="--a:${a}deg"></i>`).join("");
      btn.appendChild(burst); setTimeout(() => burst.remove(), 600);
    }
    VO.emit("favs");
    VO.toast(on ? "Добавлено в избранное" : "Убрано из избранного", 1800);
  };
  document.addEventListener("click", e => {
    const f = e.target.closest("[data-fav]");
    if (f) { e.preventDefault(); e.stopPropagation(); VO.toggleFav(f.dataset.fav, f); return; }
    const c = e.target.closest(".card[data-id]");
    if (c && !c.closest(".no-open")) location.hash = "#/ad/" + c.dataset.id;
  });
  document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.matches && e.target.matches(".card[data-id]")) location.hash = "#/ad/" + e.target.dataset.id; });

  /* ---------- поделиться ---------- */
  VO.share = async ({ title, text, url }) => {
    url = url || location.href;
    if (navigator.share) { try { await navigator.share({ title, text, url }); return; } catch (e) { if (e.name === "AbortError") return; } }
    const enc = encodeURIComponent;
    VO.sheet(`<div class="share"><h3>Поделиться</h3><p class="share__t">${esc(title)}</p>
      <div class="share__row">
        <a href="https://t.me/share/url?url=${enc(url)}&text=${enc(title)}" target="_blank" rel="noopener"><i style="background:#2AABEE">TG</i>Telegram</a>
        <a href="https://vk.com/share.php?url=${enc(url)}&title=${enc(title)}" target="_blank" rel="noopener"><i style="background:#0077FF">VK</i>ВКонтакте</a>
        <a href="https://wa.me/?text=${enc(title + " " + url)}" target="_blank" rel="noopener"><i style="background:#25D366">WA</i>WhatsApp</a>
        <a href="mailto:?subject=${enc(title)}&body=${enc(url)}"><i style="background:#16181D">@</i>Почта</a>
      </div>
      <label class="share__link"><input readonly value="${esc(url)}"><button type="button" class="btn btn--ink" data-copy>Копировать</button></label></div>`, { cls: "sheet--sm" });
  };
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const inp = b.parentElement.querySelector("input");
    (navigator.clipboard ? navigator.clipboard.writeText(inp.value) : Promise.reject()).then(() => { b.textContent = "Скопировано"; }, () => { inp.select(); document.execCommand && document.execCommand("copy"); b.textContent = "Скопировано"; });
  });

  /* ---------- всплывающие окна (листы) ---------- */
  let sheetEl = null, sheetOpts = {};
  VO.sheet = (html, opts = {}) => {
    VO.closeSheet(true);
    sheetOpts = opts;
    sheetEl = document.createElement("div");
    sheetEl.className = "sheet " + (opts.cls || "");
    sheetEl.setAttribute("role", "dialog"); sheetEl.setAttribute("aria-modal", "true");
    sheetEl.innerHTML = `<div class="sheet__back"${opts.locked ? "" : " data-sheet-close"}></div><div class="sheet__box">${opts.locked ? "" : '<button class="sheet__x" type="button" data-sheet-close aria-label="Закрыть"><svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>'}${html}</div>`;
    document.body.appendChild(sheetEl);
    document.documentElement.classList.add("no-scroll");
    const f = sheetEl.querySelector("[autofocus], input, button:not(.sheet__x), a"); if (f) setTimeout(() => f.focus(), 60);
    return sheetEl;
  };
  VO.closeSheet = (instant) => {
    if (!sheetEl) return;
    const el = sheetEl; sheetEl = null;
    document.documentElement.classList.remove("no-scroll");
    if (instant || VO.reduce) return el.remove();
    el.classList.add("closing"); setTimeout(() => el.remove(), 230);
    if (sheetOpts.onClose) sheetOpts.onClose();
  };
  document.addEventListener("click", e => { if (e.target.closest("[data-sheet-close]")) VO.closeSheet(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && sheetEl && !sheetOpts.locked) VO.closeSheet(); });

  /* ---------- переключатели с «чернилами» ---------- */
  VO.selectTab = (group, btn) => {
    $$("[role=tab]", group).forEach(b => b.setAttribute("aria-selected", b === btn));
    const ink = $(".tabs__ink, .seg__ink", group);
    if (ink) { ink.style.width = btn.offsetWidth + "px"; ink.style.transform = `translateX(${btn.offsetLeft}px)`; }
  };
  VO.syncInks = () => $$(".tabs, .seg").forEach(g => { const b = $("[aria-selected=true]", g); if (b && b.offsetWidth) VO.selectTab(g, b); });
  addEventListener("resize", VO.syncInks);
  if (document.fonts) document.fonts.ready.then(VO.syncInks);

  /* ---------- появление блоков при прокрутке ---------- */
  const rvIO = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("rv-on"); rvIO.unobserve(e.target); } }), { rootMargin: "0px 0px -60px" }) : null;
  VO.reveal = root => $$("[data-rv]:not(.rv-on)", root).forEach(el => rvIO && !VO.reduce ? rvIO.observe(el) : el.classList.add("rv-on"));

  /* ---------- формы ---------- */
  VO.MAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  VO.check = (field, ok) => { field.classList.toggle("bad", !ok); return ok; };
  VO.phoneMask = v => {
    let d = v.replace(/\D/g, ""); if (d[0] === "8") d = "7" + d.slice(1); if (d[0] !== "7") d = "7" + d; d = d.slice(0, 11);
    const p = d.slice(1); let o = "+7";
    if (p.length) o += " (" + p.slice(0, 3); if (p.length >= 3) o += ")"; if (p.length > 3) o += " " + p.slice(3, 6); if (p.length > 6) o += "-" + p.slice(6, 8); if (p.length > 8) o += "-" + p.slice(8, 10);
    return o;
  };
  VO.phoneOk = v => v.replace(/\D/g, "").length === 11;
  VO.maskedPhone = v => v ? v.replace(/(\d{3})-(\d{2})$/, "***-**") : "";

  /* ---------- шапка: панели иконок и профиль ---------- */
  const acts = $("#hdr .acts"), pops = {};
  function makePop(key, btn, cls = "") {
    const p = document.createElement("div"); p.className = "pop " + cls; p.setAttribute("role", "dialog");
    (btn.closest(".me-wrap") || acts).appendChild(p); pops[key] = { p, btn };
    btn.addEventListener("click", e => { e.stopPropagation(); togglePop(key); });
    return p;
  }
  function togglePop(key, force) {
    Object.entries(pops).forEach(([k, { p, btn }]) => { const on = k === key ? (force ?? !p.classList.contains("is-open")) : false; p.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", on); });
    if (key === "bell" && pops.bell.p.classList.contains("is-open")) { S.notes.forEach(n => n.read = true); store.set("vo_notes", S.notes); syncBadges(); }
  }
  VO.closePops = () => togglePop(null);
  document.addEventListener("click", e => { if (!e.target.closest(".pop")) togglePop(null); else if (e.target.closest("a")) togglePop(null); });
  addEventListener("keydown", e => { if (e.key === "Escape") togglePop(null); });

  const favPop = makePop("fav", $("#favBtn")), msgPop = makePop("msg", $("#msgBtn")), bellPop = makePop("bell", $("#bellBtn"));
  const thumb = a => `<span class="pop__thumb" style="background:${a.bg}">${a.photo ? `<img src="${a.photo}" alt="">` : window.VO_ILL[a.ill]}</span>`;
  function renderFavPop() {
    const list = VO.allAds().filter(a => S.favs.has(a.id));
    favPop.innerHTML = `<h4>Избранное ${list.length ? '<a href="#/me/fav">Все</a>' : ""}</h4>` + (list.length
      ? `<ul class="pop__list">${list.map(a => `<li class="pop__item" data-open="${a.id}">${thumb(a)}<span class="pop__txt"><b>${a.price === 0 ? "Даром" : VO.rub(a.price)}</b><span>${esc(a.title)}</span></span><button class="pop__x" data-fav="${a.id}" aria-label="Убрать из избранного">×</button></li>`).join("")}</ul>`
      : `<div class="pop__empty"><svg width="56" height="56" viewBox="0 0 24 24" fill="#FFEDEA" stroke="#FF4F3A" stroke-width="1.6" stroke-linejoin="round"><path d="M12 20s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.7 12 20 12 20Z"/></svg><b>Пока пусто</b>Нажмите на сердечко у объявления — оно сохранится здесь.</div>`);
  }
  favPop.addEventListener("click", e => { const i = e.target.closest("[data-open]"); if (i && !e.target.closest("[data-fav]")) { togglePop(null); location.hash = "#/ad/" + i.dataset.open; } });
  function renderMsgPop() {
    msgPop.innerHTML = `<h4>Сообщения</h4><div class="pop__empty"><svg width="64" height="56" viewBox="0 0 64 56"><path d="M8 6h30a16 16 0 0 1 0 32H22L8 50Z" fill="#F4F5F7"/><circle cx="22" cy="22" r="3" fill="#16181D"/><circle cx="32" cy="22" r="3" fill="#16181D"/><circle cx="42" cy="22" r="3" fill="#FF4F3A"/></svg>`
      + (VO.user() ? `<b>Диалогов пока нет</b>Напишите продавцу со страницы объявления — переписка появится здесь.` : `<b>Войдите, чтобы переписываться</b>Сообщения с продавцами и покупателями будут здесь.<br><a class="pop__btn" href="#/login">Войти</a>`) + `</div>`;
  }
  function renderBellPop() {
    bellPop.innerHTML = `<h4>Уведомления</h4>` + S.notes.slice(0, 6).map(n => `<div class="note-i"><i><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 7v6M12 17h.01"/></svg></i><div><b>${esc(n.title)}</b><span>${esc(n.text)}</span></div></div>`).join("");
  }
  function syncBadges() {
    const set = (btn, n) => { const b = $(".badge", btn); b.hidden = !n; b.textContent = n > 9 ? "9+" : n; };
    set($("#favBtn"), S.favs.size); set($("#bellBtn"), S.notes.filter(n => !n.read).length);
    renderFavPop(); renderBellPop(); renderMsgPop(); renderMe();
  }
  VO.on("favs", syncBadges); VO.on("notes", syncBadges); VO.on("user", syncBadges); VO.on("mine", syncBadges);

  const loginBtn = $("#loginBtn");
  let meWrap = null, mePop = null;
  function renderMe() {
    const u = VO.user();
    if (!u) { if (meWrap) { meWrap.remove(); meWrap = mePop = null; delete pops.me; } loginBtn.hidden = false; return; }
    loginBtn.hidden = true;
    if (!meWrap) {
      meWrap = document.createElement("div"); meWrap.className = "me-wrap";
      meWrap.innerHTML = `<button class="me" type="button" aria-haspopup="menu"><span class="me__ava"></span><span class="me__name"></span></button>`;
      loginBtn.after(meWrap);
      mePop = makePop("me", $(".me", meWrap), "pop--me");
      mePop.addEventListener("click", e => { if (e.target.closest("[data-logout]")) VO.logout(); });
    }
    $(".me__ava", meWrap).textContent = (u.name || u.email)[0].toUpperCase();
    $(".me__ava", meWrap).style.background = u.color || "";
    $(".me__name", meWrap).textContent = u.name || "Профиль";
    const act = S.mine.filter(a => a.owner === u.email && a.status !== "archived").length;
    mePop.innerHTML = `<a class="pop--me__head" href="#/me"><span class="me__ava" style="background:${u.color || ""}">${esc((u.name || u.email)[0].toUpperCase())}</span><span><b>${esc(u.name || "Без имени")}</b><small>${esc(u.email)}</small></span></a><div class="sep"></div>
      <a href="#/me">Личный кабинет</a><a href="#/me/ads">Мои объявления <small>${act}</small></a><a href="#/me/fav">Избранное <small>${S.favs.size}</small></a><a href="#/me/profile">Профиль и настройки</a>
      <div class="sep"></div><button type="button" class="out" data-logout>Выйти</button>`;
  }
  VO.logout = () => { S.session = null; store.set("vo_session", null); VO.emit("user"); VO.toast("Вы вышли из аккаунта"); if (/^#\/(me|post)/.test(location.hash)) location.hash = "#/"; };
  VO.needLogin = (ret, msg) => { sessionStorage.setItem("vo_return", ret); if (msg) VO.toast(msg); location.hash = "#/login"; };

  /* ---------- маршрутизация ---------- */
  VO.routes = {};
  VO.titles = {};
  let current = null;
  VO.current = () => current;
  VO.page = (name, html) => {   // модули могут создать свою страницу
    let p = $(`.page[data-page="${name}"]`);
    if (!p) { p = document.createElement("section"); p.className = "page"; p.dataset.page = name; $("#view").appendChild(p); }
    if (html != null) p.innerHTML = html;
    return p;
  };
  VO.show = (page, title) => {
    const fresh = current !== page;
    current = page;
    $$(".page").forEach(p => p.classList.toggle("is-on", p.dataset.page === page));
    document.title = (title ? title + " — " : "") + "Все объявления";
    scrollTo(0, 0);
    VO.reveal($(`.page[data-page="${page}"]`));
    requestAnimationFrame(VO.syncInks);
    return fresh;
  };
  function route() {
    const [path, qs] = (location.hash.slice(1) || "/").split("?");
    const params = new URLSearchParams(qs || "");
    const parts = path.split("/").filter(Boolean).map(decodeURIComponent);
    const head = parts[0] || "";
    togglePop(null); VO.closeSheet(true); if (VO.closeMega) VO.closeMega();
    const fn = VO.routes[head] || VO.routes["*"];
    fn(parts, params);
    VO.emit("route", head);
  }
  VO.rerender = route;
  VO.start = () => { addEventListener("hashchange", route); syncBadges(); route(); };
})();
