/* =========================================================
   Все объявления — логика сайта (без сервера: всё хранится в браузере)
   Маршруты: #/  #/c/<категория>  #/s/<запрос>  #/fav  #/my  #/ad/<id>
             #/how  #/safety  #/help  #/contact  #/login  #/post
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CATS = window.VO_CATS || [];
  const catName = id => (CATS.find(c => c.id === id) || {}).name || "";
  const LOADED = Date.now();

  /* ---------- тосты ---------- */
  function toast(html, ms = 3200) {
    const t = document.createElement("div");
    t.className = "toast"; t.innerHTML = `<i></i><span>${html}</span>`;
    $("#toasts").appendChild(t);
    setTimeout(() => { t.classList.add("out"); t.addEventListener("animationend", () => t.remove()); }, ms);
  }

  /* ---------- состояние ---------- */
  let user = store.get("vo_user", null);
  let favs = new Set(store.get("vo_favs", []));
  let mine = store.get("vo_my_ads", []);
  let notes = store.get("vo_notes", null);
  if (!notes) { notes = [{ id: 1, t: Date.now(), title: "Добро пожаловать!", text: "Размещение объявлений бесплатное. Загляните в «Как это работает».", read: false }]; store.set("vo_notes", notes); }
  const allAds = () => [...mine.map(a => ({ ...a, mine: true })), ...window.VO_ADS];
  const findAd = id => allAds().find(a => a.id === id);
  function addNote(title, text) { notes.unshift({ id: Date.now(), t: Date.now(), title, text, read: false }); notes = notes.slice(0, 20); store.set("vo_notes", notes); syncBadges(); }

  /* ---------- форматирование ---------- */
  const price = a => a.price === 0 ? '<span class="free">Даром</span>' : `${a.price.toLocaleString("ru-RU")} ₽${a.per ? `<small>в ${a.per}</small>` : ""}`;
  const minutesAgo = a => a.created ? Math.floor((Date.now() - a.created) / 60000) : a.ago + Math.floor((Date.now() - LOADED) / 60000);
  function agoText(a) {
    const m = minutesAgo(a);
    if (m < 1) return "только что";
    if (m < 60) return `${m} мин назад`;
    if (m < 1440) return `${Math.floor(m / 60)} ч назад`;
    return `${Math.floor(m / 1440)} дн назад`;
  }
  const media = a => a.photo ? `<img src="${a.photo}" alt="">` : (window.VO_ILL[a.ill] || "");
  const tagFor = a => a.price === 0 ? '<span class="card__tag card__tag--free">Даром</span>'
    : a.cond === "Новое" ? '<span class="card__tag card__tag--new">Новое</span>' : `<span class="card__tag">${esc(a.cond)}</span>`;
  const heartSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.7 12 20 12 20Z"/></svg>';

  function cardHTML(a, i = 0) {
    return `<article class="card${a.mine ? " card--mine" : ""}" data-id="${a.id}" tabindex="0" style="--d:${Math.min(i, 12) * 45}ms" aria-label="${esc(a.title)}">
      <div class="card__media" data-v="0" style="--bg:${a.bg}">
        <span class="card__blob"></span>
        <div class="card__art">${media(a)}</div>
        ${tagFor(a)}
        <button class="heart-b${favs.has(a.id) ? " is-on" : ""}" type="button" data-fav="${a.id}" aria-pressed="${favs.has(a.id)}" aria-label="В избранное">${heartSvg}</button>
        ${a.photo ? "" : '<span class="card__bars"><i></i><i></i><i></i></span>'}
      </div>
      <div class="card__body">
        <div class="card__price">${price(a)}${a.bargain ? '<span class="card__bargain">Торг</span>' : ""}</div>
        <h3 class="card__title">${esc(a.title)}</h3>
        <div class="card__meta">${esc(a.city)} · ${agoText(a)}</div>
      </div>
    </article>`;
  }

  /* ---------- лента ---------- */
  let feed = { tab: "all", cat: null, q: null, mode: null };
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -40px" }) : null;
  function renderFeed() {
    const city = window.VO_CITY ? window.VO_CITY() : "Москва";
    let list = allAds();
    if (feed.mode === "fav") list = list.filter(a => favs.has(a.id));
    if (feed.mode === "my") list = list.filter(a => a.mine);
    if (feed.cat) list = list.filter(a => a.cat === feed.cat);
    if (feed.q) { const q = feed.q.toLowerCase(); list = list.filter(a => (a.title + " " + a.desc + " " + catName(a.cat)).toLowerCase().includes(q)); }
    if (feed.tab === "new") list = list.filter(a => minutesAgo(a) < 120);
    if (feed.tab === "free") list = list.filter(a => a.price === 0);
    if (feed.tab === "city" && city !== "Вся Россия") list = list.filter(a => a.city === city);
    if (feed.tab === "new" || feed.mode === "my") list.sort((a, b) => minutesAgo(a) - minutesAgo(b));

    const title = feed.mode === "fav" ? "Избранное" : feed.mode === "my" ? "Мои объявления" : feed.cat ? catName(feed.cat) : feed.q ? `По запросу «${feed.q}»` : "Свежие объявления";
    $("#feedTitle").textContent = title;
    const n = list.length, word = n % 10 === 1 && n % 100 !== 11 ? "объявление" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "объявления" : "объявлений";
    $("#feedSub").textContent = `${n} ${word}${feed.tab === "city" && city !== "Вся Россия" ? " · " + city : ""}`;
    const chip = $("#filterChip");
    const label = feed.mode === "fav" ? "Только избранное" : feed.mode === "my" ? "Только мои" : feed.cat ? catName(feed.cat) : feed.q ? `«${feed.q}»` : "";
    chip.hidden = !label; chip.innerHTML = label ? `${esc(label)} <a href="#/" aria-label="Сбросить фильтр">×</a>` : "";
    const grid = $("#grid");
    grid.innerHTML = list.map(cardHTML).join("");
    $("#empty").hidden = n > 0;
    $$(".card", grid).forEach(c => io && !reduce ? io.observe(c) : c.classList.add("in"));
    $$("#hdr .cat").forEach(c => c.classList.toggle("is-active", c.dataset.cat === feed.cat));
  }
  $("#feedTabs").addEventListener("click", e => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    feed.tab = b.dataset.tab; selectTab($("#feedTabs"), b); renderFeed();
  });
  addEventListener("city:change", () => { if (feed.tab === "city") renderFeed(); });

  // «фото» на карточке меняются при движении мыши
  document.addEventListener("pointermove", e => {
    const m = e.target.closest && e.target.closest(".card__media"); if (!m || m.closest(".ad")) return;
    const r = m.getBoundingClientRect(); m.dataset.v = Math.min(2, Math.floor((e.clientX - r.left) / r.width * 3));
  });
  document.addEventListener("pointerout", e => { const m = e.target.closest && e.target.closest(".card .card__media"); if (m && !m.contains(e.relatedTarget)) m.dataset.v = 0; });

  /* ---------- избранное ---------- */
  function toggleFav(id, btn) {
    const on = !favs.has(id);
    on ? favs.add(id) : favs.delete(id);
    store.set("vo_favs", [...favs]);
    $$(`[data-fav="${id}"]`).forEach(b => { b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on); });
    if (btn && on && !reduce) {
      btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
      const burst = document.createElement("span"); burst.className = "burst";
      burst.innerHTML = [0, 60, 120, 180, 240, 300].map(a => `<i style="--a:${a}deg"></i>`).join("");
      btn.appendChild(burst); setTimeout(() => burst.remove(), 600);
    }
    syncBadges(); renderFavPop();
    if (feed.mode === "fav" && current === "home") renderFeed();
    toast(on ? "Добавлено в избранное" : "Убрано из избранного", 1800);
  }
  document.addEventListener("click", e => {
    const f = e.target.closest("[data-fav]");
    if (f) { e.stopPropagation(); toggleFav(f.dataset.fav, f); return; }
    const c = e.target.closest(".card[data-id]");
    if (c && !c.closest(".post-prev")) location.hash = "#/ad/" + c.dataset.id;
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.matches && e.target.matches(".card[data-id]")) location.hash = "#/ad/" + e.target.dataset.id;
  });

  /* ---------- окно объявления ---------- */
  const modal = $("#adModal");
  function openAd(id) {
    const a = findAd(id);
    if (!a) { toast("Объявление не найдено"); location.hash = "#/"; return; }
    const views = a.photo ? [0] : [0, 1, 2];
    $("#adBody").innerHTML = `
      <div class="ad__media">
        <div class="card__media" data-v="0" style="--bg:${a.bg}"><span class="card__blob"></span><div class="card__art">${media(a)}</div>${tagFor(a)}</div>
        ${views.length > 1 ? `<div class="ad__thumbs">${views.map(v => `<button type="button" data-view="${v}" aria-pressed="${v === 0}" style="--bg:${a.bg}" aria-label="Фото ${v + 1}"><div class="card__media" data-v="${v}" style="--bg:${a.bg};border-radius:0;aspect-ratio:auto;height:100%"><div class="card__art">${media(a)}</div></div></button>`).join("")}</div>` : ""}
      </div>
      <div class="ad__info">
        <div class="ad__price">${price(a)}</div>
        <h2 class="ad__title" id="adTitle">${esc(a.title)}</h2>
        <div class="ad__tags"><span>${esc(catName(a.cat))}</span><span>${esc(a.cond)}</span>${a.bargain ? "<span>Торг уместен</span>" : ""}<span>${esc(a.city)}</span><span>${agoText(a)}</span></div>
        <p class="ad__desc">${esc(a.desc || "Без описания")}</p>
        <div class="ad__seller"><i>${esc(a.seller[0])}</i><div><b>${esc(a.seller)}</b><span>${a.mine ? "Это ваше объявление" : "Частное лицо"}</span></div></div>
        <div class="ad__acts">
          ${a.mine ? `<button class="btn btn--ghost" type="button" data-unpublish="${a.id}">Снять с публикации</button>` : `<button class="btn btn--accent" type="button" data-write="${a.id}">Написать продавцу</button>`}
          <button class="btn btn--ghost" type="button" data-fav="${a.id}" aria-pressed="${favs.has(a.id)}">${favs.has(a.id) ? "В избранном" : "В избранное"}</button>
          <button class="btn btn--ghost" type="button" data-share="${a.id}" aria-label="Скопировать ссылку">Поделиться</button>
        </div>
        <div class="ad__safe">Не переводите предоплату незнакомым людям и не сообщайте коды из СМС. <a href="#/safety">Как договориться безопасно →</a></div>
      </div>`;
    modal.hidden = false; modal.classList.remove("closing");
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => $(".modal__x").focus(), 50);
  }
  function closeAd(nav = true) {
    if (modal.hidden) return;
    modal.classList.add("closing");
    setTimeout(() => { modal.hidden = true; document.documentElement.style.overflow = ""; }, reduce ? 0 : 240);
    if (nav) location.hash = lastHome;
  }
  modal.addEventListener("click", e => {
    if (e.target.closest("[data-close]")) return closeAd();
    const v = e.target.closest("[data-view]");
    if (v) { $(".ad__media > .card__media").dataset.v = v.dataset.view; $$("[data-view]").forEach(b => b.setAttribute("aria-pressed", b === v)); }
    const w = e.target.closest("[data-write]");
    if (w) { if (!user) { needLogin("#/ad/" + w.dataset.write, "Войдите, чтобы написать продавцу"); } else toast("Переписка появится совсем скоро — мы её доделываем 🙂", 3600); }
    const s = e.target.closest("[data-share]");
    if (s) { const url = location.href; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast("Ссылка скопирована"), () => toast("Скопируйте адрес из строки браузера")); }
    const u = e.target.closest("[data-unpublish]");
    if (u) { mine = mine.filter(a => a.id !== u.dataset.unpublish); store.set("vo_my_ads", mine); toast("Объявление снято с публикации"); closeAd(); renderFeed(); }
    const f = e.target.closest("[data-fav]");
    if (f) setTimeout(() => { f.textContent = favs.has(f.dataset.fav) ? "В избранном" : "В избранное"; }, 0);
  });
  addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeAd(); });

  /* ---------- шапка: панели иконок, профиль ---------- */
  const acts = $("#hdr .acts");
  const pops = {};
  function makePop(key, btn) {
    const p = document.createElement("div");
    p.className = "pop"; p.setAttribute("role", "dialog");
    acts.appendChild(p); pops[key] = { p, btn };
    btn.addEventListener("click", e => { e.stopPropagation(); togglePop(key); });
    return p;
  }
  function togglePop(key, force) {
    Object.entries(pops).forEach(([k, { p, btn }]) => {
      const on = k === key ? (force ?? !p.classList.contains("is-open")) : false;
      p.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", on);
    });
    if (key === "bell" && pops.bell.p.classList.contains("is-open")) { notes.forEach(n => n.read = true); store.set("vo_notes", notes); syncBadges(); }
  }
  document.addEventListener("click", e => { if (!e.target.closest(".pop")) togglePop(null); });
  addEventListener("keydown", e => { if (e.key === "Escape") togglePop(null); });

  const favPop = makePop("fav", $("#favBtn"));
  const msgPop = makePop("msg", $("#msgBtn"));
  const bellPop = makePop("bell", $("#bellBtn"));
  function renderFavPop() {
    const list = allAds().filter(a => favs.has(a.id));
    favPop.innerHTML = `<h4>Избранное ${list.length ? '<a href="#/fav">Все</a>' : ""}</h4>` + (list.length
      ? `<ul class="pop__list">${list.map(a => `<li class="pop__item" data-open="${a.id}"><span class="pop__thumb" style="background:${a.bg}">${a.photo ? `<img src="${a.photo}" alt="" style="width:100%;height:100%;object-fit:cover">` : window.VO_ILL[a.ill]}</span><span class="pop__txt"><b>${a.price === 0 ? "Даром" : a.price.toLocaleString("ru-RU") + " ₽"}</b><span>${esc(a.title)}</span></span><button class="pop__x" data-fav="${a.id}" aria-label="Убрать из избранного">×</button></li>`).join("")}</ul>`
      : `<div class="pop__empty"><svg width="56" height="56" viewBox="0 0 24 24" fill="#FFEDEA" stroke="#FF4F3A" stroke-width="1.6" stroke-linejoin="round"><path d="M12 20s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.7 12 20 12 20Z"/></svg><b>Пока пусто</b>Нажмите на сердечко у объявления — оно сохранится здесь.</div>`);
  }
  favPop.addEventListener("click", e => { const i = e.target.closest("[data-open]"); if (i && !e.target.closest("[data-fav]")) { togglePop(null); location.hash = "#/ad/" + i.dataset.open; } if (e.target.closest("a")) togglePop(null); });
  function renderMsgPop() {
    msgPop.innerHTML = `<h4>Сообщения</h4><div class="pop__empty"><svg width="64" height="56" viewBox="0 0 64 56"><path d="M8 6h30a16 16 0 0 1 0 32H22L8 50Z" fill="#F4F5F7"/><circle cx="22" cy="22" r="3" fill="#16181D"/><circle cx="32" cy="22" r="3" fill="#16181D"/><circle cx="42" cy="22" r="3" fill="#FF4F3A"/></svg>`
      + (user ? `<b>Диалогов пока нет</b>Напишите продавцу из объявления — переписка появится здесь.` : `<b>Войдите, чтобы переписываться</b>Сообщения с продавцами и покупателями будут здесь.<br><a class="pop__btn" href="#/login">Войти</a>`) + `</div>`;
  }
  msgPop.addEventListener("click", e => { if (e.target.closest("a")) { togglePop(null); sessionStorage.setItem("vo_return", location.hash || "#/"); } });
  function renderBellPop() {
    bellPop.innerHTML = `<h4>Уведомления</h4>` + notes.slice(0, 6).map(n => `<div class="note-i"><i><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 7v6M12 17h.01"/></svg></i><div><b>${esc(n.title)}</b><span>${esc(n.text)}</span></div></div>`).join("");
  }
  function syncBadges() {
    const set = (btn, n) => { const b = $(".badge", btn); b.hidden = !n; b.textContent = n > 9 ? "9+" : n; };
    set($("#favBtn"), favs.size); set($("#bellBtn"), notes.filter(n => !n.read).length);
    renderBellPop(); renderMsgPop();
    if (mePop) renderMe();
  }

  // вход / профиль
  const loginBtn = $("#loginBtn");
  let meWrap = null, mePop = null;
  function renderMe() {
    if (!user) { if (meWrap) { meWrap.remove(); meWrap = mePop = null; delete pops.me; } loginBtn.hidden = false; return; }
    loginBtn.hidden = true;
    if (!meWrap) {
      meWrap = document.createElement("div"); meWrap.className = "me-wrap";
      meWrap.innerHTML = `<button class="me" type="button" aria-haspopup="menu"><span class="me__ava"></span><span class="me__name"></span></button>`;
      loginBtn.after(meWrap);
      mePop = document.createElement("div"); mePop.className = "pop pop--me"; mePop.setAttribute("role", "menu");
      meWrap.appendChild(mePop);
      pops.me = { p: mePop, btn: $(".me", meWrap) };
      $(".me", meWrap).addEventListener("click", e => { e.stopPropagation(); togglePop("me"); });
      mePop.addEventListener("click", e => {
        if (e.target.closest("[data-logout]")) { user = null; store.set("vo_user", null); renderMe(); syncBadges(); toast("Вы вышли из аккаунта"); if (["post"].includes(current)) location.hash = "#/"; }
        togglePop(null);
      });
    }
    $(".me__ava", meWrap).textContent = user.name[0].toUpperCase();
    $(".me__name", meWrap).textContent = user.name;
    mePop.innerHTML = `<div style="padding:10px 12px 8px"><b>${esc(user.name)}</b><div style="font-size:13px;color:var(--muted);font-weight:600">${esc(user.email)}</div></div><div class="sep"></div>
      <a href="#/my">Мои объявления <small>${mine.length}</small></a><a href="#/fav">Избранное <small>${favs.size}</small></a><a href="#/post">Разместить объявление</a>
      <div class="sep"></div><button type="button" class="out" data-logout>Выйти</button>`;
  }
  function needLogin(ret, msg) { sessionStorage.setItem("vo_return", ret); toast(msg); location.hash = "#/login"; }

  /* ---------- переключатели с «чернилами» ---------- */
  function selectTab(group, btn) {
    $$("[role=tab]", group).forEach(b => b.setAttribute("aria-selected", b === btn));
    const ink = $(".tabs__ink, .seg__ink", group);
    if (ink) { ink.style.width = btn.offsetWidth + "px"; ink.style.transform = `translateX(${btn.offsetLeft}px)`; }
  }
  const syncInks = () => $$(".tabs, .seg").forEach(g => { const b = $("[aria-selected=true]", g); if (b && b.offsetWidth) selectTab(g, b); });
  addEventListener("resize", syncInks);
  if (document.fonts) document.fonts.ready.then(syncInks);

  /* ---------- появление блоков при прокрутке ---------- */
  const rvIO = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("rv-on"); rvIO.unobserve(e.target); } }), { rootMargin: "0px 0px -60px" }) : null;
  const reveal = root => $$("[data-rv]:not(.rv-on)", root).forEach(el => rvIO && !reduce ? rvIO.observe(el) : el.classList.add("rv-on"));

  /* ================= КАК ЭТО РАБОТАЕТ ================= */
  const HOW = {
    sell: [
      ["Разместите объявление", "Фото, название, цена — и готово. Это бесплатно.", "post"],
      ["Отвечайте покупателям", "Вопросы придут в сообщения на сайте.", "chat"],
      ["Договоритесь о передаче", "Встреча в вашем городе или отправка посылкой — как удобно обоим.", "deal"],
      ["Передайте вещь", "Получите оплату при передаче и снимите объявление.", "done"],
    ],
    buy: [
      ["Найдите нужное", "Поиск, категории и выбор города быстро сузят выдачу.", "find"],
      ["Напишите продавцу", "Уточните детали, попросите дополнительные фото или видео.", "chat"],
      ["Договоритесь", "Встреча в людном месте или отправка с оплатой при получении.", "deal"],
      ["Проверьте и заберите", "Осмотрите вещь до оплаты — это нормально и правильно.", "check"],
    ],
  };
  let howRole = "sell", howI = 0, howTimer = 0, typeT = 0;
  const HOW_MS = 4800;
  function howShow(i) {
    howI = i;
    const steps = HOW[howRole];
    $$("#howSteps li").forEach((li, k) => li.classList.toggle("is-on", k === i));
    const sc = steps[i][2];
    $$(".scene").forEach(s => s.classList.remove("is-on"));
    const el = $(`.scene[data-scene="${sc}"]`); void el.offsetWidth; el.classList.add("is-on");
    if (sc === "find") { clearTimeout(typeT); const txt = $(".mini-search__txt"), w = "велосипед"; let k = 0; txt.textContent = ""; const step = () => { txt.textContent = w.slice(0, ++k); if (k < w.length) typeT = setTimeout(step, 110); }; typeT = setTimeout(step, 400); }
    $$(".mini-grid i").forEach((m, k) => m.style.setProperty("--k", k));
    const bar = $("#howBar");
    bar.style.transition = "none"; bar.style.transform = "scaleX(0)"; void bar.offsetWidth;
    if (!reduce) { bar.style.transition = `transform ${HOW_MS}ms linear`; bar.style.transform = "scaleX(1)"; }
    clearTimeout(howTimer);
    if (!reduce) howTimer = setTimeout(() => { if (current === "how") howShow((howI + 1) % steps.length); }, HOW_MS);
  }
  function howRender() {
    $("#howSteps").innerHTML = HOW[howRole].map(([t, d], i) => `<li><button type="button" data-step="${i}"><span class="n">${i + 1}</span><b>${t}</b><span>${d}</span></button></li>`).join("");
    howShow(0);
  }
  $("#howSteps").addEventListener("click", e => { const b = e.target.closest("[data-step]"); if (b) howShow(+b.dataset.step); });
  $("#howSeg").addEventListener("click", e => { const b = e.target.closest("[data-role]"); if (!b) return; howRole = b.dataset.role; selectTab($("#howSeg"), b); howRender(); });

  /* ================= БЕЗОПАСНОСТЬ ================= */
  $("#safeSeg").addEventListener("click", e => {
    const b = e.target.closest("[data-t]"); if (!b) return;
    selectTab($("#safeSeg"), b);
    $$("#safeTips .tips__list").forEach(l => { l.hidden = l.dataset.t !== b.dataset.t; $$("li", l).forEach((li, i) => { li.style.setProperty("--i", i); li.style.animation = "none"; void li.offsetWidth; li.style.animation = ""; }); });
  });
  const QUIZ = [
    ["Покупатель просит продиктовать код из СМС, «чтобы перевести вам деньги».", "bad", "Код из СМС нужен только вам. С ним у вас могут списать деньги или угнать аккаунт."],
    ["Продавец предлагает встретиться днём у входа в торговый центр и проверить телефон на месте.", "ok", "Отличный вариант: людное место и возможность всё проверить до оплаты."],
    ["Собеседник присылает ссылку «на оформление доставки», где нужно ввести данные карты.", "bad", "Это поддельная страница. Доставку оформляйте сами на официальном сайте службы."],
    ["Продавец отправляет посылку наложенным платежом через Почту России — оплата при получении.", "ok", "Надёжный способ: вы платите только после того, как увидели посылку."],
    ["Новый ноутбук за полцены, но только если переведёте предоплату сегодня.", "bad", "Слишком низкая цена и спешка — два главных признака обмана."],
    ["Покупатель просит прислать ещё пару фото и видео, что вещь работает.", "ok", "Нормальная просьба — честный продавец легко её выполнит."],
  ];
  let qi = 0, qScore = [];
  function quizShow() {
    const card = $("#quizCard");
    card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
    $("#quizA").hidden = true; $(".quiz__btns").hidden = false;
    if (qi >= QUIZ.length) {
      const ok = qScore.filter(Boolean).length;
      $("#quizN").textContent = "Итог";
      $("#quizQ").textContent = ok === QUIZ.length ? `Все ${ok} из ${QUIZ.length}! Вас не проведёшь 💪` : `${ok} из ${QUIZ.length}. Загляните в советы выше — и всё получится.`;
      $(".quiz__btns").hidden = true;
      const a = $("#quizA"); a.hidden = false; $("b", a).textContent = ""; $("p", a).textContent = ""; $("#quizNext").textContent = "Пройти ещё раз";
    } else {
      $("#quizN").textContent = `Ситуация ${qi + 1} из ${QUIZ.length}`;
      $("#quizQ").textContent = QUIZ[qi][0];
      $("#quizNext").textContent = qi === QUIZ.length - 1 ? "Результат" : "Дальше";
    }
    $("#quizDots").innerHTML = QUIZ.map((_, k) => `<i class="${k === qi ? "cur" : qScore[k] === true ? "good" : qScore[k] === false ? "miss" : ""}"></i>`).join("");
  }
  $(".quiz__btns").addEventListener("click", e => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const right = b.dataset.a === QUIZ[qi][1]; qScore[qi] = right;
    const a = $("#quizA"), t = $("b", a);
    t.textContent = right ? "Верно!" : "Не совсем"; t.className = right ? "ok" : "bad";
    $("p", a).textContent = QUIZ[qi][2]; a.hidden = false; $(".quiz__btns").hidden = true;
  });
  $("#quizNext").addEventListener("click", () => { if (qi >= QUIZ.length) { qi = 0; qScore = []; } else qi++; quizShow(); });

  /* ================= ПОМОЩЬ ================= */
  const FAQ = [
    ["ads", "Сколько стоит разместить объявление?", "Нисколько. Размещение бесплатное, платных функций сейчас нет."],
    ["ads", "Как разместить объявление?", "Нажмите «Разместить объявление» в шапке, войдите по почте, выберите категорию, добавьте название, цену, описание и фото — и опубликуйте."],
    ["ads", "Как снять объявление с публикации?", "Откройте его через меню профиля → «Мои объявления» и нажмите «Снять с публикации». Редактирование появится в ближайших обновлениях."],
    ["ads", "Что нельзя продавать?", "Всё, что запрещено законом РФ: оружие, наркотики, рецептурные лекарства, поддельные документы, чужие персональные данные и т. п. Такие объявления мы удаляем."],
    ["ads", "Почему объявление могут скрыть?", "Если оно нарушает правила: запрещённый товар, обман, чужие фото, оскорбления. Также проверяем объявления по жалобам пользователей."],
    ["acc", "Как войти или зарегистрироваться?", "Нажмите «Войти», укажите почту и введите код из письма. Пароль не нужен: если аккаунта ещё нет, он создастся автоматически."],
    ["acc", "Не приходит код на почту", "Проверьте папку «Спам» и правильность адреса. Через минуту код можно отправить повторно."],
    ["acc", "Как выйти из аккаунта?", "Нажмите на своё имя в шапке сайта и выберите «Выйти»."],
    ["deal", "Можно ли оплатить покупку через сайт?", "Нет. Мы — доска объявлений: деньги через сайт не проходят. Вы договариваетесь и рассчитываетесь с продавцом напрямую."],
    ["deal", "Как получить вещь из другого города?", "Договоритесь с продавцом об отправке через Почту России, СДЭК, Boxberry или другую службу. Надёжнее всего наложенный платёж: вы оплачиваете посылку при получении, после осмотра."],
    ["deal", "Кто отвечает за сделку?", "Покупатель и продавец. Мы не участвуем в расчётах и доставке, но блокируем нарушителей и подсказываем, как договориться безопасно."],
    ["safe", "Как распознать мошенника?", "Настораживают просьбы о коде из СМС, ссылки «на оплату» или «доставку», предоплата третьему лицу, давление и слишком низкая цена. Подробнее — на странице «Безопасность»."],
    ["safe", "Как пожаловаться на объявление?", "Откройте «Написать нам», выберите тему «Жалоба» и приложите ссылку на объявление. Жалобы рассматриваем в первую очередь."],
    ["site", "Что значит «бета-версия»?", "Сайт только запустился: мы добавляем функции и исправляем ошибки. Будем рады любым отзывам."],
    ["site", "Зачем сайту cookie?", "Технические cookie нужны для входа и настроек. Аналитические и рекламные — только с вашего согласия; выбор можно изменить в баннере cookie."],
    ["site", "Как с вами связаться?", "Через страницу «Написать нам». Мы отвечаем на почту, которую вы укажете в форме."],
  ];
  let faqG = "all";
  function faqRender() {
    const q = $("#helpQ").value.trim().toLowerCase();
    const rx = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi") : null;
    const hl = s => rx ? esc(s).replace(rx, m => `<mark>${m}</mark>`) : esc(s);
    const list = FAQ.filter(([g, t, a]) => (faqG === "all" || g === faqG) && (!q || (t + " " + a).toLowerCase().includes(q)));
    $("#faq").innerHTML = list.map(([, t, a], i) => `<div class="qa-i${q && i === 0 ? " open" : ""}" style="--i:${i}"><button type="button" aria-expanded="${q && i === 0}">${hl(t)}</button><div class="qa-i__a"><div><p>${hl(a)}</p></div></div></div>`).join("");
    $("#faqEmpty").hidden = list.length > 0;
  }
  $("#faq").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; const it = b.parentElement; const on = it.classList.toggle("open"); b.setAttribute("aria-expanded", on); });
  $("#helpQ").addEventListener("input", faqRender);
  $("#helpChips").addEventListener("click", e => { const b = e.target.closest("[data-g]"); if (!b) return; faqG = b.dataset.g; $$("#helpChips button").forEach(x => x.setAttribute("aria-pressed", x === b)); faqRender(); });

  /* ================= ФОРМЫ ================= */
  const MAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function check(field, ok) { field.classList.toggle("bad", !ok); return ok; }
  const counter = (inp, out, max) => inp.addEventListener("input", () => { out.textContent = `${inp.value.length} / ${max}`; });

  // Написать нам. Сервера пока нет: когда подключим корпоративную почту, отправка пойдёт на CONTACT_ENDPOINT.
  const CONTACT_ENDPOINT = null;
  const cf = $("#contactForm");
  counter($("#cMsg"), $("#cCount"), 1500);
  cf.addEventListener("input", e => { const f = e.target.closest(".field"); if (f) f.classList.remove("bad"); });
  cf.addEventListener("submit", async e => {
    e.preventDefault();
    const ok = [check($("#cName").parentElement, $("#cName").value.trim().length > 1), check($("#cMail").parentElement, MAIL_RX.test($("#cMail").value.trim())), check($("#cMsg").parentElement, $("#cMsg").value.trim().length > 4)].every(Boolean);
    if (!ok) return;
    const btn = $(".btn--send", cf); btn.classList.add("flying"); btn.disabled = true;
    const data = Object.fromEntries(new FormData(cf));
    if (CONTACT_ENDPOINT) { try { await fetch(CONTACT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); } catch (err) { toast("Не удалось отправить. Попробуйте ещё раз"); btn.classList.remove("flying"); btn.disabled = false; return; } }
    else store.set("vo_outbox", [...store.get("vo_outbox", []), { ...data, t: Date.now() }]);
    setTimeout(() => { $("#sent").hidden = false; btn.classList.remove("flying"); btn.disabled = false; }, reduce ? 0 : 600);
  });
  $("#sentAgain").addEventListener("click", () => { cf.reset(); $("#cCount").textContent = "0 / 1500"; $("#sent").hidden = true; if (user) { $("#cName").value = user.name; $("#cMail").value = user.email; } });

  /* ================= ВХОД ПО ПОЧТЕ =================
     Сейчас без сервера: код показывается в уведомлении.
     Когда появится корпоративная почта, отправку и проверку кода перенесём на сервер. */
  let pending = null, resendT = 0;
  const steps = $$(".auth__step");
  const authStep = name => steps.forEach(s => s.classList.toggle("is-on", s.dataset.step === name));
  function sendCode() {
    pending.code = String(Math.floor(100000 + Math.random() * 900000));
    toast(`Демо-режим: письмо пока не отправляется. Ваш код <code>${pending.code}</code>`, 9000);
    let s = 59; const r = $("#resend"); r.disabled = true; $("#resendT").textContent = s;
    r.innerHTML = `Отправить снова через <span id="resendT">${s}</span> с`;
    clearInterval(resendT);
    resendT = setInterval(() => { s--; if (s <= 0) { clearInterval(resendT); r.disabled = false; r.textContent = "Отправить код снова"; } else $("#resendT").textContent = s; }, 1000);
  }
  $("#authMail").addEventListener("submit", e => {
    e.preventDefault();
    const m = $("#aMail").value.trim().toLowerCase();
    if (!check($("#aMail").parentElement, MAIL_RX.test(m))) return;
    pending = { email: m }; $("#aMailShow").textContent = m;
    authStep("code"); otpClear(); sendCode(); setTimeout(() => $("#otp input").focus(), 80);
  });
  $("#aMail").addEventListener("input", () => $("#aMail").parentElement.classList.remove("bad"));
  $("[data-back]").addEventListener("click", () => { authStep("mail"); $("#aMail").focus(); });
  $("#resend").addEventListener("click", () => { otpClear(); sendCode(); });
  const otp = $("#otp"), cells = $$("input", otp);
  function otpClear() { cells.forEach(c => { c.value = ""; c.classList.remove("filled"); }); otp.classList.remove("bad", "ok"); }
  function otpCheck() {
    const v = cells.map(c => c.value).join(""); if (v.length < 6) return;
    if (v === pending.code) {
      otp.classList.add("ok");
      setTimeout(() => { const known = store.get("vo_users", {})[pending.email]; if (known) login({ email: pending.email, name: known }); else { authStep("name"); $("#aName").focus(); } }, reduce ? 0 : 650);
    } else { otp.classList.remove("bad"); void otp.offsetWidth; otp.classList.add("bad"); setTimeout(() => { otpClear(); otp.classList.add("bad"); cells[0].focus(); }, 400); }
  }
  cells.forEach((c, i) => {
    c.addEventListener("input", () => {
      c.value = c.value.replace(/\D/g, "").slice(-1); c.classList.toggle("filled", !!c.value); otp.classList.remove("bad");
      if (c.value && cells[i + 1]) cells[i + 1].focus(); otpCheck();
    });
    c.addEventListener("keydown", e => { if (e.key === "Backspace" && !c.value && cells[i - 1]) { cells[i - 1].focus(); cells[i - 1].value = ""; cells[i - 1].classList.remove("filled"); } });
    c.addEventListener("paste", e => { e.preventDefault(); const d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6); d.split("").forEach((ch, k) => { cells[k].value = ch; cells[k].classList.add("filled"); }); (cells[d.length] || cells[5]).focus(); otpCheck(); });
  });
  $("#authName").addEventListener("submit", e => {
    e.preventDefault();
    const n = $("#aName").value.trim();
    if (!check($("#aName").parentElement, n.length > 0)) return;
    const users = store.get("vo_users", {}); users[pending.email] = n; store.set("vo_users", users);
    login({ email: pending.email, name: n });
  });
  function login(u) {
    user = u; store.set("vo_user", u); clearInterval(resendT);
    addNote("Вы вошли", `Аккаунт ${u.email}. Теперь можно размещать объявления.`);
    renderMe(); syncBadges(); toast(`Здравствуйте, ${esc(u.name)}!`);
    const ret = sessionStorage.getItem("vo_return") || "#/"; sessionStorage.removeItem("vo_return");
    location.hash = ret;
  }

  /* ================= РАЗМЕСТИТЬ ================= */
  const pf = $("#postForm");
  $("#postCat").insertAdjacentHTML("beforeend", CATS.map((c, i) => `<label><input type="radio" name="cat" value="${c.id}"><span>${c.icon}${c.name}</span></label>`).join(""));
  let photo = null;
  counter($("#pTitle"), $("#pTitleC"), 70); counter($("#pDesc"), $("#pDescC"), 1500);
  function draft() {
    const cat = (pf.querySelector("input[name=cat]:checked") || {}).value || "tech";
    const free = $("#pFree").checked;
    return {
      id: "draft", cat, title: $("#pTitle").value.trim() || "Название объявления",
      price: free ? 0 : +($("#pPrice").value.replace(/\D/g, "") || 0) || 0, cond: free ? "Даром" : pf.querySelector("input[name=cond]:checked").value,
      city: window.VO_CITY ? (window.VO_CITY() === "Вся Россия" ? "Москва" : window.VO_CITY()) : "Москва", created: Date.now(),
      seller: user ? user.name : "Вы", desc: $("#pDesc").value.trim(), photo, ill: window.VO_CAT_ILL[cat], bg: window.VO_CAT_BG[cat],
    };
  }
  const drawPrev = () => { $("#postPrev").innerHTML = cardHTML(draft()).replace('class="card', 'class="card in'); };
  pf.addEventListener("input", e => { if (e.target.name === "cat") $("#postCat").classList.remove("bad"); const f = e.target.closest(".field"); if (f) f.classList.remove("bad"); if (e.target.id === "pPrice") e.target.value = e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " "); drawPrev(); });
  $("#pFree").addEventListener("change", () => { $("#pPrice").disabled = $("#pFree").checked; if ($("#pFree").checked) $("#pPrice").value = ""; drawPrev(); });
  const drop = $("#pDrop");
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if (f) takePhoto(f); });
  $("#pPhoto").addEventListener("change", e => { const f = e.target.files[0]; if (f) takePhoto(f); });
  function takePhoto(file) {
    if (!file.type.startsWith("image/")) return toast("Это не похоже на изображение");
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 900 / Math.max(img.width, img.height)), cv = document.createElement("canvas");
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      photo = cv.toDataURL("image/jpeg", .8); URL.revokeObjectURL(url);
      $(".drop__ic", drop).innerHTML = `<img src="${photo}" alt="">`; $("b", drop).textContent = "Фото добавлено"; drawPrev();
    };
    img.src = url;
  }
  pf.addEventListener("submit", e => {
    e.preventDefault();
    const d = draft();
    const hasCat = !!pf.querySelector("input[name=cat]:checked");
    $("#postCat").classList.toggle("bad", !hasCat);
    const ok = [hasCat, check($("#pTitle").parentElement, $("#pTitle").value.trim().length >= 3), check($("#pPrice").parentElement, $("#pFree").checked || d.price > 0)].every(Boolean);
    if (!ok) return toast("Проверьте выделенные поля");
    const ad = { ...d, id: "m" + Date.now() };
    const next = [ad, ...mine];
    if (!store.set("vo_my_ads", next)) return toast("Фото слишком большое для хранения в браузере — попробуйте другое");
    mine = next; renderMe();
    addNote("Объявление опубликовано", `«${ad.title}» — оно уже в ленте.`);
    toast("Опубликовано! 🎉");
    pf.reset(); photo = null; $(".drop__ic", drop).innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="12" cy="12" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/></svg>'; $("b", drop).textContent = "Добавьте фото";
    $("#pPrice").disabled = false; $("#pTitleC").textContent = "0 / 70"; $("#pDescC").textContent = "0 / 1500";
    lastHome = "#/my"; location.hash = "#/ad/" + ad.id;
  });

  /* ================= МАРШРУТИЗАЦИЯ ================= */
  let current = null, lastHome = "#/";
  const TITLES = { how: "Как это работает", safety: "Безопасность", help: "Помощь", contact: "Написать нам", login: "Вход", post: "Разместить объявление" };
  function show(page) {
    if (current === page) return false;
    current = page;
    $$(".page").forEach(p => p.classList.toggle("is-on", p.dataset.page === page));
    document.title = (TITLES[page] ? TITLES[page] + " — " : "") + "Все объявления";
    scrollTo(0, 0);
    reveal($(`.page[data-page="${page}"]`));
    requestAnimationFrame(syncInks);
    return true;
  }
  function route() {
    const [path, qs] = (location.hash.slice(1) || "/").split("?");
    const params = new URLSearchParams(qs || "");
    const parts = path.split("/").filter(Boolean);
    const head = parts[0] || "";
    togglePop(null);
    if (head !== "ad") closeAd(false);

    if (head === "" || head === "c" || head === "s" || head === "fav" || head === "my") {
      if (head === "my" && !user) return needLogin("#/my", "Войдите, чтобы увидеть свои объявления");
      feed = { ...feed, cat: head === "c" ? parts[1] : null, q: head === "s" ? decodeURIComponent(parts.slice(1).join("/")) : null, mode: head === "fav" ? "fav" : head === "my" ? "my" : null };
      lastHome = location.hash || "#/";
      show("home"); renderFeed();
      if (head === "s") { const inp = $("#q"); if (inp) { inp.value = feed.q; $("#search").classList.add("has-value"); } }
      return;
    }
    if (head === "ad") { if (current !== "home") { show("home"); renderFeed(); } return openAd(parts[1]); }
    if (head === "post" && !user) return needLogin("#/post", "Войдите, чтобы разместить объявление");
    if (head === "login" && user) { location.hash = "#/"; return; }
    if (!TITLES[head]) { location.hash = "#/"; return; }
    const fresh = show(head);
    if (head === "how" && fresh) howRender();
    if (head === "safety" && fresh) { qi = 0; qScore = []; quizShow(); }
    if (head === "help") { $("#helpQ").value = params.get("q") || ""; faqRender(); }
    if (head === "contact") { const t = params.get("topic"); if (t) { const r = $(`#topics input[value="${t}"]`); if (r) r.checked = true; } if (user) { $("#cName").value ||= user.name; $("#cMail").value ||= user.email; } }
    if (head === "login" && fresh) { authStep("mail"); setTimeout(() => $("#aMail").focus(), 100); }
    if (head === "post") drawPrev();
  }
  addEventListener("hashchange", route);

  $("#year").textContent = new Date().getFullYear();
  renderFavPop(); renderMe(); syncBadges();
  route();
})();
