/* Все объявления — шапка: только переключение классов, всё движение — в CSS. */
(() => {
  const CATS = __CATS__;
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
  go.addEventListener("click", () => { go.classList.remove("is-sent"); void go.offsetWidth; go.classList.add("is-sent"); remember(input.value); });

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
  $(".suggest__recent").addEventListener("click", e => { const a = e.target.closest("a"); if (a) { e.preventDefault(); input.value = a.textContent; syncValue(); input.focus(); } });

  /* ---------- выбор города ---------- */
  const CITIES = ["Вся Россия", "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону", "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград", "Краснодар", "Тюмень", "Саратов", "Ижевск"];
  const regionBtn = $("#regionBtn"), cityBox = $(".city"), cityInput = cityBox.querySelector("input"), cityList = cityBox.querySelector("ul");
  let city = (() => { try { return localStorage.getItem("vo_city"); } catch (e) { return null; } })() || "Москва";
  regionBtn.querySelector(".txt").textContent = city;
  function renderCities() {
    const q = cityInput.value.trim().toLowerCase(), list = CITIES.filter(c => c.toLowerCase().includes(q));
    cityList.innerHTML = list.length ? list.map(c => `<li><button type="button" role="option" aria-selected="${c === city}">${c}</button></li>`).join("") : '<li class="empty">Такого города пока нет в списке</li>';
  }
  regionBtn.addEventListener("click", () => {
    const on = !search.classList.contains("is-city");
    stopTyping(); search.classList.toggle("is-city", on); search.classList.remove("is-focus"); regionBtn.setAttribute("aria-expanded", on);
    if (on) { cityInput.value = ""; renderCities(); setTimeout(() => cityInput.focus(), 60); }
  });
  cityInput.addEventListener("input", renderCities);
  cityList.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    city = b.textContent; regionBtn.querySelector(".txt").textContent = city;
    try { localStorage.setItem("vo_city", city); } catch (e) {}
    search.classList.remove("is-city"); regionBtn.setAttribute("aria-expanded", "false");
  });
  cityInput.addEventListener("keydown", e => { if (e.key === "Escape") { search.classList.remove("is-city"); regionBtn.focus(); } });

  /* ---------- избранное ---------- */
  const fav = $(".fav");
  fav.addEventListener("click", () => { const on = fav.classList.toggle("is-on"); fav.setAttribute("aria-pressed", on); });

  /* ---------- мега-меню ---------- */
  const catBtn = $("#catBtn"), nav = $(".mega__nav"), body = $(".mega__body"), scrim = document.getElementById("scrim");
  nav.innerHTML = CATS.map((c, i) => `<li style="--i:${i}"><button type="button" data-i="${i}">${c.icon}<span>${c.name}</span></button></li>`).join("");
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
