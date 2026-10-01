/* Все объявления — шапка: только переключение классов, всё движение — в CSS. */
(() => {
  const CATS = [{"id": "auto", "name": "Авто", "subs": ["Легковые", "Мотоциклы", "Грузовики", "Спецтехника", "Водный транспорт", "Прицепы"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><g class=\"car\"><path d=\"M3 15v-3.2l2-4.3a2 2 0 0 1 1.8-1.2h10.4a2 2 0 0 1 1.8 1.2l2 4.3V15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z\"/><path d=\"M3.5 11.5h17\"/></g><g class=\"wh\"><circle cx=\"7\" cy=\"16.5\" r=\"2.2\" fill=\"#fff\"/><path d=\"M7 14.3v4.4\"/></g><g class=\"wh\"><circle cx=\"17\" cy=\"16.5\" r=\"2.2\" fill=\"#fff\"/><path d=\"M17 14.3v4.4\"/></g></svg>"}, {"id": "parts", "name": "Запчасти", "subs": ["Для легковых", "Шины и диски", "Масла и автохимия", "Аудио и видео", "Инструменты", "Для мототехники", "Для грузовиков"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><g class=\"gr\"><path d=\"M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/></g><circle cx=\"12\" cy=\"12\" r=\"1.8\"/></svg>"}, {"id": "realty", "name": "Недвижимость", "subs": ["Квартиры", "Комнаты", "Дома и дачи", "Посуточно", "Новостройки", "Гаражи", "Коммерческая", "Участки"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle class=\"smoke\" cx=\"17\" cy=\"2.6\" r=\"1.3\" fill=\"#C3C7CF\" stroke=\"none\"/><path d=\"M4 11 12 4l8 7\"/><path d=\"M6 9.5V20h12V9.5\"/><path d=\"M16 7.2V4.5h2v4.3\"/><rect class=\"win\" x=\"10\" y=\"12.5\" width=\"4\" height=\"4\" rx=\".8\" fill=\"transparent\"/></svg>"}, {"id": "job", "name": "Работа", "subs": ["Вакансии", "Резюме", "Подработка", "Удалённо", "Стажировки", "Вахта"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path class=\"hdl\" d=\"M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8\"/><rect x=\"3.5\" y=\"8\" width=\"17\" height=\"11.5\" rx=\"2.5\"/><path d=\"M3.5 13h17\"/><rect class=\"lock\" x=\"10.5\" y=\"11.5\" width=\"3\" height=\"3\" rx=\".8\" fill=\"#fff\"/></svg>"}, {"id": "service", "name": "Услуги", "subs": ["Ремонт и отделка", "Красота и здоровье", "Обучение и курсы", "Перевозки", "Уборка", "IT и дизайн", "Праздники", "Ремонт техники"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path class=\"wr\" d=\"M14.5 5.5a4 4 0 0 0-5.2 5.1l-4.8 4.8a1.9 1.9 0 0 0 2.7 2.7l4.8-4.8a4 4 0 0 0 5.1-5.2l-2.4 2.4-2.2-.6-.6-2.2Z\"/></svg>"}, {"id": "tech", "name": "Электроника", "subs": ["Телефоны", "Ноутбуки", "Планшеты", "Фото и видео", "Аудио", "Игры и приставки", "ТВ", "Комплектующие"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><g class=\"ph\"><rect x=\"7\" y=\"3\" width=\"10\" height=\"18\" rx=\"2.5\"/><rect class=\"scr\" x=\"9\" y=\"5.5\" width=\"6\" height=\"10\" rx=\"1\" fill=\"transparent\" stroke=\"none\"/><path d=\"M11 18.3h2\"/></g></svg>"}, {"id": "wear", "name": "Одежда и обувь", "subs": ["Женская одежда", "Мужская одежда", "Обувь", "Сумки", "Часы и украшения", "Красота и уход"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path class=\"tee\" d=\"M9 4 4 6.5l1.8 4 2.2-1V20h8V9.5l2.2 1 1.8-4L15 4a3 3 0 0 1-6 0Z\"/></svg>"}, {"id": "home", "name": "Дом и сад", "subs": ["Мебель", "Бытовая техника", "Ремонт и стройка", "Растения", "Посуда", "Текстиль", "Сад и огород", "Освещение"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path class=\"lf1\" d=\"M12 10.5c-3 0-5-1.5-5-4.5 3 0 5 1.5 5 4.5Z\"/><path class=\"lf2\" d=\"M12 9c0-3 2-4.5 5-4.5 0 3-2 4.5-5 4.5Z\"/><path d=\"M12 14V8.5\"/><path d=\"M6.5 14h11l-1.4 6.2H7.9Z\"/></svg>"}, {"id": "kids", "name": "Детям", "subs": ["Коляски", "Автокресла", "Игрушки", "Детская одежда", "Детская мебель", "Товары для мам"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><g class=\"bln\"><path d=\"M12 3c3 0 5 2.4 5 5.3 0 3.4-2.8 6.2-5 6.2s-5-2.8-5-6.2C7 5.4 9 3 12 3Z\"/><path d=\"m11.1 14.5.9 1.2.9-1.2\"/></g><path d=\"M12 15.8c-1.2 1.5 1.2 2.6 0 4.6\"/></svg>"}, {"id": "hobby", "name": "Хобби и спорт", "subs": ["Велосипеды", "Спорт и отдых", "Туризм", "Музыкальные инструменты", "Книги", "Коллекции", "Билеты"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse class=\"bsh\" cx=\"12\" cy=\"21\" rx=\"4\" ry=\"1\" fill=\"#C3C7CF\" stroke=\"none\"/><g class=\"ball\"><circle cx=\"12\" cy=\"11\" r=\"6.5\"/><path d=\"M6.2 9c3.8 1.6 7.8 1.6 11.6 0M12 4.5c-2 3.6-2 9.4 0 13\"/></g></svg>"}, {"id": "pets", "name": "Животные", "subs": ["Собаки", "Кошки", "Птицы", "Аквариум", "Товары для животных", "Другие животные"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse class=\"toe\" cx=\"5.5\" cy=\"10.5\" rx=\"1.6\" ry=\"2\"/><ellipse class=\"toe\" cx=\"9.2\" cy=\"6.6\" rx=\"1.6\" ry=\"2.1\"/><ellipse class=\"toe\" cx=\"14.8\" cy=\"6.6\" rx=\"1.6\" ry=\"2.1\"/><ellipse class=\"toe\" cx=\"18.5\" cy=\"10.5\" rx=\"1.6\" ry=\"2\"/><path d=\"M12 12.5c-2.6 0-5 2.6-5 4.8 0 1.6 1.2 2.2 2.4 2.2 1 0 1.6-.6 2.6-.6s1.6.6 2.6.6c1.2 0 2.4-.6 2.4-2.2 0-2.2-2.4-4.8-5-4.8Z\"/></svg>"}, {"id": "free", "name": "Отдам даром", "subs": ["Вещи", "Мебель", "Техника", "Детское", "Книги", "Растения", "Животные в добрые руки"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path class=\"spark\" d=\"M12 1.8v2.4M9.6 3l1 1.4M14.4 3l-1 1.4\" stroke-width=\"1.6\"/><path d=\"M5 11.5h14V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z\"/><path d=\"M12 11.5V21\"/><g class=\"lid\"><rect x=\"3.5\" y=\"7.5\" width=\"17\" height=\"4\" rx=\"1\"/><path d=\"M12 7.5c-1.2-2.6-4.6-3-4.6-1 0 1.2 2.6 1 4.6 1Zm0 0c1.2-2.6 4.6-3 4.6-1 0 1.2-2.6 1-4.6 1Z\"/></g></svg>"}];
  window.VO_CATS = CATS;
  const hdr = document.getElementById("hdr");
  if (!hdr) return;
  const $ = s => hdr.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- плейсхолдер: при наведении «печатаются» примеры ---------- */
  const EXAMPLES = ["iPhone 15 Pro", "детский велосипед", "квартиру у метро", "угловой диван", "щенка корги", "зимние шины", "работу рядом с домом"];
  const search = $("#search"), input = $("#q"), word = $(".search__ph .word"), box = $(".search__box");
  let typeTimer = 0, wi = 0;
  function typeLoop() {
    const w = EXAMPLES[wi % EXAMPLES.length];
    let i = 0, dir = 1;
    const step = () => {
      word.textContent = w.slice(0, i);
      if (dir > 0 && i === w.length) { dir = -1; typeTimer = setTimeout(step, 1300); return; }
      if (dir < 0 && i === 0) { wi++; typeTimer = setTimeout(typeLoop, 350); return; }
      i += dir; typeTimer = setTimeout(step, dir > 0 ? 75 + Math.random() * 50 : 32);
    };
    step();
  }
  function startTyping() {
    if (reduce || input.value || search.classList.contains("is-focus") || search.classList.contains("is-city") || search.classList.contains("is-typing")) return;
    search.classList.add("is-typing"); word.textContent = ""; typeTimer = setTimeout(typeLoop, 380);
  }
  function stopTyping() { clearTimeout(typeTimer); search.classList.remove("is-typing"); }
  box.addEventListener("pointerenter", startTyping);
  box.addEventListener("pointerleave", stopTyping);

  /* ---------- поиск: фокус, подсказки ---------- */
  // обводка поиска: подгоняем прямоугольник под размер поля
  const ring = $(".search__ring rect");
  new ResizeObserver(() => { const r = box.getBoundingClientRect(); ring.setAttribute("width", r.width - 2); ring.setAttribute("height", r.height - 2); ring.setAttribute("rx", (r.height - 2) / 2); }).observe(box);
  const syncValue = () => search.classList.toggle("has-value", !!input.value);
  input.addEventListener("input", syncValue);
  input.addEventListener("focus", () => { stopTyping(); renderRecent(); search.classList.add("is-focus"); search.classList.remove("is-city"); closeMega(); });
  document.addEventListener("pointerdown", e => { if (!search.contains(e.target)) search.classList.remove("is-focus", "is-city"); });
  input.addEventListener("keydown", e => { if (e.key === "Escape") { input.blur(); search.classList.remove("is-focus"); } });
  const go = $("#go");
  search.addEventListener("submit", e => {
    e.preventDefault();
    go.classList.remove("is-sent"); void go.offsetWidth; go.classList.add("is-sent");
    const q = input.value.trim(); remember(q);
    search.classList.remove("is-focus"); input.blur();
    location.hash = q ? "#/s/" + encodeURIComponent(q) : "#/";
  });
  $(".suggest").addEventListener("click", e => { if (e.target.closest(".suggest__list a")) search.classList.remove("is-focus"); });

  // «Вы искали» — настоящая история этого браузера
  const HKEY = "vo_recent";
  const recent = () => { try { return JSON.parse(localStorage.getItem(HKEY)) || []; } catch (e) { return []; } };
  function remember(q) {
    q = q.trim(); if (!q) return;
    const list = [q, ...recent().filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    try { localStorage.setItem(HKEY, JSON.stringify(list)); } catch (e) {}
  }
  function renderRecent() {
    const list = recent(), wrap = $(".suggest__recent"), head = wrap.previousElementSibling;
    wrap.innerHTML = list.map(q => `<a class="chip-s" href="#">${q.replace(/[<>&"]/g, "")}</a>`).join("");
    wrap.hidden = head.hidden = !list.length;
  }
  $(".suggest__recent").addEventListener("click", e => { const a = e.target.closest("a"); if (a) { e.preventDefault(); input.value = a.textContent; syncValue(); search.requestSubmit(); } });

  /* ---------- выбор города ---------- */
  const CITIES = ["Вся Россия", "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону", "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград", "Краснодар", "Тюмень", "Саратов", "Ижевск"];
  const regionBtn = $("#regionBtn"), cityBox = $(".city"), cityInput = cityBox.querySelector("input"), cityList = cityBox.querySelector("ul");
  let city = (() => { try { return localStorage.getItem("vo_city"); } catch (e) { return null; } })() || "Москва";
  regionBtn.querySelector(".txt").textContent = city;
  // полный список городов подгружается позже (cities.js); пока его нет — короткий список выше
  const allCities = () => ["Вся Россия", ...(window.VO_CITIES_ALL || CITIES.slice(1))];
  const topCities = () => ["Вся Россия", ...(window.VO_CITIES_TOP || CITIES.slice(1, 13))];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function renderCities() {
    const raw = cityInput.value.trim(), q = raw.toLowerCase().replace(/ё/g, "е");
    const norm = c => c.toLowerCase().replace(/ё/g, "е");
    let list = q ? allCities().filter(c => norm(c).startsWith(q)).concat(allCities().filter(c => !norm(c).startsWith(q) && norm(c).includes(q))).slice(0, 40) : topCities();
    let html = list.map(c => `<li><button type="button" role="option" aria-selected="${c === city}">${esc(c)}</button></li>`).join("");
    if (raw.length > 1 && !allCities().some(c => norm(c) === q)) html += `<li><button type="button" role="option" class="city__own" data-own="${esc(raw)}">Другой населённый пункт: <b>${esc(raw)}</b></button></li>`;
    if (!q) html = `<li class="empty">Популярные города. Начните вводить название — найдём любой.</li>` + html;
    cityList.innerHTML = html;
  }
  regionBtn.addEventListener("click", () => {
    const on = !search.classList.contains("is-city");
    stopTyping(); search.classList.toggle("is-city", on); search.classList.remove("is-focus"); regionBtn.setAttribute("aria-expanded", on);
    if (on) { cityInput.value = ""; renderCities(); setTimeout(() => cityInput.focus(), 60); }
  });
  cityInput.addEventListener("input", renderCities);
  cityList.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    city = (b.dataset.own || b.textContent).trim().slice(0, 60); city = city[0].toUpperCase() + city.slice(1); regionBtn.querySelector(".txt").textContent = city;
    try { localStorage.setItem("vo_city", city); } catch (e) {}
    search.classList.remove("is-city"); regionBtn.setAttribute("aria-expanded", "false");
    window.dispatchEvent(new CustomEvent("city:change", { detail: city }));
  });
  window.VO_CITY = () => city;
  Object.defineProperty(window, "VO_CITIES", { get: allCities, configurable: true });
  cityInput.addEventListener("keydown", e => { if (e.key === "Escape") { search.classList.remove("is-city"); regionBtn.focus(); } if (e.key === "Enter") { e.preventDefault(); const b = cityList.querySelector("button"); if (b) b.click(); } });

  /* ---------- избранное ---------- */


  /* ---------- мега-меню ---------- */
  const catBtn = $("#catBtn"), nav = $(".mega__nav"), body = $(".mega__body"), scrim = document.getElementById("scrim");
  nav.innerHTML = CATS.map((c, i) => `<li style="--i:${i}"><button type="button" data-i="${i}">${c.icon}<span>${c.name}</span></button></li>`).join("");
  function show(i) {
    const c = CATS[i];
    nav.querySelectorAll("button").forEach(b => b.classList.toggle("is-on", +b.dataset.i === i));
    body.querySelector("h3").textContent = c.name;
    const per = Math.ceil(c.subs.length / 3), cols = [0, 1, 2].map(k => c.subs.slice(k * per, k * per + per));
    body.querySelector(".mega__cols").innerHTML = cols.map((list, k) => `<div class="mega__col" style="--i:${k + 1}">${list.map(s => `<a href="#/c/${c.id}">${s}</a>`).join("")}</div>`).join("");
    body.classList.remove("swap"); void body.offsetWidth; body.classList.add("swap");
  }
  show(0);
  nav.addEventListener("pointerover", e => { const b = e.target.closest("button"); if (b && !b.classList.contains("is-on")) show(+b.dataset.i); });
  nav.addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(+b.dataset.i); });
  function openMega() {
    hdr.style.setProperty("--hdr-h", hdr.getBoundingClientRect().bottom + "px");
    scrim.style.top = hdr.getBoundingClientRect().bottom + "px";
    hdr.classList.add("is-menu"); scrim.classList.add("on"); catBtn.setAttribute("aria-expanded", "true");
    search.classList.remove("is-focus");
  }
  function closeMega() { hdr.classList.remove("is-menu"); scrim.classList.remove("on"); catBtn.setAttribute("aria-expanded", "false"); }
  window.VO_closeMega = closeMega;
  const toggleMega = () => hdr.classList.contains("is-menu") ? closeMega() : openMega();
  catBtn.addEventListener("click", toggleMega);
  hdr.querySelectorAll("[data-open-mega]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); openMega(); }));
  scrim.addEventListener("click", closeMega);
  $(".mega").addEventListener("click", e => { if (e.target.closest("a")) closeMega(); });
  addEventListener("keydown", e => { if (e.key === "Escape") closeMega(); });

  /* ---------- поведение при прокрутке ---------- */
  // Шапка зафиксирована, а место под неё держит распорка постоянной высоты:
  // сжатие шапки при прокрутке не двигает страницу, поэтому ничего не «дрыгается».
  let space = document.querySelector(".hdr-space");
  if (!space) { space = document.createElement("div"); space.className = "hdr-space"; hdr.after(space); }
  const topIn = $(".hdr-top__in"), main = $(".hdr-main__in"), catsIn = $(".cats");
  function measure() {
    const wide = matchMedia("(min-width: 761px)").matches;
    const topH = wide ? topIn.offsetHeight : 0;
    const mainH = wide ? 76 : main.offsetHeight;
    space.style.height = topH + mainH + catsIn.offsetHeight + 1 + "px";
  }
  measure(); addEventListener("resize", measure);
  if (document.fonts) document.fonts.ready.then(measure);

  let peak = scrollY, ticking = false;
  function onScroll() {
    const y = scrollY, sc = hdr.classList.contains("is-scrolled");
    if (!sc && y > 24) hdr.classList.add("is-scrolled");
    else if (sc && y < 6) hdr.classList.remove("is-scrolled");
    if (y > peak) peak = y;
    if (y < 200 || y < peak - 60) { hdr.classList.remove("is-tucked"); peak = y; }
    else if (y >= peak) hdr.classList.add("is-tucked");
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();
