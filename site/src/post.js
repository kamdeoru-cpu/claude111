/* Размещение и редактирование объявления — пошаговый мастер с черновиком */
(() => {
  const { $, $$, esc, store, state: S } = VO;
  const page = VO.page("post");
  const MAX_PHOTOS = 8, DAY_LIMIT = 10;
  const BANNED = /(оружи|пистолет|патрон|наркот|спайс|закладк|поддельн|фальшив|рецептурн|психотроп|взрывчат|краденн)/i;
  const LINK = /(https?:\/\/|www\.|t\.me\/|wa\.me|\.ru\b|\.com\b)/i;
  const PHONE = /(\+?7|8)[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/;
  const STEPS = [["cat", "Категория"], ["item", "Что продаёте"], ["photo", "Фото"], ["price", "Цена и передача"], ["desc", "Описание"], ["check", "Проверка"]];
  const HINT = { auto: "Kia Rio, 2017, 1.6 AT", parts: "Зимние шины R16, комплект", realty: "2-комнатная квартира, 54 м²", job: "Бариста в кофейню", service: "Ремонт стиральных машин на дому", tech: "iPhone 13, 128 ГБ", wear: "Пуховик зимний, размер M", home: "Угловой диван", kids: "Детский самокат", hobby: "Горный велосипед 27,5″", pets: "Аквариум 60 л", free: "Отдам книги по программированию" };
  let d = null, stepI = 0, editId = null;

  const blank = () => ({ cat: null, sub: "", title: "", cond: "Б/у", attrs: {}, other: {}, photos: [], price: "", free: false, bargain: false, per: "", delivery: ["meet"], city: (VO.user() || {}).city || "", district: "", desc: "" });
  const saveDraft = () => { if (!editId) store.set("vo_draft_" + S.session, { d, stepI, t: Date.now() }); };
  const usesCond = c => !["job", "service", "free"].includes(c);

  /* ---------- шаги ---------- */
  function stepCat() {
    const c = VO.CATS.find(x => x.id === d.cat);
    return `<h2>Выберите категорию</h2><p class="muted">От неё зависят характеристики и фильтры, по которым вас найдут.</p>
      <div class="ctiles">${VO.CATS.map(x => `<button type="button" class="ctile${d.cat === x.id ? " on" : ""}${x.id === "free" ? " ctile--free" : ""}" data-cat="${x.id}"><span class="ctile__i">${x.icon}</span><span class="ctile__n">${x.name}</span></button>`).join("")}</div>
      ${c ? `<div class="subs"><h4>Уточните: ${esc(c.name.toLowerCase())}</h4><div class="chips chips--s">${[...c.subs, "Другое"].map(s => `<button type="button" data-sub="${esc(s)}" aria-pressed="${d.sub === s}">${esc(s)}</button>`).join("")}</div></div>` : ""}`;
  }
  function stepItem() {
    const defs = window.VO_FILTERS[d.cat] || [];
    return `<h2>Что продаёте</h2>
      <div class="field"><input id="pTitle" maxlength="70" placeholder=" " value="${esc(d.title)}"><label for="pTitle">Название</label><em>От 5 символов — что это, модель, размер</em><small class="count">${d.title.length} / 70</small></div>
      <p class="hint">Например: «${esc(HINT[d.cat] || "")}»</p>
      ${usesCond(d.cat) ? `<div class="fs"><h4>Состояние</h4><div class="conds">${[["Новое", "С биркой или в упаковке"], ["Как новое", "Без следов использования"], ["Б/у", "Есть следы использования"]].map(([k, t]) => `<label><input type="radio" name="cond" value="${k}"${d.cond === k ? " checked" : ""}><span><b>${k}</b><small>${t}</small></span></label>`).join("")}</div></div>` : ""}
      ${defs.length ? `<div class="attrs"><h4>Характеристики <small class="muted">необязательно, но с ними находят быстрее</small></h4>${defs.map(f => {
        if (f.t === "chips") { const v = d.attrs[f.k], other = v && !f.o.includes(v); return `<div class="attr"><span>${f.n}</span><div class="chips chips--s">${f.o.map(o => `<button type="button" data-at="${f.k}" data-v="${esc(o)}" aria-pressed="${v === o}">${esc(o)}</button>`).join("")}<button type="button" data-at="${f.k}" data-v="__other" aria-pressed="${!!other || d.other[f.k] != null}">Другое</button></div>${other || d.other[f.k] != null ? `<div class="field field--sm"><input data-other="${f.k}" maxlength="40" placeholder=" " value="${esc(other ? v : d.other[f.k] || "")}"><label>Свой вариант</label></div>` : ""}</div>`; }
        if (f.t === "range") return `<div class="field field--sm"><input data-num="${f.k}" inputmode="numeric" placeholder=" " value="${d.attrs[f.k] != null ? d.attrs[f.k] : ""}"><label>${f.n}</label></div>`;
        if (f.t === "toggle") return `<label class="switch-l"><input type="checkbox" data-tg="${f.k}"${d.attrs[f.k] ? " checked" : ""}><span class="sw"></span>${f.n}</label>`;
      }).join("")}</div>` : ""}`;
  }
  function stepPhoto() {
    return `<h2>Фотографии</h2><p class="muted">До ${MAX_PHOTOS} фото. Первое станет обложкой. Данные о месте съёмки мы удаляем.</p>
      <div class="photos" id="pPhotos">${d.photos.map((p, i) => `<div class="photo${i === 0 ? " photo--cover" : ""}"><img src="${p}" alt="Фото ${i + 1}">${i === 0 ? "<em>Обложка</em>" : ""}<div class="photo__bar">${i ? `<button type="button" data-mv="${i}" data-dir="-1" aria-label="Левее">‹</button><button type="button" data-cover="${i}" title="Сделать обложкой">★</button>` : ""}${i < d.photos.length - 1 ? `<button type="button" data-mv="${i}" data-dir="1" aria-label="Правее">›</button>` : ""}<button type="button" data-rm="${i}" aria-label="Удалить">×</button></div></div>`).join("")}
      ${d.photos.length < MAX_PHOTOS ? `<label class="drop drop--tile"><input type="file" id="pPhoto" accept="image/jpeg,image/png,image/webp" multiple hidden><span class="drop__ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></span><b>${d.photos.length ? "Ещё фото" : "Добавить фото"}</b><small>или перетащите сюда</small></label>` : ""}</div>
      <div class="ptips"><b>Как снять, чтобы купили быстрее</b><ul><li>При дневном свете, без вспышки</li><li>Общий вид, детали и недостатки</li><li>Однотонный фон без лишних вещей</li></ul></div>
      ${d.photos.length ? "" : `<p class="muted">Без фото объявление тоже можно опубликовать — подставим картинку категории.</p>`}`;
  }
  function stepPrice() {
    const sim = VO.allAds().filter(a => a.cat === d.cat && a.price > 0 && !a.mine).map(a => a.price).sort((a, b) => a - b);
    const per = d.cat === "job" ? ["в месяц", "за смену", "в час"] : d.cat === "service" ? ["за услугу", "в час", "за выезд"] : null;
    return `<h2>Цена и передача</h2>
      <div class="row2"><div class="field"><input id="pPrice" inputmode="numeric" placeholder=" " value="${d.free ? "" : d.price}"${d.free ? " disabled" : ""}><label for="pPrice">${d.cat === "job" ? "Зарплата, ₽" : "Цена, ₽"}</label><em>Укажите цену или отметьте «Отдам даром»</em></div>
        ${d.cat === "job" ? "" : `<label class="switch-l"><input type="checkbox" id="pFree"${d.free ? " checked" : ""}><span class="sw"></span>Отдам даром</label>`}
        <label class="switch-l"><input type="checkbox" id="pBargain"${d.bargain ? " checked" : ""}${d.free ? " disabled" : ""}><span class="sw"></span>Торг</label></div>
      ${per ? `<div class="chips chips--s">${per.map(p => `<button type="button" data-per="${p}" aria-pressed="${(d.per || per[0]) === p}">${p}</button>`).join("")}</div>` : ""}
      ${sim.length ? `<div class="pricehint">Похожие объявления в этой категории: <b>от ${VO.rub(sim[0])} до ${VO.rub(sim[sim.length - 1])}</b>. Цена чуть ниже рынка — и откликов больше.</div>` : ""}
      ${["job", "service", "realty"].includes(d.cat) ? "" : `<div class="fs"><h4>Как передать</h4><div class="vis vis--row">${[["meet", "Встреча", "в вашем городе"], ["ship", "Отправка", "Почта, СДЭК, Boxberry"], ["courier", "Привезу сам(а)", "по договорённости"]].map(([k, t, s]) => `<label><input type="checkbox" data-dv="${k}"${d.delivery.includes(k) ? " checked" : ""}><span><b>${t}</b><small>${s}</small></span></label>`).join("")}</div></div>`}
      <div class="row2 row2--eq"><div class="field"><input id="pCity" maxlength="60" placeholder=" " value="${esc(d.city)}"><label for="pCity">Город или населённый пункт</label><em>Укажите, где находится</em></div>
        <div class="field"><input id="pDistrict" maxlength="60" placeholder=" " value="${esc(d.district)}"><label for="pDistrict">Район или метро (необязательно)</label></div></div>`;
  }
  function stepDesc() {
    const u = VO.user(), vis = { none: "никому — только сообщения", auth: "только вошедшим", all: "всем" }[u.phoneVis || "none"];
    return `<h2>Описание</h2>
      <div class="field field--area"><textarea id="pDesc" rows="8" maxlength="3000" placeholder=" ">${esc(d.desc)}</textarea><label for="pDesc">Расскажите подробнее</label><small class="count">${d.desc.length} / 3000</small></div>
      <div class="dtips">${["Состояние и недостатки", "Что в комплекте", "Почему продаёте", "Когда удобно показать"].map(t => `<button type="button" data-tip="${t}">+ ${t}</button>`).join("")}</div>
      <div class="contact-way"><b>Как с вами свяжутся</b><span>Сообщения на сайте — всегда. Номер телефона: ${vis}. <a href="#/me/profile">Изменить в профиле</a></span></div>`;
  }
  function stepCheck() {
    const ad = toAd(), probs = problems();
    return `<h2>Проверьте объявление</h2>
      <div class="review">
        <div class="review__card no-open">${previewCard()}</div>
        <dl class="review__l">
          <div><dt>Категория</dt><dd>${esc(VO.catName(d.cat))}${d.sub ? " · " + esc(d.sub) : ""}</dd><button type="button" class="link" data-go="0">Изменить</button></div>
          <div><dt>Название</dt><dd>${esc(d.title || "—")}</dd><button type="button" class="link" data-go="1">Изменить</button></div>
          <div><dt>Фото</dt><dd>${d.photos.length || "Без фото"}</dd><button type="button" class="link" data-go="2">Изменить</button></div>
          <div><dt>Цена</dt><dd>${ad.price ? VO.rub(ad.price) : "Даром"}${d.bargain ? ", торг" : ""}</dd><button type="button" class="link" data-go="3">Изменить</button></div>
          <div><dt>Где</dt><dd>${esc(d.city || "—")}${d.district ? ", " + esc(d.district) : ""}</dd><button type="button" class="link" data-go="3">Изменить</button></div>
          <div><dt>Описание</dt><dd>${d.desc ? esc(d.desc.slice(0, 90)) + (d.desc.length > 90 ? "…" : "") : "—"}</dd><button type="button" class="link" data-go="4">Изменить</button></div>
        </dl>
      </div>
      ${probs.length ? `<div class="post-warn">${probs.map(p => `<div>${esc(p)}</div>`).join("")}</div>` : `<div class="post-ok">Всё готово к публикации</div>`}
      <small class="auth__fine">Публикуя, вы соглашаетесь с <a href="#/doc/rules">Правилами размещения</a>.${VO.DEMO ? " Пока нет сервера, объявление видно только в этом браузере." : ""}</small>`;
  }
  const BODY = [stepCat, stepItem, stepPhoto, stepPrice, stepDesc, stepCheck];

  function toAd() {
    const attrs = { ...d.attrs };
    Object.entries(d.other).forEach(([k, v]) => { if (v && v.trim()) attrs[k] = v.trim(); });
    const price = d.free ? 0 : +String(d.price).replace(/\D/g, "") || 0;
    return { cat: d.cat || "tech", sub: d.sub, title: d.title.trim(), attrs, price, bargain: !d.free && d.bargain,
      per: d.cat === "job" ? (d.per || "в месяц").replace(/^в /, "") : d.cat === "service" ? (d.per || "за услугу") : null,
      cond: d.free ? "Даром" : d.cat === "job" ? "Работа" : d.cat === "service" ? "Услуга" : d.cond, delivery: d.delivery, district: d.district.trim(),
      city: d.city.trim() || "Москва", desc: d.desc.trim(), photos: d.photos, photo: d.photos[0] || null, ill: window.VO_CAT_ILL[d.cat || "tech"], bg: window.VO_CAT_BG[d.cat || "tech"] };
  }
  const previewCard = () => { const a = { ...toAd(), id: "preview", created: Date.now() }; if (!a.title) a.title = "Название объявления"; if (!d.free && !a.price) { a.price = null; a.cond = d.cond; } return VO.cardHTML(a).replace(/ data-fav="[^"]*"/, " disabled tabindex=\"-1\"").replace('class="card', 'class="card in'); };
  function problems() {
    const p = [], t = d.title + " " + d.desc;
    if (!d.cat) p.push("Выберите категорию");
    if (d.title.trim().length < 5) p.push("Название слишком короткое — минимум 5 символов");
    if (!d.free && !(+String(d.price).replace(/\D/g, "") > 0)) p.push("Укажите цену или отметьте «Отдам даром»");
    if (d.city.trim().length < 2) p.push("Укажите город");
    if (BANNED.test(t)) p.push("Похоже на запрещённый товар — такие объявления не публикуются (см. Правила размещения)");
    if (LINK.test(t)) p.push("Уберите ссылки из текста — это частый приём мошенников");
    if (PHONE.test(t)) p.push("Не пишите телефон в тексте — включите его показ в профиле");
    return p;
  }
  function validStep(i) {
    if (i === 0 && !d.cat) { VO.toast("Выберите категорию"); return false; }
    if (i === 1 && d.title.trim().length < 5) { const f = $("#pTitle", page); VO.check(f.parentElement, false); f.focus(); return false; }
    if (i === 3) { const okP = d.free || +String(d.price).replace(/\D/g, "") > 0, okC = d.city.trim().length > 1; VO.check($("#pPrice", page).parentElement, okP); VO.check($("#pCity", page).parentElement, okC); if (!okP || !okC) return false; }
    return true;
  }

  function quality() {
    const q = [["Категория", !!d.cat], ["Название от 10 символов", d.title.trim().length >= 10], ["Цена", d.free || +String(d.price).replace(/\D/g, "") > 0], ["Характеристики", Object.keys(d.attrs).length + Object.keys(d.other).length >= Math.min(2, (window.VO_FILTERS[d.cat] || []).length)], ["Фото", d.photos.length > 0], ["Описание от 60 символов", d.desc.trim().length >= 60]];
    const pct = Math.round(q.filter(x => x[1]).length / q.length * 100);
    return `<div class="quality__h"><b>Качество объявления</b><span>${pct}%</span></div><div class="quality__bar"><i style="width:${pct}%"></i></div><ul>${q.map(([n, ok]) => `<li class="${ok ? "ok" : ""}">${n}</li>`).join("")}</ul>`;
  }
  function render(focusId) {
    page.innerHTML = `<div class="wrap">
      <header class="wiz-h"><div><span class="ph__eyebrow">${editId ? "Редактирование" : "Новое объявление"}</span><h1>${editId ? "Обновите объявление" : "Разместить объявление"}</h1></div>${editId ? "" : `<span class="muted wiz-h__d" id="draftT">${store.get("vo_draft_" + S.session, null) ? "Черновик сохраняется автоматически" : ""}</span>`}</header>
      <ol class="wiz-steps">${STEPS.map(([k, n], i) => `<li class="${i < stepI ? "done" : i === stepI ? "cur" : ""}"><button type="button" data-step="${i}"${i > stepI + 1 ? " disabled" : ""}><i>${i < stepI ? "✓" : i + 1}</i><span>${n}</span></button></li>`).join("")}</ol>
      <div class="wiz">
        <section class="wiz__card" id="wizBody">${BODY[stepI]()}
          <div class="wiz__nav">${stepI ? `<button class="btn btn--ghost" type="button" data-nav="-1">← Назад</button>` : `<span></span>`}${stepI < STEPS.length - 1 ? `<button class="btn btn--ink btn--lg" type="button" data-nav="1">Далее: ${STEPS[stepI + 1][1].toLowerCase()} →</button>` : `<button class="btn btn--accent btn--lg" type="button" data-publish${problems().length ? " disabled" : ""}>${editId ? "Сохранить изменения" : "Опубликовать"}</button>`}</div></section>
        <aside class="wiz__side"><span class="post-prev__lbl">Так увидят покупатели</span><div class="wiz__prev no-open" id="wizPrev">${previewCard()}</div><div class="quality" id="quality">${quality()}</div></aside>
      </div></div>`;
    if (stepI === 3) VO.cityField($("#pCity", page), v => { d.city = v; refresh(); });
    if (focusId) { const el = $("#" + focusId, page); if (el) { el.focus(); const v = el.value; el.value = ""; el.value = v; } }
  }
  const refresh = () => { $("#wizPrev", page).innerHTML = previewCard(); $("#quality", page).innerHTML = quality(); saveDraft(); };
  const go = i => { stepI = Math.max(0, Math.min(STEPS.length - 1, i)); render(); scrollTo({ top: 0, behavior: "smooth" }); saveDraft(); };

  page.addEventListener("click", e => {
    const t = e.target;
    const c = t.closest("[data-cat]"); if (c) { if (d.cat !== c.dataset.cat) { d.attrs = {}; d.other = {}; d.sub = ""; d.per = ""; } d.cat = c.dataset.cat; if (d.cat === "free") d.free = true; render(); saveDraft(); return; }
    const sb = t.closest("[data-sub]"); if (sb) { d.sub = d.sub === sb.dataset.sub ? "" : sb.dataset.sub; render(); saveDraft(); return; }
    const at = t.closest("[data-at]"); if (at) { const k = at.dataset.at, v = at.dataset.v; if (v === "__other") { if (d.other[k] != null) delete d.other[k]; else { d.other[k] = ""; delete d.attrs[k]; } } else { delete d.other[k]; d.attrs[k] = d.attrs[k] === v ? undefined : v; if (d.attrs[k] === undefined) delete d.attrs[k]; } render(v === "__other" ? null : null); if (v === "__other") { const i = $(`[data-other="${k}"]`, page); if (i) i.focus(); } saveDraft(); return; }
    const pr = t.closest("[data-per]"); if (pr) { d.per = pr.dataset.per; render(); return; }
    const tip = t.closest("[data-tip]"); if (tip) { const ta = $("#pDesc", page); d.desc = (d.desc ? d.desc.replace(/\s*$/, "") + "\n" : "") + tip.dataset.tip + ": "; ta.value = d.desc; ta.focus(); refresh(); return; }
    const rm = t.closest("[data-rm]"); if (rm) { d.photos.splice(+rm.dataset.rm, 1); render(); saveDraft(); return; }
    const cv = t.closest("[data-cover]"); if (cv) { const [p] = d.photos.splice(+cv.dataset.cover, 1); d.photos.unshift(p); render(); saveDraft(); return; }
    const mv = t.closest("[data-mv]"); if (mv) { const i = +mv.dataset.mv, j = i + +mv.dataset.dir; [d.photos[i], d.photos[j]] = [d.photos[j], d.photos[i]]; render(); saveDraft(); return; }
    const st = t.closest("[data-step]"); if (st) { const i = +st.dataset.step; if (i <= stepI || validStep(stepI)) go(i); return; }
    const gg = t.closest("[data-go]"); if (gg) return go(+gg.dataset.go);
    const nv = t.closest("[data-nav]"); if (nv) { const n = +nv.dataset.nav; if (n < 0 || validStep(stepI)) go(stepI + n); return; }
    if (t.closest("[data-publish]")) publish();
  });
  page.addEventListener("input", e => {
    const t = e.target, fl = t.closest(".field"); if (fl) fl.classList.remove("bad");
    if (t.id === "pTitle") { d.title = t.value; fl.querySelector(".count").textContent = `${t.value.length} / 70`; }
    if (t.id === "pDesc") { d.desc = t.value; fl.querySelector(".count").textContent = `${t.value.length} / 3000`; }
    if (t.id === "pPrice") { t.value = t.value.replace(/\D/g, "").slice(0, 10).replace(/\B(?=(\d{3})+(?!\d))/g, " "); d.price = t.value; }
    if (t.id === "pCity") d.city = t.value;
    if (t.id === "pDistrict") d.district = t.value;
    if (t.dataset.other) d.other[t.dataset.other] = t.value.slice(0, 40);
    if (t.dataset.num) { t.value = t.value.replace(/\D/g, "").slice(0, 9); if (t.value) d.attrs[t.dataset.num] = +t.value; else delete d.attrs[t.dataset.num]; }
    refresh();
  });
  page.addEventListener("change", e => {
    const t = e.target;
    if (t.name === "cond") d.cond = t.value;
    if (t.id === "pFree") { d.free = t.checked; if (d.free) { d.price = ""; d.bargain = false; } render(); }
    if (t.id === "pBargain") d.bargain = t.checked;
    if (t.dataset.tg) { if (t.checked) d.attrs[t.dataset.tg] = true; else delete d.attrs[t.dataset.tg]; }
    if (t.dataset.dv) { d.delivery = $$("[data-dv]", page).filter(x => x.checked).map(x => x.dataset.dv); }
    if (t.id === "pPhoto") [...t.files].slice(0, MAX_PHOTOS - d.photos.length).forEach(takePhoto);
    refresh();
  });
  ["dragover", "dragenter"].forEach(ev => page.addEventListener(ev, e => { const x = e.target.closest(".drop"); if (x) { e.preventDefault(); x.classList.add("over"); } }));
  page.addEventListener("dragleave", e => { const x = e.target.closest(".drop"); if (x) x.classList.remove("over"); });
  page.addEventListener("drop", e => { const x = e.target.closest(".drop"); if (x) { e.preventDefault(); [...e.dataTransfer.files].slice(0, MAX_PHOTOS - d.photos.length).forEach(takePhoto); } });
  function takePhoto(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return VO.toast("Подойдут JPG, PNG или WebP");
    if (file.size > 15e6) return VO.toast("Фото больше 15 МБ — выберите поменьше");
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const k = Math.min(1, 900 / Math.max(img.width, img.height)), cv = document.createElement("canvas"); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url); if (d.photos.length < MAX_PHOTOS) d.photos.push(cv.toDataURL("image/jpeg", .78)); render(); saveDraft(); };
    img.onerror = () => VO.toast("Не получилось открыть изображение");
    img.src = url;
  }
  function publish() {
    const p = problems(); if (p.length) return VO.toast(p[0]);
    const u = VO.user(), ad = toAd();
    if (!editId && S.mine.filter(a => a.owner === u.email && Date.now() - (a.first || a.created) < 864e5).length >= DAY_LIMIT) return VO.toast(`Можно размещать до ${DAY_LIMIT} объявлений в сутки. Попробуйте завтра`);
    if (editId) { const i = S.mine.findIndex(a => a.id === editId), old = S.mine[i]; S.mine[i] = { ...old, ...ad, id: editId, owner: u.email, created: old.created, first: old.first || old.created, status: old.status }; }
    else S.mine.unshift({ ...ad, id: "m" + Date.now(), owner: u.email, created: Date.now(), first: Date.now(), status: "active" });
    if (!VO.saveMine()) { if (!editId) S.mine.shift(); return VO.toast("Не хватает места в браузере — уберите пару фото"); }
    store.del("vo_draft_" + S.session);
    VO.emit("mine"); VO.search.build();
    VO.addNote(editId ? "Объявление обновлено" : "Объявление опубликовано", `«${ad.title}»`, { cat: "ads", link: "#/ad/" + (editId || S.mine[0].id) });
    VO.toast(editId ? "Изменения сохранены" : "Опубликовано! Объявление уже в ленте");
    location.hash = "#/ad/" + (editId || S.mine[0].id);
  }

  VO.routes.post = (p, q) => {
    if (!VO.user()) return VO.needLogin(location.hash, "Войдите, чтобы разместить объявление");
    const id = q.get("edit");
    if (id) {
      const ad = S.mine.find(a => a.id === id && a.owner === VO.user().email);
      if (!ad) { VO.toast("Это объявление нельзя редактировать"); location.hash = "#/me/ads"; return; }
      editId = id; stepI = 1;
      const defs = window.VO_FILTERS[ad.cat] || [], attrs = {}, other = {};
      Object.entries(ad.attrs || {}).forEach(([k, v]) => { const f = defs.find(x => x.k === k); if (f && f.t === "chips" && !f.o.includes(v)) other[k] = v; else attrs[k] = v; });
      d = { ...blank(), cat: ad.cat, sub: ad.sub || "", title: ad.title, cond: ["Новое", "Как новое", "Б/у"].includes(ad.cond) ? ad.cond : "Б/у", attrs, other, photos: [...(ad.photos || (ad.photo ? [ad.photo] : []))], price: ad.price ? ad.price.toLocaleString("ru-RU") : "", free: ad.price === 0, bargain: !!ad.bargain, delivery: ad.delivery || ["meet"], city: ad.city, district: ad.district || "", desc: ad.desc || "" };
    } else {
      editId = null;
      const dr = store.get("vo_draft_" + S.session, null);
      if (dr && Date.now() - dr.t < 7 * 864e5) { d = { ...blank(), ...dr.d }; stepI = dr.stepI || 0; } else { d = blank(); stepI = 0; }
    }
    render(); VO.show("post", editId ? "Редактирование" : "Разместить объявление");
  };
})();
