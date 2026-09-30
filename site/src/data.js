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
    gamepad: s(`<path d="M62 52h76c18 0 28 16 30 38s-4 34-16 34c-10 0-14-10-24-18H72c-10 8-14 18-24 18-12 0-18-12-16-34s12-38 30-38Z" fill="${I}"/><path d="M66 74v20M56 84h20" stroke="${W}" stroke-width="6" stroke-linecap="round"/><circle cx="134" cy="76" r="6" fill="${C}"/><circle cx="148" cy="88" r="6" fill="${W}"/><circle cx="120" cy="88" r="6" fill="${W}"/><circle cx="134" cy="100" r="6" fill="${C}"/><rect x="92" y="66" width="16" height="6" rx="3" fill="${C}"/>`, 62),
  };
})();

/* Тестовые объявления. ago — сколько минут назад опубликовано. */
window.VO_ADS = [
  { id: "a1", cat: "tech", ill: "phone", bg: "#E3EEFB", title: "iPhone 13, 128 ГБ, синий", price: 42000, cond: "Б/у", city: "Москва", ago: 25, seller: "Алексей",
    desc: "Аккумулятор 89%, всегда в чехле и со стеклом. Без сколов, Face ID работает. Коробка и кабель в комплекте." },
  { id: "a2", cat: "hobby", ill: "bike", bg: "#DDF3EA", title: "Горный велосипед, 27,5″, рама M", price: 18500, cond: "Б/у", city: "Казань", ago: 70, seller: "Ильдар", bargain: true,
    desc: "Катался два сезона, недавно поменял цепь и тормозные колодки. Подойдёт на рост 170–185 см." },
  { id: "a3", cat: "home", ill: "sofa", bg: "#F7EBDD", title: "Угловой диван с механизмом «еврокнижка»", price: 25000, cond: "Б/у", city: "Санкт-Петербург", ago: 180, seller: "Мария",
    desc: "Раскладывается в спальное место 160×200. Ткань — велюр, чехлы снимаются. Самовывоз, помогу разобрать." },
  { id: "a4", cat: "wear", ill: "sneaker", bg: "#FFE4DF", title: "Кроссовки, 42 размер, новые", price: 6900, cond: "Новое", city: "Москва", ago: 12, seller: "Дарья",
    desc: "Не подошёл размер, носил дома один раз. Есть коробка и чек." },
  { id: "a5", cat: "tech", ill: "camera", bg: "#FFF1C9", title: "Плёночный фотоаппарат «Зенит-Е»", price: 4500, cond: "Б/у", city: "Нижний Новгород", ago: 300, seller: "Олег", bargain: true,
    desc: "Рабочий, затвор срабатывает на всех выдержках. Объектив «Гелиос-44» без грибка и царапин." },
  { id: "a6", cat: "hobby", ill: "guitar", bg: "#ECE4FA", title: "Акустическая гитара для начинающих", price: 9000, cond: "Б/у", city: "Екатеринбург", ago: 520, seller: "Никита",
    desc: "Новые струны, отрегулирована мензура. В подарок чехол и каподастр." },
  { id: "a7", cat: "free", ill: "plant", bg: "#DDF3EA", title: "Монстера в горшке, 80 см", price: 0, cond: "Даром", city: "Москва", ago: 40, seller: "Светлана",
    desc: "Разрослась и не помещается в квартире. Отдам в добрые руки вместе с горшком. Забрать у м. Сокол." },
  { id: "a8", cat: "wear", ill: "watch", bg: "#E3EEFB", title: "Наручные часы, механика", price: 3200, cond: "Б/у", city: "Самара", ago: 95, seller: "Виктор",
    desc: "Ходят точно, недавно было обслуживание. Ремешок кожаный, почти новый." },
  { id: "a9", cat: "tech", ill: "headphones", bg: "#ECE4FA", title: "Беспроводные наушники с шумоподавлением", price: 17000, cond: "Б/у", city: "Новосибирск", ago: 240, seller: "Ольга",
    desc: "Полгода использования, всё работает. Держат заряд до 25 часов. Кейс и кабель есть." },
  { id: "a10", cat: "job", ill: "cup", bg: "#FFE4DF", title: "Бариста в кофейню у метро", price: 60000, per: "мес", cond: "Работа", city: "Москва", ago: 150, seller: "Кофейня «Зерно»",
    desc: "График 2/2 с 8 до 20. Обучим с нуля, чаевые — ваши. Дружная команда и бесплатный кофе." },
  { id: "a11", cat: "kids", ill: "scooter", bg: "#FFF1C9", title: "Детский самокат, от 5 лет", price: 2300, cond: "Б/у", city: "Краснодар", ago: 60, seller: "Анна",
    desc: "Регулируемая высота руля, светящиеся колёса. Сын вырос — самокат в отличном состоянии." },
  { id: "a12", cat: "realty", ill: "flat", bg: "#F7EBDD", title: "Сдаю 1-комнатную квартиру, 38 м²", price: 38000, per: "мес", cond: "Аренда", city: "Санкт-Петербург", ago: 400, seller: "Ирина",
    desc: "Пять минут до метро, свежий ремонт, вся техника. Без животных. Залог — одна месячная оплата." },
  { id: "a13", cat: "free", ill: "kitten", bg: "#FFF1C9", title: "Котёнок в добрые руки", price: 0, cond: "Даром", city: "Казань", ago: 18, seller: "Елена",
    desc: "Рыжий мальчик, 2,5 месяца. Приучен к лотку, ест всё. Очень ласковый и игривый." },
  { id: "a14", cat: "tech", ill: "gamepad", bg: "#E3EEFB", title: "Игровая приставка + 2 джойстика", price: 21000, cond: "Б/у", city: "Москва", ago: 800, seller: "Артём", bargain: true,
    desc: "Консоль в идеальном состоянии, два геймпада и три диска с играми. Проверка при встрече." },
];
/* Какая иллюстрация подставляется в новое объявление без фото */
window.VO_CAT_ILL = { auto: "scooter", parts: "gamepad", realty: "flat", job: "cup", service: "cup", tech: "phone", wear: "sneaker", home: "sofa", kids: "scooter", hobby: "guitar", pets: "kitten", free: "plant" };
window.VO_CAT_BG = { auto: "#E3EEFB", parts: "#E3EEFB", realty: "#F7EBDD", job: "#FFE4DF", service: "#FFE4DF", tech: "#E3EEFB", wear: "#FFE4DF", home: "#F7EBDD", kids: "#FFF1C9", hobby: "#ECE4FA", pets: "#FFF1C9", free: "#DDF3EA" };
