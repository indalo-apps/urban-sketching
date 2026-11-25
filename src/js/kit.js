/* ===== Kit común de las apps de indalo-apps (copiado de la Tabla periódica) =====
   Ayuda para instalar según el móvil, aviso para instalar y búsqueda de versión.
   Uso: IK.init({nombre, clave, version, onBuscar, esInicio})                        */
const IK = (function(){
  const UA = navigator.userAgent;
  const IS_IPAD = /iPad/.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const IS_IOS = /iPhone|iPad|iPod/.test(UA) || IS_IPAD;
  const IS_ANDROID = /Android/.test(UA);
  const IN_APP = /FBAN|FBAV|Instagram|WhatsApp|Line\/|; wv\)|GSA\//.test(UA);
  const IOS_OTHER = IS_IOS && /CriOS|FxiOS|EdgiOS/.test(UA);
  const EN_WEB = /\.github\.io$/.test(location.hostname) || location.hostname === "localhost";
  let cfg = {nombre: document.title, clave: "app", version: "dev"};
  let deferred = null;
  const st = {
    get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } },
    set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  };
  // Versión de iOS: Safari 26 deja fija la del sistema en 18_x, así que se usa «Version/NN» cuando está
  function iosVersion(){
    const sv = UA.match(/Version\/(\d+)(?:\.(\d+))?.*Safari/);
    if (sv && !IOS_OTHER) return [+sv[1], +(sv[2] || 0)];
    const os = UA.match(/OS (\d+)_(\d+)/); return os ? [+os[1], +os[2]] : [0, 0];
  }
  function instalada(){ try { return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; } catch(e){ return false; } }
  const SHARE = '<svg class="ik-ic" viewBox="0 0 24 24"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
  const DOTS = '<svg class="ik-ic" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>';
  const MENU3 = '<svg class="ik-ic" viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h10"/></svg>';
  const HDOTS = '<svg class="ik-ic" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>';
  const PLUS = '<svg class="ik-ic" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>';

  function pasos(){
    const n = cfg.nombre;
    if (IN_APP) return tr(`<p>Has abierto el enlace dentro de otra app. Para instalarla, ábrela primero en el navegador:</p>
      <ol class="ik-steps"><li>Toca el menú ${DOTS} o el botón ${SHARE} de esta pantalla.</li>
      <li>Elige <b>«Abrir en ${IS_IOS ? "Safari" : "Chrome"}»</b> (o «Abrir en el navegador»).</li>
      <li>Allí, vuelve a <b>Ajustes → Cómo añadirla a la pantalla de inicio</b>.</li></ol>`,
      `<p>You opened the link inside another app. To install it, first open it in the browser:</p>
      <ol class="ik-steps"><li>Tap the ${DOTS} menu or the ${SHARE} button on this screen.</li>
      <li>Choose <b>“Open in ${IS_IOS ? "Safari" : "Chrome"}”</b> (or “Open in browser”).</li>
      <li>There, go back to <b>Settings → How to add it to the Home Screen</b>.</li></ol>`);
    if (IS_IOS){
      const [maj, min] = iosVersion(), dev = IS_IPAD ? "iPad" : "iPhone";
      const ver = maj ? tr(`<p class="ik-nota">Tu ${dev} tiene <b>iOS ${maj}${min ? "." + min : ""}</b>. Estos son los pasos para esa versión.</p>`,
        `<p class="ik-nota">Your ${dev} has <b>iOS ${maj}${min ? "." + min : ""}</b>. These are the steps for that version.</p>`) : "";
      const fin = tr(`<li>Si aparece <b>«Abrir como app web»</b>, déjalo activado y pulsa <span class="ik-kbd">Añadir</span> (arriba a la derecha).</li>
        <li>Listo: el icono <b>${n}</b> aparecerá en tu pantalla de inicio. Ábrela siempre desde ahí.</li>`,
        `<li>If you see <b>“Open as Web App”</b>, leave it on and tap <span class="ik-kbd">Add</span> (top right).</li>
        <li>Done: the <b>${n}</b> icon will appear on your Home Screen. Always open it from there.</li>`);
      const ADD = tr("«Añadir a pantalla de inicio»", "“Add to Home Screen”");
      if (maj && (maj < 16 || (maj === 16 && min < 4)) && IOS_OTHER)
        return ver + tr(`<p>En esta versión de iOS solo se puede instalar desde <b>Safari</b>:</p>`, `<p>On this iOS version it can only be installed from <b>Safari</b>:</p>`) +
          `<ol class="ik-steps"><li>${tr("Copia el enlace y ábrelo en <b>Safari</b>.", "Copy the link and open it in <b>Safari</b>.")} <button class="ik-btn ik-ghost" data-ik="copiar">${tr("Copiar enlace", "Copy link")}</button></li>
          <li>${tr(`Toca el botón <b>Compartir</b> ${SHARE} de la barra de abajo.`, `Tap the <b>Share</b> button ${SHARE} in the bottom bar.`)}</li>
          <li>${tr("Elige", "Choose")} <b>${ADD}</b> ${PLUS}.</li>${fin}</ol>`;
      if (IOS_OTHER)
        return ver + `<p>${tr("Desde este navegador (o desde Safari):", "From this browser (or from Safari):")}</p>
          <ol class="ik-steps"><li>${tr(`Toca el botón <b>Compartir</b> ${SHARE}, en la barra de direcciones (arriba a la derecha) o en el menú del navegador.`, `Tap the <b>Share</b> button ${SHARE}, in the address bar (top right) or in the browser menu.`)}</li>
          <li>${tr("Elige", "Choose")} <b>${ADD}</b> ${PLUS}. ${tr("Si no está, toca <b>«Más»</b> o baja en la lista.", "If it isn't there, tap <b>“More”</b> or scroll down the list.")}</li>${fin}</ol>`;
      if (maj >= 27 && !IS_IPAD)
        return ver + `<ol class="ik-steps">
          <li>${tr(`Toca el botón ${MENU3} de tres rayas que está a la izquierda, dentro de la barra de la dirección (abajo).`, `Tap the three-line button ${MENU3} on the left, inside the address bar (at the bottom).`)}</li>
          <li>${tr(`Toca <b>«Compartir»</b> ${SHARE}.`, `Tap <b>“Share”</b> ${SHARE}.`)}</li>
          <li>${tr("Toca <b>«Ver más»</b> si hace falta, baja en la lista y elige", "Tap <b>“View More”</b> if needed, scroll down and choose")} <b>${ADD}</b> ${PLUS}.</li>${fin}</ol>`;
      if (maj >= 26)
        return ver + `<ol class="ik-steps">
          <li>${tr(`Toca el botón ${HDOTS} que está a la derecha de la barra de la dirección${IS_IPAD ? " (arriba)" : " (abajo)"}.`, `Tap the ${HDOTS} button to the right of the address bar${IS_IPAD ? " (at the top)" : " (at the bottom)"}.`)}</li>
          <li>${tr(`Toca <b>«Compartir»</b> ${SHARE}.`, `Tap <b>“Share”</b> ${SHARE}.`)}</li>
          <li>${tr("Toca <b>«Ver más»</b> si hace falta, baja en la lista y elige", "Tap <b>“View More”</b> if needed, scroll down and choose")} <b>${ADD}</b> ${PLUS}.</li>${fin}</ol>`;
      return ver + `<ol class="ik-steps">
        <li>${tr(`Toca el botón <b>Compartir</b> ${SHARE}${IS_IPAD ? ", arriba a la derecha." : ", en el centro de la barra de abajo. Si no ves la barra, desliza un poco la página hacia arriba."}`, `Tap the <b>Share</b> button ${SHARE}${IS_IPAD ? ", at the top right." : ", in the middle of the bottom bar. If you can't see the bar, scroll the page up a little."}`)}</li>
        <li>${tr("Baja en la lista y elige", "Scroll down the list and choose")} <b>${ADD}</b> ${PLUS}.</li>${fin}</ol>`;
    }
    if (IS_ANDROID) return tr(`<p>En el móvil o la tablet Android, con Chrome:</p>
      <ol class="ik-steps"><li>Toca el menú ${DOTS} (arriba a la derecha).</li>
      <li>Elige <b>«Añadir a pantalla de inicio»</b> o <b>«Instalar aplicación»</b>.</li>
      <li>Pulsa <span class="ik-kbd">Instalar</span>. El icono aparecerá en tu pantalla de inicio.</li></ol>`,
      `<p>On an Android phone or tablet, with Chrome:</p>
      <ol class="ik-steps"><li>Tap the ${DOTS} menu (top right).</li>
      <li>Choose <b>“Add to Home screen”</b> or <b>“Install app”</b>.</li>
      <li>Tap <span class="ik-kbd">Install</span>. The icon will appear on your Home screen.</li></ol>`);
    return tr(`<p>Está pensada para el móvil o la tablet: abre este mismo enlace allí y sigue los pasos que salen.</p>
      <ol class="ik-steps"><li>En el ordenador también se puede instalar con Chrome o Edge: busca el icono de instalar ${PLUS} a la derecha de la barra de direcciones.</li></ol>`,
      `<p>It is designed for phones and tablets: open this same link there and follow the steps shown.</p>
      <ol class="ik-steps"><li>On a computer you can also install it with Chrome or Edge: look for the install icon ${PLUS} at the right of the address bar.</li></ol>`);
  }

  function cerrar(){ const s = document.getElementById("ik-sheet"); if (s) s.remove(); }
  function abrir(html, etiqueta){
    cerrar();
    const s = document.createElement("div");
    s.id = "ik-sheet"; s.className = "ik-bg";
    s.innerHTML = `<div class="ik-sheet" role="dialog" aria-modal="true" aria-label="${etiqueta}"><button class="ik-x" data-ik="cerrar" aria-label="${tr("Cerrar","Close")}">✕</button>${html}</div>`;
    s.addEventListener("click", ev => {
      if (ev.target === s || ev.target.closest('[data-ik="cerrar"]')) { cerrar(); return; }
      const b = ev.target.closest("[data-ik]"); if (!b) return;
      if (b.dataset.ik === "ya") instalarYa();
      if (b.dataset.ik === "copiar"){
        const u = location.origin + location.pathname;
        (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => { b.textContent = tr("✓ Enlace copiado", "✓ Link copied"); }).catch(() => { b.textContent = u; });
      }
    });
    document.body.appendChild(s);
    const x = s.querySelector(".ik-x"); if (x) x.focus();
  }
  async function instalarYa(){
    if (!deferred) return;
    deferred.prompt(); try { await deferred.userChoice; } catch(e){}
    deferred = null; cerrar();
  }
  function abrirInstalar(){
    if (instalada()){ abrir(tr(`<h2>Ya está instalada</h2><p>✓ Ya la estás usando como app instalada. Ábrela siempre desde su icono.</p><div class="ik-nav"><button class="ik-btn" data-ik="cerrar">Entendido</button></div>`,
      `<h2>Already installed</h2><p>✓ You are already using it as an installed app. Always open it from its icon.</p><div class="ik-nav"><button class="ik-btn" data-ik="cerrar">Got it</button></div>`), tr("Instalar", "Install")); return; }
    if (deferred && !IS_IOS && !IN_APP){ instalarYa(); return; }
    abrir(`<div class="ik-head"><img src="icon-192.png" alt=""><div><h2>${tr("Instalar la app", "Install the app")}</h2><span class="ik-muted">${tr("Gratis, sin tienda y sin registrarse", "Free, no app store, no sign-up")}</span></div></div>
      ${pasos()}
      <p class="ik-muted">${tr("Una vez instalada se abre a pantalla completa, funciona sin conexión y se actualiza sola.", "Once installed it opens full screen, works offline and updates itself.")}</p>
      <div class="ik-nav">${deferred ? `<button class="ik-btn" data-ik="ya">${tr("Instalar ahora", "Install now")}</button>` : `<button class="ik-btn" data-ik="cerrar">${tr("Entendido", "Got it")}</button>`}</div>`, tr("Instalar en el móvil", "Install on your phone"));
  }

  // Aviso amarillo «Instálala en tu móvil» (solo en móvil o tablet, si no está instalada y no se ha cerrado)
  function pintarAviso(){
    const viejo = document.getElementById("ik-banner");
    const toca = !instalada() && !st.get(cfg.clave + "-install-hide", 0) && (IS_IOS || IS_ANDROID || deferred)
      && (!cfg.esInicio || cfg.esInicio());
    if (!toca){ if (viejo) viejo.remove(); return; }
    if (viejo) return;
    const b = document.createElement("div");
    b.id = "ik-banner"; b.className = "ik-banner"; b.setAttribute("role", "region"); b.setAttribute("aria-label", tr("Instalar la app", "Install the app"));
    b.innerHTML = `<img src="icon-192.png" alt=""><div><b>📲 ${tr("Instálala en tu", "Install it on your")} ${IS_IPAD ? "iPad" : tr("móvil", "phone")}</b>${tr("Tenla en la pantalla de inicio, como una app.", "Keep it on your Home Screen, like an app.")}</div>
      <button class="ik-btn" data-b="ver">${deferred && !IS_IOS ? tr("Instalar", "Install") : tr("Ver cómo", "Show me how")}</button><button class="ik-bx" data-b="x" aria-label="${tr("No mostrar más", "Don't show again")}">×</button>`;
    b.addEventListener("click", ev => {
      const t = ev.target.closest("[data-b]"); if (!t) return;
      if (t.dataset.b === "ver") abrirInstalar();
      else { st.set(cfg.clave + "-install-hide", 1); b.remove(); }
    });
    document.body.appendChild(b);
  }

  // Comprueba la versión publicada leyendo el <meta name="app-version"> de la página
  const verCmp = (a, b) => { const x = String(a).split(".").map(Number), y = String(b).split(".").map(Number);
    for (let i = 0; i < 3; i++){ const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
  async function versionPublicada(){
    if (!EN_WEB) return null;
    try {
      const txt = await (await fetch(location.pathname + "?v=" + Date.now(), {cache: "no-store"})).text();
      const m = txt.match(/name="app-version" content="([^"]+)"/);
      return m ? m[1] : null;
    } catch(e){ return null; }
  }
  // Botón «Buscar actualizaciones»: escribe el resultado en el elemento msg
  async function buscar(boton, msg){
    if (boton) boton.disabled = true;
    if (msg) msg.textContent = tr("Comprobando…", "Checking…");
    const v = await versionPublicada();
    if (boton) boton.disabled = false;
    if (!msg) return v;
    if (!EN_WEB) msg.textContent = tr("Solo se puede comprobar en la app publicada.", "This can only be checked in the published app.");
    else if (v == null) msg.textContent = tr("No se ha podido comprobar. ¿Tienes conexión a internet?", "Couldn't check. Are you connected to the internet?");
    else if (verCmp(v, cfg.version) > 0){ msg.textContent = tr(`Hay una versión nueva (${v}). Se instalará en cuanto cierres esta ventana.`, `There is a new version (${v}). It will be installed as soon as you close this window.`); if (cfg.onNueva) cfg.onNueva(v); }
    else msg.textContent = tr(`✓ Tienes la última versión (${cfg.version}).`, `✓ You have the latest version (${cfg.version}).`);
    return v;
  }

  function init(c){
    Object.assign(cfg, c);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("ik-sheet")) cerrar(); });
    addEventListener("beforeinstallprompt", ev => { ev.preventDefault(); deferred = ev; pintarAviso(); });
    addEventListener("appinstalled", () => { deferred = null; st.set(cfg.clave + "-install-hide", 1); pintarAviso(); cerrar(); });
    let pend = false;
    if (cfg.esInicio) new MutationObserver(() => { if (pend) return; pend = true; setTimeout(() => { pend = false; pintarAviso(); }, 250); }).observe(document.body, {subtree: true, attributes: true, attributeFilter: ["class", "hidden"]});
    setTimeout(pintarAviso, 1200);
    // Enlace directo a las instrucciones: …/?instalar
    if (/[?&]instalar\b/.test(location.search)){ history.replaceState(history.state, "", location.pathname); if (!instalada()) setTimeout(abrirInstalar, 500); }
  }
  return {init, abrirInstalar, buscar, versionPublicada, verCmp, instalada, EN_WEB};
})();
