/* Вход по почте с кодом + обязательная анкета при первом входе.
   ЗАГЛУШКА: письма пока не отправляются — код показывается в «почтовом ящике» на странице.
   Когда подключим корпоративную почту, генерацию и проверку кода перенесём на сервер. */
(() => {
  const { $, $$, esc, store } = VO;
  const COLORS = ["#16181D", "#FF4F3A", "#2F7DE1", "#2F9E6E", "#8A5CF6", "#E0913A"];
  const TTL = 10 * 60e3, MAX_TRIES = 5, LOCK = 5 * 60e3;
  const page = VO.page("login");
  page.classList.add("page--bare");

  const col = (ads, k) => { const html = ads.map(a => `<div class="wall__c" style="--bg:${a.bg}"><div class="wall__img">${window.VO_ILL[a.ill]}</div><b>${a.price === 0 ? "Даром" : VO.rub(a.price)}</b><span>${esc(a.title)}</span></div>`).join(""); return `<div class="wall__col" style="--dur:${38 + k * 7}s;--dir:${k % 2 ? "reverse" : "normal"}"><div class="wall__track">${html}${html}</div></div>`; };
  const ads = window.VO_ADS;
  page.innerHTML = `<div class="signin">
    <div class="signin__wall" aria-hidden="true">
      <div class="wall">${[0, 1, 2, 3].map(k => col(ads.filter((_, i) => i % 4 === k).concat(ads.filter((_, i) => i % 4 === (k + 1) % 4)), k)).join("")}</div>
      <div class="signin__say"><span class="ph__eyebrow">Все объявления</span><b>Покупайте, продавайте<br>и&nbsp;отдавайте даром</b><span>Один аккаунт — и всё под рукой: объявления, избранное, сообщения.</span></div>
    </div>
    <div class="signin__panel">
      <form class="auth__step is-on" data-step="mail" id="authMail" novalidate>
        <h1>Вход и регистрация</h1>
        <p>Пароль не нужен — пришлём одноразовый код на почту. Нет аккаунта? Создадим автоматически.</p>
        <div class="field field--ic"><input id="aMail" type="email" placeholder=" " autocomplete="email" autocapitalize="off" spellcheck="false" required><label for="aMail">Электронная почта</label><span class="field__ic"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg></span><em>Проверьте адрес почты</em></div>
        <button class="btn btn--ink btn--wide btn--lg" type="submit"><span>Продолжить</span>${VO.ico.chev}</button>
        <ul class="trust">
          <li><i><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></i><span><b>Без паролей</b>Код одноразовый и действует 10 минут</span></li>
          <li><i><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/></svg></i><span><b>Номер под защитой</b>Не показываем его без вашего разрешения</span></li>
          <li><i>₽0</i><span><b>Бесплатно</b>Размещение объявлений ничего не стоит</span></li>
        </ul>
        <small class="auth__fine">Продолжая, вы принимаете <a href="#/doc/terms">Пользовательское соглашение</a> и <a href="#/doc/privacy">Политику конфиденциальности</a>.</small>
      </form>
      <form class="auth__step" data-step="code" id="authCode" novalidate>
        <button type="button" class="auth__back" data-back>← Другая почта</button>
        <h1>Проверьте почту</h1>
        <p>Отправили 6-значный код на <b id="aMailShow"></b></p>
        <div class="otp" id="otp">${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" autocomplete="${i ? "off" : "one-time-code"}" maxlength="1" aria-label="Цифра ${i + 1}">`).join("")}</div>
        <em class="otp__err" id="otpErr"></em>
        <button class="btn btn--ghost btn--wide" type="button" id="resend" disabled></button>
        <small class="auth__fine">Не пришло? Проверьте «Спам» или отправьте код ещё раз через минуту.</small>
      </form>
      <aside class="inbox" id="inbox" hidden>
        <div class="inbox__bar"><i></i><i></i><i></i><span>Почта · входящие</span><em>демо</em></div>
        <div class="inbox__mail">
          <div class="inbox__from"><span class="inbox__ava"><svg viewBox="0 0 150 214" width="18"><g transform="translate(20 4)" stroke-linejoin="round" stroke-width="10"><path d="M5 5H78A38 38 0 0 1 78 81H5Z" fill="#FF4F3A" stroke="#FF4F3A"/><path d="M5 97H84A44 44 0 0 1 84 185H30L5 207Z" fill="#fff" stroke="#fff"/></g></svg></span><span><b>Все объявления</b><small>Код для входа · сейчас</small></span></div>
          <p>Здравствуйте! Ваш код для входа:</p>
          <div class="inbox__code" id="inboxCode"></div>
          <p class="muted">Никому не сообщайте этот код — даже если человек представляется сотрудником сайта.</p>
          <button class="btn btn--accent btn--wide" type="button" id="inboxFill">Вставить код</button>
        </div>
      </aside>
    </div>
  </div>`;

  let pending = null, timer = 0;
  const step = n => $$(".auth__step", page).forEach(s => s.classList.toggle("is-on", s.dataset.step === n));
  const cells = $$("#otp input", page), otp = $("#otp", page), err = $("#otpErr", page);
  const lock = () => store.get("vo_otp_lock", 0);

  function sendCode() {
    const buf = new Uint32Array(1); (crypto.getRandomValues ? crypto.getRandomValues(buf) : (buf[0] = Math.random() * 1e9));
    pending.code = String(100000 + buf[0] % 900000); pending.exp = Date.now() + TTL; pending.tries = 0;
    const ib = $("#inbox", page); ib.hidden = true; void ib.offsetWidth;
    setTimeout(() => { $("#inboxCode", page).innerHTML = [...pending.code].map((d, i) => `<span style="--i:${i}">${d}</span>`).join(""); ib.hidden = false; }, 700);
    let s = 59; const r = $("#resend", page); r.disabled = true; r.innerHTML = `Отправить снова через <b>${s}</b> с`;
    clearInterval(timer);
    timer = setInterval(() => { s--; if (s <= 0) { clearInterval(timer); r.disabled = false; r.textContent = "Отправить код снова"; } else r.querySelector("b").textContent = s; }, 1000);
  }
  $("#authMail", page).addEventListener("submit", e => {
    e.preventDefault();
    const m = $("#aMail", page).value.trim().toLowerCase();
    if (!VO.check($("#aMail", page).parentElement, VO.MAIL_RX.test(m) && m.length <= 120)) return;
    if (lock() > Date.now()) return VO.toast(`Слишком много попыток. Попробуйте через ${Math.ceil((lock() - Date.now()) / 60000)} мин`);
    pending = { email: m }; $("#aMailShow", page).textContent = m;
    step("code"); clearCells(); sendCode(); setTimeout(() => cells[0].focus(), 80);
  });
  $("#aMail", page).addEventListener("input", () => $("#aMail", page).parentElement.classList.remove("bad"));
  $("[data-back]", page).addEventListener("click", () => { step("mail"); $("#inbox", page).hidden = true; $("#aMail", page).focus(); });
  $("#resend", page).addEventListener("click", () => { clearCells(); sendCode(); });
  $("#inboxFill", page).addEventListener("click", () => { [...pending.code].forEach((d, i) => { cells[i].value = d; cells[i].classList.add("filled"); }); check(); });
  function clearCells() { cells.forEach(c => { c.value = ""; c.classList.remove("filled"); }); otp.classList.remove("bad", "ok"); err.textContent = ""; }
  function fail(msg) { otp.classList.remove("bad"); void otp.offsetWidth; otp.classList.add("bad"); err.textContent = msg; setTimeout(() => { cells.forEach(c => { c.value = ""; c.classList.remove("filled"); }); cells[0].focus(); }, 380); }
  function check() {
    const v = cells.map(c => c.value).join(""); if (v.length < 6 || !pending) return;
    if (lock() > Date.now()) return fail("Слишком много попыток — вход временно заблокирован");
    if (Date.now() > pending.exp) return fail("Код устарел — отправьте новый");
    if (v !== pending.code) {
      pending.tries++;
      if (pending.tries >= MAX_TRIES) { store.set("vo_otp_lock", Date.now() + LOCK); pending.code = null; return fail("Слишком много неверных попыток. Попробуйте через 5 минут"); }
      return fail(`Неверный код. Осталось попыток: ${MAX_TRIES - pending.tries}`);
    }
    otp.classList.add("ok"); err.textContent = "";
    setTimeout(() => signIn(pending.email), VO.reduce ? 0 : 650);
  }
  cells.forEach((c, i) => {
    c.addEventListener("input", () => { c.value = c.value.replace(/\D/g, "").slice(-1); c.classList.toggle("filled", !!c.value); otp.classList.remove("bad"); if (c.value && cells[i + 1]) cells[i + 1].focus(); check(); });
    c.addEventListener("keydown", e => { if (e.key === "Backspace" && !c.value && cells[i - 1]) { cells[i - 1].focus(); cells[i - 1].value = ""; cells[i - 1].classList.remove("filled"); } if (e.key === "ArrowLeft" && cells[i - 1]) cells[i - 1].focus(); if (e.key === "ArrowRight" && cells[i + 1]) cells[i + 1].focus(); });
    c.addEventListener("paste", e => { e.preventDefault(); const d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6); [...d].forEach((ch, k) => { cells[k].value = ch; cells[k].classList.add("filled"); }); (cells[d.length] || cells[5]).focus(); check(); });
  });

  function signIn(email) {
    clearInterval(timer); pending = null;
    const S = VO.state;
    let u = S.accounts[email];
    const isNew = !u;
    if (!u) u = { email, created: Date.now(), color: COLORS[Math.floor(Math.random() * COLORS.length)], notif: { msg: true, fav: true, search: true, news: false }, sessions: [] };
    u.sessions = [{ id: Date.now(), ua: navigator.userAgent.replace(/.*(Firefox|Edg|OPR|YaBrowser|Chrome|Safari)\/?([\d.]*).*/, "$1").replace("Edg", "Edge").replace("OPR", "Opera").replace("YaBrowser", "Яндекс Браузер"), t: Date.now(), current: true }, ...(u.sessions || []).map(s => ({ ...s, current: false }))].slice(0, 5);
    VO.saveUser(u);
    S.session = email; store.set("vo_session", email);
    VO.addNote(isNew ? "Аккаунт создан" : "Вход в аккаунт", `${email} · ${new Date().toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}. Если это были не вы — завершите сеансы в разделе «Безопасность».`);
    VO.emit("user");
    const ret = sessionStorage.getItem("vo_return") || "#/me"; sessionStorage.removeItem("vo_return");
    location.hash = ret;
    if (!u.onboarded) setTimeout(onboarding, 350); else VO.toast(`С возвращением, ${esc(u.name)}!`);
  }

  /* ---------- анкета при первом входе (обязательная) ---------- */
  function onboarding() {
    const u = VO.user(); if (!u || u.onboarded) return;
    const cities = (window.VO_CITIES || []).filter(c => c !== "Вся Россия");
    const el = VO.sheet(`<form class="onb" id="onbF" novalidate>
      <div class="onb__head"><span class="onb__ava" style="background:${u.color}" id="onbAva">?</span><div><h3>Давайте познакомимся</h3><p>Это займёт полминуты — и можно размещать объявления.</p></div></div>
      <div class="field"><input id="oName" maxlength="40" placeholder=" " autocomplete="given-name" required><label for="oName">Имя</label><em>Напишите, как к вам обращаться</em></div>
      <div class="field field--ic"><input id="oPhone" inputmode="tel" placeholder=" " autocomplete="tel" required><label for="oPhone">Номер телефона</label><span class="field__ic">${VO.ico.phone}</span><em>Номер должен быть из 11 цифр</em></div>
      <div class="onb__note"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2F9E6E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/><path d="m9 12 2 2 4-4"/></svg><span>Номер нужен для безопасности аккаунта. <b>Без вашего разрешения он не появится в объявлениях</b> и никому не передаётся.</span></div>
      <label class="switch-l switch-l--block"><input type="checkbox" id="oShow"><span class="sw"></span><span>Показывать номер в моих объявлениях<small>Можно изменить в любой момент в профиле</small></span></label>
      <div class="field field--select"><select id="oCity">${cities.map(c => `<option${c === (window.VO_CITY ? window.VO_CITY() : "") ? " selected" : ""}>${c}</option>`).join("")}</select><label for="oCity">Город</label></div>
      <label class="check"><input type="checkbox" id="oAgree"><span></span><span>Я согласен(на) на <a href="#/doc/consent" target="_blank">обработку персональных данных</a> и принимаю <a href="#/doc/terms" target="_blank">Пользовательское соглашение</a></span></label>
      <em class="onb__err" id="oErr"></em>
      <button class="btn btn--accent btn--wide btn--lg" type="submit">Готово</button>
      <button class="link onb__out" type="button" data-onb-out>Выйти из аккаунта</button>
    </form>`, { cls: "sheet--onb", locked: true });
    const f = $("#onbF", el), name = $("#oName", el), phone = $("#oPhone", el);
    name.addEventListener("input", () => { $("#onbAva", el).textContent = (name.value.trim()[0] || "?").toUpperCase(); name.parentElement.classList.remove("bad"); });
    phone.addEventListener("input", () => { phone.value = phone.value ? VO.phoneMask(phone.value) : ""; phone.parentElement.classList.remove("bad"); });
    phone.addEventListener("focus", () => { if (!phone.value) phone.value = "+7 ("; });
    $("[data-onb-out]", el).addEventListener("click", () => { VO.closeSheet(true); VO.logout(); });
    f.addEventListener("submit", e => {
      e.preventDefault();
      const ok = [VO.check(name.parentElement, name.value.trim().length > 0), VO.check(phone.parentElement, VO.phoneOk(phone.value))].every(Boolean);
      const agree = $("#oAgree", el).checked;
      $("#oErr", el).textContent = !agree && ok ? "Нужно согласие на обработку данных — без него мы не можем хранить ваш профиль" : "";
      if (!ok || !agree) return;
      Object.assign(u, { name: name.value.trim().slice(0, 40), phone: phone.value, showPhone: $("#oShow", el).checked, city: $("#oCity", el).value, onboarded: true, consentAt: Date.now() });
      VO.closeSheet(true); VO.saveUser(u);
      VO.toast(`Готово, ${esc(u.name)}! Профиль заполнен`);
    });
  }
  VO.onboarding = onboarding;
  VO.on("route", () => { const u = VO.user(); if (u && !u.onboarded && !document.querySelector(".sheet--onb")) setTimeout(onboarding, 300); });

  VO.routes.login = () => {
    if (VO.user()) { location.hash = "#/me"; return; }
    VO.show("login", "Вход");
    step("mail"); $("#inbox", page).hidden = true; setTimeout(() => $("#aMail", page).focus(), 120);
  };
})();
