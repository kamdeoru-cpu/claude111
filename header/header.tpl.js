/* Все объявления — шапка: только переключение классов, всё движение — в CSS. */
(() => {
  const CATS = __CATS__;
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
