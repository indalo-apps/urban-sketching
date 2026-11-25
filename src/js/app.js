/* ===== Urban Sketching: navegación, portada, apuntes y piezas comunes de las etapas ===== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const NS='http://www.w3.org/2000/svg';
function el(tag,attrs,padre){const e=document.createElementNS(NS,tag);if(attrs)for(const k in attrs)e.setAttribute(k,attrs[k]);if(padre)padre.appendChild(e);return e}
function html(s){const t=document.createElement('template');t.innerHTML=s.trim();return t.content.firstElementChild}
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=(n,d=1)=>Number(n).toLocaleString('es-ES',{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=x=>Math.round(x*100)+' %';
let vivoT=0;const anunciar=t=>{const v=$('#vivo');v.textContent='';clearTimeout(vivoT);vivoT=setTimeout(()=>v.textContent=t,60)};
const US={p:null,img:null,url:null,id:null};// apunte abierto
const ETAPAS={};// las rellenan encuadre.js, encaje.js, valores.js, paleta.js y resumen.js
const ORDEN_ETAPAS=['encuadre','encaje','valores','color','resumen','comparar'];
const NOMBRE_ETAPA={encuadre:'Encuadre',encaje:'Encaje',valores:'Valores',color:'Color',resumen:'Resumen',comparar:'Comparar'};
let guardarT=0;function guardar(){if(!US.p)return;clearTimeout(guardarT);guardarT=setTimeout(()=>ALMACEN.guardar(US.p),300)}
const fecha=t=>new Date(t).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
/* ---------- Apuntes ---------- */
function nuevoId(){return 'p'+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36)}
async function crearApunte(canvas,extra){
  const id=nuevoId(),w=canvas.width,h=canvas.height;
  const blob=await new Promise(ok=>canvas.toBlob(ok,'image/jpeg',0.88));
  const m=document.createElement('canvas'),k=240/Math.max(w,h);m.width=Math.round(w*k);m.height=Math.round(h*k);m.getContext('2d').drawImage(canvas,0,0,m.width,m.height);
  const p=Object.assign({id,creado:Date.now(),nombre:'',w,h,etapa:'encuadre',mini:m.toDataURL('image/jpeg',0.75),
    enc:{prop:'a5h',rect:null,guia:'tercios',cielo:'5:8'},
    pers:{modo:2,lineas:null,personas:[],medidas:[],herramienta:'rectas',regla:true,cono:true,rejilla:false,densidad:8,h0:null,v0:null,zoom:1},
    val:{n:3,borroso:2,umb:null,vista:'tonos',paso:0},col:{k:5,sel:0}},extra||{});
  await ALMACEN.guardarFoto(id,blob);await ALMACEN.guardar(p);return id}
// Foto elegida por la persona: se reduce a 1600 px de lado como mucho y se guarda en el móvil
async function cargarArchivo(f){
  if(!f||!/^image\//.test(f.type)){anunciar('Ese archivo no es una imagen.');return}
  $('#app').prepend(html('<p class="nota" role="status">Preparando la foto…</p>'));
  try{const url=URL.createObjectURL(f),img=new Image();img.src=url;await img.decode();
    const k=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');
    c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
    const id=await crearApunte(c,{nombre:(f.name||'').replace(/\.[a-z0-9]+$/i,'').replace(/^(IMG|DSC|PXL)[_-]?/i,'').slice(0,40)});
    location.hash='#foto/'+id+'/encuadre'}
  catch(e){alert('No se ha podido abrir esa foto. Prueba con otra (JPG, PNG o HEIC desde la galería).')}}
$('#archivo').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';cargarArchivo(f)});
const elegirFoto=()=>$('#archivo').click();
async function abrirApunte(id){
  if(US.id===id&&US.img)return true;
  const p=await ALMACEN.leer(id),b=p&&await ALMACEN.foto(id);if(!p||!b)return false;
  if(US.url)URL.revokeObjectURL(US.url);US.url=URL.createObjectURL(b);const img=new Image();img.src=US.url;await img.decode();
  US.p=p;US.img=img;US.id=id;US.cache={};return true}
// Foto de ejemplo inventada: una esquina con dos calles, dibujada con el motor de escenas (sin derechos de nadie)
async function apunteEjemplo(){
  const c=document.createElement('canvas');c.width=1200;c.height=900;const x=c.getContext('2d');
  const cam=ESCENA.camara({ojo:1.6,yaw:-8,pitch:4,f:780,w:1200,h:900});
  const g=x.createLinearGradient(0,0,0,cam.horizonteY);g.addColorStop(0,'#7fa7cf');g.addColorStop(1,'#d9e6ef');x.fillStyle=g;x.fillRect(0,0,1200,900);
  x.fillStyle='#b7a58c';x.fillRect(0,cam.horizonteY,1200,900);
  const cajas=[ESCENA.caja({x:-2,z:22,w:9,d:8,h:13,giro:38,color:'#e2c79a',ventanas:true}),ESCENA.caja({x:10,z:34,w:8,d:9,h:9,giro:38,color:'#f0ece2',ventanas:true}),
    ESCENA.caja({x:-12,z:30,w:7,d:7,h:16,giro:38,color:'#c9875f',ventanas:true}),ESCENA.caja({x:4,z:15,w:3,d:3,h:3,giro:38,color:'#d7d0c2'})];
  const sol=[0.6,0.7,-0.4];
  for(const {f,pp,hs} of ESCENA.proyectar(cam,cajas)){
    const luz=Math.max(0,f.n[0]*sol[0]+f.n[1]*sol[1]+f.n[2]*sol[2]),[r,gg,b]=COLOR.hexRgb(f.color),k=0.55+0.5*luz;
    x.fillStyle=f.tipo==='techo'?'#9b8d7a':`rgb(${r*k|0},${gg*k|0},${b*k|0})`;x.beginPath();pp.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.closePath();x.fill();
    x.fillStyle=`rgba(40,45,60,${0.55+0.2*(1-luz)})`;for(const w of hs){x.beginPath();w.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.closePath();x.fill()}}
  // Sombra en la acera y una persona
  x.fillStyle='rgba(60,50,40,.25)';const s0=[cam.ver([-6,0,16]),cam.ver([6,0,13]),cam.ver([9,0,18]),cam.ver([-3,0,20])];x.beginPath();s0.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.fill();
  const pie=cam.ver([1.5,0,11]),cab=cam.ver([1.5,1.72,11]);x.fillStyle='#3b3029';x.beginPath();x.arc(pie[0],cab[1]+10,10,0,7);x.fill();x.fillRect(pie[0]-14,cab[1]+22,28,(pie[1]-cab[1])-22);
  // Rectas del encaje ya apoyadas en las aristas del edificio principal (para ver el resultado sin mover nada)
  const k=cajas[0].esquinas,P=q=>cam.ver(q).map(v=>Math.round(v*10)/10),up=(q,y)=>[q[0],y,q[2]],fx=[[P(k.b[0]),P(k.b[1])],[P(up(k.b[0],8)),P(up(k.b[1],8))]],fz=[[P(k.b[1]),P(k.b[2])],[P(up(k.b[1],8)),P(up(k.b[2],8))]];
  const VX=GEOM.puntoFuga(fx),izq=VX&&VX[0]<600;
  const pers={modo:2,lineas:{A:izq?fx:fz,B:izq?fz:fx,V:[]},personas:[],medidas:[],herramienta:'rectas',regla:true,cono:true,rejilla:false,densidad:8,h0:null,v0:null};
  const id=await crearApunte(c,{nombre:'Ejemplo: una esquina inventada',pers});location.hash='#foto/'+id+'/encuadre'}
/* ---------- Navegación ---------- */
const PADRE={mis:['#inicio','Inicio'],natural:['#inicio','Inicio'],sol:['#inicio','Inicio'],rutas:['#inicio','Inicio'],material:['#inicio','Inicio'],aprender:['#inicio','Inicio'],leccion:['#aprender','Aprender'],foto:['#mis','Mis apuntes']};
function cabecera(ruta,titulo,sub){
  const v=$('#volver'),pa=PADRE[ruta];v.hidden=!pa;$('#casa').hidden=ruta==='inicio';
  if(pa){v.textContent='‹ '+pa[1];v.setAttribute('aria-label','Volver a '+pa[1]);v.onclick=()=>{location.hash=pa[0]}}
  $('#titulo').hidden=ruta==='inicio';$('#h1').textContent=titulo||'Urban Sketching';const s=$('#sub');s.hidden=!sub;s.textContent=sub||'';
  document.title=(ruta==='inicio'?'':titulo+' · ')+'Urban Sketching'}
let rutaActual='',limpiar=null;
async function pintar(){
  if(limpiar){try{limpiar()}catch(e){}limpiar=null}
  const partes=(location.hash||'#inicio').slice(1).split('/'),ruta=partes[0]||'inicio',main=$('#app');
  main.innerHTML='';main.className='';void main.offsetWidth;main.className='vista';
  rutaActual=ruta;scrollTo(0,0);
  if(ruta==='foto'){const ok=await abrirApunte(partes[1]);if(!ok){location.replace('#mis');return}
    let et=ORDEN_ETAPAS.includes(partes[2])?partes[2]:US.p.etapa||'encuadre';US.p.etapa=et;guardar();
    store.set('us-ultimo',{id:US.id,etapa:et});return vistaFoto(main,et)}
  if(ruta==='mis')return vistaMis(main);
  if(ruta==='natural')return VISTA_NATURAL(main);
  if(ruta==='sol')return VISTA_SOL(main);
  if(ruta==='rutas')return VISTA_RUTAS(main);
  if(ruta==='material')return VISTA_MATERIAL(main);
  if(ruta==='aprender')return partes[1]?VISTA_LECCION(main,+partes[1]):VISTA_APRENDER(main);
  return vistaInicio(main)}
addEventListener('hashchange',pintar);
/* ---------- Portada ---------- */
function dibujoPortada(){
  const cam=ESCENA.camara({ojo:1.6,yaw:-6,f:300,w:1000,h:300}),hy=cam.horizonteY;
  const cajas=[ESCENA.caja({x:-3,z:24,w:9,d:9,h:10,giro:40,ventanas:true}),ESCENA.caja({x:-17,z:36,w:7,d:7,h:13,giro:40,ventanas:true}),ESCENA.caja({x:11,z:38,w:9,d:9,h:8,giro:40,ventanas:true})];
  const A=cam.dir([Math.cos(40*Math.PI/180),0,-Math.sin(40*Math.PI/180)]).p,B=cam.dir([Math.sin(40*Math.PI/180),0,Math.cos(40*Math.PI/180)]).p;
  let s=`<svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="1000" height="300" fill="#efe4d0"/>`;
  s+=`<g fill="none" stroke="#9a4527" stroke-width="1" stroke-dasharray="5 6" opacity=".55">`;
  const k=cajas[0].esquinas;for(const P of [k.t[0],k.b[0],k.t[1],k.b[1]]){const p=cam.ver(P);if(p){s+=`<line x1="${p[0]}" y1="${p[1]}" x2="${A[0]}" y2="${A[1]}"/>`}}
  for(const P of [k.t[1],k.b[1],k.t[2],k.b[2]]){const p=cam.ver(P);if(p)s+=`<line x1="${p[0]}" y1="${p[1]}" x2="${B[0]}" y2="${B[1]}"/>`}
  s+=`</g><line x1="0" y1="${hy}" x2="1000" y2="${hy}" stroke="#24201b" stroke-width="1.4"/>`;
  const tintes=['#e3b989','#c98c66','#d9cdb5'];let i=0;
  for(const {f,pp,hs} of ESCENA.proyectar(cam,cajas)){const t=tintes[cajas.findIndex(c=>c.caras.includes(f))%3];
    s+=`<polygon points="${ESCENA.pts(pp)}" fill="${t}" fill-opacity="${f.tipo==='lado'?0.85:f.tipo==='techo'?0.4:0.6}" stroke="#24201b" stroke-width="1.6" stroke-linejoin="round"/>`;
    for(const w of hs)s+=`<polygon points="${ESCENA.pts(w)}" fill="#24201b" fill-opacity=".55"/>`;i++}
  return s+'</svg>'}
const ICONO=(n)=>window.icono?icono(n):'';
const AVISO_FOTOS=`<b>⚠ Tus fotos y apuntes se guardan solo dentro de esta app, en este móvil.</b> No van a tu carrete de Fotos ni a iCloud, y no pasan a otro móvil ni al ordenador. Si borras la app (su icono de la pantalla de inicio) o los datos de Safari de este sitio, se pierden. Si quieres conservar una foto, hazla con la cámara del móvil y elígela luego desde la galería.`;
async function vistaInicio(main){
  cabecera('inicio');
  main.append(html(`<div class="portada">${dibujoPortada()}<div class="portada-txt"><h1 class="portada-t">Urban Sketching</h1><p class="portada-s">Perspectiva, valores y color para dibujar la ciudad</p></div></div>`));
  const t=html('<div class="tarjetas"></div>');main.append(t);
  const u=store.get('us-ultimo',null),p=u&&await ALMACEN.leer(u.id);
  if(p)t.append(html(`<button class="tarjeta seguir" id="t-seguir"><img class="mini" src="${p.mini}" alt=""><span><b>Seguir donde lo dejaste</b><span class="muted">${esc(p.nombre||'Apunte sin nombre')} · ${NOMBRE_ETAPA[u.etapa]||''}</span></span></button>`));
  t.append(html(`<button class="tarjeta" id="t-foto"><span class="tic">${ICONO('foto')}</span><span><b>Nueva foto</b><span class="muted">Encuadra, encaja la perspectiva, planifica los valores y saca la paleta</span></span></button>`));
  t.append(html(`<a class="boton tarjeta" href="#natural"><span class="tic">${ICONO('horizonte')}</span><span><b>Al natural</b><span class="muted">Con la cámara: tu horizonte en vivo, a la altura de tus ojos</span></span></a>`));
  t.append(html(`<a class="boton tarjeta" href="#sol"><span class="tic">${ICONO('sol')}</span><span><b>Sol y sombras</b><span class="muted">De dónde vendrá la luz a cada hora, y cuánto miden las sombras</span></span></a>`));
  t.append(html(`<a class="boton tarjeta" href="#rutas"><span class="tic">${ICONO('lugar')}</span><span><b>Rutas y retos por Almería</b><span class="muted">${SITIOS.length} sitios para dibujar, cada uno con su reto</span></span></a>`));
  t.append(html(`<a class="boton tarjeta" href="#material"><span class="tic">${ICONO('mochila')}</span><span><b>Lista de material</b><span class="muted">Lo que llevas al salir, con recordatorio en tu calendario</span></span></a>`));
  t.append(html(`<a class="boton tarjeta" href="#aprender"><span class="tic">${ICONO('perspectiva')}</span><span><b>Aprender perspectiva</b><span class="muted">${LECCIONES.length} lecciones con dibujos que se mueven</span></span></a>`));
  t.append(html(`<a class="boton tarjeta" href="#mis"><span class="tic">${ICONO('cuaderno')}</span><span><b>Mis apuntes</b><span class="muted">Las fotos que has trabajado, guardadas en este móvil</span></span></a>`));
  t.append(html(`<button class="tarjeta" id="t-ejemplo"><span class="tic">${ICONO('imagen')}</span><span><b>Probar con un ejemplo</b><span class="muted">Una esquina inventada, para ver cómo funciona sin buscar una foto</span></span></button>`));
  const s=$('#t-seguir');if(s)s.onclick=()=>{location.hash='#foto/'+u.id+'/'+u.etapa};
  $('#t-foto').onclick=elegirFoto;$('#t-ejemplo').onclick=apunteEjemplo;
  if(!store.get('us-aviso-fotos',false)){const a=html(`<div class="aviso-foto aviso-guardado" role="note"><p>${AVISO_FOTOS}</p><div class="ops" style="margin-top:8px"><button id="av-ok">Entendido</button><a class="boton" href="#mis">Ver mis apuntes</a></div></div>`);
    t.before(a);a.querySelector('#av-ok').onclick=()=>{store.set('us-aviso-fotos',true);a.remove();anunciar('Aviso cerrado. Lo tienes siempre en Mis apuntes y en Ajustes.');$('#t-foto').focus()}}
  main.append(html(`<p class="aviso-foto"><b>Un consejo de Bruno Mollière:</b> la perspectiva se aprende mejor dibujando al natural que copiando fotos, porque el gran angular del móvil deforma los bordes. Usa las fotos para comprobar y planificar, y sal a la calle con «Al natural».</p>`))}
/* ---------- Mis apuntes ---------- */
async function vistaMis(main){
  cabecera('mis','Mis apuntes','Se guardan solo en este móvil');
  const lista=await ALMACEN.lista();
  const bar=html(`<div class="ops" style="margin-bottom:12px"><button class="prim" id="m-nueva">📷 Nueva foto</button><button id="m-ej">🖼 Ejemplo</button></div>`);main.append(bar);
  $('#m-nueva').onclick=elegirFoto;$('#m-ej').onclick=apunteEjemplo;
  main.append(html(`<p class="aviso-foto aviso-guardado" role="note">${AVISO_FOTOS}</p>`));
  if(!(await ALMACEN.persistente()))main.append(html('<p class="nota">Este navegador no deja guardar datos: los apuntes se perderán al cerrar la app.</p>'));
  if(!lista.length){main.append(html('<p class="vacio">Todavía no hay apuntes. Empieza con una foto de un edificio o una calle.</p>'));return}
  const ul=html('<ul class="apuntes"></ul>');main.append(ul);
  for(const p of lista){const li=html(`<li><img src="${p.mini}" alt=""><div class="info"><b>${esc(p.nombre||'Apunte sin nombre')}</b><span class="muted">${fecha(p.creado)} · ${NOMBRE_ETAPA[p.etapa]||''}</span>
    <div class="ops"><a class="boton prim" href="#foto/${p.id}/${p.etapa||'encuadre'}">Abrir</a><button data-borrar="${p.id}" aria-label="Borrar ${esc(p.nombre||'apunte')}">🗑 Borrar</button></div></div></li>`);ul.append(li)}
  ul.addEventListener('click',async e=>{const b=e.target.closest('[data-borrar]');if(!b)return;
    if(b.dataset.ok!=='1'){b.dataset.ok='1';b.lastChild.nodeValue=' Toca otra vez para borrar';setTimeout(()=>{if(b.isConnected){b.dataset.ok='';b.lastChild.nodeValue=' Borrar'}},3500);return}
    const id=b.dataset.borrar;await ALMACEN.borrar(id);if(US.id===id){US.id=null;US.p=null;US.img=null}
    const u=store.get('us-ultimo',null);if(u&&u.id===id)store.set('us-ultimo',null);anunciar('Apunte borrado.');pintar()})}
/* ---------- Vista de un apunte con sus etapas ---------- */
function vistaFoto(main,et){
  const p=US.p;cabecera('foto',p.nombre||'Apunte sin nombre',NOMBRE_ETAPA[et]);
  const tabs=html(`<div class="etapas" role="tablist" aria-label="Etapas">${ORDEN_ETAPAS.map((e,i)=>`<button role="tab" aria-selected="${e===et}" data-et="${e}" id="tab-${e}" aria-controls="etapa"><span class="n">${i+1}</span>${NOMBRE_ETAPA[e]}</button>`).join('')}</div>`);
  main.append(tabs);
  tabs.addEventListener('click',e=>{const b=e.target.closest('[data-et]');if(b)location.hash='#foto/'+p.id+'/'+b.dataset.et});
  tabs.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;const i=ORDEN_ETAPAS.indexOf(et)+(e.key==='ArrowRight'?1:-1);
    if(i>=0&&i<ORDEN_ETAPAS.length){location.hash='#foto/'+p.id+'/'+ORDEN_ETAPAS[i];setTimeout(()=>{const t=$('#tab-'+ORDEN_ETAPAS[i]);if(t)t.focus()},80)}});
  const cont=html(`<div id="etapa" role="tabpanel" aria-labelledby="tab-${et}"></div>`);main.append(cont);
  ETAPAS[et].pintar(cont)}
function botonSiguiente(et){const i=ORDEN_ETAPAS.indexOf(et),sig=ORDEN_ETAPAS[i+1];
  const b=html(`<button class="prim siguiente">${sig?'Siguiente: '+NOMBRE_ETAPA[sig].toLowerCase()+' →':'Volver a Mis apuntes'}</button>`);
  b.onclick=()=>{location.hash=sig?'#foto/'+US.p.id+'/'+sig:'#mis'};return b}
/* ---------- Lienzo SVG sobre la foto, con puntos que se arrastran ---------- */
function crearZona(cont){
  const z=html(`<div class="cz"><div class="lienzo"><svg class="dib" xmlns="${NS}" role="group"></svg><div class="barra"></div></div><div class="panel"></div></div>`);cont.append(z);
  return {zona:z,svg:z.querySelector('svg'),barra:z.querySelector('.barra'),panel:z.querySelector('.panel'),lienzo:z.querySelector('.lienzo')}}
// Unidades del dibujo que ocupa un píxel de pantalla (para que puntos y letras tengan siempre el mismo tamaño)
function unidad(svg){const vb=svg.viewBox.baseVal,r=svg.getBoundingClientRect();return r.width?Math.max(vb.width/r.width,vb.height/r.height):1}
function puntoSVG(svg,ev){const p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
/* Arrastre: los elementos con data-asa se pueden mover con el dedo, el ratón o el teclado (flechas).
   mover(id, [x, y]) recibe la posición nueva; seleccionar(id) marca el punto activo para los botones de mover. */
function arrastres(svg,{mover,soltar,seleccionar,tocar}){
  let activo=null,id0=null;
  svg.addEventListener('pointerdown',e=>{const a=e.target.closest('[data-asa]');
    if(!a){if(tocar){const p=puntoSVG(svg,e);tocar([p.x,p.y],e)}return}
    e.preventDefault();activo=a.dataset.asa;id0=e.pointerId;try{svg.setPointerCapture(e.pointerId)}catch(_){}if(seleccionar)seleccionar(activo)});
  svg.addEventListener('pointermove',e=>{if(!activo||e.pointerId!==id0)return;const p=puntoSVG(svg,e);mover(activo,[p.x,p.y])});
  const fin=e=>{if(!activo||e.pointerId!==id0)return;const a=activo;activo=null;if(soltar)soltar(a)};
  svg.addEventListener('pointerup',fin);svg.addEventListener('pointercancel',fin);
  svg.addEventListener('keydown',e=>{const a=e.target.closest&&e.target.closest('[data-asa]');if(!a)return;
    const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!d)return;e.preventDefault();
    const paso=(e.shiftKey?5:1)*(US.p?Math.max(US.p.w,US.p.h)/200:2);if(seleccionar)seleccionar(a.dataset.asa);
    mover(a.dataset.asa,null,[d[0]*paso,d[1]*paso]);if(soltar)soltar(a.dataset.asa);
    requestAnimationFrame(()=>{const n=svg.querySelector(`[data-asa="${a.dataset.asa}"]`);if(n)n.focus()})});
}
// Botones para mover el punto elegido sin arrastrar (alternativa al gesto)
function padMover(cont,alMover,etiqueta){
  const d=html(`<div><p class="muted" id="pad-t" style="margin:0 0 6px">${etiqueta}</p><div class="mover" role="group" aria-labelledby="pad-t">
    <span></span><button data-d="0,-1" aria-label="Mover arriba">↑</button><span></span>
    <button data-d="-1,0" aria-label="Mover a la izquierda">←</button><button data-d="fino" aria-label="Pasos finos o grandes" aria-pressed="true">·</button><button data-d="1,0" aria-label="Mover a la derecha">→</button>
    <span></span><button data-d="0,1" aria-label="Mover abajo">↓</button><span></span></div></div>`);
  let fino=true;d.addEventListener('click',e=>{const b=e.target.closest('[data-d]');if(!b)return;
    if(b.dataset.d==='fino'){fino=!fino;b.setAttribute('aria-pressed',fino);b.textContent=fino?'·':'••';return}
    const [x,y]=b.dataset.d.split(',').map(Number),paso=(fino?1:6)*Math.max(US.p.w,US.p.h)/200;alMover([x*paso,y*paso])});
  cont.append(d);return d}
// Recorte de la foto (encuadre elegido) en un canvas de lado máximo «max»
function rectEncuadre(){const p=US.p;return p.enc.rect||[0,0,p.w,p.h]}
function canvasRecorte(max){const [x0,y0,x1,y1]=rectEncuadre(),w=x1-x0,h=y1-y0,k=Math.min(1,max/Math.max(w,h));
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));
  c.getContext('2d').drawImage(US.img,x0,y0,w,h,0,0,c.width,c.height);return c}
// Estilos de las tres familias de rectas: se distinguen por el trazo y la letra, no por el color
const TRAZO={A:'',B:'10 6',V:'2 5',C:'16 5 3 5',D:'24 8',E:'3 3 12 3'};
