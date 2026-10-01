/* Переписка и сделки.
   Чаты нельзя удалить — только закрепить, отключить уведомления, заблокировать собеседника или пожаловаться.
   ДЕМО (до сервера): тестовые продавцы и демо-покупатели отвечают автоматически, чтобы можно было пройти весь путь сделки. */
(() => {
  const { $, $$, esc, store, state: S } = VO;
  let chats = store.get("vo_chats", []);
  const save = () => { store.set("vo_chats", chats); VO.emit("chats"); };
  const mine = () => chats.filter(c => c.owner === S.session);
  const last = c => c.msgs[c.msgs.length - 1] || { t: c.created, from: "sys", text: "Новый диалог" };
  const unreadOf = c => c.msgs.filter(m => m.from === "peer" && !m.read).length;
  const fmtTime = t => new Date(t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const dayLabel = t => { const d = new Date(t), n = new Date(); const diff = Math.floor((new Date(n.toDateString()) - new Date(d.toDateString())) / 864e5); return diff === 0 ? "Сегодня" : diff === 1 ? "Вчера" : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }); };
  const snap = a => ({ id: a.id, title: a.title, price: a.price, ill: a.ill, bg: a.bg, photo: a.photo || null, city: a.city });
  const RISK = /(предоплат|переведи|переведите|карт[уы] |код из смс|код из sms|скажите код|ссылк|https?:\/\/|\.ru\/|оплатить по ссылке|безопасн\w* сделк)/i;

  VO.chats = {
    list: (f = "all", q = "") => mine().filter(c => f === "all" || (f === "buy" && c.role === "buyer") || (f === "sell" && c.role === "seller") || (f === "unread" && unreadOf(c)) || (f === "deals" && c.deal && c.deal.stage !== "cancelled"))
      .filter(c => !q || (VO.person(c.peer).name + " " + c.ad.title).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => (b.pinned - a.pinned) || (last(b).t - last(a).t)),
    get: id => mine().find(c => c.id === id),
    unread: () => mine().filter(c => !c.muted).reduce((s, c) => s + unreadOf(c), 0),
    forAd: adId => mine().filter(c => c.ad.id === adId),
    popRow: c => { const p = VO.person(c.peer), l = last(c), u = unreadOf(c); return `<li><a class="pop__item" href="#/me/msg/${c.id}"><span class="pop__thumb" style="background:${c.ad.bg}">${c.ad.photo ? `<img src="${c.ad.photo}" alt="">` : window.VO_ILL[c.ad.ill] || ""}</span><span class="pop__txt"><b>${esc(p.name)}${u ? ` <em class="dot-n">${u}</em>` : ""}</b><span>${l.from === "me" ? "Вы: " : ""}${esc(l.text || (l.photo ? "Фото" : ""))}</span></span></a></li>`; },
    all: () => chats,
  };

  /* ---------- создание и отправка ---------- */
  function openFor(adId) {
    const a = VO.findAd(adId), u = VO.user(); if (!a || !u) return null;
    if (a.owner === u.email) { VO.toast("Это ваше объявление"); return null; }
    const peer = VO.seller(a).id;
    let c = mine().find(x => x.ad.id === adId && x.peer === peer);
    if (!c) { c = { id: "c" + Date.now().toString(36), owner: S.session, ad: snap(a), peer, role: "buyer", created: Date.now(), msgs: [], pinned: false, muted: false, blocked: false, deal: null }; chats.unshift(c); save(); }
    return c;
  }
  VO.chats.openFor = openFor;
  function push(c, m) { c.msgs.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: Date.now(), ...m }); save(); }
  function sys(c, text) { push(c, { from: "sys", text }); }
  function send(c, text, photo) {
    if (c.blocked) return VO.toast("Вы заблокировали собеседника — сначала разблокируйте");
    text = (text || "").trim().slice(0, 2000); if (!text && !photo) return;
    push(c, { from: "me", text, photo: photo || null, seen: false });
    botTurn(c, text);
  }

  /* ---------- ДЕМО: автоответы ---------- */
  const isBot = c => { const p = VO.person(c.peer); return p && p.bot; };
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  function replyFor(c, text) {
    const t = text.toLowerCase(), seller = c.role === "buyer"; // собеседник — продавец, если я покупатель
    if (seller) {
      if (/актуал|прода[её]т|в наличии|ещё есть|еще есть/.test(t)) return "Здравствуйте! Да, ещё актуально.";
      if (/торг|скидк|дешевле|уступ/.test(t)) return "Небольшой торг возможен, если заберёте в ближайшие дни.";
      if (/достав|отправ|почт|сдэк|boxberry|пересыл/.test(t)) return "Могу отправить Почтой России или СДЭК с оплатой при получении. Оформлю сам на сайте службы.";
      if (/где|посмотр|адрес|встрет|забрать|когда/.test(t)) return "Можно встретиться у метро в центре города — в будни после 19:00 или в выходные днём.";
      if (/фото|видео|сним/.test(t)) return "Хорошо, сейчас пришлю ещё фото.";
      if (/договорил|беру|забираю|покупаю/.test(t)) return "Отлично! Оформите сделку кнопкой вверху чата — так будет видно, на каком мы этапе.";
      return pick(["Здравствуйте! Слушаю вас.", "Да, конечно, спрашивайте.", "Хорошо, понял вас."]);
    }
    if (/да|актуал/.test(t) && c.msgs.filter(m => m.from === "peer").length < 3) return "Отлично! А когда можно посмотреть?";
    if (/встрет|метро|адрес|после|выходн/.test(t)) return "Подходит! Давайте договоримся — я готов(а) забрать.";
    if (/отправ|почт|сдэк/.test(t)) return "Да, отправка подойдёт. Оплачу при получении.";
    return pick(["Спасибо! Подумаю и вернусь.", "Понял(а), спасибо за ответ.", "Хорошо, а торг возможен?"]);
  }
  function botTurn(c, text) {
    if (!isBot(c) || c.blocked) return;
    const id = c.id;
    setTimeout(() => { const x = VO.chats.get(id); if (!x) return; x.msgs.forEach(m => { if (m.from === "me") m.seen = true; }); save(); paintIfOpen(id); }, 900);
    setTimeout(() => { if (open && open.id === id) $(".chat__typing", page) && ($(".chat__typing", page).hidden = false); }, 1300);
    setTimeout(() => {
      const x = VO.chats.get(id); if (!x) return;
      const reply = replyFor(x, text || "");
      push(x, { from: "peer", text: reply, read: open && open.id === id && document.visibilityState === "visible" });
      if (!(open && open.id === id) && !x.muted) VO.addNote("Новое сообщение", `${VO.person(x.peer).name}: ${reply}`, { cat: "msg", link: "#/me/msg/" + id });
      // демо-покупатель сам предлагает сделку, когда договорились о встрече/отправке
      if (x.role === "seller" && /договоримся|отправка подойдёт/.test(reply) && !x.deal) setTimeout(() => propose(x, "peer", /отправ/.test(reply) ? "ship" : "meet"), 1500);
      paintIfOpen(id);
    }, 2400 + Math.random() * 1200);
  }
  // ДЕМО: по каждому вашему объявлению через полминуты пишет демо-покупатель
  function demoBuyers() {
    const u = VO.user(); if (!u) return;
    const ids = Object.keys(window.VO_DEMO_BUYERS);
    S.mine.filter(a => a.owner === u.email && a.status === "active" && Date.now() - (a.first || a.created) > 30e3).forEach(a => {
      if (mine().some(c => c.ad.id === a.id)) return;
      const peer = ids[[...a.id].reduce((h, ch) => h + ch.charCodeAt(0), 0) % ids.length];
      const c = { id: "c" + Date.now().toString(36) + a.id.slice(-3), owner: S.session, ad: snap(a), peer, role: "seller", created: Date.now(), msgs: [], pinned: false, muted: false, blocked: false, deal: null };
      chats.unshift(c);
      push(c, { from: "peer", text: `Здравствуйте! «${a.title}» ещё актуально?`, read: false });
      VO.addNote("Новое сообщение", `${VO.person(peer).name} спрашивает про «${a.title}»`, { cat: "msg", link: "#/me/msg/" + c.id });
    });
  }
  setInterval(demoBuyers, 10e3); VO.on("user", demoBuyers); setTimeout(demoBuyers, 1500);

  /* ---------- сделка ---------- */
  const STAGES = [["agreed", "Договорились"], ["transfer", "Передача"], ["received", "Получено"], ["done", "Отзывы"]];
  const stageIdx = d => !d ? -1 : d.stage === "proposed" ? -1 : d.stage === "agreed" ? 0 : d.stage === "transfer" ? 1 : d.stage === "done" ? 3 : -1;
  function propose(c, by, method, price) {
    c.deal = { id: "D-" + Math.floor(100000 + Math.random() * 899999), stage: "proposed", by, method: method || "meet", price: price ?? c.ad.price, track: "", t: Date.now(), history: [{ stage: "proposed", by, t: Date.now() }] };
    sys(c, by === "me" ? `Вы предложили сделку: ${c.deal.method === "ship" ? "отправка посылкой" : "встреча"}, ${c.deal.price ? VO.rub(c.deal.price) : "даром"}` : `${VO.person(c.peer).name} предлагает сделку: ${c.deal.method === "ship" ? "отправка посылкой" : "встреча"}, ${c.deal.price ? VO.rub(c.deal.price) : "даром"}`);
    if (by === "peer") VO.addNote("Предложение сделки", `${VO.person(c.peer).name} — «${c.ad.title}»`, { cat: "deal", link: "#/me/msg/" + c.id });
    if (by === "me" && isBot(c)) setTimeout(() => { const x = VO.chats.get(c.id); if (x && x.deal && x.deal.stage === "proposed") { step(x, "agreed", "peer"); } }, 2500);
    paintIfOpen(c.id);
  }
  function step(c, stage, by, extra = {}) {
    const d = c.deal; Object.assign(d, extra); d.stage = stage; d.history.push({ stage, by, t: Date.now() });
    const who = by === "me" ? "Вы" : VO.person(c.peer).name;
    const T = { agreed: `${who === "Вы" ? "Вы приняли" : who + " принял(а)"} сделку. Номер сделки ${d.id}`, transfer: d.method === "ship" ? `Посылка отправлена${d.track ? `, трек-номер ${d.track}` : ""}. Проверяйте его только на сайте службы доставки` : "Продавец отметил, что передаёт вещь при встрече", done: "Сделка завершена. Оставьте отзыв друг другу — он будет отмечен как «Сделка на сайте»", cancelled: `${who === "Вы" ? "Вы отменили" : who + " отменил(а)"} сделку${extra.reason ? `: ${extra.reason}` : ""}` };
    sys(c, T[stage]);
    if (by === "peer") VO.addNote(stage === "done" ? "Сделка завершена" : stage === "cancelled" ? "Сделка отменена" : "Сделка: новый этап", `«${c.ad.title}» — ${STAGES.find(s => s[0] === stage)?.[1] || (stage === "cancelled" ? "отменена" : "")}`, { cat: "deal", link: "#/me/msg/" + c.id });
    if (stage === "done") onDone(c);
    botDeal(c);
    paintIfOpen(c.id);
  }
  function botDeal(c) {
    if (!isBot(c)) return;
    const d = c.deal, id = c.id;
    if (d.stage === "agreed" && c.role === "buyer") setTimeout(() => { const x = VO.chats.get(id); if (x && x.deal.stage === "agreed") step(x, "transfer", "peer", { track: x.deal.method === "ship" ? "8004" + Math.floor(1e9 + Math.random() * 9e9) : "" }); }, 3500);
    if (d.stage === "transfer" && c.role === "seller") setTimeout(() => { const x = VO.chats.get(id); if (x && x.deal.stage === "transfer") step(x, "done", "peer"); }, 4000);
  }
  function onDone(c) {
    const u = VO.user();
    if (c.role === "seller") {
      const ad = S.mine.find(a => a.id === c.ad.id);
      if (ad && ad.status === "active") setTimeout(() => VO.sheet(`<div class="confirm"><h3>Отметить объявление проданным?</h3><p>«${esc(c.ad.title)}» уйдёт из ленты, но останется в разделе «Мои объявления».</p><div class="confirm__b"><button class="btn btn--ghost" type="button" data-sheet-close>Оставить</button><button class="btn btn--ink" type="button" id="soldY">Продано</button></div></div>`, { cls: "sheet--sm" }) && $("#soldY").addEventListener("click", () => { ad.status = "sold"; VO.saveMine(); VO.emit("mine"); VO.closeSheet(); VO.toast("Объявление отмечено как проданное"); }), 600);
    }
    // ДЕМО: собеседник оставляет отзыв о вас после завершённой сделки
    if (isBot(c) && VO.reviews) setTimeout(() => VO.reviews.add({ target: VO.me(), author: c.peer, authorName: VO.person(c.peer).name, role: c.role, stars: 5, text: c.role === "seller" ? "Всё как в описании, приятно иметь дело." : "Быстро оплатил(а) и забрал(а), спасибо!", verified: true, ad: c.ad.title }), 1500);
  }
  VO.chats.dealOf = c => c.deal;

  /* ---------- страница переписки (внутри кабинета) ---------- */
  let page = null, open = null, filter = "all", query = "";
  const QUICK = {
    buyer: ["Здравствуйте! Ещё актуально?", "Торг возможен?", "Где и когда можно посмотреть?", "Можете отправить почтой?", "Пришлите, пожалуйста, ещё фото"],
    seller: ["Да, актуально", "Можно посмотреть сегодня вечером", "Могу отправить Почтой России наложенным платежом", "Небольшой торг возможен", "Уже продано, извините"],
  };
  function listHTML() {
    const L = VO.chats.list(filter, query);
    const cnt = f => VO.chats.list(f).length;
    return `<div class="chats__l">
      <div class="chats__top"><label class="chats__s"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 4.5 4.5"/></svg><input id="chatQ" placeholder="Поиск по диалогам" value="${esc(query)}"></label>
        <div class="chips chips--s">${[["all", "Все"], ["buy", "Покупаю"], ["sell", "Продаю"], ["unread", "Непрочитанные"], ["deals", "Со сделкой"]].map(([k, n]) => `<button type="button" data-cf="${k}" aria-pressed="${filter === k}">${n}${k !== "all" ? ` <small>${cnt(k)}</small>` : ""}</button>`).join("")}</div></div>
      <ul class="chats__list">${L.length ? L.map(c => { const p = VO.person(c.peer), l = last(c), u = unreadOf(c); return `<li><a href="#/me/msg/${c.id}" class="crow${open && open.id === c.id ? " on" : ""}${u ? " unread" : ""}">
        <span class="crow__ava" style="${p.color ? `background:${p.color}` : ""}">${esc(p.name[0])}<i class="crow__ad" style="background:${c.ad.bg}">${c.ad.photo ? `<img src="${c.ad.photo}" alt="">` : window.VO_ILL[c.ad.ill] || ""}</i></span>
        <span class="crow__t"><b>${esc(p.name)}${p.demo ? ' <em class="tag-demo">демо</em>' : ""}${c.pinned ? ' <em class="crow__pin" title="Закреплён">📌</em>' : ""}</b><small class="crow__ad-t">${esc(c.ad.title)}</small><span>${l.from === "me" ? "Вы: " : l.from === "sys" ? "• " : ""}${esc(l.text || (l.photo ? "Фото" : ""))}</span></span>
        <span class="crow__m"><time>${dayLabel(l.t) === "Сегодня" ? fmtTime(l.t) : dayLabel(l.t)}</time>${u ? `<em>${u}</em>` : c.muted ? '<em class="mut" title="Без уведомлений">🔕</em>' : ""}${c.deal && c.deal.stage !== "cancelled" ? `<i class="crow__deal st-${c.deal.stage}">${c.deal.stage === "done" ? "Сделка завершена" : "Сделка"}</i>` : ""}</span></a></li>`; }).join("")
      : `<li class="chats__empty"><b>${query ? "Ничего не нашли" : filter === "all" ? "Диалогов пока нет" : "Здесь пусто"}</b><span>${filter === "all" && !query ? "Напишите продавцу со страницы объявления. Когда вам напишут по вашим объявлениям, диалог тоже появится здесь." : "Попробуйте другой фильтр."}</span>${filter === "all" && !query ? '<a class="btn btn--ink btn--sm" href="#/">К объявлениям</a>' : ""}</li>`}</ul></div>`;
  }
  function dealBar(c) {
    const d = c.deal, seller = c.role === "seller", p = VO.person(c.peer);
    if (c.blocked) return "";
    if (!d || d.stage === "cancelled") return `<div class="deal-bar deal-bar--start"><span>${d ? "Сделка отменена. " : ""}Договорились? Оформите сделку — так обоим видно этап, а отзыв получит отметку «Сделка на сайте».</span><button class="btn btn--ink btn--sm" type="button" data-deal="start">Оформить сделку</button></div>`;
    const idx = stageIdx(d);
    const steps = `<ol class="deal-steps">${STAGES.map(([k, n], i) => `<li class="${i < idx || d.stage === "done" ? "done" : i === idx ? "cur" : ""}"><i>${i + 1}</i><span>${n}</span></li>`).join("")}</ol>`;
    let act = "";
    if (d.stage === "proposed") act = d.by === "me" ? `<span class="muted">Ждём ответа ${esc(p.name)}…</span><button class="link" type="button" data-deal="cancel">Отменить</button>` : `<button class="btn btn--accent btn--sm" type="button" data-deal="accept">Принять сделку</button><button class="btn btn--ghost btn--sm" type="button" data-deal="decline">Отклонить</button>`;
    if (d.stage === "agreed") act = seller ? `<button class="btn btn--accent btn--sm" type="button" data-deal="transfer">${d.method === "ship" ? "Я отправил(а) посылку" : "Передаю при встрече"}</button><button class="link" type="button" data-deal="cancel">Отменить</button>` : `<span class="muted">${d.method === "ship" ? "Продавец готовит отправку" : "Договоритесь о времени встречи в чате"}</span><button class="link" type="button" data-deal="cancel">Отменить</button>`;
    if (d.stage === "transfer") act = seller ? `<span class="muted">Ждём, когда покупатель подтвердит получение</span>` : `<button class="btn btn--accent btn--sm" type="button" data-deal="received">Я получил(а), всё в порядке</button><button class="link" type="button" data-deal="problem">Есть проблема</button>`;
    if (d.stage === "done") { const left = VO.reviews && VO.reviews.has(VO.me(), c.peer, seller ? "buyer" : "seller"); act = left ? `<span class="muted">Сделка завершена, отзыв оставлен. Спасибо!</span>` : `<button class="btn btn--accent btn--sm" type="button" data-deal="review">Оставить отзыв</button>`; }
    return `<div class="deal-bar"><div class="deal-bar__h"><b>Сделка ${d.id}</b><span>${d.method === "ship" ? "Отправка" : "Встреча"} · ${d.price ? VO.rub(d.price) : "даром"}${d.track ? ` · трек ${esc(d.track)}` : ""}</span></div>${steps}<div class="deal-bar__a">${act}</div></div>`;
  }
  function convHTML(c) {
    const p = VO.person(c.peer);
    let lastDay = "", html = "";
    c.msgs.forEach(m => {
      const dl = dayLabel(m.t); if (dl !== lastDay) { html += `<div class="msg-day"><span>${dl}</span></div>`; lastDay = dl; }
      if (m.from === "sys") { html += `<div class="msg-sys">${esc(m.text)}</div>`; return; }
      const risk = m.from === "peer" && RISK.test(m.text || "");
      html += `<div class="msg msg--${m.from}"><div class="msg__b">${m.photo ? `<img src="${m.photo}" alt="Фото" class="msg__ph">` : ""}${m.text ? `<p>${esc(m.text)}</p>` : ""}<span class="msg__t">${fmtTime(m.t)}${m.from === "me" ? `<i class="tick${m.seen ? " seen" : ""}" title="${m.seen ? "Прочитано" : "Доставлено"}">${m.seen ? "✓✓" : "✓"}</i>` : ""}</span></div>${risk ? `<div class="msg__risk">Осторожно: похоже на просьбу о предоплате, коде или ссылке. Не переводите деньги заранее и не сообщайте коды. <a href="#/safety">Подробнее</a></div>` : ""}</div>`;
    });
    if (!c.msgs.length) html = `<div class="chat__hello"><b>Начните разговор</b><span>Выберите быстрый вопрос ниже или напишите свой. Номер телефона в чате не показывается.</span></div>`;
    const quick = QUICK[c.role === "buyer" ? "buyer" : "seller"];
    return `<div class="chat">
      <header class="chat__h">
        <a class="chat__back" href="#/me/msg" aria-label="К списку диалогов">‹</a>
        <a class="chat__who" href="#/u/${p.id}"><span class="crow__ava" style="${p.color ? `background:${p.color}` : ""}">${esc(p.name[0])}</span><span><b>${esc(p.name)}${p.demo ? ' <em class="tag-demo">демо</em>' : ""}</b><small>${c.role === "buyer" ? "Продавец" : "Покупатель"}${VO.rating ? VO.rating.short(p.id) : ""}</small></span></a>
        <a class="chat__ad" href="#/ad/${c.ad.id}"><span class="pop__thumb" style="background:${c.ad.bg}">${c.ad.photo ? `<img src="${c.ad.photo}" alt="">` : window.VO_ILL[c.ad.ill] || ""}</span><span><b>${c.ad.price ? VO.rub(c.ad.price) : "Даром"}</b><small>${esc(c.ad.title)}</small></span></a>
        <div class="chat__menu"><button class="icb" type="button" data-cm="menu" aria-label="Действия с диалогом" aria-haspopup="menu">⋯</button>
          <div class="chat__mm" role="menu"><button type="button" data-cm="pin">${c.pinned ? "Открепить" : "Закрепить диалог"}</button><button type="button" data-cm="mute">${c.muted ? "Включить уведомления" : "Без уведомлений"}</button><button type="button" data-cm="block">${c.blocked ? "Разблокировать" : "Заблокировать"}</button><button type="button" data-cm="report" class="danger">Пожаловаться</button><small>Диалоги не удаляются — так проще разобраться, если что-то пойдёт не так.</small></div></div>
      </header>
      ${dealBar(c)}
      <div class="chat__body" id="chatBody">${html}<div class="msg msg--peer chat__typing" hidden><div class="msg__b"><span class="bub--typing"><i></i><i></i><i></i></span></div></div></div>
      ${c.blocked ? `<div class="chat__blocked">Вы заблокировали ${esc(p.name)}. Пользователь не сможет вам писать. <button class="link" type="button" data-cm="block">Разблокировать</button></div>` : `
      <div class="chat__quick">${quick.map(q => `<button type="button" data-q="${esc(q)}">${esc(q)}</button>`).join("")}</div>
      <form class="chat__f" id="chatF">
        <label class="icb chat__att" title="Прикрепить фото" aria-label="Прикрепить фото"><input type="file" accept="image/jpeg,image/png,image/webp" hidden id="chatPh"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L15.5 7"/></svg></label>
        <textarea id="chatT" rows="1" maxlength="2000" placeholder="Сообщение"></textarea>
        <button class="chat__send" type="submit" aria-label="Отправить"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg></button>
      </form><div class="chat__warn" id="chatWarn" hidden></div>`}
    </div>`;
  }
  function render(host, id) {
    page = host;
    open = id ? VO.chats.get(id) : null;
    if (open) { let ch = false; open.msgs.forEach(m => { if (m.from === "peer" && !m.read) { m.read = true; ch = true; } }); if (ch) save(); }
    host.innerHTML = `<div class="chats${open ? " has-open" : ""}">${listHTML()}<div class="chats__c">${open ? convHTML(open) : `<div class="chats__none"><svg width="120" height="96" viewBox="0 0 120 96"><path d="M20 12h50a24 24 0 0 1 0 48H40L20 80Z" fill="#F4F5F7"/><path d="M60 40h34a16 16 0 0 1 0 32H80L68 82V72a16 16 0 0 1-8-32Z" fill="#FFEDEA"/></svg><b>Выберите диалог</b><span>Здесь будет переписка, этапы сделки и быстрые ответы.</span></div>`}</div></div>`;
    const body = $("#chatBody", host); if (body) body.scrollTop = body.scrollHeight;
  }
  function paintIfOpen(id) {
    if (!page || VO.current() !== "me" || !/^#\/me\/msg/.test(location.hash)) return;
    const keep = $("#chatT", page) ? $("#chatT", page).value : "";
    render(page, open ? open.id : null);
    if (keep && $("#chatT", page)) $("#chatT", page).value = keep;
  }
  VO.chats.render = render;

  document.addEventListener("click", e => {
    if (!page || !page.contains(e.target)) return;
    const t = e.target;
    const cf = t.closest("[data-cf]"); if (cf) { filter = cf.dataset.cf; return render(page, open && open.id); }
    const q = t.closest("[data-q]"); if (q && open) { send(open, q.dataset.q); return render(page, open.id); }
    const cm = t.closest("[data-cm]");
    if (cm && open) {
      const k = cm.dataset.cm;
      if (k === "menu") { cm.parentElement.classList.toggle("open"); return; }
      if (k === "pin") { open.pinned = !open.pinned; save(); }
      if (k === "mute") { open.muted = !open.muted; save(); VO.toast(open.muted ? "Уведомления по диалогу выключены" : "Уведомления включены", 1600); }
      if (k === "block") { open.blocked = !open.blocked; save(); VO.toast(open.blocked ? "Пользователь заблокирован" : "Пользователь разблокирован"); }
      if (k === "report") return report(open);
      return render(page, open.id);
    }
    const dl = t.closest("[data-deal]");
    if (dl && open) {
      const k = dl.dataset.deal, c = open;
      if (k === "start") return startDeal(c);
      if (k === "accept") step(c, "agreed", "me");
      if (k === "decline") { step(c, "cancelled", "me", { reason: "предложение отклонено" }); }
      if (k === "cancel") return cancelDeal(c);
      if (k === "transfer") return transfer(c);
      if (k === "received") step(c, "done", "me");
      if (k === "problem") { location.hash = "#/contact?topic=Проблема с объявлением"; return; }
      if (k === "review" && VO.reviews) return VO.reviews.form(c.peer, c.role === "seller" ? "buyer" : "seller");
      return render(page, c.id);
    }
    if (!t.closest(".chat__menu")) $$(".chat__menu.open", page).forEach(m => m.classList.remove("open"));
  });
  document.addEventListener("input", e => {
    if (!page || !page.contains(e.target)) return;
    if (e.target.id === "chatQ") { query = e.target.value; const pos = e.target.selectionStart; render(page, open && open.id); const i = $("#chatQ", page); i.focus(); i.setSelectionRange(pos, pos); }
    if (e.target.id === "chatT") {
      const ta = e.target; ta.style.height = "auto"; ta.style.height = Math.min(140, ta.scrollHeight) + "px";
      const w = $("#chatWarn", page); const risky = /(\+?7|8)[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}|https?:\/\/|\d{16}|\d{4}\s\d{4}\s\d{4}\s\d{4}/.test(ta.value);
      w.hidden = !risky; w.textContent = "Не отправляйте номера карт и ссылки на оплату. Номер телефона лучше открыть в профиле — его увидит только собеседник после входа.";
    }
  });
  document.addEventListener("keydown", e => { if (e.target.id === "chatT" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#chatF", page).requestSubmit(); } });
  document.addEventListener("submit", e => {
    if (e.target.id !== "chatF" || !open) return; e.preventDefault();
    const ta = $("#chatT", page); send(open, ta.value); ta.value = ""; render(page, open.id); $("#chatT", page).focus();
  });
  document.addEventListener("change", e => {
    if (e.target.id !== "chatPh" || !open) return;
    const f = e.target.files[0]; if (!f || !/^image\//.test(f.type)) return;
    const img = new Image(), url = URL.createObjectURL(f);
    img.onload = () => { const k = Math.min(1, 800 / Math.max(img.width, img.height)), cv = document.createElement("canvas"); cv.width = img.width * k; cv.height = img.height * k; cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url); send(open, "", cv.toDataURL("image/jpeg", .75)); render(page, open.id); };
    img.src = url;
  });

  function startDeal(c) {
    const el = VO.sheet(`<form class="dealf" id="dealF"><h3>Оформить сделку</h3><p class="muted">Собеседник получит предложение и сможет его принять. Деньги через сайт не проходят — вы рассчитываетесь напрямую.</p>
      <div class="dealf__m"><label><input type="radio" name="m" value="meet" checked><span><b>Встреча</b><small>Вы в одном городе, проверка на месте</small></span></label><label><input type="radio" name="m" value="ship"><span><b>Отправка посылкой</b><small>Лучше наложенным платежом</small></span></label></div>
      <div class="field"><input id="dealP" inputmode="numeric" placeholder=" " value="${c.ad.price ? c.ad.price.toLocaleString("ru-RU") : "0"}"><label for="dealP">Итоговая цена, ₽</label></div>
      <button class="btn btn--accent btn--wide" type="submit">Предложить сделку</button></form>`, { cls: "sheet--sm" });
    $("#dealP", el).addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " "); });
    $("#dealF", el).addEventListener("submit", e => { e.preventDefault(); const fd = new FormData(e.target); VO.closeSheet(true); propose(c, "me", fd.get("m"), +$("#dealP", el).value.replace(/\D/g, "") || 0); render(page, c.id); });
  }
  function transfer(c) {
    if (c.deal.method !== "ship") { step(c, "transfer", "me"); return render(page, c.id); }
    const el = VO.sheet(`<form id="trF"><h3>Посылка отправлена</h3><p class="muted">Укажите трек-номер — покупатель сможет проверить его на сайте службы доставки.</p><div class="field"><input id="trN" placeholder=" " maxlength="20"><label for="trN">Трек-номер</label><em>От 10 до 20 символов: буквы и цифры</em></div><button class="btn btn--accent btn--wide" type="submit">Отправил(а)</button></form>`, { cls: "sheet--sm" });
    $("#trF", el).addEventListener("submit", e => { e.preventDefault(); const v = $("#trN", el).value.replace(/\s/g, "").toUpperCase(); if (!VO.check($("#trN", el).parentElement, /^[A-Z0-9]{10,20}$/.test(v))) return; VO.closeSheet(true); step(c, "transfer", "me", { track: v }); render(page, c.id); });
  }
  function cancelDeal(c) {
    const R = ["Передумал(а)", "Не договорились о цене", "Не получилось встретиться", "Подозрительное поведение", "Другое"];
    const el = VO.sheet(`<form id="cnF"><h3>Отменить сделку?</h3><div class="report__r">${R.map((r, i) => `<label><input type="radio" name="r" value="${r}"${i ? "" : " checked"}><span>${r}</span></label>`).join("")}</div><button class="btn btn--ink btn--wide" type="submit">Отменить сделку</button></form>`, { cls: "sheet--sm" });
    $("#cnF", el).addEventListener("submit", e => { e.preventDefault(); VO.closeSheet(true); step(c, "cancelled", "me", { reason: new FormData(e.target).get("r").toLowerCase() }); render(page, c.id); });
  }
  function report(c) {
    const R = ["Мошенничество или просьба о предоплате", "Спам или реклама", "Оскорбления", "Просит перейти по ссылке", "Другое"];
    const el = VO.sheet(`<form id="rpF"><h3>Пожаловаться на пользователя</h3><p class="muted">Переписку проверит модератор. Собеседник не узнает, кто пожаловался.</p><div class="report__r">${R.map((r, i) => `<label><input type="radio" name="r" value="${r}"${i ? "" : " checked"}><span>${r}</span></label>`).join("")}</div><label class="check"><input type="checkbox" id="rpB" checked><span></span><span>Заодно заблокировать пользователя</span></label><button class="btn btn--ink btn--wide" type="submit">Отправить жалобу</button></form>`, { cls: "sheet--sm" });
    $("#rpF", el).addEventListener("submit", e => { e.preventDefault(); const reps = store.get("vo_reports", []); reps.push({ chat: c.id, peer: c.peer, reason: new FormData(e.target).get("r"), t: Date.now() }); store.set("vo_reports", reps); if ($("#rpB", el).checked) { c.blocked = true; save(); } VO.closeSheet(true); VO.toast("Жалоба отправлена. Спасибо!"); render(page, c.id); });
  }
  addEventListener("storage", e => { if (e.key === "vo_chats") { chats = store.get("vo_chats", []); VO.emit("chats"); paintIfOpen(); } });
  VO.on("user", () => { chats = store.get("vo_chats", []); });
})();
