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
window.VALORES={claridades,cortes,tonos,TONOS,NOMBRES,Lg};
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
    else url=imagen(w,h,i=>ton[T.t[i]]);
    svg.innerHTML='';el('image',{href:url,x:0,y:0,width:w,height:h,preserveAspectRatio:'none'},svg);
    svg.setAttribute('aria-label',ver?'Foto original':v.vista==='aguadas'?`Plan de aguadas, paso ${v.paso+1} de ${v.n}`:v.vista==='grises'?'Foto en grises':`Foto en ${v.n} tonos planos`)}
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
      <button data-vista="tonos" aria-pressed="${v.vista==='tonos'}">Tonos planos</button><button data-vista="aguadas" aria-pressed="${v.vista==='aguadas'}">Plan de aguadas</button><button data-vista="grises" aria-pressed="${v.vista==='grises'}">En grises</button></div>
      <div id="va-plan" ${v.vista==='aguadas'?'':'hidden'}></div></div>`);
    c2.addEventListener('click',e=>{const b=e.target.closest('[data-vista]');if(!b)return;v.vista=b.dataset.vista;guardar();pintarPanel();render()});
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
