/* ===== Etapa 6 · Comparar: tu apunte encima de la foto =====
   Versión en el móvil del «sight sizing» de Matthew Brehm (Drawing Perspective, «Perspective basics»):
   poner el dibujo junto al motivo, al mismo tamaño, para ver qué ángulos y proporciones se han ido. */
(function(){
ETAPAS.comparar={pintar(cont){
  const p=US.p;if(!p.cmp)p.cmp={x:0,y:0,s:1,r:0,op:.55,modo:'encima',encaje:true,tiene:false};const c=p.cmp;
  const {svg,barra,panel}=crearZona(cont);
  const [x0,y0,x1,y1]=rectEncuadre(),W=x1-x0,H=y1-y0;
  svg.setAttribute('viewBox',`${x0} ${y0} ${W} ${H}`);svg.setAttribute('aria-label','Foto encuadrada con tu apunte encima. Arrastra para mover el apunte.');
  let urlA=null,imgA=null,soloFoto=false,R=ENCAJE.calcular(p);
  async function cargarApunte(){const b=await ALMACEN.foto(p.id+'-apunte');if(!b){c.tiene=false;return}
    if(urlA)URL.revokeObjectURL(urlA);urlA=URL.createObjectURL(b);imgA=new Image();imgA.src=urlA;try{await imgA.decode()}catch(e){}c.tiene=true}
  // tamaño base: el apunte ocupa el ancho del encuadre
  const base=()=>imgA?Math.min(W/imgA.naturalWidth,H/imgA.naturalHeight):1;
  function dibujar(){const u=unidad(svg);svg.innerHTML='';
    el('image',{href:US.url,x:0,y:0,width:p.w,height:p.h,preserveAspectRatio:'none'},svg);
    if(imgA&&!soloFoto){const k=base()*c.s,w=imgA.naturalWidth*k,h=imgA.naturalHeight*k,cx=x0+W/2+c.x,cy=y0+H/2+c.y;
      const g=el('g',{transform:`translate(${cx} ${cy}) rotate(${c.r})`},svg);
      el('image',{href:urlA,x:-w/2,y:-h/2,width:w,height:h,preserveAspectRatio:'none',opacity:c.modo==='diferencia'?1:c.op,style:c.modo==='diferencia'?'mix-blend-mode:difference':''},g)}
    if(c.encaje&&R.h){const L=(a,b,dash,w)=>{el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#fff','stroke-width':w+2.5,opacity:.7,'vector-effect':'non-scaling-stroke'},svg);el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#141210','stroke-width':w,'stroke-dasharray':dash,'vector-effect':'non-scaling-stroke'},svg)};
      const d=GEOM.norm(GEOM.sub(R.h[1],R.h[0]));L(GEOM.add(R.h[0],GEOM.mul(d,-1e5)),GEOM.add(R.h[0],GEOM.mul(d,1e5)),'18 6',2.5);
      for(const f of ENCAJE.todas(p.pers))if(R[f])for(const ln of p.pers.lineas[f]||[]){const lejos=GEOM.dist(ln[0],R[f])>GEOM.dist(ln[1],R[f])?ln[0]:ln[1];L(lejos,R[f],TRAZO[f]||'',1.6)}}
    if(!imgA){const t=el('text',{x:x0+W/2,y:y0+H/2,'text-anchor':'middle','font-size':18*u,'font-weight':700,fill:'#fff',stroke:'#141210','stroke-width':4*u,'paint-order':'stroke','font-family':'Inter,system-ui,sans-serif'},svg);t.textContent='Haz una foto de tu apunte'}}
  // mover el apunte arrastrando
  let ini=null;
  svg.addEventListener('pointerdown',e=>{if(!imgA)return;e.preventDefault();const q=puntoSVG(svg,e);ini={q,x:c.x,y:c.y,id:e.pointerId};try{svg.setPointerCapture(e.pointerId)}catch(_){}});
  svg.addEventListener('pointermove',e=>{if(!ini||e.pointerId!==ini.id)return;const q=puntoSVG(svg,e);c.x=ini.x+q.x-ini.q.x;c.y=ini.y+q.y-ini.q.y;dibujar()});
  const fin=()=>{if(ini){ini=null;guardar()}};svg.addEventListener('pointerup',fin);svg.addEventListener('pointercancel',fin);
  // barra: ver solo la foto mientras se mantiene pulsado
  barra.append(html(`<button id="cm-foto" aria-pressed="false">👁 Ver solo la foto</button>`),html(`<span class="muted" style="align-self:center">Mantén pulsado para comparar</span>`));
  const bf=$('#cm-foto');bf.addEventListener('pointerdown',()=>{soloFoto=true;dibujar()});
  const suelta=()=>{if(bf.getAttribute('aria-pressed')!=='true'){soloFoto=false;dibujar()}};bf.addEventListener('pointerup',suelta);bf.addEventListener('pointerleave',suelta);
  bf.addEventListener('click',e=>{if(e.detail===0){const on=bf.getAttribute('aria-pressed')!=='true';bf.setAttribute('aria-pressed',on);soloFoto=on;dibujar()}});
  bf.addEventListener('contextmenu',e=>e.preventDefault());
  // elegir la foto del apunte
  const entrada=html('<input type="file" accept="image/*" capture="environment" hidden>'),galeria=html('<input type="file" accept="image/*" hidden>');cont.append(entrada,galeria);
  async function recibir(f){if(!f)return;try{const u=URL.createObjectURL(f),im=new Image();im.src=u;await im.decode();
      const k=Math.min(1,1600/Math.max(im.naturalWidth,im.naturalHeight)),cv=document.createElement('canvas');cv.width=Math.round(im.naturalWidth*k);cv.height=Math.round(im.naturalHeight*k);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);URL.revokeObjectURL(u);
      const b=await new Promise(ok=>cv.toBlob(ok,'image/jpeg',0.88));await ALMACEN.guardarFoto(p.id+'-apunte',b);Object.assign(c,{x:0,y:0,s:1,r:0});await cargarApunte();guardar();pintarPanel();dibujar();anunciar('Apunte colocado encima de la foto. Muévelo y ajusta el tamaño y el giro hasta que coincidan.')}
    catch(e){anunciar('No se ha podido abrir esa foto.')}}
  entrada.onchange=e=>{recibir(e.target.files[0]);e.target.value=''};galeria.onchange=e=>{recibir(e.target.files[0]);e.target.value=''};
  function pintarPanel(){panel.innerHTML='';
    const c1=html(`<div class="caja"><h2 class="ch">Tu apunte</h2><p>Haz una foto de tu dibujo, de frente y con buena luz. La app lo pone encima de la foto para que veas qué ángulos y proporciones se han ido.</p>
      <div class="ops"><button class="prim" id="cm-camara">📷 Hacer foto del apunte</button><button id="cm-galeria">🖼 Elegir de la galería</button></div>${c.tiene?'<div class="ops" style="margin-top:8px"><button id="cm-quitar">🗑 Quitar el apunte</button></div>':''}</div>`);
    c1.querySelector('#cm-camara').onclick=()=>entrada.click();c1.querySelector('#cm-galeria').onclick=()=>galeria.click();
    const q=c1.querySelector('#cm-quitar');if(q)q.onclick=async()=>{if(q.dataset.ok!=='1'){q.dataset.ok='1';q.lastChild.nodeValue=' Toca otra vez para quitarlo';return}
      await ALMACEN.borrarFoto(p.id+'-apunte');imgA=null;c.tiene=false;guardar();pintarPanel();dibujar();anunciar('Apunte quitado.')};
    panel.append(c1);
    if(c.tiene){const c2=html(`<div class="caja"><h2 class="ch">Ajustar</h2>
      <div class="ops" role="group" aria-label="Cómo se ven juntos"><button data-modo="encima" aria-pressed="${c.modo==='encima'}">Transparente</button><button data-modo="diferencia" aria-pressed="${c.modo==='diferencia'}">Diferencia</button></div>
      <p class="muted" style="margin-top:6px">${c.modo==='diferencia'?'Donde el apunte y la foto coinciden se oscurece; lo que no coincide se ve claro.':'Mueve la transparencia para ver más el apunte o más la foto.'}</p>
      ${c.modo==='encima'?`<div class="fila"><label for="cm-op">Transparencia del apunte</label></div><input type="range" id="cm-op" min="0.1" max="0.95" step="0.05" value="${c.op}">`:''}
      <div class="fila"><label for="cm-s">Tamaño</label></div><input type="range" id="cm-s" min="0.3" max="3" step="0.01" value="${c.s}">
      <div class="fila"><label for="cm-r">Giro</label></div><input type="range" id="cm-r" min="-25" max="25" step="0.5" value="${c.r}">
      <div class="ops"><button data-ver="1" aria-pressed="${!!c.encaje}">Ver el horizonte y las fugas</button><button id="cm-cero">↺ Volver al principio</button></div></div>`);
      c2.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.modo){c.modo=b.dataset.modo;guardar();pintarPanel();dibujar()}
        if(b.dataset.ver){c.encaje=!c.encaje;b.setAttribute('aria-pressed',c.encaje);guardar();dibujar()}if(b.id==='cm-cero'){Object.assign(c,{x:0,y:0,s:1,r:0});guardar();pintarPanel();dibujar()}});
      const rg=(id,k)=>{const i=c2.querySelector(id);if(i)i.oninput=()=>{c[k]=+i.value;dibujar()};if(i)i.onchange=()=>guardar()};rg('#cm-op','op');rg('#cm-s','s');rg('#cm-r','r');
      panel.append(c2);const pad=html('<div class="caja"></div>');padMover(pad,d=>{c.x+=d[0];c.y+=d[1];guardar();dibujar()},'Mover el apunte:');panel.append(pad)}
    panel.append(html(`<p class="nota"><b>Truco de Brehm:</b> en la calle, levanta el cuaderno junto al motivo y acércalo o aléjalo hasta que tu dibujo y lo que ves tengan el mismo tamaño. Así se ven enseguida los ángulos y las alturas que no cuadran. Aquí es lo mismo, pero con la foto. No hace falta que coincida todo: un apunte no es una foto.</p>`));
    panel.append(botonSiguiente('comparar'))}
  cargarApunte().then(()=>{pintarPanel();dibujar()});
  const ro=new ResizeObserver(()=>dibujar());ro.observe(svg);limpiar=()=>{ro.disconnect();if(urlA)URL.revokeObjectURL(urlA)};
}};
})();
