/* =========================================================
   Слой управления сайтом: всё, что меняет админка, применяется здесь —
   тексты, логотип, цвет, контакты, баннер, техработы, категории,
   статусы объявлений, ограничения пользователей, журнал действий.
   Сервера пока нет: настройки лежат в браузере (localStorage).
   ========================================================= */
(() => {
  const { $, $$, esc, store, state: S } = VO;
  const A = VO.adm = {};
  const now = () => Date.now();

  /* ---------- правила сайта ---------- */
  const DEF = {
    premod: false, dayLimit: 10, maxPhotos: 8, regOpen: true, bots: true,
    maint: { on: false, text: "Сайт обновляется. Вернёмся совсем скоро — объявления и переписки сохранены." },
    banner: { on: false, text: "", tone: "accent", link: "" },
    words: [], team: [],
    // тонкие настройки (раздел «Правила сайта»)
    premodNewDays: 0, premodFirstN: 0, autoHideReports: 3, adTTL: 0, minDesc: 0, requirePhoto: false,
    blockTempMail: true, newUserMsgPerHour: 30, autoBanWarns: 0,
    chatNoLinks: false, chatPhotos: true, chatRiskWarn: true,
    reviewsOnlyDeal: false, reviewsPremod: false,
    otpTries: 5, otpLockMin: 5, defSort: "new",
  };
  let cfgCache = null;
  A.cfg = () => cfgCache || (cfgCache = { ...DEF, ...store.get("vo_adm_cfg", {}) });
  A.setCfg = patch => { cfgCache = { ...A.cfg(), ...patch }; store.set("vo_adm_cfg", cfgCache); VO.emit("cfg"); };

  /* ---------- кто админ ---------- */
  // Владелец — почта из контактов. Остальные — в «Команде». В демо-режиме можно открыть админку на этом устройстве.
  const ownerMail = () => String((window.VO_CONTACTS || {}).email || "").toLowerCase();
  A.ROLES = { owner: "Владелец", admin: "Администратор", moder: "Модератор", support: "Поддержка" };
  A.role = email => {
    if (!email) return null;
    email = email.toLowerCase();
    if (email === ownerMail()) return "owner";
    const m = A.cfg().team.find(t => t.email === email); if (m) return m.role;
    if (VO.DEMO && sessionStorage.getItem("vo_adm_demo") === email) return "owner";
    return null;
  };
  A.me = () => { const u = VO.user(); return u ? A.role(u.email) : null; };
  A.isAdmin = () => !!A.me();
  // что разрешено каждой роли
  const CAN = { owner: ["site", "manage", "rules", "team", "data"], admin: ["site", "manage", "rules", "data"], moder: ["manage"], support: ["support"] };
  A.can = what => { const r = A.me(); if (!r) return false; const l = CAN[r] || []; return l.includes(what) || (what === "support" && l.includes("manage")); };

  /* ---------- журнал действий ---------- */
  // extra.undo — снимки «как было» для кнопки «Отменить»
  A.log = (act, target = "", info = "", extra = {}) => {
    const u = VO.user(), l = store.get("vo_adm_log", []), id = now().toString(36) + Math.random().toString(36).slice(2, 5);
    l.unshift({ id, t: now(), who: extra.system ? "система" : u ? u.email : "система", act, target: String(target), info: String(info), ...(extra.undo ? { undo: extra.undo } : {}) });
    // снимки отмены храним только у 200 последних записей — экономим место
    l.slice(200).forEach(x => delete x.undo);
    store.set("vo_adm_log", l.slice(0, 2000));
    return id;
  };
  A.markUndone = id => { const l = store.get("vo_adm_log", []), x = l.find(e => e.id === id); if (x) { x.undone = now(); delete x.undo; store.set("vo_adm_log", l); } };
  A.logs = () => store.get("vo_adm_log", []);

  /* ---------- контакты владельца ---------- */
  const C = window.VO_CONTACTS;
  A.CONTACTS_BASE = { ...C };
  const applyContacts = () => { Object.assign(C, A.CONTACTS_BASE, store.get("vo_site_contacts", {})); C.tel = "+" + String(C.phone || "").replace(/\D/g, "").replace(/^8/, "7"); };
  applyContacts();
  A.setContacts = o => { store.set("vo_site_contacts", o); applyContacts(); };

  /* ---------- текст сайта ---------- */
  // Правка любого текста: «было → стало». Пользовательские данные (объявления, имена, переписка) не трогаем.
  A.DENY = ".card, .msg, .chat__body, .chats__list, .crow, .adp__desc, .adp__title, .adp__price, .adp__specs, .seller, .rev, .revs, .note-i, .pop__item, .row-ad, .mini-row, .ticket, .saved, .me, .cab__me, .adm, .ed-ui, .toast, .gal, .crumbs span, .signin__wall, .inbox__code, script, style, textarea, input, select, option, [data-noedit], .suggest__recent, .region .txt, #profPrev, .deal-bar, .lbx, .chat__h, .chat__quick, .cab-kpi b, .wiz__prev, .review__card, .review__l dd, .city ul, .sg-list, .vo-cookie__body small";
  // Счётчики, даты, цены, контакты и имена считает сам сайт — их править нельзя
  A.DENY += ", .badge, .dot-n, time, .msg__t, .count, #feedSub, .feed-sub, .gal__count, .adp__stats, .row-ad__st, .cab-kpi, .kpi, .sec-row small, .quality__h, .otp, .tabs small, [role=tab] small, .chips small, .seg small, .wiz-steps i, .cab__hi h1, .cab__hi .muted, .cab__nav em, .pub, .foot__mail, #footOwner, #year, #fabList a, .way small, .pop--me__head, .inbox, .pricehint b, .rate, .stars, .ed-dock";
  // «Живой» текст: без букв (9+, 3, 1 / 4) или короткий с цифрами (21 объявление, 5 мин назад)
  A.dynamic = t => { t = String(t).replace(/\s+/g, " ").trim(); return !/\p{L}{2}/u.test(t) || (/\d/.test(t) && t.length < 40); };
  let TEXT = store.get("vo_site_text", {});
  // если раньше успели «поправить» счётчик — убираем такую правку
  { let bad = false; Object.keys(TEXT).forEach(k => { if (A.dynamic(k)) { delete TEXT[k]; bad = true; } }); if (bad) store.set("vo_site_text", TEXT); }
  A.texts = () => TEXT;
  const norm = s => s.replace(/\s+/g, " ").trim();
  A.normText = norm;
  function applyText(root) {
    if (!root || !document.body) return;
    const w = document.createTreeWalker(root.nodeType === 3 ? root.parentNode : root, NodeFilter.SHOW_TEXT, { acceptNode: n => { const p = n.parentElement; return !p || p.closest(A.DENY) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    for (let n; (n = w.nextNode());) {
      if (n.__o != null && n.nodeValue !== n.__v) n.__o = null;   // текст сменил сам сайт — это новый оригинал
      const o = n.__o != null ? n.__o : n.nodeValue, k = norm(o);
      if (!k || A.dynamic(k)) continue;
      const v = TEXT[k];
      if (v != null) {
        if (n.__o == null) n.__o = o;
        const nv = o.match(/^\s*/)[0] + v + o.match(/\s*$/)[0];
        if (n.nodeValue !== nv) n.nodeValue = nv;
        n.__v = nv;
      } else if (n.__o != null) { n.nodeValue = n.__o; n.__v = null; n.__o = null; }
    }
  }
  A.applyText = applyText;
  A.setText = (orig, val) => { orig = norm(orig); if (A.dynamic(orig)) return; if (val == null || norm(val) === orig) delete TEXT[orig]; else TEXT[orig] = val; store.set("vo_site_text", TEXT); applyText(document.body); };
  A.setTexts = map => { TEXT = map; store.set("vo_site_text", TEXT); applyText(document.body); };
  let pend = new Set(), raf = 0;
  const mo = new MutationObserver(ms => {
    if (!Object.keys(TEXT).length) return;
    ms.forEach(m => { if (m.type === "characterData") pend.add(m.target); else m.addedNodes.forEach(n => pend.add(n)); });
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; const l = [...pend]; pend.clear(); l.forEach(n => n.isConnected && applyText(n)); });
  });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  // другие вкладки (и окно предпросмотра в админке) подхватывают изменения сразу
  addEventListener("storage", e => {
    if (e.key === "vo_site_text") { TEXT = store.get("vo_site_text", {}); applyText(document.body); }
    if (e.key === "vo_site_brand") applyBrand();
    if (e.key === "vo_site_cats") location.reload();
    if (e.key === "vo_adm_cfg") { cfgCache = null; paintBanner(); }
  });

  /* ---------- логотип и цвет ---------- */
  A.brand = () => store.get("vo_site_brand", {});
  const orig = new Map();
  const swap = (el, html) => { if (!el) return; if (!orig.has(el)) orig.set(el, el.innerHTML); el.innerHTML = html; };
  const restore = el => { if (el && orig.has(el)) { el.innerHTML = orig.get(el); orig.delete(el); } };
  function applyBrand() {
    const b = A.brand(), root = document.documentElement.style;
    const logoImg = b.logo ? `<img class="brand-img" src="${b.logo}" alt="Все объявления">` : null;
    [$("#hdr .logo"), $(".foot__logo")].forEach(el => logoImg ? swap(el, logoImg) : restore(el));
    const mark = b.mark || b.logo;
    $$(".inbox__ava, .cform__ava, .journey__dot").forEach(el => mark ? swap(el, `<img class="brand-mark" src="${mark}" alt="">`) : restore(el));
    if (b.accent) { root.setProperty("--accent", b.accent); root.setProperty("--accent-2", shade(b.accent, -.12)); root.setProperty("--accent-soft", mix(b.accent, .12)); }
    else ["--accent", "--accent-2", "--accent-soft"].forEach(p => root.removeProperty(p));
    const fav = document.querySelector('link[rel="icon"]');
    if (fav) { if (!fav.dataset.base) fav.dataset.base = fav.getAttribute("href"); if (b.mark) fav.setAttribute("href", b.mark); else if (!VO.notify) fav.setAttribute("href", fav.dataset.base); }
  }
  const hex = h => { h = h.replace("#", ""); if (h.length === 3) h = h.replace(/./g, "$&$&"); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const toHex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const shade = (h, k) => toHex(hex(h).map(v => v * (1 + k)));
  const mix = (h, k) => toHex(hex(h).map(v => 255 - (255 - v) * k));
  A.applyBrand = applyBrand;
  A.setBrand = b => { store.set("vo_site_brand", b); applyBrand(); };
  applyBrand();
  VO.on("route", () => setTimeout(applyBrand, 0));

  /* ---------- безопасный SVG ---------- */
  // Оставляем только рисующие элементы и атрибуты: без скриптов, ссылок и обработчиков
  const TAGS = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon", "defs", "lineargradient", "radialgradient", "stop", "clippath", "mask", "title"]);
  const ATTRS = new Set(["d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2", "points", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-dasharray", "stroke-miterlimit", "transform", "viewbox", "width", "height", "opacity", "fill-opacity", "stroke-opacity", "fill-rule", "clip-rule", "offset", "stop-color", "stop-opacity", "id", "gradientunits", "gradienttransform", "clip-path", "mask", "preserveaspectratio", "xmlns"]);
  A.cleanSVG = src => {
    const doc = new DOMParser().parseFromString(String(src), "image/svg+xml"), svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== "svg" || doc.querySelector("parsererror")) return null;
    const walk = el => {
      [...el.children].forEach(ch => { if (!TAGS.has(ch.nodeName.toLowerCase())) ch.remove(); else walk(ch); });
      [...el.attributes].forEach(a => { const n = a.name.toLowerCase(), v = a.value; if (!ATTRS.has(n) || /javascript:|data:|expression|url\((?!#)/i.test(v)) el.removeAttribute(a.name); });
    };
    walk(svg);
    if (!svg.getAttribute("viewBox")) { const w = parseFloat(svg.getAttribute("width")) || 24, h = parseFloat(svg.getAttribute("height")) || 24; svg.setAttribute("viewBox", `0 0 ${w} ${h}`); }
    svg.removeAttribute("width"); svg.removeAttribute("height"); svg.setAttribute("aria-hidden", "true");
    const out = new XMLSerializer().serializeToString(svg);
    return out.length > 60000 ? null : out;
  };

  /* ---------- категории ---------- */
  A.cats = () => VO.CATS;
  A.saveCats = list => {
    // меняем массив на месте — на него ссылаются шапка, лента и мастер подачи
    VO.CATS.splice(0, VO.CATS.length, ...list);
    store.set("vo_site_cats", list);
    list.forEach(c => { if (!window.VO_CAT_ILL[c.id]) window.VO_CAT_ILL[c.id] = c.ill || "plant"; if (!window.VO_CAT_BG[c.id]) window.VO_CAT_BG[c.id] = c.bg || "#F4F5F7"; });
    if (window.VO_renderCats) window.VO_renderCats();
    if (VO.search && VO.search.build) VO.search.build();
  };
  A.resetCats = () => { store.del("vo_site_cats"); A.saveCats(JSON.parse(JSON.stringify(window.VO_CATS_BASE))); store.del("vo_site_cats"); };
  VO.CATS.forEach(c => { if (!window.VO_CAT_ILL[c.id]) window.VO_CAT_ILL[c.id] = c.ill || "plant"; if (!window.VO_CAT_BG[c.id]) window.VO_CAT_BG[c.id] = c.bg || "#F4F5F7"; });

  /* ---------- пользователи: ограничения ---------- */
  let UC = store.get("vo_adm_users", {});
  A.u = id => UC[id] || {};
  A.setU = (id, patch) => { UC[id] = { ...A.u(id), ...patch }; Object.keys(UC[id]).forEach(k => UC[id][k] == null && delete UC[id][k]); store.set("vo_adm_users", UC); VO.emit("adm-users"); };
  const live = s => !!s && (!s.until || s.until > now());
  // снимки для отмены действий
  A.snapU = id => UC[id] ? JSON.parse(JSON.stringify(UC[id])) : null;
  A.restoreU = (id, snap) => { if (snap) UC[id] = snap; else delete UC[id]; store.set("vo_adm_users", UC); VO.emit("adm-users"); };
  // владельца и самого себя ограничить нельзя
  A.protectedId = id => { const u = VO.user(); return id === uid0(ownerMail()) || id === VO.uid(ownerMail()) || (u && id === VO.uid(u.email)); };
  A.live = live;
  A.isBanned = id => live(A.u(id).ban);
  A.limits = id => { const r = A.u(id); return { ban: live(r.ban) ? r.ban : null, noPost: live(r.noPost) ? r.noPost : null, noMsg: live(r.noMsg) ? r.noMsg : null }; };
  A.until = s => !s ? "" : !s.until ? "навсегда" : "до " + new Date(s.until).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  // ограничения текущего пользователя — для проверок в подаче объявлений и чате
  VO.restrict = what => { const u = VO.user(); if (!u) return null; const l = A.limits(VO.uid(u.email)); return l.ban || l[what] || null; };

  // почта сменилась — id остаётся прежним, чтобы не потерять отзывы и переписку
  const uid0 = VO.uid;
  VO.uid = e => { const a = e && S.accounts[e]; return (a && a.uid) || uid0(e); };
  A.uid0 = uid0;

  const person0 = VO.person;
  A.TEAM = { id: "team", name: "Команда «Все объявления»", team: true, type: "company", company: "Команда «Все объявления»", since: 2026, verified: true, phoneVis: "none", color: "#16181D" };
  VO.person = id => {
    if (id === "team") return { ...A.TEAM };
    const p = person0(id); if (!p) return p;
    const r = A.u(id); if (r.verified) p.verified = true; if (live(r.ban)) p.banned = true;
    return p;
  };

  /* ---------- объявления: статусы, поднятие, выделение ---------- */
  let AO = store.get("vo_adm_ads", {});
  const isMine = id => S.mine.some(a => a.id === id);
  A.ad = id => { const m = S.mine.find(a => a.id === id); return m ? (m.adm || {}) : ((AO[id] || {}).adm || {}); };
  // patch — поля объявления (название, цена…), meta — служебное: state, until, reason, rank, featured, bump, deleted
  const NOSNAP = ["photos", "photo"];
  A.snapAd = id => { const m = S.mine.find(a => a.id === id); if (m) { const c = {}; Object.keys(m).forEach(k => { if (!NOSNAP.includes(k)) c[k] = JSON.parse(JSON.stringify(m[k] ?? null)); }); return { mine: true, v: c }; } return { mine: false, v: AO[id] ? JSON.parse(JSON.stringify(AO[id])) : null }; };
  A.restoreAd = (id, snap) => {
    if (!snap) return;
    if (snap.mine) { const m = S.mine.find(a => a.id === id); if (!m) return; Object.keys(m).forEach(k => { if (!NOSNAP.includes(k) && !(k in snap.v)) delete m[k]; }); Object.assign(m, snap.v); VO.saveMine(); }
    else { if (snap.v) AO[id] = snap.v; else delete AO[id]; store.set("vo_adm_ads", AO); }
    VO.emit("mine"); if (VO.search && VO.search.build) VO.search.build();
  };
  // срок публикации: считаем от последнего продления, поднятия или создания
  A.expired = a => { const d = A.cfg().adTTL; return !!(d && a.owner && now() - Math.max(a.renewed || 0, (a.adm && a.adm.bump) || 0, a.first || a.created || 0) > d * 864e5); };
  A.setAd = (id, patch = {}, meta = null) => {
    const m = S.mine.find(a => a.id === id);
    if (m) { Object.assign(m, patch); if (meta) { m.adm = { ...(m.adm || {}), ...meta }; Object.keys(m.adm).forEach(k => m.adm[k] == null && delete m.adm[k]); } VO.saveMine(); }
    else { const o = AO[id] || {}; o.patch = { ...(o.patch || {}), ...patch }; if (meta) { o.adm = { ...(o.adm || {}), ...meta }; Object.keys(o.adm).forEach(k => o.adm[k] == null && delete o.adm[k]); } AO[id] = o; store.set("vo_adm_ads", AO); }
    VO.emit("mine"); if (VO.search && VO.search.build) VO.search.build();
  };
  A.purgeAd = id => { const i = S.mine.findIndex(a => a.id === id); if (i >= 0) { S.mine.splice(i, 1); VO.saveMine(); } else { AO[id] = { ...(AO[id] || {}), adm: { ...((AO[id] || {}).adm || {}), deleted: true, purged: true } }; store.set("vo_adm_ads", AO); } VO.emit("mine"); };
  A.ownerId = a => a.owner ? VO.uid(a.owner) : a.seller;
  A.visible = a => {
    const m = a.adm || {};
    if (m.deleted) return false;
    if ((m.state === "hidden" || m.state === "blocked") && (!m.until || m.until > now())) return false;
    if (a.mod === "pending" || a.mod === "rejected") return false;
    const c = VO.CATS.find(x => x.id === a.cat); if (c && c.hidden) return false;
    const o = A.ownerId(a); if (o && (A.isBanned(o) || A.u(o).hideAds)) return false;
    if (A.expired(a)) return false;
    // «теневой» режим: объявления видит только сам автор
    if (o && A.u(o).shadow) { const u = VO.user(); if (!u || VO.uid(u.email) !== o) return false; }
    return true;
  };
  const merge = a => { const o = AO[a.id]; let x = o ? { ...a, ...(o.patch || {}), adm: { ...(a.adm || {}), ...(o.adm || {}) } } : a; if (x.adm && x.adm.bump) x = { ...x, created: x.adm.bump }; return x; };
  const all0 = VO.allAds;
  A.allAds = () => all0(true).map(merge);
  VO.allAds = (all = false) => all0(true).map(merge).filter(a => {
    if (a.adm && a.adm.purged) return false;
    if (all) return !(a.adm && a.adm.deleted);
    return (a.status || "active") === "active" && A.visible(a);
  });
  // закреплённые сверху, опущенные — в конце
  VO.rankSort = list => { const r = a => (a.adm && a.adm.rank) || 0; return [...list].sort((a, b) => r(b) - r(a)); };
  const card0 = VO.cardHTML;
  VO.cardHTML = (a, i) => { let h = card0(a, i); const m = a.adm || {}; if (m.featured) h = h.replace('class="card', 'class="card card--vip'); if (m.rank > 0) h = h.replace('<div class="card__body">', '<div class="card__body"><span class="card__pin">Закреплено</span>'); return h; };

  /* ---------- пользовательские стоп-слова ---------- */
  if (VO.guard) {
    const t0 = VO.guard.text;
    VO.guard.text = (s, kind) => {
      const r = t0(s, kind); if (r) return r;
      const words = A.cfg().words; if (!words.length || ["chat", "ticket", "report"].includes(kind) && kind !== "chat") return null;
      const low = String(s).toLowerCase().replace(/ё/g, "е");
      const hit = words.find(w => w && low.includes(String(w).toLowerCase().replace(/ё/g, "е")));
      return hit ? "Текст содержит запрещённое на сайте слово. Перефразируйте, пожалуйста" : null;
    };
  }

  /* ---------- служебные сообщения от команды ---------- */
  A.warn = (email, text, { chat = true } = {}) => {
    const id = VO.uid(email), r = A.u(id), warns = [...(r.warns || []), { t: now(), text, id: now().toString(36) }];
    A.setU(id, { warns });
    // автоблокировка после N предупреждений (если включена в правилах)
    const n = A.cfg().autoBanWarns;
    if (n && warns.length >= n && !live(A.u(id).ban)) { A.setU(id, { ban: { until: now() + 7 * 864e5, reason: `Автоматически: ${warns.length} предупреждений`, t: now(), by: "система" } }); A.log("Автоблокировка после предупреждений", email, `${warns.length} предупр.`, { system: true }); }
    VO.addNote("Предупреждение от модератора", text, { cat: "account", owner: email, link: chat ? "#/me/msg" : null });
    if (chat && VO.chats && VO.chats.teamSay) VO.chats.teamSay(email, "⚠️ Предупреждение: " + text);
  };
  A.notify = (email, title, text, link) => VO.addNote(title, text, { cat: "service", owner: email, link: link || null });

  /* ---------- вход в чужой аккаунт (для поддержки) ---------- */
  A.loginAs = email => {
    const me = VO.user(); if (!me || !S.accounts[email]) return;
    A.log("Вход в аккаунт пользователя", email);
    sessionStorage.setItem("vo_adm_back", me.email);
    S.session = email; store.set("vo_session", email); VO.emit("user");
    location.hash = "#/me";
  };
  A.back = () => { const b = sessionStorage.getItem("vo_adm_back"); if (!b) return; sessionStorage.removeItem("vo_adm_back"); S.session = b; store.set("vo_session", b); VO.emit("user"); location.hash = "#/admin/users"; };
  function paintAs() {
    let bar = $("#asBar"); const b = sessionStorage.getItem("vo_adm_back"), u = VO.user();
    if (!b || !u || u.email === b) { if (bar) bar.remove(); return; }
    if (!bar) { bar = document.createElement("div"); bar.id = "asBar"; bar.className = "as-bar"; document.body.appendChild(bar); bar.addEventListener("click", e => { if (e.target.closest("[data-as-back]")) A.back(); }); }
    bar.innerHTML = `<span>Вы в аккаунте <b>${esc(u.name || u.email)}</b> как администратор</span><button type="button" data-as-back>Вернуться в админку</button>`;
  }

  /* ---------- баннер и техработы ---------- */
  function paintBanner() {
    const b = A.cfg().banner; let el = $("#siteBanner");
    const hide = !b.on || !b.text || sessionStorage.getItem("vo_banner_x") === b.text || VO.current() === "admin";
    if (hide) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("div"); el.id = "siteBanner"; $("#view").before(el); el.addEventListener("click", e => { if (e.target.closest("[data-bx]")) { sessionStorage.setItem("vo_banner_x", A.cfg().banner.text); paintBanner(); } }); }
    el.className = "site-banner site-banner--" + (b.tone || "accent");
    const link = b.link && /^(#\/|https:\/\/)/.test(b.link) ? b.link : "";
    el.innerHTML = `<div class="wrap"><span>${esc(b.text)}</span>${link ? `<a href="${esc(link)}"${link.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>Подробнее →</a>` : ""}<button type="button" data-bx aria-label="Скрыть">×</button></div>`;
  }
  A.paintBanner = paintBanner;
  VO.on("cfg", paintBanner);

  VO.on("route", head => {
    paintAs(); paintBanner();
    const u = VO.user();
    // заблокированного выводим из аккаунта
    if (u && !sessionStorage.getItem("vo_adm_back")) {
      const ban = A.limits(VO.uid(u.email)).ban;
      if (ban) { S.session = null; store.set("vo_session", null); VO.emit("user"); VO.sheet(`<div class="ban-box"><h3>Аккаунт заблокирован</h3><p>${esc(A.until(ban))[0].toUpperCase() + esc(A.until(ban)).slice(1)}.${ban.reason ? ` Причина: ${esc(ban.reason)}.` : ""}</p><p class="muted">Если это ошибка — напишите нам, разберёмся.</p><a class="btn btn--ink btn--wide" href="#/contact?topic=Проблема с объявлением">Написать в поддержку</a></div>`, { cls: "sheet--sm" }); return; }
      if (u.kick && u.kick > (store.get("vo_login_t", 0))) { delete u.kick; VO.saveUser(u); VO.logout(); return; }
    }
    // техработы: сайт видят только админы
    const m = A.cfg().maint;
    if (m.on && !A.isAdmin() && !["admin", "login"].includes(head)) {
      VO.page("maint", `<div class="wrap"><div class="maint"><span class="maint__ic"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5a4 4 0 0 0-5.2 5.1l-4.8 4.8a1.9 1.9 0 0 0 2.7 2.7l4.8-4.8a4 4 0 0 0 5.1-5.2l-2.4 2.4-2.2-.6-.6-2.2Z"/></svg></span><h1>Технические работы</h1><p>${esc(m.text)}</p><a class="link" href="#/login">Вход для администратора</a></div></div>`);
      VO.show("maint", "Технические работы");
    }
  });
  VO.on("user", () => { const u = VO.user(); if (u && !store.get("vo_login_t", 0)) store.set("vo_login_t", now()); });
})();
