/* Страница «Реклама на сайте» */
(() => {
  const { $, esc } = VO;
  const C = window.VO_CONTACTS, BI = window.VO_BRAND_ICONS;
  const page = VO.page("advertise", `<div class="wrap">
    <section class="adv-hero">
      <div><span class="ph__eyebrow">Реклама на сайте</span><h1 class="ph__title">Расскажите о себе тем,<br>кто <span class="hl-u">уже ищет</span></h1>
        <p class="ph__lead">Люди приходят на «Все объявления» с конкретной задачей: купить, продать, найти мастера или работу. Реклама рядом с подходящими объявлениями работает как подсказка, а не как шум.</p>
        <div class="hero2__cta"><a class="btn btn--accent btn--lg" href="#/contact?topic=Реклама">Обсудить размещение</a><a class="btn btn--ghost btn--lg" href="mailto:${C.email}?subject=${encodeURIComponent("Реклама на сайте")}">Написать на почту</a></div></div>
      <div class="adv-mock" aria-hidden="true">
        <div class="adv-mock__bar"><i></i><i></i><i></i></div>
        <div class="adv-mock__grid"><span></span><span></span><span class="adv-mock__ad"><small>Реклама</small><b>Ваше предложение</b></span><span></span><span></span><span></span></div>
      </div>
    </section>

    <h2 class="h2" data-rv>Где можно разместиться</h2>
    <div class="adv-places" data-rv>
      <article class="adv-pl"><div class="adv-pl__v adv-pl__v--menu"><i></i><i></i><i></i><b>Реклама</b></div><h3>Меню категорий</h3><p>Блок в правой колонке меню «Категории». Его видят все, кто выбирает раздел.</p><ul><li>Подходит для узнаваемости</li><li>Можно привязать к конкретной категории</li></ul></article>
      <article class="adv-pl"><div class="adv-pl__v adv-pl__v--feed"><i></i><i></i><b>Реклама</b><i></i></div><h3>Карточка в ленте</h3><p>Выглядит как объявление, но с пометкой «Реклама». Показывается среди объявлений нужной категории или города.</p><ul><li>Высокая заметность</li><li>Таргет по категории и городу</li></ul></article>
      <article class="adv-pl"><div class="adv-pl__v adv-pl__v--page"><i></i><b>Реклама</b></div><h3>Страница объявления</h3><p>Ненавязчивый блок под похожими объявлениями. Хорошо работает для сопутствующих товаров и услуг.</p><ul><li>Для сервисов и мастеров</li><li>Рядом с тематическим контентом</li></ul></article>
    </div>

    <section class="adv-who" data-rv>
      <h2 class="h2">Кому подходит</h2>
      <div class="adv-who__g">${[["Мастера и сервисы", "Ремонт, перевозки, уборка — рядом с объявлениями о технике и мебели"], ["Магазины и бренды", "Новые товары рядом с теми, кто ищет б/у"], ["Автосервисы и шиномонтаж", "Рядом с объявлениями об авто и запчастях"], ["Школы и курсы", "Для тех, кто ищет работу и подработку"], ["Зоомагазины и клиники", "В категории «Животные»"], ["Местный бизнес", "Таргет на конкретный город"]].map(([t, d]) => `<div><b>${t}</b><span>${d}</span></div>`).join("")}</div>
    </section>

    <section class="adv-rules" data-rv>
      <div><h2 class="h2">Наши правила</h2><p class="muted">Мы бережём доверие пользователей, поэтому к рекламе есть требования.</p></div>
      <ol>${["Каждый блок помечен словом «Реклама» и данными рекламодателя — как требует закон «О рекламе»", "Реклама маркируется и регистрируется в ЕРИР через оператора рекламных данных", "Не размещаем казино, финансовые пирамиды, 18+, лекарства без лицензии и всё, что запрещено законом", "Никаких всплывающих окон, автозвука и рекламы, мешающей пользоваться сайтом", "Ссылки ведут только на официальные сайты и страницы рекламодателя"].map(t => `<li>${t}</li>`).join("")}</ol>
    </section>

    <section class="adv-steps" data-rv>
      <h2 class="h2">Как разместиться</h2>
      <div class="adv-steps__g">${[["Напишите нам", "Расскажите о продукте, городе и аудитории"], ["Подберём формат", "Предложим места и сроки показа"], ["Согласуем макет", "Поможем с текстом и картинкой, промаркируем рекламу"], ["Запускаем", "После запуска пришлём отчёт о показах и переходах"]].map(([t, d], i) => `<div><i>${i + 1}</i><b>${t}</b><span>${d}</span></div>`).join("")}</div>
      <p class="muted">Стоимость и условия обсуждаем индивидуально — зависят от формата, категории и срока.</p>
    </section>

    <section class="adv-cta" data-rv>
      <div><b>Обсудим размещение?</b><span>Ответим в течение рабочего дня.</span></div>
      <div class="adv-cta__w">${[["tg", "Telegram", C.tg], ["wa", "WhatsApp", C.wa], ["max", "MAX", C.max], ["mail", C.email, "mailto:" + C.email + "?subject=" + encodeURIComponent("Реклама на сайте")]].map(([k, n, h]) => `<a href="${h}"${/^https/.test(h) ? ' target="_blank" rel="noopener"' : ""}><span class="way__ic">${BI[k]}</span>${esc(n)}</a>`).join("")}</div>
    </section>
  </div>`);
  VO.routes.advertise = () => VO.show("advertise", "Реклама на сайте");
})();
