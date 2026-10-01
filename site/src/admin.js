/* =========================================================
   Админ-панель. Две половины:
   «Управление» — люди, объявления, модерация, жалобы, обращения, правила;
   «Сайт» — тексты, категории, логотип, контакты, баннер (в admin-site.js).
   ========================================================= */
(() => {
  const { $, $$, esc, store, state: S } = VO;
  const A = VO.adm;
  const page = VO.page("admin"); page.classList.add("page--bare");
  const UI = VO.admUI = {};
  const SEC = UI.SEC = {};   // реестр разделов: id → { group, name, icon, perm, render, badge }
  let cur = { sec: "dash", id: null };
  const sel = {};            // выделенные строки по разделам
  const q = {};              // поиск и фильтры по разделам
  UI.q = q; UI.sel = sel;

  /* ---------- значки ---------- */
  const I = (d, s = 18) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = UI.IC = {
    dash: '<rect x="3.5" y="3.5" width="7" height="8" rx="2"/><rect x="13.5" y="3.5" width="7" height="5" rx="2"/><rect x="13.5" y="11.5" width="7" height="9" rx="2"/><rect x="3.5" y="14.5" width="7" height="6" rx="2"/>',
    mod: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/><path d="m9 12 2 2 4-4"/>',
    ads: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/>',
    users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 7.8M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    reports: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    tickets: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    chats: '<path d="M4.5 4.5h10a5.5 5.5 0 0 1 0 11H8.5l-4 4Z"/>',
    reviews: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
    mail: '<path d="M3 11 20 4l-4 16-4-7Z"/><path d="m12 13 8-9"/>',
    words: '<path d="M4 6h16M4 12h10M4 18h7"/><path d="m15 15 5 5M20 15l-5 5"/>',
    rules: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    log: '<path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="8.5"/>',
    data: '<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>',
    team: '<path d="M12 3 4 7v4c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V7Z"/><circle cx="12" cy="10" r="2.5"/><path d="M8 16a4 4 0 0 1 8 0"/>',
    texts: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
    visual: '<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
    cats: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><circle cx="17" cy="17" r="3.5"/>',
    brand: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.4 0 2-1 2-2s-.6-1.6-.6-2.6c0-1 .8-1.9 2-1.9h2.1A3.5 3.5 0 0 0 20.5 10 8.5 8.5 0 0 0 12 3.5Z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/>',
    contacts: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    banner: '<path d="M4 9v6h3l6 4V5L7 9Z"/><path d="M17 9a4 4 0 0 1 0 6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  };
  UI.I = I;

  /* ---------- мелочи ---------- */
  const fmtD = t => t ? new Date(t).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
  const fmtDay = t => t ? new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }) : "—";
  UI.fmtD = fmtD; UI.fmtDay = fmtDay;
  const pill = (t, tone = "") => `<span class="apill${tone ? " apill--" + tone : ""}">${t}</span>`;
  UI.pill = pill;
  const ava = (name, color, size = 34) => `<span class="aava" style="--s:${size}px;background:${color || "#16181D"}">${esc((name || "?").trim()[0] || "?").toUpperCase()}</span>`;
  UI.ava = ava;
  const ago = t => VO.timeAgo ? VO.timeAgo(t) : fmtD(t);
  const DUR = [["1 час", 36e5], ["1 день", 864e5], ["3 дня", 3 * 864e5], ["7 дней", 7 * 864e5], ["30 дней", 30 * 864e5], ["Навсегда", 0]];
  UI.toast = (t, ms) => VO.toast(t, ms);

  /* ---------- окна: подтверждение, причина и срок ---------- */
  UI.ask = (title, text, btn = "Подтвердить", danger = false, typed = null) => new Promise(ok => {
    const el = VO.sheet(`<form class="aform" id="askF"><h3>${title}</h3>${text ? `<p class="muted">${text}</p>` : ""}${typed ? `<div class="field"><input id="askT" placeholder=" " autocomplete="off"><label for="askT">Введите «${esc(typed)}» для подтверждения</label></div>` : ""}<div class="aform__a"><button type="button" class="adm-btn adm-btn--ghost" data-sheet-close>Отмена</button><button class="adm-btn${danger ? " adm-btn--danger" : ""}" type="submit">${btn}</button></div></form>`, { cls: "sheet--sm adm-sheet" });
    let done = false;
    $("#askF", el).addEventListener("submit", e => { e.preventDefault(); if (typed && $("#askT", el).value.trim() !== typed) return VO.toast(`Введите «${typed}»`); done = true; VO.closeSheet(true); ok(true); });
    const obs = new MutationObserver(() => { if (!document.body.contains(el)) { obs.disconnect(); if (!done) ok(false); } }); obs.observe(document.body, { childList: true });
  });
  // срок + причина: для блокировок и запретов
  UI.askLimit = (title, reasons, { durations = true, text = "" } = {}) => new Promise(ok => {
    const el = VO.sheet(`<form class="aform" id="limF"><h3>${title}</h3>${text ? `<p class="muted">${text}</p>` : ""}
      ${durations ? `<div class="aform__l">Срок</div><div class="achips">${DUR.map(([n, v], i) => `<label><input type="radio" name="d" value="${v}"${i === 2 ? " checked" : ""}><span>${n}</span></label>`).join("")}</div>` : ""}
      <div class="aform__l">Причина — её увидит пользователь</div><div class="achips achips--col">${reasons.map((r, i) => `<label><input type="radio" name="r" value="${esc(r)}"${i ? "" : " checked"}><span>${esc(r)}</span></label>`).join("")}<label><input type="radio" name="r" value="__own"><span>Своя причина…</span></label></div>
      <div class="field" id="limOwnW" hidden><input id="limOwn" maxlength="200" placeholder=" "><label for="limOwn">Причина своими словами</label></div>
      <div class="aform__a"><button type="button" class="adm-btn adm-btn--ghost" data-sheet-close>Отмена</button><button class="adm-btn adm-btn--danger" type="submit">Применить</button></div></form>`, { cls: "sheet--sm adm-sheet" });
    let done = false;
    el.addEventListener("change", e => { if (e.target.name === "r") $("#limOwnW", el).hidden = e.target.value !== "__own"; });
    $("#limF", el).addEventListener("submit", e => {
      e.preventDefault(); const fd = new FormData(e.target);
      let r = fd.get("r"); if (r === "__own") { r = $("#limOwn", el).value.trim(); if (r.length < 3) return VO.toast("Напишите причину"); }
      const d = +fd.get("d"); done = true; VO.closeSheet(true); ok({ until: durations && d ? Date.now() + d : null, reason: r });
    });
    const obs = new MutationObserver(() => { if (!document.body.contains(el)) { obs.disconnect(); if (!done) ok(null); } }); obs.observe(document.body, { childList: true });
  });
  UI.askText = (title, label, { value = "", templates = [], btn = "Отправить", rows = 4, hint = "" } = {}) => new Promise(ok => {
    const el = VO.sheet(`<form class="aform" id="txtF"><h3>${title}</h3>${hint ? `<p class="muted">${hint}</p>` : ""}${templates.length ? `<div class="achips achips--wrap">${templates.map(t => `<button type="button" data-tpl="${esc(t)}">${esc(t.length > 46 ? t.slice(0, 46) + "…" : t)}</button>`).join("")}</div>` : ""}
      <div class="field field--area"><textarea id="txtT" rows="${rows}" maxlength="2000" placeholder=" ">${esc(value)}</textarea><label for="txtT">${label}</label></div>
      <div class="aform__a"><button type="button" class="adm-btn adm-btn--ghost" data-sheet-close>Отмена</button><button class="adm-btn" type="submit">${btn}</button></div></form>`, { cls: "sheet--sm adm-sheet" });
    let done = false;
    el.addEventListener("click", e => { const t = e.target.closest("[data-tpl]"); if (t) { $("#txtT", el).value = t.dataset.tpl; $("#txtT", el).focus(); } });
    $("#txtF", el).addEventListener("submit", e => { e.preventDefault(); const v = $("#txtT", el).value.trim(); if (v.length < 2) return VO.toast("Напишите текст"); done = true; VO.closeSheet(true); ok(v); });
    const obs = new MutationObserver(() => { if (!document.body.contains(el)) { obs.disconnect(); if (!done) ok(null); } }); obs.observe(document.body, { childList: true });
  });

  /* ---------- боковая панель (карточка объекта) ---------- */
  UI.drawer = (html, cls = "") => {
    let d = $("#admDrawer"); if (!d) return;
    d.className = "adm__drawer is-on " + cls;
    d.innerHTML = `<div class="adm__dback" data-a="dclose"></div><div class="adm__dbox"><button class="adm__dx" type="button" data-a="dclose" aria-label="Закрыть">${I(IC.x, 18)}</button>${html}</div>`;
    return d;
  };
  UI.closeDrawer = () => { const d = $("#admDrawer"); if (d) { d.classList.remove("is-on"); d.innerHTML = ""; } if (cur.id) { cur.id = null; history.replaceState(null, "", `#/admin/${cur.sec}`); } };
  UI.drawerOpen = () => { const d = $("#admDrawer"); return d && d.classList.contains("is-on"); };

  /* ---------- таблица с выделением ---------- */
  // cols: [[заголовок, (row) => html, класс]]
  UI.table = (sec, rows, cols, { empty = "Ничего не найдено", key = r => r.id, open = true } = {}) => {
    const s = sel[sec] || (sel[sec] = new Set());
    [...s].forEach(id => { if (!rows.some(r => key(r) === id)) s.delete(id); });
    const allOn = rows.length && rows.every(r => s.has(key(r)));
    const lim = q[sec + ":lim"] || 60;
    return rows.length ? `<div class="atable-w"><table class="atable"><thead><tr><th class="atable__c"><label class="acheck"><input type="checkbox" data-a="selall" data-sec="${sec}"${allOn ? " checked" : ""}><i></i></label></th>${cols.map(c => `<th class="${c[2] || ""}">${c[0]}</th>`).join("")}</tr></thead>
      <tbody>${rows.slice(0, lim).map(r => `<tr class="${s.has(key(r)) ? "is-sel" : ""}" ${open ? `data-a="open" data-id="${esc(key(r))}"` : ""}><td class="atable__c"><label class="acheck" data-stop><input type="checkbox" data-a="sel" data-sec="${sec}" data-id="${esc(key(r))}"${s.has(key(r)) ? " checked" : ""}><i></i></label></td>${cols.map(c => `<td class="${c[2] || ""}">${c[1](r)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      ${rows.length > lim ? `<button class="adm-btn adm-btn--ghost adm-more" type="button" data-a="more" data-sec="${sec}">Показать ещё ${Math.min(60, rows.length - lim)} из ${rows.length - lim}</button>` : ""}`
      : `<div class="aempty"><b>${empty}</b><span>Попробуйте изменить поиск или фильтры</span></div>`;
  };
  UI.bulk = (sec, actions) => { const n = (sel[sec] || new Set()).size; return `<div class="abulk${n ? " is-on" : ""}"><b>Выбрано: ${n}</b>${actions.map(([a, t, tone]) => `<button type="button" class="adm-btn adm-btn--sm${tone ? " adm-btn--" + tone : " adm-btn--ghost"}" data-a="${a}">${t}</button>`).join("")}<button type="button" class="adm-btn adm-btn--sm adm-btn--text" data-a="selnone" data-sec="${sec}">Снять выделение</button></div>`; };
  UI.selected = sec => [...(sel[sec] || [])];
  UI.tools = (sec, placeholder, filters = []) => `<div class="atools"><label class="asearch">${I(IC.search, 16)}<input type="search" data-q="${sec}" value="${esc(q[sec] || "")}" placeholder="${placeholder}" maxlength="80"></label>${filters.map(([k, opts]) => `<select data-f="${sec}:${k}">${opts.map(([v, n]) => `<option value="${v}"${(q[sec + ":" + k] || "") === v ? " selected" : ""}>${n}</option>`).join("")}</select>`).join("")}</div>`;
  UI.f = (sec, k) => q[sec + ":" + k] || "";
  UI.match = (sec, str) => { const v = (q[sec] || "").toLowerCase().trim(); return !v || String(str).toLowerCase().replace(/ё/g, "е").includes(v.replace(/ё/g, "е")); };

  /* ---------- данные ---------- */
  const D = UI.D = {};
  D.ads = () => A.allAds().filter(a => !(a.adm && a.adm.purged));
  D.ad = id => D.ads().find(a => a.id === id);
  D.status = a => {
    const m = a.adm || {}, o = A.ownerId(a);
    if (m.deleted) return ["deleted", "В корзине", "gray"];
    if (m.state === "blocked" && A.live(m)) return ["blocked", "Заблокировано", "red"];
    if (m.state === "hidden" && A.live(m)) return ["hidden", "Скрыто", "gray"];
    if (a.mod === "pending") return ["pending", "На проверке", "yellow"];
    if (a.mod === "rejected") return ["rejected", "Отклонено", "red"];
    if (o && A.isBanned(o)) return ["ownerban", "Автор заблокирован", "red"];
    if (a.status === "sold") return ["sold", "Продано", "blue"];
    if (a.status === "archived") return ["archived", "Снято автором", "gray"];
    return ["active", "Активно", "green"];
  };
  D.flag = a => { const G = VO.guard; if (!G || (a.adm && a.adm.reviewed)) return null; return G.text(a.title || "", "title") || (a.desc ? G.text(a.desc, "desc") : null); };
  D.users = () => {
    const acc = Object.values(S.accounts).map(a => ({ id: VO.uid(a.email), kind: "account", email: a.email, name: a.name || "Без имени", acc: a, created: a.created, city: a.city || "", type: a.type || "person", company: a.company || "", color: a.color }));
    const sel = Object.entries(window.VO_SELLERS).map(([id, s]) => ({ id, kind: "seller", email: "", name: s.name, created: Date.UTC(s.since || 2025, 2, 1), city: s.city || "", type: s.company ? "company" : "person", company: s.company ? s.name : "", color: "#2F7DE1" }));
    const dem = Object.entries(window.VO_DEMO_BUYERS || {}).map(([id, s]) => ({ id, kind: "demo", email: "", name: s.name, created: Date.UTC(2026, 0, 1), city: s.city || "", type: "person", company: "", color: "#8A5CF6" }));
    return [...acc, ...sel, ...dem];
  };
  D.user = id => D.users().find(u => u.id === id);
  D.userAds = id => D.ads().filter(a => A.ownerId(a) === id);
  D.reports = () => store.get("vo_reports", []).map(r => ({ ...r, id: r.id || "rp" + r.t, st: (store.get("vo_adm_rep", {})[r.id || "rp" + r.t]) || "new" }));
  D.setRep = (id, st) => { const m = store.get("vo_adm_rep", {}); m[id] = st; store.set("vo_adm_rep", m); };
  D.tickets = () => store.get("vo_tickets", []);
  D.saveTickets = l => store.set("vo_tickets", l);
  D.modQueue = () => {
    const reported = new Set(D.reports().filter(r => r.ad && r.st === "new").map(r => r.ad));
    return D.ads().filter(a => !(a.adm && a.adm.deleted)).map(a => ({ a, why: a.mod === "pending" ? "pending" : reported.has(a.id) && !(a.adm && a.adm.reviewed) ? "report" : D.flag(a) ? "flag" : null })).filter(x => x.why);
  };
  D.counts = () => ({ mod: D.modQueue().length, reports: D.reports().filter(r => r.st === "new").length, tickets: D.tickets().filter(t => t.status !== "answered" && t.status !== "closed").length });
  D.kindName = u => u.kind === "seller" ? "тестовый продавец" : u.kind === "demo" ? "демо-покупатель" : "";

  /* ---------- каркас ---------- */
  const GROUPS = [["manage", "Управление"], ["site", "Сайт"]];
  function shell() {
    const u = VO.user(), role = A.me(), sec = SEC[cur.sec], g = sec.group, cnt = D.counts();
    const items = Object.entries(SEC).filter(([, s]) => s.group === g && (!s.perm || A.can(s.perm)));
    page.innerHTML = `<div class="adm" data-group="${g}">
      <aside class="adm__side" id="admSide">
        <a class="adm__brand" href="#/admin"><span class="adm__logo"><svg viewBox="0 0 150 214" width="15"><g transform="translate(20 4)" stroke-linejoin="round" stroke-width="10"><path d="M5 5H78A38 38 0 0 1 78 81H5Z" fill="#FF4F3A" stroke="#FF4F3A"/><path d="M5 97H84A44 44 0 0 1 84 185H30L5 207Z" fill="#fff" stroke="#fff"/></g></svg></span><span><b>Все объявления</b><small>Панель управления</small></span></a>
        <div class="adm__switch" role="tablist">${GROUPS.filter(([k]) => k === "manage" ? A.can("manage") || A.can("support") : A.can("site")).map(([k, n]) => `<button type="button" role="tab" data-a="group" data-g="${k}" aria-selected="${g === k}">${n}</button>`).join("")}</div>
        <nav class="adm__nav">${items.map(([id, s]) => { const b = s.badge ? s.badge(cnt) : 0; return `${s.sep ? `<span class="adm__sep">${s.sep}</span>` : ""}<a href="#/admin/${id}" class="${id === cur.sec ? "is-on" : ""}">${I(IC[s.icon || id] || IC.dash)}<span>${s.name}</span>${b ? `<em>${b > 99 ? "99+" : b}</em>` : ""}</a>`; }).join("")}</nav>
        <div class="adm__me">${ava(u.name || u.email, "#FF4F3A", 32)}<span><b>${esc(u.name || u.email)}</b><small>${A.ROLES[role] || ""}${VO.DEMO && sessionStorage.getItem("vo_adm_demo") === u.email ? " · демо" : ""}</small></span><a href="#/" class="adm__out" title="На сайт">${I(IC.ext, 16)}</a></div>
      </aside>
      <div class="adm__scrim" data-a="side"></div>
      <main class="adm__main">
        <header class="adm__top"><button class="adm__burger" type="button" data-a="side" aria-label="Меню"><i></i><i></i><i></i></button>
          <div class="adm__ttl"><small>${GROUPS.find(x => x[0] === g)[1]}</small><h1>${sec.name}</h1></div>
          <button class="adm__k" type="button" data-a="cmdk">${I(IC.search, 16)}<span>Поиск и команды</span><kbd>Ctrl K</kbd></button>
          <a class="adm-btn adm-btn--ghost adm-btn--sm adm__site" href="#/" target="_blank" rel="noopener">${I(IC.ext, 15)}<span>Открыть сайт</span></a></header>
        <div class="adm__body" id="admBody"></div>
      </main>
      <div class="adm__drawer" id="admDrawer"></div>
    </div>`;
  }
  UI.render = () => {
    const sec = SEC[cur.sec]; const body = $("#admBody"); if (!body || !sec) return;
    const y = body.scrollTop; body.innerHTML = sec.render(); body.scrollTop = y;
    if (sec.after) sec.after(body);
    // бейджи в меню
    const cnt = D.counts(); $$(".adm__nav a", page).forEach(a => { const id = a.getAttribute("href").split("/").pop(), s = SEC[id], b = s && s.badge ? s.badge(cnt) : 0; let em = a.querySelector("em"); if (b) { if (!em) { em = document.createElement("em"); a.appendChild(em); } em.textContent = b > 99 ? "99+" : b; } else if (em) em.remove(); });
  };
  UI.go = (sec, id) => { location.hash = `#/admin/${sec}${id ? "/" + encodeURIComponent(id) : ""}`; };

  /* ---------- вход в админку ---------- */
  function gate() {
    const u = VO.user();
    page.innerHTML = `<div class="adm-gate"><div class="adm-gate__card"><span class="adm-gate__ic">${I(IC.team, 30)}</span><h1>Панель управления</h1>
      <p>Доступна только команде сайта: владельцу, администраторам и модераторам. Ваш аккаунт <b>${esc(u.email)}</b> в команду не добавлен.</p>
      ${VO.DEMO ? `<div class="adm-gate__demo"><b>Демо-режим</b><span>Пока нет сервера, админку можно открыть на этом устройстве, чтобы всё попробовать. Владелец входит со своей почтой из контактов автоматически.</span><button class="adm-btn" type="button" data-a="demo">Открыть админку в демо-режиме</button></div>` : ""}
      <a class="adm-btn adm-btn--ghost" href="#/">Вернуться на сайт</a></div></div>`;
  }

  /* ---------- маршрут ---------- */
  VO.routes.admin = parts => {
    const u = VO.user();
    if (!u) return VO.needLogin(location.hash, "Войдите, чтобы открыть панель управления");
    document.documentElement.classList.add("adm-on");
    if (!A.isAdmin()) { gate(); VO.show("admin", "Панель управления"); return; }
    let sec = parts[1] || (A.can("manage") ? "dash" : A.can("support") ? "tickets" : "texts");
    if (!SEC[sec] || (SEC[sec].perm && !A.can(SEC[sec].perm))) sec = A.can("manage") ? "dash" : "texts";
    const same = cur.sec === sec && $("#admBody");
    cur = { sec, id: parts[2] || null };
    if (!same || !$(".adm", page)) shell();
    UI.render();
    VO.show("admin", SEC[sec].name + " · Панель управления");
    if (cur.id && SEC[sec].open) SEC[sec].open(cur.id); else if (UI.drawerOpen()) { const d = $("#admDrawer"); d.classList.remove("is-on"); d.innerHTML = ""; }
    $("#admSide") && $("#admSide").classList.remove("is-open");
  };
  VO.on("route", h => { if (h !== "admin") document.documentElement.classList.remove("adm-on"); });
  // живые данные: новая жалоба или обращение — бейджи обновятся
  ["mine", "chats", "reviews", "adm-users"].forEach(ev => VO.on(ev, () => { if (VO.current() === "admin" && $("#admBody") && !document.querySelector(".sheet") && !UI.drawerOpen() && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) UI.render(); }));

  /* ---------- общие обработчики ---------- */
  const ACT = UI.ACT = {};
  page.addEventListener("click", e => {
    if (e.target.closest("[data-stop]") && !e.target.closest("input")) return;
    const el = e.target.closest("[data-a]"); if (!el || !page.contains(el)) return;
    const a = el.dataset.a;
    if (a === "open") { if (e.target.closest("button, a, input, label")) return; const s = SEC[cur.sec]; if (s.open) { cur.id = el.dataset.id; history.replaceState(null, "", `#/admin/${cur.sec}/${encodeURIComponent(el.dataset.id)}`); s.open(el.dataset.id); } return; }
    if (ACT[a]) { e.preventDefault(); ACT[a](el, e); }
  });
  page.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.a === "sel") { const s = sel[t.dataset.sec] || (sel[t.dataset.sec] = new Set()); t.checked ? s.add(t.dataset.id) : s.delete(t.dataset.id); return UI.render(); }
    if (t.dataset.a === "selall") { const s = sel[t.dataset.sec] || (sel[t.dataset.sec] = new Set()); const ids = $$(`[data-a="sel"][data-sec="${t.dataset.sec}"]`, page).map(x => x.dataset.id); ids.forEach(id => t.checked ? s.add(id) : s.delete(id)); return UI.render(); }
    if (t.dataset.f) { q[t.dataset.f] = t.value; return UI.render(); }
    const s = SEC[cur.sec]; if (s.change) s.change(t, e);
  });
  let qt = 0;
  page.addEventListener("input", e => {
    const t = e.target;
    if (t.dataset.q) { q[t.dataset.q] = t.value; clearTimeout(qt); qt = setTimeout(() => { const pos = t.selectionStart; UI.render(); const i = $(`[data-q="${t.dataset.q}"]`, page); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }, 160); return; }
    const s = SEC[cur.sec]; if (s.input) s.input(t, e);
  });
  ACT.dclose = () => UI.closeDrawer();
  ACT.side = () => $("#admSide").classList.toggle("is-open");
  ACT.group = el => { const g = el.dataset.g, first = Object.entries(SEC).find(([, s]) => s.group === g && (!s.perm || A.can(s.perm))); if (first) UI.go(first[0]); };
  ACT.selnone = el => { (sel[el.dataset.sec] || new Set()).clear(); UI.render(); };
  ACT.more = el => { q[el.dataset.sec + ":lim"] = (q[el.dataset.sec + ":lim"] || 60) + 60; UI.render(); };
  ACT.demo = () => { sessionStorage.setItem("vo_adm_demo", VO.user().email); A.log("Открыта админка в демо-режиме", VO.user().email); VO.rerender(); };
  addEventListener("keydown", e => {
    if (VO.current() !== "admin" || !A.isAdmin()) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); cmdk(); return; }
    if (e.key === "Escape" && UI.drawerOpen() && !document.querySelector(".sheet")) UI.closeDrawer();
    const s = SEC[cur.sec]; if (s.key && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.querySelector(".sheet")) s.key(e);
  });

  /* ---------- поиск и команды (Ctrl+K) ---------- */
  function cmdk() {
    const el = VO.sheet(`<div class="cmdk"><label class="cmdk__in">${I(IC.search, 18)}<input id="cmdkQ" placeholder="Раздел, пользователь, объявление или команда" autocomplete="off" maxlength="80"></label><div class="cmdk__l" id="cmdkL"></div><div class="cmdk__f"><span><kbd>↑</kbd><kbd>↓</kbd> выбрать</span><span><kbd>Enter</kbd> открыть</span><span><kbd>Esc</kbd> закрыть</span></div></div>`, { cls: "sheet--cmdk" });
    const inp = $("#cmdkQ", el), L = $("#cmdkL", el); let k = 0, res = [];
    const CMDS = [["Открыть визуальный редактор сайта", () => { VO.editor.start(); location.hash = "#/"; }, "site"], ["Включить техработы", () => { A.setCfg({ maint: { ...A.cfg().maint, on: true } }); A.log("Включены техработы"); VO.toast("Техработы включены — сайт видят только админы"); }, "rules"], ["Выключить техработы", () => { A.setCfg({ maint: { ...A.cfg().maint, on: false } }); A.log("Выключены техработы"); VO.toast("Сайт снова открыт"); }, "rules"], ["Скачать резервную копию", () => UI.ACT.backup && UI.ACT.backup(), "data"]];
    const paint = () => {
      const v = inp.value.toLowerCase().trim();
      const secs = Object.entries(SEC).filter(([, s]) => (!s.perm || A.can(s.perm)) && (!v || s.name.toLowerCase().includes(v))).map(([id, s]) => ({ t: s.name, s: s.group === "site" ? "Сайт" : "Управление", i: IC[s.icon || id], go: () => UI.go(id) }));
      const users = v.length > 1 ? D.users().filter(u => (u.name + " " + u.email).toLowerCase().includes(v)).slice(0, 5).map(u => ({ t: u.name, s: u.email || D.kindName(u), i: IC.users, go: () => UI.go("users", u.id) })) : [];
      const ads = v.length > 1 ? D.ads().filter(a => (a.title + " " + a.id).toLowerCase().includes(v)).slice(0, 5).map(a => ({ t: a.title, s: VO.rub ? (a.price ? VO.rub(a.price) : "Даром") : "", i: IC.ads, go: () => UI.go("ads", a.id) })) : [];
      const cmds = CMDS.filter(c => A.can(c[2]) && (!v || c[0].toLowerCase().includes(v))).map(c => ({ t: c[0], s: "Команда", i: IC.visual, go: c[1] }));
      res = [...secs, ...users, ...ads, ...cmds].slice(0, 14); k = Math.min(k, res.length - 1); if (k < 0) k = 0;
      L.innerHTML = res.length ? res.map((r, i) => `<button type="button" class="${i === k ? "on" : ""}" data-k="${i}">${I(r.i, 16)}<b>${esc(r.t)}</b><small>${esc(r.s)}</small></button>`).join("") : `<div class="cmdk__none">Ничего не нашлось</div>`;
    };
    const run = i => { const r = res[i]; if (!r) return; VO.closeSheet(true); r.go(); };
    inp.addEventListener("input", () => { k = 0; paint(); });
    inp.addEventListener("keydown", e => { if (e.key === "ArrowDown") { k = Math.min(res.length - 1, k + 1); paint(); e.preventDefault(); } if (e.key === "ArrowUp") { k = Math.max(0, k - 1); paint(); e.preventDefault(); } if (e.key === "Enter") run(k); });
    L.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) run(+b.dataset.k); });
    paint(); setTimeout(() => inp.focus(), 50);
  }
  ACT.cmdk = cmdk;

  /* ---------- небольшие графики ---------- */
  // Столбики по дням: подпись дня внизу, значение — в подсказке при наведении
  UI.bars = (vals, labels, unit) => {
    const max = Math.max(1, ...vals), W = 100 / vals.length;
    return `<div class="abars" role="img" aria-label="${esc(unit)} по дням">${vals.map((v, i) => `<div class="abars__c" style="width:${W}%" data-tip="${esc(labels[i])}: ${v} ${esc(unit)}"><i style="height:${Math.max(v ? 4 : 0, v / max * 100)}%"></i><small>${i % Math.ceil(vals.length / 7) === 0 || i === vals.length - 1 ? esc(labels[i].split(" ")[0]) : ""}</small></div>`).join("")}</div><div class="abars__axis"><span>0</span><span>${max}</span></div>`;
  };
  UI.hbars = rows => { const max = Math.max(1, ...rows.map(r => r[1])); return `<div class="ahbars">${rows.map(([n, v]) => `<div class="ahbars__r"><span>${esc(n)}</span><div><i style="width:${v / max * 100}%"></i></div><b>${v}</b></div>`).join("")}</div>`; };
  const days = n => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (n - 1 - i)); return d; });
  UI.days = days;

  /* =========================================================
     РАЗДЕЛЫ «УПРАВЛЕНИЕ»
     ========================================================= */

  /* ---------- Обзор ---------- */
  SEC.dash = { group: "manage", name: "Обзор", perm: "manage", render() {
    const ads = D.ads(), live = ads.filter(a => (a.status || "active") === "active" && A.visible(a)), users = D.users().filter(u => u.kind === "account"), cnt = D.counts();
    const dd = days(14), lbl = dd.map(d => d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }));
    const created = a => a.first || a.created || (Date.now() - (a.ago || 0) * 6e4);
    const adsBy = dd.map(d => ads.filter(a => { const t = created(a); return t >= +d && t < +d + 864e5; }).length);
    const usrBy = dd.map(d => users.filter(u => u.created >= +d && u.created < +d + 864e5).length);
    const byCat = VO.CATS.map(c => [c.name, live.filter(a => a.cat === c.id).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1]).slice(0, 7);
    const byCity = Object.entries(live.reduce((m, a) => (m[a.city] = (m[a.city] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const deals = (VO.chats ? VO.chats.all() : []).filter(c => c.deal);
    const h = new Date().getHours(), hi = h < 6 ? "Доброй ночи" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер";
    const used = (() => { let n = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); n += (k.length + (localStorage.getItem(k) || "").length) * 2; } } catch (e) {} return n; })();
    const K = [["Активных объявлений", live.length, "ads"], ["Новых за сутки", ads.filter(a => Date.now() - created(a) < 864e5).length, "ads"], ["Пользователей", users.length, "users"], ["Сделок завершено", deals.filter(c => c.deal.stage === "done").length, "chats"]];
    const todo = [["mod", "Ждут проверки", cnt.mod, "Объявления на модерации, с жалобами и с подозрительным текстом"], ["reports", "Новые жалобы", cnt.reports, "Пользователи сообщили о нарушениях"], ["tickets", "Обращения без ответа", cnt.tickets, "Вопросы из формы «Написать нам»"]];
    return `<section class="adash__hi"><div><h2>${hi}, ${esc((VO.user().name || "").split(" ")[0] || "команда")}!</h2><p>${new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}. ${cnt.mod + cnt.reports + cnt.tickets ? `Есть дела: ${cnt.mod + cnt.reports + cnt.tickets}.` : "Всё разобрано — можно выпить чаю."}</p></div>${A.cfg().maint.on ? `<a class="adash__maint" href="#/admin/banner">Включены техработы — сайт закрыт для посетителей</a>` : ""}</section>
      <section class="akpis">${K.map(([n, v, l]) => `<a class="akpi" href="#/admin/${l}"><small>${n}</small><b>${v}</b></a>`).join("")}</section>
      <section class="atodo">${todo.map(([l, n, v, d]) => `<a class="atodo__i${v ? " is-hot" : ""}" href="#/admin/${l}"><b>${v}</b><span><strong>${n}</strong><small>${d}</small></span>${I('<path d="m9 6 6 6-6 6"/>', 16)}</a>`).join("")}</section>
      <section class="agrid2"><div class="acard"><div class="acard__h"><h3>Новые объявления</h3><small>14 дней</small></div>${UI.bars(adsBy, lbl, "объявл.")}</div>
        <div class="acard"><div class="acard__h"><h3>Регистрации</h3><small>14 дней</small></div>${UI.bars(usrBy, lbl, "чел.")}</div></section>
      <section class="agrid3"><div class="acard"><div class="acard__h"><h3>Категории</h3><small>активные объявления</small></div>${byCat.length ? UI.hbars(byCat) : '<p class="muted">Пока пусто</p>'}</div>
        <div class="acard"><div class="acard__h"><h3>Города</h3></div>${byCity.length ? UI.hbars(byCity) : '<p class="muted">Пока пусто</p>'}</div>
        <div class="acard"><div class="acard__h"><h3>Последние действия</h3><a href="#/admin/log">Журнал</a></div><ul class="afeed">${A.logs().slice(0, 7).map(l => `<li><b>${esc(l.act)}</b><span>${esc(l.target)}</span><small>${ago(l.t)} · ${esc(l.who)}</small></li>`).join("") || '<li class="muted">Действий пока не было</li>'}</ul></div></section>
      <section class="acard"><div class="acard__h"><h3>Хранилище браузера</h3><small>${used < 1048576 ? Math.max(1, Math.round(used / 1024)) + " КБ" : (used / 1048576).toFixed(1) + " МБ"} из ~5 МБ</small></div><div class="ameter"><i style="width:${Math.min(100, used / 5242880 * 100)}%"></i></div><p class="muted">Пока нет сервера, всё хранится в этом браузере. Фото занимают больше всего места. <a href="#/admin/data">Подробнее</a></p></section>`;
  } };

  /* ---------- Модерация ---------- */
  let modI = 0;
  const WHY = { pending: ["На проверке", "yellow"], report: ["Есть жалоба", "red"], flag: ["Подозрительный текст", "yellow"] };
  const REJECT = ["Запрещённый товар или услуга", "Контакты или ссылки в тексте", "Грубые слова или оскорбления", "Неверная категория", "Недостоверная цена или описание", "Чужие фото", "Повтор объявления", "Мошенничество"];
  SEC.mod = { group: "manage", name: "Модерация", perm: "manage", badge: c => c.mod, render() {
    const L = D.modQueue(); if (modI >= L.length) modI = Math.max(0, L.length - 1);
    if (!L.length) return `<div class="aempty aempty--big">${I(IC.mod, 40)}<b>Очередь пуста</b><span>Новые объявления, жалобы и подозрительные тексты появятся здесь. Включить проверку каждого объявления можно в <a href="#/admin/rules">Правилах сайта</a>.</span></div>`;
    const { a, why } = L[modI], o = D.user(A.ownerId(a)) || { name: "Неизвестно" }, r = A.u(A.ownerId(a)), flag = D.flag(a), reps = D.reports().filter(x => x.ad === a.id);
    const phs = a.photos && a.photos.length ? a.photos : a.photo ? [a.photo] : [];
    return `<div class="amod">
      <aside class="amod__list">${L.map((x, i) => `<button type="button" class="${i === modI ? "on" : ""}" data-a="modpick" data-i="${i}"><span class="amod__th" style="background:${x.a.bg}">${x.a.photo ? `<img src="${x.a.photo}" alt="">` : window.VO_ILL[x.a.ill] || ""}</span><span><b>${esc(x.a.title)}</b><small>${pill(WHY[x.why][0], WHY[x.why][1])}</small></span></button>`).join("")}</aside>
      <section class="amod__card"><div class="amod__top"><span>${modI + 1} из ${L.length}</span>${pill(WHY[why][0], WHY[why][1])}<a href="#/ad/${a.id}" target="_blank" rel="noopener" class="adm-btn adm-btn--ghost adm-btn--sm">${I(IC.ext, 14)}На сайте</a></div>
        <div class="amod__ph">${phs.length ? phs.slice(0, 4).map(p => `<img src="${p}" alt="">`).join("") : `<div class="amod__ill" style="background:${a.bg}">${window.VO_ILL[a.ill] || ""}</div>`}</div>
        <h2>${esc(a.title)}</h2><div class="amod__price">${a.price ? VO.rub(a.price) : a.price === 0 ? "Даром" : "Цена не указана"} · ${esc(VO.catName(a.cat))} · ${esc(a.city)}</div>
        ${flag ? `<div class="amod__flag"><b>Автопроверка:</b> ${esc(flag)}</div>` : ""}
        ${reps.length ? `<div class="amod__reps"><b>Жалобы (${reps.length}):</b>${reps.map(x => `<span>${esc(x.reason)}${x.text ? " — «" + esc(x.text) + "»" : ""}</span>`).join("")}</div>` : ""}
        <p class="amod__desc">${esc(a.desc || "Без описания")}</p>
        <div class="amod__who">${ava(o.name, o.color)}<span><b>${esc(o.name)}</b><small>${esc(o.email || D.kindName(o))}${(r.warns || []).length ? ` · предупреждений: ${r.warns.length}` : ""}</small></span><button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="gouser" data-id="${esc(A.ownerId(a))}">Профиль</button></div>
        <div class="amod__acts"><button type="button" class="adm-btn adm-btn--ok" data-a="modok">Одобрить <kbd>A</kbd></button><button type="button" class="adm-btn adm-btn--danger" data-a="modno">Отклонить <kbd>R</kbd></button><button type="button" class="adm-btn adm-btn--ghost" data-a="modedit">Изменить <kbd>E</kbd></button><button type="button" class="adm-btn adm-btn--ghost" data-a="modban">Заблокировать автора <kbd>B</kbd></button><button type="button" class="adm-btn adm-btn--text" data-a="modskip">Пропустить <kbd>J</kbd></button></div></section></div>`;
  }, key(e) { const m = { a: "modok", r: "modno", e: "modedit", b: "modban", j: "modskip", k: "modprev" }[e.key.toLowerCase()]; if (m && ACT[m]) { e.preventDefault(); ACT[m](); } } };
  const modCur = () => D.modQueue()[modI];
  ACT.modpick = el => { modI = +el.dataset.i; UI.render(); };
  ACT.modskip = () => { modI = (modI + 1) % Math.max(1, D.modQueue().length); UI.render(); };
  ACT.modprev = () => { modI = Math.max(0, modI - 1); UI.render(); };
  ACT.modok = () => { const x = modCur(); if (!x) return; const a = x.a; A.setAd(a.id, a.mod ? { mod: "ok" } : {}, { reviewed: true }); D.reports().filter(r => r.ad === a.id && r.st === "new").forEach(r => D.setRep(r.id, "rejected")); if (a.owner && a.mod === "pending") A.notify(a.owner, "Объявление опубликовано", `«${a.title}» прошло проверку и уже в ленте`, "#/ad/" + a.id); A.log("Объявление одобрено", a.title); VO.toast("Одобрено", 1200); UI.render(); };
  ACT.modno = async () => { const x = modCur(); if (!x) return; const a = x.a; const r = await UI.askLimit("Отклонить объявление", REJECT, { durations: false, text: "Объявление скроется из ленты, автор получит уведомление с причиной." }); if (!r) return; if (a.owner) A.setAd(a.id, { mod: "rejected" }, { reason: r.reason, reviewed: true }); else A.setAd(a.id, {}, { state: "hidden", reason: r.reason, until: null, reviewed: true }); D.reports().filter(rp => rp.ad === a.id && rp.st === "new").forEach(rp => D.setRep(rp.id, "done")); if (a.owner) A.notify(a.owner, "Объявление отклонено", `«${a.title}»: ${r.reason}. Исправьте и сохраните — проверим снова.`, "#/post?edit=" + a.id); A.log("Объявление отклонено", a.title, r.reason); UI.render(); };
  ACT.modedit = () => { const x = modCur(); if (x) { UI.go("ads", x.a.id); } };
  ACT.modban = () => { const x = modCur(); if (x) userLimit([A.ownerId(x.a)], "ban"); };
  ACT.gouser = el => UI.go("users", el.dataset.id);

  /* ---------- Объявления ---------- */
  const ADS_BULK = [["adhide", "Скрыть"], ["adshow", "Показать"], ["adblock", "Заблокировать…", "danger"], ["adbump", "Поднять"], ["adpin", "Закрепить"], ["addemote", "Опустить"], ["adfeat", "Выделить"], ["adcat", "Сменить категорию…"], ["addel", "В корзину", "danger"], ["adrestore", "Восстановить"]];
  SEC.ads = { group: "manage", name: "Объявления", perm: "manage", render() {
    const st = UI.f("ads", "st"), cat = UI.f("ads", "cat"), sort = UI.f("ads", "sort") || "new";
    let L = D.ads().filter(a => UI.match("ads", `${a.title} ${a.id} ${a.city} ${(D.user(A.ownerId(a)) || {}).name || ""} ${a.owner || ""}`));
    L = L.filter(a => { const s = D.status(a)[0]; return st ? s === st : s !== "deleted"; }).filter(a => !cat || a.cat === cat);
    const cr = a => a.created || (Date.now() - (a.ago || 0) * 6e4);
    L.sort(sort === "cheap" ? (a, b) => (a.price || 0) - (b.price || 0) : sort === "dear" ? (a, b) => (b.price || 0) - (a.price || 0) : sort === "views" ? (a, b) => VO.views(b) - VO.views(a) : (a, b) => cr(b) - cr(a));
    const ST = [["", "Все, кроме корзины"], ["active", "Активные"], ["pending", "На проверке"], ["hidden", "Скрытые"], ["blocked", "Заблокированные"], ["rejected", "Отклонённые"], ["sold", "Проданные"], ["archived", "Снятые автором"], ["ownerban", "Автор заблокирован"], ["deleted", "Корзина"]];
    return `<div class="ahead"><p class="muted">Всего: ${D.ads().length}. Нажмите на строку — откроется карточка с редактированием, продвижением и историей.</p><button class="adm-btn" type="button" data-a="adnew">+ Добавить объявление</button></div>
      ${UI.tools("ads", "Название, номер, город или автор", [["st", ST], ["cat", [["", "Все категории"], ...VO.CATS.map(c => [c.id, c.name])]], ["sort", [["new", "Сначала новые"], ["cheap", "Дешевле"], ["dear", "Дороже"], ["views", "Популярные"]]]])}
      ${UI.bulk("ads", ADS_BULK)}
      ${UI.table("ads", L, [
        ["Объявление", a => `<div class="acell-ad"><span class="amod__th" style="background:${a.bg}">${a.photo ? `<img src="${a.photo}" alt="">` : window.VO_ILL[a.ill] || ""}</span><span><b>${esc(a.title)}</b><small>№ ${esc(a.id)}${a.adm && a.adm.featured ? " · ⭐ выделено" : ""}${a.adm && a.adm.rank > 0 ? " · 📌 закреплено" : a.adm && a.adm.rank < 0 ? " · ↓ опущено" : ""}</small></span></div>`, "w-wide"],
        ["Цена", a => a.price ? VO.rub(a.price) : a.price === 0 ? "Даром" : "—", "nw"],
        ["Категория", a => esc(VO.catName(a.cat) || "—"), "hide-m"],
        ["Автор", a => { const u = D.user(A.ownerId(a)); return u ? esc(u.name) : "—"; }, "hide-m"],
        ["Город", a => esc(a.city || ""), "hide-m"],
        ["Статус", a => { const s = D.status(a); return pill(s[1], s[2]); }],
        ["Просм.", a => VO.views(a), "num hide-m"],
      ])}`;
  }, open: id => adDrawer(id) };
  const adIds = () => UI.selected("ads");
  const bulkAd = (ids, patch, meta, msg, logAct) => { ids.forEach(id => { A.setAd(id, patch, meta); A.log(logAct, (D.ad(id) || {}).title || id); }); sel.ads && sel.ads.clear(); VO.toast(msg, 1600); UI.render(); };
  ACT.adhide = () => bulkAd(adIds(), {}, { state: "hidden", until: null }, "Скрыто из ленты", "Объявление скрыто");
  ACT.adshow = () => bulkAd(adIds(), {}, { state: null, until: null, reason: null, deleted: null }, "Снова в ленте", "Объявление показано");
  ACT.adbump = () => bulkAd(adIds(), {}, { bump: Date.now() }, "Подняты наверх ленты", "Объявление поднято");
  ACT.adpin = () => bulkAd(adIds(), {}, { rank: 1 }, "Закреплены вверху", "Объявление закреплено");
  ACT.addemote = () => bulkAd(adIds(), {}, { rank: -1 }, "Опущены вниз выдачи", "Объявление опущено");
  ACT.adfeat = () => bulkAd(adIds(), {}, { featured: true }, "Выделены цветом", "Объявление выделено");
  ACT.adrestore = () => bulkAd(adIds(), {}, { deleted: null }, "Восстановлены", "Объявление восстановлено");
  ACT.addel = async () => { const ids = adIds(); if (!ids.length) return; if (!await UI.ask(`В корзину: ${ids.length}`, "Объявления пропадут с сайта. Их можно восстановить из корзины.", "В корзину", true)) return; bulkAd(ids, {}, { deleted: true }, "Перемещены в корзину", "Объявление удалено"); };
  ACT.adblock = async () => { const ids = adIds(); if (!ids.length) return; const r = await UI.askLimit(`Заблокировать: ${ids.length}`, REJECT, { text: "Объявления пропадут из ленты на выбранный срок. Авторы получат уведомление." }); if (!r) return; ids.forEach(id => { const a = D.ad(id); if (a && a.owner) A.notify(a.owner, "Объявление заблокировано", `«${a.title}» ${A.until(r)}. Причина: ${r.reason}`, "#/me/ads"); }); bulkAd(ids, {}, { state: "blocked", until: r.until, reason: r.reason }, "Заблокированы", "Объявление заблокировано"); };
  ACT.adcat = () => { const ids = adIds(); if (!ids.length) return; const el = VO.sheet(`<form class="aform" id="catF"><h3>Новая категория для ${ids.length}</h3><div class="achips achips--col">${VO.CATS.map((c, i) => `<label><input type="radio" name="c" value="${c.id}"${i ? "" : " checked"}><span>${esc(c.name)}</span></label>`).join("")}</div><div class="aform__a"><button type="button" class="adm-btn adm-btn--ghost" data-sheet-close>Отмена</button><button class="adm-btn" type="submit">Перенести</button></div></form>`, { cls: "sheet--sm adm-sheet" }); $("#catF", el).addEventListener("submit", e => { e.preventDefault(); const c = new FormData(e.target).get("c"); VO.closeSheet(true); bulkAd(ids, { cat: c, sub: "" }, null, "Категория изменена", "Категория объявления изменена"); }); };

  function adDrawer(id, tab = "main") {
    const a = D.ad(id); if (!a) { VO.toast("Объявление не найдено"); return UI.closeDrawer(); }
    const s = D.status(a), m = a.adm || {}, u = D.user(A.ownerId(a)), mine = !!a.owner, phs = a.photos && a.photos.length ? a.photos : a.photo ? [a.photo] : [];
    const c = VO.CATS.find(x => x.id === a.cat) || { subs: [] };
    const T = [["main", "Основное"], ["photo", "Фото"], ["vis", "Видимость и продвижение"], ["stat", "Статистика"], ["hist", "История"]];
    const body = {
      main: () => `<form class="aform aform--flat" id="adF">
        <div class="field"><input name="title" maxlength="70" placeholder=" " value="${esc(a.title)}"><label>Название</label></div>
        <div class="arow2"><div class="field"><input name="price" inputmode="numeric" placeholder=" " value="${a.price == null ? "" : a.price}"><label>Цена, ₽ (0 — даром)</label></div><label class="atog"><input type="checkbox" name="bargain"${a.bargain ? " checked" : ""}><i></i>Торг</label></div>
        <div class="arow2"><label class="asel"><span>Категория</span><select name="cat">${VO.CATS.map(x => `<option value="${x.id}"${x.id === a.cat ? " selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label><label class="asel"><span>Подкатегория</span><select name="sub"><option value="">—</option>${c.subs.map(x => `<option${x === a.sub ? " selected" : ""}>${esc(x)}</option>`).join("")}</select></label></div>
        <div class="arow2"><label class="asel"><span>Состояние</span><select name="cond">${["Новое", "Как новое", "Б/у", "Услуга", "Работа", "Даром"].map(x => `<option${x === a.cond ? " selected" : ""}>${x}</option>`).join("")}</select></label><div class="field"><input name="city" maxlength="60" placeholder=" " value="${esc(a.city || "")}"><label>Город</label></div></div>
        <div class="field field--area"><textarea name="desc" rows="7" maxlength="3000" placeholder=" ">${esc(a.desc || "")}</textarea><label>Описание</label></div>
        <div class="aform__a"><button class="adm-btn" type="submit">Сохранить изменения</button></div>
        ${mine ? "" : `<p class="muted">Это тестовое объявление: изменения хранятся поверх исходных данных и их можно отменить.</p>`}</form>`,
      photo: () => `<div class="aphotos">${phs.map((p, i) => `<div class="aphoto"><img src="${p}" alt=""><div>${i ? `<button type="button" data-a="phcover" data-i="${i}" title="Сделать обложкой">★</button>` : "<em>Обложка</em>"}<button type="button" data-a="phrm" data-i="${i}" title="Удалить">×</button></div></div>`).join("")}<label class="aphoto aphoto--add"><input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden data-a="phadd">+ Добавить</label></div><p class="muted">Удаление фото помогает, если на снимке номер телефона, чужие данные или неприемлемое содержание.</p>`,
      vis: () => `<div class="avis">
        <div class="avis__now">Сейчас: ${pill(s[1], s[2])}${m.reason ? ` <span class="muted">Причина: ${esc(m.reason)}</span>` : ""}${m.until && A.live(m) ? ` <span class="muted">${A.until(m)}</span>` : ""}</div>
        <div class="acard"><h4>Видимость</h4><div class="abtns">
          <button type="button" class="adm-btn adm-btn--ghost" data-a="ad1" data-op="show">Показать в ленте</button>
          <button type="button" class="adm-btn adm-btn--ghost" data-a="ad1" data-op="hide">Скрыть без уведомления</button>
          <button type="button" class="adm-btn adm-btn--danger" data-a="ad1" data-op="block">Заблокировать на время…</button>
          ${a.mod === "pending" ? `<button type="button" class="adm-btn adm-btn--ok" data-a="ad1" data-op="approve">Одобрить</button>` : ""}
          ${m.deleted ? `<button type="button" class="adm-btn adm-btn--ok" data-a="ad1" data-op="restore">Восстановить из корзины</button><button type="button" class="adm-btn adm-btn--danger" data-a="ad1" data-op="purge">Удалить навсегда</button>` : `<button type="button" class="adm-btn adm-btn--danger" data-a="ad1" data-op="del">В корзину</button>`}</div></div>
        <div class="acard"><h4>Место в выдаче</h4><div class="aseg">${[[1, "Закрепить вверху"], [0, "Обычно"], [-1, "Опустить вниз"]].map(([v, n]) => `<button type="button" data-a="ad1" data-op="rank" data-v="${v}" class="${(m.rank || 0) === v ? "on" : ""}">${n}</button>`).join("")}</div>
          <div class="abtns"><button type="button" class="adm-btn adm-btn--ghost" data-a="ad1" data-op="bump">Поднять сейчас (как новое)</button><button type="button" class="adm-btn adm-btn--ghost" data-a="ad1" data-op="feat">${m.featured ? "Снять выделение" : "Выделить цветом"}</button></div>
          <p class="muted">Закреплённые показываются первыми в ленте и категории. Выделенные — с цветной рамкой.</p></div>
        ${mine ? `<div class="acard"><h4>Статус автора</h4><div class="aseg">${[["active", "Активно"], ["sold", "Продано"], ["archived", "Снято"]].map(([v, n]) => `<button type="button" data-a="ad1" data-op="status" data-v="${v}" class="${(a.status || "active") === v ? "on" : ""}">${n}</button>`).join("")}</div></div>` : ""}</div>`,
      stat: () => { const chats = (VO.chats ? VO.chats.all() : []).filter(x => x.ad && x.ad.id === a.id), reps = D.reports().filter(r => r.ad === a.id); return `<div class="akpis akpis--sm"><div class="akpi"><small>Просмотры</small><b>${VO.views(a)}</b></div><div class="akpi"><small>Диалоги</small><b>${chats.length}</b></div><div class="akpi"><small>Сделки</small><b>${chats.filter(x => x.deal).length}</b></div><div class="akpi"><small>Жалобы</small><b>${reps.length}</b></div></div>
        <dl class="adl"><div><dt>Создано</dt><dd>${fmtD(a.first || a.created || Date.now() - (a.ago || 0) * 6e4)}</dd></div><div><dt>Номер</dt><dd>${esc(a.id)}</dd></div><div><dt>Автор</dt><dd>${u ? `<button type="button" class="link" data-a="gouser" data-id="${esc(u.id)}">${esc(u.name)}</button>` : "—"}</dd></div></dl>
        ${reps.length ? `<h4>Жалобы</h4><ul class="afeed">${reps.map(r => `<li><b>${esc(r.reason)}</b><span>${esc(r.text || "")}</span><small>${fmtD(r.t)}</small></li>`).join("")}</ul>` : ""}`; },
      hist: () => histList(x => x.target === a.title || x.target === a.id),
    };
    UI.drawer(`<div class="adr__h"><span class="amod__th amod__th--lg" style="background:${a.bg}">${a.photo ? `<img src="${a.photo}" alt="">` : window.VO_ILL[a.ill] || ""}</span><div><h2>${esc(a.title)}</h2><p>${pill(s[1], s[2])} ${u ? `· ${esc(u.name)}` : ""} · № ${esc(a.id)}</p></div></div>
      <div class="adr__links"><a class="adm-btn adm-btn--ghost adm-btn--sm" href="#/ad/${a.id}" target="_blank" rel="noopener">${I(IC.ext, 14)}Открыть на сайте</a>${u && u.kind === "account" ? `<button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="gouser" data-id="${esc(u.id)}">Автор</button>` : ""}</div>
      <div class="atabs">${T.map(([k, n]) => `<button type="button" data-a="adtab" data-t="${k}" data-id="${esc(a.id)}" class="${tab === k ? "on" : ""}">${n}</button>`).join("")}</div>
      <div class="adr__b">${body[tab]()}</div>`);
    const f = $("#adF"); if (f) {
      f.addEventListener("change", e => { if (e.target.name === "cat") { const cc = VO.CATS.find(x => x.id === e.target.value) || { subs: [] }; f.sub.innerHTML = `<option value="">—</option>` + cc.subs.map(x => `<option>${esc(x)}</option>`).join(""); } });
      f.addEventListener("submit", e => { e.preventDefault(); const fd = new FormData(f), title = String(fd.get("title")).trim(); if (title.length < 3) return VO.toast("Название слишком короткое"); const pr = String(fd.get("price")).replace(/\D/g, ""); A.setAd(a.id, { title, price: pr === "" ? null : +pr, bargain: !!fd.get("bargain"), cat: fd.get("cat"), sub: fd.get("sub"), cond: fd.get("cond"), city: String(fd.get("city")).trim() || a.city, desc: String(fd.get("desc")).trim() }); A.log("Объявление отредактировано", title); VO.toast("Сохранено", 1200); adDrawer(a.id, "main"); UI.render(); });
    }
    const add = $('[data-a="phadd"]'); if (add) add.addEventListener("change", async e => { for (const file of [...e.target.files].slice(0, 8 - phs.length)) { try { const url = await VO.guard.image(file); const p = [...(D.ad(a.id).photos || (D.ad(a.id).photo ? [D.ad(a.id).photo] : [])), url]; A.setAd(a.id, { photos: p, photo: p[0] }); } catch (err) { VO.toast(err.message); } } A.log("Фото объявления добавлены", a.title); adDrawer(a.id, "photo"); });
  }
  UI.adDrawer = adDrawer;
  ACT.adtab = el => adDrawer(el.dataset.id, el.dataset.t);
  ACT.phrm = el => { const a = D.ad(cur.id); const p = [...(a.photos || (a.photo ? [a.photo] : []))]; p.splice(+el.dataset.i, 1); A.setAd(a.id, { photos: p, photo: p[0] || null }); A.log("Фото объявления удалено", a.title); adDrawer(a.id, "photo"); UI.render(); };
  ACT.phcover = el => { const a = D.ad(cur.id); const p = [...a.photos]; const [x] = p.splice(+el.dataset.i, 1); p.unshift(x); A.setAd(a.id, { photos: p, photo: p[0] }); adDrawer(a.id, "photo"); UI.render(); };
  ACT.ad1 = async el => {
    const a = D.ad(cur.id); if (!a) return; const op = el.dataset.op;
    const done = (msg, act, info = "") => { A.log(act, a.title, info); VO.toast(msg, 1400); adDrawer(a.id, "vis"); UI.render(); };
    if (op === "show") { A.setAd(a.id, {}, { state: null, until: null, reason: null }); return done("Объявление в ленте", "Объявление показано"); }
    if (op === "hide") { A.setAd(a.id, {}, { state: "hidden", until: null }); return done("Скрыто", "Объявление скрыто"); }
    if (op === "block") { const r = await UI.askLimit("Заблокировать объявление", REJECT); if (!r) return; A.setAd(a.id, {}, { state: "blocked", until: r.until, reason: r.reason }); if (a.owner) A.notify(a.owner, "Объявление заблокировано", `«${a.title}» ${A.until(r)}. Причина: ${r.reason}`, "#/me/ads"); return done("Заблокировано", "Объявление заблокировано", r.reason); }
    if (op === "approve") { A.setAd(a.id, { mod: "ok" }, { reviewed: true }); if (a.owner) A.notify(a.owner, "Объявление опубликовано", `«${a.title}» прошло проверку`, "#/ad/" + a.id); return done("Одобрено", "Объявление одобрено"); }
    if (op === "del") { if (!await UI.ask("Переместить в корзину?", "Объявление пропадёт с сайта. Восстановить можно из корзины.", "В корзину", true)) return; A.setAd(a.id, {}, { deleted: true }); return done("В корзине", "Объявление удалено"); }
    if (op === "restore") { A.setAd(a.id, {}, { deleted: null }); return done("Восстановлено", "Объявление восстановлено"); }
    if (op === "purge") { if (!await UI.ask("Удалить навсегда?", "Восстановить будет нельзя.", "Удалить навсегда", true)) return; A.purgeAd(a.id); A.log("Объявление удалено навсегда", a.title); UI.closeDrawer(); return UI.render(); }
    if (op === "rank") { A.setAd(a.id, {}, { rank: +el.dataset.v || null }); return done("Порядок изменён", "Изменено место в выдаче", el.textContent); }
    if (op === "bump") { A.setAd(a.id, {}, { bump: Date.now() }); return done("Поднято наверх", "Объявление поднято"); }
    if (op === "feat") { A.setAd(a.id, {}, { featured: m0(a).featured ? null : true }); return done("Готово", m0(a).featured ? "Выделение снято" : "Объявление выделено"); }
    if (op === "status") { A.setAd(a.id, { status: el.dataset.v }); return done("Статус изменён", "Статус объявления изменён", el.textContent); }
  };
  const m0 = a => a.adm || {};
  ACT.adnew = () => {
    const accs = D.users().filter(u => u.kind === "account");
    if (!accs.length) return VO.toast("Сначала нужен хотя бы один пользователь");
    const el = VO.sheet(`<form class="aform" id="nadF"><h3>Новое объявление</h3>
      <label class="asel"><span>От чьего имени</span><select name="owner">${accs.map(u => `<option value="${esc(u.email)}"${u.email === VO.user().email ? " selected" : ""}>${esc(u.name)} — ${esc(u.email)}</option>`).join("")}</select></label>
      <div class="field"><input name="title" maxlength="70" placeholder=" " required><label>Название</label></div>
      <div class="arow2"><label class="asel"><span>Категория</span><select name="cat">${VO.CATS.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></label><div class="field"><input name="price" inputmode="numeric" placeholder=" "><label>Цена, ₽</label></div></div>
      <div class="field"><input name="city" maxlength="60" placeholder=" " value="Москва"><label>Город</label></div>
      <div class="field field--area"><textarea name="desc" rows="4" maxlength="3000" placeholder=" "></textarea><label>Описание</label></div>
      <div class="aform__a"><button type="button" class="adm-btn adm-btn--ghost" data-sheet-close>Отмена</button><button class="adm-btn" type="submit">Опубликовать</button></div></form>`, { cls: "sheet--sm adm-sheet" });
    $("#nadF", el).addEventListener("submit", e => {
      e.preventDefault(); const fd = new FormData(e.target), title = String(fd.get("title")).trim(); if (title.length < 3) return VO.toast("Название слишком короткое");
      const cat = fd.get("cat"), id = "m" + Date.now();
      S.mine.unshift({ id, owner: fd.get("owner"), cat, sub: "", title, price: +String(fd.get("price")).replace(/\D/g, "") || 0, cond: "Б/у", attrs: {}, city: String(fd.get("city")).trim() || "Москва", desc: String(fd.get("desc")).trim(), photos: [], photo: null, ill: window.VO_CAT_ILL[cat] || "plant", bg: window.VO_CAT_BG[cat] || "#F4F5F7", delivery: ["meet"], created: Date.now(), first: Date.now(), status: "active" });
      VO.saveMine(); VO.emit("mine"); VO.search && VO.search.build && VO.search.build();
      A.log("Объявление создано администратором", title, fd.get("owner")); VO.closeSheet(true); VO.toast("Опубликовано"); UI.go("ads", id);
    });
  };

  /* ---------- Пользователи ---------- */
  const BAN_R = ["Мошенничество", "Спам и массовые объявления", "Оскорбления и угрозы", "Запрещённые товары", "Обход правил после предупреждений", "Чужие данные или фото", "Фейковый аккаунт"];
  const USR_BULK = [["ubanb", "Заблокировать…", "danger"], ["uunban", "Разблокировать"], ["unopost", "Запретить размещение…"], ["unomsg", "Запретить сообщения…"], ["uclear", "Снять все ограничения"], ["uwarn", "Предупредить…"], ["umsg", "Написать от команды…"], ["uhide", "Скрыть объявления"], ["ukick", "Выйти на всех устройствах"], ["udel", "Удалить", "danger"]];
  const uStatus = u => { const l = A.limits(u.id), r = A.u(u.id), out = []; if (l.ban) out.push(pill("Заблокирован", "red")); if (l.noPost) out.push(pill("Без размещения", "yellow")); if (l.noMsg) out.push(pill("Без сообщений", "yellow")); if (r.hideAds) out.push(pill("Объявления скрыты", "gray")); if (r.verified) out.push(pill("Проверен", "blue")); if (!out.length) out.push(pill("Активен", "green")); return out.join(" "); };
  SEC.users = { group: "manage", name: "Пользователи", perm: "manage", render() {
    const st = UI.f("users", "st"), kind = UI.f("users", "kind");
    let L = D.users().filter(u => UI.match("users", `${u.name} ${u.email} ${u.city} ${u.company} ${u.id} ${u.acc && u.acc.phone || ""}`));
    L = L.filter(u => { const l = A.limits(u.id); return !st || (st === "ban" ? l.ban : st === "lim" ? (l.noPost || l.noMsg) && !l.ban : st === "ok" ? !l.ban && !l.noPost && !l.noMsg : st === "warn" ? (A.u(u.id).warns || []).length : st === "admin" ? u.email && A.role(u.email) : true); });
    L = L.filter(u => !kind || (kind === "real" ? u.kind === "account" : kind === "test" ? u.kind !== "account" : kind === u.type));
    L.sort((a, b) => (b.kind === "account") - (a.kind === "account") || (b.created || 0) - (a.created || 0));
    return `<div class="ahead"><p class="muted">Нажмите на человека — откроется карточка: профиль, ограничения, объявления, переписка с командой, история.</p><button class="adm-btn" type="button" data-a="unew">+ Добавить пользователя</button></div>
      ${UI.tools("users", "Имя, почта, телефон или город", [["st", [["", "Все статусы"], ["ok", "Без ограничений"], ["ban", "Заблокированные"], ["lim", "С ограничениями"], ["warn", "С предупреждениями"], ["admin", "Команда сайта"]]], ["kind", [["", "Все"], ["real", "Настоящие аккаунты"], ["test", "Тестовые и демо"], ["person", "Частные лица"], ["company", "Компании"]]]])}
      ${UI.bulk("users", USR_BULK)}
      ${UI.table("users", L, [
        ["Пользователь", u => `<div class="acell-u">${ava(u.name, u.color)}<span><b>${esc(u.company && u.type === "company" ? u.company : u.name)}${u.email && A.role(u.email) ? ` <em class="arole">${A.ROLES[A.role(u.email)]}</em>` : ""}</b><small>${esc(u.email || D.kindName(u))}</small></span></div>`, "w-wide"],
        ["Тип", u => u.type === "company" ? "Компания" : "Частное лицо", "hide-m"],
        ["Город", u => esc(u.city || "—"), "hide-m"],
        ["Объявл.", u => D.userAds(u.id).length, "num"],
        ["Рейтинг", u => { const r = VO.rating ? VO.rating(u.id) : { n: 0 }; return r.n ? `★ ${r.avg.toFixed(1)} <small class="muted">(${r.n})</small>` : "—"; }, "nw hide-m"],
        ["Статус", u => uStatus(u)],
        ["С нами с", u => fmtDay(u.created), "nw hide-m"],
      ])}`;
  }, open: id => userDrawer(id) };
  const uIds = () => UI.selected("users");
  async function userLimit(ids, kind) {
    const T = { ban: ["Заблокировать", "Не сможет войти, объявления пропадут из ленты."], noPost: ["Запретить размещать объявления", "Сможет входить и переписываться, но не публиковать."], noMsg: ["Запретить писать сообщения", "Сможет пользоваться сайтом, но не писать в чатах."] }[kind];
    const r = await UI.askLimit(`${T[0]}${ids.length > 1 ? ": " + ids.length : ""}`, BAN_R, { text: T[1] }); if (!r) return;
    ids.forEach(id => { A.setU(id, { [kind]: { until: r.until, reason: r.reason, t: Date.now(), by: VO.user().email } }); const u = D.user(id); if (u && u.email && kind !== "ban") A.notify(u.email, "Ограничение аккаунта", `${T[0]} ${A.until(r)}. Причина: ${r.reason}`); A.log(T[0], u ? u.email || u.name : id, `${A.until(r)} · ${r.reason}`); });
    sel.users && sel.users.clear(); VO.toast("Готово", 1400); UI.render(); if (UI.drawerOpen() && cur.sec === "users") userDrawer(cur.id, "lim");
  }
  UI.userLimit = userLimit;
  ACT.ubanb = () => uIds().length && userLimit(uIds(), "ban");
  ACT.unopost = () => uIds().length && userLimit(uIds(), "noPost");
  ACT.unomsg = () => uIds().length && userLimit(uIds(), "noMsg");
  const clearL = (ids, keys, msg) => { ids.forEach(id => { const p = {}; keys.forEach(k => p[k] = null); A.setU(id, p); const u = D.user(id); A.log(msg, u ? u.email || u.name : id); }); sel.users && sel.users.clear(); VO.toast(msg, 1400); UI.render(); };
  ACT.uunban = () => clearL(uIds(), ["ban"], "Блокировка снята");
  ACT.uclear = () => clearL(uIds(), ["ban", "noPost", "noMsg", "hideAds"], "Ограничения сняты");
  ACT.uhide = () => { uIds().forEach(id => { A.setU(id, { hideAds: true }); A.log("Объявления пользователя скрыты", (D.user(id) || {}).name || id); }); sel.users.clear(); VO.toast("Объявления скрыты", 1400); UI.render(); };
  const WARN_T = ["Пожалуйста, не указывайте контакты и ссылки в тексте объявлений.", "Ваши объявления нарушают правила размещения. Следующее нарушение приведёт к блокировке.", "Пожалуйста, общайтесь вежливо — на вас поступили жалобы.", "Не размещайте одинаковые объявления повторно."];
  ACT.uwarn = async () => { const ids = uIds().filter(id => (D.user(id) || {}).email); if (!ids.length) return VO.toast("Предупреждение можно отправить только настоящим аккаунтам"); const t = await UI.askText(`Предупреждение: ${ids.length}`, "Текст предупреждения", { templates: WARN_T, hint: "Придёт в уведомления и в служебный чат от команды." }); if (!t) return; ids.forEach(id => { A.warn(D.user(id).email, t); A.log("Предупреждение", D.user(id).email, t); }); sel.users.clear(); VO.toast("Отправлено"); UI.render(); };
  ACT.umsg = async () => { const ids = uIds().filter(id => (D.user(id) || {}).email); if (!ids.length) return VO.toast("Написать можно только настоящим аккаунтам"); const t = await UI.askText(`Сообщение от команды: ${ids.length}`, "Текст сообщения", { hint: "Появится в переписке как «Команда «Все объявления»»." }); if (!t) return; ids.forEach(id => { VO.chats.teamSay(D.user(id).email, t); A.log("Сообщение от команды", D.user(id).email, t); }); sel.users.clear(); VO.toast("Отправлено"); UI.render(); };
  ACT.ukick = () => { uIds().forEach(id => { const u = D.user(id); if (u && u.acc) { u.acc.kick = Date.now(); u.acc.sessions = []; A.log("Завершены все сеансы", u.email); } }); store.set("vo_accounts", S.accounts); sel.users.clear(); VO.toast("Сеансы завершены", 1400); UI.render(); };
  ACT.udel = async () => { const ids = uIds().filter(id => (D.user(id) || {}).kind === "account"); if (!ids.length) return VO.toast("Удалить можно только настоящие аккаунты"); if (ids.some(id => D.user(id).email === VO.user().email)) return VO.toast("Себя удалить нельзя"); if (!await UI.ask(`Удалить ${ids.length} ${VO.plural(ids.length, "аккаунт", "аккаунта", "аккаунтов")}?`, "Профили, объявления и уведомления будут удалены. Переписки останутся у собеседников.", "Удалить", true, "удалить")) return; ids.forEach(delUser); sel.users.clear(); UI.closeDrawer(); UI.render(); };
  function delUser(id) {
    const u = D.user(id); if (!u || !u.acc) return;
    S.mine = S.mine.filter(a => a.owner !== u.email); VO.state.mine = S.mine; VO.saveMine();
    delete S.accounts[u.email]; store.set("vo_accounts", S.accounts);
    S.notes = S.notes.filter(n => n.owner !== u.email); store.set("vo_notes", S.notes);
    A.log("Аккаунт удалён", u.email); VO.emit("mine"); VO.emit("notes");
  }
  ACT.unew = () => {
    const el = VO.sheet(`<form class="aform" id="nuF"><h3>Новый пользователь</h3><p class="muted">Человек сможет войти по этой почте одноразовым кодом.</p>
      <div class="field"><input name="email" type="email" maxlength="120" placeholder=" " required><label>Почта</label></div>
      <div class="field"><input name="name" maxlength="40" placeholder=" " required><label>Имя</label></div>
      <div class="arow2"><div class="field"><input name="city" maxlength="60" placeholder=" "><label>Город</label></div><label class="asel"><span>Тип</span><select name="type"><option value="person">Частное лицо</option><option value="company">Компания</option></select></label></div>
      <div class="aform__a"><button type="button" class="adm-btn adm-btn--ghost" data-sheet-close>Отмена</button><button class="adm-btn" type="submit">Создать</button></div></form>`, { cls: "sheet--sm adm-sheet" });
    $("#nuF", el).addEventListener("submit", e => {
      e.preventDefault(); const fd = new FormData(e.target), email = String(fd.get("email")).trim().toLowerCase(), name = String(fd.get("name")).trim();
      if (!VO.MAIL_RX.test(email)) return VO.toast("Проверьте почту"); if (S.accounts[email]) return VO.toast("Такой пользователь уже есть"); if (name.length < 2) return VO.toast("Укажите имя");
      S.accounts[email] = { email, name, city: String(fd.get("city")).trim(), type: fd.get("type"), created: Date.now(), color: "#2F7DE1", notif: { msg: true, deal: true, review: true }, sessions: [], onboarded: true, phoneVis: "none", consentAt: null, byAdmin: true };
      store.set("vo_accounts", S.accounts); A.log("Пользователь создан", email); VO.closeSheet(true); VO.toast("Создан"); UI.go("users", VO.uid(email));
    });
  };

  function userDrawer(id, tab = "prof") {
    const u = D.user(id); if (!u) { VO.toast("Пользователь не найден"); return UI.closeDrawer(); }
    const r = A.u(id), l = A.limits(id), acc = u.acc, real = u.kind === "account", ads = D.userAds(id);
    const T = [["prof", "Профиль"], ["lim", "Ограничения"], ["ads", `Объявления · ${ads.length}`], ["chat", "Переписка"], ["rev", "Отзывы"], ["note", "Заметки"], ["hist", "История"]];
    const lim = (k, name, desc) => { const s = l[k]; return `<div class="alim${s ? " is-on" : ""}"><div><b>${name}</b><small>${s ? `${A.until(s)[0].toUpperCase() + A.until(s).slice(1)} · ${esc(s.reason || "")}` : desc}</small></div>${s ? `<button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="u1" data-op="unlim" data-k="${k}">Снять</button>` : `<button type="button" class="adm-btn adm-btn--sm${k === "ban" ? " adm-btn--danger" : ""}" data-a="u1" data-op="lim" data-k="${k}">${k === "ban" ? "Заблокировать…" : "Включить…"}</button>`}</div>`; };
    const body = {
      prof: () => real ? `<form class="aform aform--flat" id="uF">
        <div class="arow2"><div class="field"><input name="name" maxlength="40" placeholder=" " value="${esc(acc.name || "")}"><label>Имя</label></div><label class="asel"><span>Тип</span><select name="type"><option value="person"${acc.type !== "company" ? " selected" : ""}>Частное лицо</option><option value="company"${acc.type === "company" ? " selected" : ""}>Компания</option></select></label></div>
        <div class="field"><input name="company" maxlength="60" placeholder=" " value="${esc(acc.company || "")}"><label>Название компании</label></div>
        <div class="field"><input name="email" type="email" maxlength="120" placeholder=" " value="${esc(acc.email)}"><label>Почта — это и логин для входа</label></div>
        <div class="arow2"><div class="field"><input name="phone" maxlength="20" placeholder=" " value="${esc(acc.phone || "")}"><label>Телефон</label></div><label class="asel"><span>Кто видит телефон</span><select name="phoneVis">${[["none", "Никто"], ["auth", "Вошедшие"], ["all", "Все"]].map(([v, n]) => `<option value="${v}"${(acc.phoneVis || "none") === v ? " selected" : ""}>${n}</option>`).join("")}</select></label></div>
        <div class="field"><input name="city" maxlength="60" placeholder=" " value="${esc(acc.city || "")}"><label>Город</label></div>
        <div class="field field--area"><textarea name="about" rows="3" maxlength="300" placeholder=" ">${esc(acc.about || "")}</textarea><label>О себе</label></div>
        <div class="arow2"><label class="atog"><input type="checkbox" name="verified"${r.verified ? " checked" : ""}><i></i>Проверенный пользователь</label>${A.can("team") ? `<label class="asel"><span>Роль на сайте</span><select name="role"><option value="">Пользователь</option>${Object.entries(A.ROLES).filter(([k]) => k !== "owner").map(([k, n]) => `<option value="${k}"${A.role(acc.email) === k ? " selected" : ""}>${n}</option>`).join("")}</select></label>` : ""}</div>
        <div class="aform__a"><button type="button" class="adm-btn adm-btn--ghost" data-a="u1" data-op="resetname">Сбросить имя и «о себе»</button><button class="adm-btn" type="submit">Сохранить</button></div>
        <div class="anote"><b>Вход и пароль</b><span>На сайте нет паролей: вход по одноразовому коду на почту. Поэтому пароль нельзя ни подсмотреть, ни украсть. Чтобы сменить логин — измените почту выше. Зарегистрирован ${fmtD(acc.created)}${acc.byAdmin ? " администратором" : ""}. Согласие на обработку данных: ${acc.consentAt ? fmtD(acc.consentAt) : "нет"}.</span></div></form>`
        : `<div class="anote"><b>${u.kind === "seller" ? "Тестовый продавец" : "Демо-покупатель"}</b><span>Это демонстрационный человек: он отвечает в чате автоматически. Профиль не редактируется, но можно ограничить, скрыть объявления и смотреть историю.</span></div>`,
      lim: () => `${lim("ban", "Блокировка аккаунта", "Не сможет войти, объявления скрыты")}${lim("noPost", "Запрет на размещение", "Не сможет публиковать объявления")}${lim("noMsg", "Запрет на сообщения", "Не сможет писать в чатах")}
        <div class="alim${r.hideAds ? " is-on" : ""}"><div><b>Скрыть все объявления</b><small>Объявления останутся у автора, но пропадут из ленты</small></div><button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="u1" data-op="hideads">${r.hideAds ? "Показать" : "Скрыть"}</button></div>
        <h4>Предупреждения · ${(r.warns || []).length}</h4>${(r.warns || []).length ? `<ul class="afeed">${r.warns.slice().reverse().map(w => `<li><span>${esc(w.text)}</span><small>${fmtD(w.t)}</small></li>`).join("")}</ul>` : `<p class="muted">Предупреждений не было</p>`}
        ${real ? `<div class="abtns"><button type="button" class="adm-btn adm-btn--ghost" data-a="u1" data-op="warn">Отправить предупреждение…</button><button type="button" class="adm-btn adm-btn--ghost" data-a="u1" data-op="kick">Выйти на всех устройствах</button><button type="button" class="adm-btn adm-btn--danger" data-a="u1" data-op="del">Удалить аккаунт…</button></div>` : ""}`,
      ads: () => ads.length ? `<ul class="alist">${ads.map(a => { const s = D.status(a); return `<li><span class="amod__th" style="background:${a.bg}">${a.photo ? `<img src="${a.photo}" alt="">` : window.VO_ILL[a.ill] || ""}</span><span><b>${esc(a.title)}</b><small>${a.price ? VO.rub(a.price) : "Даром"} · ${pill(s[1], s[2])}</small></span><button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="goad" data-id="${esc(a.id)}">Открыть</button></li>`; }).join("")}</ul>` : `<p class="muted">Объявлений нет</p>`,
      chat: () => { if (!real) return `<p class="muted">Для демо-людей служебного чата нет.</p>`; const c = VO.chats.teamGet(acc.email), other = VO.chats.all().filter(x => x.owner === acc.email && !x.team);
        return `<div class="athread">${c && c.msgs.length ? c.msgs.map(m => `<div class="athread__m athread__m--${m.from === "peer" ? "team" : "user"}"><p>${esc(m.text || "")}</p><small>${m.from === "peer" ? "Команда" : esc(acc.name || "Пользователь")} · ${fmtD(m.t)}</small></div>`).join("") : `<p class="muted">Переписки с командой пока нет.</p>`}</div>
          <form class="athread__f" id="tmF"><textarea name="t" rows="2" maxlength="2000" placeholder="Сообщение от команды «Все объявления»"></textarea><button class="adm-btn" type="submit">Отправить</button></form>
          <h4>Диалоги пользователя · ${other.length}</h4>${other.length ? `<ul class="alist">${other.slice(0, 20).map(x => `<li><span><b>${esc(VO.person(x.peer).name)}</b><small>«${esc(x.ad.title)}» · ${x.msgs.length} сообщ.${x.deal ? " · сделка" : ""}</small></span><button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="gochat" data-id="${esc(x.id)}">Читать</button></li>`).join("")}</ul>` : `<p class="muted">Диалогов нет</p>`}`; },
      rev: () => { const about = VO.reviews ? VO.reviews.of(id) : []; return `<h4>О пользователе · ${about.length}</h4>${about.length ? `<ul class="afeed">${about.map(x => `<li><b>${"★".repeat(x.stars)}${"☆".repeat(5 - x.stars)} ${esc(x.authorName || "")}</b><span>${esc(x.text)}</span><small>${fmtD(x.t)} · ${x.verified ? "сделка на сайте" : "без сделки"}</small></li>`).join("")}</ul>` : `<p class="muted">Отзывов нет</p>`}<p><a href="#/admin/reviews" class="link">Управлять отзывами</a></p>`; },
      note: () => `<form id="noteF"><div class="field field--area"><textarea name="n" rows="6" maxlength="2000" placeholder=" ">${esc(r.note || "")}</textarea><label>Заметка для команды — пользователь её не видит</label></div><div class="aform__a"><button class="adm-btn" type="submit">Сохранить заметку</button></div></form>`,
      hist: () => histList(x => x.target === u.email || x.target === u.name || x.target === id),
    };
    UI.drawer(`<div class="adr__h">${ava(u.name, u.color, 54)}<div><h2>${esc(u.company && u.type === "company" ? u.company : u.name)}</h2><p>${esc(u.email || D.kindName(u))} · ${uStatus(u)}</p></div></div>
      ${real ? `<div class="adr__links"><button type="button" class="adm-btn adm-btn--sm" data-a="u1" data-op="write">Написать</button><button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="u1" data-op="warn">Предупредить</button>${u.email !== VO.user().email ? `<button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="u1" data-op="as">Войти в аккаунт</button>` : ""}<a class="adm-btn adm-btn--ghost adm-btn--sm" href="#/u/${esc(id)}" target="_blank" rel="noopener">${I(IC.ext, 14)}Профиль на сайте</a>${l.ban ? `<button type="button" class="adm-btn adm-btn--ok adm-btn--sm" data-a="u1" data-op="unlim" data-k="ban">Разблокировать</button>` : `<button type="button" class="adm-btn adm-btn--danger adm-btn--sm" data-a="u1" data-op="lim" data-k="ban">Заблокировать</button>`}</div>`
        : `<div class="adr__links"><a class="adm-btn adm-btn--ghost adm-btn--sm" href="#/u/${esc(id)}" target="_blank" rel="noopener">${I(IC.ext, 14)}Профиль на сайте</a></div>`}
      <div class="atabs">${T.map(([k, n]) => `<button type="button" data-a="utab" data-t="${k}" class="${tab === k ? "on" : ""}">${n}</button>`).join("")}</div>
      <div class="adr__b">${body[tab]()}</div>`);
    const f = $("#uF"); if (f) f.addEventListener("submit", e => {
      e.preventDefault(); const fd = new FormData(f), email = String(fd.get("email")).trim().toLowerCase();
      if (!VO.MAIL_RX.test(email)) return VO.toast("Проверьте почту");
      if (email !== acc.email && S.accounts[email]) return VO.toast("Эта почта уже занята другим пользователем");
      const old = acc.email;
      Object.assign(acc, { name: String(fd.get("name")).trim().slice(0, 40) || acc.name, type: fd.get("type"), company: String(fd.get("company")).trim().slice(0, 60), phone: String(fd.get("phone")).trim(), phoneVis: fd.get("phoneVis"), showPhone: fd.get("phoneVis") !== "none", city: String(fd.get("city")).trim(), about: String(fd.get("about")).trim().slice(0, 300) });
      if (email !== old) {
        // смена логина: id сохраняем, переносим объявления, переписки и уведомления
        acc.uid = acc.uid || A.uid0(old); acc.email = email; delete S.accounts[old]; S.accounts[email] = acc;
        S.mine.forEach(a => { if (a.owner === old) a.owner = email; }); VO.saveMine();
        VO.chats.all().forEach(c => { if (c.owner === old) c.owner = email; }); store.set("vo_chats", VO.chats.all());
        S.notes.forEach(n => { if (n.owner === old) n.owner = email; }); store.set("vo_notes", S.notes);
        if (S.session === old) { S.session = email; store.set("vo_session", email); }
        A.log("Почта (логин) изменена", old, email);
      }
      store.set("vo_accounts", S.accounts);
      A.setU(id, { verified: fd.get("verified") ? true : null });
      if (A.can("team") && fd.get("role") !== undefined) { const team = A.cfg().team.filter(t => t.email !== email && t.email !== old); if (fd.get("role")) team.push({ email, role: fd.get("role") }); A.setCfg({ team }); }
      A.log("Профиль пользователя изменён", email); VO.toast("Сохранено", 1200); VO.emit("user"); userDrawer(id, "prof"); UI.render();
    });
    const tf = $("#tmF"); if (tf) tf.addEventListener("submit", e => { e.preventDefault(); const t = tf.t.value.trim(); if (!t) return; VO.chats.teamSay(acc.email, t); A.log("Сообщение от команды", acc.email, t); userDrawer(id, "chat"); });
    const nf = $("#noteF"); if (nf) nf.addEventListener("submit", e => { e.preventDefault(); A.setU(id, { note: nf.n.value.trim() || null }); A.log("Заметка о пользователе", u.email || u.name); VO.toast("Заметка сохранена", 1200); });
  }
  UI.userDrawer = userDrawer;
  ACT.utab = el => userDrawer(cur.id, el.dataset.t);
  ACT.goad = el => UI.go("ads", el.dataset.id);
  ACT.u1 = async el => {
    const id = cur.id, u = D.user(id); if (!u) return; const op = el.dataset.op;
    if (op === "lim") return userLimit([id], el.dataset.k);
    if (op === "unlim") { A.setU(id, { [el.dataset.k]: null }); A.log("Ограничение снято", u.email || u.name, el.dataset.k); VO.toast("Снято", 1200); userDrawer(id, "lim"); return UI.render(); }
    if (op === "hideads") { const on = !A.u(id).hideAds; A.setU(id, { hideAds: on || null }); A.log(on ? "Объявления пользователя скрыты" : "Объявления пользователя показаны", u.email || u.name); userDrawer(id, "lim"); return UI.render(); }
    if (op === "warn") { const t = await UI.askText("Предупреждение", "Текст предупреждения", { templates: WARN_T, hint: "Придёт в уведомления и в служебный чат." }); if (!t) return; A.warn(u.email, t); A.log("Предупреждение", u.email, t); VO.toast("Отправлено"); return userDrawer(id, "lim"); }
    if (op === "write") return userDrawer(id, "chat");
    if (op === "kick") { u.acc.kick = Date.now(); u.acc.sessions = []; store.set("vo_accounts", S.accounts); A.log("Завершены все сеансы", u.email); return VO.toast("Сеансы завершены", 1400); }
    if (op === "as") { if (await UI.ask(`Войти как ${esc(u.name)}?`, "Вы увидите сайт глазами пользователя и сможете помочь с объявлениями. Действие записывается в журнал. Вернуться — кнопкой внизу экрана.", "Войти")) A.loginAs(u.email); return; }
    if (op === "resetname") { u.acc.name = "Пользователь"; u.acc.about = ""; store.set("vo_accounts", S.accounts); A.notify(u.email, "Профиль изменён модератором", "Имя и описание профиля нарушали правила и были сброшены. Укажите новые в профиле.", "#/me/profile"); A.log("Сброшены имя и «о себе»", u.email); return userDrawer(id, "prof"); }
    if (op === "del") { if (u.email === VO.user().email) return VO.toast("Себя удалить нельзя"); if (!await UI.ask(`Удалить аккаунт ${esc(u.email)}?`, "Профиль, объявления и уведомления будут удалены без возможности восстановления.", "Удалить", true, "удалить")) return; delUser(id); UI.closeDrawer(); return UI.render(); }
  };
  ACT.gochat = el => UI.go("chats", el.dataset.id);

  function histList(fn) { const L = A.logs().filter(fn).slice(0, 60); return L.length ? `<ul class="afeed">${L.map(l => `<li><b>${esc(l.act)}</b><span>${esc(l.info || "")}</span><small>${fmtD(l.t)} · ${esc(l.who)}</small></li>`).join("")}</ul>` : `<p class="muted">Действий администраторов пока не было</p>`; }
  UI.histList = histList;

  /* ---------- Жалобы ---------- */
  const REP_ST = [["new", "Новые"], ["work", "В работе"], ["done", "Решённые"], ["rejected", "Отклонённые"]];
  SEC.reports = { group: "manage", name: "Жалобы", perm: "manage", badge: c => c.reports, render() {
    const st = UI.f("reports", "st") || "new", L = D.reports().filter(r => r.st === st).sort((a, b) => b.t - a.t);
    return `<div class="aseg aseg--big">${REP_ST.map(([k, n]) => `<button type="button" data-a="repst" data-v="${k}" class="${st === k ? "on" : ""}">${n} <small>${D.reports().filter(r => r.st === k).length}</small></button>`).join("")}</div>
      ${L.length ? `<div class="areps">${L.map(r => { const a = r.ad ? D.ad(r.ad) : null, c = r.chat && VO.chats ? VO.chats.all().find(x => x.id === r.chat) : null, who = c ? VO.person(c.peer) : a ? D.user(A.ownerId(a)) : null;
        return `<article class="arep"><header>${pill(r.ad ? "Объявление" : "Пользователь", r.ad ? "blue" : "yellow")}<b>${esc(r.reason)}</b><small>${fmtD(r.t)}</small></header>
          ${a ? `<div class="arep__o"><span class="amod__th" style="background:${a.bg}">${a.photo ? `<img src="${a.photo}" alt="">` : window.VO_ILL[a.ill] || ""}</span><span><b>${esc(a.title)}</b><small>${who ? esc(who.name) : ""} · ${pill(D.status(a)[1], D.status(a)[2])}</small></span></div>` : who ? `<div class="arep__o">${ava(who.name, who.color)}<span><b>${esc(who.name)}</b><small>жалоба из переписки</small></span></div>` : ""}
          ${r.text ? `<p>«${esc(r.text)}»</p>` : ""}
          <div class="abtns">${a ? `<button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="goad" data-id="${esc(a.id)}">Открыть объявление</button><button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="rep" data-op="hidead" data-id="${esc(r.id)}">Скрыть объявление</button>` : ""}${who && who.id ? `<button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="rep" data-op="ban" data-id="${esc(r.id)}">Ограничить автора…</button>` : ""}${c ? `<button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="gochat" data-id="${esc(c.id)}">Читать переписку</button>` : ""}
            ${st !== "work" ? `<button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="rep" data-op="work" data-id="${esc(r.id)}">Взять в работу</button>` : ""}${st !== "done" ? `<button type="button" class="adm-btn adm-btn--ok adm-btn--sm" data-a="rep" data-op="done" data-id="${esc(r.id)}">Решено</button>` : ""}${st !== "rejected" ? `<button type="button" class="adm-btn adm-btn--text adm-btn--sm" data-a="rep" data-op="rejected" data-id="${esc(r.id)}">Отклонить</button>` : ""}</div></article>`; }).join("")}</div>`
        : `<div class="aempty aempty--big">${I(IC.reports, 40)}<b>${st === "new" ? "Новых жалоб нет" : "Здесь пусто"}</b><span>Жалобы приходят со страниц объявлений и из переписки.</span></div>`}`;
  } };
  ACT.repst = el => { q["reports:st"] = el.dataset.v; UI.render(); };
  ACT.rep = async el => {
    const r = D.reports().find(x => x.id === el.dataset.id); if (!r) return; const op = el.dataset.op;
    if (["work", "done", "rejected"].includes(op)) { D.setRep(r.id, op); A.log("Жалоба: " + { work: "в работе", done: "решена", rejected: "отклонена" }[op], r.reason); return UI.render(); }
    if (op === "hidead") { A.setAd(r.ad, {}, { state: "hidden", reason: r.reason }); D.setRep(r.id, "done"); A.log("Объявление скрыто по жалобе", (D.ad(r.ad) || {}).title || r.ad); VO.toast("Скрыто, жалоба решена"); return UI.render(); }
    if (op === "ban") { const c = r.chat && VO.chats.all().find(x => x.id === r.chat), who = c ? c.peer : A.ownerId(D.ad(r.ad) || {}); if (who) await userLimit([who], "ban"); }
  };

  /* ---------- Обращения ---------- */
  const TK_T = ["Здравствуйте! Спасибо, что написали. Разобрались — всё исправлено.", "Здравствуйте! Проверили объявление — оно скрыто, автор получил предупреждение.", "Здравствуйте! Чтобы помочь, пришлите, пожалуйста, ссылку на объявление.", "Спасибо за идею! Передали команде — постараемся сделать."];
  SEC.tickets = { group: "manage", name: "Обращения", perm: "support", badge: c => c.tickets, render() {
    const st = UI.f("tickets", "st") || "open", all = D.tickets(), L = all.filter(t => st === "all" || (st === "open" ? t.status !== "answered" && t.status !== "closed" : t.status === st)).filter(t => UI.match("tickets", `${t.name} ${t.email} ${t.msg} ${t.topic}`));
    const open = cur.id && all.find(t => t.id === cur.id) || L[0];
    return `${UI.tools("tickets", "Имя, почта или текст", [["st", [["open", "Ждут ответа"], ["answered", "Отвечено"], ["closed", "Закрыто"], ["all", "Все"]]]])}
      ${L.length || open ? `<div class="atk"><aside class="atk__l">${L.map(t => `<button type="button" class="${open && open.id === t.id ? "on" : ""}" data-a="tkopen" data-id="${esc(t.id)}"><b>${esc(t.topic)}</b><span>${esc(t.name)} · ${esc(t.email)}</span><small>${fmtD(t.t)}</small><em>${esc(t.msg.slice(0, 80))}</em></button>`).join("")}</aside>
        <section class="atk__c">${open ? `<header><div><h3>${esc(open.topic)}</h3><small>№ ${esc(open.id.slice(-6).toUpperCase())} · ${fmtD(open.t)}</small></div>${pill(open.status === "answered" ? "Отвечено" : open.status === "closed" ? "Закрыто" : "Ждёт ответа", open.status === "answered" ? "green" : open.status === "closed" ? "gray" : "yellow")}</header>
          <div class="atk__who">${ava(open.name)}<span><b>${esc(open.name)}</b><small>${esc(open.email)}</small></span>${S.accounts[open.email] ? `<button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-a="gouser" data-id="${esc(VO.uid(open.email))}">Профиль</button>` : `<small class="muted">не зарегистрирован</small>`}</div>
          <div class="athread"><div class="athread__m athread__m--user"><p>${esc(open.msg)}</p><small>${fmtD(open.t)}</small></div>${(open.replies || (open.answer ? [{ text: open.answer, t: open.answeredAt }] : [])).map(x => `<div class="athread__m athread__m--team"><p>${esc(x.text)}</p><small>Команда · ${fmtD(x.t)}</small></div>`).join("")}</div>
          <div class="achips achips--wrap">${TK_T.map(t => `<button type="button" data-a="tktpl" data-t="${esc(t)}">${esc(t.slice(0, 40))}…</button>`).join("")}</div>
          <form id="tkF" class="athread__f"><textarea name="t" rows="3" maxlength="3000" placeholder="Ответ — придёт пользователю в уведомления и на почту"></textarea><div class="abtns"><button class="adm-btn" type="submit">Ответить</button>${open.status !== "closed" ? `<button type="button" class="adm-btn adm-btn--ghost" data-a="tkclose" data-id="${esc(open.id)}">Закрыть без ответа</button>` : ""}</div></form>` : ""}</section></div>`
        : `<div class="aempty aempty--big">${I(IC.tickets, 40)}<b>Обращений нет</b><span>Здесь появятся сообщения из формы «Написать нам».</span></div>`}`;
  }, after(body) { const f = $("#tkF", body); if (!f) return; f.addEventListener("submit", e => { e.preventDefault(); const t = f.t.value.trim(); if (t.length < 2) return; const all = D.tickets(), id = ($(".atk__l .on", body) || {}).dataset?.id || (all.find(x => x.id === cur.id) || all.filter(x => x.status !== "answered" && x.status !== "closed")[0] || {}).id, tk = all.find(x => x.id === id); if (!tk) return; tk.replies = [...(tk.replies || (tk.answer ? [{ text: tk.answer, t: tk.answeredAt }] : [])), { text: t, t: Date.now(), by: VO.user().email }]; tk.answer = t; tk.answeredAt = Date.now(); tk.status = "answered"; D.saveTickets(all); if (S.accounts[tk.email]) A.notify(tk.email, "Ответ на обращение", t.slice(0, 140), "#/me/tickets"); A.log("Ответ на обращение", tk.email, t.slice(0, 80)); VO.toast("Ответ отправлен"); cur.id = tk.id; UI.render(); }); } };
  ACT.tkopen = el => { cur.id = el.dataset.id; UI.render(); };
  ACT.tktpl = el => { const ta = $("#tkF textarea"); if (ta) { ta.value = el.dataset.t; ta.focus(); } };
  ACT.tkclose = el => { const all = D.tickets(), tk = all.find(x => x.id === el.dataset.id); if (!tk) return; tk.status = "closed"; D.saveTickets(all); A.log("Обращение закрыто", tk.email); UI.render(); };

  /* ---------- Переписки и сделки ---------- */
  const RISK = /(предоплат|переведи|переведите|карт[уы] |код из смс|скажите код|https?:\/\/|оплатить по ссылке|безопасн\w* сделк)/i;
  SEC.chats = { group: "manage", name: "Переписки и сделки", perm: "manage", render() {
    const f = UI.f("chats", "f"), all = VO.chats ? VO.chats.all() : [];
    let L = all.filter(c => !f || (f === "risk" ? c.msgs.some(m => RISK.test(m.text || "")) : f === "deal" ? c.deal : f === "team" ? c.team : f === "done" ? c.deal && c.deal.stage === "done" : true));
    L = L.filter(c => UI.match("chats", `${VO.person(c.peer).name} ${c.owner} ${c.ad.title}`)).sort((a, b) => ((b.msgs[b.msgs.length - 1] || {}).t || b.created) - ((a.msgs[a.msgs.length - 1] || {}).t || a.created));
    const ST = { proposed: "Предложена", agreed: "Договорились", transfer: "Передача", done: "Завершена", cancelled: "Отменена" };
    return `<p class="muted ahead">Читайте переписку только при жалобе или по просьбе пользователя — это личные данные. Каждое открытие записывается в журнал.</p>
      ${UI.tools("chats", "Имя, почта или объявление", [["f", [["", "Все диалоги"], ["risk", "С подозрительными словами"], ["deal", "Со сделкой"], ["done", "Завершённые сделки"], ["team", "Служебные (от команды)"]]]])}
      ${UI.table("chats", L, [
        ["Диалог", c => `<div class="acell-u">${ava(VO.person(c.peer).name, VO.person(c.peer).color)}<span><b>${esc((S.accounts[c.owner] || {}).name || c.owner)} ↔ ${esc(VO.person(c.peer).name)}</b><small>${c.team ? "служебный чат" : "«" + esc(c.ad.title) + "»"}</small></span></div>`, "w-wide"],
        ["Сообщений", c => c.msgs.length, "num"],
        ["Сделка", c => c.deal ? pill(ST[c.deal.stage] || c.deal.stage, c.deal.stage === "done" ? "green" : c.deal.stage === "cancelled" ? "gray" : "blue") : "—"],
        ["Риск", c => c.msgs.some(m => RISK.test(m.text || "")) ? pill("Есть", "red") : "—"],
        ["Последнее", c => fmtD((c.msgs[c.msgs.length - 1] || {}).t || c.created), "nw hide-m"],
      ], { empty: "Диалогов нет" })}`;
  }, open(id) {
    const c = VO.chats.all().find(x => x.id === id); if (!c) return UI.closeDrawer();
    A.log("Просмотр переписки", c.owner, c.ad.title);
    const me = (S.accounts[c.owner] || {}).name || c.owner, p = VO.person(c.peer);
    UI.drawer(`<div class="adr__h">${ava(p.name, p.color, 48)}<div><h2>${esc(me)} ↔ ${esc(p.name)}</h2><p>${c.team ? "Служебный чат" : "«" + esc(c.ad.title) + "»"}${c.deal ? ` · сделка: ${esc(c.deal.stage)}` : ""}</p></div></div>
      <div class="athread athread--chat">${c.msgs.map(m => m.from === "sys" ? `<div class="athread__sys">${esc(m.text)}</div>` : `<div class="athread__m athread__m--${m.from === "me" ? "user" : "team"}${RISK.test(m.text || "") ? " is-risk" : ""}">${m.photo ? `<img src="${m.photo}" alt="">` : ""}${m.text ? `<p>${esc(m.text)}</p>` : ""}<small>${m.from === "me" ? esc(me) : esc(p.name)} · ${fmtD(m.t)}</small></div>`).join("") || '<p class="muted">Сообщений нет</p>'}</div>
      ${c.team ? `<form class="athread__f" id="tm2F"><textarea name="t" rows="2" maxlength="2000" placeholder="Ответ от команды"></textarea><button class="adm-btn" type="submit">Отправить</button></form>` : ""}`);
    const f = $("#tm2F"); if (f) f.addEventListener("submit", e => { e.preventDefault(); const t = f.t.value.trim(); if (!t) return; VO.chats.teamSay(c.owner, t); A.log("Сообщение от команды", c.owner, t); SEC.chats.open(id); });
  } };

  /* ---------- Отзывы ---------- */
  SEC.reviews = { group: "manage", name: "Отзывы", perm: "manage", render() {
    const f = UI.f("reviews", "f"), L = (VO.reviews ? VO.reviews.adminAll() : []).filter(r => !f || (f === "hidden" ? r.hidden : f === "low" ? r.stars <= 2 : f === "nv" ? !r.verified : f === "v" ? r.verified : true)).filter(r => UI.match("reviews", `${r.text} ${r.authorName} ${VO.person(r.target).name}`)).sort((a, b) => b.t - a.t);
    return `${UI.tools("reviews", "Текст, автор или о ком", [["f", [["", "Все отзывы"], ["low", "Оценка 1–2"], ["v", "Со сделкой на сайте"], ["nv", "Без сделки"], ["hidden", "Скрытые"]]]])}
      ${UI.bulk("reviews", [["rvhide", "Скрыть"], ["rvshow", "Показать"], ["rvdel", "Удалить", "danger"]])}
      ${UI.table("reviews", L, [
        ["Отзыв", r => `<div class="acell-rev"><b>${"★".repeat(r.stars)}<i>${"★".repeat(5 - r.stars)}</i></b><span>${esc(r.text)}</span>${r.reply ? `<small>Ответ: ${esc(r.reply)}</small>` : ""}</div>`, "w-wide"],
        ["Автор", r => esc(r.authorName || "—"), "hide-m"],
        ["О ком", r => esc(VO.person(r.target).name), "hide-m"],
        ["Роль", r => r.role === "buyer" ? "о покупателе" : "о продавце", "hide-m"],
        ["Сделка", r => r.verified ? pill("Да", "green") : pill("Нет", "gray")],
        ["Статус", r => r.hidden ? pill("Скрыт", "gray") : pill("Виден", "green")],
      ], { open: false, empty: "Отзывов нет" })}`;
  } };
  const rvBulk = (patch, msg) => { UI.selected("reviews").forEach(id => { VO.reviews.adminSet(id, patch); A.log(msg, id); }); sel.reviews.clear(); VO.toast(msg, 1300); UI.render(); };
  ACT.rvhide = () => rvBulk({ hidden: true }, "Отзыв скрыт");
  ACT.rvshow = () => rvBulk({ hidden: null }, "Отзыв показан");
  ACT.rvdel = async () => { if (!UI.selected("reviews").length) return; if (await UI.ask("Удалить отзывы?", "Удалённые отзывы нельзя восстановить.", "Удалить", true)) rvBulk({ deleted: true }, "Отзыв удалён"); };

  /* ---------- Рассылка ---------- */
  SEC.mail = { group: "manage", name: "Рассылка", perm: "manage", render() {
    const accs = D.users().filter(u => u.kind === "account"), hist = store.get("vo_adm_mail", []);
    return `<div class="agrid2 agrid2--wide"><form class="acard aform aform--flat" id="mlF"><h3>Новое сообщение пользователям</h3>
      <div class="aform__l">Кому</div><div class="achips">${[["all", `Всем · ${accs.length}`], ["ads", `С объявлениями · ${accs.filter(u => D.userAds(u.id).length).length}`], ["noads", `Без объявлений · ${accs.filter(u => !D.userAds(u.id).length).length}`], ["sel", `Выбранным в «Пользователях» · ${UI.selected("users").filter(id => (D.user(id) || {}).kind === "account").length}`]].map(([v, n], i) => `<label><input type="radio" name="to" value="${v}"${i ? "" : " checked"}><span>${n}</span></label>`).join("")}</div>
      <div class="aform__l">Куда</div><div class="achips"><label><input type="checkbox" name="note" checked><span>Уведомление на сайте</span></label><label><input type="checkbox" name="chat"><span>Служебный чат</span></label></div>
      <div class="field"><input name="title" maxlength="80" placeholder=" " required><label>Заголовок</label></div>
      <div class="field field--area"><textarea name="text" rows="5" maxlength="1000" placeholder=" " required></textarea><label>Текст</label></div>
      <div class="field"><input name="link" maxlength="200" placeholder=" "><label>Ссылка внутри сайта, например #/how (необязательно)</label></div>
      <div class="aform__a"><button class="adm-btn" type="submit">Отправить</button></div></form>
      <div class="acard"><h3>История рассылок</h3>${hist.length ? `<ul class="afeed">${hist.map(h => `<li><b>${esc(h.title)}</b><span>${esc(h.text.slice(0, 120))}</span><small>${fmtD(h.t)} · получателей: ${h.n}</small></li>`).join("")}</ul>` : `<p class="muted">Рассылок ещё не было</p>`}</div></div>`;
  }, after(body) { const f = $("#mlF", body); f.addEventListener("submit", async e => {
    e.preventDefault(); const fd = new FormData(f), to = fd.get("to"), title = String(fd.get("title")).trim(), text = String(fd.get("text")).trim(), link = String(fd.get("link")).trim();
    if (title.length < 2 || text.length < 2) return VO.toast("Заполните заголовок и текст");
    if (link && !/^#\//.test(link)) return VO.toast("Ссылка должна начинаться с #/");
    let L = D.users().filter(u => u.kind === "account");
    if (to === "ads") L = L.filter(u => D.userAds(u.id).length); if (to === "noads") L = L.filter(u => !D.userAds(u.id).length); if (to === "sel") L = L.filter(u => UI.selected("users").includes(u.id));
    if (!L.length) return VO.toast("Получателей нет");
    if (!await UI.ask(`Отправить ${L.length} ${VO.plural(L.length, "получателю", "получателям", "получателям")}?`, esc(title), "Отправить")) return;
    L.forEach(u => { if (fd.get("note")) VO.addNote(title, text, { cat: "service", owner: u.email, link: link || null }); if (fd.get("chat")) VO.chats.teamSay(u.email, `${title}\n${text}`); });
    store.set("vo_adm_mail", [{ t: Date.now(), title, text, n: L.length }, ...store.get("vo_adm_mail", [])].slice(0, 50));
    A.log("Рассылка", title, `получателей: ${L.length}`); VO.toast("Отправлено"); UI.render();
  }); } };

  /* ---------- Стоп-слова ---------- */
  SEC.words = { group: "manage", name: "Стоп-слова", perm: "rules", render() {
    const w = A.cfg().words;
    return `<div class="agrid2 agrid2--wide"><form class="acard aform aform--flat" id="wdF"><h3>Свои запрещённые слова</h3><p class="muted">По одному слову или фразе в строке. Объявления, имена, отзывы и сообщения с ними не пропустим. Встроенные фильтры (мат, запрещённые товары, контакты в тексте, спам) работают всегда.</p>
      <div class="field field--area"><textarea name="w" rows="12" maxlength="20000" placeholder=" ">${esc(w.join("\n"))}</textarea><label>Слова — ${w.length}</label></div><div class="aform__a"><button class="adm-btn" type="submit">Сохранить</button></div></form>
      <div class="acard"><h3>Проверить текст</h3><p class="muted">Вставьте текст — покажем, пропустит ли его сайт и почему.</p><div class="field field--area"><textarea id="wdT" rows="4" maxlength="3000" placeholder=" "></textarea><label>Текст для проверки</label></div><div id="wdR" class="awres"></div></div></div>`;
  }, after(body) {
    $("#wdF", body).addEventListener("submit", e => { e.preventDefault(); const list = [...new Set(e.target.w.value.split("\n").map(s => s.trim()).filter(Boolean))].slice(0, 2000); A.setCfg({ words: list }); A.log("Обновлены стоп-слова", "", `всего: ${list.length}`); VO.toast("Сохранено"); UI.render(); });
    const t = $("#wdT", body), r = $("#wdR", body);
    t.addEventListener("input", () => { const v = t.value; if (!v.trim()) { r.innerHTML = ""; return; } r.innerHTML = [["title", "Название объявления"], ["desc", "Описание"], ["name", "Имя"], ["chat", "Сообщение в чате"], ["review", "Отзыв"]].map(([k, n]) => { const m = VO.guard.text(v, k); return `<div class="${m ? "bad" : "ok"}"><b>${n}</b><span>${m ? esc(m) : "Пропустим"}</span></div>`; }).join(""); });
  } };

  /* ---------- Правила сайта ---------- */
  SEC.rules = { group: "manage", name: "Правила сайта", perm: "rules", render() {
    const c = A.cfg();
    const tog = (k, n, d) => `<label class="tog"><span><b>${n}</b><small>${d}</small></span><input type="checkbox" data-cfg="${k}"${c[k] ? " checked" : ""}><span class="sw"></span></label>`;
    return `<section class="acard toggles">${tog("premod", "Проверять каждое объявление", "Новые и изменённые объявления попадут в «Модерацию» и появятся в ленте только после одобрения")}${tog("regOpen", "Открыта регистрация", "Если выключить — войти смогут только уже зарегистрированные")}${tog("bots", "Демо-собеседники", "Тестовые продавцы и покупатели отвечают в чате автоматически. Выключите перед запуском")}</section>
      <section class="acard aform aform--flat"><h3>Лимиты</h3><div class="arow2"><div class="field"><input type="number" min="1" max="200" data-cfgn="dayLimit" value="${c.dayLimit}" placeholder=" "><label>Объявлений в сутки от одного человека</label></div><div class="field"><input type="number" min="1" max="20" data-cfgn="maxPhotos" value="${c.maxPhotos}" placeholder=" "><label>Фото в объявлении</label></div></div><p class="muted">Сохраняется сразу.</p></section>`;
  }, change(t) {
    if (t.dataset.cfg) { A.setCfg({ [t.dataset.cfg]: t.checked }); A.log("Правило сайта изменено", t.closest("label").querySelector("b").textContent, t.checked ? "вкл." : "выкл."); VO.toast("Сохранено", 1100); }
    if (t.dataset.cfgn) { const v = Math.max(+t.min, Math.min(+t.max, Math.round(+t.value) || +t.min)); t.value = v; A.setCfg({ [t.dataset.cfgn]: v }); A.log("Лимит изменён", t.dataset.cfgn, v); VO.toast("Сохранено", 1100); }
  } };

  /* ---------- Журнал ---------- */
  SEC.log = { group: "manage", name: "Журнал действий", perm: "manage", render() {
    const L = A.logs().filter(l => UI.match("log", `${l.act} ${l.target} ${l.info} ${l.who}`)).filter(l => !UI.f("log", "who") || l.who === UI.f("log", "who"));
    const whos = [...new Set(A.logs().map(l => l.who))];
    return `<div class="ahead"><p class="muted">Все действия команды: кто, что и когда. Хранится 2000 последних записей.</p><button class="adm-btn adm-btn--ghost" type="button" data-a="logcsv">Скачать CSV</button></div>
      ${UI.tools("log", "Действие, объект или комментарий", [["who", [["", "Все участники"], ...whos.map(w => [w, w])]]])}
      ${UI.table("log", L, [["Когда", l => fmtD(l.t), "nw"], ["Кто", l => esc(l.who), "hide-m"], ["Действие", l => `<b>${esc(l.act)}</b>`], ["Объект", l => esc(l.target)], ["Подробности", l => esc(l.info), "hide-m"]], { open: false, empty: "Записей нет" })}`;
  } };
  const download = (name, text, type = "text/plain") => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); };
  UI.download = download;
  ACT.logcsv = () => { const rows = [["Когда", "Кто", "Действие", "Объект", "Подробности"], ...A.logs().map(l => [new Date(l.t).toLocaleString("ru-RU"), l.who, l.act, l.target, l.info])]; download("journal.csv", "﻿" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n"), "text/csv"); };

  /* ---------- Данные ---------- */
  const KEYN = { vo_accounts: "Аккаунты", vo_my_ads: "Объявления пользователей (с фото)", vo_chats: "Переписки", vo_notes: "Уведомления", vo_reviews: "Отзывы", vo_tickets: "Обращения", vo_reports: "Жалобы", vo_adm_log: "Журнал действий", vo_site_text: "Тексты сайта", vo_site_cats: "Категории", vo_site_brand: "Логотип и цвет", vo_adm_ads: "Изменения тестовых объявлений", vo_adm_users: "Ограничения пользователей", vo_adm_cfg: "Правила сайта" };
  SEC.data = { group: "manage", name: "Данные", perm: "data", render() {
    const keys = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^vo_/.test(k)) keys.push([k, (localStorage.getItem(k) || "").length * 2]); } } catch (e) {}
    keys.sort((a, b) => b[1] - a[1]); const tot = keys.reduce((s, k) => s + k[1], 0);
    return `<div class="agrid2 agrid2--wide"><section class="acard"><h3>Что занимает место</h3><p class="muted">Всего ${(tot / 1048576).toFixed(2)} МБ из примерно 5 МБ, доступных браузеру.</p>${UI.hbars(keys.slice(0, 12).map(([k, n]) => [KEYN[k] || k, Math.round(n / 1024)]))}<small class="muted">в килобайтах</small></section>
      <section class="acard"><h3>Резервная копия</h3><p class="muted">Все данные сайта одним файлом: пользователи, объявления, переписки, настройки. Пригодится при переносе на сервер.</p><div class="abtns"><button class="adm-btn" type="button" data-a="backup">Скачать копию</button><label class="adm-btn adm-btn--ghost">Восстановить из файла<input type="file" accept="application/json,.json" hidden data-a="restore"></label></div>
        <h3>Очистка</h3><div class="abtns"><button class="adm-btn adm-btn--ghost" type="button" data-a="wipe" data-k="demo">Удалить демо-переписки</button><button class="adm-btn adm-btn--ghost" type="button" data-a="wipe" data-k="log">Очистить журнал</button><button class="adm-btn adm-btn--danger" type="button" data-a="wipe" data-k="site">Сбросить оформление сайта</button></div><p class="muted">«Сбросить оформление» вернёт исходные тексты, категории, логотип, цвет и контакты.</p></section></div>`;
  }, change(t) { if (t.dataset.a === "restore" && t.files[0]) restore(t.files[0]); } };
  ACT.backup = () => { const o = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^vo_/.test(k)) o[k] = localStorage.getItem(k); } } catch (e) {} A.log("Скачана резервная копия"); download(`vseobyavleniya-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ app: "vseobyavleniya", v: 1, t: Date.now(), data: o }), "application/json"); };
  async function restore(file) {
    if (file.size > 20e6) return VO.toast("Файл слишком большой");
    let j; try { j = JSON.parse(await file.text()); } catch (e) { return VO.toast("Это не файл резервной копии"); }
    if (!j || j.app !== "vseobyavleniya" || typeof j.data !== "object") return VO.toast("Это не файл резервной копии этого сайта");
    if (!await UI.ask("Восстановить из копии?", `Копия от ${fmtD(j.t)}. Текущие данные будут заменены.`, "Восстановить", true)) return;
    const keep = { s: store.get("vo_session", null) };
    Object.entries(j.data).forEach(([k, v]) => { if (/^vo_[a-z_0-9]+$/.test(k) && typeof v === "string") try { localStorage.setItem(k, v); } catch (e) {} });
    store.set("vo_session", keep.s); A.log("Данные восстановлены из копии", "", fmtD(j.t)); location.reload();
  }
  ACT.wipe = async el => {
    const k = el.dataset.k;
    if (k === "demo") { if (!await UI.ask("Удалить демо-переписки?", "Диалоги с тестовыми продавцами и демо-покупателями будут удалены.", "Удалить", true)) return; const keep = VO.chats.all().filter(c => !(window.VO_SELLERS[c.peer] || (window.VO_DEMO_BUYERS || {})[c.peer])); store.set("vo_chats", keep); A.log("Удалены демо-переписки"); location.reload(); }
    if (k === "log") { if (!await UI.ask("Очистить журнал?", "", "Очистить", true)) return; store.set("vo_adm_log", []); A.log("Журнал очищен"); UI.render(); }
    if (k === "site") { if (!await UI.ask("Сбросить оформление?", "Тексты, категории, логотип, цвет и контакты вернутся к исходным.", "Сбросить", true, "сбросить")) return; ["vo_site_text", "vo_site_cats", "vo_site_brand", "vo_site_contacts"].forEach(store.del); A.log("Оформление сайта сброшено"); location.reload(); }
  };

  /* ---------- Команда ---------- */
  const PERMS = [["Модерация, объявления, пользователи, жалобы", ["owner", "admin", "moder"]], ["Обращения", ["owner", "admin", "moder", "support"]], ["Тексты, категории, логотип", ["owner", "admin"]], ["Правила сайта и стоп-слова", ["owner", "admin"]], ["Резервные копии", ["owner", "admin"]], ["Состав команды", ["owner"]]];
  SEC.team = { group: "manage", name: "Команда", perm: "team", render() {
    const t = A.cfg().team, own = String(window.VO_CONTACTS.email).toLowerCase();
    return `<div class="agrid2 agrid2--wide"><section class="acard"><h3>Участники</h3><ul class="alist"><li>${ava("В")}<span><b>${esc(own)}</b><small>Владелец — почта из раздела «Контакты»</small></span>${pill("Владелец", "blue")}</li>${t.map(m => `<li>${ava(m.email)}<span><b>${esc(m.email)}</b><small>${A.ROLES[m.role]}</small></span><select data-team="${esc(m.email)}">${Object.entries(A.ROLES).filter(([k]) => k !== "owner").map(([k, n]) => `<option value="${k}"${m.role === k ? " selected" : ""}>${n}</option>`).join("")}</select><button type="button" class="adm-btn adm-btn--text adm-btn--sm" data-a="tmrm" data-e="${esc(m.email)}">Убрать</button></li>`).join("")}</ul>
      <form class="athread__f" id="tmAdd"><input name="e" type="email" maxlength="120" placeholder="Почта нового участника"><select name="r">${Object.entries(A.ROLES).filter(([k]) => k !== "owner").map(([k, n]) => `<option value="${k}">${n}</option>`).join("")}</select><button class="adm-btn" type="submit">Добавить</button></form></section>
      <section class="acard"><h3>Кто что может</h3><table class="atable atable--perm"><thead><tr><th></th>${Object.values(A.ROLES).map(n => `<th>${n}</th>`).join("")}</tr></thead><tbody>${PERMS.map(([n, r]) => `<tr><td>${n}</td>${Object.keys(A.ROLES).map(k => `<td>${r.includes(k) ? "✓" : "—"}</td>`).join("")}</tr>`).join("")}</tbody></table></section></div>`;
  }, after(body) { $("#tmAdd", body).addEventListener("submit", e => { e.preventDefault(); const em = e.target.e.value.trim().toLowerCase(); if (!VO.MAIL_RX.test(em)) return VO.toast("Проверьте почту"); A.setCfg({ team: [...A.cfg().team.filter(x => x.email !== em), { email: em, role: e.target.r.value }] }); A.log("Участник команды добавлен", em, A.ROLES[e.target.r.value]); UI.render(); }); },
  change(t) { if (t.dataset.team) { A.setCfg({ team: A.cfg().team.map(m => m.email === t.dataset.team ? { ...m, role: t.value } : m) }); A.log("Роль изменена", t.dataset.team, A.ROLES[t.value]); VO.toast("Сохранено", 1100); } } };
  ACT.tmrm = el => { A.setCfg({ team: A.cfg().team.filter(m => m.email !== el.dataset.e) }); A.log("Участник команды убран", el.dataset.e); UI.render(); };

})();
