/* ===== Ajustes, novedades y actualización automática (Guía común de indalo-apps) ===== */
(function(){
  const q=s=>document.querySelector(s);
  const VERSION=(q('meta[name="app-version"]')||{}).content||'dev';
  const NOVEDADES=[
    ["1.3",["☀ Sol y sombras: de dónde viene la luz a cada hora en Almería (o donde estés), cuánto miden las sombras, a qué hora sale y se pone el sol y las horas doradas, con brújula","📍 Rutas y retos por Almería: 17 sitios de la ciudad y la provincia para dibujar, cada uno con un reto y su lección","🎒 Lista de material para salir a dibujar, con recordatorio en tu calendario","🎨 Color: «Paleta limitada», las 3 pinturas de tu caja con las que mejor sale toda la foto","◐ Valores: dos vistas nuevas, «Bordes» (qué contornos merecen línea de tinta) y «Trama» (los tonos en líneas paralelas, cruzadas o puntos)","📖 Dos lecciones nuevas: Tramas y sombreados, y Grosor de línea"]],
    ["1.2",["▦ Encaje: «Proporciones». Tocas dos esquinas de una fachada y la app deshace la perspectiva, la mide de verdad y dibuja los cuadrados que caben y sus diagonales (Stephanie Bower)","🖍 Rotuladores Albrecht Dürer de Faber-Castell: sus 30 colores en Color y en «Mi caja»","🖨 Hoja de pruebas para imprimir (PDF, A4): casillas para pintar cada color con más o menos agua y la tabla de mezclas","📖 Tres lecciones nuevas: Busca cuadrados, Escaleras y Arcos y círculos"]],
    ["1.1",["🏘 Encaje: «Otra fachada» para calles torcidas, con su punto de fuga en el mismo horizonte (Matthew Brehm). Basta una recta","✏ Encaje: «Medir con el lápiz», con el ángulo de cada línea con la horizontal y cuántas veces mide la primera","👁 Etapa nueva, Comparar: haz una foto de tu apunte y la app la pone encima de la foto, transparente o en «diferencia», con el horizonte y las fugas","📖 Cuatro lecciones nuevas: Muchos puntos de fuga, Perspectiva curvilínea, Mirar con el lápiz y Un apunte paso a paso"]],
    ["1.0",["📷 Nueva foto: encuadre, encaje, valores, color y resumen, en cinco etapas","📐 Encaje: puntos de fuga con 1, 2 o 3 puntos, horizonte, rejilla, cono de visión de 60° y cómo pasarlo a tu cuaderno","🧍 Personas a escala y medir alturas con la línea del horizonte","◐ Valores: la foto en 2 a 5 tonos y el plan de aguadas, capa a capa","🎨 Color: los colores de la foto con su nombre y con qué pinturas de tu carta salen (Van Gogh, Daniel Smith o Cotman), y la tabla de mezclas","🌅 Al natural: tu horizonte en vivo con la cámara","📖 Aprender: 12 lecciones con dibujos que se mueven","🖼 Tarjeta resumen en imagen para compartir"]],
  ];
  const verCmp=(a,b)=>{const x=String(a).split('.').map(Number),y=String(b).split('.').map(Number);for(let i=0;i<3;i++){const d=(x[i]||0)-(y[i]||0);if(d)return d}return 0};
  const EN_WEB=/\.github\.io$/.test(location.hostname)||location.hostname==='localhost';
  // ---- Preferencias ----
  function aplicarPref(){
    const r=document.documentElement;
    if(PREF.letra==='normal')r.removeAttribute('data-letra');else r.setAttribute('data-letra',PREF.letra);
    try{const t=document.createElement('span');t.style.font='-apple-system-body';if(t.style.font){t.style.position='absolute';t.style.visibility='hidden';document.body.appendChild(t);const fs=parseFloat(getComputedStyle(t).fontSize);t.remove();
      if(fs>0)r.style.setProperty('--esc-sis',Math.min(1.9,Math.max(1.2,fs/14.2)).toFixed(3));}}catch(e){}
    if(PREF.tema==='auto')r.removeAttribute('data-tema');else r.setAttribute('data-tema',PREF.tema);
    document.querySelectorAll('meta[name="theme-color"]').forEach((m,i)=>m.setAttribute('content',PREF.tema==='claro'?'#9a4527':PREF.tema==='oscuro'?'#171513':(i?'#171513':'#9a4527')));
    document.querySelectorAll('[data-op]').forEach(g=>{if(!(g.dataset.op in PREF)||!g.closest('#dlg-ajustes'))return;g.querySelectorAll('button').forEach(b=>{const on=b.dataset.val===String(PREF[g.dataset.op]);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)})});
    q('#aj-ojo').value=PREF.ojo}
  q('#dlg-ajustes').querySelectorAll('[data-op]').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;PREF[g.dataset.op]=b.dataset.val;guardarPref();aplicarPref();
    if(g.dataset.op==='marca')cambioPintura()}));
  q('#aj-ojo').addEventListener('change',e=>{const v=parseFloat(String(e.target.value).replace(',','.'));if(v>=0.5&&v<=2.2){PREF.ojo=v;guardarPref()}else e.target.value=PREF.ojo});
  aplicarPref();
  let cambio=false;const cambioPintura=()=>{cambio=true};
  // ---- Ventanas ----
  const pila=[];
  window.abrirDlg=id=>abrir(id);window.cerrarDlg=id=>cerrar(id);
  function abrir(id){pila.push(document.activeElement);q('#'+id).hidden=false;const x=q('#'+id+' .x');if(x)x.focus()}
  function cerrar(id){q('#'+id).hidden=true;const f=pila.pop();if(f&&f.focus&&f.isConnected)try{f.focus()}catch(e){}
    if(id==='dlg-ajustes'&&cambio){cambio=false;if(location.hash.startsWith('#foto/')&&/\/(color|resumen)$/.test(location.hash))pintar()}}
  q('#aj-ver').textContent=VERSION;q('#aj-ver2').textContent=VERSION;
  q('#btn-version').textContent='Ajustes · Versión '+VERSION+' · Novedades';
  q('#btn-ajustes').onclick=()=>abrir('dlg-ajustes');q('#btn-version').onclick=()=>abrir('dlg-ajustes');
  ['aj-x','aj-cerrar'].forEach(id=>q('#'+id).onclick=()=>cerrar('dlg-ajustes'));
  ['nov-x','nov-cerrar'].forEach(id=>q('#'+id).onclick=()=>cerrar('dlg-novedades'));
  q('#aj-instalar').onclick=()=>IK.abrirInstalar();
  q('#aj-buscar').onclick=()=>IK.buscar(q('#aj-buscar'),q('#aj-upd-msg'));
  q('#aj-novedades').onclick=()=>{cerrar('dlg-ajustes');verNovedades(null)};
  // ---- Mi caja ----
  function pintarCaja(){const carta=CARTAS[PREF.marca]||CARTAS.vg,sel=new Set((PREF.caja||{})[PREF.marca]||[]);
    q('#caja-tit').textContent='Mi caja · '+carta.nombre;
    q('#caja-lista').innerHTML=carta.colores.map((c,i)=>`<label><input type="checkbox" data-i="${i}" ${sel.has(i)?'checked':''}><span class="m" style="background:${c[3]}" aria-hidden="true"></span><span>${c[0]?c[0]+' · ':''}${c[1]}</span></label>`).join('');
    contar()}
  function contar(){const n=((PREF.caja||{})[PREF.marca]||[]).length;q('#caja-cuenta').textContent=n>=2?`${n} pastillas marcadas: las mezclas se buscan solo con ellas.`:'Ninguna marcada (o solo una): se usa toda la carta.'}
  function guardarCaja(){const s=[...q('#caja-lista').querySelectorAll('input:checked')].map(x=>+x.dataset.i);PREF.caja=Object.assign({},PREF.caja,{[PREF.marca]:s});guardarPref();contar();cambio=true}
  q('#caja-lista').addEventListener('change',guardarCaja);
  q('#caja-todas').onclick=()=>{q('#caja-lista').querySelectorAll('input').forEach(x=>x.checked=true);guardarCaja()};
  q('#caja-ninguna').onclick=()=>{q('#caja-lista').querySelectorAll('input').forEach(x=>x.checked=false);guardarCaja()};
  q('#aj-caja').onclick=()=>{pintarCaja();abrir('dlg-caja')};
  q('#caja-hoja').onclick=()=>HOJA.descargar(t=>{q('#caja-hoja-msg').textContent=t});
  ['caja-x','caja-cerrar'].forEach(id=>q('#'+id).onclick=()=>cerrar('dlg-caja'));
  // ---- Los libros, contacto y privacidad ----
  const LIBROS=[
    ['Bruno Mollière','La perspectiva en urban sketching. Trucos y técnicas para dibujantes','Gustavo Gili','2017'],
    ['Stephanie Bower','The Urban Sketching Handbook: Understanding Perspective','Quarry (Quarto)','2016'],
    ['Masao Yamada','A Beginner’s Guide to Sketching Buildings & Landscapes','Tuttle','2023'],
    ['Matthew Brehm','Drawing Perspective: How to See It and How to Apply It','Barron’s','2015'],
    ['Ernest R. Norling','Perspective Made Easy','Dover (1.ª ed. Macmillan, 1939)','1999'],
    ['Joseph D’Amelio','Perspective Drawing Handbook','Dover (1.ª ed. Tudor, 1964)','2004'],
    ['Robert Pastrana','Simplifying Perspective: A Step-by-Step Guide for Visual Artists','Focal Press','2015'],
    ['Sarah Haley','Perspective Drawing','Tempe Digital','2018'],
    ['Phil Metzger','The Art of Perspective: The Ultimate Guide for Artists in Every Medium','North Light Books','2007'],
    ['Craig Attebery','The Complete Guide to Perspective Drawing: From One-Point to Six-Point','Focal Press (Routledge)','2018'],
    ['Jorge Paricio','Perspective Sketching: Freehand and Digital Drawing Techniques for Artists & Designers','Rockport','2015'],
    ['Mitch Leeuwe','How to Draw in Perspective','edición del autor','2020'],
    ['Dong Ho Kim','Space Drawing: Perspective','',''],
    ['Felix Scheinberger','Acuarela para urban sketchers','Gustavo Gili','2015']];
  q('#aj-libros').innerHTML=`<p>Las lecciones, las reglas y los cálculos siguen estos libros:</p><ul class="libros">`+LIBROS.map(l=>`<li>${l[0]}: <i>${l[1]}</i>${l[2]?'. '+l[2]:''}${l[3]?', '+l[3]:''}.</li>`).join('')+'</ul>'+
    `<p class="muted">Los textos y los dibujos de la app son propios, rehechos a partir de las explicaciones de los libros; no se reproducen páginas ni ilustraciones. Las cartas de acuarela (Van Gogh de Royal Talens, Daniel Smith y Cotman de Winsor & Newton) y la de los rotuladores Albrecht Dürer de Faber-Castell (folleto «Albrecht Dürer Watercolour Marker», 2018) se basan en las cartas publicadas por cada marca y en pantalla son aproximadas. La posición del sol se calcula con las fórmulas aproximadas del U.S. Naval Observatory.</p>`;
  q('#aj-contacto').onclick=()=>{try{window.open('https://github.com/indalo-apps/urban-sketching/issues','_blank','noopener')}catch(e){}};
  q('#aj-privacidad').onclick=()=>{cerrar('dlg-ajustes');abrir('dlg-privacidad')};
  ['priv-x','priv-cerrar'].forEach(id=>q('#'+id).onclick=()=>{cerrar('dlg-privacidad');abrir('dlg-ajustes')});
  document.querySelectorAll('.dlg').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)cerrar(d.id)}));
  document.addEventListener('keydown',e=>{
    const d=[...document.querySelectorAll('.dlg')].reverse().find(x=>!x.hidden);if(!d)return;
    if(e.key==='Escape'){cerrar(d.id);return}
    if(e.key!=='Tab')return;const f=[...d.querySelectorAll('button,input,select,a[href]')].filter(x=>!x.closest('[hidden]'));const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});
  document.querySelectorAll('.hoja').forEach(h=>{let y0=null;
    h.addEventListener('touchstart',e=>{y0=h.scrollTop<=0?e.touches[0].clientY:null},{passive:true});
    h.addEventListener('touchmove',e=>{if(y0==null)return;const dy=e.touches[0].clientY-y0;if(dy>0)h.style.transform=`translateY(${dy}px)`},{passive:true});
    h.addEventListener('touchend',e=>{if(y0==null)return;const dy=e.changedTouches[0].clientY-y0;h.style.transform='';y0=null;if(dy>90)cerrar(h.parentNode.id)})});
  // ---- Novedades ----
  function verNovedades(desde){
    const todas=NOVEDADES.filter(([v])=>!desde||verCmp(v,desde)>0);if(!todas.length)return;
    const lista=todas.slice(0,4),mas=todas.length-lista.length;
    q('#nov-titulo').textContent=desde?'¡La app se ha actualizado!':'Novedades';
    q('#nov-lista').innerHTML=lista.map(([v,items])=>`<h3>Versión ${v}</h3><ul>${items.map(t=>`<li>${t}</li>`).join('')}</ul>`).join('')+(mas>0?`<p class="muted">…y ${mas} ${mas===1?'versión':'versiones'} más.</p>`:'');
    abrir('dlg-novedades')}
  (function(){const vista=store.get('us-version',null);store.set('us-version',VERSION);if(vista&&verCmp(VERSION,vista)>0)setTimeout(()=>verNovedades(vista),700)})();
  // ---- Actualización automática: nunca con una ventana abierta, la cámara encendida o un dedo en la pantalla ----
  let pulsando=false;
  addEventListener('pointerdown',()=>pulsando=true,true);addEventListener('pointerup',()=>pulsando=false,true);addEventListener('pointercancel',()=>pulsando=false,true);
  const seguroRecargar=()=>!document.querySelector('.dlg:not([hidden])')&&!document.getElementById('ik-sheet')&&!pulsando&&rutaActual!=='natural'&&!(document.activeElement&&/INPUT|SELECT/.test(document.activeElement.tagName));
  let pendiente=false;
  function actualizar(){if(!seguroRecargar()){pendiente=true;return}
    pendiente=false;q('#barra-act').hidden=false;setTimeout(()=>location.replace(location.pathname+'?u='+Date.now()+location.hash),900)}
  if(/[?&]u=\d/.test(location.search))history.replaceState(null,'',location.pathname+location.search.replace(/[?&]u=\d+/,'').replace(/^&/,'?')+location.hash);
  async function buscarVersion(){const v=await IK.versionPublicada();if(v&&verCmp(v,VERSION)>0)actualizar()}
  new MutationObserver(()=>{if(pendiente&&seguroRecargar())actualizar()}).observe(document.body,{subtree:true,attributes:true,childList:true,attributeFilter:['hidden']});
  addEventListener('pointerup',()=>setTimeout(()=>{if(pendiente&&seguroRecargar())actualizar()},300));
  addEventListener('hashchange',()=>setTimeout(()=>{if(pendiente&&seguroRecargar())actualizar()},300));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')buscarVersion()});
  addEventListener('focus',buscarVersion);setInterval(buscarVersion,90*1000);setTimeout(buscarVersion,3000);
  IK.init({nombre:'Urban Sketching',clave:'us',version:VERSION,onNueva:()=>actualizar(),esInicio:()=>!document.querySelector('.dlg:not([hidden])')&&rutaActual==='inicio'});
  if(EN_WEB&&'serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(r=>r.update()).catch(()=>{}));
})();
