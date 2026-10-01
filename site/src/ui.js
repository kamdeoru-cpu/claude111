/* Подвал, кнопка связи, запуск */
(() => {
  const { $, esc } = VO;
  const C = window.VO_CONTACTS, BI = window.VO_BRAND_ICONS;
  const WAYS = [["tg", "Telegram", C.tg], ["wa", "WhatsApp", C.wa], ["max", "MAX", C.max], ["mail", C.email, "mailto:" + C.email], ["phone", C.phone, "tel:" + C.tel]];
  const ext = h => /^https/.test(h) ? ' target="_blank" rel="noopener"' : "";
  $("#fabList").innerHTML = WAYS.map(([k, n, h], i) => `<a href="${h}"${ext(h)} style="--i:${i}"><span class="fab__i">${BI[k]}</span>${esc(n)}</a>`).join("");
  $("#footSoc").innerHTML = WAYS.slice(0, 3).map(([k, n, h]) => `<a href="${h}"${ext(h)} aria-label="${n}">${BI[k]}</a>`).join("") + `<a href="mailto:${C.email}" class="foot__mail">${esc(C.email)}</a><a href="tel:${C.tel}" class="foot__mail">${esc(C.phone)}</a>`;
  $("#year").textContent = new Date().getFullYear();
  $("#footOwner").textContent = `Владелец сайта: ${C.owner}`;
  // слова логотипа в подвале — те же контуры, что в шапке
  const hp = document.querySelectorAll("#hdr .logo svg > path"); if (hp.length >= 2) { $("#footW1").setAttribute("d", hp[0].getAttribute("d")); $("#footW2").setAttribute("d", hp[1].getAttribute("d")); }

  const fab = $("#fab"), btn = $("#fabBtn");
  const set = on => { fab.classList.toggle("open", on); btn.setAttribute("aria-expanded", on); };
  btn.addEventListener("click", e => { e.stopPropagation(); set(!fab.classList.contains("open")); });
  document.addEventListener("click", e => { if (!e.target.closest("#fab")) set(false); });
  addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
  // когда виден баннер cookie — кнопка приподнимается, чтобы не перекрывать его
  new MutationObserver(() => fab.classList.toggle("lift", !!document.querySelector(".vo-cookie:not(.is-leaving):not(.is-leaving-soft)"))).observe(document.body, { childList: true });
  document.addEventListener("click", e => { if (e.target.closest("[data-cookie-settings]") && window.CookieConsent) window.CookieConsent.open(); });

  if (window.VO_closeMega) VO.closeMega = window.VO_closeMega;
  VO.on("route", h => { if (h !== "me") document.documentElement.classList.remove("in-chat"); });
  VO.routes["*"] = () => { VO.page("404", `<div class="wrap"><div class="empty empty--404"><b>404</b><span>Такой страницы нет — возможно, ссылка устарела.</span><div class="empty__acts"><a class="btn btn--ink" href="#/">На главную</a><a class="btn btn--ghost" href="#/help">Помощь</a></div></div></div>`); VO.show("404", "Страница не найдена"); };
  VO.start();
})();
