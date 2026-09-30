/* Контакты владельца сайта — меняются здесь, используются в подвале, на странице «Написать нам», в плавающей кнопке и документах. */
window.VO_CONTACTS = {
  phone: "+7 (916) 111-22-47", tel: "+79161112247",
  email: "Bitovkino@mail.ru",
  tg: "https://t.me/+79161112247",
  wa: "https://wa.me/79161112247",
  max: "https://max.ru/u/f9LHodD0cOKvq4DMUcx5zY4f4gS-65VwiQIoBTh8zbGif-CSOmW-UVe_HZE",
  owner: "[ФИО владельца — заглушка]",       // ЗАГЛУШКА: ФИО физлица-владельца для документов
  city: "[город — заглушка]",                // ЗАГЛУШКА: город для документов
};
window.VO_BRAND_ICONS = {
  tg: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#2AABEE"/><path d="M5.4 11.8 16.9 7.3c.5-.2 1 .1.8.9l-2 9.3c-.1.6-.5.8-1.1.5l-3-2.2-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5c.2-.2 0-.3-.3-.1l-6.9 4.3-3-.9c-.6-.2-.6-.6.2-.9Z" fill="#fff"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#25D366"/><path d="M12 5.2a6.8 6.8 0 0 0-5.8 10.3l-.9 3.3 3.4-.9A6.8 6.8 0 1 0 12 5.2Zm3.9 9.6c-.2.5-1 .9-1.4 1-.4 0-.8.2-2.6-.5-2.2-.9-3.6-3.1-3.7-3.3-.1-.1-.9-1.2-.9-2.2s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.1 0 .3 0 .5.4l.7 1.6c.1.1.1.3 0 .4l-.3.5-.3.3c-.1.1-.2.2-.1.4.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.3.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.5.7c.2.1.4.2.4.3.1.1.1.6-.1 1.1Z" fill="#fff"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#16181D"/><rect x="6" y="7.5" width="12" height="9" rx="2" fill="none" stroke="#fff" stroke-width="1.6"/><path d="m6.5 8.5 5.5 4.2 5.5-4.2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#FF4F3A"/><path d="M8.3 6.5h2l1 2.6-1.3.8a5.7 5.7 0 0 0 2.6 2.6l.8-1.3 2.6 1v2a1 1 0 0 1-1 1 8.2 8.2 0 0 1-7.7-7.7 1 1 0 0 1 1-1" fill="#fff"/></svg>',
};
// значок MAX: у градиента должен быть свой id в каждой копии, иначе копии в скрытых блоках «ломают» остальные
{ let n = 0; const MAX = '<svg viewBox="0 0 1000 1000" aria-hidden="true"><defs><linearGradient id="vo-max-g" x1="118" y1="760" x2="1000" y2="500" gradientUnits="userSpaceOnUse"><stop stop-color="#44CCFF"/><stop offset=".66" stop-color="#5533EE"/><stop offset="1" stop-color="#9933DD"/></linearGradient></defs><rect width="1000" height="1000" rx="250" fill="url(#vo-max-g)"/><path fill-rule="evenodd" d="M507.5 845c-68.5 0-100.3-10-155.7-50-35 45-145.8 80.1-150.6 20 0-45-10-83.2-21.4-124.8C166.3 639 151 581.9 151 499.2 151 301.6 313.3 153 505.7 153 698.2 153 849 309 849 501c.6 189.1-152.1 343-341.5 344Zm2.8-521.2c-93.6-4.9-166.6 59.9-182.8 161.4-13.3 84 10.3 186.4 30.5 191.7 9.7 2.4 34-17.3 49.2-32.5a168 168 0 0 0 84.6 30.1c97 4.7 180-69.1 186.5-165.9 3.8-97-70.9-179.2-168-184.7Z" fill="#fff"/></svg>';
  Object.defineProperty(window.VO_BRAND_ICONS, "max", { enumerable: true, get: () => MAX.replace(/vo-max-g/g, "vo-max-g" + (++n)) }); }
