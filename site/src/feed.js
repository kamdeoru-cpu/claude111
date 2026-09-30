/* Лента: главная, категории с фильтрами, результаты поиска. Фильтры хранятся в адресе — ссылкой можно поделиться. */
(() => {
  const { $, $$, esc, state: S } = VO;
  const FILTERS = window.VO_FILTERS;
  const SORTS = [["new", "Сначала новые"], ["cheap", "Дешевле"], ["dear", "Дороже"], ["pop", "Популярные"]];
  let ctx = { mode: "home", cat: null, q: null, p: null, tab: "all", sort: "new", F: {} };

  const page = VO.page("home", `
    <div class="wrap">
      <nav class="crumbs" id="crumbs" hidden></nav>
      <div class="cat-hero" id="catHero" hidden></div>
      <div class="feed-head">
        <div><h1 class="feed-title" id="feedTitle"></h1><p class="feed-sub" id="feedSub"></p></div>
        <div class="feed-tools">
          <div class="tabs" role="tablist" id="feedTabs">
            <button role="tab" data-tab="all" aria-selected="true">Все</button><button role="tab" data-tab="new">Новые</button>
            <button role="tab" data-tab="free">Даром</button><button role="tab" data-tab="city">В моём городе</button><span class="tabs__ink" aria-hidden="true"></span>
          </div>
          <button class="btn btn--ghost btn--sm" type="button" id="saveSearch" hidden><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4Z"/></svg><span>Сохранить поиск</span></button>
          <div class="sort" id="sort"><button type="button" class="sort__b" aria-haspopup="listbox" aria-expanded="false"><span>Сначала новые</span><svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
            <ul class="sort__m" role="listbox">${SORTS.map(([k, n]) => `<li><button type="button" role="option" data-sort="${k}">${n}</button></li>`).join("")}</ul></div>
          <button class="btn btn--ink btn--sm f-open" type="button" id="fOpen" hidden>Фильтры <b id="fCount"></b></button>
        </div>
      </div>
      <div class="list-l" id="listL">
        <aside class="filters" id="filters" aria-label="Фильтры"></aside>
        <div class="list-main">
          <div class="active-f" id="activeF"></div>
          <div class="grid" id="grid"></div>
          <div class="empty" id="empty" hidden>
            <svg width="140" height="110" viewBox="0 0 140 110" aria-hidden="true"><path d="M24 16h60a30 30 0 0 1 0 60H48L24 98Z" fill="#F4F5F7"/><circle cx="62" cy="46" r="16" fill="none" stroke="#16181D" stroke-width="6"/><path d="m74 58 14 14" stroke="#FF4F3A" stroke-width="7" stroke-linecap="round"/></svg>
            <b id="emptyT">Ничего не нашлось</b><span id="emptyS">Попробуйте смягчить фильтры или поищите в другой категории.</span>
            <div class="empty__acts"><a class="btn btn--ink" href="#/">Все объявления</a><a class="btn btn--ghost" href="#/post">Разместить своё</a></div>
          </div>
        </div>
      </div>
    </div>`);

  /* ---------- фильтры: разбор и сборка адреса ---------- */
  const defsFor = cat => [...FILTERS._common, ...(cat ? FILTERS[cat] || [] : [])];
  function readF(params, cat) {
    const F = {};
    defsFor(cat).forEach(d => {
      const v = params.get(d.k); if (v == null) return;
      if (d.t === "chips") F[d.k] = v.split(",").filter(Boolean);
      if (d.t === "range") { const [a, b] = v.split("-").map(x => x === "" ? null : +x); F[d.k] = [a, b]; }
      if (d.t === "toggle") F[d.k] = v === "1";
    });
    return F;
  }
  function qsOf() {
    const p = new URLSearchParams();
    if (ctx.mode === "search" && ctx.cat) p.set("cat", ctx.cat);
    Object.entries(ctx.F).forEach(([k, v]) => {
      if (Array.isArray(v) && typeof v[0] === "string") { if (v.length) p.set(k, v.join(",")); }
      else if (Array.isArray(v)) { if (v[0] != null || v[1] != null) p.set(k, `${v[0] ?? ""}-${v[1] ?? ""}`); }
      else if (v) p.set(k, "1");
    });
    if (ctx.sort !== "new") p.set("sort", ctx.sort);
    const s = p.toString().replace(/%2C/g, ",");
    return s ? "?" + s : "";
  }
  const base = () => ctx.mode === "cat" ? `#/c/${ctx.cat}` : ctx.mode === "search" ? `#/s/${encodeURIComponent(ctx.q)}` : "#/";
  const pushUrl = () => history.replaceState(null, "", base() + qsOf());
  const val = (a, d) => d.root || d.k === "price" ? a[d.k] : (a.attrs || {})[d.k];
  function pass(a, F, cat, skip) {
    for (const d of defsFor(cat)) {
      if (d.k === skip) continue;
      const f = F[d.k]; if (f == null) continue;
      const v = val(a, d);
      if (d.t === "chips" && f.length && !f.includes(String(v))) return false;
      if (d.t === "range") { if (f[0] != null && !(v >= f[0])) return false; if (f[1] != null && !(v <= f[1])) return false; }
      if (d.t === "toggle" && f && !v) return false;
    }
    return true;
  }

  /* ---------- выборка ---------- */
  function scope() {
    let list;
    if (ctx.mode === "search") list = VO.search.run(ctx.p);
    else list = VO.allAds();
    if (ctx.cat) list = list.filter(a => a.cat === ctx.cat);
    if (ctx.mode === "home") {
      const city = window.VO_CITY ? window.VO_CITY() : "Москва";
      if (ctx.tab === "new") list = list.filter(a => VO.minutesAgo(a) < 180);
      if (ctx.tab === "free") list = list.filter(a => a.price === 0);
      if (ctx.tab === "city" && city !== "Вся Россия") list = list.filter(a => a.city === city);
    }
    return list;
  }
  const sorted = list => {
    const l = [...list];
    if (ctx.sort === "new") l.sort((a, b) => VO.minutesAgo(a) - VO.minutesAgo(b));
    if (ctx.sort === "cheap") l.sort((a, b) => a.price - b.price);
    if (ctx.sort === "dear") l.sort((a, b) => b.price - a.price);
    if (ctx.sort === "pop") l.sort((a, b) => VO.views(b) - VO.views(a));
    if (ctx.mode === "search" && ctx.sort === "new") return list; // по релевантности
    return l;
  };

  /* ---------- панель фильтров ---------- */
  const nice = n => n >= 1e6 ? (n / 1e6).toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + " млн" : n >= 1e4 ? Math.round(n / 1e3) + " тыс" : n.toLocaleString("ru-RU");
  function renderFilters(all) {
    const box = $("#filters");
    if (ctx.mode === "home") { box.innerHTML = ""; return; }
    const defs = defsFor(ctx.cat);
    let html = `<div class="filters__head"><b>Фильтры</b><button type="button" class="link" data-reset>Сбросить</button><button type="button" class="filters__x" data-fclose aria-label="Закрыть">×</button></div>`;
    if (ctx.mode === "search") {
      const cats = {}; VO.search.run(ctx.p).forEach(a => cats[a.cat] = (cats[a.cat] || 0) + 1);
      html += `<section class="fs"><h4>Категория</h4><div class="fs-cats"><button type="button" data-cat="" class="${!ctx.cat ? "on" : ""}">Все категории <small>${Object.values(cats).reduce((s, n) => s + n, 0)}</small></button>${Object.entries(cats).map(([c, n]) => `<button type="button" data-cat="${c}" class="${ctx.cat === c ? "on" : ""}"><span class="fs-cats__i">${VO.catIcon(c)}</span>${esc(VO.catName(c))}<small>${n}</small></button>`).join("")}</div></section>`;
    }
    defs.forEach(d => {
      const others = all.filter(a => pass(a, ctx.F, ctx.cat, d.k));
      if (d.t === "chips") {
        const counts = {}; others.forEach(a => { const v = String(val(a, d)); counts[v] = (counts[v] || 0) + 1; });
        const sel = ctx.F[d.k] || [];
        html += `<section class="fs"><h4>${d.n}</h4><div class="fchips">${d.o.map(o => `<button type="button" class="fchip${sel.includes(o) ? " on" : ""}${!counts[o] && !sel.includes(o) ? " zero" : ""}" data-chip="${d.k}" data-v="${esc(o)}">${esc(o)}<small>${counts[o] || 0}</small></button>`).join("")}</div></section>`;
      }
      if (d.t === "toggle") {
        const n = others.filter(a => val(a, d)).length;
        html += `<section class="fs fs--row"><label class="switch-l"><input type="checkbox" data-tog="${d.k}"${ctx.F[d.k] ? " checked" : ""}><span class="sw"></span>${d.n}<small class="muted">${n}</small></label></section>`;
      }
      if (d.t === "range") {
        const vals = all.map(a => val(a, d)).filter(v => typeof v === "number");
        if (!vals.length) return;
        const lo = Math.min(...vals), hi = Math.max(...vals);
        if (lo === hi && d.k !== "price") return;
        const [a, b] = ctx.F[d.k] || [null, null];
        const bins = 14, hist = Array(bins).fill(0);
        others.map(x => val(x, d)).filter(v => typeof v === "number").forEach(v => hist[Math.min(bins - 1, Math.floor((v - lo) / ((hi - lo) || 1) * bins))]++);
        const mx = Math.max(1, ...hist);
        const step = hi - lo > 100000 ? 1000 : hi - lo > 1000 ? 100 : 1;
        html += `<section class="fs" data-range="${d.k}" data-lo="${lo}" data-hi="${hi}"><h4>${d.n}</h4>
          <div class="hist">${hist.map((h, i) => { const binLo = lo + (hi - lo) * i / bins; const inside = (a == null || binLo >= a - (hi - lo) / bins) && (b == null || binLo <= b); return `<i style="height:${8 + h / mx * 92}%" class="${inside ? "in" : ""}"></i>`; }).join("")}</div>
          <div class="dual"><span class="dual__fill"></span><input type="range" min="${lo}" max="${hi}" step="${step}" value="${a ?? lo}" data-r="0" aria-label="${d.n}: от"><input type="range" min="${lo}" max="${hi}" step="${step}" value="${b ?? hi}" data-r="1" aria-label="${d.n}: до"></div>
          <div class="rng"><label><span>от</span><input inputmode="numeric" data-n="0" placeholder="${nice(lo)}" value="${a != null ? a.toLocaleString("ru-RU") : ""}"></label><label><span>до</span><input inputmode="numeric" data-n="1" placeholder="${nice(hi)}" value="${b != null ? b.toLocaleString("ru-RU") : ""}"></label></div></section>`;
      }
    });
    html += `<button class="btn btn--accent btn--wide f-show" type="button" data-fclose>Показать ${all.filter(a => pass(a, ctx.F, ctx.cat)).length}</button>`;
    box.innerHTML = html;
    $$(".dual", box).forEach(fillDual);
  }
  function fillDual(du) {
    const [r0, r1] = $$("input", du), lo = +r0.min, hi = +r0.max, span = (hi - lo) || 1;
    const a = Math.min(+r0.value, +r1.value), b = Math.max(+r0.value, +r1.value);
    $(".dual__fill", du).style.cssText = `left:${(a - lo) / span * 100}%;right:${100 - (b - lo) / span * 100}%`;
  }

  /* ---------- отрисовка ---------- */
  let debounce = 0;
  function render(full = true) {
    const all = scope(), list = sorted(all.filter(a => pass(a, ctx.F, ctx.cat)));
    const n = list.length;
    // заголовок
    const t = ctx.mode === "cat" ? VO.catName(ctx.cat) : ctx.mode === "search" ? `«${ctx.q}»` : "Свежие объявления";
    $("#feedTitle").textContent = t;
    $("#feedSub").textContent = `${n} ${VO.plural(n, "объявление", "объявления", "объявлений")}` + (ctx.mode === "search" && ctx.p.fixed ? ` · исправили раскладку: «${ctx.p.fixed}»` : "");
    $("#feedTabs").hidden = ctx.mode !== "home";
    $("#saveSearch").hidden = ctx.mode === "home";
    $("#fOpen").hidden = ctx.mode === "home";
    $("#listL").classList.toggle("has-side", ctx.mode !== "home");
    const fc = Object.values(ctx.F).filter(v => Array.isArray(v) ? (typeof v[0] === "string" ? v.length : v[0] != null || v[1] != null) : v).length;
    $("#fCount").textContent = fc || "";
    // хлебные крошки и шапка категории
    const cr = $("#crumbs"); cr.hidden = ctx.mode === "home";
    cr.innerHTML = `<a href="#/">Главная</a>${VO.ico.chev}${ctx.mode === "cat" ? `<span>${esc(VO.catName(ctx.cat))}</span>` : `<span>Поиск</span>`}`;
    const hero = $("#catHero"); hero.hidden = ctx.mode !== "cat";
    if (ctx.mode === "cat" && full) {
      const c = VO.CATS.find(x => x.id === ctx.cat) || { subs: [] };
      hero.innerHTML = `<span class="cat-hero__ic">${c.icon}</span><div class="cat-hero__subs">${c.subs.map(s => `<a href="#/s/${encodeURIComponent(s)}?cat=${ctx.cat}">${esc(s)}</a>`).join("")}</div>`;
    }
    // активные фильтры
    const chips = [];
    if (ctx.mode === "search") { if (ctx.p.city) chips.push([null, ctx.p.city, "p-city"]); if (ctx.p.max != null) chips.push([null, `до ${VO.rub(ctx.p.max)}`, "p-max"]); if (ctx.p.min != null) chips.push([null, `от ${VO.rub(ctx.p.min)}`, "p-min"]); if (ctx.p.free) chips.push([null, "Даром", "p-free"]); if (ctx.cat) chips.push(["cat", VO.catName(ctx.cat)]); }
    defsFor(ctx.cat).forEach(d => {
      const f = ctx.F[d.k]; if (f == null) return;
      if (d.t === "chips") f.forEach(v => chips.push([d.k, v]));
      if (d.t === "range" && (f[0] != null || f[1] != null)) chips.push([d.k, `${d.n.replace(/,.*$/, "")}: ${f[0] != null ? "от " + nice(f[0]) : ""} ${f[1] != null ? "до " + nice(f[1]) : ""}`]);
      if (d.t === "toggle" && f) chips.push([d.k, d.n]);
    });
    $("#activeF").innerHTML = chips.map(([k, l, p]) => `<button type="button" class="af" data-af="${k || ""}" data-p="${p || ""}" data-v="${esc(l)}">${esc(l)}<i>×</i></button>`).join("") + (chips.length > 1 ? `<button type="button" class="af af--reset" data-reset>Сбросить всё</button>` : "");
    // сетка
    const grid = $("#grid");
    grid.innerHTML = list.map(VO.cardHTML).join("");
    VO.animateCards(grid);
    $("#empty").hidden = n > 0;
    if (full) renderFilters(all);
    else { const sb = $(".f-show"); if (sb) sb.textContent = `Показать ${n}`; }
    $$("#hdr .cat").forEach(c => c.classList.toggle("is-active", c.dataset.cat === ctx.cat));
    $(".sort__b span").textContent = SORTS.find(s => s[0] === ctx.sort)[1];
  }
  const update = (full = true) => { pushUrl(); clearTimeout(debounce); debounce = setTimeout(() => render(full), 20); };

  /* ---------- взаимодействие ---------- */
  page.addEventListener("click", e => {
    const t = e.target;
    const tab = t.closest("[data-tab]"); if (tab) { ctx.tab = tab.dataset.tab; VO.selectTab($("#feedTabs"), tab); render(); return; }
    const chip = t.closest("[data-chip]"); if (chip) { const k = chip.dataset.chip, v = chip.dataset.v; const arr = ctx.F[k] || []; ctx.F[k] = arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]; update(); return; }
    const cat = t.closest(".fs-cats [data-cat]"); if (cat) { ctx.cat = cat.dataset.cat || null; ctx.F = {}; update(); return; }
    if (t.closest("[data-reset]")) { ctx.F = {}; if (ctx.mode === "search") ctx.cat = null; update(); return; }
    const af = t.closest("[data-af]");
    if (af) {
      const k = af.dataset.af, p = af.dataset.p;
      if (p) { location.hash = `#/s/${encodeURIComponent(VO.search.norm(ctx.q).replace(p === "p-city" ? VO.search.norm(ctx.p.city || "") : p === "p-free" ? /даром|бесплатно|отдам/g : /(до|от|дешевле|дороже)\s*\d[\d\s]*\s*(к|тыс\S*)?/g, "").replace(/\s+/g, " ").trim() || " ")}`; return; }
      if (k === "cat") ctx.cat = null;
      else { const f = ctx.F[k]; if (Array.isArray(f) && typeof f[0] === "string") ctx.F[k] = f.filter(x => x !== af.dataset.v); else delete ctx.F[k]; }
      update(); return;
    }
    if (t.closest("#fOpen")) { $("#filters").classList.add("is-open"); document.documentElement.classList.add("no-scroll"); return; }
    if (t.closest("[data-fclose]")) { $("#filters").classList.remove("is-open"); document.documentElement.classList.remove("no-scroll"); return; }
    const sb = t.closest(".sort__b"); if (sb) { const s = $("#sort"); const on = s.classList.toggle("open"); sb.setAttribute("aria-expanded", on); return; }
    const so = t.closest("[data-sort]"); if (so) { ctx.sort = so.dataset.sort; $("#sort").classList.remove("open"); update(false); return; }
    if (t.closest("#saveSearch")) saveSearch();
  });
  document.addEventListener("click", e => { if (!e.target.closest("#sort")) { const s = $("#sort"); if (s) s.classList.remove("open"); } });
  page.addEventListener("change", e => { const tg = e.target.closest("[data-tog]"); if (tg) { ctx.F[tg.dataset.tog] = tg.checked; update(); } });
  page.addEventListener("input", e => {
    const r = e.target.closest("[data-r]");
    if (r) {
      const sec = r.closest("[data-range]"), du = r.closest(".dual"), [r0, r1] = $$("input", du);
      fillDual(du);
      const lo = +sec.dataset.lo, hi = +sec.dataset.hi, a = Math.min(+r0.value, +r1.value), b = Math.max(+r0.value, +r1.value);
      const ins = $$("[data-n]", sec); ins[0].value = a > lo ? a.toLocaleString("ru-RU") : ""; ins[1].value = b < hi ? b.toLocaleString("ru-RU") : "";
      ctx.F[sec.dataset.range] = [a > lo ? a : null, b < hi ? b : null];
      pushUrl(); render(false);
      return;
    }
    const n = e.target.closest("[data-n]");
    if (n) {
      n.value = n.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      const sec = n.closest("[data-range]"), ins = $$("[data-n]", sec), num = x => x.value ? +x.value.replace(/\D/g, "") : null;
      ctx.F[sec.dataset.range] = [num(ins[0]), num(ins[1])];
      clearTimeout(n._t); n._t = setTimeout(() => { pushUrl(); render(false); const du = $(".dual", sec), [r0, r1] = $$("input", du); if (num(ins[0]) != null) r0.value = num(ins[0]); if (num(ins[1]) != null) r1.value = num(ins[1]); fillDual(du); }, 250);
    }
  });
  page.addEventListener("change", e => { if (e.target.closest("[data-r]") || e.target.closest("[data-n]")) renderFilters(scope()); });

  function saveSearch() {
    const u = VO.user(); if (!u) return VO.needLogin(location.hash, "Войдите, чтобы сохранять поиски");
    const hash = base() + qsOf();
    const title = (ctx.mode === "cat" ? VO.catName(ctx.cat) : `«${ctx.q}»`) + ($("#activeF").textContent.trim() ? " · с фильтрами" : "");
    S.searches = VO.store.get("vo_searches", []);
    if (S.searches.some(s => s.hash === hash && s.owner === u.email)) return VO.toast("Этот поиск уже сохранён");
    S.searches.unshift({ id: Date.now(), owner: u.email, hash, title, notify: true, t: Date.now() });
    VO.store.set("vo_searches", S.searches);
    VO.toast(`Поиск сохранён — пришлём уведомление о новых объявлениях. <a href="#/me/fav">Открыть</a>`, 4000);
  }

  /* ---------- маршруты ---------- */
  function open(mode, parts, params) {
    ctx.mode = mode;
    ctx.cat = mode === "cat" ? parts[1] : mode === "search" ? params.get("cat") : null;
    if (mode === "cat" && !VO.CATS.some(c => c.id === ctx.cat)) { location.hash = "#/"; return; }
    ctx.q = mode === "search" ? (parts.slice(1).join("/") || "").trim() : null;
    ctx.p = mode === "search" ? VO.search.parse(ctx.q) : null;
    ctx.F = readF(params, ctx.cat);
    ctx.sort = params.get("sort") || "new";
    VO.show("home", ctx.mode === "cat" ? VO.catName(ctx.cat) : ctx.mode === "search" ? "Поиск: " + ctx.q : "");
    $("#filters").classList.remove("is-open");
    render();
    if (mode === "search") { const i = $("#q"); i.value = ctx.q; $("#search").classList.add("has-value"); }
  }
  VO.routes[""] = (p, q) => open("home", p, q);
  VO.routes.c = (p, q) => open("cat", p, q);
  VO.routes.s = (p, q) => open("search", p, q);
  VO.routes.fav = () => { location.hash = "#/me/fav"; };
  VO.routes.my = () => { location.hash = "#/me/ads"; };
  VO.on("favs", () => { if (VO.current() === "home") $$("#grid [data-fav]").forEach(b => b.classList.toggle("is-on", S.favs.has(b.dataset.fav))); });
  VO.on("mine", () => { if (VO.current() === "home") render(); });
  addEventListener("city:change", () => { if (VO.current() === "home" && ctx.tab === "city") render(); });
})();
