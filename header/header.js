/* Все объявления — шапка: только переключение классов, всё движение — в CSS. */
(() => {
  const CATS = [{"id": "auto", "name": "Авто", "count": "412 тыс.", "subs": ["Легковые", "Мотоциклы", "Грузовики", "Запчасти", "Шины и диски", "Аудио и видео", "Инструменты", "Спецтехника", "Водный транспорт"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><g class=\"car\"><path d=\"M3 15v-3.2l2-4.3a2 2 0 0 1 1.8-1.2h10.4a2 2 0 0 1 1.8 1.2l2 4.3V15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z\"/><path d=\"M3.5 11.5h17\"/></g><g class=\"wh\"><circle cx=\"7\" cy=\"16.5\" r=\"2.2\" fill=\"#fff\"/><path d=\"M7 14.3v4.4\"/></g><g class=\"wh\"><circle cx=\"17\" cy=\"16.5\" r=\"2.2\" fill=\"#fff\"/><path d=\"M17 14.3v4.4\"/></g></svg>"}, {"id": "realty", "name": "Недвижимость", "count": "288 тыс.", "subs": ["Квартиры", "Комнаты", "Дома и дачи", "Посуточно", "Новостройки", "Гаражи", "Коммерческая", "Участки", "За рубежом"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle class=\"smoke\" cx=\"17\" cy=\"2.6\" r=\"1.3\" fill=\"#C3C7CF\" stroke=\"none\"/><path d=\"M4 11 12 4l8 7\"/><path d=\"M6 9.5V20h12V9.5\"/><path d=\"M16 7.2V4.5h2v4.3\"/><rect class=\"win\" x=\"10\" y=\"12.5\" width=\"4\" height=\"4\" rx=\".8\" fill=\"transparent\"/></svg>"}, {"id": "job", "name": "Работа", "count": "96 тыс.", "subs": ["Вакансии", "Резюме", "Подработка", "Удалённо", "Стажировки", "Вахта"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path class=\"hdl\" d=\"M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8\"/><rect x=\"3.5\" y=\"8\" width=\"17\" height=\"11.5\" rx=\"2.5\"/><path d=\"M3.5 13h17\"/><rect class=\"lock\" x=\"10.5\" y=\"11.5\" width=\"3\" height=\"3\" rx=\".8\" fill=\"#fff\"/></svg>"}, {"id": "tech", "name": "Электроника", "count": "354 тыс.", "subs": ["Телефоны", "Ноутбуки", "Планшеты", "Фото и видео", "Аудио", "Игры и приставки", "ТВ", "Комплектующие", "Умный дом"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><g class=\"ph\"><rect x=\"7\" y=\"3\" width=\"10\" height=\"18\" rx=\"2.5\"/><rect class=\"scr\" x=\"9\" y=\"5.5\" width=\"6\" height=\"10\" rx=\"1\" fill=\"transparent\" stroke=\"none\"/><path d=\"M11 18.3h2\"/></g></svg>"}, {"id": "wear", "name": "Одежда и обувь", "count": "521 тыс.", "subs": ["Женская одежда", "Мужская одежда", "Обувь", "Сумки", "Часы", "Украшения", "Детская одежда"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path class=\"tee\" d=\"M9 4 4 6.5l1.8 4 2.2-1V20h8V9.5l2.2 1 1.8-4L15 4a3 3 0 0 1-6 0Z\"/></svg>"}, {"id": "home", "name": "Дом и сад", "count": "307 тыс.", "subs": ["Мебель", "Бытовая техника", "Ремонт", "Растения", "Посуда", "Текстиль", "Сад и огород", "Освещение"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path class=\"lf1\" d=\"M12 10.5c-3 0-5-1.5-5-4.5 3 0 5 1.5 5 4.5Z\"/><path class=\"lf2\" d=\"M12 9c0-3 2-4.5 5-4.5 0 3-2 4.5-5 4.5Z\"/><path d=\"M12 14V8.5\"/><path d=\"M6.5 14h11l-1.4 6.2H7.9Z\"/></svg>"}, {"id": "service", "name": "Услуги", "count": "143 тыс.", "subs": ["Ремонт и отделка", "Красота", "Обучение", "Перевозки", "Уборка", "IT", "Праздники", "Ремонт техники"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path class=\"wr\" d=\"M14.5 5.5a4 4 0 0 0-5.2 5.1l-4.8 4.8a1.9 1.9 0 0 0 2.7 2.7l4.8-4.8a4 4 0 0 0 5.1-5.2l-2.4 2.4-2.2-.6-.6-2.2Z\"/></svg>"}, {"id": "pets", "name": "Животные", "count": "58 тыс.", "subs": ["Собаки", "Кошки", "Птицы", "Аквариум", "Товары для животных", "Другие"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse class=\"toe\" cx=\"5.5\" cy=\"10.5\" rx=\"1.6\" ry=\"2\"/><ellipse class=\"toe\" cx=\"9.2\" cy=\"6.6\" rx=\"1.6\" ry=\"2.1\"/><ellipse class=\"toe\" cx=\"14.8\" cy=\"6.6\" rx=\"1.6\" ry=\"2.1\"/><ellipse class=\"toe\" cx=\"18.5\" cy=\"10.5\" rx=\"1.6\" ry=\"2\"/><path d=\"M12 12.5c-2.6 0-5 2.6-5 4.8 0 1.6 1.2 2.2 2.4 2.2 1 0 1.6-.6 2.6-.6s1.6.6 2.6.6c1.2 0 2.4-.6 2.4-2.2 0-2.2-2.4-4.8-5-4.8Z\"/></svg>"}, {"id": "hobby", "name": "Хобби и спорт", "count": "176 тыс.", "subs": ["Велосипеды", "Спорт и отдых", "Туризм", "Музыка", "Книги", "Коллекции", "Билеты"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse class=\"bsh\" cx=\"12\" cy=\"21\" rx=\"4\" ry=\"1\" fill=\"#C3C7CF\" stroke=\"none\"/><g class=\"ball\"><circle cx=\"12\" cy=\"11\" r=\"6.5\"/><path d=\"M6.2 9c3.8 1.6 7.8 1.6 11.6 0M12 4.5c-2 3.6-2 9.4 0 13\"/></g></svg>"}, {"id": "kids", "name": "Детям", "count": "199 тыс.", "subs": ["Коляски", "Автокресла", "Игрушки", "Одежда", "Детская мебель", "Товары для мам"], "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><g class=\"bln\"><path d=\"M12 3c3 0 5 2.4 5 5.3 0 3.4-2.8 6.2-5 6.2s-5-2.8-5-6.2C7 5.4 9 3 12 3Z\"/><path d=\"m11.1 14.5.9 1.2.9-1.2\"/></g><path d=\"M12 15.8c-1.2 1.5 1.2 2.6 0 4.6\"/></svg>"}];
  const hdr = document.getElementById("hdr");
  if (!hdr) return;
  const $ = s => hdr.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- счётчик объявлений: барабаны цифр ---------- */
  const odo = $(".odo");
  if (odo) {
    const digits = Number(odo.dataset.value).toLocaleString("ru-RU").replace(/\s/g, " ");
    odo.innerHTML = [...digits].map(ch => ch === " " ? '<span class="odo__sep"></span>'
      : `<span class="odo__d" data-n="${ch}">${"0123456789".split("").map(n => `<span>${n}</span>`).join("")}</span>`).join("");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      odo.querySelectorAll(".odo__d").forEach((d, i) => {
        d.style.transitionDelay = i * 60 + "ms";
        d.style.transform = `translateY(-${d.dataset.n * 10}%)`;
      });
    }));
  }

  /* ---------- живой плейсхолдер ---------- */
  const EXAMPLES = ["iPhone 15 Pro", "детский велосипед", "квартиру у метро", "угловой диван", "щенка корги", "зимние шины", "PlayStation 5", "работу рядом"];
  const word = $(".search__ph .word"), search = $("#search"), input = $("#q");
  let wi = 0, timer = 0;
  const paint = w => { word.className = "word"; word.innerHTML = [...w].map((c, i) => `<i style="animation-delay:${i * 22}ms">${c}</i>`).join(""); };
  function nextWord() {
    if (document.hidden || search.classList.contains("is-focus") || input.value) return;
    word.classList.add("out");
    setTimeout(() => paint(EXAMPLES[wi = (wi + 1) % EXAMPLES.length]), 300);
  }
  paint(EXAMPLES[0]);
  if (!reduce) timer = setInterval(nextWord, 2800);

  /* ---------- поиск: фокус, подсказки ---------- */
  // обводка поиска: подгоняем прямоугольник под размер поля
  const ring = $(".search__ring rect"), box = $(".search__box");
  new ResizeObserver(() => { const r = box.getBoundingClientRect(); ring.setAttribute("width", r.width - 2); ring.setAttribute("height", r.height - 2); ring.setAttribute("rx", (r.height - 2) / 2); }).observe(box);
  const syncValue = () => search.classList.toggle("has-value", !!input.value);
  input.addEventListener("input", syncValue);
  input.addEventListener("focus", () => { search.classList.add("is-focus"); closeMega(); });
  document.addEventListener("pointerdown", e => { if (!search.contains(e.target)) search.classList.remove("is-focus"); });
  input.addEventListener("keydown", e => { if (e.key === "Escape") { input.blur(); search.classList.remove("is-focus"); } });
  const go = $("#go");
  go.addEventListener("click", () => { go.classList.remove("is-sent"); void go.offsetWidth; go.classList.add("is-sent"); });

  /* ---------- избранное ---------- */
  const fav = $(".fav");
  fav.addEventListener("click", () => { const on = fav.classList.toggle("is-on"); fav.setAttribute("aria-pressed", on); });

  /* ---------- мега-меню ---------- */
  const catBtn = $("#catBtn"), nav = $(".mega__nav"), body = $(".mega__body"), scrim = document.getElementById("scrim");
  nav.innerHTML = CATS.map((c, i) => `<li style="--i:${i}"><button type="button" data-i="${i}">${c.icon}<span>${c.name}</span><span class="n">${c.count}</span></button></li>`).join("");
  function show(i) {
    const c = CATS[i];
    nav.querySelectorAll("button").forEach(b => b.classList.toggle("is-on", +b.dataset.i === i));
    body.querySelector("h3").textContent = c.name;
    const per = Math.ceil(c.subs.length / 3), cols = [0, 1, 2].map(k => c.subs.slice(k * per, k * per + per));
    body.querySelector(".mega__cols").innerHTML = cols.map((list, k) => `<div class="mega__col" style="--i:${k + 1}">${list.map(s => `<a href="#">${s}</a>`).join("")}</div>`).join("");
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
  const toggleMega = () => hdr.classList.contains("is-menu") ? closeMega() : openMega();
  catBtn.addEventListener("click", toggleMega);
  hdr.querySelectorAll("[data-open-mega]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); openMega(); }));
  scrim.addEventListener("click", closeMega);
  addEventListener("keydown", e => { if (e.key === "Escape") closeMega(); });

  /* ---------- поведение при прокрутке ---------- */
  // строка категорий прячется при прокрутке вниз и возвращается, если заметно прокрутить вверх
  // (порог в 60px гасит скачки от схлопывания верхней строки)
  let peak = scrollY, ticking = false;
  function onScroll() {
    const y = scrollY;
    hdr.classList.toggle("is-scrolled", y > 8);
    if (y > peak) peak = y;
    if (y < 160 || y < peak - 60) { hdr.classList.remove("is-tucked"); peak = y; }
    else if (y > 160 && y >= peak) hdr.classList.add("is-tucked");
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();
