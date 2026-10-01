/* Админ-панель, раздел «Сайт»: тексты, визуальный редактор, категории, логотип и цвет, контакты, баннер и техработы. */
(() => {
  const { $, $$, esc, store } = VO;
  const A = VO.adm, UI = VO.admUI, SEC = UI.SEC, ACT = UI.ACT, I = UI.I, IC = UI.IC;
  const q = UI.q;

  /* ---------- Тексты ---------- */
  const AREAS = () => {
    const names = { home: ["Главная и лента", "#/"], how: ["Как это работает", "#/how"], safety: ["Безопасность", "#/safety"], help: ["Помощь", "#/help"], contact: ["Написать нам", "#/contact"], login: ["Вход и регистрация", "#/login"], advertise: ["Реклама на сайте", "#/advertise"], ad: ["Страница объявления", "#/ad/a1"], post: ["Разместить объявление", "#/post"], me: ["Личный кабинет", "#/me"], doc: ["Документы", "#/doc/terms"], user: ["Профиль продавца", "#/u/s1"], "404": ["Страница 404", "#/nope"] };
    const list = [["hdr", "Шапка и меню", "#/", "#hdr"], ["foot", "Подвал", "#/", ".foot"], ["fab", "Кнопка связи", "#/", "#fab"]];
    $$(".page[data-page]").forEach(p => { const k = p.dataset.page; if (["admin", "maint"].includes(k)) return; const n = names[k] || [k, "#/" + k]; list.push([k, n[0], n[1], `.page[data-page="${k}"]`]); });
    return list;
  };
  const scan = sel => {
    const root = $(sel); if (!root) return [];
    const seen = new Map(), w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => { const p = n.parentElement; return !p || p.closest(A.DENY) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    for (let n; (n = w.nextNode());) { const k = A.normText(n.__o != null ? n.__o : n.nodeValue); if (k && !A.dynamic(k) && !seen.has(k)) seen.set(k, 1); }
    return [...seen.keys()];
  };
  SEC.texts = { group: "site", name: "Тексты", perm: "site", render() {
    const areas = AREAS(), area = q["texts:area"] || "hdr", only = q["texts:only"], s = (q.texts || "").toLowerCase().trim(), T = A.texts();
    let keys;
    if (only) keys = Object.keys(T);
    else if (s) { const all = new Set(); areas.forEach(x => scan(x[3]).forEach(k => all.add(k))); Object.keys(T).forEach(k => all.add(k)); keys = [...all]; }
    else keys = scan((areas.find(x => x[0] === area) || areas[0])[3]);
    if (s) keys = keys.filter(k => (k + " " + (T[k] || "")).toLowerCase().includes(s));
    const cur = areas.find(x => x[0] === area) || areas[0];
    return `<div class="atx-hero"><div><b>Два способа менять тексты</b><span>Прямо на сайте — наведите и нажмите на нужный текст. Или здесь, списком по страницам: справа сразу видно, как получится.</span></div><button class="adm-btn" type="button" data-a="vedit" data-h="${esc(cur[2])}">${I(IC.visual, 16)} Править на сайте</button></div>
      <div class="atx">
        <aside class="atx__areas">${areas.map(([k, n]) => `<button type="button" data-a="txarea" data-k="${k}" class="${!s && !only && k === area ? "on" : ""}">${esc(n)}</button>`).join("")}<button type="button" data-a="txonly" class="atx__only${only ? " on" : ""}">Изменённые · ${Object.keys(T).length}</button></aside>
        <section class="atx__list">${UI.tools("texts", "Найти текст на всём сайте")}
          ${keys.length ? keys.slice(0, 400).map(k => { const v = T[k], long = k.length > 70; return `<div class="atx__i${v != null ? " is-ch" : ""}"><small>${v != null ? "Было: " : ""}${esc(k.length > 140 ? k.slice(0, 140) + "…" : k)}</small>${long ? `<textarea data-tx="${esc(k)}" rows="${Math.min(6, Math.ceil(k.length / 60))}" maxlength="3000">${esc(v != null ? v : k)}</textarea>` : `<input data-tx="${esc(k)}" maxlength="400" value="${esc(v != null ? v : k)}">`}${v != null ? `<button type="button" class="link" data-a="txrev" data-k="${esc(k)}">Вернуть</button>` : ""}</div>`; }).join("") + (keys.length > 400 ? `<p class="muted">Показаны первые 400 — уточните поиск.</p>` : "")
            : `<div class="aempty"><b>${only ? "Пока ничего не меняли" : "Текстов не найдено"}</b><span>${only ? "Изменённые тексты появятся здесь — их можно вернуть по одному." : "Эта страница ещё не открывалась. Откройте её на сайте или используйте «Править на сайте»."}</span></div>`}
          ${only && keys.length ? `<button class="adm-btn adm-btn--ghost" type="button" data-a="txrevall">Вернуть все тексты</button>` : ""}</section>
        <aside class="atx__prev"><div class="atx__bar"><span>Предпросмотр</span><select data-a="txprev">${areas.map(([k, n, h]) => `<option value="${esc(h)}"${k === area ? " selected" : ""}>${esc(n)}</option>`).join("")}</select></div><iframe id="txFrame" title="Предпросмотр сайта" src="${location.pathname}?preview${esc(cur[2])}" loading="lazy"></iframe></aside>
      </div>`;
  }, input(t) {
    if (!t.dataset.tx) return;
    clearTimeout(t._t); t._t = setTimeout(() => { const v = t.value.replace(/\s+/g, " ").trim(); if (!v) return; const k = t.dataset.tx; A.setText(k, v); t.closest(".atx__i").classList.toggle("is-ch", v !== k); }, 350);
  }, change(t) { if (t.dataset.tx) { const k = t.dataset.tx, v = t.value.replace(/\s+/g, " ").trim(); if (v && v !== k) A.log("Текст сайта изменён", k.slice(0, 60), v.slice(0, 80)); } if (t.dataset.a === "txprev") { const f = $("#txFrame"); if (f) f.src = `${location.pathname}?preview${t.value}`; } } };
  ACT.txarea = el => { q["texts:area"] = el.dataset.k; q["texts:only"] = false; q.texts = ""; UI.render(); };
  ACT.txonly = () => { q["texts:only"] = !q["texts:only"]; q.texts = ""; UI.render(); };
  ACT.txrev = el => { A.setText(el.dataset.k, null); A.log("Текст возвращён", el.dataset.k.slice(0, 60)); UI.render(); };
  ACT.txrevall = async () => { if (!await UI.ask("Вернуть все тексты?", "Все изменённые тексты сайта станут исходными.", "Вернуть", true)) return; A.setTexts({}); A.log("Все тексты возвращены"); UI.render(); };
  ACT.vedit = el => { VO.editor.start(); location.hash = el.dataset.h || "#/"; };

  /* ---------- Визуальный редактор ---------- */
  SEC.visual = { group: "site", name: "Визуальный редактор", perm: "site", render() {
    const P = [["#/", "Главная"], ["#/ad/a1", "Объявление"], ["#/post", "Разместить"], ["#/me", "Кабинет"], ["#/how", "Как это работает"], ["#/safety", "Безопасность"], ["#/help", "Помощь"], ["#/contact", "Написать нам"], ["#/advertise", "Реклама"], ["#/doc/terms", "Соглашение"], ["#/doc/rules", "Правила"], ["#/doc/privacy", "Политика данных"]];
    return `<section class="avis-hero"><div><h2>Меняйте сайт, глядя на него</h2><p>Откройте нужную страницу, наведите на любой заголовок, кнопку или подпись — он подсветится. Нажмите, исправьте текст — изменение видно сразу всем посетителям.</p>
        <ol><li>Выберите страницу ниже</li><li>Нажмите на текст и исправьте</li><li>«Сохранить» — и готово. Ошиблись — «Отменить» внизу экрана</li></ol>
        <button class="adm-btn adm-btn--lg" type="button" data-a="vedit" data-h="#/">${I(IC.visual, 18)} Открыть редактор на главной</button></div>
        <div class="avis-hero__art" aria-hidden="true"><div class="avis-mock"><i></i><i></i><i></i><b>Свежие объявления</b><span class="avis-mock__cur">|</span><div class="avis-mock__pop"><small>Изменить текст</small><em>Новое за сегодня</em><u>Сохранить</u></div></div></div></section>
      <section class="acard"><h3>Страницы</h3><div class="avis-pages">${P.map(([h, n]) => `<button type="button" data-a="vedit" data-h="${h}"><b>${n}</b><span>${h.replace("#", "")}</span></button>`).join("")}</div>
      <p class="muted">Ctrl (⌘) + клик в режиме редактора работает как обычный клик: открывает меню и ссылки. Объявления, имена и отзывы пользователей так не меняются — для них разделы «Объявления» и «Пользователи».</p></section>`;
  } };

  /* ---------- Категории ---------- */
  let draft = null, dirty = false;
  const clone = x => JSON.parse(JSON.stringify(x));
  const EXTRA = {
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5Z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>',
    tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5.5a4 4 0 0 0-5.2 5.1l-4.8 4.8a1.9 1.9 0 0 0 2.7 2.7l4.8-4.8a4 4 0 0 0 5.1-5.2l-2.4 2.4-2.2-.6-.6-2.2Z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.7 12 20 12 20Z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15Z"/><path d="M5 19 13 11"/></svg>',
    office: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 7.5h2M14 7.5h2M8 11.5h2M14 11.5h2M10 20.5v-4h4v4"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8a2 2 0 0 0 0 4v4h17v-4a2 2 0 0 1 0-4V4h-17Z" transform="translate(0 2)"/><path d="M14 6v12" stroke-dasharray="2 2"/></svg>',
    sport: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 12h3M18 12h3M6 8v8M18 8v8M8.5 10v4M15.5 10v4M8.5 12h7"/></svg>',
    baby: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="11" r="7"/><path d="M9.5 10h.01M14.5 10h.01M10 14a3 3 0 0 0 4 0M12 4c0-1 1-1.5 2-1"/></svg>',
  };
  const catCount = id => UI.D.ads().filter(a => a.cat === id && !(a.adm && a.adm.deleted)).length;
  SEC.cats = { group: "site", name: "Категории", perm: "site", render() {
    if (!draft) { draft = clone(VO.CATS); dirty = false; }
    return `<div class="ahead"><p class="muted">Названия, значки, подкатегории и порядок. Всё меняется в шапке, меню «Категории», ленте и форме подачи объявления.</p><div class="abtns"><button class="adm-btn adm-btn--ghost" type="button" data-a="catreset">Вернуть исходные</button><button class="adm-btn" type="button" data-a="catadd">+ Категория</button></div></div>
      <section class="acat-prev"><small>Так будет в шапке</small><div class="acat-prev__row">${draft.filter(c => !c.hidden).map(c => `<span class="acat-chip${c.id === "free" ? " is-free" : ""}"><i>${c.icon}</i>${esc(c.name || "Без названия")}</span>`).join("")}</div></section>
      <div class="acats">${draft.map((c, i) => `<article class="acat${c.hidden ? " is-off" : ""}" data-ci="${i}">
        <div class="acat__ord"><button type="button" data-a="catmv" data-i="${i}" data-d="-1" ${i ? "" : "disabled"} aria-label="Выше">↑</button><button type="button" data-a="catmv" data-i="${i}" data-d="1" ${i < draft.length - 1 ? "" : "disabled"} aria-label="Ниже">↓</button></div>
        <button type="button" class="acat__ic" data-a="caticon" data-i="${i}" title="Сменить значок">${c.icon}<em>Сменить</em></button>
        <div class="acat__m"><div class="acat__top"><input class="acat__name" data-cn="${i}" maxlength="40" value="${esc(c.name)}" placeholder="Название категории"><small>${catCount(c.id)} объявл.</small><label class="atog atog--sm"><input type="checkbox" data-cv="${i}"${c.hidden ? "" : " checked"}><i></i>${c.hidden ? "Скрыта" : "Показана"}</label><button type="button" class="adm-btn adm-btn--text adm-btn--sm" data-a="catdel" data-i="${i}">Удалить</button></div>
          <div class="acat__subs">${c.subs.map((s, j) => `<span class="asub"><input data-cs="${i}:${j}" maxlength="40" value="${esc(s)}" size="${Math.max(4, s.length + 1)}"><button type="button" data-a="subrm" data-i="${i}" data-j="${j}" aria-label="Удалить подкатегорию">×</button></span>`).join("")}<button type="button" class="asub asub--add" data-a="subadd" data-i="${i}">+ Подкатегория</button></div></div></article>`).join("")}</div>
      <div class="asave${dirty ? " is-on" : ""}"><span>Есть несохранённые изменения</span><button type="button" class="adm-btn adm-btn--ghost" data-a="catundo">Отменить</button><button type="button" class="adm-btn" data-a="catsave">Сохранить и применить</button></div>`;
  }, input(t) {
    if (t.dataset.cn != null) { draft[+t.dataset.cn].name = t.value; mark(); }
    if (t.dataset.cs) { const [i, j] = t.dataset.cs.split(":").map(Number); draft[i].subs[j] = t.value; t.size = Math.max(4, t.value.length + 1); mark(); }
  }, change(t) { if (t.dataset.cv != null) { draft[+t.dataset.cv].hidden = !t.checked; dirty = true; UI.render(); } } };
  const mark = () => { if (!dirty) { dirty = true; const s = $(".asave"); if (s) s.classList.add("is-on"); } const p = $(".acat-prev__row"); if (p) p.innerHTML = draft.filter(c => !c.hidden).map(c => `<span class="acat-chip${c.id === "free" ? " is-free" : ""}"><i>${c.icon}</i>${esc(c.name || "Без названия")}</span>`).join(""); };
  const re = () => { dirty = true; UI.render(); };
  ACT.catmv = el => { const i = +el.dataset.i, j = i + +el.dataset.d; [draft[i], draft[j]] = [draft[j], draft[i]]; re(); };
  ACT.subadd = el => { const i = +el.dataset.i; draft[i].subs.push(""); re(); const inp = $$(`[data-cs^="${i}:"]`).pop(); if (inp) inp.focus(); };
  ACT.subrm = el => { draft[+el.dataset.i].subs.splice(+el.dataset.j, 1); re(); };
  ACT.catadd = () => { draft.push({ id: "c" + Date.now().toString(36), name: "Новая категория", subs: ["Разное"], icon: EXTRA.box }); re(); setTimeout(() => { const n = $$(".acat__name").pop(); if (n) { n.focus(); n.select(); n.scrollIntoView({ block: "center", behavior: "smooth" }); } }, 30); };
  ACT.catundo = () => { draft = null; UI.render(); };
  ACT.catreset = async () => { if (!await UI.ask("Вернуть исходные категории?", "Названия, значки, порядок и подкатегории станут как при запуске сайта.", "Вернуть", true)) return; A.resetCats(); draft = null; A.log("Категории возвращены к исходным"); UI.render(); };
  ACT.catsave = () => {
    const bad = draft.find(c => !c.name.trim()); if (bad) return VO.toast("У каждой категории должно быть название");
    const out = draft.map(c => ({ ...c, name: c.name.trim().slice(0, 40), subs: [...new Set(c.subs.map(s => s.trim()).filter(Boolean))].slice(0, 40) }));
    if (!out.some(c => !c.hidden)) return VO.toast("Хотя бы одна категория должна быть видна");
    A.saveCats(out); draft = null; A.log("Категории сохранены", "", out.map(c => c.name).join(", ").slice(0, 120)); VO.toast("Категории обновлены на всём сайте"); UI.render();
  };
  ACT.catdel = async el => {
    const i = +el.dataset.i, c = draft[i], n = catCount(c.id); if (draft.length < 2) return VO.toast("Нельзя удалить последнюю категорию");
    if (!n) { if (!await UI.ask(`Удалить «${esc(c.name)}»?`, "Объявлений в ней нет.", "Удалить", true)) return; draft.splice(i, 1); return re(); }
    const el2 = VO.sheet(`<form class="aform" id="cdF"><h3>Удалить «${esc(c.name)}»</h3><p class="muted">В категории ${n} объявл. Куда их перенести?</p><div class="achips achips--col">${draft.filter(x => x.id !== c.id).map((x, k) => `<label><input type="radio" name="t" value="${x.id}"${k ? "" : " checked"}><span>${esc(x.name)}</span></label>`).join("")}</div><div class="aform__a"><button type="button" class="adm-btn adm-btn--ghost" data-sheet-close>Отмена</button><button class="adm-btn adm-btn--danger" type="submit">Перенести и удалить</button></div></form>`, { cls: "sheet--sm adm-sheet" });
    $("#cdF", el2).addEventListener("submit", e => { e.preventDefault(); const t = new FormData(e.target).get("t"); UI.D.ads().filter(a => a.cat === c.id).forEach(a => A.setAd(a.id, { cat: t, sub: "" })); draft.splice(i, 1); VO.closeSheet(true); A.log("Категория удалена", c.name, `объявления перенесены: ${n}`); dirty = true; ACT.catsave(); });
  };
  // выбор значка: встроенные, загрузка файла или SVG-код
  ACT.caticon = el => {
    const i = +el.dataset.i, base = (window.VO_CATS_BASE || []).map(c => c.icon), all = [...base, ...Object.values(EXTRA)];
    const sh = VO.sheet(`<div class="aform aicons"><h3>Значок для «${esc(draft[i].name)}»</h3>
      <div class="aform__l">Готовые</div><div class="aicons__g">${all.map((s, k) => `<button type="button" data-ik="${k}">${s}</button>`).join("")}</div>
      <div class="aform__l">Свой</div><div class="abtns"><label class="adm-btn adm-btn--ghost">Загрузить SVG, PNG или JPG<input type="file" accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp" hidden id="icF"></label></div>
      <div class="field field--area"><textarea id="icS" rows="3" placeholder=" "></textarea><label>Или вставьте SVG-код</label></div><div class="aform__a"><button type="button" class="adm-btn" id="icSB">Применить код</button></div>
      <p class="muted">Из SVG мы удаляем скрипты и ссылки — остаётся только рисунок. Фото уменьшим до 96 × 96.</p></div>`, { cls: "sheet--sm adm-sheet" });
    const set = html => { draft[i].icon = html; VO.closeSheet(true); re(); };
    sh.addEventListener("click", e => { const b = e.target.closest("[data-ik]"); if (b) set(all[+b.dataset.ik]); });
    $("#icSB", sh).addEventListener("click", () => { const s = A.cleanSVG($("#icS", sh).value); if (!s) return VO.toast("Это не похоже на SVG-код"); set(s); });
    $("#icF", sh).addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; try { set(await iconFrom(f)); } catch (err) { VO.toast(err.message); } });
  };
  async function iconFrom(f) {
    if (f.size > 1.5e6) throw new Error("Файл больше 1,5 МБ");
    if (/svg/.test(f.type) || /\.svg$/i.test(f.name)) { const s = A.cleanSVG(await f.text()); if (!s) throw new Error("Не получилось прочитать SVG"); return s; }
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) throw new Error("Подойдут SVG, PNG, JPG или WebP");
    const bmp = await createImageBitmap(f), k = Math.min(96 / bmp.width, 96 / bmp.height, 1), cv = document.createElement("canvas");
    cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k); cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
    return `<img class="cat-img" src="${cv.toDataURL("image/png")}" alt="">`;
  }

  /* ---------- Логотип и цвет ---------- */
  const SW = ["#FF4F3A", "#E5397A", "#8A5CF6", "#2F7DE1", "#0EA5A4", "#2F9E6E", "#E0913A", "#16181D"];
  SEC.brand = { group: "site", name: "Логотип и цвет", perm: "site", render() {
    const b = A.brand(), acc = b.accent || "#FF4F3A";
    // исходный логотип: берём статичную копию из подвала (в шапке он анимированный и зависит от её стилей)
    const foot = $(".foot__logo svg"), def = foot ? foot.outerHTML : "";
    const logoLight = b.logo ? `<img src="${b.logo}" alt="">` : `<span class="abr__def">${def.replace(/fill="#fff"/g, 'fill="#16181D"').replace(/stroke="#fff"/g, 'stroke="#16181D"').replace(/ id="footW\d"/g, "")}</span>`;
    const logoDark = b.logo ? `<img src="${b.logo}" alt="">` : `<span class="abr__def">${def.replace(/ id="footW\d"/g, "")}</span>`;
    return `<div class="agrid2 agrid2--wide">
      <section class="acard"><h3>Логотип</h3><p class="muted">Показывается в шапке и подвале. Лучше SVG или PNG с прозрачным фоном, по ширине — как сейчас.</p>
        <div class="abr__mock abr__mock--light"><div class="abr__logo">${logoLight}</div><i></i><i></i><u style="background:${acc}"></u></div>
        <div class="abr__mock abr__mock--dark"><div class="abr__logo">${logoDark}</div><small>подвал</small></div>
        <div class="abtns"><label class="adm-btn">Загрузить логотип<input type="file" accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp" hidden data-br="logo"></label>${b.logo ? `<button type="button" class="adm-btn adm-btn--ghost" data-a="brreset" data-k="logo">Вернуть исходный</button>` : ""}</div></section>
      <section class="acard"><h3>Значок</h3><p class="muted">Квадратная картинка: вкладка браузера и маленькие аватарки «Команды». Если не загрузить — возьмём логотип.</p>
        <div class="abr__tab"><span class="abr__fav">${b.mark ? `<img src="${b.mark}" alt="">` : `<svg viewBox="0 0 150 214" width="11"><g transform="translate(20 4)" stroke-linejoin="round" stroke-width="10"><path d="M5 5H78A38 38 0 0 1 78 81H5Z" fill="#FF4F3A" stroke="#FF4F3A"/><path d="M5 97H84A44 44 0 0 1 84 185H30L5 207Z" fill="#16181D" stroke="#16181D"/></g></svg>`}</span><span>Все объявления</span><b>×</b></div>
        <div class="abtns"><label class="adm-btn">Загрузить значок<input type="file" accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp" hidden data-br="mark"></label>${b.mark ? `<button type="button" class="adm-btn adm-btn--ghost" data-a="brreset" data-k="mark">Вернуть исходный</button>` : ""}</div>
        <h3>Фирменный цвет</h3><p class="muted">Кнопки, ссылки, отметки. Меняется на всём сайте сразу.</p>
        <div class="abr__sw">${SW.map(c => `<button type="button" data-a="brcol" data-c="${c}" style="--c:${c}" class="${acc.toLowerCase() === c.toLowerCase() ? "on" : ""}" aria-label="${c}"></button>`).join("")}<label class="abr__own" title="Свой цвет"><input type="color" value="${acc}" data-br="accent"><span>Свой</span></label></div>
        <div class="abr__demo"><span class="abr__btn" style="background:${acc}">Разместить объявление</span><span class="abr__link" style="color:${acc}">Подробнее →</span><span class="abr__chip" style="color:${acc};background:${acc}1f">Даром</span></div>
        ${b.accent ? `<button type="button" class="adm-btn adm-btn--ghost" data-a="brreset" data-k="accent">Вернуть исходный цвет</button>` : ""}</section></div>`;
  }, async change(t) {
    if (t.dataset.br === "accent") { A.setBrand({ ...A.brand(), accent: t.value }); A.log("Фирменный цвет изменён", t.value); return UI.render(); }
    if (t.dataset.br && t.files && t.files[0]) {
      const f = t.files[0];
      try { const url = await logoFrom(f, t.dataset.br === "mark" ? 256 : 900); A.setBrand({ ...A.brand(), [t.dataset.br]: url }); A.log(t.dataset.br === "mark" ? "Значок сайта изменён" : "Логотип изменён", f.name); VO.toast("Готово — уже на сайте"); UI.render(); }
      catch (e) { VO.toast(e.message); }
    }
  } };
  async function logoFrom(f, max) {
    if (f.size > 1.5e6) throw new Error("Файл больше 1,5 МБ");
    if (/svg/.test(f.type) || /\.svg$/i.test(f.name)) { const s = A.cleanSVG(await f.text()); if (!s) throw new Error("Не получилось прочитать SVG"); return "data:image/svg+xml," + encodeURIComponent(s.replace('aria-hidden="true"', "")); }
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) throw new Error("Подойдут SVG, PNG, JPG или WebP");
    const bmp = await createImageBitmap(f), k = Math.min(max / Math.max(bmp.width, bmp.height), 1), cv = document.createElement("canvas");
    cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k); cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
    return cv.toDataURL("image/png");
  }
  ACT.brcol = el => { A.setBrand({ ...A.brand(), accent: el.dataset.c === "#FF4F3A" ? null : el.dataset.c }); A.log("Фирменный цвет изменён", el.dataset.c); UI.render(); };
  ACT.brreset = el => { const b = { ...A.brand() }; delete b[el.dataset.k]; A.setBrand(b); A.log("Оформление возвращено", el.dataset.k); UI.render(); };

  /* ---------- Контакты ---------- */
  const CF = [["phone", "Телефон", "+7 (900) 000-00-00"], ["email", "Почта", "Она же — вход владельца в админку"], ["tg", "Telegram — ссылка", "https://t.me/…"], ["wa", "WhatsApp — ссылка", "https://wa.me/…"], ["max", "MAX — ссылка", "https://max.ru/…"], ["owner", "Владелец сайта (ФИО) — для документов", ""], ["city", "Город — для документов", ""]];
  SEC.contacts = { group: "site", name: "Контакты", perm: "site", render() {
    const C = window.VO_CONTACTS;
    return `<form class="acard aform aform--flat acontacts" id="ctF"><p class="muted">Используются в подвале, плавающей кнопке связи, на странице «Написать нам», в документах и рекламе.</p>
      ${CF.map(([k, n, h]) => `<div class="field"><input name="${k}" maxlength="200" placeholder=" " value="${esc(C[k] || "")}"><label>${n}</label>${h ? `<small class="muted">${esc(h)}</small>` : ""}</div>`).join("")}
      <div class="aform__a"><button type="button" class="adm-btn adm-btn--ghost" data-a="ctreset">Вернуть исходные</button><button class="adm-btn" type="submit">Сохранить</button></div></form>`;
  }, after(body) {
    $("#ctF", body).addEventListener("submit", async e => {
      e.preventDefault(); const fd = new FormData(e.target), o = {}; CF.forEach(([k]) => o[k] = String(fd.get(k)).trim());
      if (!VO.MAIL_RX.test(o.email)) return VO.toast("Проверьте почту");
      for (const k of ["tg", "wa", "max"]) if (o[k] && !/^https:\/\//.test(o[k])) return VO.toast("Ссылки должны начинаться с https://");
      if (o.phone.replace(/\D/g, "").length < 10) return VO.toast("Проверьте телефон");
      const oldMail = String(window.VO_CONTACTS.email).toLowerCase(), me = VO.user().email;
      if (o.email.toLowerCase() !== oldMail) { if (!await UI.ask("Сменить почту владельца?", `Владельцем админки станет ${esc(o.email)}. Вас (${esc(me)}) добавим в команду администратором, чтобы не потерять доступ.`, "Сменить")) return; if (me.toLowerCase() !== o.email.toLowerCase()) A.setCfg({ team: [...A.cfg().team.filter(t => t.email !== me), { email: me, role: "admin" }] }); }
      A.setContacts(o); A.log("Контакты изменены"); VO.toast("Сохранено. Обновляем страницу…"); setTimeout(() => location.reload(), 700);
    });
  } };
  ACT.ctreset = async () => { if (!await UI.ask("Вернуть исходные контакты?", "", "Вернуть")) return; store.del("vo_site_contacts"); A.log("Контакты возвращены"); location.reload(); };

  /* ---------- Баннер и техработы ---------- */
  const TONES = [["accent", "Фирменный"], ["ink", "Тёмный"], ["green", "Зелёный"], ["yellow", "Жёлтый"]];
  SEC.banner = { group: "site", name: "Баннер и техработы", perm: "rules", render() {
    const c = A.cfg(), b = c.banner, m = c.maint;
    return `<div class="agrid2 agrid2--wide"><section class="acard aform aform--flat"><h3>Баннер над страницами</h3><p class="muted">Короткая новость для всех посетителей: акция, перерыв в работе, важное изменение. Посетитель может скрыть его крестиком.</p>
        <label class="tog"><span><b>Показывать баннер</b><small>${b.on ? "Сейчас виден на сайте" : "Выключен"}</small></span><input type="checkbox" data-bn="on"${b.on ? " checked" : ""}><span class="sw"></span></label>
        <div class="field"><input data-bn="text" maxlength="160" placeholder=" " value="${esc(b.text)}"><label>Текст — до 160 символов</label></div>
        <div class="field"><input data-bn="link" maxlength="200" placeholder=" " value="${esc(b.link)}"><label>Ссылка: #/how или https://… (необязательно)</label></div>
        <div class="achips">${TONES.map(([k, n]) => `<label><input type="radio" name="tone" data-bn="tone" value="${k}"${(b.tone || "accent") === k ? " checked" : ""}><span>${n}</span></label>`).join("")}</div>
        <div class="abn-prev"><small>Предпросмотр</small><div class="site-banner site-banner--${b.tone || "accent"}"><div class="wrap"><span>${esc(b.text || "Текст баннера")}</span>${b.link ? "<a>Подробнее →</a>" : ""}<button type="button" tabindex="-1">×</button></div></div></div></section>
      <section class="acard aform aform--flat${m.on ? " is-alert" : ""}"><h3>Технические работы</h3><p class="muted">Закрывает сайт для всех, кроме команды. Посетители увидят страницу с вашим текстом. Удобно на время больших изменений.</p>
        <label class="tog"><span><b>Сайт на техработах</b><small>${m.on ? "Сейчас сайт закрыт для посетителей" : "Сайт открыт"}</small></span><input type="checkbox" data-mt="on"${m.on ? " checked" : ""}><span class="sw"></span></label>
        <div class="field field--area"><textarea data-mt="text" rows="3" maxlength="300" placeholder=" ">${esc(m.text)}</textarea><label>Текст для посетителей</label></div>
        <div class="amaint-prev"><b>Технические работы</b><span>${esc(m.text)}</span></div></section></div>`;
  }, change(t) {
    if (t.dataset.bn) { const b = { ...A.cfg().banner }; b[t.dataset.bn] = t.type === "checkbox" ? t.checked : t.value.trim(); if (t.dataset.bn === "link" && b.link && !/^(#\/|https:\/\/)/.test(b.link)) { VO.toast("Ссылка должна начинаться с #/ или https://"); return; } if (t.dataset.bn === "text") b.text = VO.guard ? VO.guard.clean(b.text).slice(0, 160) : b.text; sessionStorage.removeItem("vo_banner_x"); A.setCfg({ banner: b }); A.log("Баннер изменён", b.on ? "вкл." : "выкл.", b.text); UI.render(); }
    if (t.dataset.mt) { const m = { ...A.cfg().maint }; m[t.dataset.mt] = t.type === "checkbox" ? t.checked : t.value.trim() || m.text; A.setCfg({ maint: m }); A.log(m.on ? "Включены техработы" : "Техработы: изменения", "", m.text); VO.toast(t.dataset.mt === "on" ? (m.on ? "Сайт закрыт для посетителей" : "Сайт снова открыт") : "Сохранено", 1600); UI.render(); }
  } };
})();
