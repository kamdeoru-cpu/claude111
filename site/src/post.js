/* Размещение и редактирование объявления — пошаговый мастер с черновиком */
(() => {
  const { $, $$, esc, store, state: S } = VO;
  const page = VO.page("post");
  // лимиты задаются в админке («Правила сайта»)
  let MAX_PHOTOS = 8, DAY_LIMIT = 10;
  const limits = () => { const c = VO.adm ? VO.adm.cfg() : {}; MAX_PHOTOS = c.maxPhotos || 8; DAY_LIMIT = c.dayLimit || 10; };
  const G = VO.guard, TMAX = 50, DMAX = 3000;
  // разумный потолок цены по категориям — от опечаток и «цен-шуток»
  const PMAX = { realty: 5e9, auto: 1e9, job: 5e6, service: 1e7 };
  const pmax = () => PMAX[d.cat] || 1e8;
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
      <div class="field"><input id="pTitle" maxlength="${TMAX}" placeholder=" " value="${esc(d.title)}"><label for="pTitle">Название</label><em>От 5 символов — что это, модель, размер</em><small class="count">${d.title.length} / ${TMAX}</small></div>
      <p class="hint">Например: «${esc(HINT[d.cat] || "")}»</p>
      ${usesCond(d.cat) ? `<div class="fs"><h4>Состояние</h4><div class="conds">${[["Новое", "С биркой или в упаковке"], ["Как новое", "Без следов использования"], ["Б/у", "Есть следы использования"]].map(([k, t]) => `<label><input type="radio" name="cond" value="${k}"${d.cond === k ? " checked" : ""}><span><b>${k}</b><small>${t}</small></span></label>`).join("")}</div></div>` : ""}
      ${defs.length ? `<div class="attrs"><h4>Характеристики <small class="muted">необязательно, но с ними находят быстрее</small></h4>${defs.map(f => {
        if (f.t === "chips") { const v = d.attrs[f.k], other = v && !f.o.includes(v); return `<div class="attr"><span>${f.n}</span><div class="chips chips--s">${f.o.map(o => `<button type="button" data-at="${f.k}" data-v="${esc(o)}" aria-pressed="${v === o}">${esc(o)}</button>`).join("")}<button type="button" data-at="${f.k}" data-v="__other" aria-pressed="${!!other || d.other[f.k] != null}">Другое</button></div>${other || d.other[f.k] != null ? `<div class="field field--sm"><input data-other="${f.k}" maxlength="30" placeholder=" " value="${esc(other ? v : d.other[f.k] || "")}"><label>Свой вариант</label><em>Проверьте текст</em></div>` : ""}</div>`; }
        if (f.t === "range") return `<div class="field field--sm"><input data-num="${f.k}" inputmode="numeric" placeholder=" " value="${d.attrs[f.k] != null ? d.attrs[f.k] : ""}"><label>${f.n}</label></div>`;
        if (f.t === "toggle") return `<label class="switch-l"><input type="checkbox" data-tg="${f.k}"${d.attrs[f.k] ? " checked" : ""}><span class="sw"></span>${f.n}</label>`;
      }).join("")}</div>` : ""}`;
  }
  function stepPhoto() {
    return `<h2>Фотографии</h2><p class="muted">До ${MAX_PHOTOS} фото. Первое станет обложкой — порядок меняется перетаскиванием. Перед загрузкой мы уменьшаем фото и удаляем из него служебные данные: место съёмки, модель телефона, дату.</p>
      <div class="photos" id="pPhotos">${d.photos.map((p, i) => `<div class="photo${i === 0 ? " photo--cover" : ""}" data-i="${i}" title="Зажмите и перетащите, чтобы поменять порядок"><img src="${p}" alt="Фото ${i + 1}" draggable="false">${i === 0 ? "<em>Обложка</em>" : ""}<div class="photo__bar">${i ? `<button type="button" data-mv="${i}" data-dir="-1" aria-label="Левее">‹</button><button type="button" data-cover="${i}" title="Сделать обложкой">★</button>` : ""}${i < d.photos.length - 1 ? `<button type="button" data-mv="${i}" data-dir="1" aria-label="Правее">›</button>` : ""}<button type="button" data-rm="${i}" aria-label="Удалить">×</button></div></div>`).join("")}${Array.from({ length: busy }, () => `<div class="photo photo--busy"><i class="spin"></i><small>Обрабатываем…</small></div>`).join("")}
      ${d.photos.length + busy < MAX_PHOTOS ? `<label class="drop drop--tile"><input type="file" id="pPhoto" accept="image/jpeg,image/png,image/webp" multiple hidden><span class="drop__ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></span><b>${d.photos.length ? "Ещё фото" : "Добавить фото"}</b><small>или перетащите сюда</small></label>` : ""}</div>
      <div class="ptips"><b>Как снять, чтобы купили быстрее</b><ul><li>При дневном свете, без вспышки</li><li>Общий вид, детали и недостатки</li><li>Однотонный фон без лишних вещей</li><li>Без чужих фото из интернета, текста и номеров телефона на снимке</li></ul><small class="muted">JPG, PNG или WebP · до 20 МБ · от 200 × 200 пикселей</small></div>
      ${d.photos.length ? "" : `<p class="muted">Без фото объявление тоже можно опубликовать — подставим картинку категории.</p>`}`;
  }
  function stepPrice() {
    const sim = VO.allAds().filter(a => a.cat === d.cat && a.price > 0 && !a.mine).map(a => a.price).sort((a, b) => a - b);
    const per = d.cat === "job" ? ["в месяц", "за смену", "в час"] : d.cat === "service" ? ["за услугу", "в час", "за выезд"] : null;
    return `<h2>Цена и передача</h2>
      <div class="row2"><div class="field"><input id="pPrice" inputmode="numeric" placeholder=" " value="${d.free ? "" : d.price}"${d.free ? " disabled" : ""}><label for="pPrice">${d.cat === "job" ? "Зарплата, ₽" : "Цена, ₽"}</label><em id="pPriceE">Укажите цену или отметьте «Отдам даром»</em></div>
        ${d.cat === "job" ? "" : `<label class="switch-l"><input type="checkbox" id="pFree"${d.free ? " checked" : ""}><span class="sw"></span>Отдам даром</label>`}
        <label class="switch-l"><input type="checkbox" id="pBargain"${d.bargain ? " checked" : ""}${d.free ? " disabled" : ""}><span class="sw"></span>Торг</label></div>
      ${per ? `<div class="chips chips--s">${per.map(p => `<button type="button" data-per="${p}" aria-pressed="${(d.per || per[0]) === p}">${p}</button>`).join("")}</div>` : ""}
      ${sim.length ? `<div class="pricehint">Похожие объявления в этой категории: <b>от ${VO.rub(sim[0])} до ${VO.rub(sim[sim.length - 1])}</b>. Цена чуть ниже рынка — и откликов больше.</div>` : ""}
      ${["job", "service", "realty"].includes(d.cat) ? "" : `<div class="fs"><h4>Как передать</h4><div class="vis vis--row">${[["meet", "Встреча", "в вашем городе"], ["ship", "Отправка", "Почта, СДЭК, Boxberry"], ["courier", "Привезу сам(а)", "по договорённости"]].map(([k, t, s]) => `<label><input type="checkbox" data-dv="${k}"${d.delivery.includes(k) ? " checked" : ""}><span><b>${t}</b><small>${s}</small></span></label>`).join("")}</div></div>`}
      <div class="row2 row2--eq"><div class="field"><input id="pCity" maxlength="60" placeholder=" " value="${esc(d.city)}"><label for="pCity">Город или населённый пункт</label><em>Укажите, где находится</em></div>
        <div class="field"><input id="pDistrict" maxlength="50" placeholder=" " value="${esc(d.district)}"><label for="pDistrict">Район или метро (необязательно)</label><em>Проверьте текст</em></div></div>`;
  }
  function stepDesc() {
    const u = VO.user(), vis = { none: "никому — только сообщения", auth: "только вошедшим", all: "всем" }[u.phoneVis || "none"];
    return `<h2>Описание</h2>
      <div class="field field--area"><textarea id="pDesc" rows="8" maxlength="${DMAX}" placeholder=" ">${esc(d.desc)}</textarea><label for="pDesc">Расскажите подробнее</label><em>Проверьте текст</em><small class="count">${d.desc.length} / ${DMAX}</small></div>
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
    Object.entries(d.other).forEach(([k, v]) => { v = G.clean(v).slice(0, 30); if (v) attrs[k] = v; });
    const price = d.free ? 0 : +String(d.price).replace(/\D/g, "") || 0;
    return { cat: d.cat || "tech", sub: d.sub, title: G.clean(d.title).slice(0, TMAX), attrs, price, bargain: !d.free && d.bargain,
      per: d.cat === "job" ? (d.per || "в месяц").replace(/^в /, "") : d.cat === "service" ? (d.per || "за услугу") : null,
      cond: d.free ? "Даром" : d.cat === "job" ? "Работа" : d.cat === "service" ? "Услуга" : d.cond, delivery: d.delivery, district: G.clean(d.district).slice(0, 50),
      city: G.clean(d.city).slice(0, 60) || "Москва", desc: G.clean(d.desc, { multiline: true, maxLines: 60 }).slice(0, DMAX), photos: d.photos, photo: d.photos[0] || null, ill: window.VO_CAT_ILL[d.cat || "tech"], bg: window.VO_CAT_BG[d.cat || "tech"] };
  }
  const previewCard = () => { const a = { ...toAd(), id: "preview", created: Date.now() }; if (!a.title) a.title = "Название объявления"; if (!d.free && !a.price) { a.price = null; a.cond = d.cond; } return VO.cardHTML(a).replace(/ data-fav="[^"]*"/, " disabled tabindex=\"-1\"").replace('class="card', 'class="card in'); };
  function problems() {
    const p = [], add = (where, m) => m && !p.includes(where + m) && p.push(where + m);
    if (!d.cat) p.push("Выберите категорию");
    if (G.clean(d.title).length < 5) p.push("Название слишком короткое — минимум 5 символов");
    else add("Название: ", G.text(d.title, "title"));
    if (d.desc.trim()) add("Описание: ", G.text(d.desc, "desc"));
    const rc = VO.adm ? VO.adm.cfg() : {};
    if (rc.minDesc && d.desc.trim().length < rc.minDesc) p.push(`Описание — хотя бы ${rc.minDesc} символов`);
    if (rc.requirePhoto && !d.photos.length) p.push("Добавьте хотя бы одно фото — так требуют правила сайта");
    // запрещёнку ищем и в связке «название + описание»
    add("", !p.length && G.banned(d.title + "\n" + d.desc) ? "Похоже на запрещённое к продаже — см. Правила размещения" : null);
    Object.values(d.other).forEach(v => v && v.trim() && add("Характеристики: ", G.text(v, "other")));
    const pr = +String(d.price).replace(/\D/g, "");
    if (!d.free && !(pr > 0)) p.push("Укажите цену или отметьте «Отдам даром»");
    else if (!d.free && pr > pmax()) p.push(`Проверьте цену — для этой категории не больше ${VO.rub(pmax())}`);
    if (G.clean(d.city).length < 2) p.push("Укажите город");
    else add("Город: ", G.text(d.city, "place"));
    if (d.district.trim()) add("Район: ", G.text(d.district, "place"));
    return p;
  }
  function validStep(i) {
    if (i === 0 && !d.cat) { VO.toast("Выберите категорию"); return false; }
    if (i === 1) {
      const f = $("#pTitle", page); if (!G.field(f, "title", { min: 5 })) { f.focus(); return false; }
      const bad = $$("[data-other]", page).filter(x => x.value.trim() && !G.field(x, "other")); if (bad.length) { bad[0].focus(); return false; }
    }
    if (i === 3) {
      const pr = +String(d.price).replace(/\D/g, ""), okP = G.mark($("#pPrice", page), d.free || pr > 0 ? (d.free || pr <= pmax() ? null : `Не больше ${VO.rub(pmax())} — проверьте, нет ли лишних нулей`) : "Укажите цену или отметьте «Отдам даром»");
      const okC = G.field($("#pCity", page), "place", { min: 2 }), okD = G.field($("#pDistrict", page), "place", { optional: true });
      if (!okP || !okC || !okD) return false;
    }
    if (i === 4 && !G.field($("#pDesc", page), "desc", { optional: true })) { $("#pDesc", page).focus(); return false; }
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
  let busy = 0;
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
    if (t.id === "pTitle") { d.title = t.value; fl.querySelector(".count").textContent = `${t.value.length} / ${TMAX}`; }
    if (t.id === "pDesc") { d.desc = t.value; fl.querySelector(".count").textContent = `${t.value.length} / ${DMAX}`; }
    if (t.id === "pPrice") { t.value = t.value.replace(/\D/g, "").slice(0, 10).replace(/\B(?=(\d{3})+(?!\d))/g, " "); d.price = t.value; }
    if (t.id === "pCity") d.city = t.value;
    if (t.id === "pDistrict") d.district = t.value;
    if (t.dataset.other) d.other[t.dataset.other] = t.value.slice(0, 30);
    if (t.dataset.num) { t.value = t.value.replace(/\D/g, "").slice(0, 9); if (t.value) d.attrs[t.dataset.num] = +t.value; else delete d.attrs[t.dataset.num]; }
    refresh();
  });
  // подсказка об ошибке — сразу, как только человек ушёл с поля
  page.addEventListener("focusout", e => {
    const t = e.target; if (!t.value || !t.value.trim()) return;
    if (t.id === "pTitle") G.field(t, "title", { min: 5 });
    if (t.id === "pDesc") G.field(t, "desc");
    if (t.id === "pDistrict") G.field(t, "place");
    if (t.dataset.other) G.field(t, "other");
  });
  page.addEventListener("change", e => {
    const t = e.target;
    if (t.name === "cond") d.cond = t.value;
    if (t.id === "pFree") { d.free = t.checked; if (d.free) { d.price = ""; d.bargain = false; } render(); }
    if (t.id === "pBargain") d.bargain = t.checked;
    if (t.dataset.tg) { if (t.checked) d.attrs[t.dataset.tg] = true; else delete d.attrs[t.dataset.tg]; }
    if (t.dataset.dv) { d.delivery = $$("[data-dv]", page).filter(x => x.checked).map(x => x.dataset.dv); }
    if (t.id === "pPhoto") { addPhotos(t.files); t.value = ""; }
    refresh();
  });
  ["dragover", "dragenter"].forEach(ev => page.addEventListener(ev, e => { const x = e.target.closest(".drop"); if (x) { e.preventDefault(); x.classList.add("over"); } }));
  page.addEventListener("dragleave", e => { const x = e.target.closest(".drop"); if (x) x.classList.remove("over"); });
  page.addEventListener("drop", e => { const x = e.target.closest(".drop"); if (x) { e.preventDefault(); x.classList.remove("over"); addPhotos(e.dataTransfer.files); } });
  // Фото обрабатываем по одному: проверка формата по содержимому, размеров, пересжатие без EXIF
  async function addPhotos(list) {
    let files = [...list];
    const room = MAX_PHOTOS - d.photos.length - busy;
    if (files.length > room) { VO.toast(room > 0 ? `Можно добавить ещё ${room} фото — лишние не загрузили` : `Уже ${MAX_PHOTOS} фото — это максимум`); files = files.slice(0, Math.max(0, room)); }
    if (!files.length) return;
    const w = G.rate("photo", 60, 36e5); if (w) return VO.toast(`Слишком много загрузок. Попробуйте через ${G.wait(w)}`);
    busy += files.length; if (stepI === 2) render();
    const errs = [];
    for (const f of files) {
      try {
        const url = await G.image(f);
        if (d.photos.includes(url)) errs.push("Это фото уже добавлено");
        else if (d.photos.length < MAX_PHOTOS) d.photos.push(url);
      } catch (err) { errs.push(err.message); }
      busy--; if (stepI === 2 && !drag) render(); saveDraft();
    }
    [...new Set(errs)].slice(0, 3).forEach((m, i) => setTimeout(() => VO.toast(m, 5200), i * 250));
  }

  /* ---------- перетаскивание фото: мышью сразу, пальцем — после короткого удержания ---------- */
  let drag = null;
  const photoEls = () => $$("#pPhotos .photo[data-i]", page);
  page.addEventListener("pointerdown", e => {
    const ph = e.target.closest(".photo[data-i]"); if (!ph || e.target.closest("button") || e.button > 0) return;
    drag = { el: ph, x: e.clientX, y: e.clientY, on: false, touch: e.pointerType !== "mouse" };
    if (drag.touch) drag.timer = setTimeout(() => drag && startDrag(drag.x, drag.y), 260);
  });
  function startDrag(x, y) {
    const r = drag.el.getBoundingClientRect();
    drag.on = true; drag.dx = x - r.left; drag.dy = y - r.top;
    const g = drag.ghost = drag.el.cloneNode(true); g.classList.add("photo--ghost"); g.removeAttribute("data-i");
    Object.assign(g.style, { width: r.width + "px", height: r.height + "px", left: r.left + "px", top: r.top + "px" });
    document.body.appendChild(g); drag.el.classList.add("photo--hole"); page.classList.add("is-sorting");
    if (navigator.vibrate) navigator.vibrate(12);
  }
  addEventListener("pointermove", e => {
    if (!drag) return;
    if (!drag.on) { if (drag.touch) { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) { clearTimeout(drag.timer); drag = null; } return; } if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return; startDrag(drag.x, drag.y); }
    drag.x = e.clientX; drag.y = e.clientY;
    drag.ghost.style.transform = `translate(${e.clientX - drag.dx - parseFloat(drag.ghost.style.left)}px, ${e.clientY - drag.dy - parseFloat(drag.ghost.style.top)}px) rotate(-3deg) scale(1.05)`;
    const over = document.elementFromPoint(e.clientX, e.clientY), tgt = over && over.closest("#pPhotos .photo[data-i]");
    if (!tgt || tgt === drag.el) return;
    const els = photoEls(), before = new Map(els.map(x => [x, x.getBoundingClientRect()]));
    const a = els.indexOf(drag.el), b = els.indexOf(tgt);
    tgt.parentNode.insertBefore(drag.el, a < b ? tgt.nextSibling : tgt);
    els.forEach(x => { if (x === drag.el) return; const o = before.get(x), n = x.getBoundingClientRect(); if (o.left !== n.left || o.top !== n.top) x.animate([{ transform: `translate(${o.left - n.left}px, ${o.top - n.top}px)` }, { transform: "none" }], { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" }); });
  });
  // пока тянем пальцем — страница не прокручивается
  page.addEventListener("touchmove", e => { if (drag && drag.on) e.preventDefault(); }, { passive: false });
  const endDrag = () => {
    if (!drag) return; clearTimeout(drag.timer);
    if (drag.on) {
      const order = photoEls().map(x => +x.dataset.i), moved = order.some((v, i) => v !== i);
      drag.ghost.remove(); page.classList.remove("is-sorting");
      const stop = ev => { ev.stopPropagation(); ev.preventDefault(); }; page.addEventListener("click", stop, { capture: true, once: true }); setTimeout(() => page.removeEventListener("click", stop, true), 60);
      drag = null;
      if (moved) { d.photos = order.map(i => d.photos[i]); saveDraft(); }
      render();
    } else drag = null;
  };
  addEventListener("pointerup", endDrag); addEventListener("pointercancel", endDrag);
  page.addEventListener("contextmenu", e => { if (e.target.closest(".photo[data-i]")) e.preventDefault(); });
  function publish() {
    const p = problems(); if (p.length) return VO.toast(p[0]);
    if (busy) return VO.toast("Подождите — фото ещё обрабатываются");
    const u = VO.user(), ad = toAd(); limits();
    const lim = VO.restrict && VO.restrict("noPost"); if (lim) return VO.toast(`Размещение объявлений ограничено ${VO.adm.until(lim)}${lim.reason ? ". Причина: " + lim.reason : ""}`, 5000);
    // проверка модератором: если включена в правилах или объявление раньше отклоняли
    const old = editId && S.mine.find(a => a.id === editId), rc = VO.adm ? VO.adm.cfg() : {}, rec = VO.adm ? VO.adm.u(VO.uid(u.email)) : {};
    if (old && old.adm && old.adm.locked) return VO.toast("Редактирование этого объявления закрыто модератором. Напишите в поддержку");
    // проверка: всем, новым аккаунтам или первым N объявлениям; «доверенным» — без проверки
    const ageDays = (Date.now() - (u.created || 0)) / 864e5, count = S.mine.filter(a => a.owner === u.email).length;
    const premod = !rec.trusted && (rc.premod || (rc.premodNewDays && ageDays < rc.premodNewDays) || (rc.premodFirstN && count < rc.premodFirstN + (editId ? 1 : 0)));
    ad.mod = premod || (old && old.mod === "rejected") ? "pending" : old ? old.mod : undefined;
    if (old && old.mod === "rejected" && old.adm) { old.adm = { ...old.adm }; delete old.adm.reason; }
    if (!editId && S.mine.filter(a => a.owner === u.email && Date.now() - (a.first || a.created) < 864e5).length >= DAY_LIMIT) return VO.toast(`Можно размещать до ${DAY_LIMIT} объявлений в сутки. Попробуйте завтра`);
    if (editId) { const i = S.mine.findIndex(a => a.id === editId), old = S.mine[i]; S.mine[i] = { ...old, ...ad, id: editId, owner: u.email, created: old.created, first: old.first || old.created, status: old.status }; }
    else S.mine.unshift({ ...ad, id: "m" + Date.now(), owner: u.email, created: Date.now(), first: Date.now(), status: "active" });
    if (!VO.saveMine()) { if (!editId) S.mine.shift(); return VO.toast("Не хватает места в браузере — уберите пару фото"); }
    store.del("vo_draft_" + S.session);
    VO.emit("mine"); VO.search.build();
    if (ad.mod === "pending") { VO.addNote("Объявление на проверке", `«${ad.title}» появится в ленте после проверки модератором`, { cat: "ads", link: "#/me/ads" }); VO.toast("Отправили на проверку — обычно это занимает немного времени", 4000); }
    else { VO.addNote(editId ? "Объявление обновлено" : "Объявление опубликовано", `«${ad.title}»`, { cat: "ads", link: "#/ad/" + (editId || S.mine[0].id) }); VO.toast(editId ? "Изменения сохранены" : "Опубликовано! Объявление уже в ленте"); }
    location.hash = "#/ad/" + (editId || S.mine[0].id);
  }

  VO.routes.post = (p, q) => {
    if (!VO.user()) return VO.needLogin(location.hash, "Войдите, чтобы разместить объявление");
    limits();
    const lim = VO.restrict && VO.restrict("noPost"); if (lim) { VO.toast(`Размещение объявлений ограничено ${VO.adm.until(lim)}${lim.reason ? ". Причина: " + lim.reason : ""}`, 5000); location.hash = "#/me"; return; }
    const id = q.get("edit");
    if (id) {
      const ad = S.mine.find(a => a.id === id && a.owner === VO.user().email);
      if (!ad) { VO.toast("Это объявление нельзя редактировать"); location.hash = "#/me/ads"; return; }
      if (ad.adm && ad.adm.locked) { VO.toast("Редактирование этого объявления закрыто модератором"); location.hash = "#/me/ads"; return; }
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
