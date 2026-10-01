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
    if ([...$("#toasts").children].some(x => x.dataset.h === html && !x.classList.contains("out"))) return;   // без дублей
    const t = document.createElement("div"); t.dataset.h = html;
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
  const migrate = u => { if (u && !u.phoneVis) u.phoneVis = u.showPhone ? "auth" : "none"; if (u && !u.type) u.type = "person"; return u; };
  VO.user = () => S.session ? migrate(S.accounts[S.session]) || null : null;
  VO.me = () => VO.user() ? VO.uid(VO.user().email) : null;   // id текущего пользователя для чатов, сделок и отзывов
  VO.saveUser = u => { S.accounts[u.email] = u; store.set("vo_accounts", S.accounts); VO.emit("user"); };
  VO.saveMine = () => store.set("vo_my_ads", S.mine);
  VO.uid = email => "u" + [...email].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36);

  VO.allAds = (all = false) => [...S.mine.filter(a => all || (a.status || "active") === "active").map(a => ({ ...a, mine: VO.user() && a.owner === VO.user().email })), ...window.VO_ADS];
  VO.findAd = id => VO.allAds(true).find(a => a.id === id);
  /* Справочник людей: тестовые продавцы, демо-покупатели и аккаунты этого браузера */
  VO.person = id => {
    if (!id) return null;
    if (window.VO_SELLERS[id]) { const s = window.VO_SELLERS[id]; return { id, name: s.name, since: s.since, type: s.company ? "company" : "person", company: s.company ? s.name : "", phoneVis: s.phone ? "all" : "none", phoneNum: null, bot: true, city: s.city }; }
    if (window.VO_DEMO_BUYERS && window.VO_DEMO_BUYERS[id]) return { id, ...window.VO_DEMO_BUYERS[id], bot: true, type: "person", since: 2026 };
    const acc = Object.values(S.accounts).find(a => VO.uid(a.email) === id);
    if (acc) { migrate(acc); return { id, name: acc.name || "Пользователь", since: new Date(acc.created).getFullYear(), type: acc.type, company: acc.company, phoneVis: acc.phoneVis, phoneNum: acc.phone, color: acc.color, city: acc.city, about: acc.about, email: acc.email }; }
    return { id, name: "Пользователь", since: 2026, type: "person" };
  };
  VO.seller = a => VO.person(a.owner ? VO.uid(a.owner) : a.seller);
  VO.displayName = p => p.type === "company" && p.company ? p.company : p.name;
  VO.kind = p => p.type === "company" ? "Компания" : "Частное лицо";
  // cat: msg | deal | ads | review | account | service; link — куда ведёт уведомление
  VO.NOTE_CATS = { msg: "Сообщения", deal: "Сделки", ads: "Объявления", review: "Отзывы", account: "Аккаунт", service: "Сервис" };
  VO.addNote = (title, text, o = {}) => { S.notes.unshift({ id: Date.now() + Math.random(), t: Date.now(), title, text, read: false, cat: o.cat || "service", link: o.link || null, owner: o.owner || S.session || null }); S.notes = S.notes.slice(0, 200); store.set("vo_notes", S.notes); VO.emit("notes"); };
  VO.myNotes = () => S.notes.filter(n => !n.owner || n.owner === S.session);
  VO.readNote = id => { const n = S.notes.find(x => String(x.id) === String(id)); if (n && !n.read) { n.read = true; store.set("vo_notes", S.notes); VO.emit("notes"); } return n; };
  VO.readAllNotes = cat => { VO.myNotes().forEach(n => { if (!cat || n.cat === cat) n.read = true; }); store.set("vo_notes", S.notes); VO.emit("notes"); };

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
  VO.price = a => a.price == null ? '<span class="muted">Цена не указана</span>' : a.price === 0 ? '<span class="free">Даром</span>' : `${VO.rub(a.price)}${a.per ? `<small>${/^(за|в) /.test(a.per) ? a.per : a.per === "выезд" ? "за выезд" : "в " + a.per}</small>` : ""}`;
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
  // несколько фото: на карточке листаются движением мыши (как на крупных площадках)
  const PH = VO._ph = {};
  const multi = a => a.photos && a.photos.length > 1;
  VO.cardMedia = a => { if (!multi(a)) return VO.media(a); PH[a.id] = a.photos; return a.photos.map((p, i) => `<img class="card__ph${i ? "" : " on"}" ${i ? `data-k="${i}"` : `src="${p}"`} alt="">`).join(""); };
  VO.tag = a => a.status === "archived" ? '<span class="card__tag">Снято</span>' : a.status === "sold" ? '<span class="card__tag">Продано</span>' : a.price === 0 ? '<span class="card__tag card__tag--free">Даром</span>'
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
        <div class="card__art">${VO.cardMedia(a)}</div>
        ${VO.tag(a)}
        ${multi(a) ? `<span class="card__bars card__bars--ph">${a.photos.map((_, i) => `<i${i ? "" : ' class="on"'}></i>`).join("")}</span>` : a.photo ? "" : '<span class="card__bars"><i></i><i></i><i></i></span>'}
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
    const r = m.getBoundingClientRect(), imgs = m.querySelectorAll(".card__ph");
    if (imgs.length) return phTo(m, Math.min(imgs.length - 1, Math.max(0, Math.floor((e.clientX - r.left) / r.width * imgs.length))));
    m.dataset.v = Math.min(2, Math.floor((e.clientX - r.left) / r.width * 3));
  });
  function phTo(m, k) {
    const imgs = m.querySelectorAll(".card__ph"), id = m.closest(".card").dataset.id;
    imgs.forEach((im, i) => { if (i === k && !im.src && PH[id]) im.src = PH[id][i]; im.classList.toggle("on", i === k); });
    m.querySelectorAll(".card__bars--ph i").forEach((b, i) => b.classList.toggle("on", i === k));
  }
  document.addEventListener("pointerout", e => { const m = e.target.closest && e.target.closest(".card .card__media"); if (m && !m.contains(e.relatedTarget)) { m.dataset.v = 0; if (m.querySelector(".card__ph")) phTo(m, 0); } });

  /* ---------- просмотр фото на весь экран ---------- */
  VO.lightbox = (list, k = 0) => {
    let i = k;
    const el = VO.sheet(`<div class="lbx"><div class="lbx__stage"><img class="lbx__img" alt=""></div>${list.length > 1 ? `<button class="lbx__nav lbx__nav--l" type="button" data-lb="-1" aria-label="Предыдущее фото">‹</button><button class="lbx__nav lbx__nav--r" type="button" data-lb="1" aria-label="Следующее фото">›</button><div class="lbx__count"></div>` : ""}</div>`, { cls: "sheet--lbx" });
    const img = el.querySelector(".lbx__img"), cnt = el.querySelector(".lbx__count");
    const show = n => { i = (n + list.length) % list.length; img.src = list[i]; if (cnt) cnt.textContent = `${i + 1} / ${list.length}`; };
    show(i);
    el.addEventListener("click", e => { const b = e.target.closest("[data-lb]"); if (b) show(i + +b.dataset.lb); });
    const key = e => { if (!document.body.contains(el)) return removeEventListener("keydown", key); if (e.key === "ArrowRight") show(i + 1); if (e.key === "ArrowLeft") show(i - 1); };
    addEventListener("keydown", key);
    let sx = null; el.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
    el.addEventListener("touchend", e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); sx = null; });
    return el;
  };

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
    const BI = window.VO_BRAND_ICONS;
    VO.sheet(`<div class="share"><h3>Поделиться</h3><p class="share__t">${esc(title)}</p>
      <div class="share__row">
        <a href="https://t.me/share/url?url=${enc(url)}&text=${enc(title)}" target="_blank" rel="noopener"><i>${BI.tg}</i>Telegram</a>
        <a href="https://vk.com/share.php?url=${enc(url)}&title=${enc(title)}" target="_blank" rel="noopener"><i>${BI.vk}</i>ВКонтакте</a>
        <a href="https://wa.me/?text=${enc(title + " " + url)}" target="_blank" rel="noopener"><i>${BI.wa}</i>WhatsApp</a>
        <a href="https://connect.ok.ru/offer?url=${enc(url)}&title=${enc(title)}" target="_blank" rel="noopener"><i>${BI.ok}</i>Одноклассники</a>
        <a href="mailto:?subject=${enc(title)}&body=${enc(url)}"><i>${BI.mail}</i>Почта</a>
        <button type="button" data-copy-url="${esc(url)}"><i>${BI.link}</i>Ссылка</button>
      </div>
      <label class="share__link"><input readonly value="${esc(url)}"><button type="button" class="btn btn--ink" data-copy>Копировать</button></label></div>`, { cls: "sheet--sm" });
  };
  document.addEventListener("click", e => {
    const cu = e.target.closest("[data-copy-url]");
    if (cu) { (navigator.clipboard ? navigator.clipboard.writeText(cu.dataset.copyUrl) : Promise.reject()).then(() => VO.toast("Ссылка скопирована"), () => VO.toast("Скопируйте ссылку из поля ниже")); return; }
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
    let d = v.replace(/\D/g, "");
    if (d.length > 11 && d[0] === "7" && (d[1] === "8" || d[1] === "7")) d = "7" + d.slice(2);   // ввели 8 или 7 после уже стоящего «+7»
    if (d[0] === "8") d = "7" + d.slice(1); if (d[0] !== "7") d = "7" + d; d = d.slice(0, 11);
    const p = d.slice(1); let o = "+7";
    if (p.length) o += " (" + p.slice(0, 3); if (p.length >= 3) o += ")"; if (p.length > 3) o += " " + p.slice(3, 6); if (p.length > 6) o += "-" + p.slice(6, 8); if (p.length > 8) o += "-" + p.slice(8, 10);
    return o;
  };
  VO.phoneOk = v => !VO.phoneProblem(v);
  /* Отсекаем заведомо несуществующие номера: повторы, «лесенки», служебные и несуществующие коды */
  VO.phoneProblem = v => {
    let d = (v || "").replace(/\D/g, ""); if (d[0] === "8") d = "7" + d.slice(1);
    if (d.length !== 11 || d[0] !== "7") return "Номер должен состоять из 11 цифр: +7 и 10 цифр";
    const b = d.slice(1), code = b.slice(0, 3), rest = b.slice(3);
    if ("01256".includes(b[0])) return "Такого кода нет — проверьте первые цифры после +7";
    if (b[0] === "7") return "Укажите российский номер — код начинается с 3, 4, 8 или 9";
    if (/^80\d/.test(code)) return "Это номер горячей линии — укажите личный номер";
    if (/^(\d)\1+$/.test(b) || /^(\d)\1{6}$/.test(rest)) return "Похоже, это не настоящий номер — слишком много одинаковых цифр";
    const counts = {}; [...b].forEach(c => counts[c] = (counts[c] || 0) + 1);
    if (Math.max(...Object.values(counts)) >= 8) return "Похоже, это не настоящий номер — слишком много одинаковых цифр";
    const SEQ = "01234567890", REV = "09876543210";
    if (SEQ.includes(rest) || REV.includes(rest) || SEQ.includes(b) || REV.includes(b)) return "Похоже, это не настоящий номер — цифры идут по порядку";
    if (/^(\d\d)\1\1\d$/.test(rest) || /^(\d\d\d)\1\d$/.test(rest) || /^(\d)\1\1(\d)\2\2\d$/.test(rest)) return "Похоже, это не настоящий номер — проверьте цифры";
    const FAKE = ["9001234567", "9991234567", "9123456789", "9876543210", "9998887766", "9001112233", "9000000001", "9112223344", "9101010101", "9998877665", "9000000099", "9997776655", "9212345678", "9161234567x"];
    if (FAKE.includes(b)) return "Это тестовый номер — укажите свой";
    return null;
  };
  /* Поле выбора населённого пункта с подсказками: любой город из списка или свой вариант */
  VO.cityField = (input, onPick) => {
    const box = document.createElement("ul"); box.className = "cityac"; box.hidden = true;
    input.parentElement.appendChild(box); input.setAttribute("autocomplete", "off");
    const norm = c => c.toLowerCase().replace(/ё/g, "е");
    const show = () => {
      const all = window.VO_CITIES_ALL || [], q = norm(input.value.trim());
      let list = q ? all.filter(c => norm(c).startsWith(q)).concat(all.filter(c => !norm(c).startsWith(q) && norm(c).includes(q))).slice(0, 8) : (window.VO_CITIES_TOP || []).slice(0, 8);
      let html = list.map(c => `<li><button type="button" data-c="${esc(c)}">${esc(c)}</button></li>`).join("");
      if (q.length > 1 && !all.some(c => norm(c) === q)) html += `<li><button type="button" class="own" data-c="${esc(input.value.trim())}">Другой: <b>${esc(input.value.trim())}</b></button></li>`;
      box.innerHTML = html; box.hidden = !html;
    };
    input.addEventListener("focus", show); input.addEventListener("input", show);
    input.addEventListener("blur", () => setTimeout(() => { box.hidden = true; }, 150));
    box.addEventListener("mousedown", e => { const b = e.target.closest("[data-c]"); if (!b) return; e.preventDefault(); input.value = b.dataset.c; box.hidden = true; input.dispatchEvent(new Event("input", { bubbles: true })); box.hidden = true; if (onPick) onPick(b.dataset.c); });
    input.addEventListener("keydown", e => { if (e.key === "Escape" || e.key === "Tab") box.hidden = true; if (e.key === "Enter" && !box.hidden) { const b = box.querySelector("[data-c]"); if (b) { e.preventDefault(); input.value = b.dataset.c; box.hidden = true; } } });
  };
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
    const chats = VO.user() && VO.chats ? VO.chats.list().slice(0, 5) : [];
    msgPop.innerHTML = `<h4>Сообщения ${VO.user() ? '<a href="#/me/msg">Все</a>' : ""}</h4>` + (!VO.user()
      ? `<div class="pop__empty"><svg width="64" height="56" viewBox="0 0 64 56"><path d="M8 6h30a16 16 0 0 1 0 32H22L8 50Z" fill="#F4F5F7"/><circle cx="22" cy="22" r="3" fill="#16181D"/><circle cx="32" cy="22" r="3" fill="#16181D"/><circle cx="42" cy="22" r="3" fill="#FF4F3A"/></svg><b>Войдите, чтобы переписываться</b>Диалоги с продавцами и покупателями будут здесь.<br><a class="pop__btn" href="#/login">Войти</a></div>`
      : chats.length ? `<ul class="pop__list">${chats.map(c => VO.chats.popRow(c)).join("")}</ul>`
      : `<div class="pop__empty"><b>Диалогов пока нет</b>Напишите продавцу со страницы объявления — переписка появится здесь.</div>`);
  }
  function renderBellPop() {
    const list = VO.myNotes().slice(0, 6), unread = VO.myNotes().filter(n => !n.read).length;
    bellPop.innerHTML = `<h4>Уведомления ${unread ? `<button class="link" type="button" data-read-all>Прочитать все</button>` : ""}</h4>`
      + (list.length ? list.map(n => `<a class="note-i${n.read ? "" : " unread"}" href="${n.link || "#/me/notif"}" data-note="${n.id}"><i>${VO.noteIcon(n.cat)}</i><div><b>${esc(n.title)}</b><span>${esc(n.text)}</span><small>${VO.NOTE_CATS[n.cat] || "Сервис"} · ${VO.timeAgo(n.t)}</small></div></a>`).join("") : `<div class="pop__empty">Пока тихо</div>`)
      + (VO.user() ? `<a class="pop__all" href="#/me/notif">Все уведомления</a>` : "");
  }
  bellPop.addEventListener("click", e => {
    if (e.target.closest("[data-read-all]")) { e.stopPropagation(); VO.readAllNotes(); return; }
    const n = e.target.closest("[data-note]"); if (n) VO.readNote(n.dataset.note);
  });
  VO.noteIcon = cat => ({ msg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4.5 4.5h10a5.5 5.5 0 0 1 0 11H8.5l-4 4Z"/></svg>', deal: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8 12 3l9 5v8l-9 5-9-5Z"/><path d="M3 8l9 5 9-5"/></svg>', review: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>', ads: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/></svg>', account: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>' })[cat] || '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 7v6M12 17h.01"/></svg>';
  VO.timeAgo = t => { const m = Math.floor((Date.now() - t) / 60000); if (m < 1) return "только что"; if (m < 60) return m + " мин назад"; if (m < 1440) return Math.floor(m / 60) + " ч назад"; return new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }); };
  function syncBadges() {
    const set = (btn, n) => { const b = $(".badge", btn); b.hidden = !n; b.textContent = n > 9 ? "9+" : n; };
    set($("#favBtn"), S.favs.size); set($("#bellBtn"), VO.user() ? VO.myNotes().filter(n => !n.read).length : 0);
    set($("#msgBtn"), VO.user() && VO.chats ? VO.chats.unread() : 0);
    renderFavPop(); renderBellPop(); renderMsgPop(); renderMe();
  }
  VO.syncBadges = syncBadges;
  VO.on("favs", syncBadges); VO.on("notes", syncBadges); VO.on("user", syncBadges); VO.on("mine", syncBadges); VO.on("chats", syncBadges);

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
    $(".me__ava", meWrap).textContent = (VO.displayName(u) || u.name || u.email)[0].toUpperCase();
    $(".me__ava", meWrap).style.background = u.color || "";
    $(".me__name", meWrap).textContent = u.name || "Профиль";
    const act = S.mine.filter(a => a.owner === u.email && a.status !== "archived").length;
    const unreadMsg = VO.chats ? VO.chats.unread() : 0;
    mePop.innerHTML = `<a class="pop--me__head" href="#/me"><span class="me__ava" style="background:${u.color || ""}">${esc((u.name || u.email)[0].toUpperCase())}</span><span class="pop--me__n"><b>${esc(VO.displayName(u) || "Без имени")}</b><small>${VO.kind(u)}${VO.rating ? VO.rating.short(VO.me()) : ""}</small></span></a><div class="sep"></div>${VO.adm && VO.adm.isAdmin() ? `<a href="#/admin" class="pop--me__adm">Панель управления</a>` : ""}
      <a href="#/me">Личный кабинет</a><a href="#/me/ads">Мои объявления <small>${act}</small></a><a href="#/me/msg">Сообщения ${unreadMsg ? `<small class="hot">${unreadMsg}</small>` : ""}</a><a href="#/me/deals">Сделки</a><a href="#/me/fav">Избранное <small>${S.favs.size}</small></a><a href="#/me/profile">Профиль и настройки</a>
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
