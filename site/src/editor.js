/* Визуальный редактор текстов прямо на сайте — как в конструкторах.
   Наводите на текст — он подсвечивается, нажимаете — правите, изменения видны сразу.
   Ctrl (⌘) или Alt + клик — обычное нажатие: открыть меню, перейти по ссылке. */
(() => {
  const { $, $$, esc, store } = VO;
  const A = VO.adm;
  const E = VO.editor = {};
  const PAGES = [["#/", "Главная"], ["#/c/tech", "Категория"], ["#/s/велосипед", "Поиск"], ["#/ad/a1", "Объявление"], ["#/post", "Разместить объявление"], ["#/me", "Личный кабинет"], ["login", "Вход"], ["#/how", "Как это работает"], ["#/safety", "Безопасность"], ["#/help", "Помощь"], ["#/contact", "Написать нам"], ["#/advertise", "Реклама на сайте"], ["#/doc/terms", "Соглашение"], ["#/doc/privacy", "Политика данных"], ["#/doc/consent", "Согласие на обработку"], ["#/doc/cookies", "Политика cookie"], ["#/doc/rules", "Правила размещения"], ["#/nope", "Страница 404"]];
  let on = false, dock = null, hl = null, pop = null, hover = null, undo = [];

  const textNodes = (el, deep) => {
    const out = [];
    if (!deep) el.childNodes.forEach(n => { if (n.nodeType === 3 && A.normText(n.nodeValue)) out.push(n); });
    if (out.length) return out;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => { const p = n.parentElement; return !A.normText(n.nodeValue) || !p || p.closest(A.DENY) || p.closest(".ed-ui") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    for (let n; (n = w.nextNode()) && out.length < 8;) out.push(n);
    return out;
  };
  const target = el => {
    if (!el || el.closest(".ed-ui")) return null;
    const own = el.closest(A.DENY); if (own) return { deny: own };
    // поднимаемся до элемента, у которого есть свой текст
    let x = el;
    for (let i = 0; x && i < 4; i++, x = x.parentElement) { if (x === document.body) break; if (textNodes(x).length) return { el: x }; }
    const d = textNodes(el, true); return d.length ? { el } : null;
  };
  const origOf = n => n.__o != null ? n.__o : n.nodeValue;
  const count = key => { let c = 0; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) if (A.normText(origOf(n)) === key && !n.parentElement.closest(".ed-ui")) c++; return c; };

  function place(box, r) {
    const b = box.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    let top = r.bottom + 10; if (top + b.height > vh - 90) top = Math.max(10, r.top - b.height - 10);
    box.style.top = top + "px"; box.style.left = Math.max(10, Math.min(vw - b.width - 10, r.left)) + "px";
  }
  function paintHl(t) {
    if (!t) { hl.hidden = true; return; }
    const el = t.el || t.deny, r = el.getBoundingClientRect();
    Object.assign(hl.style, { top: r.top - 4 + "px", left: r.left - 4 + "px", width: r.width + 8 + "px", height: r.height + 8 + "px" });
    hl.classList.toggle("deny", !!t.deny); hl.hidden = false;
    hl.querySelector("span").textContent = t.deny ? "Данные пользователей — правятся в разделе «Управление»" : "Нажмите, чтобы изменить";
  }
  function openPop(el) {
    closePop();
    const nodes = textNodes(el); if (!nodes.length) return;
    const items = nodes.map(n => { const o = origOf(n), key = A.normText(o); return { n, o, key, cur: A.normText(n.nodeValue), lead: o.match(/^\s*/)[0], trail: o.match(/\s*$/)[0] }; });
    pop = document.createElement("div"); pop.className = "ed-ui ed-pop";
    pop.innerHTML = `<div class="ed-pop__h"><b>Изменить текст</b><span>${items.length > 1 ? items.length + " фрагмента" : ""}</span></div>
      ${items.map((it, i) => `<label class="ed-f"><textarea data-i="${i}" rows="${Math.min(6, Math.ceil(it.cur.length / 42) || 1)}">${esc(it.cur)}</textarea>${it.cur !== it.key ? `<small>Было: «${esc(it.key.length > 80 ? it.key.slice(0, 80) + "…" : it.key)}» <button type="button" class="link" data-rev="${i}">Вернуть</button></small>` : ""}${count(it.key) > 1 ? `<small class="ed-many">Встречается на сайте ${count(it.key)} раз(а) — изменится везде</small>` : ""}</label>`).join("")}
      <div class="ed-pop__a"><button type="button" class="ed-btn ed-btn--ghost" data-x>Отмена</button><button type="button" class="ed-btn" data-save>Сохранить</button></div><small class="ed-pop__k">Ctrl + Enter — сохранить · Esc — отмена</small>`;
    document.body.appendChild(pop);
    place(pop, el.getBoundingClientRect());
    const tas = $$("textarea", pop); tas[0].focus(); tas[0].select();
    const preview = (it, v) => { const nv = it.lead + v + it.trail; if (it.n.__o == null) it.n.__o = it.o; it.n.nodeValue = nv; it.n.__v = nv; };
    pop.addEventListener("input", e => { const i = +e.target.dataset.i; if (!isNaN(i)) preview(items[i], e.target.value); });
    const cancel = () => { items.forEach(it => { const v = A.texts()[it.key]; const nv = v != null ? it.lead + v + it.trail : it.o; it.n.nodeValue = nv; it.n.__v = nv; if (v == null) it.n.__o = null; }); closePop(); };
    const save = () => {
      let n = 0;
      tas.forEach((ta, i) => { const it = items[i], v = ta.value.replace(/\s+/g, " ").trim(); if (v === it.cur) return; if (!v) { VO.toast("Текст не может быть пустым — его можно только заменить"); return; } undo.push({ key: it.key, prev: A.texts()[it.key] }); A.setText(it.key, v); A.log("Текст сайта изменён", it.key.slice(0, 60), v.slice(0, 80)); n++; });
      closePop(); if (n) { VO.toast("Сохранено. Изменение уже на сайте", 1800); paintDock(); }
    };
    pop.addEventListener("click", e => {
      if (e.target.closest("[data-x]")) return cancel();
      if (e.target.closest("[data-save]")) return save();
      const r = e.target.closest("[data-rev]"); if (r) { const it = items[+r.dataset.rev]; tas[+r.dataset.rev].value = it.key; preview(it, it.key); }
    });
    pop.addEventListener("keydown", e => { if (e.key === "Escape") cancel(); if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) save(); e.stopPropagation(); });
    pop._cancel = cancel;
  }
  function closePop() { if (pop) { pop.remove(); pop = null; } }

  function paintDock() {
    if (!dock) return;
    const n = Object.keys(A.texts()).length;
    $("#edCount", dock).textContent = n ? `Изменено текстов: ${n}` : "Пока без изменений";
    $("#edUndo", dock).disabled = !undo.length;
  }
  E.start = () => {
    if (on) return; if (!A.can("site")) return VO.toast("Нужны права на редактирование сайта");
    on = true; sessionStorage.setItem("vo_edit", "1"); document.documentElement.classList.add("ed-on");
    hl = document.createElement("div"); hl.className = "ed-ui ed-hl"; hl.hidden = true; hl.innerHTML = "<span></span>"; document.body.appendChild(hl);
    dock = document.createElement("div"); dock.className = "ed-ui ed-dock";
    dock.innerHTML = `<span class="ed-dock__dot"></span><b>Редактор сайта</b><span class="ed-dock__hint">Нажмите на любой текст. Ctrl + клик — обычный переход</span>
      <label class="ed-dock__sel"><span>Страница</span><select id="edPage">${PAGES.map(([h, n]) => `<option value="${h}">${n}</option>`).join("")}</select></label>
      <span class="ed-dock__n" id="edCount"></span><button type="button" class="ed-btn ed-btn--ghost" id="edUndo">Отменить</button><a class="ed-btn" href="#/admin/texts" id="edDone">Готово</a>`;
    document.body.appendChild(dock);
    $("#edPage", dock).addEventListener("change", e => { const v = e.target.value; if (v === "login") { VO.show("login", "Вход"); } else location.hash = v; });
    $("#edUndo", dock).addEventListener("click", () => { const u = undo.pop(); if (u) { A.setText(u.key, u.prev == null ? null : u.prev); VO.toast("Отменено", 1200); } paintDock(); });
    $("#edDone", dock).addEventListener("click", () => E.stop());
    paintDock();
  };
  E.stop = () => { if (!on) return; on = false; sessionStorage.removeItem("vo_edit"); document.documentElement.classList.remove("ed-on"); closePop(); [hl, dock].forEach(x => x && x.remove()); hl = dock = null; };
  E.isOn = () => on;

  document.addEventListener("pointermove", e => { if (!on || pop) return; const t = target(e.target); hover = t; paintHl(t); }, true);
  addEventListener("scroll", () => { if (on && hover && !pop) paintHl(hover); }, true);
  document.addEventListener("click", e => {
    if (!on || e.target.closest(".ed-ui") || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault(); e.stopPropagation();
    if (pop) { pop._cancel(); return; }
    const t = target(e.target); if (!t) return;
    if (t.deny) return VO.toast("Это данные пользователей. Их меняют в админке: «Объявления» или «Пользователи»", 3500);
    hl.hidden = true; openPop(t.el);
  }, true);
  // в режиме правки формы не отправляются и ссылки не открываются
  document.addEventListener("submit", e => { if (on) { e.preventDefault(); e.stopPropagation(); } }, true);
  VO.on("route", head => { if (head === "admin") E.stop(); else if (on) { closePop(); hl.hidden = true; } else if (sessionStorage.getItem("vo_edit") && A.can("site")) E.start(); });
})();
