/* Все объявления — шапка: только переключение классов, всё движение — в CSS. */
(() => {
  const CATS = __CATS__;
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
    const q = input.value.replace(/[\u0000-\u001F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, "").replace(/\s+/g, " ").trim().slice(0, 80); remember(q);
    search.classList.remove("is-focus"); input.blur();
    location.hash = q ? "#/s/" + encodeURIComponent(q) : "#/";
  });
  $(".suggest").addEventListener("click", e => { if (e.target.closest(".suggest__list a")) search.classList.remove("is-focus"); });

  // «Вы искали» — настоящая история этого браузера
  const HKEY = "vo_recent";
  const recent = () => { try { return JSON.parse(localStorage.getItem(HKEY)) || []; } catch (e) { return []; } };
  function remember(q) {
    q = q.trim().slice(0, 80); if (!q) return;
    const list = [q, ...recent().filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    try { localStorage.setItem(HKEY, JSON.stringify(list)); } catch (e) {}
  }
  function renderRecent() {
    const list = recent(), wrap = $(".suggest__recent"), head = wrap.previousElementSibling;
    const e = s => String(s).slice(0, 80).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    wrap.innerHTML = list.map((q, i) => `<span class="chip-s chip-s--x"><a href="#" data-q="${e(q)}" title="${e(q)}">${e(q)}</a><button type="button" data-rm="${i}" aria-label="Удалить из истории">×</button></span>`).join("")
      + (list.length > 1 ? `<button type="button" class="recent-clear" data-clear>Очистить</button>` : "");
    wrap.hidden = head.hidden = !list.length;
  }
  $(".suggest__recent").addEventListener("pointerdown", e => { if (e.target.closest("button")) e.preventDefault(); });   // поле поиска не теряет фокус
  $(".suggest__recent").addEventListener("click", e => {
    const rm = e.target.closest("[data-rm]"), cl = e.target.closest("[data-clear]");
    if (rm || cl) { e.preventDefault(); e.stopPropagation(); const list = cl ? [] : recent().filter((_, i) => i !== +rm.dataset.rm); try { localStorage.setItem(HKEY, JSON.stringify(list)); } catch (er) {} renderRecent(); input.focus(); return; }
    const a = e.target.closest("a[data-q]"); if (a) { e.preventDefault(); input.value = a.dataset.q; syncValue(); search.requestSubmit(); }
  });

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
    const raw = cityInput.value.replace(/[^\p{L}\p{N}\s.,'’\-()№]/gu, "").replace(/\s+/g, " ").trim().slice(0, 40), q = raw.toLowerCase().replace(/ё/g, "е");
    const norm = c => c.toLowerCase().replace(/ё/g, "е");
    let list = q ? allCities().filter(c => norm(c).startsWith(q)).concat(allCities().filter(c => !norm(c).startsWith(q) && norm(c).includes(q))).slice(0, 40) : topCities();
    let html = list.map(c => `<li><button type="button" role="option" aria-selected="${c === city}">${esc(c)}</button></li>`).join("");
    const bad = raw.length > 1 && window.VO && VO.guard ? VO.guard.text(raw, "place") : null;
    if (raw.length > 1 && !allCities().some(c => norm(c) === q)) html += bad ? `<li class="city__bad">${esc(bad)}</li>` : `<li><button type="button" role="option" class="city__own" data-own="${esc(raw)}">Другой населённый пункт: <b>${esc(raw)}</b></button></li>`;
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
    city = (b.dataset.own || b.textContent).trim().slice(0, 40); city = city[0].toUpperCase() + city.slice(1); regionBtn.querySelector(".txt").textContent = city;
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
