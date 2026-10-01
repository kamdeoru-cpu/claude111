/* Страница объявления */
(() => {
  const { $, $$, esc, state: S } = VO;
  const page = VO.page("ad");
  let cur = null, view = 0;

  const spark = (arr, w = 180, h = 44) => {
    const mx = Math.max(1, ...arr), st = w / (arr.length - 1);
    const pts = arr.map((v, i) => `${(i * st).toFixed(1)},${(h - 4 - v / mx * (h - 10)).toFixed(1)}`).join(" ");
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="0,${h} ${pts} ${w},${h}" fill="#FFEDEA" stroke="none"/><polyline points="${pts}" fill="none" stroke="#FF4F3A" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  };
  VO.spark = spark;
  // Условная карта района: улицы и кварталы (реальная карта — когда появится адрес и сервер)
  const map = city => `<svg class="map" viewBox="0 0 600 240" aria-hidden="true"><rect width="600" height="240" fill="#F1F2F4"/>
    <g fill="#E4E6EA">${Array.from({ length: 18 }, (_, i) => `<rect x="${(i % 6) * 104 + 12}" y="${Math.floor(i / 6) * 80 + 14}" width="${70 + (i * 37) % 22}" height="${48 + (i * 13) % 14}" rx="8"/>`).join("")}</g>
    <path d="M0 150C120 130 200 190 330 160S520 90 600 110" stroke="#fff" stroke-width="18" fill="none"/><path d="M250 0 280 240" stroke="#fff" stroke-width="14"/><path d="M0 60H600" stroke="#fff" stroke-width="10"/>
    <path d="M440 0C430 80 470 160 450 240" stroke="#CFE8F7" stroke-width="22" fill="none"/>
    <circle cx="300" cy="120" r="46" fill="#FF4F3A" opacity=".12" class="map__area"/><g class="map__pin"><path d="M300 118s-18-16-18-30a18 18 0 0 1 36 0c0 14-18 30-18 30Z" fill="#FF4F3A"/><circle cx="300" cy="88" r="7" fill="#fff"/></g>
    <text x="300" y="150" text-anchor="middle" font-family="Manrope, Arial" font-weight="800" font-size="15" fill="#16181D">${esc(city)}</text></svg>`;

  function render(id) {
    const a = VO.findAd(id);
    if (!a) { page.innerHTML = `<div class="wrap"><div class="empty"><b>Объявление не найдено</b><span>Возможно, его уже сняли с публикации.</span><div class="empty__acts"><a class="btn btn--ink" href="#/">На главную</a></div></div></div>`; return VO.show("ad", "Не найдено"); }
    cur = a; view = 0;
    const s = VO.seller(a), u = VO.user(), mine = u && a.owner === u.email;
    if (!mine) VO.countView(a);
    const views = VO.views(a), today = VO.viewsByDay(a, 1)[0];
    const sellerAds = VO.allAds().filter(x => VO.seller(x).id === s.id);
    const attrs = Object.entries(a.attrs || {}).map(([k, v]) => [window.VO_ATTR_NAMES[k] || k, v === true ? "Да" : typeof v === "number" ? v.toLocaleString("ru-RU") : v]);
    attrs.unshift(["Категория", VO.catName(a.cat) + (a.sub ? " · " + a.sub : "")], ["Состояние", a.cond]);
    if (a.delivery && a.delivery.length) attrs.push(["Передача", a.delivery.map(x => ({ meet: "встреча", ship: "отправка", courier: "привезёт продавец" })[x]).join(", ")]);
    const similar = VO.allAds().filter(x => x.id !== a.id && x.cat === a.cat).concat(VO.allAds().filter(x => x.id !== a.id && x.cat !== a.cat)).slice(0, 6);
    const ph = a.photos && a.photos.length ? a.photos : a.photo ? [a.photo] : null;
    const views3 = ph ? ph.map((_, i) => i) : [0, 1, 2];
    const num = "№ " + (1000000 + parseInt(a.id.replace(/\D/g, "").slice(-6) || "1", 10));

    page.innerHTML = `<div class="wrap">
      <nav class="crumbs"><a href="#/">Главная</a>${VO.ico.chev}<a href="#/c/${a.cat}">${esc(VO.catName(a.cat))}</a>${VO.ico.chev}<span>${esc(a.title)}</span></nav>
      <div class="adp">
        <div class="adp__main">
          <div class="gal">
            <div class="gal__main card__media${ph ? " has-ph" : ""}" data-v="0" style="--bg:${a.bg}"><span class="card__blob"></span><div class="card__art">${ph ? ph.map((p, i) => `<img class="gal__ph${i ? "" : " on"}" src="${p}" alt="Фото ${i + 1}">`).join("") : VO.media(a)}</div>${VO.tag(a)}
              ${views3.length > 1 ? `<button class="gal__nav gal__nav--l" type="button" data-step="-1" aria-label="Предыдущее фото">‹</button><button class="gal__nav gal__nav--r" type="button" data-step="1" aria-label="Следующее фото">›</button>` : ""}
              <button class="gal__zoom" type="button" data-zoom aria-label="Открыть на весь экран"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
              <span class="gal__count">${views3.length > 1 ? `<b>1</b> / ${views3.length}` : ""}</span></div>
            ${views3.length > 1 ? `<div class="gal__thumbs">${views3.map(v => `<button type="button" data-view="${v}" aria-pressed="${v === 0}" aria-label="Фото ${v + 1}"><div class="card__media" data-v="${ph ? 0 : v}" style="--bg:${a.bg}"><div class="card__art">${ph ? `<img src="${ph[v]}" alt="">` : VO.media(a)}</div></div></button>`).join("")}</div>` : ""}
          </div>
          <div class="adp__mobile-head"></div>
          <section class="adp__sec"><h2>Характеристики</h2><dl class="specs">${attrs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></section>
          <section class="adp__sec"><h2>Описание</h2><div class="adp__desc">${esc(a.desc || "Продавец не добавил описание.").split("\n").map(p => `<p>${p}</p>`).join("")}</div></section>
          <section class="adp__sec"><h2>Где находится</h2>${map(a.city)}<p class="muted">Точное место встречи продавец сообщит в переписке. Встречайтесь в людных местах.</p></section>
        </div>
        <aside class="adp__side">
          <div class="adp__card">
            <div class="adp__price">${VO.price(a)}${a.bargain ? '<span class="card__bargain">Торг</span>' : ""}</div>
            <h1 class="adp__title">${esc(a.title)}</h1>
            <div class="adp__meta">${VO.ico.pin}${esc(a.city)}${a.district ? ", " + esc(a.district) : ""} · ${VO.agoText(a)}</div>
            ${mine ? owner(a) : `
            <div class="adp__acts">
              <button class="btn btn--accent btn--wide" type="button" data-write>${VO.ico.msg}Написать продавцу</button>
              <button class="btn btn--ghost btn--wide" type="button" data-phone>${VO.ico.phone}<span>${s.phoneVis === "none" ? "Только сообщения" : "Показать телефон"}</span></button>
              <div class="adp__row">
                <button class="btn btn--ghost${S.favs.has(a.id) ? " is-on" : ""}" type="button" data-fav="${a.id}" aria-pressed="${S.favs.has(a.id)}">${VO.heart}<span class="lbl">${S.favs.has(a.id) ? "В избранном" : "В избранное"}</span></button>
                <button class="btn btn--ghost" type="button" data-share>${VO.ico.share}Поделиться</button>
              </div>
            </div>`}
            <div class="adp__stats"><span>${VO.ico.eye}${views} ${VO.plural(views, "просмотр", "просмотра", "просмотров")}${today ? ` <em>+${today} сегодня</em>` : ""}</span><span>${num}</span></div>
          </div>
          <a class="seller" href="#/u/${s.id}">
            <span class="seller__ava" style="${s.color ? `background:${s.color}` : ""}">${esc(s.name[0])}</span>
            <span class="seller__t"><b>${esc(VO.displayName(s))}${s.demo ? ' <em class="tag-demo">демо</em>' : ""}</b><small>${VO.kind(s)} · на сайте с ${s.since} года</small>${VO.rating.badge(s.id)}<small class="seller__ads">${sellerAds.length} ${VO.plural(sellerAds.length, "объявление", "объявления", "объявлений")} ${VO.ico.chev}</small></span>
          </a>
          <div class="adp__tip"><b>Как не попасться мошенникам</b><span>Не переводите предоплату незнакомым, не сообщайте коды из СМС и не переходите по ссылкам «на оплату».</span><a href="#/safety">Подробнее о безопасности →</a></div>
          ${mine ? "" : `<button class="link adp__report" type="button" data-report>${VO.ico.flag}Пожаловаться на объявление</button>`}
        </aside>
      </div>
      ${similar.length ? `<section class="adp__more"><h2 class="h2">Похожие объявления</h2><div class="grid">${similar.map(VO.cardHTML).join("")}</div></section>` : ""}
    </div>`;
    // на телефоне цена и кнопки идут сразу после фото
    if (matchMedia("(max-width: 900px)").matches) $(".adp__mobile-head", page).appendChild($(".adp__card", page));
    VO.animateCards(page);
    VO.show("ad", a.title);
  }
  function owner(a) {
    const days = VO.viewsByDay(a, 7), total = VO.views(a);
    return `<div class="own">
      <div class="own__head"><b>Ваше объявление</b><span class="own__st ${a.status === "active" ? "" : "off"}">${a.status === "archived" ? "Снято с публикации" : a.status === "sold" ? "Продано" : "Опубликовано"}</span></div>
      <div class="own__stats"><div><b>${total}</b><small>просмотров${VO.DEMO ? " · демо" : ""}</small></div><div><b>${VO.chats.forAd(a.id).length}</b><small>диалогов</small></div><div>${spark(days)}<small>за 7 дней</small></div></div>
      ${VO.chats.forAd(a.id).length ? `<a class="btn btn--ghost btn--wide btn--sm" href="#/me/msg/${VO.chats.forAd(a.id)[0].id}">Открыть переписку</a>` : ""}
      <div class="own__acts">
        <a class="btn btn--ink" href="#/post?edit=${a.id}">${VO.ico.edit}Редактировать</a>
        <button class="btn btn--ghost" type="button" data-bump>Поднять в ленте</button>
        <button class="btn btn--ghost" type="button" data-arch>${a.status === "active" ? "Снять с публикации" : "Вернуть в ленту"}</button>
        <button class="btn btn--ghost" type="button" data-share>${VO.ico.share}Поделиться</button>
      </div></div>`;
  }

  function setView(v) {
    const m = $(".gal__main", page), imgs = $$(".gal__ph", m), n = imgs.length || 3; view = (v + n) % n;
    if (imgs.length) imgs.forEach((im, i) => im.classList.toggle("on", i === view)); else m.dataset.v = view;
    $$(".gal__thumbs [data-view]", page).forEach(b => b.setAttribute("aria-pressed", +b.dataset.view === view));
    const c = $(".gal__count b", page); if (c) c.textContent = view + 1;
  }
  page.addEventListener("click", e => {
    const t = e.target, a = cur; if (!a) return;
    const v = t.closest("[data-view]"); if (v) return setView(+v.dataset.view);
    const st = t.closest("[data-step]"); if (st) return setView(view + +st.dataset.step);
    if (t.closest("[data-zoom]") || (t.closest(".gal__main.has-ph") && !t.closest("button"))) { const phs = a.photos && a.photos.length ? a.photos : null; if (phs) return VO.lightbox(phs, view); return VO.sheet(`<div class="lb card__media" data-v="${phs ? 0 : view}" style="--bg:${a.bg}"><span class="card__blob"></span><div class="card__art">${phs ? `<img src="${phs[view]}" alt="">` : VO.media(a)}</div></div>`, { cls: "sheet--lb" }); }
    if (t.closest("[data-share]")) return VO.share({ title: a.title + " — " + (a.price ? VO.rub(a.price) : "даром"), url: location.href.split("#")[0] + "#/ad/" + a.id });
    if (t.closest("[data-write]")) {
      if (!VO.user()) return VO.needLogin("#/ad/" + a.id, "Войдите, чтобы написать продавцу");
      const c = VO.chats.openFor(a.id); if (c) location.hash = "#/me/msg/" + c.id; return;
    }
    const ph = t.closest("[data-phone]");
    if (ph) {
      const s = VO.seller(a);
      if (s.phoneVis === "none") return VO.toast("Продавец общается только через сообщения — так безопаснее для обоих");
      if (s.phoneVis === "auth" && !VO.user()) return VO.needLogin("#/ad/" + a.id, "Продавец показывает номер только вошедшим — так меньше спама");
      $("span", ph).textContent = s.phoneNum || "Тестовое объявление — номера нет";
      ph.classList.add("is-shown"); return;
    }
    if (t.closest("[data-report]")) return report(a);
    if (t.closest("[data-bump]")) {
      const m = S.mine.find(x => x.id === a.id);
      if (m.bumped && Date.now() - m.bumped < 864e5) return VO.toast("Поднимать можно раз в сутки — это бесплатно");
      m.created = Date.now(); m.bumped = Date.now(); VO.saveMine(); VO.emit("mine"); VO.toast("Объявление поднято наверх ленты"); return render(a.id);
    }
    if (t.closest("[data-arch]")) {
      const m = S.mine.find(x => x.id === a.id);
      m.status = m.status === "active" ? "archived" : "active"; VO.saveMine(); VO.emit("mine");
      VO.toast(m.status === "archived" ? "Объявление снято — его не видно в ленте" : "Объявление снова в ленте"); return render(a.id);
    }
  });
  function report(a) {
    const REASONS = ["Мошенничество или обман", "Запрещённый товар или услуга", "Неверная цена или категория", "Уже продано", "Оскорбления или спам", "Другое"];
    const el = VO.sheet(`<form class="report" id="reportF"><h3>Что не так с объявлением?</h3><p class="muted">Жалоба анонимна. Мы проверим объявление и при нарушении скроем его.</p>
      <div class="report__r">${REASONS.map((r, i) => `<label><input type="radio" name="r" value="${r}"${i === 0 ? " checked" : ""}><span>${r}</span></label>`).join("")}</div>
      <div class="field field--area"><textarea id="repT" rows="3" maxlength="500" placeholder=" "></textarea><label for="repT">Комментарий (необязательно)</label><em>Проверьте текст</em></div>
      <button class="btn btn--ink btn--wide" type="submit">Отправить жалобу</button></form>`, { cls: "sheet--sm" });
    $("#reportF", el).addEventListener("submit", e => {
      e.preventDefault();
      const G = VO.guard; if (!G.field($("#repT", el), "report", { optional: true })) return;
      const w = G.rate("report", 10, 864e5); if (w) return VO.toast(`Слишком много жалоб за сутки. Попробуйте через ${G.wait(w)}`);
      const reps = VO.store.get("vo_reports", []);
      if (reps.some(r => r.ad === a.id)) { VO.closeSheet(); return VO.toast("Вы уже жаловались на это объявление — мы проверяем"); }
      reps.push({ ad: a.id, reason: new FormData(e.target).get("r"), text: G.clean($("#repT", el).value, { multiline: true, maxLines: 10 }).slice(0, 500), t: Date.now() });
      VO.store.set("vo_reports", reps); VO.closeSheet(); VO.toast("Спасибо! Проверим объявление в ближайшее время");
      // много жалоб — объявление скрывается само до проверки модератором
      const A = VO.adm, n = A ? A.cfg().autoHideReports : 0;
      if (n && reps.filter(r => r.ad === a.id).length >= n && A.visible(VO.findAd(a.id) || a)) { A.setAd(a.id, {}, { state: "hidden", until: null, reason: `Скрыто автоматически: ${n} жалоб, ждёт проверки` }); A.log("Автоскрытие по жалобам", a.title, `${n} жалоб`, { system: true }); }
    });
  }
  // клавиши ← → листают фото
  addEventListener("keydown", e => { if (VO.current() === "ad" && cur && !document.querySelector(".sheet") && (e.key === "ArrowLeft" || e.key === "ArrowRight") && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) setView(view + (e.key === "ArrowRight" ? 1 : -1)); });
  VO.routes.ad = p => {
    const a = VO.findAd(p[1]), A = VO.adm, u = VO.user();
    // объявление скрыто модератором или ждёт проверки: видят только автор и команда
    if (a && A && !A.visible(a)) {
      const own = u && a.owner === u.email, m = a.adm || {};
      if (!own && !A.isAdmin()) { page.innerHTML = `<div class="wrap"><div class="empty"><b>Объявление недоступно</b><span>Оно на проверке или скрыто модератором.</span><div class="empty__acts"><a class="btn btn--ink" href="#/">Все объявления</a></div></div></div>`; return VO.show("ad", "Объявление недоступно"); }
      render(p[1]);
      const why = a.mod === "pending" ? "Объявление на проверке — в ленте появится после одобрения модератором." : a.mod === "rejected" ? `Объявление отклонено модератором${m.reason ? ": " + m.reason : ""}. Исправьте и сохраните — проверим снова.` : m.state === "blocked" ? `Объявление заблокировано ${A.until(m)}${m.reason ? ". Причина: " + m.reason : ""}.` : m.state === "hidden" ? `Объявление скрыто модератором${m.reason ? ": " + m.reason : ""}.` : "Объявление сейчас не видно в ленте.";
      const w = page.querySelector(".wrap"); if (w) w.insertAdjacentHTML("afterbegin", `<div class="ad-modnote">${VO.esc(why)}${A.isAdmin() ? ` <a href="#/admin/ads/${VO.esc(a.id)}">Открыть в админке →</a>` : ""}</div>`);
      return;
    }
    render(p[1]);
    if (a && A && A.isAdmin()) { const w = page.querySelector(".wrap"); if (w) w.insertAdjacentHTML("afterbegin", `<a class="ad-admlink" href="#/admin/ads/${VO.esc(a.id)}">Управлять объявлением в админке →</a>`); }
  };
})();
