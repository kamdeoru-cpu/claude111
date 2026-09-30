# Собирает site/index.html — один самодостаточный файл со всем одобренным:
# интро, шапка, баннер cookie. Исходники остаются в своих папках.
import re, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
rd = lambda p: (R / p).read_text()
js = lambda p: rd(p).replace("</script", "<\\/script")  # иначе строка в комментарии закроет тег

intro = rd("intro/intro.html")
intro_markup = intro[intro.index('<div id="intro"'):intro.index("<script>")]
intro_markup = intro_markup.replace('<div id="intro" title="Нажмите, чтобы проиграть заново">', '<div id="intro" class="site" aria-label="Заставка, нажмите чтобы пропустить">')
intro_js = intro[intro.index("<script>") + 8:intro.rindex("</script>")].replace("</script", "<\\/script")
intro_js = intro_js.replace('const SITE_MODE = new URLSearchParams(location.search).has("site");', "const SITE_MODE = true;")
assert "const SITE_MODE = true;" in intro_js

hdr = rd("header/header.html")
hdr_markup = hdr[hdr.index('<header class="hdr"'):hdr.index('<main class="demo"')]

MODULES = ["core", "search", "feed", "ad", "auth", "cabinet", "post", "info", "docs", "ui"]  # порядок важен: core первым, ui (запуск) последним
tpl = rd("site/index.tpl.html")
out = (tpl.replace("/*__HEADER_CSS__*/", rd("header/header.css"))
          .replace("/*__COOKIE_CSS__*/", rd("cookies/cookies.css"))
          .replace("<!--__INTRO__-->", intro_markup)
          .replace("<!--__HEADER__-->", hdr_markup)
          .replace("/*__INTRO_JS__*/", intro_js)
          .replace("/*__HEADER_JS__*/", js("header/header.js"))
          .replace("/*__COOKIE_JS__*/", js("cookies/cookies.js"))
          .replace("/*__APP_CSS__*/", rd("site/src/app.css"))
          .replace("<!--__PAGES__-->", rd("site/src/pages.html"))
          .replace("/*__DATA_JS__*/", js("site/src/data.js") + "\n" + js("site/src/contacts.js"))
          .replace("/*__APP_JS__*/", "\n".join(js("site/src/" + m + ".js") for m in MODULES)))
(R / "site/index.html").write_text(out)
print("site/index.html", len(out) // 1024, "KB")
