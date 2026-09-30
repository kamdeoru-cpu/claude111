/* Личный кабинет и публичный профиль */
(() => {
  const { $, $$, esc, store, state: S } = VO;
  const COLORS = ["#16181D", "#FF4F3A", "#2F7DE1", "#2F9E6E", "#8A5CF6", "#E0913A"];
  const I = (d, w = 20) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const NAV = [
    ["", "Обзор", I('<path d="M4 13h6V4H4Zm10 7h6v-9h-6ZM4 20h6v-4H4Zm10-11h6V4h-6Z"/>')],
    ["ads", "Мои объявления", I('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/>')],
    ["fav", "Избранное и поиски", I('<path d="M12 20s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.7 12 20 12 20Z"/>')],
    ["msg", "Сообщения", I('<path d="M4.5 4.5h10a5.5 5.5 0 0 1 0 11H8.5l-4 4Z"/>')],
    ["profile", "Профиль", I('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>')],
    ["notif", "Уведомления", I('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15ZM10 20.5a2 2 0 0 0 4 0"/>')],
    ["security", "Безопасность", I('<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/>')],
  ];
  const page = VO.page("me");
  const myAds = (all = true) => S.mine.filter(a => a.owner === VO.user().email && (all || a.status !== "archived")).map(a => ({ ...a, mine: true }));
  const profileLink = u => location.href.split("#")[0] + "#/u/" + VO.uid(u.email);
  const completeness = u => { const items = [["Имя", !!u.name], ["Телефон", !!u.phone], ["Город", !!u.city], ["Пара слов о себе", !!u.about], ["Первое объявление", myAds().length > 0]]; return { items, pct: Math.round(items.filter(i => i[1]).length / items.length * 100) }; };
  const ring = (pct, size = 76) => { const r = size / 2 - 6, c = 2 * Math.PI * r; return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#F4F5F7" stroke-width="8"/><circle class="ring__v" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#FF4F3A" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" style="--c:${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-weight="800" font-size="17" fill="#16181D">${pct}%</text></svg>`; };
  const greet = () => { const h = new Date().getHours(); return h < 6 ? "Доброй ночи" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер"; };
  const thumb = a => `<span class="row-ad__img" style="background:${a.bg}">${a.photo ? `<img src="${a.photo}" alt="">` : window.VO_ILL[a.ill]}</span>`;

  function shell(tab, inner) {
    const u = VO.user(), mine = myAds(false).length;
    const counts = { ads: mine, fav: S.favs.size };
    page.innerHTML = `<div class="wrap cab">
      <aside class="cab__nav">
        <div class="cab__me"><span class="cab__ava" style="background:${u.color}">${esc((u.name || u.email)[0].toUpperCase())}</span><div><b>${esc(u.name || "Без имени")}</b><small>${esc(u.email)}</small></div></div>
        <nav>${NAV.map(([k, n, ic]) => `<a href="#/me${k ? "/" + k : ""}" class="${k === tab ? "on" : ""}">${ic}<span>${n}</span>${counts[k] ? `<small>${counts[k]}</small>` : ""}</a>`).join("")}</nav>
        <a class="btn btn--accent btn--wide" href="#/post">Разместить объявление</a>
        <a class="cab__pub" href="#/u/${VO.uid(u.email)}">Мой публичный профиль ${VO.ico.chev}</a>
      </aside>
      <div class="cab__main">${inner}</div></div>`;
    VO.show("me", "Личный кабинет");
    page.querySelectorAll(".cab__main > *").forEach((el, i) => el.style.setProperty("--i", i));
  }

  /* ---------- обзор ---------- */
  function overview() {
    const u = VO.user(), ads = myAds(false), cm = completeness(u);
    const week = Array(7).fill(0); ads.forEach(a => VO.viewsByDay(a, 7).forEach((v, i) => week[i] += v));
    const wsum = week.reduce((s, v) => s + v, 0);
    const searches = store.get("vo_searches", []).filter(s => s.owner === u.email);
    shell("", `
      <header class="cab__hi"><div><span class="muted">${new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</span><h1>${greet()}, ${esc(u.name || "друг")}!</h1></div><a class="btn btn--ghost" href="#/u/${VO.uid(u.email)}" data-share-profile>${VO.ico.share}Поделиться профилем</a></header>
      ${cm.pct < 100 ? `<section class="cab-card cab-done">${ring(cm.pct)}<div><b>Профиль заполнен на ${cm.pct}%</b><span>Покупатели больше доверяют заполненным профилям.</span><div class="cab-done__todo">${cm.items.filter(i => !i[1]).map(([n]) => `<a href="${n === "Первое объявление" ? "#/post" : "#/me/profile"}">+ ${n}</a>`).join("")}</div></div></section>` : ""}
      <section class="kpis">
        <a class="kpi" href="#/me/ads"><small>Активные объявления</small><b>${ads.length}</b><span>${myAds().length - ads.length} снято</span></a>
        <a class="kpi kpi--chart" href="#/me/ads"><small>Просмотры за 7 дней${VO.DEMO ? " · демо" : ""}</small><b>${wsum}</b>${VO.spark(week, 200, 46)}</a>
        <a class="kpi" href="#/me/fav"><small>В избранном</small><b>${S.favs.size}</b><span>${searches.length} ${VO.plural(searches.length, "сохранённый поиск", "сохранённых поиска", "сохранённых поисков")}</span></a>
        <a class="kpi" href="#/me/msg"><small>Сообщения</small><b>0</b><span>чаты скоро</span></a>
      </section>
      <div class="cab-2">
        <section class="cab-card"><div class="cab-card__h"><h2>Мои объявления</h2><a href="#/me/ads">Все</a></div>
          ${ads.length ? ads.slice(0, 3).map(a => `<a class="mini-row" href="#/ad/${a.id}">${thumb(a)}<span><b>${esc(a.title)}</b><small>${a.price ? VO.rub(a.price) : "Даром"} · ${VO.ico.eye} ${VO.views(a)}</small></span></a>`).join("")
            : `<div class="cab-empty"><b>Здесь появятся ваши объявления</b><span>Продайте то, что давно не используете, — это бесплатно.</span><a class="btn btn--ink" href="#/post">Разместить первое</a></div>`}</section>
        <section class="cab-card"><div class="cab-card__h"><h2>Уведомления</h2></div>
          ${S.notes.slice(0, 4).map(n => `<div class="note-i"><i>${I('<path d="M12 7v6M12 17h.01"/>', 16)}</i><div><b>${esc(n.title)}</b><span>${esc(n.text)}</span></div></div>`).join("")}</section>
      </div>
      <section class="roles">
        <div class="role"><b>Продаёте?</b><span>Хорошие фото при дневном свете, честное описание и цена чуть ниже рынка — и объявление уходит быстрее.</span><a href="#/how">Как продать быстрее →</a></div>
        <div class="role"><b>Покупаете?</b><span>Сохраните поиск — пришлём уведомление, когда появится подходящее объявление.</span><a href="#/me/fav">Сохранённые поиски →</a></div>
        <div class="role role--safe"><b>Безопасность</b><span>Не переводите предоплату незнакомым и не сообщайте коды из СМС.</span><a href="#/safety">Правила безопасности →</a></div>
      </section>`);
  }

  /* ---------- мои объявления ---------- */
  let adsTab = "active";
  function ads() {
    const all = myAds(), list = all.filter(a => adsTab === "active" ? a.status !== "archived" : a.status === "archived");
    shell("ads", `
      <header class="cab__hi"><div><h1>Мои объявления</h1><span class="muted">${VO.DEMO ? "Просмотры пока моделируются — настоящая статистика появится с сервером." : ""}</span></div><a class="btn btn--accent" href="#/post">+ Новое объявление</a></header>
      <div class="tabs" role="tablist" id="adsTabs"><button role="tab" data-t="active" aria-selected="${adsTab === "active"}">Активные · ${all.filter(a => a.status !== "archived").length}</button><button role="tab" data-t="archived" aria-selected="${adsTab === "archived"}">Снятые · ${all.filter(a => a.status === "archived").length}</button><span class="tabs__ink"></span></div>
      <div class="row-ads">${list.length ? list.map(a => { const w = VO.viewsByDay(a, 7); return `<article class="row-ad" data-id="${a.id}">
        <a href="#/ad/${a.id}">${thumb(a)}</a>
        <div class="row-ad__t"><a href="#/ad/${a.id}"><b>${esc(a.title)}</b></a><span>${a.price ? VO.rub(a.price) : "Даром"} · ${esc(VO.catName(a.cat))} · ${VO.agoText(a)}</span><span class="pill ${a.status === "archived" ? "" : "pill--on"}">${a.status === "archived" ? "Снято" : "В ленте"}</span></div>
        <div class="row-ad__st"><b>${VO.views(a)}</b><small>просмотров</small>${VO.spark(w, 110, 32)}</div>
        <div class="row-ad__acts"><a class="icb" href="#/post?edit=${a.id}" title="Редактировать" aria-label="Редактировать">${VO.ico.edit}</a><button class="icb" type="button" data-act="share" title="Поделиться" aria-label="Поделиться">${VO.ico.share}</button><button class="btn btn--ghost btn--sm" type="button" data-act="arch">${a.status === "archived" ? "Вернуть" : "Снять"}</button><button class="icb icb--del" type="button" data-act="del" title="Удалить" aria-label="Удалить">${I('<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>', 16)}</button></div>
      </article>`; }).join("") : `<div class="cab-empty cab-empty--big"><svg width="120" height="90" viewBox="0 0 120 90"><rect x="20" y="10" width="60" height="70" rx="10" fill="#F4F5F7"/><path d="M34 30h32M34 42h20" stroke="#D5D8DE" stroke-width="6" stroke-linecap="round"/><circle cx="86" cy="62" r="18" fill="#FF4F3A"/><path d="M86 54v16M78 62h16" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg><b>${adsTab === "active" ? "Нет активных объявлений" : "Снятых объявлений нет"}</b><span>Размещение бесплатное и занимает пару минут.</span><a class="btn btn--ink" href="#/post">Разместить объявление</a></div>`}</div>`);
  }
  page.addEventListener("click", e => {
    const t = e.target.closest("[data-t]"); if (t && t.closest("#adsTabs")) { adsTab = t.dataset.t; return ads(); }
    const act = e.target.closest("[data-act]"); if (!act) return;
    const id = act.closest("[data-id]").dataset.id, m = S.mine.find(a => a.id === id);
    if (act.dataset.act === "share") return VO.share({ title: m.title, url: location.href.split("#")[0] + "#/ad/" + id });
    if (act.dataset.act === "arch") { m.status = m.status === "archived" ? "active" : "archived"; VO.saveMine(); VO.emit("mine"); VO.toast(m.status === "archived" ? "Снято с публикации" : "Снова в ленте"); return ads(); }
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
  const msg = () => shell("msg", `<header class="cab__hi"><h1>Сообщения</h1></header>
    <section class="cab-card msg-soon"><div class="msg-soon__demo"><div class="bub bub--in">Здравствуйте! Велосипед ещё продаёте?</div><div class="bub bub--out">Да, можно посмотреть сегодня вечером</div><div class="bub bub--typing"><i></i><i></i><i></i></div></div>
      <div><h2>Переписка скоро появится</h2><p>Здесь будут все диалоги с покупателями и продавцами: с фото, статусом «прочитано» и уведомлениями на почту. Номер телефона в чатах не показывается.</p><a class="btn btn--ink" href="#/">К объявлениям</a></div></section>`);

  /* ---------- профиль ---------- */
  function profile() {
    const u = VO.user(), cities = (window.VO_CITIES || []).filter(c => c !== "Вся Россия");
    shell("profile", `
      <header class="cab__hi"><h1>Профиль</h1></header>
      <div class="prof">
        <form class="cab-card form" id="profF" novalidate>
          <div class="fs"><h4>Цвет аватара</h4><div class="swatches">${COLORS.map(c => `<label><input type="radio" name="color" value="${c}"${u.color === c ? " checked" : ""}><span style="background:${c}"></span></label>`).join("")}</div></div>
          <div class="field"><input id="pfName" maxlength="40" placeholder=" " value="${esc(u.name || "")}"><label for="pfName">Имя</label><em>Напишите имя</em></div>
          <div class="field field--ic"><input id="pfPhone" inputmode="tel" placeholder=" " value="${esc(u.phone || "")}"><label for="pfPhone">Телефон</label><span class="field__ic">${VO.ico.phone}</span><em>Номер должен быть из 11 цифр</em></div>
          <label class="switch-l switch-l--block"><input type="checkbox" id="pfShow"${u.showPhone ? " checked" : ""}><span class="sw"></span><span>Показывать номер в объявлениях<small>Номер видят только вошедшие пользователи — так меньше спама</small></span></label>
          <div class="field field--select"><select id="pfCity">${cities.map(c => `<option${c === u.city ? " selected" : ""}>${c}</option>`).join("")}</select><label for="pfCity">Город</label></div>
          <div class="field field--area"><textarea id="pfAbout" rows="3" maxlength="300" placeholder=" ">${esc(u.about || "")}</textarea><label for="pfAbout">О себе</label><small class="count" id="pfC">${(u.about || "").length} / 300</small></div>
          <div class="field"><input readonly value="${esc(u.email)}" placeholder=" "><label>Почта для входа</label></div>
          <button class="btn btn--accent btn--wide" type="submit">Сохранить</button>
        </form>
        <aside class="prof__side">
          <span class="post-prev__lbl">Так вас видят покупатели</span>
          <div class="seller seller--big" id="profPrev"></div>
          <label class="share__link"><input readonly value="${esc(profileLink(u))}"><button type="button" class="btn btn--ink" data-copy>Копировать</button></label>
          <button class="btn btn--ghost btn--wide" type="button" data-share-profile>${VO.ico.share}Поделиться профилем</button>
        </aside>
      </div>`);
    const f = $("#profF", page);
    const prev = () => { const c = (f.querySelector("[name=color]:checked") || {}).value || u.color, n = $("#pfName", f).value.trim() || "Без имени"; $("#profPrev").innerHTML = `<span class="seller__ava" style="background:${c}">${esc(n[0].toUpperCase())}</span><span class="seller__t"><b>${esc(n)}</b><small>Частное лицо · ${esc($("#pfCity", f).value)} · на сайте с ${new Date(u.created).getFullYear()}</small><small>${$("#pfShow", f).checked ? "Телефон открыт для вошедших" : "Телефон скрыт"}</small>${$("#pfAbout", f).value.trim() ? `<span class="seller__about">${esc($("#pfAbout", f).value.trim())}</span>` : ""}</span>`; };
    prev();
    f.addEventListener("input", e => { if (e.target.id === "pfPhone") e.target.value = e.target.value ? VO.phoneMask(e.target.value) : ""; if (e.target.id === "pfAbout") $("#pfC").textContent = `${e.target.value.length} / 300`; const fl = e.target.closest(".field"); if (fl) fl.classList.remove("bad"); prev(); });
    f.addEventListener("change", prev);
    f.addEventListener("submit", e => {
      e.preventDefault();
      const ok = [VO.check($("#pfName", f).parentElement, $("#pfName", f).value.trim().length > 0), VO.check($("#pfPhone", f).parentElement, VO.phoneOk($("#pfPhone", f).value))].every(Boolean);
      if (!ok) return;
      Object.assign(u, { name: $("#pfName", f).value.trim(), phone: $("#pfPhone", f).value, showPhone: $("#pfShow", f).checked, city: $("#pfCity", f).value, about: $("#pfAbout", f).value.trim().slice(0, 300), color: (f.querySelector("[name=color]:checked") || {}).value || u.color });
      VO.saveUser(u); VO.toast("Профиль сохранён"); profile();
    });
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-share-profile]")) { e.preventDefault(); const u = VO.user(); VO.share({ title: `${u.name} на «Все объявления»`, url: profileLink(u) }); } });

  /* ---------- уведомления ---------- */
  function notif() {
    const u = VO.user(), n = u.notif || {};
    const T = [["msg", "Новые сообщения", "Когда вам пишут по объявлению"], ["fav", "Избранное", "Если продавец снизил цену или снял объявление"], ["search", "Сохранённые поиски", "Новые объявления по вашим поискам"], ["news", "Новости сервиса", "Не чаще раза в месяц, только важное"]];
    shell("notif", `<header class="cab__hi"><div><h1>Уведомления</h1><span class="muted">Приходят на ${esc(u.email)}</span></div></header>
      <section class="cab-card toggles">${T.map(([k, t, d]) => `<label class="tog"><span><b>${t}</b><small>${d}</small></span><input type="checkbox" data-n="${k}"${n[k] ? " checked" : ""}><span class="sw"></span></label>`).join("")}</section>`);
    page.querySelectorAll("[data-n]").forEach(c => c.addEventListener("change", () => { u.notif = { ...u.notif, [c.dataset.n]: c.checked }; VO.saveUser(u); VO.toast("Сохранено", 1400); }));
  }

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
    let s = window.VO_SELLERS[id] ? { id, ...window.VO_SELLERS[id] } : null, acc = null;
    if (!s) { acc = Object.values(S.accounts).find(a => VO.uid(a.email) === id); if (acc) s = { id, name: acc.name || "Пользователь", since: new Date(acc.created).getFullYear(), city: acc.city, about: acc.about, color: acc.color }; }
    const pg = VO.page("user");
    if (!s) { pg.innerHTML = `<div class="wrap"><div class="empty"><b>Профиль не найден</b><div class="empty__acts"><a class="btn btn--ink" href="#/">На главную</a></div></div></div>`; return VO.show("user"); }
    const list = VO.allAds().filter(a => VO.seller(a).id === id);
    const me = VO.user() && acc && acc.email === VO.user().email;
    pg.innerHTML = `<div class="wrap">
      ${me ? `<div class="pub-me">Так ваш профиль видят другие люди <a class="btn btn--ink btn--sm" href="#/me/profile">Редактировать</a></div>` : ""}
      <section class="pub"><span class="pub__ava" style="${s.color ? `background:${s.color}` : ""}">${esc(s.name[0])}</span>
        <div class="pub__t"><h1>${esc(s.name)}</h1><span>${s.company ? "Компания" : "Частное лицо"}${s.city ? " · " + esc(s.city) : ""} · на сайте с ${s.since} года</span>${s.about ? `<p>${esc(s.about)}</p>` : ""}
          <div class="pub__stats"><span><b>${list.length}</b> ${VO.plural(list.length, "объявление", "объявления", "объявлений")}</span><span><b>—</b> отзывов пока нет</span></div></div>
        <button class="btn btn--ghost" type="button" id="pubShare">${VO.ico.share}Поделиться</button></section>
      <h2 class="h2">Объявления</h2>
      ${list.length ? `<div class="grid">${list.map(VO.cardHTML).join("")}</div>` : `<div class="empty"><b>Активных объявлений нет</b></div>`}</div>`;
    $("#pubShare", pg).addEventListener("click", () => VO.share({ title: `${s.name} на «Все объявления»`, url: location.href }));
    VO.animateCards(pg); VO.show("user", s.name);
  }

  VO.routes.me = p => {
    if (!VO.user()) return VO.needLogin(location.hash, "Войдите, чтобы открыть личный кабинет");
    ({ "": overview, ads, fav, msg, profile, notif, security }[p[1] || ""] || overview)();
  };
  VO.routes.u = p => publicProfile(p[1]);
  VO.on("favs", () => { if (VO.current() === "me" && /fav/.test(location.hash)) fav(); });
  VO.on("user", () => { if (VO.current() === "me" && VO.user() && !document.querySelector(".sheet")) VO.rerender(); });
})();
