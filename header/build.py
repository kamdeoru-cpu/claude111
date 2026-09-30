# Собирает header.html и header.js: иконки описаны один раз здесь.
import json, re
logo = open("../logo/vseobyavleniya-logo.svg").read()
paths = re.findall(r'<path fill="#16181D" d="([^"]+)"', logo)
assert len(paths) == 2

A = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
MUTED = '#C3C7CF'
ICON = {
 "auto": f'<svg {A}><g class="car"><path d="M3 15v-3.2l2-4.3a2 2 0 0 1 1.8-1.2h10.4a2 2 0 0 1 1.8 1.2l2 4.3V15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M3.5 11.5h17"/></g><g class="wh"><circle cx="7" cy="16.5" r="2.2" fill="#fff"/><path d="M7 14.3v4.4"/></g><g class="wh"><circle cx="17" cy="16.5" r="2.2" fill="#fff"/><path d="M17 14.3v4.4"/></g></svg>',
 "realty": f'<svg {A}><circle class="smoke" cx="17" cy="2.6" r="1.3" fill="{MUTED}" stroke="none"/><path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M16 7.2V4.5h2v4.3"/><rect class="win" x="10" y="12.5" width="4" height="4" rx=".8" fill="transparent"/></svg>',
 "job": f'<svg {A}><path class="hdl" d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8"/><rect x="3.5" y="8" width="17" height="11.5" rx="2.5"/><path d="M3.5 13h17"/><rect class="lock" x="10.5" y="11.5" width="3" height="3" rx=".8" fill="#fff"/></svg>',
 "tech": f'<svg {A}><g class="ph"><rect x="7" y="3" width="10" height="18" rx="2.5"/><rect class="scr" x="9" y="5.5" width="6" height="10" rx="1" fill="transparent" stroke="none"/><path d="M11 18.3h2"/></g></svg>',
 "wear": f'<svg {A}><path class="tee" d="M9 4 4 6.5l1.8 4 2.2-1V20h8V9.5l2.2 1 1.8-4L15 4a3 3 0 0 1-6 0Z"/></svg>',
 "home": f'<svg {A}><path class="lf1" d="M12 10.5c-3 0-5-1.5-5-4.5 3 0 5 1.5 5 4.5Z"/><path class="lf2" d="M12 9c0-3 2-4.5 5-4.5 0 3-2 4.5-5 4.5Z"/><path d="M12 14V8.5"/><path d="M6.5 14h11l-1.4 6.2H7.9Z"/></svg>',
 "service": f'<svg {A}><path class="wr" d="M14.5 5.5a4 4 0 0 0-5.2 5.1l-4.8 4.8a1.9 1.9 0 0 0 2.7 2.7l4.8-4.8a4 4 0 0 0 5.1-5.2l-2.4 2.4-2.2-.6-.6-2.2Z"/></svg>',
 "pets": f'<svg {A}><ellipse class="toe" cx="5.5" cy="10.5" rx="1.6" ry="2"/><ellipse class="toe" cx="9.2" cy="6.6" rx="1.6" ry="2.1"/><ellipse class="toe" cx="14.8" cy="6.6" rx="1.6" ry="2.1"/><ellipse class="toe" cx="18.5" cy="10.5" rx="1.6" ry="2"/><path d="M12 12.5c-2.6 0-5 2.6-5 4.8 0 1.6 1.2 2.2 2.4 2.2 1 0 1.6-.6 2.6-.6s1.6.6 2.6.6c1.2 0 2.4-.6 2.4-2.2 0-2.2-2.4-4.8-5-4.8Z"/></svg>',
 "hobby": f'<svg {A}><ellipse class="bsh" cx="12" cy="21" rx="4" ry="1" fill="{MUTED}" stroke="none"/><g class="ball"><circle cx="12" cy="11" r="6.5"/><path d="M6.2 9c3.8 1.6 7.8 1.6 11.6 0M12 4.5c-2 3.6-2 9.4 0 13"/></g></svg>',
 "kids": f'<svg {A}><g class="bln"><path d="M12 3c3 0 5 2.4 5 5.3 0 3.4-2.8 6.2-5 6.2s-5-2.8-5-6.2C7 5.4 9 3 12 3Z"/><path d="m11.1 14.5.9 1.2.9-1.2"/></g><path d="M12 15.8c-1.2 1.5 1.2 2.6 0 4.6"/></svg>',
}
CATS = [
 ("auto", "Авто", "412 тыс.", ["Легковые", "Мотоциклы", "Грузовики", "Запчасти", "Шины и диски", "Аудио и видео", "Инструменты", "Спецтехника", "Водный транспорт"]),
 ("realty", "Недвижимость", "288 тыс.", ["Квартиры", "Комнаты", "Дома и дачи", "Посуточно", "Новостройки", "Гаражи", "Коммерческая", "Участки", "За рубежом"]),
 ("job", "Работа", "96 тыс.", ["Вакансии", "Резюме", "Подработка", "Удалённо", "Стажировки", "Вахта"]),
 ("tech", "Электроника", "354 тыс.", ["Телефоны", "Ноутбуки", "Планшеты", "Фото и видео", "Аудио", "Игры и приставки", "ТВ", "Комплектующие", "Умный дом"]),
 ("wear", "Одежда и обувь", "521 тыс.", ["Женская одежда", "Мужская одежда", "Обувь", "Сумки", "Часы", "Украшения", "Детская одежда"]),
 ("home", "Дом и сад", "307 тыс.", ["Мебель", "Бытовая техника", "Ремонт", "Растения", "Посуда", "Текстиль", "Сад и огород", "Освещение"]),
 ("service", "Услуги", "143 тыс.", ["Ремонт и отделка", "Красота", "Обучение", "Перевозки", "Уборка", "IT", "Праздники", "Ремонт техники"]),
 ("pets", "Животные", "58 тыс.", ["Собаки", "Кошки", "Птицы", "Аквариум", "Товары для животных", "Другие"]),
 ("hobby", "Хобби и спорт", "176 тыс.", ["Велосипеды", "Спорт и отдых", "Туризм", "Музыка", "Книги", "Коллекции", "Билеты"]),
 ("kids", "Детям", "199 тыс.", ["Коляски", "Автокресла", "Игрушки", "Одежда", "Детская мебель", "Товары для мам"]),
]

chips = "\n".join(f'          <a class="cat" href="#">{ICON[k]}<span>{n}</span></a>' for k, n, _, _ in CATS)
html = open("header.tpl.html").read()
html = html.replace("__W1__", paths[0]).replace("__W2__", paths[1]).replace("__CHIPS__", chips)
open("header.html", "w").write(html)
js = open("header.tpl.js").read().replace("__CATS__", json.dumps([{"id": k, "name": n, "count": c, "subs": s, "icon": ICON[k]} for k, n, c, s in CATS], ensure_ascii=False))
open("header.js", "w").write(js)
print("ok")
