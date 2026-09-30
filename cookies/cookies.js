/*
  Все объявления — согласие на cookie.
  Подключение: <link rel="stylesheet" href="cookies.css"> и <script src="cookies.js" defer></script>.
  Баннер показывается, только если выбора ещё не было.

  Выбор сохраняется в localStorage и в cookie "vo_consent" (на полгода), чтобы его видел и сервер.
  API: CookieConsent.get()   → { necessary, analytics, marketing, date } или null
       CookieConsent.open()  → показать баннер снова (например, из ссылки в подвале)
       CookieConsent.reset() → забыть выбор и показать баннер
  Событие: window "cookie:consent" с detail = выбор.
*/
(() => {
  const KEY = "vo_consent";
  const POLICY_URL = "/cookies";               // страница с правилами — поменяйте на свою
  const MAX_AGE = 60 * 60 * 24 * 182;

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  function save(choice) {
    const data = { necessary: true, analytics: !!choice.analytics, marketing: !!choice.marketing, date: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
    const short = `n1.a${+data.analytics}.m${+data.marketing}`;
    document.cookie = `${KEY}=${short}; max-age=${MAX_AGE}; path=/; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("cookie:consent", { detail: data }));
    return data;
  }

  const COOKIE_SVG = `
<svg viewBox="0 0 48 48" aria-hidden="true">
  <defs>
    <mask id="vo-cookie-mask" maskUnits="userSpaceOnUse" x="-10" y="-10" width="68" height="68">
      <rect x="-10" y="-10" width="68" height="68" fill="#fff"/>
      <g class="vo-bite vo-bite--1" fill="#000"><circle cx="39" cy="10" r="8.5"/><circle cx="31" cy="4" r="6"/><circle cx="45" cy="19" r="6"/></g>
      <g class="vo-bite vo-bite--2" fill="#000"><circle cx="10" cy="39" r="11"/><circle cx="3" cy="28" r="8"/><circle cx="20" cy="47" r="8"/></g>
    </mask>
  </defs>
  <g mask="url(#vo-cookie-mask)">
    <circle cx="24" cy="24" r="21" fill="#FF4F3A"/>
    <g fill="#16181D">
      <rect x="14" y="13" width="6" height="5" rx="2.2" transform="rotate(-18 17 15.5)"/>
      <rect x="27" y="22" width="6" height="5" rx="2.2" transform="rotate(24 30 24.5)"/>
      <rect x="16" y="29" width="5" height="4.5" rx="2" transform="rotate(12 18.5 31)"/>
      <rect x="31" y="33" width="4.5" height="4" rx="1.8"/>
      <circle cx="25" cy="13" r="1.6"/><circle cx="11" cy="23" r="1.4"/><circle cx="24" cy="37" r="1.4"/>
    </g>
  </g>
  <g class="vo-crumbs--1" fill="#FF4F3A">
    <circle class="vo-crumb" cx="38" cy="15" r="1.8" style="--dx:6px"/>
    <circle class="vo-crumb" cx="33" cy="9" r="1.3" style="--dx:-3px"/>
    <circle class="vo-crumb" cx="42" cy="20" r="1.1" style="--dx:10px"/>
  </g>
  <g class="vo-crumbs--2" fill="#FF4F3A">
    <circle class="vo-crumb" cx="12" cy="36" r="1.8" style="--dx:-7px"/>
    <circle class="vo-crumb" cx="7" cy="31" r="1.3" style="--dx:-10px"/>
    <circle class="vo-crumb" cx="17" cy="41" r="1.2" style="--dx:3px"/>
  </g>
</svg>`;
  const CHEVRON = `<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const OPTS = [
    ["necessary", "Необходимые", "Вход, избранное, безопасность. Без них сайт не работает.", true],
    ["analytics", "Аналитика", "Помогают понять, что удобно, а что нет. Всё обезличено.", false],
    ["marketing", "Реклама", "Чтобы объявления и предложения были ближе к вашим интересам.", false],
  ];

  let root = null, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function build(prev) {
    const el = document.createElement("section");
    el.className = "vo-cookie";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-labelledby", "vo-cookie-title");
    el.innerHTML = `
  <div class="vo-cookie__bubble">
    <div class="vo-cookie__head">
      <div class="vo-cookie__icon vo-in" style="animation-delay:.12s">${COOKIE_SVG}</div>
      <div>
        <h2 class="vo-cookie__title vo-in" id="vo-cookie-title" style="animation-delay:.2s">Кусочек cookie?</h2>
        <p class="vo-cookie__text vo-in" style="animation-delay:.27s">Мы используем cookie, чтобы сайт работал, а объявления подбирались под вас. <a href="${POLICY_URL}">Подробнее</a></p>
      </div>
    </div>
    <div class="vo-cookie__more"><div>
      <ul class="vo-opts">
        ${OPTS.map(([id, name, desc, locked]) => `
        <li class="vo-opt">
          <span class="vo-opt__txt"><span class="vo-opt__name">${name}</span><span class="vo-opt__desc">${desc}</span></span>
          <label class="vo-switch"><input type="checkbox" role="switch" data-opt="${id}" aria-label="${name}"
            ${locked || (prev && prev[id]) ? "checked" : ""} ${locked ? "disabled" : ""}><span></span></label>
        </li>`).join("")}
      </ul>
    </div></div>
    <div class="vo-cookie__actions vo-in" style="animation-delay:.34s">
      <button class="vo-btn vo-btn--primary" data-act="all">Принять все</button>
      <button class="vo-btn vo-btn--ghost" data-act="min">Только нужные</button>
      <button class="vo-link" data-act="toggle" aria-expanded="false">Настроить ${CHEVRON}</button>
    </div>
  </div>`;
    return el;
  }

  function close(kind) {
    const el = root; if (!el) return;
    el.style.pointerEvents = "none"; el.setAttribute("aria-hidden", "true");
    if (kind === "eat") {
      // съесть печеньку до конца, потом «отправить» облачко
      el.classList.add("bite-2");
      later(() => el.classList.add("is-leaving"), 380);
    } else el.classList.add("is-leaving-soft");
    el.addEventListener("animationend", e => { if (e.target === el && /leaving/.test(el.className)) { el.remove(); if (root === el) root = null; } });
  }

  function open() {
    if (root) return;
    timers.forEach(clearTimeout); timers = [];
    const prev = read();
    root = build(prev);
    document.body.appendChild(root);
    later(() => root && root.classList.add("bite-1"), 900);   // первый укус — когда всё появилось
    root.addEventListener("click", e => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      const act = b.dataset.act;
      if (act === "toggle") {
        if (root.classList.contains("is-open")) {          // «Сохранить» — берём состояние переключателей
          const pick = {}; root.querySelectorAll("[data-opt]").forEach(i => pick[i.dataset.opt] = i.checked);
          const data = save(pick); close(data.analytics || data.marketing ? "eat" : "soft");
          return;
        }
        root.classList.add("is-open");
        b.setAttribute("aria-expanded", "true");
        b.firstChild.textContent = "Сохранить ";
        return;
      }
      if (act === "all") { save({ analytics: true, marketing: true }); close("eat"); }
      if (act === "min") { save({ analytics: false, marketing: false }); close("soft"); }
    });
  }

  window.CookieConsent = {
    get: read,
    open,
    reset() { try { localStorage.removeItem(KEY); } catch (e) {} document.cookie = `${KEY}=; max-age=0; path=/`; if (root) { root.remove(); root = null; } open(); },
  };

  // если на странице идёт интро — ждём его окончания, чтобы не перебивать
  const start = () => {
    if (read()) return;
    if (document.getElementById("intro")) addEventListener("intro:done", () => setTimeout(open, 700), { once: true });
    else setTimeout(open, 600);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
