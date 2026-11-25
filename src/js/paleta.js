/* ===== Etapa 4 · Color: los colores principales de la foto y con qué pinturas de tu carta salen =====
   Cartas de Van Gogh, Daniel Smith y Cotman (las mismas que Mosaicos). Las mezclas son aproximadas. */
(function(){
const nombreP=c=>c.nombre+(c.num?' ('+c.num+')':'');
function pinturas(){const carta=CARTAS[PREF.marca]||CARTAS.vg,caja=(PREF.caja||{})[PREF.marca];
  // Sin blancos ni negros: el blanco es el papel y el negro se mezcla mejor (Scheinberger, «Cajas de pinturas»)
  let l=carta.colores.map((c,i)=>({i,num:c[0],nombre:c[1],en:c[2],hex:c[3]})).filter(c=>!/blanco|white|negro|black/i.test(c.nombre+' '+c.en));
  if(caja&&caja.length>=2){const s=new Set(caja);const f=l.filter(c=>s.has(c.i));if(f.length>=2)l=f}
  l.forEach(c=>c.extra=/lavanda|lavender|buff|nápoles|naples|crepúsculo|twilight|neutr|davy|payne|gris|gr[ae]y|opac|opaque|interference|iridescent|duochrome/i.test(c.nombre+' '+c.en));
  return l}
function parecido(de){return de<2?'casi igual':de<4.5?'muy parecido':de<8?'parecido':'aproximado'}
function textoMezcla(o,P){const n=o.ids.map(i=>nombreP(P[i]));
  return (n.length===1?n[0]:n[0]+' + '+n[1]+' · '+o.props[0]+' : '+o.props[1])+' · '+COLOR.textoCarga(o.carga)}
ETAPAS.color={pintar(cont){
  const p=US.p,c=p.col;
  const {svg,barra,panel}=crearZona(cont);
  const marcaKey=()=>PREF.marca+':'+(((PREF.caja||{})[PREF.marca])||[]).join('.');
  function muestras(){const key='lab'+rectEncuadre();if(US.cache[key])return US.cache[key];
    const cv=canvasRecorte(160),d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data,pts=[];
    for(let j=0;j<d.length;j+=4)pts.push(COLOR.rgbLab([d[j],d[j+1],d[j+2]]));return US.cache[key]=pts}
  function grupos(){const key='km'+rectEncuadre()+':'+c.k;if(US.cache[key])return US.cache[key];
    const g=COLOR.kmedias(muestras(),c.k).sort((a,b)=>b.peso-a.peso);return US.cache[key]=g}
  let G=grupos();if(c.sel>=G.length)c.sel=0;
  // Imagen con el color elegido resaltado (lo demás, desvaído)
  function render(){const cv=canvasRecorte(700),w=cv.width,h=cv.height;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.innerHTML='';
    let url;if(c.sel<0)url=cv.toDataURL('image/jpeg',0.9);else{const key='res'+rectEncuadre()+c.k+':'+c.sel;
      url=US.cache[key];if(!url){const x=cv.getContext('2d'),id=x.getImageData(0,0,w,h),d=id.data,C=G.map(g=>g.lab);
        for(let j=0;j<d.length;j+=4){const L=COLOR.rgbLab([d[j],d[j+1],d[j+2]]);let mj=0,mv=1e9;for(let k=0;k<C.length;k++){const v=(L[0]-C[k][0])**2+(L[1]-C[k][1])**2+(L[2]-C[k][2])**2;if(v<mv){mv=v;mj=k}}
          if(mj!==c.sel){const g=0.3*d[j]+0.59*d[j+1]+0.11*d[j+2];d[j]=d[j+1]=d[j+2]=235+g*0.08}}
        x.putImageData(id,0,0);url=US.cache[key]=cv.toDataURL('image/jpeg',0.9)}}
    el('image',{href:url,x:0,y:0,width:w,height:h,preserveAspectRatio:'none'},svg);
    svg.setAttribute('aria-label',c.sel<0?'Foto encuadrada':`Foto con el color ${c.sel+1} resaltado y el resto en blanco`)}
  barra.append(html(`<button id="co-todo" aria-pressed="${c.sel<0}">🖼 Ver toda la foto</button>`));
  $('#co-todo').onclick=()=>{c.sel=c.sel<0?0:-1;guardar();render();pintarPanel()};
  let trabajo=0,trioT=0;
  function mezclas(cb){const key='mz'+rectEncuadre()+c.k+':'+marcaKey();if(US.cache[key]&&US.cache[key].length===G.length){cb(US.cache[key],true);return}
    const P=pinturas(),res=[],yo=++trabajo;
    const paso=i=>{if(yo!==trabajo)return;if(i>=G.length){US.cache[key]=res;cb(res,true);return}
      res.push(COLOR.buscarMezcla(G[i].lab,P,2).map(o=>Object.assign(o,{texto:textoMezcla(o,P),pigs:o.ids.map(k=>P[k])})));cb(res,false);setTimeout(()=>paso(i+1),20)};
    setTimeout(()=>paso(0),30)}
  function pintarPanel(){panel.innerHTML='';const carta=CARTAS[PREF.marca]||CARTAS.vg,caja=((PREF.caja||{})[PREF.marca])||[];
    const c1=html(`<div class="caja"><h2 class="ch">Colores de la foto</h2><div class="ops" role="group" aria-label="Cuántos colores">${[3,4,5,6].map(n=>`<button data-k="${n}" aria-pressed="${c.k===n}">${n}</button>`).join('')}</div>
      <p class="muted" style="margin-top:8px">Pinturas: <b>${carta.nombre}</b>${caja.length>=2?`, solo las ${caja.length} de tu caja`:', toda la carta'}. <button id="co-caja" style="min-height:44px;margin-top:4px">🎨 Cambiar</button></p></div>`);
    c1.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(b){c.k=+b.dataset.k;c.sel=0;guardar();G=grupos();render();pintarPanel();anunciar(c.k+' colores')}});
    c1.querySelector('#co-caja').onclick=()=>abrirAjustesPintura();
    const lista=html(`<div class="colores" aria-live="polite"></div>`);
    G.forEach((g,i)=>{const hex=COLOR.labHex(g.lab);lista.append(html(`<button class="color ${c.sel===i?'sel':''}" data-sel="${i}" aria-pressed="${c.sel===i}">
      <span class="muestra" style="background:${hex}" aria-hidden="true"></span><span><b>Color ${i+1} · ${pct(g.peso)} de la foto</b><br><span>${COLOR.nombre(g.lab)}</span><br><span class="muted">Valor: ${COLOR.valor(g.lab)} · ${COLOR.temperatura(g.lab)}</span>
      <span class="mz" data-mz="${i}"><span class="mezcla muted">Buscando la mezcla…</span></span></span></button>`))});
    lista.addEventListener('click',e=>{const b=e.target.closest('[data-sel]');if(!b)return;c.sel=+b.dataset.sel;guardar();render();
      lista.querySelectorAll('[data-sel]').forEach(x=>{const on=+x.dataset.sel===c.sel;x.classList.toggle('sel',on);x.setAttribute('aria-pressed',on)});$('#co-todo').setAttribute('aria-pressed','false');anunciar('Color '+(c.sel+1)+' resaltado en la foto')});
    const c3=html(`<div class="caja"><h2 class="ch">Tabla de mezclas</h2><div id="co-tabla"><p class="muted">Se prepara cuando estén las mezclas…</p></div><div class="ops" style="margin-top:10px"><button id="co-hoja">🖨 Hoja de pruebas para pintar (PDF)</button></div><p class="muted" id="co-hoja-msg" role="status" aria-live="polite"></p></div>`);
    c3.querySelector('#co-hoja').onclick=()=>HOJA.descargar(t=>{const m=$('#co-hoja-msg');if(m)m.textContent=t});
    const c4=html(`<div class="caja"><h2 class="ch">Paleta limitada: 3 pinturas</h2><p class="muted">Las tres pinturas ${caja.length>=2?'de tu caja':'de la carta'} con las que mejor salen todos estos colores, cada uno con una sola o mezclando dos de ellas. Pesa poco y da armonía al apunte.</p>
      <div id="co-trio"></div><div class="ops"><button class="prim" id="co-trio-b">🎨 Buscar mis 3 pinturas</button></div><p class="muted" id="co-trio-msg" role="status" aria-live="polite" style="margin-top:6px"></p></div>`);
    c4.querySelector('#co-trio-b').onclick=()=>buscarTrio();
    panel.append(c1,lista,c4,c3);
    const tk=trioKey();if(US.cache[tk])pintarTrio(US.cache[tk]);
    if(carta.rotulador)panel.append(html(`<p class="nota"><b>Con rotuladores:</b> las mezclas se hacen superponiendo capas o juntándolas con el pincel de agua; la proporción dice cuánto de cada uno. Según Faber-Castell, el orden importa: amarillo sobre azul no da lo mismo que azul sobre amarillo. Para oscurecer, mejor el complementario que el negro.</p>`));
    panel.append(html(`<p class="nota">Los colores en pantalla y las mezclas son aproximados: dependen de la pantalla, del papel y de cada pintura (algunas granulan o se aclaran al secar). Prueba siempre en un trozo de papel aparte.</p>`));
    panel.append(botonSiguiente('color'));
    mezclas((res,fin)=>{res.forEach((ops,i)=>{const z=lista.querySelector(`[data-mz="${i}"]`);if(!z||z.dataset.ok)return;z.dataset.ok=1;
        z.innerHTML=ops.map((o,j)=>`<span class="mezcla"><span class="m" style="background:${o.hex}" aria-hidden="true"></span><span>${j?'O bien: ':''}${esc(o.texto)} <span class="muted">(${parecido(o.de)})</span></span></span>`).join('')});
      if(fin)tabla(res)})}
  const trioKey=()=>'trio'+rectEncuadre()+c.k+':'+marcaKey();
  const trioPinturas=()=>{const P=pinturas(),f=P.filter(x=>!x.extra);return f.length>=3?f:P};
  function buscarTrio(){const P=trioPinturas(),msg=$('#co-trio-msg'),b=$('#co-trio-b');
    if(P.length<3){msg.textContent='Hacen falta al menos 3 pinturas: marca más en «Mi caja».';return}
    const yo=++trioT,gen=COLOR.paletaLimitada(G.map(g=>g.lab),G.map(g=>g.peso),P);b.disabled=true;msg.textContent='Buscando entre '+P.length+' pinturas…';
    const paso=()=>{if(yo!==trioT)return;const t0=performance.now();let r;
      do{r=gen.next()}while(!r.done&&performance.now()-t0<35);
      if(!r.done){const m=$('#co-trio-msg');if(m)m.textContent='Buscando entre '+P.length+' pinturas… '+Math.round(r.value.p*100)+' %';setTimeout(paso,0);return}
      const res=r.value.map(o=>({ps:o.ids.map(i=>P[i]),media:o.media,peor:o.peor}));
      res.forEach(o=>{o.mz=G.map(g=>COLOR.buscarMezcla(g.lab,o.ps,1)[0])});
      US.cache[trioKey()]=res;const bb=$('#co-trio-b');if(bb)bb.disabled=false;pintarTrio(res);anunciar('Paleta limitada: '+res[0].ps.map(nombreP).join(', '))};
    setTimeout(paso,30)}
  function pintarTrio(res){const z=$('#co-trio');if(!z)return;const o=res[0],m=$('#co-trio-msg'),b=$('#co-trio-b');if(m)m.textContent='';if(b){b.textContent='Buscar otra vez';b.classList.remove('prim')}
    z.innerHTML=`<div class="colores" style="margin:6px 0 8px">${o.ps.map(p=>`<div class="mezcla"><span class="m" style="background:${p.hex};width:40px;height:40px" aria-hidden="true"></span><span><b>${esc(nombreP(p))}</b></span></div>`).join('')}</div>
      <p>Con estas tres: <b>${parecido(o.media)}</b> de media${o.peor>8?`; el que peor sale, ${parecido(o.peor)}`:''}.</p>
      <ol class="capas">${o.mz.map((x,i)=>`<li><span class="mezcla" style="margin:0"><span class="m" style="background:${x.hex}" aria-hidden="true"></span><span>Color ${i+1}: ${esc(textoMezcla(x,o.ps))} <span class="muted">(${parecido(x.de)})</span></span></span></li>`).join('')}</ol>
      ${res.length>1?`<p class="muted" style="margin-top:8px">Otras opciones: ${res.slice(1).map(r=>r.ps.map(p=>esc(p.nombre)).join(' + ')+' ('+parecido(r.media)+')').join('; ')}.</p>`:''}
      <p class="muted" style="margin-top:6px">Felix Scheinberger recuerda que con tres colores se puede mezclar casi todo. No tienen por qué ser rojo, amarillo y azul: son las tres que mejor sacan los colores de esta foto.</p>`}
  function tabla(res){const t=$('#co-tabla');if(!t)return;const usados=[];
    for(const ops of res)for(const g of ops[0].pigs)if(!usados.find(u=>u.hex===g.hex&&u.nombre===g.nombre))usados.push(g);
    const U=usados.slice(0,6);if(!U.length){t.innerHTML='';return}
    const R=U.map(u=>COLOR.reflect(u.hex)),hx=(a,b)=>COLOR.reflHex(a===b?COLOR.mezclar([R[a]],[1],1):COLOR.mezclar([R[a],R[b]],[1,1],1));
    let s=`<p class="muted">Las pinturas de tus mezclas, cada una con las demás a partes iguales. En la diagonal, la pintura sola.</p><div class="tabla-mezclas"><table><thead><tr><th scope="col"><span class="sr">Pintura</span></th>${U.map((u,i)=>`<th scope="col">${i+1}</th>`).join('')}</tr></thead><tbody>`;
    U.forEach((u,a)=>{s+=`<tr><th scope="row">${a+1}. ${esc(nombreP(u))}</th>`+U.map((v,b)=>`<td style="background:${hx(a,b)}" title="${a===b?esc(nombreP(u))+' sola':esc(nombreP(u))+' con '+esc(nombreP(v))}"><span class="sr">${a===b?esc(nombreP(u))+' sola':esc(nombreP(u))+' con '+esc(nombreP(v))}</span></td>`).join('')+'</tr>'});
    s+=`</tbody></table></div><p class="muted" style="margin-top:10px">Con agua, de cargada a muy aguada:</p><div class="tabla-mezclas"><table><tbody>`;
    U.forEach((u,a)=>{s+=`<tr><th scope="row">${a+1}. ${esc(u.nombre)}</th>`+[1,0.55,0.3,0.15].map(t=>`<td style="background:${COLOR.reflHex(COLOR.mezclar([R[a]],[1],t))}"><span class="sr">${COLOR.textoCarga(t)}</span></td>`).join('')+'</tr>'});
    t.innerHTML=s+'</tbody></table></div>'}
  pintarPanel();render();
  limpiar=()=>{trabajo++;trioT++};
}};
// Ajustes de pintura desde Color: abre Ajustes en el apartado «Para dibujar»
function abrirAjustesPintura(){abrirDlg('dlg-ajustes');setTimeout(()=>{const b=$('#aj-caja');if(b)b.scrollIntoView({block:'center'})},50)}
window.PALETA={pinturas,nombreP,textoMezcla,parecido};
})();
