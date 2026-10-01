/* Отзывы. У каждого две роли: как о продавце и как о покупателе.
   «Сделка на сайте» — если между людьми есть завершённая сделка в переписке. Иначе — «Без сделки на сайте». */
(() => {
  const { $, $$, esc, store } = VO;
  let own = store.get("vo_reviews", []);
  const seed = (window.VO_REVIEWS_SEED || []).map((r, i) => ({ id: "seed" + i, author: "x" + i, t: Date.now() - r.d * 864e5, ...r }));
  // модерация: скрытые и удалённые админом отзывы не показываем
  let mod = store.get("vo_adm_rev", {});
  const raw = () => [...own, ...seed].map(r => mod[r.id] ? { ...r, ...mod[r.id] } : r).filter(r => !r.deleted);
  const all = () => raw().filter(r => !r.hidden);
  const save = () => { store.set("vo_reviews", own); VO.emit("reviews"); };
  const star = (n, size = 16) => `<span class="stars" style="--s:${size}px" aria-label="${n} из 5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= Math.round(n) ? "on" : ""}">★</i>`).join("")}</span>`;
  const doneDeal = (me, peer, peerRole) => VO.chats && VO.chats.all().some(c => c.owner && VO.uid(c.owner) === me && c.peer === peer && c.deal && c.deal.stage === "done" && (peerRole === "seller" ? c.role === "buyer" : c.role === "seller"));

  const R = VO.reviews = {
    of: (id, role) => all().filter(r => r.target === id && (!role || r.role === role)).sort((a, b) => b.t - a.t),
    by: id => own.filter(r => r.author === id).sort((a, b) => b.t - a.t),
    has: (author, target, role) => own.some(r => r.author === author && r.target === target && r.role === role),
    add(r) {
      const ex = own.find(x => x.author === r.author && x.target === r.target && x.role === r.role);
      const rid = ex ? ex.id : "r" + Date.now().toString(36);
      if (ex) Object.assign(ex, r, { t: Date.now(), edited: true }); else own.unshift({ id: rid, t: Date.now(), ...r });
      // предмодерация отзывов: скрыт, пока модератор не одобрит
      if (VO.adm && VO.adm.cfg().reviewsPremod) { mod[rid] = { ...(mod[rid] || {}), hidden: true, pending: true }; store.set("vo_adm_rev", mod); }
      save();
      if (r.target === VO.me()) VO.addNote("Новый отзыв", `${r.authorName} оценил(а) вас на ${r.stars} из 5`, { cat: "review", link: "#/me/reviews" });
    },
    star,
    adminAll: () => [...own, ...seed].map(r => mod[r.id] ? { ...r, ...mod[r.id] } : r),
    adminSet(id, patch) { mod[id] = { ...(mod[id] || {}), ...patch }; Object.keys(mod[id]).forEach(k => mod[id][k] == null && delete mod[id][k]); store.set("vo_adm_rev", mod); VO.emit("reviews"); },
  };
  VO.rating = (id, role) => { const l = R.of(id, role); return { n: l.length, avg: l.length ? l.reduce((s, r) => s + r.stars, 0) / l.length : 0 }; };
  VO.rating.short = id => { const r = VO.rating(id); return r.n ? ` · ★ ${r.avg.toFixed(1).replace(".", ",")}` : ""; };
  VO.rating.badge = id => { const r = VO.rating(id); return r.n ? `<span class="rate">${star(r.avg, 13)}<b>${r.avg.toFixed(1).replace(".", ",")}</b><small>${r.n} ${VO.plural(r.n, "отзыв", "отзыва", "отзывов")}</small></span>` : `<span class="rate rate--none">Отзывов пока нет</span>`; };

  /* Блок отзывов для публичного профиля */
  R.block = (id, state = {}) => {
    const role = state.role || "all", onlyV = !!state.v;
    const list = R.of(id, role === "all" ? null : role).filter(r => !onlyV || r.verified);
    const total = R.of(id), avg = VO.rating(id).avg;
    const dist = [5, 4, 3, 2, 1].map(s => [s, total.filter(r => r.stars === s).length]);
    const meId = VO.me(), canWrite = meId && meId !== id;
    return `<section class="revs" data-revs="${id}">
      <div class="revs__sum"><div class="revs__big"><b>${total.length ? avg.toFixed(1).replace(".", ",") : "—"}</b>${star(avg, 20)}<span>${total.length} ${VO.plural(total.length, "отзыв", "отзыва", "отзывов")}</span></div>
        <div class="revs__dist">${dist.map(([s, n]) => `<div><span>${s}★</span><i><em style="width:${total.length ? n / total.length * 100 : 0}%"></em></i><small>${n}</small></div>`).join("")}</div>
        <div class="revs__roles"><div><small>Как продавец</small>${VO.rating(id, "seller").n ? `<b>${VO.rating(id, "seller").avg.toFixed(1).replace(".", ",")}</b> · ${VO.rating(id, "seller").n}` : "<b>—</b>"}</div><div><small>Как покупатель</small>${VO.rating(id, "buyer").n ? `<b>${VO.rating(id, "buyer").avg.toFixed(1).replace(".", ",")}</b> · ${VO.rating(id, "buyer").n}` : "<b>—</b>"}</div><div><small>Подтверждены сделкой</small><b>${total.filter(r => r.verified).length}</b> из ${total.length}</div></div>
        ${canWrite ? `<button class="btn btn--ink" type="button" data-rev-write="${id}">Оставить отзыв</button>` : ""}</div>
      <div class="revs__bar"><div class="chips chips--s">${[["all", "Все"], ["seller", "Как о продавце"], ["buyer", "Как о покупателе"]].map(([k, n]) => `<button type="button" data-rev-role="${k}" aria-pressed="${role === k}">${n}</button>`).join("")}</div>
        <label class="switch-l"><input type="checkbox" data-rev-v${onlyV ? " checked" : ""}><span class="sw"></span>Только со сделкой на сайте</label></div>
      <div class="revs__list">${list.length ? list.map(card).join("") : `<div class="cab-empty"><b>Отзывов пока нет</b><span>${canWrite ? "Будьте первым — расскажите, как прошло общение." : "Они появятся после первых сделок."}</span></div>`}</div></section>`;
  };
  function card(r) {
    return `<article class="rev"><header><span class="rev__ava">${esc(r.authorName[0])}</span><span class="rev__w"><b>${esc(r.authorName)}</b><small>${new Date(r.t).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}${r.edited ? " · изменён" : ""}</small></span>${star(r.stars)}</header>
      <div class="rev__tags"><span class="rev__role">${r.role === "seller" ? "Отзыв о продавце" : "Отзыв о покупателе"}</span>${r.verified ? `<span class="rev__v">✓ Сделка на сайте${r.ad ? ` · ${r.role === "seller" ? "купил(а)" : "продал(а) ему/ей"} «${esc(r.ad)}»` : ""}</span>` : `<span class="rev__nv">Без сделки на сайте</span>`}</div>
      <p>${esc(r.text)}</p>${r.reply ? `<div class="rev__reply"><b>Ответ</b>${esc(r.reply)}</div>` : ""}
      ${r.target === VO.me() && !r.reply && !String(r.id).startsWith("seed") ? `<button class="link" type="button" data-rev-reply="${r.id}">Ответить</button>` : ""}</article>`;
  }
  R.card = card;

  /* Форма отзыва */
  R.form = (target, presetRole) => {
    const me = VO.me(); if (!me) return VO.needLogin(location.hash, "Войдите, чтобы оставить отзыв");
    if (me === target) return VO.toast("О себе отзыв оставить нельзя");
    const p = VO.person(target);
    const role0 = presetRole || "seller";
    const ex = own.find(x => x.author === me && x.target === target && x.role === role0);
    const el = VO.sheet(`<form class="revf" id="revF"><h3>Отзыв о ${esc(p.name)}</h3>
      <div class="seg seg--sm" role="tablist" id="revRole"><button role="tab" type="button" data-r="seller" aria-selected="${role0 === "seller"}">Как о продавце</button><button role="tab" type="button" data-r="buyer" aria-selected="${role0 === "buyer"}">Как о покупателе</button><span class="seg__ink"></span></div>
      <div class="revf__v" id="revV"></div>
      <div class="revf__stars" id="revS" role="radiogroup" aria-label="Оценка">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-s="${i}" role="radio" aria-label="${i} из 5">★</button>`).join("")}<span id="revSL"></span></div>
      <div class="field field--area"><textarea id="revT" rows="4" maxlength="1000" placeholder=" ">${ex ? esc(ex.text) : ""}</textarea><label for="revT">Что понравилось или нет</label><em>Минимум 10 символов</em></div>
      <small class="muted">Пишите по делу и без оскорблений. Отзывы проверяем и удаляем, если они нарушают правила.</small>
      <button class="btn btn--accent btn--wide" type="submit">${ex ? "Обновить отзыв" : "Опубликовать отзыв"}</button></form>`, { cls: "sheet--sm" });
    let role = role0, stars = ex ? ex.stars : 0;
    const L = ["", "Плохо", "Так себе", "Нормально", "Хорошо", "Отлично"];
    const paintS = () => { $$("#revS [data-s]", el).forEach(b => b.classList.toggle("on", +b.dataset.s <= stars)); $("#revSL", el).textContent = L[stars] || "Поставьте оценку"; };
    const paintV = () => { const v = doneDeal(me, target, role); $("#revV", el).innerHTML = v ? `<span class="rev__v">✓ Будет отмечен «Сделка на сайте»</span>` : `<span class="rev__nv">Сделки на сайте не было — отзыв будет с отметкой «Без сделки на сайте»</span>`; };
    paintS(); paintV(); requestAnimationFrame(VO.syncInks);
    VO.guard.trap($("#revF", el));
    $("#revRole", el).addEventListener("click", e => { const b = e.target.closest("[data-r]"); if (!b) return; role = b.dataset.r; VO.selectTab($("#revRole", el), b); paintV(); });
    $("#revS", el).addEventListener("click", e => { const b = e.target.closest("[data-s]"); if (b) { stars = +b.dataset.s; paintS(); } });
    $("#revS", el).addEventListener("mouseover", e => { const b = e.target.closest("[data-s]"); if (b) $$("#revS [data-s]", el).forEach(x => x.classList.toggle("hov", +x.dataset.s <= +b.dataset.s)); });
    $("#revS", el).addEventListener("mouseleave", () => $$("#revS [data-s]", el).forEach(x => x.classList.remove("hov")));
    $("#revF", el).addEventListener("submit", e => {
      e.preventDefault();
      const G = VO.guard, text = G.clean($("#revT", el).value, { multiline: true, maxLines: 15 }).slice(0, 1000);
      if (!stars) return VO.toast("Поставьте оценку от 1 до 5");
      if (!G.field($("#revT", el), "review", { min: 10 })) return;
      const bot = G.isBot(e.target); if (bot) return VO.toast(bot);
      if (!ex) { const w = G.rate("review", 5, 864e5); if (w) return VO.toast(`Можно оставить до 5 отзывов в сутки. Попробуйте через ${G.wait(w)}`); }
      const rc = VO.adm ? VO.adm.cfg() : {};
      if (rc.reviewsOnlyDeal && !doneDeal(me, target, role)) return VO.toast("Отзыв можно оставить только после сделки на сайте — так решили правила сайта", 4500);
      const u = VO.user(), deal = doneDeal(me, target, role) && VO.chats.all().find(c => VO.uid(c.owner) === me && c.peer === target && c.deal && c.deal.stage === "done");
      R.add({ target, author: me, authorName: VO.displayName(u) || u.name, role, stars, text, verified: !!deal, ad: deal ? deal.ad.title : null });
      VO.closeSheet(true); VO.toast(rc.reviewsPremod ? "Спасибо! Отзыв появится после проверки модератором" : "Спасибо! Отзыв опубликован"); VO.emit("reviews-ui");
    });
  };
  document.addEventListener("click", e => {
    const w = e.target.closest("[data-rev-write]"); if (w) return R.form(w.dataset.revWrite);
    const box = e.target.closest("[data-revs]");
    const rr = e.target.closest("[data-rev-role]"); if (rr && box) { box.outerHTML = R.block(box.dataset.revs, { role: rr.dataset.revRole, v: !!$("[data-rev-v]", box).checked }); return; }
    const rp = e.target.closest("[data-rev-reply]");
    if (rp) {
      const r = own.find(x => x.id === rp.dataset.revReply); if (!r) return;
      const el = VO.sheet(`<form id="rpl"><h3>Ответ на отзыв</h3><p class="muted">Ответ увидят все. Спокойно и по делу — так вы вызовете больше доверия.</p><div class="field field--area"><textarea id="rplT" rows="4" maxlength="600" placeholder=" "></textarea><label for="rplT">Ваш ответ</label><em>Проверьте текст</em></div><button class="btn btn--ink btn--wide" type="submit">Ответить</button></form>`, { cls: "sheet--sm" });
      $("#rpl", el).addEventListener("submit", ev => { ev.preventDefault(); const G = VO.guard; if (!G.field($("#rplT", el), "reply", { min: 3 })) return; r.reply = G.clean($("#rplT", el).value, { multiline: true, maxLines: 10 }).slice(0, 600); save(); VO.closeSheet(true); VO.emit("reviews-ui"); VO.toast("Ответ опубликован"); });
    }
  });
  document.addEventListener("change", e => { const v = e.target.closest("[data-rev-v]"); const box = v && v.closest("[data-revs]"); if (box) { const role = ($("[data-rev-role][aria-pressed=true]", box) || {}).dataset?.revRole || "all"; box.outerHTML = R.block(box.dataset.revs, { role, v: v.checked }); } });
  VO.on("reviews-ui", () => VO.rerender());
})();
