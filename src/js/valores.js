/* ===== Etapa 3 · Valores: la foto en 2 a 5 tonos planos y el plan de aguadas =====
   Valores y perspectiva atmosférica: Phil Metzger (The Art of Perspective, parte 1, cap. 1 y 4).
   Glaseado capa a capa, de claro a oscuro: Felix Scheinberger (Acuarela para urban sketchers). */
(function(){
const TONOS={2:[96,26],3:[96,64,26],4:[96,74,50,22],5:[96,80,60,40,18]};
const NOMBRES={2:['Claro (papel)','Oscuro'],3:['Claro','Medio','Oscuro'],4:['Blanco del papel','Claro','Medio','Oscuro'],5:['Blanco del papel','Muy claro','Medio','Oscuro','Muy oscuro']};
const Lg=L=>{const v=COLOR.labRgb([L,0,0])[0];return Math.round(v)};
// Claridad (L*) de cada píxel del recorte, con desenfoque (como entrecerrar los ojos)
function claridades(max,borroso){
  const key='L'+rectEncuadre().join(',')+':'+max+':'+borroso;if(US.cache[key])return US.cache[key];
  const c=canvasRecorte(max),w=c.width,h=c.height,d=c.getContext('2d').getImageData(0,0,w,h).data;
  const LIN=new Float32Array(256);for(let i=0;i<256;i++)LIN[i]=COLOR.lin(i);
  let L=new Float32Array(w*h);for(let i=0,j=0;i<L.length;i++,j+=4){const Y=0.2126*LIN[d[j]]+0.7152*LIN[d[j+1]]+0.0722*LIN[d[j+2]];L[i]=Y>0.008856?116*Math.cbrt(Y)-16:903.3*Y}
  const r=Math.round(borroso*Math.max(w,h)/320);
  if(r>0){const t=new Float32Array(w*h);for(let pase=0;pase<2;pase++){
    for(let y=0;y<h;y++){let s=0,n=0;const o=y*w;for(let x=-r;x<w;x++){if(x+r<w){s+=L[o+x+r];n++}if(x-r-1>=0){s-=L[o+x-r-1];n--}if(x>=0)t[o+x]=s/n}}
    for(let x=0;x<w;x++){let s=0,n=0;for(let y=-r;y<h;y++){if(y+r<h){s+=t[(y+r)*w+x];n++}if(y-r-1>=0){s-=t[(y-r-1)*w+x];n--}if(y>=0)L[y*w+x]=s/n}}}}
  const out={L,w,h,canvas:c};US.cache={...US.cache,[key]:out};return out}
// Umbrales automáticos (k-medias de las claridades) o los elegidos a mano
function cortes(v,L){if(v.umb&&v.umb.length===v.n-1)return v.umb;const m=[];for(let i=0;i<L.length;i+=7)m.push(L[i]);return COLOR.umbrales(m,v.n).map(x=>Math.round(x))}
// Índice de tono de cada píxel: 0 = el más claro
function tonos(L,u){const n=u.length+1,t=new Uint8Array(L.length),cuenta=new Array(n).fill(0);
  for(let i=0;i<L.length;i++){let k=0;while(k<u.length&&L[i]<u[u.length-1-k])k++;t[i]=k;cuenta[k]++}
  return {t,cuenta:cuenta.map(c=>c/L.length)}}
function imagen(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),id=x.createImageData(w,h),d=id.data;
  for(let i=0,j=0;i<w*h;i++,j+=4){const g=fn(i);d[j]=d[j+1]=d[j+2]=g;d[j+3]=255}x.putImageData(id,0,0);return c.toDataURL('image/png')}
/* Mapa de bordes: el cambio de claridad (Sobel) sobre la foto ya desenfocada, adelgazado a una línea
   y con umbral según el detalle pedido. Sirve para decidir qué contornos merecen trazo de tinta. */
function bordes(D,detalle){const {L,w,h}=D,N=w*h,mag=new Float32Array(N),dir=new Uint8Array(N);
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;
    const gx=(L[i-w+1]+2*L[i+1]+L[i+w+1])-(L[i-w-1]+2*L[i-1]+L[i+w-1]),gy=(L[i+w-1]+2*L[i+w]+L[i+w+1])-(L[i-w-1]+2*L[i-w]+L[i-w+1]);
    mag[i]=Math.hypot(gx,gy);const a=(Math.atan2(gy,gx)*180/Math.PI+180)%180;dir[i]=a<22.5||a>=157.5?0:a<67.5?1:a<112.5?2:3}
  const OFF=[[1,0],[1,1],[0,1],[-1,1]],fino=new Float32Array(N),vals=[];
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x,m=mag[i];if(m<1)continue;const [dx,dy]=OFF[dir[i]],o=dy*w+dx;
    if(m>=mag[i+o]&&m>=mag[i-o]){fino[i]=m;vals.push(m)}}
  vals.sort((a,b)=>b-a);const keep=Math.min(vals.length-1,Math.round(N*(0.004+0.0035*detalle)));const T=vals.length?vals[Math.max(0,keep)]:1e9;
  const e=new Uint8Array(N),pila=[];for(let i=0;i<N;i++)if(fino[i]>=T){e[i]=1;pila.push(i)}
  while(pila.length){const i=pila.pop();for(const o of [1,-1,w,-w,w+1,w-1,-w+1,-w-1]){const j=i+o;if(j>0&&j<N&&!e[j]&&fino[j]>=T*0.45){e[j]=1;pila.push(j)}}}// se siguen las líneas débiles pegadas a una fuerte
  return e}
const hash=(a,b)=>{let h=Math.imul(a,374761393)+Math.imul(b,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296};
/* Trama: cada tono, una trama de tinta. El blanco del papel, sin nada; cuanto más oscuro, más líneas
   (paralelas más juntas y gruesas, cruzadas en más direcciones, o más puntos). Sarah Haley, «Shading». */
function trama(t,w,h,n,tipo){const S=Math.max(8,Math.round(Math.max(w,h)/58)),TI=25;
  const linea=(u,esp,g)=>((u%esp)+esp)%esp<g;
  return i=>{const k=t[i];if(!k)return 255;const d=k/(n-1),x=i%w,y=(i/w)|0;
    if(tipo==='puntos'){const c=Math.max(4,Math.round(S*0.62)),cx=Math.floor(x/c),cy=Math.floor(y/c);if(hash(cx,cy)>0.08+0.87*Math.pow(d,1.2))return 255;
      const ox=(hash(cx,cy+7919)*0.5+0.25)*c,oy=(hash(cx+104729,cy)*0.5+0.25)*c,dx=x-cx*c-ox,dy=y-cy*c-oy,r=Math.max(1.6,c*0.27);return dx*dx+dy*dy<=r*r?TI:255}
    if(tipo==='cruzada'){const dirs=Math.max(1,Math.round(d*Math.min(4,n-1))),g=Math.max(1.3,S*0.13),e=S*0.95;
      if(linea(x+y,e,g)||(dirs>1&&linea(x-y,e,g))||(dirs>2&&linea(y,e*0.75,g*0.8))||(dirs>3&&linea(x,e*0.75,g*0.8)))return TI;return 255}
    const e=S*(1.55-0.85*d),g=Math.max(1.3,S*(0.1+0.3*d));return linea(x+y,e,g)?TI:255}}
window.VALORES={claridades,cortes,tonos,bordes,trama,TONOS,NOMBRES,Lg};
ETAPAS.valores={pintar(cont){
  const p=US.p,v=p.val;
  const {svg,barra,panel}=crearZona(cont);
  let ver=false;
  function calcular(){const D=claridades(900,v.borroso),u=cortes(v,D.L),T=tonos(D.L,u);return {D,u,T}}
  let C=calcular();
  function render(){const {D,u,T}=C,w=D.w,h=D.h,ton=TONOS[v.n].map(Lg);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);let url;
    if(ver){url=US.cache['foto'+rectEncuadre()]||(US.cache['foto'+rectEncuadre()]=D.canvas.toDataURL('image/jpeg',0.9))}
    else if(v.vista==='grises')url=imagen(w,h,i=>Lg(D.L[i]));
    else if(v.vista==='aguadas'){const k=v.paso,t=T.t;
      if(k===0)url=imagen(w,h,i=>t[i]===0?255:205);
      else url=imagen(w,h,i=>{const a=Math.min(t[i],k),g=ton[a];// borde de la capa nueva, para verla sin depender del tono
        if(t[i]>=k){const x=i%w,y=(i/w)|0;if((x>0&&t[i-1]<k)||(x<w-1&&t[i+1]<k)||(y>0&&t[i-w]<k)||(y<h-1&&t[i+w]<k))return 0}return g})}
    else if(v.vista==='bordes'){const k='bo'+rectEncuadre()+v.borroso+':'+(v.detalle||5);url=US.cache[k];
      if(!url){const e=bordes(D,v.detalle||5);url=US.cache[k]=imagen(w,h,i=>e[i]||(i%w&&e[i-1])||(i>=w&&e[i-w])?30:255)}}
    else if(v.vista==='trama'){const k='tr'+rectEncuadre()+v.borroso+':'+v.n+':'+u.join(',')+':'+(v.trama||'paralela');url=US.cache[k];
      if(!url)url=US.cache[k]=imagen(w,h,trama(T.t,w,h,v.n,v.trama||'paralela'))}
    else url=imagen(w,h,i=>ton[T.t[i]]);
    svg.innerHTML='';el('image',{href:url,x:0,y:0,width:w,height:h,preserveAspectRatio:'none'},svg);
    svg.setAttribute('aria-label',ver?'Foto original':v.vista==='aguadas'?`Plan de aguadas, paso ${v.paso+1} de ${v.n}`:v.vista==='grises'?'Foto en grises':v.vista==='bordes'?'Mapa de bordes: los contornos principales de la foto, como un dibujo a tinta':v.vista==='trama'?`La foto en ${v.n} tonos hechos con trama ${{paralela:'de líneas paralelas',cruzada:'cruzada',puntos:'de puntos'}[v.trama||'paralela']}`:`Foto en ${v.n} tonos planos`)}
  barra.append(html(`<button id="va-ver" aria-pressed="false">👁 Ver la foto</button>`));
  const bv=$('#va-ver');let sostener=false;
  bv.addEventListener('pointerdown',()=>{sostener=true;ver=true;render()});
  const soltar=()=>{if(!sostener)return;sostener=false;setTimeout(()=>{if(bv.getAttribute('aria-pressed')!=='true'){ver=false;render()}},0)};
  bv.addEventListener('pointerup',soltar);bv.addEventListener('pointerleave',soltar);
  bv.addEventListener('click',e=>{if(e.detail===0){const on=bv.getAttribute('aria-pressed')!=='true';bv.setAttribute('aria-pressed',on);ver=on;render()}});// teclado: alterna
  bv.addEventListener('contextmenu',e=>e.preventDefault());
  barra.append(html(`<span class="muted" style="align-self:center">Mantén pulsado para comparar</span>`));
  function pintarPanel(){panel.innerHTML='';const {u,T}=C,ton=TONOS[v.n];
    const c1=html(`<div class="caja"><h2 class="ch">Tonos</h2><div class="ops" role="group" aria-label="Número de tonos">${[2,3,4,5].map(n=>`<button data-n="${n}" aria-pressed="${v.n===n}">${n===2?'2 · Notan':n}</button>`).join('')}</div>
      <div class="tonos" aria-hidden="true">${ton.map((L,i)=>`<div class="tono" style="background:rgb(${Lg(L)},${Lg(L)},${Lg(L)});color:${L>55?'#111':'#fff'}">${NOMBRES[v.n][i]}<br><b>${pct(T.cuenta[i])}</b></div>`).join('')}</div>
      <p class="sr">${ton.map((L,i)=>NOMBRES[v.n][i]+': '+pct(T.cuenta[i])+' de la imagen').join('; ')}</p>
      <div class="fila"><label for="va-bor">Entrecerrar los ojos (menos detalle)</label><input type="range" id="va-bor" min="0" max="8" step="1" value="${v.borroso}"></div></div>`);
    c1.addEventListener('click',e=>{const b=e.target.closest('[data-n]');if(!b)return;v.n=+b.dataset.n;v.umb=null;v.paso=0;guardar();C=calcular();pintarPanel();render();anunciar(v.n+' tonos')});
    c1.querySelector('#va-bor').onchange=e=>{v.borroso=+e.target.value;guardar();C=calcular();pintarPanel();render()};
    const c2=html(`<div class="caja"><h2 class="ch">Ver</h2><div class="ops" role="group" aria-label="Vista">
      <button data-vista="tonos" aria-pressed="${v.vista==='tonos'}">Tonos planos</button><button data-vista="aguadas" aria-pressed="${v.vista==='aguadas'}">Plan de aguadas</button><button data-vista="grises" aria-pressed="${v.vista==='grises'}">En grises</button><button data-vista="bordes" aria-pressed="${v.vista==='bordes'}">Bordes (tinta)</button><button data-vista="trama" aria-pressed="${v.vista==='trama'}">Trama</button></div>
      <div id="va-plan" ${v.vista==='aguadas'?'':'hidden'}></div><div id="va-extra"></div></div>`);
    c2.addEventListener('click',e=>{const b=e.target.closest('[data-vista]');if(!b)return;v.vista=b.dataset.vista;guardar();pintarPanel();render()});
    const ex=c2.querySelector('#va-extra');
    if(v.vista==='bordes'){ex.append(html(`<div><div class="fila" style="margin-top:6px"><label for="va-det">Cuántas líneas</label><input type="range" id="va-det" min="1" max="10" step="1" value="${v.detalle||5}" aria-valuetext="${['muy pocas','muy pocas','pocas','pocas','normal','normal','bastantes','bastantes','muchas','muchas'][(v.detalle||5)-1]}"></div>
      <p class="muted">Son los contornos donde la claridad cambia de golpe: los que merecen una línea de tinta. Lo demás se resuelve con mancha. Sube «Entrecerrar los ojos» para quedarte solo con los grandes.</p></div>`));
      ex.querySelector('#va-det').onchange=e=>{v.detalle=+e.target.value;guardar();pintarPanel();render()}}
    if(v.vista==='trama'){ex.append(html(`<div><div class="ops" role="group" aria-label="Tipo de trama" style="margin-top:8px"><button data-trama="paralela" aria-pressed="${(v.trama||'paralela')==='paralela'}">Paralela</button><button data-trama="cruzada" aria-pressed="${v.trama==='cruzada'}">Cruzada</button><button data-trama="puntos" aria-pressed="${v.trama==='puntos'}">Puntos</button></div>
      <p class="muted" style="margin-top:6px">Cada tono, una trama: el más claro, papel sin nada; el más oscuro, la trama más densa. Para un apunte solo a tinta. Cambia el número de tonos arriba.</p></div>`));
      ex.addEventListener('click',e=>{const b=e.target.closest('[data-trama]');if(!b)return;v.trama=b.dataset.trama;guardar();pintarPanel();render();anunciar('Trama '+b.textContent.toLowerCase())})}
    if(v.vista==='aguadas'){const pl=c2.querySelector('#va-plan'),n=v.n,acum=k=>T.cuenta.slice(k).reduce((a,b)=>a+b,0);
      const pasos=[`Reserva los blancos del papel (${pct(T.cuenta[0])}): ahí no pintes.`];
      for(let k=1;k<n;k++)pasos.push(k===1?`Primera aguada, la más clara: todo menos los blancos (${pct(acum(1))}). Deja secar.`:k===n-1?`Los oscuros, al final: solo donde más oscuro (${pct(acum(k))}).`:`Aguada ${k===2?'media':'más oscura'}, encima de la anterior y ya seca (${pct(acum(k))}).`);
      pl.innerHTML=`<ol class="capas">${pasos.map((t,i)=>`<li class="${i===v.paso?'actual':''}">${i===v.paso?'<span class="sr">Paso actual: </span>':''}${t}</li>`).join('')}</ol>
        <div class="ops"><button id="va-ant" ${v.paso===0?'disabled':''}>‹ Anterior</button><button id="va-sig" class="prim">${v.paso<n-1?'Siguiente capa ›':'Volver al principio'}</button></div>
        <p class="muted" style="margin-top:6px">${v.paso>0?'La raya negra marca el borde de la capa nueva.':'En gris claro, todo lo que vas a pintar.'}</p>`;
      pl.querySelector('#va-ant').onclick=()=>{v.paso=Math.max(0,v.paso-1);guardar();pintarPanel();render();anunciar('Paso '+(v.paso+1)+': '+pasos[v.paso])};
      pl.querySelector('#va-sig').onclick=()=>{v.paso=v.paso<n-1?v.paso+1:0;guardar();pintarPanel();render();anunciar('Paso '+(v.paso+1)+': '+pasos[v.paso])}}
    const c3=html(`<div class="caja"><h2 class="ch">Cortes entre tonos</h2><div id="va-cortes"></div><div class="ops"><button id="va-auto" ${v.umb?'':'disabled'}>Automático</button></div>
      <p class="muted" style="margin-top:6px">${v.umb?'Cortes elegidos a mano.':'Cortes automáticos: la app busca las manchas que más se parecen en claridad.'}</p></div>`);
    u.slice().reverse().forEach((x,i)=>{const r=html(`<div class="fila"><label for="va-u${i}">Entre ${NOMBRES[v.n][i].toLowerCase()} y ${NOMBRES[v.n][i+1].toLowerCase()}</label><input type="range" id="va-u${i}" min="2" max="98" step="1" value="${x}"></div>`);
      r.querySelector('input').onchange=e=>{const nu=u.slice().reverse();nu[i]=+e.target.value;v.umb=nu.slice().reverse().sort((a,b)=>a-b);guardar();C=calcular();pintarPanel();render()};c3.querySelector('#va-cortes').append(r)});
    c3.querySelector('#va-auto').onclick=()=>{v.umb=null;guardar();C=calcular();pintarPanel();render()};
    panel.append(c1,c2,c3);
    panel.append(html(`<p class="nota">Con tres tonos (claro, medio y oscuro) se planifica casi cualquier acuarela urbana. En la acuarela se pinta de claro a oscuro: cada capa, encima de la anterior ya seca. Y recuerda: lo lejano se ve más claro y con menos contraste (perspectiva atmosférica).</p>`));
    panel.append(botonSiguiente('valores'))}
  pintarPanel();render();
}};
})();
