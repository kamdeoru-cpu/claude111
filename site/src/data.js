/* Иллюстрации для тестовых объявлений: плоские, в цветах бренда.
   Группа .it — сам предмет (её двигает анимация), .sh — тень под ним. */
window.VO_ILL = (() => {
  const I = "#16181D", C = "#FF4F3A", W = "#FFFFFF", G = "#2F9E6E", CD = "#E8412D";
  const sh = (w = 46) => `<ellipse class="sh" cx="100" cy="134" rx="${w}" ry="6" fill="${I}" opacity=".12"/>`;
  const s = (body, w) => `<svg viewBox="0 0 200 150" aria-hidden="true">${sh(w)}<g class="it">${body}</g></svg>`;
  return {
    phone: s(`<rect x="72" y="16" width="56" height="108" rx="12" fill="${I}"/><rect x="77" y="23" width="46" height="94" rx="7" fill="${C}"/><rect x="92" y="26" width="16" height="5" rx="2.5" fill="${I}"/><path d="M86 50h20a8 8 0 0 1 0 16H92l-6 5Z" fill="${W}"/><rect x="86" y="80" width="28" height="4" rx="2" fill="${W}" opacity=".6"/><rect x="86" y="88" width="18" height="4" rx="2" fill="${W}" opacity=".6"/>`, 34),
    bike: s(`<g fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="58" cy="98" r="24" stroke="${I}" stroke-width="7"/><circle cx="142" cy="98" r="24" stroke="${I}" stroke-width="7"/><path d="M58 98 88 62h38l16 36M88 62l14 36 24-36M58 98h44" stroke="${C}" stroke-width="7"/><path d="M80 50h18M126 62l-4-18h14" stroke="${I}" stroke-width="7"/></g><circle cx="102" cy="98" r="6" fill="${I}"/>`, 70),
    sofa: s(`<rect x="46" y="44" width="108" height="42" rx="14" fill="${CD}"/><rect x="36" y="70" width="128" height="38" rx="12" fill="${C}"/><rect x="26" y="60" width="24" height="52" rx="11" fill="${I}"/><rect x="150" y="60" width="24" height="52" rx="11" fill="${I}"/><path d="M100 74v30" stroke="${CD}" stroke-width="4" stroke-linecap="round"/><rect x="40" y="110" width="8" height="14" rx="3" fill="${I}"/><rect x="152" y="110" width="8" height="14" rx="3" fill="${I}"/>`, 66),
    sneaker: s(`<path d="M38 104V74c0-8 6-14 14-14h30c6 18 22 24 44 26l22 4c10 2 16 8 16 16v4Z" fill="${C}"/><rect x="34" y="102" width="138" height="14" rx="7" fill="${I}"/><path d="M84 66l8 10M92 62l8 10M100 60l8 10" stroke="${W}" stroke-width="4" stroke-linecap="round"/><path d="M60 96c20-2 40-10 56-6" stroke="${W}" stroke-width="5" fill="none" stroke-linecap="round"/>`, 66),
    camera: s(`<rect x="64" y="34" width="36" height="18" rx="5" fill="${I}"/><rect x="40" y="46" width="120" height="76" rx="14" fill="${I}"/><rect x="40" y="62" width="120" height="10" fill="${C}"/><circle cx="100" cy="86" r="30" fill="${W}"/><circle cx="100" cy="86" r="21" fill="${C}"/><circle cx="100" cy="86" r="10" fill="${I}"/><circle cx="96" cy="82" r="3" fill="${W}"/><rect x="134" y="52" width="14" height="7" rx="3" fill="${C}"/>`, 58),
    guitar: s(`<g transform="rotate(-28 100 80)"><rect x="94" y="4" width="12" height="70" rx="3" fill="${I}"/><rect x="90" y="0" width="20" height="16" rx="4" fill="${I}"/><circle cx="100" cy="70" r="22" fill="${C}"/><circle cx="100" cy="104" r="30" fill="${C}"/><circle cx="100" cy="86" r="9" fill="${I}"/><rect x="88" y="112" width="24" height="6" rx="3" fill="${I}"/></g>`, 44),
    plant: s(`<g fill="${G}"><path d="M100 88C80 86 62 70 64 44c20 2 36 18 36 44Z"/><path d="M100 84c4-24 22-40 44-38 0 24-18 38-44 38Z"/><path d="M100 92c-2-26 6-50 26-62 6 22-4 48-26 62Z" opacity=".85"/></g><path d="M100 94V60" stroke="${I}" stroke-width="4" stroke-linecap="round"/><path d="M68 94h64l-8 36H76Z" fill="${C}"/><rect x="64" y="90" width="72" height="10" rx="4" fill="${I}"/>`, 40),
    watch: s(`<rect x="84" y="10" width="32" height="130" rx="9" fill="${I}"/><circle cx="100" cy="75" r="34" fill="${W}" stroke="${I}" stroke-width="8"/><path d="M100 75V56M100 75l12 8" stroke="${I}" stroke-width="4" stroke-linecap="round"/><path d="M100 75 88 96" stroke="${C}" stroke-width="2.5" stroke-linecap="round"/><circle cx="100" cy="75" r="3.5" fill="${C}"/><rect x="132" y="70" width="8" height="10" rx="2" fill="${I}"/>`, 30),
    headphones: s(`<path d="M52 92V70a48 48 0 0 1 96 0v22" fill="none" stroke="${I}" stroke-width="10" stroke-linecap="round"/><rect x="36" y="78" width="34" height="50" rx="14" fill="${C}"/><rect x="130" y="78" width="34" height="50" rx="14" fill="${C}"/><rect x="60" y="86" width="12" height="34" rx="6" fill="${I}"/><rect x="128" y="86" width="12" height="34" rx="6" fill="${I}"/>`, 56),
    cup: s(`<g class="steam" fill="none" stroke="${I}" stroke-width="4" stroke-linecap="round" opacity=".35"><path d="M86 34c-6-8 6-12 0-20"/><path d="M104 34c-6-8 6-12 0-20"/></g><path d="M64 58h72l-8 66a6 6 0 0 1-6 6H78a6 6 0 0 1-6-6Z" fill="${C}"/><rect x="58" y="46" width="84" height="16" rx="7" fill="${I}"/><rect x="68" y="80" width="64" height="20" fill="${W}"/><path d="M92 90h16" stroke="${C}" stroke-width="4" stroke-linecap="round"/>`, 40),
    scooter: s(`<path d="M140 112 124 36" stroke="${C}" stroke-width="8" stroke-linecap="round"/><path d="M108 36h32" stroke="${I}" stroke-width="8" stroke-linecap="round"/><rect x="48" y="104" width="96" height="10" rx="5" fill="${I}"/><circle cx="56" cy="120" r="13" fill="${I}"/><circle cx="56" cy="120" r="5" fill="${W}"/><circle cx="142" cy="120" r="13" fill="${I}"/><circle cx="142" cy="120" r="5" fill="${W}"/>`, 60),
    flat: s(`<rect x="58" y="28" width="84" height="104" rx="8" fill="${C}"/><path d="M52 30h96" stroke="${I}" stroke-width="7" stroke-linecap="round"/>${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${70 + c * 22}" y="${42 + r * 24}" width="16" height="14" rx="3" fill="${r === 1 && c === 2 ? "#FFD66B" : W}"/>`).join("")).join("")}<rect x="90" y="110" width="20" height="22" rx="4" fill="${I}"/>`, 50),
    kitten: s(`<path d="M138 116c18 0 22-18 10-26" fill="none" stroke="#F08A4B" stroke-width="9" stroke-linecap="round"/><ellipse cx="100" cy="106" rx="40" ry="28" fill="#F08A4B"/><ellipse cx="100" cy="112" rx="18" ry="16" fill="${W}"/><path d="M70 50 76 26l16 16ZM130 50l-6-24-16 16Z" fill="#F08A4B"/><circle cx="100" cy="62" r="32" fill="#F08A4B"/><circle cx="88" cy="60" r="5" fill="${I}"/><circle cx="112" cy="60" r="5" fill="${I}"/><circle cx="89.5" cy="58.5" r="1.6" fill="${W}"/><circle cx="113.5" cy="58.5" r="1.6" fill="${W}"/><path d="M96 70h8l-4 4Z" fill="${C}"/><path d="M100 74c-2 4-6 4-8 2M100 74c2 4 6 4 8 2" stroke="${I}" stroke-width="2" fill="none" stroke-linecap="round"/>`, 46),
    car: s(`<path d="M30 100V86c0-6 4-10 10-11l14-3 16-18c3-3 7-5 11-5h42c5 0 9 2 12 6l14 17 12 3c6 1 10 6 10 12v13Z" fill="${C}"/><path d="M76 58h26v18H62Zm34 0h22c2 0 4 1 5 2l12 16h-39Z" fill="${W}" opacity=".9"/><rect x="26" y="96" width="148" height="14" rx="7" fill="${I}"/><circle cx="62" cy="110" r="15" fill="${I}"/><circle cx="62" cy="110" r="6" fill="${W}"/><circle cx="140" cy="110" r="15" fill="${I}"/><circle cx="140" cy="110" r="6" fill="${W}"/><rect x="160" y="86" width="12" height="6" rx="3" fill="#FFD66B"/>`, 70),
    tires: s(`<circle cx="78" cy="84" r="44" fill="${I}"/><circle cx="78" cy="84" r="22" fill="#9AA0AA"/><circle cx="78" cy="84" r="8" fill="${I}"/><g stroke="${W}" stroke-width="3" opacity=".25"><path d="M78 40v10M78 118v10M34 84h10M112 84h10M47 53l7 7M102 108l7 7M47 115l7-7M102 60l7-7"/></g><circle cx="138" cy="96" r="32" fill="${I}"/><circle cx="138" cy="96" r="16" fill="${C}"/><circle cx="138" cy="96" r="6" fill="${I}"/>`, 66),
    washer: s(`<rect x="56" y="22" width="88" height="106" rx="12" fill="${W}" stroke="${I}" stroke-width="6"/><path d="M56 44h88" stroke="${I}" stroke-width="6"/><circle cx="72" cy="33" r="3.5" fill="${C}"/><rect x="104" y="30" width="30" height="6" rx="3" fill="${I}"/><circle cx="100" cy="84" r="28" fill="${I}"/><circle cx="100" cy="84" r="20" fill="#9FD3F0"/><path class="wave-w" d="M82 88c6-6 12 6 18 0s12 6 18 0" fill="none" stroke="${W}" stroke-width="4" stroke-linecap="round"/><g transform="translate(118 96) rotate(35)"><rect x="-5" y="-4" width="10" height="34" rx="4" fill="${C}"/><circle cx="0" cy="-8" r="10" fill="none" stroke="${C}" stroke-width="7"/></g>`, 46),
    aquarium: s(`<rect x="36" y="40" width="128" height="86" rx="14" fill="#BFE3F5"/><path d="M36 56h128" stroke="${I}" stroke-width="5"/><rect x="36" y="40" width="128" height="86" rx="14" fill="none" stroke="${I}" stroke-width="6"/><path d="M60 126c0-18 6-30 2-44M70 126c0-14 8-22 6-34" stroke="${G}" stroke-width="5" fill="none" stroke-linecap="round"/><g class="fish"><path d="M104 86c10-12 30-12 36 0-6 12-26 12-36 0Z" fill="${C}"/><path d="M104 86l-12-9v18Z" fill="${C}"/><circle cx="130" cy="84" r="2.5" fill="${I}"/></g><circle cx="96" cy="68" r="3" fill="${W}"/><circle cx="102" cy="60" r="2" fill="${W}"/>`, 66),
    house: s(`<path d="M40 70 100 26l60 44" fill="none" stroke="${I}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M52 64h96v64H52Z" fill="${C}"/><path d="M120 44V28h14v26" fill="${I}"/><rect x="66" y="80" width="24" height="22" rx="4" fill="${W}"/><rect x="110" y="80" width="26" height="48" rx="4" fill="${I}"/><circle cx="130" cy="106" r="2.5" fill="#FFD66B"/><path d="M78 80v22M66 91h24" stroke="${C}" stroke-width="3"/>`, 64),
    dress: s(`<path d="M86 14h28l-2 20 16 22-10 8 28 60H54l28-60-10-8 16-22Z" fill="${C}"/><path d="M76 72h48" stroke="${CD}" stroke-width="6"/><path d="M92 14c2 10 14 10 16 0" fill="none" stroke="${I}" stroke-width="4"/><path d="M100 124V78" stroke="${CD}" stroke-width="3" opacity=".6"/>`, 48),
    gamepad: s(`<path d="M62 52h76c18 0 28 16 30 38s-4 34-16 34c-10 0-14-10-24-18H72c-10 8-14 18-24 18-12 0-18-12-16-34s12-38 30-38Z" fill="${I}"/><path d="M66 74v20M56 84h20" stroke="${W}" stroke-width="6" stroke-linecap="round"/><circle cx="134" cy="76" r="6" fill="${C}"/><circle cx="148" cy="88" r="6" fill="${W}"/><circle cx="120" cy="88" r="6" fill="${W}"/><circle cx="134" cy="100" r="6" fill="${C}"/><rect x="92" y="66" width="16" height="6" rx="3" fill="${C}"/>`, 62),
  };
})();

/* Тестовые объявления. ago — сколько минут назад; views — сколько раз уже посмотрели (демо);
   attrs — характеристики, по ним работают фильтры категорий. */
window.VO_ADS = [
  { id: "a1", cat: "tech", ill: "phone", bg: "#E3EEFB", title: "iPhone 13, 128 ГБ, синий", price: 42000, cond: "Б/у", city: "Москва", ago: 25, seller: "s1", views: 214,
    attrs: { type: "Телефоны", brand: "Apple", memory: "128 ГБ" },
    desc: "Аккумулятор 89%, всегда в чехле и со стеклом. Без сколов, Face ID работает. Коробка и кабель в комплекте.\nПроверка при встрече, могу показать работу всех функций." },
  { id: "a2", cat: "hobby", ill: "bike", bg: "#DDF3EA", title: "Горный велосипед, 27,5″, рама M", price: 18500, cond: "Б/у", city: "Казань", ago: 70, seller: "s2", bargain: true, views: 98,
    attrs: { type: "Велосипеды", wheel: "27,5″", frame: "M" },
    desc: "Катался два сезона, недавно поменял цепь и тормозные колодки. Подойдёт на рост 170–185 см." },
  { id: "a3", cat: "home", ill: "sofa", bg: "#F7EBDD", title: "Угловой диван с механизмом «еврокнижка»", price: 25000, cond: "Б/у", city: "Санкт-Петербург", ago: 180, seller: "s3", views: 156,
    attrs: { type: "Мебель", room: "Гостиная" },
    desc: "Раскладывается в спальное место 160×200. Ткань — велюр, чехлы снимаются. Самовывоз, помогу разобрать." },
  { id: "a4", cat: "wear", ill: "sneaker", bg: "#FFE4DF", title: "Кроссовки, 42 размер, новые", price: 6900, cond: "Новое", city: "Москва", ago: 12, seller: "s4", views: 41,
    attrs: { who: "Мужское", type: "Обувь", size: "42" },
    desc: "Не подошёл размер, надевал дома один раз. Есть коробка и чек." },
  { id: "a5", cat: "tech", ill: "camera", bg: "#FFF1C9", title: "Плёночный фотоаппарат «Зенит-Е»", price: 4500, cond: "Б/у", city: "Нижний Новгород", ago: 300, seller: "s5", bargain: true, views: 77,
    attrs: { type: "Фото и видео", brand: "Другой" },
    desc: "Рабочий, затвор срабатывает на всех выдержках. Объектив «Гелиос-44» без грибка и царапин." },
  { id: "a6", cat: "hobby", ill: "guitar", bg: "#ECE4FA", title: "Акустическая гитара для начинающих", price: 9000, cond: "Б/у", city: "Екатеринбург", ago: 520, seller: "s6", views: 63,
    attrs: { type: "Музыка" },
    desc: "Новые струны, отрегулирована мензура. В подарок чехол и каподастр." },
  { id: "a7", cat: "free", ill: "plant", bg: "#DDF3EA", title: "Монстера в горшке, 80 см", price: 0, cond: "Даром", city: "Москва", ago: 40, seller: "s7", views: 132,
    attrs: { type: "Растения" },
    desc: "Разрослась и не помещается в квартире. Отдам в добрые руки вместе с горшком. Забрать у м. Сокол." },
  { id: "a8", cat: "wear", ill: "watch", bg: "#E3EEFB", title: "Наручные часы, механика", price: 3200, cond: "Б/у", city: "Самара", ago: 95, seller: "s8", views: 29,
    attrs: { who: "Мужское", type: "Аксессуары" },
    desc: "Ходят точно, недавно было обслуживание. Ремешок кожаный, почти новый." },
  { id: "a9", cat: "tech", ill: "headphones", bg: "#ECE4FA", title: "Беспроводные наушники с шумоподавлением", price: 17000, cond: "Б/у", city: "Новосибирск", ago: 240, seller: "s9", views: 88,
    attrs: { type: "Аудио", brand: "Sony" },
    desc: "Полгода использования, всё работает. Держат заряд до 25 часов. Кейс и кабель есть." },
  { id: "a10", cat: "job", ill: "cup", bg: "#FFE4DF", title: "Бариста в кофейню у метро", price: 60000, per: "мес", cond: "Работа", city: "Москва", ago: 150, seller: "s10", views: 190,
    attrs: { schedule: "Сменный", exp: "Без опыта" },
    desc: "График 2/2 с 8 до 20. Обучим с нуля, чаевые — ваши. Дружная команда и бесплатный кофе." },
  { id: "a11", cat: "kids", ill: "scooter", bg: "#FFF1C9", title: "Детский самокат, от 5 лет", price: 2300, cond: "Б/у", city: "Краснодар", ago: 60, seller: "s11", views: 37,
    attrs: { age: "3–7 лет", type: "Транспорт" },
    desc: "Регулируемая высота руля, светящиеся колёса. Сын вырос — самокат в отличном состоянии." },
  { id: "a12", cat: "realty", ill: "flat", bg: "#F7EBDD", title: "Сдаю 1-комнатную квартиру, 38 м²", price: 38000, per: "мес", cond: "Аренда", city: "Санкт-Петербург", ago: 400, seller: "s12", views: 305,
    attrs: { deal: "Аренда", type: "Квартира", rooms: "1", area: 38 },
    desc: "Пять минут до метро, свежий ремонт, вся техника. Без животных. Залог — одна месячная оплата." },
  { id: "a13", cat: "free", ill: "kitten", bg: "#FFF1C9", title: "Котёнок в добрые руки", price: 0, cond: "Даром", city: "Казань", ago: 18, seller: "s13", views: 211,
    attrs: { type: "Животные" },
    desc: "Рыжий мальчик, 2,5 месяца. Приучен к лотку, ест всё. Очень ласковый и игривый." },
  { id: "a14", cat: "tech", ill: "gamepad", bg: "#E3EEFB", title: "Игровая приставка + 2 джойстика", price: 21000, cond: "Б/у", city: "Москва", ago: 800, seller: "s14", bargain: true, views: 120,
    attrs: { type: "Игры и приставки", brand: "Sony" },
    desc: "Консоль в идеальном состоянии, два геймпада и три диска с играми. Проверка при встрече." },
  { id: "a15", cat: "auto", ill: "car", bg: "#FFE4DF", title: "Kia Rio, 2017, 1.6 AT", price: 1150000, cond: "Б/у", city: "Москва", ago: 210, seller: "s15", bargain: true, views: 402,
    attrs: { brand: "Kia", year: 2017, mileage: 86000, gearbox: "Автомат", body: "Седан" },
    desc: "Один владелец, обслуживание у официального дилера. Зимняя резина в подарок. Не такси, не битая." },
  { id: "a16", cat: "parts", ill: "tires", bg: "#E3EEFB", title: "Зимние шины R16, комплект 4 шт.", price: 16000, cond: "Б/у", city: "Екатеринбург", ago: 90, seller: "s6", views: 58,
    attrs: { type: "Шины и диски", season: "Зима", radius: "R16" },
    desc: "Шипы на месте, остаток протектора 7 мм. Один сезон." },
  { id: "a17", cat: "service", ill: "washer", bg: "#DDF3EA", title: "Ремонт стиральных машин на дому", price: 1000, per: "выезд", cond: "Услуга", city: "Москва", ago: 360, seller: "s16", views: 144,
    attrs: { type: "Ремонт", home: true },
    desc: "Диагностика бесплатно при ремонте. Работаю с любыми марками, гарантия на работу 6 месяцев." },
  { id: "a18", cat: "pets", ill: "aquarium", bg: "#E3EEFB", title: "Аквариум 60 л с рыбками и растениями", price: 5500, cond: "Б/у", city: "Новосибирск", ago: 130, seller: "s9", views: 47,
    attrs: { kind: "Рыбки" },
    desc: "Фильтр, обогреватель, лампа и грунт. Отдаю вместе с жителями." },
  { id: "a19", cat: "realty", ill: "house", bg: "#DDF3EA", title: "Дом 96 м² на участке 8 соток", price: 4900000, cond: "Продажа", city: "Краснодар", ago: 1440, seller: "s11", views: 530,
    attrs: { deal: "Продажа", type: "Дом", rooms: "3", area: 96 },
    desc: "Газ, вода, канализация. Рядом школа и магазины. Документы готовы к сделке." },
  { id: "a20", cat: "wear", ill: "dress", bg: "#ECE4FA", title: "Вечернее платье, 44 размер", price: 4200, cond: "Новое", city: "Санкт-Петербург", ago: 55, seller: "s3", views: 66,
    attrs: { who: "Женское", type: "Одежда", size: "M" },
    desc: "Надевала один раз на свадьбу подруги. Не мнётся, длина миди." },
];

/* Продавцы тестовых объявлений */
window.VO_SELLERS = {
  s1: { name: "Алексей", since: 2025, phone: true }, s2: { name: "Ильдар", since: 2025, phone: false }, s3: { name: "Мария", since: 2025, phone: true },
  s4: { name: "Дарья", since: 2025, phone: false }, s5: { name: "Олег", since: 2025, phone: true }, s6: { name: "Никита", since: 2025, phone: false },
  s7: { name: "Светлана", since: 2025, phone: true }, s8: { name: "Виктор", since: 2025, phone: false }, s9: { name: "Ольга", since: 2025, phone: true },
  s10: { name: "Кофейня «Зерно»", since: 2025, phone: true, company: true }, s11: { name: "Анна", since: 2025, phone: false }, s12: { name: "Ирина", since: 2025, phone: true },
  s13: { name: "Елена", since: 2025, phone: false }, s14: { name: "Артём", since: 2025, phone: true }, s15: { name: "Сергей", since: 2025, phone: true }, s16: { name: "Мастер Дмитрий", since: 2025, phone: true, company: true },
};

/* Фильтры категорий. chips — выбор нескольких значений, range — диапазон, toggle — флажок. */
window.VO_FILTERS = {
  _common: [{ k: "price", t: "range", n: "Цена, ₽" }, { k: "cond", t: "chips", n: "Состояние", o: ["Новое", "Б/у"], root: true }, { k: "bargain", t: "toggle", n: "Возможен торг", root: true }],
  auto: [{ k: "brand", t: "chips", n: "Марка", o: ["Kia", "Toyota", "Lada", "Hyundai", "BMW", "Другая"] }, { k: "year", t: "range", n: "Год выпуска" }, { k: "mileage", t: "range", n: "Пробег, км" }, { k: "gearbox", t: "chips", n: "Коробка", o: ["Автомат", "Механика"] }, { k: "body", t: "chips", n: "Кузов", o: ["Седан", "Хэтчбек", "Кроссовер", "Универсал"] }],
  parts: [{ k: "type", t: "chips", n: "Что ищем", o: ["Шины и диски", "Двигатель", "Кузов", "Электрика", "Масла"] }, { k: "season", t: "chips", n: "Сезон", o: ["Зима", "Лето", "Всесезон"] }, { k: "radius", t: "chips", n: "Радиус", o: ["R14", "R15", "R16", "R17", "R18"] }],
  realty: [{ k: "deal", t: "chips", n: "Сделка", o: ["Продажа", "Аренда"] }, { k: "type", t: "chips", n: "Тип", o: ["Квартира", "Комната", "Дом", "Гараж", "Участок"] }, { k: "rooms", t: "chips", n: "Комнат", o: ["Студия", "1", "2", "3", "4+"] }, { k: "area", t: "range", n: "Площадь, м²" }],
  job: [{ k: "schedule", t: "chips", n: "График", o: ["Полный день", "Сменный", "Удалённо", "Подработка"] }, { k: "exp", t: "chips", n: "Опыт", o: ["Без опыта", "1–3 года", "Более 3 лет"] }],
  service: [{ k: "type", t: "chips", n: "Услуга", o: ["Ремонт", "Красота", "Обучение", "Перевозки", "Уборка", "IT"] }, { k: "home", t: "toggle", n: "С выездом на дом" }],
  tech: [{ k: "type", t: "chips", n: "Тип", o: ["Телефоны", "Ноутбуки", "Фото и видео", "Аудио", "Игры и приставки"] }, { k: "brand", t: "chips", n: "Бренд", o: ["Apple", "Samsung", "Xiaomi", "Sony", "Другой"] }, { k: "memory", t: "chips", n: "Память", o: ["64 ГБ", "128 ГБ", "256 ГБ", "512 ГБ"] }],
  wear: [{ k: "who", t: "chips", n: "Для кого", o: ["Женское", "Мужское", "Детское"] }, { k: "type", t: "chips", n: "Что", o: ["Одежда", "Обувь", "Аксессуары"] }, { k: "size", t: "chips", n: "Размер", o: ["XS", "S", "M", "L", "XL", "38", "40", "42", "44"] }],
  home: [{ k: "type", t: "chips", n: "Тип", o: ["Мебель", "Техника", "Растения", "Декор", "Посуда"] }],
  kids: [{ k: "age", t: "chips", n: "Возраст", o: ["0–1 год", "1–3 года", "3–7 лет", "7+ лет"] }, { k: "type", t: "chips", n: "Что", o: ["Транспорт", "Игрушки", "Одежда", "Мебель"] }],
  hobby: [{ k: "type", t: "chips", n: "Направление", o: ["Велосипеды", "Музыка", "Спорт", "Туризм", "Книги"] }],
  pets: [{ k: "kind", t: "chips", n: "Кто", o: ["Кошки", "Собаки", "Птицы", "Рыбки", "Другие"] }],
  free: [{ k: "type", t: "chips", n: "Что отдают", o: ["Вещи", "Мебель", "Растения", "Животные"] }],
};

/* Как называются характеристики на странице объявления */
window.VO_ATTR_NAMES = { type: "Тип", brand: "Бренд / марка", memory: "Память", wheel: "Диаметр колёс", frame: "Размер рамы", room: "Комната", who: "Для кого", size: "Размер",
  schedule: "График", exp: "Опыт", age: "Возраст", deal: "Сделка", rooms: "Комнат", area: "Площадь, м²", year: "Год выпуска", mileage: "Пробег, км", gearbox: "Коробка передач",
  body: "Кузов", season: "Сезон", radius: "Радиус", home: "Выезд на дом", kind: "Кто" };

/* Какая иллюстрация подставляется в новое объявление без фото */
window.VO_CAT_ILL = { auto: "car", parts: "tires", realty: "house", job: "cup", service: "washer", tech: "phone", wear: "sneaker", home: "sofa", kids: "scooter", hobby: "guitar", pets: "aquarium", free: "plant" };
window.VO_CAT_BG = { auto: "#E3EEFB", parts: "#E3EEFB", realty: "#F7EBDD", job: "#FFE4DF", service: "#FFE4DF", tech: "#E3EEFB", wear: "#FFE4DF", home: "#F7EBDD", kids: "#FFF1C9", hobby: "#ECE4FA", pets: "#FFF1C9", free: "#DDF3EA" };

/* Города тестовых продавцов — берём из их объявлений */
window.VO_ADS.forEach(a => { const s = window.VO_SELLERS[a.seller]; if (s && !s.city) s.city = a.city; });

/* ДЕМО (до сервера): покупатели, которые пишут по вашим объявлениям, чтобы можно было проверить переписку и сделки */
window.VO_DEMO_BUYERS = {
  d1: { name: "Андрей", city: "Москва", demo: true }, d2: { name: "Екатерина", city: "Санкт-Петербург", demo: true },
  d3: { name: "Тимур", city: "Казань", demo: true }, d4: { name: "Полина", city: "Новосибирск", demo: true },
};

/* Стартовые отзывы о тестовых продавцах. verified — сделка прошла через сайт. role — в какой роли оценивают человека. */
window.VO_REVIEWS_SEED = [
  { target: "s1", authorName: "Игорь", role: "seller", stars: 5, verified: true, ad: "iPhone 12, 64 ГБ", text: "Всё как в описании, показал телефон при встрече, проверили вместе. Рекомендую.", d: 12 },
  { target: "s1", authorName: "Наталья", role: "seller", stars: 4, verified: false, text: "Быстро отвечает, вежливый. До сделки не дошли, но впечатление хорошее.", d: 30 },
  { target: "s1", authorName: "Олег", role: "buyer", stars: 5, verified: true, ad: "Чехол и зарядка", text: "Приятный покупатель, пришёл вовремя.", d: 45 },
  { target: "s3", authorName: "Анастасия", role: "seller", stars: 5, verified: true, ad: "Кресло-мешок", text: "Мария помогла донести до машины, всё чистое и аккуратное.", d: 8 },
  { target: "s3", authorName: "Влад", role: "seller", stars: 3, verified: false, text: "Долго отвечала, в итоге купил в другом месте.", d: 60 },
  { target: "s9", authorName: "Кирилл", role: "seller", stars: 5, verified: true, ad: "Колонка", text: "Отправила СДЭКом наложенным платежом, упаковано отлично.", d: 20 },
  { target: "s15", authorName: "Дмитрий", role: "seller", stars: 5, verified: true, ad: "Летние шины", text: "Честный продавец, всё как договаривались.", d: 90 },
  { target: "s16", authorName: "Светлана", role: "seller", stars: 5, verified: true, ad: "Ремонт стиральной машины", text: "Приехал в тот же день, починил за час, дал гарантию.", d: 5 },
  { target: "s16", authorName: "Павел", role: "seller", stars: 4, verified: true, ad: "Диагностика", text: "Всё сделал, но опоздал на полчаса — предупредил заранее.", d: 33 },
  { target: "s10", authorName: "Мила", role: "seller", stars: 5, verified: false, text: "Хорошее место работы, адекватный руководитель.", d: 15 },
];
