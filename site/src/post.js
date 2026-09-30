/* Размещение и редактирование объявления */
(() => {
  const { $, $$, esc, state: S } = VO;
  const page = VO.page("post");
  const MAX_PHOTOS = 5, DAY_LIMIT = 10;
  // Базовая модерация до сервера: запрещённое, ссылки и телефоны в тексте
  const BANNED = /(оружи|пистолет|патрон|наркот|спайс|соль для ванн|закладк|поддельн|фальшив|паспорт.*продам|рецептурн|психотроп|взрывчат|краденн)/i;
  const LINK = /(https?:\/\/|www\.|t\.me\/|\.ru\b|\.com\b|wa\.me)/i;
  const PHONE = /(\+?7|8)[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/;
  let photos = [], editId = null;

  function attrFields(cat, attrs = {}) {
    const defs = (window.VO_FILTERS[cat] || []);
    if (!defs.length) return "";
    return `<div class="attrs"><h4>Характеристики</h4>${defs.map(d => {
      if (d.t === "chips") return `<div class="attr"><span>${d.n}</span><div class="topics">${d.o.map(o => `<label><input type="radio" name="at_${d.k}" value="${esc(o)}"${attrs[d.k] === o ? " checked" : ""}><span>${esc(o)}</span></label>`).join("")}</div></div>`;
      if (d.t === "range") return `<div class="field"><input data-attr="${d.k}" inputmode="numeric" placeholder=" " value="${attrs[d.k] != null ? attrs[d.k] : ""}"><label>${d.n}</label></div>`;
      if (d.t === "toggle") return `<label class="switch-l"><input type="checkbox" data-attr="${d.k}"${attrs[d.k] ? " checked" : ""}><span class="sw"></span>${d.n}</label>`;
    }).join("")}</div>`;
  }

  function render(ad) {
    photos = ad ? [...(ad.photos || (ad.photo ? [ad.photo] : []))] : [];
    editId = ad ? ad.id : null;
    page.innerHTML = `<div class="wrap">
      <header class="ph"><span class="ph__eyebrow">${ad ? "Редактирование" : "Новое объявление"}</span><h1 class="ph__title">${ad ? "Обновите объявление" : "Расскажите, что продаёте"}</h1></header>
      <div class="post-l">
        <form class="form" id="postForm" novalidate>
          <fieldset class="pick" id="postCat"><legend>Категория</legend>${VO.CATS.map(c => `<label><input type="radio" name="cat" value="${c.id}"${ad && ad.cat === c.id ? " checked" : ""}><span>${c.icon}${c.name}</span></label>`).join("")}</fieldset>
          <div class="field"><input id="pTitle" maxlength="70" placeholder=" " value="${ad ? esc(ad.title) : ""}"><label for="pTitle">Название</label><em>Минимум 5 символов — например, «Велосипед детский, 20″»</em><small class="count" id="pTitleC">${ad ? ad.title.length : 0} / 70</small></div>
          <div id="pAttrs">${ad ? attrFields(ad.cat, ad.attrs) : ""}</div>
          <div class="row2">
            <div class="field"><input id="pPrice" inputmode="numeric" placeholder=" " value="${ad && ad.price ? ad.price.toLocaleString("ru-RU") : ""}"${ad && ad.price === 0 ? " disabled" : ""}><label for="pPrice">Цена, ₽</label><em>Укажите цену или отметьте «Отдам даром»</em></div>
            <label class="switch-l"><input type="checkbox" id="pFree"${ad && ad.price === 0 ? " checked" : ""}><span class="sw"></span>Отдам даром</label>
            <label class="switch-l"><input type="checkbox" id="pBargain"${ad && ad.bargain ? " checked" : ""}><span class="sw"></span>Торг</label>
          </div>
          <fieldset class="topics" id="pCond"><legend>Состояние</legend>${["Новое", "Б/у"].map(c => `<label><input type="radio" name="cond" value="${c}"${(ad ? ad.cond : "Б/у") === c ? " checked" : ""}><span>${c}</span></label>`).join("")}</fieldset>
          <div class="field field--area"><textarea id="pDesc" rows="6" maxlength="3000" placeholder=" ">${ad ? esc(ad.desc || "") : ""}</textarea><label for="pDesc">Описание</label><em id="pDescE">Проверьте описание</em><small class="count" id="pDescC">${ad ? (ad.desc || "").length : 0} / 3000</small></div>
          <div class="photos" id="pPhotos"></div>
          <div class="post-warn" id="postWarn" hidden></div>
          <button class="btn btn--accent btn--wide btn--lg" type="submit">${ad ? "Сохранить изменения" : "Опубликовать"}</button>
          <small class="auth__fine">Публикуя, вы соглашаетесь с <a href="#/doc/rules">Правилами размещения</a>. ${VO.DEMO ? "Пока нет сервера, объявление видно только в этом браузере." : ""}</small>
        </form>
        <aside class="post-prev">
          <span class="post-prev__lbl">Так увидят покупатели</span>
          <div id="postPrev" class="no-open"></div>
          <div class="quality" id="quality"></div>
        </aside>
      </div></div>`;
    drawPhotos(); drawPrev();
    VO.show("post", ad ? "Редактирование" : "Разместить объявление");
  }

  const f = () => $("#postForm", page);
  function draft() {
    const form = f(), cat = (form.querySelector("input[name=cat]:checked") || {}).value || null;
    const free = $("#pFree", form).checked, attrs = {};
    (window.VO_FILTERS[cat] || []).forEach(d => {
      if (d.t === "chips") { const r = form.querySelector(`input[name="at_${d.k}"]:checked`); if (r) attrs[d.k] = r.value; }
      if (d.t === "range") { const v = form.querySelector(`[data-attr="${d.k}"]`); if (v && v.value) attrs[d.k] = +v.value.replace(/\D/g, ""); }
      if (d.t === "toggle") { const v = form.querySelector(`[data-attr="${d.k}"]`); if (v && v.checked) attrs[d.k] = true; }
    });
    const u = VO.user() || {};
    return {
      id: editId || "draft", cat: cat || "tech", title: $("#pTitle", form).value.trim(), attrs,
      price: free ? 0 : +($("#pPrice", form).value.replace(/\D/g, "") || 0), bargain: !free && $("#pBargain", form).checked,
      per: cat === "job" ? "мес" : cat === "service" ? "выезд" : null,
      cond: free ? "Даром" : cat === "job" ? "Работа" : cat === "service" ? "Услуга" : form.querySelector("input[name=cond]:checked").value,
      city: u.city || (window.VO_CITY ? window.VO_CITY() : "Москва"), created: Date.now(), owner: u.email,
      desc: $("#pDesc", form).value.trim(), photos, photo: photos[0] || null, ill: window.VO_CAT_ILL[cat || "tech"], bg: window.VO_CAT_BG[cat || "tech"], _cat: cat,
    };
  }
  function drawPrev() {
    const d = draft();
    $("#postPrev", page).innerHTML = VO.cardHTML({ ...d, title: d.title || "Название объявления" }).replace('class="card', 'class="card in');
    const q = [["Категория", !!d._cat], ["Название от 10 символов", d.title.length >= 10], ["Цена или «даром»", d.price > 0 || $("#pFree", page).checked], ["Характеристики", Object.keys(d.attrs).length >= Math.min(2, (window.VO_FILTERS[d._cat] || []).length)], ["Описание от 60 символов", d.desc.length >= 60], ["Хотя бы одно фото", photos.length > 0]];
    const pct = Math.round(q.filter(x => x[1]).length / q.length * 100);
    $("#quality", page).innerHTML = `<div class="quality__h"><b>Качество объявления</b><span>${pct}%</span></div><div class="quality__bar"><i style="width:${pct}%"></i></div><ul>${q.map(([n, ok]) => `<li class="${ok ? "ok" : ""}">${n}</li>`).join("")}</ul><small>${pct === 100 ? "Отлично! Такие объявления продаются быстрее." : "Заполненные объявления получают больше откликов."}</small>`;
  }
  function drawPhotos() {
    $("#pPhotos", page).innerHTML = photos.map((p, i) => `<div class="photo${i === 0 ? " photo--cover" : ""}"><img src="${p}" alt="Фото ${i + 1}">${i === 0 ? "<em>Обложка</em>" : `<button type="button" data-cover="${i}" class="photo__b" title="Сделать обложкой">★</button>`}<button type="button" data-rm="${i}" class="photo__x" aria-label="Удалить фото">×</button></div>`).join("")
      + (photos.length < MAX_PHOTOS ? `<label class="drop" id="pDrop"><input type="file" id="pPhoto" accept="image/jpeg,image/png,image/webp" multiple hidden><span class="drop__ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="12" cy="12" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/></svg></span><span><b>${photos.length ? "Ещё фото" : "Добавьте фото"}</b><small>До ${MAX_PHOTOS} штук, JPG или PNG. Данные о месте съёмки удаляем.</small></span></label>` : "");
  }
  function takePhoto(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return VO.toast("Подойдут только JPG, PNG или WebP");
    if (file.size > 15e6) return VO.toast("Фото больше 15 МБ — выберите поменьше");
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      // пересохраняем через canvas: уменьшаем и заодно удаляем EXIF с координатами
      const k = Math.min(1, 900 / Math.max(img.width, img.height)), cv = document.createElement("canvas");
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      if (photos.length < MAX_PHOTOS) photos.push(cv.toDataURL("image/jpeg", .78));
      drawPhotos(); drawPrev();
    };
    img.onerror = () => VO.toast("Не получилось открыть это изображение");
    img.src = url;
  }
  page.addEventListener("input", e => {
    const t = e.target;
    if (t.name === "cat") { $("#postCat", page).classList.remove("bad"); $("#pAttrs", page).innerHTML = attrFields(t.value); }
    if (t.id === "pPrice") t.value = t.value.replace(/\D/g, "").slice(0, 10).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if (t.dataset.attr && t.type !== "checkbox") t.value = t.value.replace(/\D/g, "").slice(0, 9);
    if (t.id === "pTitle") $("#pTitleC", page).textContent = `${t.value.length} / 70`;
    if (t.id === "pDesc") $("#pDescC", page).textContent = `${t.value.length} / 3000`;
    const fl = t.closest(".field"); if (fl) fl.classList.remove("bad");
    $("#postWarn", page).hidden = true;
    drawPrev();
  });
  page.addEventListener("change", e => {
    if (e.target.id === "pFree") { const p = $("#pPrice", page); p.disabled = e.target.checked; if (e.target.checked) { p.value = ""; $("#pBargain", page).checked = false; } drawPrev(); }
    if (e.target.id === "pPhoto") { [...e.target.files].slice(0, MAX_PHOTOS - photos.length).forEach(takePhoto); }
  });
  page.addEventListener("click", e => {
    const rm = e.target.closest("[data-rm]"); if (rm) { photos.splice(+rm.dataset.rm, 1); drawPhotos(); drawPrev(); }
    const cv = e.target.closest("[data-cover]"); if (cv) { const [p] = photos.splice(+cv.dataset.cover, 1); photos.unshift(p); drawPhotos(); drawPrev(); }
  });
  ["dragover", "dragenter"].forEach(ev => page.addEventListener(ev, e => { const d = e.target.closest(".drop"); if (d) { e.preventDefault(); d.classList.add("over"); } }));
  page.addEventListener("dragleave", e => { const d = e.target.closest(".drop"); if (d) d.classList.remove("over"); });
  page.addEventListener("drop", e => { const d = e.target.closest(".drop"); if (d) { e.preventDefault(); d.classList.remove("over"); [...e.dataTransfer.files].slice(0, MAX_PHOTOS - photos.length).forEach(takePhoto); } });

  page.addEventListener("submit", e => {
    e.preventDefault();
    const d = draft(), form = f(), warn = $("#postWarn", page);
    const hasCat = !!d._cat; $("#postCat", page).classList.toggle("bad", !hasCat);
    const ok = [hasCat, VO.check($("#pTitle", form).parentElement, d.title.length >= 5), VO.check($("#pPrice", form).parentElement, $("#pFree", form).checked || (d.price > 0 && d.price < 1e10))].every(Boolean);
    if (!ok) { VO.toast("Проверьте выделенные поля"); form.querySelector(".bad").scrollIntoView({ block: "center", behavior: "smooth" }); return; }
    const text = d.title + " " + d.desc;
    const problem = BANNED.test(text) ? "Похоже, это товар из списка запрещённых. Такие объявления мы не публикуем — см. Правила размещения."
      : LINK.test(text) ? "Уберите ссылки из текста: переходы на сторонние сайты — частый приём мошенников."
      : PHONE.test(text) ? "Не пишите телефон в тексте. Если хотите, чтобы вам звонили, включите показ номера в профиле — так номер увидят только вошедшие пользователи."
      : null;
    if (problem) { warn.hidden = false; warn.textContent = problem; warn.scrollIntoView({ block: "center", behavior: "smooth" }); return; }
    const u = VO.user();
    if (!editId) {
      const recent = S.mine.filter(a => a.owner === u.email && Date.now() - (a.first || a.created) < 864e5).length;
      if (recent >= DAY_LIMIT) { warn.hidden = false; warn.textContent = `Можно размещать до ${DAY_LIMIT} объявлений в сутки — это защищает ленту от спама. Попробуйте завтра.`; return; }
    }
    const clean = { ...d }; delete clean._cat;
    if (editId) {
      const i = S.mine.findIndex(a => a.id === editId), old = S.mine[i];
      S.mine[i] = { ...old, ...clean, id: editId, created: old.created, first: old.first || old.created, status: old.status };
    } else S.mine.unshift({ ...clean, id: "m" + Date.now(), first: Date.now(), status: "active" });
    if (!VO.saveMine()) { if (!editId) S.mine.shift(); return VO.toast("Не хватает места в браузере — уберите одно-два фото"); }
    VO.emit("mine"); VO.search.build();
    VO.addNote(editId ? "Объявление обновлено" : "Объявление опубликовано", `«${clean.title}»`);
    VO.toast(editId ? "Изменения сохранены" : "Опубликовано! Объявление уже в ленте");
    location.hash = "#/ad/" + (editId || S.mine[0].id);
  });

  VO.routes.post = (p, q) => {
    if (!VO.user()) return VO.needLogin(location.hash, "Войдите, чтобы разместить объявление");
    const id = q.get("edit");
    if (id) { const ad = S.mine.find(a => a.id === id && a.owner === VO.user().email); if (!ad) { VO.toast("Это объявление нельзя редактировать"); location.hash = "#/me/ads"; return; } return render(ad); }
    render(null);
  };
})();
