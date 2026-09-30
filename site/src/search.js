/* Умный поиск: раскладка, синонимы, опечатки, цена и город прямо в запросе, подсказки на лету. */
(() => {
  const { $, $$, esc } = VO;
  const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`", RU = "йцукенгшщзхъфывапролджэячсмитьбюё";
  const fixLayout = s => [...s].map(ch => { const i = EN.indexOf(ch); return i >= 0 ? RU[i] : ch; }).join("");
  const norm = s => s.toLowerCase().replace(/ё/g, "е").replace(/[«»"'`.,!?()\/\\:;]+/g, " ").replace(/\s+/g, " ").trim();
  const ENDS = /(иями|ями|ами|ого|ему|ому|ыми|ими|ией|ия|ие|ий|ый|ой|ая|яя|ое|ее|ые|ую|юю|ом|ем|ах|ях|ов|ев|ей|ам|ям|а|я|ы|и|у|ю|е|о|ь)$/;
  const stem = w => w.length > 4 ? w.replace(ENDS, "") : w;
  // синонимы и разговорные слова → то, что встречается в объявлениях
  const SYN = {
    айфон: ["iphone"], ифон: ["iphone"], iphone: ["iphone"], смартфон: ["телефон", "iphone"], телефон: ["телефон", "iphone"], мобильник: ["телефон"],
    самсунг: ["samsung"], сони: ["sony"], сяоми: ["xiaomi"], ксиаоми: ["xiaomi"], плейстейшн: ["приставк"], пс5: ["приставк"], пс4: ["приставк"], ps5: ["приставк"], ps4: ["приставк"], консоль: ["приставк"], джойстик: ["джойстик", "приставк"],
    велик: ["велосипед"], байк: ["велосипед"], самокат: ["самокат"], кот: ["котенок", "кош"], котик: ["котенок"], кошка: ["котенок", "кош"], щенок: ["щен"], собака: ["щен", "собак"],
    софа: ["диван"], кроссы: ["кроссовк"], кеды: ["кроссовк"], обувь: ["кроссовк", "обувь"], наушник: ["наушник"], airpods: ["наушник"], гарнитура: ["наушник"],
    однушка: ["1-комнатн", "квартир"], двушка: ["2-комнатн", "квартир"], квартира: ["квартир"], хата: ["квартир"], дача: ["дом", "дач"], коттедж: ["дом"],
    машина: ["kia", "авто"], тачка: ["kia", "авто"], автомобиль: ["kia", "авто"], резина: ["шины"], колеса: ["шины"], стиралка: ["стиральн"], мастер: ["ремонт"],
    вакансия: ["бариста", "работ"], работа: ["работ", "бариста"], подработка: ["работ"], гитара: ["гитар"], фотик: ["фотоаппарат"], часики: ["часы"], платье: ["плать"], рыбки: ["аквариум"],
  };
  const CAT_WORDS = { auto: ["авто", "машин", "автомобил"], parts: ["запчаст", "шин", "резин"], realty: ["недвижим", "квартир", "дом", "аренд"], job: ["работ", "ваканс"], service: ["услуг", "ремонт", "мастер"],
    tech: ["электрон", "техник", "телефон", "ноутбук"], wear: ["одежд", "обув", "плать"], home: ["мебел", "дом и сад", "диван"], kids: ["детск", "дет"], hobby: ["хобби", "спорт", "велосипед"], pets: ["животн", "кош", "собак", "аквариум"], free: ["даром", "бесплатн"] };

  const lev = (a, b) => { if (Math.abs(a.length - b.length) > 2) return 9; const d = [...Array(b.length + 1).keys()]; for (let i = 1; i <= a.length; i++) { let p = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return d[b.length]; };
  const tokenMatch = (q, words) => words.some(w => w.startsWith(q) || q.startsWith(w) && w.length >= 4 || (q.length >= 4 && lev(q, w.slice(0, q.length + 1)) <= (q.length >= 7 ? 2 : 1)));

  let INDEX = [];
  function build() {
    INDEX = VO.allAds().map(a => {
      const t = norm(a.title).split(" ").map(stem);
      const rest = norm([a.desc, VO.catName(a.cat), a.city, ...Object.values(a.attrs || {}).map(String)].join(" ")).split(" ").map(stem);
      return { a, t, rest };
    });
  }
  VO.on("mine", build);

  /* Разбор запроса: цена, «даром», «новое», город, категория и текст */
  function parse(raw) {
    if (!INDEX.length) build();
    let q = norm(raw), fixed = null;
    const out = { raw, min: null, max: null, free: false, isNew: false, city: null, cat: null, words: [] };
    const num = (n, k) => Math.round(parseFloat(n.replace(/\s/g, "").replace(",", ".")) * (k ? 1000 : 1));
    q = q.replace(/(?:до|дешевле|не дороже|меньше|max)\s*(\d[\d\s,]*)\s*(к|тыс\S*|т\.?р\.?)?/g, (_, n, k) => { out.max = num(n, k); return " "; });
    q = q.replace(/(?:от|дороже|больше|min)\s*(\d[\d\s,]*)\s*(к|тыс\S*|т\.?р\.?)?/g, (_, n, k) => { out.min = num(n, k); return " "; });
    q = q.replace(/\b(даром|бесплатно|отдам|отдаю|халява)\b/g, () => { out.free = true; return " "; });
    q = q.replace(/\b(нов(ый|ая|ое|ые|ую))\b/g, () => { out.isNew = true; return " "; });
    const cities = window.VO_CITIES || [];
    for (const c of cities) { const cn = norm(c); const cs = stem(cn); if (cn.length > 3 && (q.includes(cn) || q.split(" ").some(w => w.length > 3 && stem(w) === cs))) { out.city = c; q = q.replace(new RegExp(cs + "\\S*", "g"), " "); break; } }
    let words = q.split(" ").filter(w => w.length > 1 && !["в", "на", "для", "с", "и", "по", "руб", "рублей", "₽"].includes(w));
    // латиница, похожая на русское слово в «неправильной раскладке»
    if (words.length && words.every(w => /^[a-z\[\];',.`]+$/.test(w))) {
      const alt = words.map(fixLayout);
      const known = w => INDEX.some(i => tokenMatch(stem(w), i.t.concat(i.rest))) || SYN[w];
      if (!words.some(w => INDEX.some(i => tokenMatch(w, i.t))) && alt.some(known)) { fixed = alt.join(" "); words = alt; }
    }
    for (const [id, ws] of Object.entries(CAT_WORDS)) if (words.some(w => ws.some(x => stem(w).startsWith(x) || x.startsWith(stem(w)) && stem(w).length > 3))) { out.cat = id; break; }
    out.words = words.map(w => ({ w, alts: [...new Set([stem(w), ...(SYN[w] || SYN[stem(w)] || [])])] }));
    out.fixed = fixed;
    return out;
  }
  function run(p, extra = {}) {
    if (!INDEX.length) build();
    const res = [];
    for (const { a, t, rest } of INDEX) {
      if (p.max != null && a.price > p.max) continue;
      if (p.min != null && a.price < p.min) continue;
      if (p.free && a.price !== 0) continue;
      if (p.isNew && a.cond !== "Новое") continue;
      if (p.city && a.city !== p.city) continue;
      let score = 0, ok = true;
      for (const { alts } of p.words) {
        const inT = alts.some(x => tokenMatch(x, t)), inR = !inT && alts.some(x => tokenMatch(x, rest));
        if (!inT && !inR) { ok = false; break; }
        score += inT ? 3 : 1;
      }
      if (ok) res.push({ a, score: score + (p.cat && a.cat === p.cat ? 1 : 0) });
    }
    return res.sort((x, y) => y.score - x.score).map(r => r.a);
  }
  VO.search = { parse, run, build, norm, stem };

  const hl = (text, p) => {
    let s = esc(text);
    p.words.forEach(({ alts }) => alts.forEach(x => { if (x.length > 1) s = s.replace(new RegExp(`(^|[\\s«(])(${x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[а-яёa-z0-9-]*)`, "gi"), "$1<mark>$2</mark>"); }));
    return s;
  };
  const chipsOf = p => [p.min != null && `от ${VO.rub(p.min)}`, p.max != null && `до ${VO.rub(p.max)}`, p.free && "Даром", p.isNew && "Новое", p.city].filter(Boolean);

  /* ---------- подсказки в шапке ---------- */
  const input = $("#q"), sug = $(".suggest"), form = $("#search");
  const live = document.createElement("div"); live.className = "suggest__live"; sug.appendChild(live);
  let sel = -1, timer = 0;
  function render() {
    const v = input.value.trim();
    sug.classList.toggle("is-live", !!v);
    if (!v) { live.innerHTML = ""; return; }
    const p = parse(v), res = run(p);
    const cats = {}; res.forEach(a => cats[a.cat] = (cats[a.cat] || 0) + 1);
    const top = res.slice(0, 5), chips = chipsOf(p);
    const text = p.words.map(w => w.w).join(" ");
    live.innerHTML = `
      ${p.fixed ? `<div class="sg-fix">Ищем «<b>${esc(p.fixed)}</b>» — похоже, была английская раскладка</div>` : ""}
      ${chips.length ? `<div class="sg-parsed">Понял запрос: ${chips.map(c => `<span>${esc(c)}</span>`).join("")}</div>` : ""}
      ${Object.keys(cats).length ? `<div class="sg-cats">${Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([c, n]) => `<a class="sg-item sg-cat" href="#/s/${encodeURIComponent(v)}?cat=${c}"><span class="sg-cat__ic">${VO.catIcon(c)}</span><span>${esc(text || "Всё")} <em>в категории</em> ${esc(VO.catName(c))}</span><small>${n}</small></a>`).join("")}</div>` : ""}
      ${top.length ? `<div class="sg-ads">${top.map(a => `<a class="sg-item sg-ad" href="#/ad/${a.id}"><span class="pop__thumb" style="background:${a.bg}">${a.photo ? `<img src="${a.photo}" alt="">` : window.VO_ILL[a.ill]}</span><span class="sg-ad__t">${hl(a.title, p)}<small>${esc(a.city)}</small></span><b>${a.price === 0 ? "Даром" : VO.rub(a.price)}</b></a>`).join("")}</div>`
        : `<div class="sg-none">Ничего не нашли по «${esc(v)}». Попробуйте проще: одно-два слова.</div>`}
      <a class="sg-item sg-all" href="#/s/${encodeURIComponent(v)}">Показать все результаты <b>${res.length}</b> ${VO.ico.chev}</a>`;
    sel = -1;
  }
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(render, 90); });
  input.addEventListener("focus", render);
  input.addEventListener("keydown", e => {
    const items = $$(".sg-item", live); if (!items.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items.forEach((it, i) => it.classList.toggle("is-sel", i === sel)); items[sel].scrollIntoView({ block: "nearest" });
    }
    if (e.key === "Enter" && sel >= 0) { e.preventDefault(); items[sel].click(); }
  });
  live.addEventListener("click", e => { if (e.target.closest("a")) { form.classList.remove("is-focus"); input.blur(); } });
})();
