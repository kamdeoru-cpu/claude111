/* Информационные страницы: как это работает, безопасность, помощь, написать нам */
(() => {
  const { $, $$, esc } = VO;
  const C = window.VO_CONTACTS, BI = window.VO_BRAND_ICONS;
  const I = (d, w = 22) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  /* ================= КАК ЭТО РАБОТАЕТ ================= */
  const how = VO.page("how", `<div class="wrap">
    <section class="hero2">
      <div class="hero2__t"><span class="ph__eyebrow">Как это работает</span><h1 class="ph__title">От объявления<br>до <span class="hl-u">встречи</span> — четыре шага</h1>
        <p class="ph__lead">«Все объявления» — бесплатная доска, где люди находят друг друга. Мы не посредник: договариваетесь и рассчитываетесь вы напрямую.</p>
        <div class="hero2__cta"><a class="btn btn--accent btn--lg" href="#/post">Разместить объявление</a><a class="btn btn--ghost btn--lg" href="#/">Смотреть объявления</a></div></div>
      <div class="journey" aria-hidden="true">
        <svg viewBox="0 0 520 380"><path id="jPath" class="journey__road" d="M40 320C120 320 110 220 190 220S300 300 360 240 330 110 400 90 490 60 490 40" fill="none"/>
          <path class="journey__trail" d="M40 320C120 320 110 220 190 220S300 300 360 240 330 110 400 90 490 60 490 40" fill="none" pathLength="1"/></svg>
        <span class="jst" style="left:6%;top:82%"><i>${I('<path d="M12 5v14M5 12h14"/>', 18)}</i><b>Публикуете</b></span>
        <span class="jst" style="left:34%;top:56%"><i>${I('<path d="M4.5 4.5h10a5.5 5.5 0 0 1 0 11H8.5l-4 4Z"/>', 18)}</i><b>Вам пишут</b></span>
        <span class="jst" style="left:68%;top:62%"><i>${I('<path d="M7 11l3 3 7-7M4 20h16"/>', 18)}</i><b>Договариваетесь</b></span>
        <span class="jst jst--end" style="left:92%;top:9%"><i>${I('<path d="m5 12.5 4.5 4.5L19 7"/>', 18)}</i><b>Передаёте</b></span>
        <span class="journey__dot"><svg viewBox="0 0 150 214" width="26"><g transform="translate(20 4)" stroke-linejoin="round" stroke-width="10"><path d="M5 5H78A38 38 0 0 1 78 81H5Z" fill="#FF4F3A" stroke="#FF4F3A"/><path d="M5 97H84A44 44 0 0 1 84 185H30L5 207Z" fill="#16181D" stroke="#16181D"/></g></svg></span>
      </div>
    </section>

    <div class="how-head" data-rv><h2 class="h2">Пошагово</h2>
      <div class="seg" role="tablist" id="howSeg"><button role="tab" data-role="sell" aria-selected="true">Я продаю</button><button role="tab" data-role="buy">Я покупаю</button><span class="seg__ink" aria-hidden="true"></span></div></div>
    <div class="how" data-rv>
      <ol class="how__steps" id="howSteps"></ol>
      <div class="how__stage" aria-live="polite">
        <div class="scene sc-post" data-scene="post"><div class="mini-card"><div class="mini-card__img"><i></i></div><div class="mini-card__l l1"></div><div class="mini-card__l l2"></div><div class="mini-card__price">12 000 ₽</div><div class="mini-card__btn">Опубликовать</div></div><div class="sc-free">Бесплатно</div></div>
        <div class="scene sc-chat" data-scene="chat"><div class="bub bub--in">Здравствуйте! Ещё продаёте?</div><div class="bub bub--out">Да, актуально</div><div class="bub bub--in">Можно пару фото сбоку?</div><div class="bub bub--typing"><i></i><i></i><i></i></div></div>
        <div class="scene sc-deal" data-scene="deal"><div class="deal">
          <div class="deal__opt"><span class="deal__ic"><svg viewBox="0 0 48 48"><ellipse class="dsh" cx="24" cy="43" rx="8" ry="2.5" fill="#16181D" opacity=".15"/><g class="dpin"><path d="M24 40s-13-11-13-21a13 13 0 0 1 26 0c0 10-13 21-13 21Z" fill="#FF4F3A"/><circle cx="24" cy="19" r="5" fill="#fff"/></g></svg></span><b>Встреча</b><span>в людном месте, если вы в одном городе</span></div>
          <div class="deal__or">или</div>
          <div class="deal__opt"><span class="deal__ic"><svg viewBox="0 0 48 48"><g class="dbox"><path d="M8 16 24 8l16 8v18l-16 8-16-8Z" fill="#F7EBDD" stroke="#16181D" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 16l16 8 16-8M24 24v18" fill="none" stroke="#16181D" stroke-width="2.5" stroke-linejoin="round"/><path d="m16 12 16 8" stroke="#FF4F3A" stroke-width="3"/></g></svg></span><b>Отправка</b><span>Почтой России, СДЭК, Boxberry — оформляете сами</span></div></div></div>
        <div class="scene sc-done" data-scene="done"><div class="done-ring"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke="#FFEDEA" stroke-width="8"/><circle class="done-arc" cx="40" cy="40" r="34" fill="none" stroke="#FF4F3A" stroke-width="8" stroke-linecap="round" pathLength="1"/><path class="done-chk" d="m27 41 9 9 17-19" fill="none" stroke="#16181D" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg></div><div class="done-tag">Продано — объявление снято</div></div>
        <div class="scene sc-find" data-scene="find"><div class="mini-search"><span class="mini-search__txt"></span><i class="mini-search__go"></i></div><div class="mini-grid"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
        <div class="scene sc-check" data-scene="check"><div class="check-item"><div class="check-item__img"></div><ul><li>Внешний вид</li><li>Всё работает</li><li>Комплект</li></ul></div></div>
        <div class="how__progress"><i id="howBar"></i></div>
      </div>
    </div>

    <section class="ba" data-rv>
      <div class="ba__t"><h2 class="h2">Как продать быстрее</h2><p>Одно и то же объявление — две судьбы. Потяните ползунок и сравните.</p>
        <ul class="ba__list"><li><b>Фото при дневном свете</b>Несколько ракурсов, без лишнего на фоне.</li><li><b>Понятное название</b>Что, модель, размер: «Велосипед детский, 20″».</li><li><b>Честное описание</b>Состояние, недостатки, что в комплекте.</li><li><b>Цена по рынку</b>Посмотрите похожие объявления — и чуть ниже.</li></ul></div>
      <div class="ba__cmp" id="baCmp" style="--x:50%">
        <div class="ba__side ba__bad"><div class="ba__card"><div class="ba__img ba__img--bad">${window.VO_ILL.bike}</div><b>продам</b><span>цена договорная</span><small>без описания</small></div><em>Так себе</em></div>
        <div class="ba__side ba__good"><div class="ba__card"><div class="ba__img">${window.VO_ILL.bike}</div><b>18 500 ₽</b><span>Горный велосипед, 27,5″, рама M</span><small>Два сезона, новая цепь и колодки. Подойдёт на рост 170–185 см.</small></div><em>Отлично</em></div>
        <input type="range" min="0" max="100" value="50" aria-label="Сравнение: сдвиньте ползунок" id="baR"><span class="ba__h" aria-hidden="true"></span>
      </div>
    </section>

    <section class="vs" data-rv><h2 class="h2">Встреча или отправка?</h2>
      <div class="vs__g">
        <article class="vs__c"><span class="vs__ic">${I('<path d="M12 21s-6.5-5.9-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.1 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.3"/>', 26)}</span><h3>Встреча</h3><p>Если вы в одном городе.</p><ul><li class="p">Можно всё проверить до оплаты</li><li class="p">Быстро и без комиссий</li><li class="m">Нужно выбрать время и место</li></ul></article>
        <article class="vs__c"><span class="vs__ic">${I('<path d="M3 8 12 3l9 5v8l-9 5-9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/>', 26)}</span><h3>Отправка</h3><p>Если вы в разных городах.</p><ul><li class="p">Оплата при получении — наложенный платёж</li><li class="p">Трек-номер на сайте службы</li><li class="m">Доставку оплачивает покупатель</li></ul></article>
      </div></section>

    <div class="facts" data-rv>
      <article class="fact"><span class="fact__ic">₽0</span><h3>Размещение бесплатно</h3><p>Никаких платных тарифов и скрытых комиссий.</p></article>
      <article class="fact"><span class="fact__ic">${I('<path d="M4.5 4.5h10a5.5 5.5 0 0 1 0 11H8.5l-4 4Z"/>', 26)}</span><h3>Напрямую</h3><p>Деньги через сайт не проходят — вы договариваетесь с человеком сами.</p></article>
      <article class="fact"><span class="fact__ic">${I('<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/>', 26)}</span><h3>Номер под защитой</h3><p>Телефон виден только если вы разрешили, и только вошедшим.</p></article>
    </div>
  </div>`);
  const HOW = {
    sell: [["Разместите объявление", "Фото, название, цена — и готово. Бесплатно.", "post"], ["Отвечайте покупателям", "Вопросы придут в сообщения на сайте.", "chat"], ["Договоритесь о передаче", "Встреча или посылка — как удобно обоим.", "deal"], ["Передайте вещь", "Получите оплату при передаче и снимите объявление.", "done"]],
    buy: [["Найдите нужное", "Умный поиск, фильтры категорий и выбор города.", "find"], ["Напишите продавцу", "Уточните детали, попросите ещё фото или видео.", "chat"], ["Договоритесь", "Встреча в людном месте или отправка с оплатой при получении.", "deal"], ["Проверьте и заберите", "Осмотрите вещь до оплаты — это нормально.", "check"]],
  };
  let role = "sell", hi = 0, ht = 0, tt = 0;
  function howShow(i) {
    hi = i; const steps = HOW[role];
    $$("#howSteps li", how).forEach((li, k) => li.classList.toggle("is-on", k === i));
    $$(".scene", how).forEach(s => s.classList.remove("is-on"));
    const el = $(`.scene[data-scene="${steps[i][2]}"]`, how); void el.offsetWidth; el.classList.add("is-on");
    if (steps[i][2] === "find") { clearTimeout(tt); const t = $(".mini-search__txt", how), w = "велосипед до 20 тыс"; let k = 0; t.textContent = ""; const s = () => { t.textContent = w.slice(0, ++k); if (k < w.length) tt = setTimeout(s, 90); }; tt = setTimeout(s, 300); }
    $$(".mini-grid i", how).forEach((m, k) => m.style.setProperty("--k", k));
    const bar = $("#howBar", how); bar.style.transition = "none"; bar.style.transform = "scaleX(0)"; void bar.offsetWidth;
    if (!VO.reduce) { bar.style.transition = "transform 4800ms linear"; bar.style.transform = "scaleX(1)"; }
    clearTimeout(ht); if (!VO.reduce) ht = setTimeout(() => { if (VO.current() === "how") howShow((hi + 1) % 4); }, 4800);
  }
  const howRender = () => { $("#howSteps", how).innerHTML = HOW[role].map(([t, d], i) => `<li><button type="button" data-step="${i}"><span class="n">${i + 1}</span><b>${t}</b><span>${d}</span></button></li>`).join(""); howShow(0); };
  how.addEventListener("click", e => {
    const b = e.target.closest("[data-step]"); if (b) howShow(+b.dataset.step);
    const r = e.target.closest("[data-role]"); if (r) { role = r.dataset.role; VO.selectTab($("#howSeg", how), r); howRender(); }
  });
  $("#baR", how).addEventListener("input", e => $("#baCmp", how).style.setProperty("--x", e.target.value + "%"));

  /* ================= БЕЗОПАСНОСТЬ ================= */
  const CHECK = ["Встреча днём в людном месте", "Предупредил(а) близких, куда иду", "Проверю вещь до оплаты", "Не переводил(а) предоплату", "Не сообщал(а) коды из СМС", "Сохранил(а) переписку"];
  const FLAGS = [["SMS", "Просят код из СМС", "Коды нужны только вам. Их не спрашивают ни покупатели, ни «поддержка».", "Прекратите разговор и никому не называйте код."],
    ["🔗", "Ссылка «на оплату»", "Поддельные страницы доставки и «безопасной сделки» крадут данные карт.", "Оформляйте отправку сами на официальном сайте службы."],
    ["%", "Цена слишком хороша", "Новый телефон вдвое дешевле рынка — повод насторожиться.", "Сравните с похожими объявлениями и не спешите."],
    ["⏱", "Торопят и давят", "«Решайте сейчас, иначе заберут» — классический приём.", "Возьмите паузу: честный продавец подождёт."],
    ["₽", "Предоплата чужому", "Перевод «на карту брата» или по чужому номеру.", "Платите только при получении — лично или наложенным платежом."],
    ["?", "Уходят от вопросов", "Не присылают доп. фото, видео или отказываются от встречи.", "Лучше пройти мимо — вариантов много."]];
  const safety = VO.page("safety", `<div class="wrap">
    <header class="ph ph--split"><div><span class="ph__eyebrow">Безопасность</span><h1 class="ph__title">Честно о том,<br><span class="hl-u">как всё устроено</span></h1>
      <p class="ph__lead">Мы — витрина: помогаем найти друг друга, но в сделке не участвуем. Деньги через сайт не проходят, оплату и доставку мы не проводим. Поэтому главное — договариваться внимательно. Простые правила ниже защищают лучше любых обещаний.</p></div>
      <div class="shield" aria-hidden="true"><svg viewBox="0 0 160 170"><path class="shield__b" d="M80 10 22 34v44c0 38 25 64 58 80 33-16 58-42 58-80V34Z" fill="#16181D"/><path class="shield__c" d="m54 86 18 18 36-38" fill="none" stroke="#FF4F3A" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg><span class="shield__ring"></span><span class="shield__ring shield__ring--2"></span></div></header>
    <div class="flow" data-rv><div class="flow__n"><span>1</span><b>Вы находите объявление</b><small>на нашем сайте</small></div><div class="flow__a"></div><div class="flow__n"><span>2</span><b>Договариваетесь</b><small>напрямую, в переписке</small></div><div class="flow__a"></div><div class="flow__n flow__n--you"><span>3</span><b>Передаёте вещь и деньги</b><small>между собой — без нас</small></div></div>

    <section class="chk" data-rv><div class="chk__t"><h2 class="h2">Чек-лист перед встречей</h2><p>Отметьте пункты — и спокойно идите на встречу.</p><div class="chk__ring" id="chkRing"></div></div>
      <ul class="chk__l" id="chkL">${CHECK.map((c, i) => `<li><label><input type="checkbox" data-c="${i}"><span class="chk__box"></span>${c}</label></li>`).join("")}</ul></section>

    <section class="parcel" data-rv><h2 class="h2">Как безопасно получить посылку</h2>
      <div class="parcel__road"><span class="parcel__box" aria-hidden="true">${I('<path d="M3 8 12 3l9 5v8l-9 5-9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/>', 22)}</span>
        <div class="parcel__st"><b>1. Продавец отправляет</b><span>наложенным платежом через Почту России или СДЭК — оформляет сам на сайте службы</span></div>
        <div class="parcel__st"><b>2. Трек-номер</b><span>проверяете его только на официальном сайте службы доставки</span></div>
        <div class="parcel__st"><b>3. Осмотр в пункте выдачи</b><span>вскрываете посылку при сотруднике, если служба это позволяет</span></div>
        <div class="parcel__st"><b>4. Оплата</b><span>платите в пункте выдачи — только если всё в порядке</span></div></div></section>

    <h2 class="h2" data-rv>Мошенник или нет? Проверьте себя</h2>
    <div class="quiz" data-rv><div class="quiz__card" id="quizCard"><span class="quiz__n" id="quizN"></span><p class="quiz__q" id="quizQ"></p>
      <div class="quiz__btns"><button class="btn btn--ghost" data-a="ok">Всё в порядке</button><button class="btn btn--ink" data-a="bad">Подозрительно</button></div>
      <div class="quiz__ans" id="quizA" hidden><b></b><p></p><button class="btn btn--accent" id="quizNext">Дальше</button></div></div><div class="quiz__dots" id="quizDots"></div></div>

    <h2 class="h2" data-rv>Красные флаги <small class="muted">нажмите на карточку</small></h2>
    <div class="flags" data-rv>${FLAGS.map(([i, t, d, a]) => `<button type="button" class="flip"><span class="flip__in"><span class="flip__f flag"><i>${i}</i><b>${t}</b><span>${d}</span></span><span class="flip__b"><small>Что делать</small><b>${a}</b></span></span></button>`).join("")}</div>

    <div class="sos" data-rv><div class="sos__head"><b>Если что-то пошло не так</b><span>Действуйте быстро — так больше шансов всё исправить.</span></div>
      <ol class="sos__steps"><li><b>Позвоните в банк</b>по номеру на обороте карты и заблокируйте её.</li><li><b>Сохраните переписку</b>скриншоты, номера, ссылки и трек-номера.</li><li><b>Напишите нам</b>мы скроем объявление и заблокируем автора.</li><li><b>Обратитесь в полицию</b>с заявлением и всем, что сохранили.</li></ol>
      <a class="btn btn--ink" href="#/contact?topic=Жалоба">Пожаловаться</a></div>
  </div>`);
  const ringSvg = (pct) => { const c = 2 * Math.PI * 44; return `<svg viewBox="0 0 100 100" width="120" height="120"><circle cx="50" cy="50" r="44" fill="none" stroke="#F4F5F7" stroke-width="10"/><circle cx="50" cy="50" r="44" fill="none" stroke="${pct === 100 ? "#2F9E6E" : "#FF4F3A"}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" transform="rotate(-90 50 50)" style="transition:stroke-dashoffset .6s var(--spring)"/><text x="50" y="55" text-anchor="middle" font-weight="800" font-size="20" fill="#16181D">${pct === 100 ? "Готово" : pct + "%"}</text></svg>`; };
  const chkUpd = () => { const n = $$("#chkL input:checked", safety).length; $("#chkRing", safety).innerHTML = ringSvg(Math.round(n / CHECK.length * 100)); };
  safety.addEventListener("change", e => { if (e.target.closest("#chkL")) chkUpd(); });
  chkUpd();
  safety.addEventListener("click", e => { const f = e.target.closest(".flip"); if (f) f.classList.toggle("on"); });
  const QUIZ = [
    ["Покупатель просит продиктовать код из СМС, «чтобы перевести вам деньги».", "bad", "Код из СМС нужен только вам. С ним могут списать деньги или угнать аккаунт."],
    ["Продавец предлагает встретиться днём у входа в торговый центр и проверить телефон на месте.", "ok", "Отличный вариант: людное место и проверка до оплаты."],
    ["Собеседник присылает ссылку «на оформление доставки», где нужно ввести данные карты.", "bad", "Это поддельная страница. Доставку оформляйте сами на официальном сайте службы."],
    ["Продавец отправляет посылку наложенным платежом — оплата при получении.", "ok", "Надёжно: платите, только когда увидели посылку."],
    ["Новый ноутбук за полцены, но только если переведёте предоплату сегодня.", "bad", "Слишком низкая цена и спешка — два главных признака обмана."],
    ["Покупатель просит прислать ещё пару фото и видео, что вещь работает.", "ok", "Нормальная просьба — честный продавец легко её выполнит."],
  ];
  let qi = 0, qs = [];
  function quiz() {
    const card = $("#quizCard", safety); card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
    $("#quizA", safety).hidden = true; $(".quiz__btns", safety).hidden = false;
    if (qi >= QUIZ.length) { const ok = qs.filter(Boolean).length; $("#quizN", safety).textContent = "Итог"; $("#quizQ", safety).textContent = ok === QUIZ.length ? `Все ${ok} из ${QUIZ.length}. Вас не проведёшь.` : `${ok} из ${QUIZ.length}. Перечитайте красные флаги ниже — и всё получится.`; $(".quiz__btns", safety).hidden = true; const a = $("#quizA", safety); a.hidden = false; $("b", a).textContent = ""; $("p", a).textContent = ""; $("#quizNext", safety).textContent = "Пройти ещё раз"; }
    else { $("#quizN", safety).textContent = `Ситуация ${qi + 1} из ${QUIZ.length}`; $("#quizQ", safety).textContent = QUIZ[qi][0]; $("#quizNext", safety).textContent = qi === QUIZ.length - 1 ? "Результат" : "Дальше"; }
    $("#quizDots", safety).innerHTML = QUIZ.map((_, k) => `<i class="${k === qi ? "cur" : qs[k] === true ? "good" : qs[k] === false ? "miss" : ""}"></i>`).join("");
  }
  $(".quiz__btns", safety).addEventListener("click", e => { const b = e.target.closest("[data-a]"); if (!b) return; const right = b.dataset.a === QUIZ[qi][1]; qs[qi] = right; const a = $("#quizA", safety), t = $("b", a); t.textContent = right ? "Верно" : "Не совсем"; t.className = right ? "ok" : "bad"; $("p", a).textContent = QUIZ[qi][2]; a.hidden = false; $(".quiz__btns", safety).hidden = true; });
  $("#quizNext", safety).addEventListener("click", () => { if (qi >= QUIZ.length) { qi = 0; qs = []; } else qi++; quiz(); });

  /* ================= ПОМОЩЬ ================= */
  const TOPICS = [["ads", "Объявления", "Размещение, правила, снятие", I('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/>', 26)], ["acc", "Аккаунт", "Вход, профиль, данные", I('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>', 26)], ["deal", "Сделки", "Оплата, доставка, встреча", I('<path d="M3 8 12 3l9 5v8l-9 5-9-5Z"/><path d="M3 8l9 5 9-5"/>', 26)], ["safe", "Безопасность", "Мошенники, жалобы", I('<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/>', 26)], ["site", "О сайте", "Бета-версия, cookie", I('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>', 26)]];
  const FAQ = [
    ["ads", "Сколько стоит разместить объявление?", "Нисколько. Размещение бесплатное, платных функций сейчас нет."],
    ["ads", "Как разместить объявление?", "Нажмите «Разместить объявление» в шапке, войдите по почте, выберите категорию, заполните характеристики, цену, описание и добавьте до 5 фото. Шкала «Качество объявления» подскажет, что ещё добавить."],
    ["ads", "Как отредактировать или снять объявление?", "Личный кабинет → «Мои объявления». Там можно отредактировать, снять с публикации, вернуть в ленту, поделиться или удалить. Раз в сутки объявление можно бесплатно поднять наверх ленты."],
    ["ads", "Что нельзя продавать?", "Всё, что запрещено законом РФ: оружие и боеприпасы, наркотики, рецептурные лекарства, поддельные документы, чужие персональные данные и т. п. Полный список — в Правилах размещения."],
    ["ads", "Почему нельзя писать телефон и ссылки в описании?", "Так мы защищаем от спама и мошенников. Если хотите, чтобы вам звонили, включите показ номера в профиле — его увидят только вошедшие пользователи."],
    ["acc", "Как войти или зарегистрироваться?", "Нажмите «Войти», укажите почту и введите код из письма. Пароль не нужен; если аккаунта нет, он создастся автоматически. При первом входе попросим имя и телефон."],
    ["acc", "Кто увидит мой номер телефона?", "Никто, пока вы сами не включите показ в профиле. Даже тогда номер видят только вошедшие пользователи — это защищает от автоматического сбора номеров."],
    ["acc", "Не приходит код на почту", "Проверьте папку «Спам» и правильность адреса. Через минуту код можно отправить ещё раз. После 5 неверных попыток вход блокируется на 5 минут."],
    ["acc", "Как скачать или удалить свои данные?", "Личный кабинет → «Безопасность»: там есть кнопки «Скачать мои данные» и «Удалить аккаунт»."],
    ["deal", "Можно ли оплатить покупку через сайт?", "Нет. Мы доска объявлений: деньги через сайт не проходят. Вы договариваетесь и рассчитываетесь с продавцом напрямую."],
    ["deal", "Как получить вещь из другого города?", "Договоритесь об отправке через Почту России, СДЭК, Boxberry или другую службу. Надёжнее всего наложенный платёж: оплата при получении, после осмотра."],
    ["deal", "Кто отвечает за сделку?", "Покупатель и продавец. Мы не участвуем в расчётах и доставке, но блокируем нарушителей и подсказываем, как договориться безопасно."],
    ["safe", "Как распознать мошенника?", "Настораживают просьбы о коде из СМС, ссылки «на оплату» или «доставку», предоплата третьему лицу, давление и слишком низкая цена. Подробнее — на странице «Безопасность»."],
    ["safe", "Как пожаловаться на объявление?", "На странице объявления нажмите «Пожаловаться» и выберите причину. Или напишите нам с темой «Жалоба». Жалобы рассматриваем в первую очередь."],
    ["site", "Что значит «бета-версия»?", "Сайт только запустился: мы добавляем функции (например, чаты) и исправляем ошибки. Будем рады отзывам."],
    ["site", "Зачем сайту cookie?", "Технические cookie нужны для входа и настроек. Аналитические и рекламные — только с вашего согласия; выбор можно изменить в баннере cookie. Подробнее — в Политике cookie."],
    ["site", "Как с вами связаться?", `Через страницу «Написать нам», по почте ${C.email} или в мессенджерах — кнопка связи есть в правом нижнем углу.`],
  ];
  const help = VO.page("help", `<div class="wrap wrap--narrow">
    <header class="ph ph--center"><span class="ph__eyebrow">Помощь</span><h1 class="ph__title">Чем помочь?</h1>
      <label class="help-search">${I('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 4.5 4.5"/>', 20)}<input id="helpQ" type="search" placeholder="Например: как снять объявление" aria-label="Поиск по вопросам"><span class="help-search__n" id="helpN"></span></label></header>
    <div class="topics-g">${TOPICS.map(([k, n, d, ic]) => `<button type="button" class="topic" data-g="${k}"><span class="topic__ic">${ic}</span><b>${n}</b><small>${d}</small><em>${FAQ.filter(f => f[0] === k).length}</em></button>`).join("")}</div>
    <div class="faq-h"><h2 id="faqT">Популярные вопросы</h2><button type="button" class="link" id="faqAll" hidden>Показать все</button></div>
    <div class="faq" id="faq"></div>
    <div class="empty" id="faqEmpty" hidden><b>Такого вопроса пока нет</b><span>Напишите нам — ответим и добавим его сюда.</span><div class="empty__acts"><a class="btn btn--ink" href="#/contact">Написать нам</a></div></div>
    <div class="cta-band" data-rv><div><b>Не нашли ответ?</b><span>Напишите нам — разберёмся вместе.</span></div><a class="btn btn--light" href="#/contact">Написать нам</a></div>
  </div>`);
  let g = null;
  function faq() {
    const q = $("#helpQ", help).value.trim().toLowerCase();
    const rx = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi") : null;
    const hl = s => rx ? esc(s).replace(rx, m => `<mark>${m}</mark>`) : esc(s);
    let list = FAQ.filter(([k, t, a]) => (!g || k === g) && (!q || (t + " " + a).toLowerCase().includes(q)));
    if (!q && !g) list = list.filter((_, i) => [0, 1, 6, 9, 10, 12].includes(FAQ.indexOf(_)));
    $("#faq", help).innerHTML = list.map(([, t, a], i) => `<div class="qa-i${q && i === 0 ? " open" : ""}" style="--i:${i}"><button type="button" aria-expanded="${!!q && i === 0}">${hl(t)}</button><div class="qa-i__a"><div><p>${hl(a)}</p></div></div></div>`).join("");
    $("#faqEmpty", help).hidden = list.length > 0;
    $("#faqT", help).textContent = q ? "Результаты поиска" : g ? TOPICS.find(t => t[0] === g)[1] : "Популярные вопросы";
    $("#faqAll", help).hidden = !g && !q;
    $("#helpN", help).textContent = q ? list.length + " " + VO.plural(list.length, "ответ", "ответа", "ответов") : "";
    $$(".topic", help).forEach(t => t.classList.toggle("on", t.dataset.g === g));
  }
  help.addEventListener("click", e => {
    const b = e.target.closest(".qa-i > button"); if (b) { const on = b.parentElement.classList.toggle("open"); b.setAttribute("aria-expanded", on); }
    const t = e.target.closest(".topic"); if (t) { g = g === t.dataset.g ? null : t.dataset.g; faq(); $("#faqT", help).scrollIntoView({ behavior: "smooth", block: "start" }); }
    if (e.target.closest("#faqAll")) { g = null; $("#helpQ", help).value = ""; faq(); }
  });
  $("#helpQ", help).addEventListener("input", faq);

  /* ================= НАПИСАТЬ НАМ ================= */
  const WAYS = [["tg", "Telegram", "Быстрее всего", C.tg], ["wa", "WhatsApp", "Пишите в любое время", C.wa], ["max", "MAX", "Российский мессенджер", C.max], ["mail", "Почта", C.email, "mailto:" + C.email], ["phone", "Телефон", C.phone, "tel:" + C.tel]];
  const contact = VO.page("contact", `<div class="wrap">
    <div class="contact">
      <div class="contact__side">
        <span class="ph__eyebrow">Написать нам</span><h1 class="ph__title">Мы на связи</h1>
        <p class="ph__lead">Вопрос, идея, жалоба на объявление — пишите. Сайт только запустился, поэтому каждое сообщение читаем сами.</p>
        <div class="ways">${WAYS.map(([k, n, d, href]) => `<a class="way" href="${href}"${/^https/.test(href) ? ' target="_blank" rel="noopener"' : ""}><span class="way__ic">${BI[k]}</span><span><b>${n}</b><small>${esc(d)}</small></span>${VO.ico.chev}</a>`).join("")}</div>
        <p class="muted">Отвечаем обычно в течение рабочего дня. Жалобы на объявления — в первую очередь.</p>
      </div>
      <form class="form cform" id="contactForm" novalidate>
        <div class="cform__chat" aria-hidden="true"><div class="cform__head"><span class="cform__ava"><svg viewBox="0 0 150 214" width="16"><g transform="translate(20 4)" stroke-linejoin="round" stroke-width="10"><path d="M5 5H78A38 38 0 0 1 78 81H5Z" fill="#FF4F3A" stroke="#FF4F3A"/><path d="M5 97H84A44 44 0 0 1 84 185H30L5 207Z" fill="#fff" stroke="#fff"/></g></svg></span><span><b>Команда «Все объявления»</b><small>обычно отвечает в течение дня</small></span></div>
          <div class="bub bub--in">Здравствуйте! Чем можем помочь?</div><div class="bub bub--out cform__prev" id="cPrev" hidden></div></div>
        <fieldset class="topics" id="topics"><legend>Тема</legend>${["Вопрос", "Проблема с объявлением", "Жалоба", "Идея", "Реклама", "Другое"].map((t, i) => `<label><input type="radio" name="topic" value="${t}"${i ? "" : " checked"}><span>${t}</span></label>`).join("")}</fieldset>
        <div class="row2 row2--eq"><div class="field"><input id="cName" name="name" placeholder=" " autocomplete="name" maxlength="60"><label for="cName">Как вас зовут</label><em>Напишите имя</em></div>
          <div class="field"><input id="cMail" name="email" type="email" placeholder=" " autocomplete="email" maxlength="120"><label for="cMail">Почта для ответа</label><em>Проверьте адрес</em></div></div>
        <div class="field field--area"><textarea id="cMsg" name="msg" placeholder=" " rows="5" maxlength="2000"></textarea><label for="cMsg">Сообщение</label><em>Напишите хотя бы пару слов</em><small class="count" id="cCount">0 / 2000</small></div>
        <label class="check"><input type="checkbox" id="cAgree"><span></span><span>Согласен(на) на <a href="#/doc/consent">обработку персональных данных</a> для ответа на обращение</span></label>
        <button class="btn btn--ink btn--lg btn--send" type="submit"><span>Отправить</span>${VO.ico.msg}</button>
        <div class="sent" id="sent" hidden><div class="sent__bub"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 12.5 4 4 8-9"/></svg></div><b>Почти готово</b><span>Открыли вашу почтовую программу с готовым письмом — осталось нажать «Отправить». Не открылась? Напишите на <a href="mailto:${C.email}">${C.email}</a>.</span><button class="btn btn--ghost" type="button" id="sentAgain">Написать ещё</button></div>
      </form>
    </div></div>`);
  const cf = $("#contactForm", contact);
  cf.addEventListener("input", e => {
    const f = e.target.closest(".field"); if (f) f.classList.remove("bad");
    if (e.target.id === "cMsg") { $("#cCount", contact).textContent = `${e.target.value.length} / 2000`; const p = $("#cPrev", contact); p.hidden = !e.target.value.trim(); p.textContent = e.target.value.trim().slice(0, 220) + (e.target.value.length > 220 ? "…" : ""); }
  });
  cf.addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#cName", cf).value.trim(), mail = $("#cMail", cf).value.trim(), msg = $("#cMsg", cf).value.trim(), topic = new FormData(cf).get("topic");
    const ok = [VO.check($("#cName", cf).parentElement, name.length > 1), VO.check($("#cMail", cf).parentElement, VO.MAIL_RX.test(mail)), VO.check($("#cMsg", cf).parentElement, msg.length > 4)].every(Boolean);
    if (!ok) return;
    if (!$("#cAgree", cf).checked) return VO.toast("Отметьте согласие на обработку данных — иначе мы не сможем ответить");
    const last = VO.store.get("vo_contact_t", 0); if (Date.now() - last < 30e3) return VO.toast("Сообщение уже отправлено. Подождите полминуты перед следующим");
    VO.store.set("vo_contact_t", Date.now());
    // Сервера пока нет — отправляем через почтовую программу пользователя на почту владельца
    const body = `${msg}\n\n— ${name}, ${mail}`;
    location.href = `mailto:${C.email}?subject=${encodeURIComponent("[Все объявления] " + topic)}&body=${encodeURIComponent(body)}`;
    $(".btn--send", cf).classList.add("flying");
    setTimeout(() => { $("#sent", contact).hidden = false; $(".btn--send", cf).classList.remove("flying"); }, VO.reduce ? 0 : 600);
  });
  $("#sentAgain", contact).addEventListener("click", () => { cf.reset(); $("#cPrev", contact).hidden = true; $("#cCount", contact).textContent = "0 / 2000"; $("#sent", contact).hidden = true; });

  VO.routes.how = () => { const fresh = VO.show("how", "Как это работает"); if (fresh) howRender(); };
  VO.routes.safety = () => { const fresh = VO.show("safety", "Безопасность"); if (fresh) { qi = 0; qs = []; quiz(); } };
  VO.routes.help = (p, q) => { VO.show("help", "Помощь"); g = null; $("#helpQ", help).value = q.get("q") || ""; faq(); };
  VO.routes.contact = (p, q) => {
    VO.show("contact", "Написать нам");
    const t = q.get("topic"); if (t) { const r = $(`#topics input[value="${t}"]`, contact); if (r) r.checked = true; }
    const u = VO.user(); if (u) { if (!$("#cName", cf).value) $("#cName", cf).value = u.name || ""; if (!$("#cMail", cf).value) $("#cMail", cf).value = u.email; }
  };
})();
