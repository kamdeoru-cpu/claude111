/* Личный кабинет и публичный профиль */
(() => {
  const { $, $$, esc, store, state: S } = VO;
  const COLORS = ["#16181D", "#FF4F3A", "#2F7DE1", "#2F9E6E", "#8A5CF6", "#E0913A"];
  const I = (d, w = 20) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const NAV = [
    ["", "Обзор", I('<path d="M4 13h6V4H4Zm10 7h6v-9h-6ZM4 20h6v-4H4Zm10-11h6V4h-6Z"/>')],
    ["ads", "Мои объявления", I('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/>')],
    ["msg", "Сообщения", I('<path d="M4.5 4.5h10a5.5 5.5 0 0 1 0 11H8.5l-4 4Z"/>')],
    ["deals", "Сделки", I('<path d="M3 8 12 3l9 5v8l-9 5-9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/>')],
    ["fav", "Избранное и поиски", I('<path d="M12 20s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.7 12 20 12 20Z"/>')],
    ["reviews", "Отзывы", I('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>')],
    ["notif", "Уведомления", I('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15ZM10 20.5a2 2 0 0 0 4 0"/>')],
    ["tickets", "Обращения", I('<path d="M4 6h16v12H4Z"/><path d="m4 7 8 6 8-6"/>')],
    ["profile", "Профиль", I('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>')],
    ["security", "Безопасность", I('<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/>')],
  ];
  const page = VO.page("me");
  const myAds = (all = true) => S.mine.filter(a => a.owner === VO.user().email && (all || a.status !== "archived")).map(a => ({ ...a, mine: true }));
  const profileLink = u => location.href.split("#")[0] + "#/u/" + VO.uid(u.email);
  const completeness = u => { const items = [["Имя", !!u.name], ["Телефон", !!u.phone && !VO.phoneProblem(u.phone)], ["Город", !!u.city], ["Пара слов о себе", !!u.about], ["Первое объявление", myAds().length > 0]]; return { items, pct: Math.round(items.filter(i => i[1]).length / items.length * 100) }; };
  const ring = (pct, size = 76) => { const r = size / 2 - 6, c = 2 * Math.PI * r; return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#F4F5F7" stroke-width="8"/><circle class="ring__v" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#FF4F3A" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" style="--c:${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-weight="800" font-size="17" fill="#16181D">${pct}%</text></svg>`; };
  const greet = () => { const h = new Date().getHours(); return h < 6 ? "Доброй ночи" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер"; };
  const thumb = a => `<span class="row-ad__img" style="background:${a.bg}">${a.photo ? `<img src="${a.photo}" alt="">` : window.VO_ILL[a.ill]}</span>`;

  function shell(tab, inner) {
    const u = VO.user(), mine = myAds(false).length;
    const activeDeals = VO.chats ? VO.chats.list("deals").filter(c => !["done", "cancelled"].includes(c.deal.stage)).length : 0;
    const counts = { ads: mine, fav: S.favs.size, msg: VO.chats ? VO.chats.unread() : 0, deals: activeDeals, notif: VO.myNotes().filter(n => !n.read).length, tickets: VO.tickets ? VO.tickets().length : 0 };
    const hot = { msg: 1, notif: 1, deals: 1 };
    page.innerHTML = `<div class="wrap cab">
      <aside class="cab__nav">
        <a class="cab__me" href="#/me" title="Обзор"><span class="cab__ava" style="background:${u.color}">${esc((VO.displayName(u) || u.email)[0].toUpperCase())}</span><div><b>${esc(VO.displayName(u) || "Без имени")}</b><small>${VO.kind(u)}${VO.rating ? VO.rating.short(VO.me()) : ""}</small></div></a>
        <nav>${NAV.map(([k, n, ic]) => `<a href="#/me${k ? "/" + k : ""}" class="${k === tab ? "on" : ""}">${ic}<span>${n}</span>${counts[k] ? `<small class="${hot[k] ? "hot" : ""}">${counts[k]}</small>` : ""}</a>`).join("")}</nav>
        <a class="btn btn--accent btn--wide cab__post" href="#/post">+ Разместить объявление</a>
        <a class="cab__pub" href="#/u/${VO.uid(u.email)}">Мой публичный профиль ${VO.ico.chev}</a>
      </aside>
      <div class="cab__main">${inner}</div></div>`;
    VO.show("me", "Личный кабинет");
    page.querySelectorAll(".cab__main > *").forEach((el, i) => el.style.setProperty("--i", i));
    page.classList.toggle("is-chat", tab === "msg");
    document.documentElement.classList.toggle("in-chat", tab === "msg");
  }

  /* ---------- обзор ---------- */
  function overview() {
    const u = VO.user(), ads = myAds(false), cm = completeness(u);
    const week = Array(7).fill(0); ads.forEach(a => VO.viewsByDay(a, 7).forEach((v, i) => week[i] += v));
    const wsum = week.reduce((s, v) => s + v, 0);
    const searches = store.get("vo_searches", []).filter(s => s.owner === u.email);
    const chats = VO.chats ? VO.chats.list() : [], unread = VO.chats ? VO.chats.unread() : 0;
    const deals = chats.filter(c => c.deal && !["done", "cancelled"].includes(c.deal.stage));
    const rt = VO.rating(VO.me());
    const days = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"], lbl = Array.from({ length: 7 }, (_, i) => days[(new Date(Date.now() - (6 - i) * 864e5).getDay() + 6) % 7]);
    shell("", `
      <header class="cab__hi"><div><span class="muted">${new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</span><h1>${greet()}, ${esc(u.name || "друг")}!</h1></div><div class="cab__hi-a"><a class="btn btn--ghost" href="#/u/${VO.uid(u.email)}">Мой профиль</a><button class="btn btn--ghost" type="button" data-share-profile>${VO.ico.share}Поделиться</button></div></header>
      ${cm.pct < 100 ? `<section class="cab-card cab-done">${ring(cm.pct)}<div><b>Профиль заполнен на ${cm.pct}%</b><span>Заполненным профилям больше доверяют и чаще пишут.</span><div class="cab-done__todo">${cm.items.filter(i => !i[1]).map(([n]) => `<a href="${n === "Первое объявление" ? "#/post" : "#/me/profile"}">+ ${n}</a>`).join("")}</div></div></section>` : ""}
      <section class="kpis">
        <a class="kpi" href="#/me/ads"><small>Активные объявления</small><b>${ads.length}</b><span>${myAds().filter(a => a.status === "sold").length} продано · ${myAds().filter(a => a.status === "archived").length} снято</span></a>
        <a class="kpi" href="#/me/msg"><small>Сообщения</small><b>${unread}</b><span>${unread ? "непрочитанных" : "всё прочитано"} · ${chats.length} ${VO.plural(chats.length, "диалог", "диалога", "диалогов")}</span></a>
        <a class="kpi" href="#/me/deals"><small>Сделки в работе</small><b>${deals.length}</b><span>${chats.filter(c => c.deal && c.deal.stage === "done").length} завершено</span></a>
        <a class="kpi" href="#/me/reviews"><small>Рейтинг</small><b>${rt.n ? rt.avg.toFixed(1).replace(".", ",") : "—"}</b><span>${rt.n} ${VO.plural(rt.n, "отзыв", "отзыва", "отзывов")}</span></a>
      </section>
      <div class="cab-2">
        <section class="cab-card chart"><div class="cab-card__h"><h2>Просмотры ваших объявлений</h2><span class="muted">${VO.DEMO ? "демо" : "7 дней"}</span></div>
          <div class="bars">${week.map((v, i) => `<div class="bars__c"><i style="height:${Math.max(4, v / Math.max(1, ...week) * 100)}%"><em>${v}</em></i><span>${lbl[i]}</span></div>`).join("")}</div>
          <div class="chart__f"><b>${wsum}</b> за неделю${ads.length ? "" : " · появятся после первого объявления"}</div></section>
        <section class="cab-card"><div class="cab-card__h"><h2>Нужно ваше внимание</h2></div>
          ${(() => { const items = []; deals.forEach(c => { const d = c.deal, seller = c.role === "seller"; if (d.stage === "proposed" && d.by === "peer") items.push([`#/me/msg/${c.id}`, "Предложение сделки", `${VO.person(c.peer).name} · «${c.ad.title}»`]); if (d.stage === "agreed" && seller) items.push([`#/me/msg/${c.id}`, d.method === "ship" ? "Отправьте посылку" : "Передайте вещь", `«${c.ad.title}»`]); if (d.stage === "transfer" && !seller) items.push([`#/me/msg/${c.id}`, "Подтвердите получение", `«${c.ad.title}»`]); });
            chats.filter(c => c.msgs.some(m => m.from === "peer" && !m.read)).slice(0, 3).forEach(c => items.push([`#/me/msg/${c.id}`, "Новое сообщение", `${VO.person(c.peer).name} · «${c.ad.title}»`]));
            return items.length ? items.slice(0, 5).map(([h, t, d]) => `<a class="todo" href="${h}"><i></i><span><b>${esc(t)}</b><small>${esc(d)}</small></span>${VO.ico.chev}</a>`).join("") : `<div class="cab-empty"><b>Всё спокойно</b><span>Здесь появятся сообщения без ответа и шаги по сделкам.</span></div>`; })()}</section>
      </div>
      <div class="cab-2">
        <section class="cab-card"><div class="cab-card__h"><h2>Мои объявления</h2><a href="#/me/ads">Все</a></div>
          ${ads.length ? ads.slice(0, 4).map(a => `<a class="mini-row" href="#/ad/${a.id}">${thumb(a)}<span><b>${esc(a.title)}</b><small>${a.price ? VO.rub(a.price) : "Даром"} · ${VO.ico.eye} ${VO.views(a)} · ${VO.chats ? VO.chats.forAd(a.id).length : 0} ${VO.plural(VO.chats ? VO.chats.forAd(a.id).length : 0, "диалог", "диалога", "диалогов")}</small></span></a>`).join("")
            : `<div class="cab-empty"><b>Здесь появятся ваши объявления</b><span>Продайте то, что давно не используете, — это бесплатно.</span><a class="btn btn--ink" href="#/post">Разместить первое</a></div>`}</section>
        <section class="cab-card"><div class="cab-card__h"><h2>Уведомления</h2><a href="#/me/notif">Все</a></div>
          ${VO.myNotes().slice(0, 4).map(n => `<a class="note-i${n.read ? "" : " unread"}" href="${n.link || "#/me/notif"}" data-note="${n.id}"><i>${VO.noteIcon(n.cat)}</i><div><b>${esc(n.title)}</b><span>${esc(n.text)}</span><small>${VO.timeAgo(n.t)}</small></div></a>`).join("")}</section>
      </div>
      <section class="roles">
        <div class="role"><b>Продаёте?</b><span>Хорошие фото, честное описание и цена чуть ниже рынка — и объявление уходит быстрее.</span><a href="#/how">Как продать быстрее →</a></div>
        <div class="role"><b>Покупаете?</b><span>Сохраните поиск — пришлём уведомление, когда появится подходящее. Сейчас сохранено: ${searches.length}.</span><a href="#/me/fav">Сохранённые поиски →</a></div>
        <div class="role role--safe"><b>Безопасность</b><span>Не переводите предоплату незнакомым и не сообщайте коды из СМС.</span><a href="#/safety">Правила безопасности →</a></div>
      </section>`);
  }
  page.addEventListener("click", e => { const n = e.target.closest("[data-note]"); if (n) VO.readNote(n.dataset.note); });

  /* ---------- мои объявления ---------- */
  let adsTab = "active";
  function ads() {
    const all = myAds(), list = all.filter(a => adsTab === "active" ? a.status === "active" || !a.status : adsTab === "sold" ? a.status === "sold" : a.status === "archived");
    shell("ads", `
      <header class="cab__hi"><div><h1>Мои объявления</h1><span class="muted">${VO.DEMO ? "Просмотры пока моделируются — настоящая статистика появится с сервером." : ""}</span></div><a class="btn btn--accent" href="#/post">+ Новое объявление</a></header>
      <div class="tabs" role="tablist" id="adsTabs"><button role="tab" data-t="active" aria-selected="${adsTab === "active"}">Активные · ${all.filter(a => a.status === "active" || !a.status).length}</button><button role="tab" data-t="sold" aria-selected="${adsTab === "sold"}">Проданные · ${all.filter(a => a.status === "sold").length}</button><button role="tab" data-t="archived" aria-selected="${adsTab === "archived"}">Снятые · ${all.filter(a => a.status === "archived").length}</button><span class="tabs__ink"></span></div>
      <div class="row-ads">${list.length ? list.map(a => { const w = VO.viewsByDay(a, 7); return `<article class="row-ad" data-id="${a.id}">
        <a href="#/ad/${a.id}">${thumb(a)}</a>
        <div class="row-ad__t"><a href="#/ad/${a.id}"><b>${esc(a.title)}</b></a><span>${a.price ? VO.rub(a.price) : "Даром"} · ${esc(VO.catName(a.cat))} · ${VO.agoText(a)}</span><span class="pill ${a.status === "active" ? "pill--on" : ""}">${a.status === "archived" ? "Снято" : a.status === "sold" ? "Продано" : "В ленте"}</span></div>
        <div class="row-ad__st"><b>${VO.views(a)}</b><small>просмотров</small>${VO.spark(w, 110, 32)}<a class="row-ad__chats" href="#/me/msg">${VO.chats ? VO.chats.forAd(a.id).length : 0} ${VO.plural(VO.chats ? VO.chats.forAd(a.id).length : 0, "диалог", "диалога", "диалогов")}</a></div>
        <div class="row-ad__acts"><a class="icb" href="#/post?edit=${a.id}" title="Редактировать" aria-label="Редактировать">${VO.ico.edit}</a><button class="icb" type="button" data-act="share" title="Поделиться" aria-label="Поделиться">${VO.ico.share}</button><button class="btn btn--ghost btn--sm" type="button" data-act="arch">${a.status === "active" ? "Снять" : "Вернуть"}</button><button class="icb icb--del" type="button" data-act="del" title="Удалить" aria-label="Удалить">${I('<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>', 16)}</button></div>
      </article>`; }).join("") : `<div class="cab-empty cab-empty--big"><svg width="120" height="90" viewBox="0 0 120 90"><rect x="20" y="10" width="60" height="70" rx="10" fill="#F4F5F7"/><path d="M34 30h32M34 42h20" stroke="#D5D8DE" stroke-width="6" stroke-linecap="round"/><circle cx="86" cy="62" r="18" fill="#FF4F3A"/><path d="M86 54v16M78 62h16" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg><b>${adsTab === "active" ? "Нет активных объявлений" : "Снятых объявлений нет"}</b><span>Размещение бесплатное и занимает пару минут.</span><a class="btn btn--ink" href="#/post">Разместить объявление</a></div>`}</div>`);
  }
  page.addEventListener("click", e => {
    const t = e.target.closest("[data-t]"); if (t && t.closest("#adsTabs")) { adsTab = t.dataset.t; return ads(); }
    const act = e.target.closest("[data-act]"); if (!act) return;
    const id = act.closest("[data-id]").dataset.id, m = S.mine.find(a => a.id === id);
    if (act.dataset.act === "share") return VO.share({ title: m.title, url: location.href.split("#")[0] + "#/ad/" + id });
    if (act.dataset.act === "arch") { m.status = m.status === "active" ? "archived" : "active"; VO.saveMine(); VO.emit("mine"); VO.toast(m.status === "archived" ? "Снято с публикации" : "Снова в ленте"); return ads(); }
    if (act.dataset.act === "del") confirmBox("Удалить объявление?", `«${esc(m.title)}» исчезнет навсегда. Если просто продали — лучше снять с публикации.`, "Удалить", () => { S.mine = S.mine.filter(a => a.id !== id); VO.state.mine = S.mine; VO.saveMine(); VO.emit("mine"); VO.toast("Объявление удалено"); ads(); });
  });
  function confirmBox(title, text, yes, fn, typed) {
    const el = VO.sheet(`<div class="confirm"><h3>${title}</h3><p>${text}</p>${typed ? `<div class="field"><input id="cfT" placeholder=" " autocomplete="off"><label for="cfT">Введите «${typed}»</label></div>` : ""}<div class="confirm__b"><button class="btn btn--ghost" type="button" data-sheet-close>Отмена</button><button class="btn btn--danger" type="button" id="cfY"${typed ? " disabled" : ""}>${yes}</button></div></div>`, { cls: "sheet--sm" });
    if (typed) $("#cfT", el).addEventListener("input", e => { $("#cfY", el).disabled = e.target.value.trim().toUpperCase() !== typed; });
    $("#cfY", el).addEventListener("click", () => { VO.closeSheet(true); fn(); });
  }

  /* ---------- избранное и поиски ---------- */
  function fav() {
    const u = VO.user(), list = VO.allAds().filter(a => S.favs.has(a.id)), ss = store.get("vo_searches", []).filter(s => s.owner === u.email);
    shell("fav", `
      <header class="cab__hi"><h1>Избранное и поиски</h1></header>
      <section class="cab-card"><div class="cab-card__h"><h2>Сохранённые поиски</h2><span class="muted">Сообщим о новых объявлениях</span></div>
        ${ss.length ? `<ul class="saved">${ss.map(s => `<li data-sid="${s.id}"><a href="${esc(s.hash)}">${I('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 4.5 4.5"/>', 18)}<span><b>${esc(s.title)}</b><small>сохранён ${new Date(s.t).toLocaleDateString("ru-RU")}</small></span></a><label class="switch-l" title="Уведомления"><input type="checkbox" data-snotify${s.notify ? " checked" : ""}><span class="sw"></span></label><button class="icb icb--del" type="button" data-sdel aria-label="Удалить">×</button></li>`).join("")}</ul>`
          : `<div class="cab-empty"><b>Сохранённых поисков нет</b><span>Откройте категорию или результаты поиска и нажмите «Сохранить поиск».</span></div>`}</section>
      <section><div class="cab-card__h"><h2>Избранные объявления · ${list.length}</h2></div>
        ${list.length ? `<div class="grid grid--cab">${list.map(VO.cardHTML).join("")}</div>` : `<div class="cab-empty cab-empty--big"><b>Пока пусто</b><span>Нажимайте на сердечко у объявлений — они соберутся здесь.</span><a class="btn btn--ink" href="#/">Смотреть объявления</a></div>`}</section>`);
    VO.animateCards(page);
  }
  page.addEventListener("change", e => { const n = e.target.closest("[data-snotify]"); if (n) { const id = +n.closest("[data-sid]").dataset.sid, all = store.get("vo_searches", []); const s = all.find(x => x.id === id); s.notify = n.checked; store.set("vo_searches", all); VO.toast(n.checked ? "Уведомления включены" : "Уведомления выключены", 1600); } });
  page.addEventListener("click", e => { const d = e.target.closest("[data-sdel]"); if (d) { const id = +d.closest("[data-sid]").dataset.sid; store.set("vo_searches", store.get("vo_searches", []).filter(s => s.id !== id)); fav(); } });

  /* ---------- сообщения ---------- */
  const msg = id => { shell("msg", `<div id="chatHost"></div>`); VO.chats.render($("#chatHost", page), id); };

  /* ---------- сделки ---------- */
  let dealsF = "active";
  function deals() {
    const all = VO.chats.list("deals").concat(VO.chats.list().filter(c => c.deal && c.deal.stage === "cancelled")).filter((c, i, a) => a.indexOf(c) === i);
    const F = { active: c => !["done", "cancelled"].includes(c.deal.stage), done: c => c.deal.stage === "done", cancelled: c => c.deal.stage === "cancelled" };
    const list = all.filter(F[dealsF]);
    const ST = { proposed: "Предложена", agreed: "Договорились", transfer: "Передача", done: "Завершена", cancelled: "Отменена" };
    shell("deals", `<header class="cab__hi"><div><h1>Сделки</h1><span class="muted">Сделку оформляют в переписке. Деньги через сайт не проходят — этапы нужны, чтобы обоим было понятно, что происходит.</span></div></header>
      <div class="tabs" role="tablist" id="dealsTabs">${[["active", "В работе"], ["done", "Завершённые"], ["cancelled", "Отменённые"]].map(([k, n]) => `<button role="tab" data-df="${k}" aria-selected="${dealsF === k}">${n} · ${all.filter(F[k]).length}</button>`).join("")}<span class="tabs__ink"></span></div>
      <div class="row-ads">${list.length ? list.map(c => { const p = VO.person(c.peer), d = c.deal; return `<a class="row-ad deal-row" href="#/me/msg/${c.id}">${thumb(c.ad)}
        <div class="row-ad__t"><b>${esc(c.ad.title)}</b><span>${c.role === "seller" ? "Покупатель" : "Продавец"}: ${esc(p.name)} · ${d.method === "ship" ? "отправка" : "встреча"} · ${d.price ? VO.rub(d.price) : "даром"}</span><span class="pill st-${d.stage}">${ST[d.stage]}</span></div>
        <div class="deal-mini">${["agreed", "transfer", "done"].map((k, i) => `<i class="${["agreed", "transfer", "done"].indexOf(d.stage) >= i ? "on" : ""}"></i>`).join("")}<small>${d.id}</small></div>${VO.ico.chev}</a>`; }).join("")
        : `<div class="cab-empty cab-empty--big"><b>${dealsF === "active" ? "Сделок в работе нет" : "Здесь пока пусто"}</b><span>Договоритесь в переписке и нажмите «Оформить сделку» — она появится здесь.</span><a class="btn btn--ink" href="#/me/msg">К сообщениям</a></div>`}</div>`);
  }
  page.addEventListener("click", e => { const d = e.target.closest("[data-df]"); if (d) { dealsF = d.dataset.df; deals(); } });

  /* ---------- отзывы ---------- */
  let revTab = "about";
  function reviews() {
    const me = VO.me(), mineW = VO.reviews.by(me);
    shell("reviews", `<header class="cab__hi"><div><h1>Отзывы</h1><span class="muted">Отзывы со сделкой на сайте отмечены — им доверяют больше.</span></div><a class="btn btn--ghost" href="#/u/${me}">Как видят другие</a></header>
      <div class="tabs" role="tablist" id="revTabs"><button role="tab" data-rt="about" aria-selected="${revTab === "about"}">Обо мне · ${VO.reviews.of(me).length}</button><button role="tab" data-rt="mine" aria-selected="${revTab === "mine"}">Мои отзывы · ${mineW.length}</button><span class="tabs__ink"></span></div>
      ${revTab === "about" ? VO.reviews.block(me) : `<div class="revs__list">${mineW.length ? mineW.map(r => `<div class="rev-w"><a href="#/u/${r.target}">${esc(VO.person(r.target).name)}</a>${VO.reviews.card(r)}<button class="link" type="button" data-rev-edit="${r.target}" data-role="${r.role}">Изменить</button></div>`).join("") : `<div class="cab-empty cab-empty--big"><b>Вы ещё не оставляли отзывов</b><span>Оставить отзыв можно в профиле любого пользователя или после сделки в переписке.</span></div>`}</div>`}`);
  }
  page.addEventListener("click", e => { const t = e.target.closest("[data-rt]"); if (t) { revTab = t.dataset.rt; reviews(); } const ed = e.target.closest("[data-rev-edit]"); if (ed) VO.reviews.form(ed.dataset.revEdit, ed.dataset.role); });

  /* ---------- центр уведомлений ---------- */
  let nCat = "all", nTab = "list";
  function notif() {
    const u = VO.user(), all = VO.myNotes();
    if (nTab === "settings") return notifSettings();
    const L = all.filter(n => nCat === "all" || (nCat === "unread" ? !n.read : n.cat === nCat));
    const groups = {}; L.forEach(n => { const d = VO.timeAgo(n.t).includes("назад") || VO.timeAgo(n.t) === "только что" ? "Сегодня" : new Date(n.t).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }); (groups[d] = groups[d] || []).push(n); });
    shell("notif", `<header class="cab__hi"><div><h1>Уведомления</h1><span class="muted">${all.filter(n => !n.read).length} непрочитанных</span></div><div class="cab__hi-a">${all.some(n => !n.read) ? `<button class="btn btn--ghost" type="button" data-nread>Прочитать все</button>` : ""}<button class="btn btn--ghost" type="button" data-ntab="settings">Настройки</button></div></header>
      <div class="chips chips--s ncats">${[["all", "Все"], ["unread", "Непрочитанные"], ...Object.entries(VO.NOTE_CATS)].map(([k, n]) => { const c = k === "all" ? all.length : k === "unread" ? all.filter(x => !x.read).length : all.filter(x => x.cat === k).length; return `<button type="button" data-ncat="${k}" aria-pressed="${nCat === k}">${n} <small>${c}</small></button>`; }).join("")}</div>
      <section class="cab-card nlist">${L.length ? Object.entries(groups).map(([d, ns]) => `<div class="nday">${d}</div>` + ns.map(n => `<a class="note-i${n.read ? "" : " unread"}" href="${n.link || "#/me/notif"}" data-note="${n.id}"><i>${VO.noteIcon(n.cat)}</i><div><b>${esc(n.title)}</b><span>${esc(n.text)}</span><small>${VO.NOTE_CATS[n.cat] || "Сервис"} · ${new Date(n.t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</small></div>${n.read ? "" : '<em class="ndot" title="Не прочитано"></em>'}</a>`).join("")).join("") : `<div class="cab-empty"><b>Здесь пусто</b><span>Уведомления по выбранной категории появятся здесь.</span></div>`}</section>`);
  }
  function notifSettings() {
    const u = VO.user(), n = u.notif || {};
    const T = [["msg", "Новые сообщения", "Когда вам пишут по объявлению"], ["deal", "Сделки", "Предложения сделок и смена этапов"], ["review", "Отзывы", "Когда о вас оставили отзыв"], ["fav", "Избранное", "Если продавец снизил цену или снял объявление"], ["search", "Сохранённые поиски", "Новые объявления по вашим поискам"], ["news", "Новости сервиса", "Не чаще раза в месяц, только важное"]];
    shell("notif", `<header class="cab__hi"><div><h1>Настройки уведомлений</h1><span class="muted">На сайте уведомления видны всегда. Здесь — что дублировать на ${esc(u.email)}</span></div><button class="btn btn--ghost" type="button" data-ntab="list">← К уведомлениям</button></header>
      <section class="cab-card toggles">${T.map(([k, t, d]) => `<label class="tog"><span><b>${t}</b><small>${d}</small></span><input type="checkbox" data-n="${k}"${n[k] !== false && (n[k] || ["msg", "deal", "review"].includes(k)) ? " checked" : ""}><span class="sw"></span></label>`).join("")}</section>`);
    page.querySelectorAll("[data-n]").forEach(c => c.addEventListener("change", () => { u.notif = { ...u.notif, [c.dataset.n]: c.checked }; VO.saveUser(u); VO.toast("Сохранено", 1400); }));
  }
  page.addEventListener("click", e => {
    const c = e.target.closest("[data-ncat]"); if (c) { nCat = c.dataset.ncat; notif(); }
    const t = e.target.closest("[data-ntab]"); if (t) { nTab = t.dataset.ntab; notif(); }
    if (e.target.closest("[data-nread]")) { VO.readAllNotes(); notif(); }
  });

  /* ---------- обращения ---------- */
  function tickets() {
    const L = VO.tickets();
    shell("tickets", `<header class="cab__hi"><div><h1>Обращения</h1><span class="muted">Сообщения, которые вы отправляли через «Написать нам» — в том числе до регистрации, с этого устройства или с вашей почты.</span></div><a class="btn btn--ink" href="#/contact">Новое обращение</a></header>
      <div class="row-ads">${L.length ? L.map(t => `<article class="ticket"><header><b>${esc(t.topic)}</b><span class="pill ${t.status === "answered" ? "pill--on" : ""}">${t.status === "answered" ? "Есть ответ" : "Отправлено"}</span><small>№ ${t.id.slice(-6).toUpperCase()} · ${new Date(t.t).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</small></header><p>${esc(t.msg)}</p><footer class="muted">Ответ придёт на ${esc(t.email)}</footer></article>`).join("")
        : `<div class="cab-empty cab-empty--big"><b>Обращений пока нет</b><span>Если что-то не получается или есть идея — напишите нам.</span><a class="btn btn--ink" href="#/contact">Написать нам</a></div>`}</div>`);
  }

  /* ---------- профиль ---------- */
  function profile() {
    const u = VO.user();
    const VIS = [["none", "Никому", "Связь только через сообщения на сайте"], ["auth", "Только вошедшим", "Меньше спама и автоматического сбора номеров"], ["all", "Всем", "Номер увидит любой посетитель"]];
    shell("profile", `
      <header class="cab__hi"><h1>Профиль</h1></header>
      <div class="prof">
        <form class="cab-card form" id="profF" novalidate>
          <div class="fs"><h4>Кто вы</h4><div class="seg seg--sm" role="tablist" id="pfType"><button role="tab" type="button" data-ty="person" aria-selected="${u.type !== "company"}">Частное лицо</button><button role="tab" type="button" data-ty="company" aria-selected="${u.type === "company"}">Компания или ИП</button><span class="seg__ink"></span></div></div>
          <div class="field" id="pfCompW"${u.type === "company" ? "" : " hidden"}><input id="pfComp" maxlength="60" placeholder=" " value="${esc(u.company || "")}"><label for="pfComp">Название компании или ИП</label><em>Укажите название</em></div>
          <div class="fs"><h4>Цвет аватара</h4><div class="swatches">${COLORS.map(c => `<label><input type="radio" name="color" value="${c}"${u.color === c ? " checked" : ""}><span style="background:${c}"></span></label>`).join("")}</div></div>
          <div class="field"><input id="pfName" maxlength="40" placeholder=" " value="${esc(u.name || "")}"><label for="pfName">Имя</label><em>Напишите имя</em></div>
          <div class="field field--ic"><input id="pfPhone" inputmode="tel" placeholder=" " value="${esc(u.phone || "")}"><label for="pfPhone">Телефон</label><span class="field__ic">${VO.ico.phone}</span><em id="pfPhoneE">Проверьте номер</em></div>
          <div class="fs"><h4>Кто видит номер в объявлениях</h4><div class="vis">${VIS.map(([k, t, d]) => `<label><input type="radio" name="vis" value="${k}"${u.phoneVis === k ? " checked" : ""}><span><b>${t}</b><small>${d}</small></span></label>`).join("")}</div></div>
          <div class="field"><input id="pfCity" maxlength="60" placeholder=" " value="${esc(u.city || "")}"><label for="pfCity">Город или населённый пункт</label><em>Укажите город</em></div>
          <div class="field field--area"><textarea id="pfAbout" rows="3" maxlength="300" placeholder=" ">${esc(u.about || "")}</textarea><label for="pfAbout">О себе</label><em>Проверьте текст</em><small class="count" id="pfC">${(u.about || "").length} / 300</small></div>
          <div class="field"><input readonly value="${esc(u.email)}" placeholder=" "><label>Почта для входа</label></div>
          <button class="btn btn--accent btn--wide" type="submit">Сохранить</button>
        </form>
        <aside class="prof__side">
          <span class="post-prev__lbl">Так вас видят другие</span>
          <div class="seller seller--big" id="profPrev"></div>
          <label class="share__link"><input readonly value="${esc(profileLink(u))}"><button type="button" class="btn btn--ink" data-copy>Копировать</button></label>
          <button class="btn btn--ghost btn--wide" type="button" data-share-profile>${VO.ico.share}Поделиться профилем</button>
        </aside>
      </div>`);
    const f = $("#profF", page);
    let type = u.type === "company" ? "company" : "person";
    VO.cityField($("#pfCity", f), () => prev());
    const vis = () => (f.querySelector("[name=vis]:checked") || {}).value || "none";
    const prev = () => { const c = (f.querySelector("[name=color]:checked") || {}).value || u.color, n = (type === "company" && $("#pfComp", f).value.trim()) || $("#pfName", f).value.trim() || "Без имени"; $("#profPrev").innerHTML = `<span class="seller__ava" style="background:${c}">${esc(n[0].toUpperCase())}</span><span class="seller__t"><b>${esc(n)}</b><small>${type === "company" ? "Компания" : "Частное лицо"}${$("#pfCity", f).value.trim() ? " · " + esc($("#pfCity", f).value.trim()) : ""} · на сайте с ${new Date(u.created).getFullYear()}</small><small>${{ none: "Телефон скрыт", auth: "Телефон виден вошедшим", all: "Телефон виден всем" }[vis()]}</small>${$("#pfAbout", f).value.trim() ? `<span class="seller__about">${esc($("#pfAbout", f).value.trim())}</span>` : ""}</span>`; };
    prev(); requestAnimationFrame(VO.syncInks);
    $("#pfType", f).addEventListener("click", e => { const b = e.target.closest("[data-ty]"); if (!b) return; type = b.dataset.ty; VO.selectTab($("#pfType", f), b); $("#pfCompW", f).hidden = type !== "company"; prev(); });
    f.addEventListener("input", e => { if (e.target.id === "pfPhone") e.target.value = e.target.value ? VO.phoneMask(e.target.value) : ""; if (e.target.id === "pfAbout") $("#pfC").textContent = `${e.target.value.length} / 300`; const fl = e.target.closest(".field"); if (fl) fl.classList.remove("bad"); prev(); });
    f.addEventListener("change", prev);
    f.addEventListener("submit", e => {
      e.preventDefault();
      const pp = VO.phoneProblem($("#pfPhone", f).value); $("#pfPhoneE", f).textContent = pp || "";
      const G = VO.guard;
      const ok = [G.field($("#pfName", f), "name", { min: 2 }), VO.check($("#pfPhone", f).parentElement, !pp), G.field($("#pfCity", f), "place", { min: 2 }), type !== "company" || G.field($("#pfComp", f), "company", { min: 2 }), G.field($("#pfAbout", f), "about", { optional: true })].every(Boolean);
      if (!ok) return VO.toast("Проверьте выделенные поля");
      Object.assign(u, { type, company: type === "company" ? G.clean($("#pfComp", f).value).slice(0, 60) : "", name: G.clean($("#pfName", f).value).slice(0, 40), phone: $("#pfPhone", f).value, phoneVis: vis(), showPhone: vis() !== "none", city: G.clean($("#pfCity", f).value).slice(0, 60), about: G.clean($("#pfAbout", f).value, { multiline: true, maxLines: 8 }).slice(0, 300), color: (f.querySelector("[name=color]:checked") || {}).value || u.color });
      VO.saveUser(u); VO.toast("Профиль сохранён");
    });
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-share-profile]")) { e.preventDefault(); const u = VO.user(); VO.share({ title: `${u.name} на «Все объявления»`, url: profileLink(u) }); } });

  /* ---------- безопасность ---------- */
  function security() {
    const u = VO.user();
    shell("security", `<header class="cab__hi"><h1>Безопасность</h1></header>
      <section class="cab-card"><div class="cab-card__h"><h2>Вход в аккаунт</h2></div>
        <div class="sec-row"><span>${I('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>')}</span><div><b>${esc(u.email)}</b><small>Вход по одноразовому коду — пароль не хранится и не может утечь</small></div><button class="btn btn--ghost btn--sm" type="button" data-sec="mail">Сменить почту</button></div></section>
      <section class="cab-card"><div class="cab-card__h"><h2>Активные сеансы</h2><button class="link" type="button" data-sec="others">Завершить другие</button></div>
        ${(u.sessions || []).map(s => `<div class="sec-row"><span>${I('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>')}</span><div><b>${esc(s.ua || "Браузер")}${s.current ? ' <em class="pill pill--on">это устройство</em>' : ""}</b><small>Вход ${new Date(s.t).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</small></div></div>`).join("")}</section>
      <section class="cab-card"><div class="cab-card__h"><h2>Ваши данные</h2></div>
        <div class="sec-row"><span>${I('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/>')}</span><div><b>Скачать мои данные</b><small>Профиль, объявления, избранное и поиски — одним файлом. Это ваше право по закону о персональных данных.</small></div><button class="btn btn--ghost btn--sm" type="button" data-sec="export">Скачать</button></div>
        <div class="sec-row sec-row--danger"><span>${I('<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>')}</span><div><b>Удалить аккаунт</b><small>Удалим профиль и все ваши объявления без возможности восстановления.</small></div><button class="btn btn--danger btn--sm" type="button" data-sec="delete">Удалить</button></div></section>
      <section class="roles"><div class="role role--safe"><b>Мы никогда не просим</b><span>коды из писем и СМС, данные карт и пароли. Если кто-то делает это от имени сайта — это мошенник.</span><a href="#/contact?topic=Жалоба">Сообщить →</a></div></section>`);
  }
  page.addEventListener("click", e => {
    const b = e.target.closest("[data-sec]"); if (!b) return;
    const u = VO.user(), k = b.dataset.sec;
    if (k === "mail") VO.toast("Смена почты появится вместе с сервером — напишите нам, если нужно срочно");
    if (k === "others") { u.sessions = (u.sessions || []).filter(s => s.current); VO.saveUser(u); VO.toast("Другие сеансы завершены"); security(); }
    if (k === "export") {
      const data = { account: u, ads: myAds(), favorites: [...S.favs], searches: store.get("vo_searches", []).filter(s => s.owner === u.email), exported: new Date().toISOString() };
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const a = document.createElement("a"); a.href = url; a.download = "vse-obyavleniya-moi-dannye.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    if (k === "delete") confirmBox("Удалить аккаунт?", "Профиль, объявления и история будут удалены без возможности восстановления.", "Удалить навсегда", () => {
      S.mine = S.mine.filter(a => a.owner !== u.email); VO.state.mine = S.mine; VO.saveMine();
      store.set("vo_searches", store.get("vo_searches", []).filter(s => s.owner !== u.email));
      delete S.accounts[u.email]; store.set("vo_accounts", S.accounts);
      S.session = null; store.set("vo_session", null); VO.emit("user"); VO.emit("mine");
      VO.toast("Аккаунт удалён"); location.hash = "#/";
    }, "УДАЛИТЬ");
  });

  /* ---------- публичный профиль ---------- */
  function publicProfile(id) {
    const s = VO.person(id), pg = VO.page("user");
    const known = window.VO_SELLERS[id] || (window.VO_DEMO_BUYERS || {})[id] || Object.values(S.accounts).some(a => VO.uid(a.email) === id);
    if (!known) { pg.innerHTML = `<div class="wrap"><div class="empty"><b>Профиль не найден</b><div class="empty__acts"><a class="btn btn--ink" href="#/">На главную</a></div></div></div>`; return VO.show("user"); }
    const list = VO.allAds().filter(a => VO.seller(a).id === id);
    const me = VO.me() === id, name = VO.displayName(s);
    pg.innerHTML = `<div class="wrap">
      ${me ? `<div class="pub-me">Так ваш профиль видят другие люди <a class="btn btn--ink btn--sm" href="#/me/profile">Редактировать</a></div>` : ""}
      <section class="pub"><span class="pub__ava" style="${s.color ? `background:${s.color}` : ""}">${esc(name[0])}</span>
        <div class="pub__t"><h1>${esc(name)}${s.demo ? ' <em class="tag-demo">демо</em>' : ""}</h1><span>${VO.kind(s)}${s.city ? " · " + esc(s.city) : ""} · на сайте с ${s.since} года</span>${s.about ? `<p>${esc(s.about)}</p>` : ""}
          <div class="pub__stats">${VO.rating.badge(id)}<span><b>${list.length}</b> ${VO.plural(list.length, "объявление", "объявления", "объявлений")}</span></div></div>
        <div class="pub__a"><button class="btn btn--ghost" type="button" id="pubShare">${VO.ico.share}Поделиться</button>${!me && VO.user() ? `<button class="btn btn--ink" type="button" data-rev-write="${id}">Оставить отзыв</button>` : ""}</div></section>
      <h2 class="h2">Объявления</h2>
      ${list.length ? `<div class="grid">${list.map(VO.cardHTML).join("")}</div>` : `<div class="cab-empty cab-empty--big"><b>Активных объявлений нет</b></div>`}
      <h2 class="h2">Отзывы</h2>${VO.reviews.block(id)}</div>`;
    $("#pubShare", pg).addEventListener("click", () => VO.share({ title: `${name} на «Все объявления»`, url: location.href }));
    VO.animateCards(pg); VO.show("user", name);
  }

  VO.routes.me = p => {
    if (!VO.user()) return VO.needLogin(location.hash, "Войдите, чтобы открыть личный кабинет");
    if (p[1] === "msg") return msg(p[2]);
    if (p[1] !== "notif") nTab = "list";
    ({ "": overview, ads, fav, deals, reviews, notif, tickets, profile, security }[p[1] || ""] || overview)();
  };
  VO.routes.u = p => publicProfile(p[1]);
  VO.on("favs", () => { if (VO.current() === "me" && /fav/.test(location.hash)) fav(); });
  VO.on("user", () => { if (VO.current() === "me" && VO.user() && !document.querySelector(".sheet") && !/profile/.test(location.hash)) VO.rerender(); });
  VO.on("chats", () => { if (VO.current() === "me" && /^#\/me\/?(deals)?$/.test(location.hash)) VO.rerender(); });
  VO.on("notes", () => { if (VO.current() === "me" && /^#\/me\/notif/.test(location.hash)) notif(); });
})();
