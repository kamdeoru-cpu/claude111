"""Собирает index.html шапок (header, header-v2) из src.html и логотипа.

Логотип вставляется шаблоном: циркуль, капли и буквы получают классы,
чтобы их можно было анимировать по отдельности.
"""
import base64
import pathlib
import re

HERE = pathlib.Path(__file__).parent
svg = (HERE / "logo" / "bad-design-logo.svg").read_text(encoding="utf-8")
paths = re.findall(r"<path [^>]*/>", svg)
mask = re.search(r"<mask.*?</mask>", svg, re.S).group(0).replace("mask0_17_1994", "lgm__ID__")
compass, b_letter, drips = paths[0:9], paths[9], paths[10:16]
d_and_esign = paths[17:]

# Концы потёков, откуда срываются новые капли (координаты viewBox логотипа)
tips = [(1.3, 81), (5, 90), (81, 79), (91.7, 85), (67.7, 95.5), (47.7, 105.5)]
drop = '<path d="M0 0C.9 1.6 1.7 2.7 1.7 3.7a1.7 1.7 0 0 1-3.4 0C-1.7 2.7-.9 1.6 0 0Z" fill="#BC4242"/>'
drops = "".join(
    f'<g transform="translate({x} {y})"><g class="lg-drop" style="--d:{i * 0.17:.2f}s">{drop}</g></g>'
    for i, (x, y) in enumerate(tips)
)

logo = (
    '<svg class="lg" viewBox="0 0 216 123" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="BAD Design">'
    + f'<g class="lg-c">{"".join(compass)}</g>'
    + f'<g class="lg-b">{b_letter}</g>'
    + f'<g class="lg-cd">{"".join(drips)}</g>'
    + mask
    + f'<g mask="url(#lgm__ID__)"><g class="lg-d">{d_and_esign[0]}</g><g class="lg-e">{"".join(d_and_esign[1:])}</g></g>'
    + f'<g class="lg-drops">{drops}</g>'
    + "</svg>"
)

import json
logo_json = json.dumps({
    "compass": [re.search(r'd="([^"]+)"', x).group(1) for x in compass],
    "b": re.search(r'd="([^"]+)"', b_letter).group(1),
    "drips": [re.search(r'd="([^"]+)"', x).group(1) for x in drips],
    "d": re.search(r'd="([^"]+)"', d_and_esign[0]).group(1),
    "esign": [re.search(r'd="([^"]+)"', x).group(1) for x in d_and_esign[1:]],
})

for name in ("header", "header-v2", "intro"):
    src_path = HERE / name / "src.html"
    if not src_path.exists():
        continue
    src = src_path.read_text(encoding="utf-8")
    # картинки встраиваются в страницу: просмотрщик не всегда отдаёт соседние файлы
    img_dir = HERE / name / "img"
    if img_dir.exists():
        for f in sorted(img_dir.glob("*.webp")):
            uri = "data:image/webp;base64," + base64.b64encode(f.read_bytes()).decode()
            src = src.replace(f"img/{f.name}", uri)
    src = src.replace("{{LOGO_JSON}}", logo_json)
    (HERE / name / "index.html").write_text(src.replace("{{LOGO}}", logo), encoding="utf-8")
    print(f"{name}/index.html:", len(src) + len(logo), "bytes")
