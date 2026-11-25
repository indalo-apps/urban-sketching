/* ===== Etapa 1 · Encuadre: qué parte vas a dibujar, en qué papel y dónde pones el horizonte =====
   Proporciones de cielo y suelo de Masao Yamada (A Beginner's Guide to Sketching Buildings & Landscapes, cap. 3). */
(function(){
const PROPS=[['libre','Libre',null],['a5h','Cuaderno apaisado',Math.SQRT2],['a5v','Cuaderno vertical',1/Math.SQRT2],['cuadrado','Cuadrado',1],['doble','Doble página',2*Math.SQRT2]];
// cielo:suelo (de arriba abajo)
const CIELO=[['1:1','Mitad y mitad',1,1],['5:8','Más suelo (5:8)',5,8],['8:5','Más cielo (8:5)',8,5],['5:7','Algo más de suelo (5:7)',5,7],['7:5','Algo más de cielo (7:5)',7,5],['5:13','Horizonte alto (5:13)',5,13],['13:5','Horizonte bajo (13:5)',13,5]];
function rectInicial(p,ratio){if(!ratio)return [0,0,p.w,p.h];let w=p.w,h=w/ratio;if(h>p.h){h=p.h;w=h*ratio}return [(p.w-w)/2,(p.h-h)/2,(p.w+w)/2,(p.h+h)/2]}
ETAPAS.encuadre={pintar(cont){
  const p=US.p,e=p.enc;if(!e.rect)e.rect=rectInicial(p,(PROPS.find(x=>x[0]===e.prop)||[])[2]);
  const {svg,barra,panel}=crearZona(cont);
  const mg=Math.max(p.w,p.h)*0.035;svg.setAttribute('viewBox',`${-mg} ${-mg} ${p.w+2*mg} ${p.h+2*mg}`);svg.setAttribute('aria-label','Foto con el recuadro del encuadre. Arrastra las esquinas o el centro, o usa los botones de mover.');
  let sel=null;
  function dibujar(){
    const u=unidad(svg),[x0,y0,x1,y1]=e.rect,w=x1-x0,h=y1-y0,r=14*u;svg.innerHTML='';
    el('image',{href:US.url,x:0,y:0,width:p.w,height:p.h,preserveAspectRatio:'none'},svg);
    el('path',{d:`M0 0H${p.w}V${p.h}H0Z M${x0} ${y0}V${y1}H${x1}V${y0}Z`,fill:'rgba(20,16,10,.55)','fill-rule':'evenodd'},svg);
    const g=el('g',{fill:'none','vector-effect':'non-scaling-stroke'},svg);
    const linea=(a,b,c,d,dash)=>{el('line',{x1:a,y1:b,x2:c,y2:d,stroke:'#fff','stroke-width':3,'vector-effect':'non-scaling-stroke',opacity:.7},g);el('line',{x1:a,y1:b,x2:c,y2:d,stroke:'#1a1a1a','stroke-width':1.4,'stroke-dasharray':dash||'','vector-effect':'non-scaling-stroke'},g)};
    if(e.guia==='tercios'){for(const k of [1/3,2/3]){linea(x0+w*k,y0,x0+w*k,y1,'6 5');linea(x0,y0+h*k,x1,y0+h*k,'6 5')}}
    if(e.guia==='cielo'){const c=CIELO.find(c=>c[0]===e.cielo)||CIELO[1],yy=y0+h*c[2]/(c[2]+c[3]);
      el('line',{x1:x0,y1:yy,x2:x1,y2:yy,stroke:'#fff','stroke-width':5,'vector-effect':'non-scaling-stroke',opacity:.8},g);el('line',{x1:x0,y1:yy,x2:x1,y2:yy,stroke:'#1a1a1a','stroke-width':2.5,'stroke-dasharray':'16 6','vector-effect':'non-scaling-stroke'},g);
      const t=el('text',{x:x0+8*u,y:yy-8*u,'font-size':14*u,'font-weight':700,fill:'#fff',stroke:'#1a1a1a','stroke-width':3*u,'paint-order':'stroke'},svg);t.textContent=`Horizonte aquí · ${c[2]} de cielo, ${c[3]} de suelo`}
    if(p.pers.horizonte){const [a,b]=p.pers.horizonte,sg=GEOM.recortar(a,b,[x0,y0,x1,y1]);if(sg){el('line',{x1:sg[0][0],y1:sg[0][1],x2:sg[1][0],y2:sg[1][1],stroke:'#fff','stroke-width':2,'stroke-dasharray':'3 4','vector-effect':'non-scaling-stroke'},svg)}}
    el('rect',{x:x0,y:y0,width:w,height:h,fill:'none',stroke:'#fff','stroke-width':2.5,'vector-effect':'non-scaling-stroke'},svg);
    // centro para mover y esquinas para cambiar el tamaño
    const asa=(id,x,y,et)=>{const c=el('g',{'data-asa':id,tabindex:0,role:'button','aria-label':et,style:'cursor:grab'},svg);
      el('circle',{cx:x,cy:y,r:22*u,fill:'transparent'},c);el('circle',{cx:x,cy:y,r:(sel===id?r*1.15:r*0.8),fill:sel===id?'#1a1a1a':'#fff',stroke:sel===id?'#fff':'#1a1a1a','stroke-width':2,'vector-effect':'non-scaling-stroke'},c)};
    asa('mover',x0+w/2,y0+h/2,'Mover el encuadre');asa('c0',x0,y0,'Esquina de arriba a la izquierda');asa('c1',x1,y0,'Esquina de arriba a la derecha');asa('c2',x1,y1,'Esquina de abajo a la derecha');asa('c3',x0,y1,'Esquina de abajo a la izquierda');
    info()}
  const ratio=()=>(PROPS.find(x=>x[0]===e.prop)||[])[2];
  function mover(id,pos,delta){let [x0,y0,x1,y1]=e.rect;const w=x1-x0,h=y1-y0,rt=ratio(),min=Math.max(p.w,p.h)*0.08;
    if(id==='mover'){let cx,cy;if(pos){cx=pos[0];cy=pos[1]}else{cx=x0+w/2+delta[0];cy=y0+h/2+delta[1]}
      cx=Math.min(p.w-w/2,Math.max(w/2,cx));cy=Math.min(p.h-h/2,Math.max(h/2,cy));e.rect=[cx-w/2,cy-h/2,cx+w/2,cy+h/2]}
    else{const k=+id[1],fijo=[[x1,y1],[x0,y1],[x0,y0],[x1,y0]][k],act=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]][k];
      let q=pos||[act[0]+delta[0],act[1]+delta[1]];q=[Math.min(p.w,Math.max(0,q[0])),Math.min(p.h,Math.max(0,q[1]))];
      let nw=Math.max(min,Math.abs(q[0]-fijo[0])),nh=Math.max(min,Math.abs(q[1]-fijo[1]));
      if(rt){if(nw/nh>rt)nw=nh*rt;else nh=nw/rt}
      const sx=q[0]<fijo[0]?-1:1,sy=q[1]<fijo[1]?-1:1;let ax=fijo[0]+sx*nw,ay=fijo[1]+sy*nh;
      if(ax<0||ax>p.w||ay<0||ay>p.h){const kx=sx<0?fijo[0]/nw:(p.w-fijo[0])/nw,ky=sy<0?fijo[1]/nh:(p.h-fijo[1])/nh,kk=Math.min(1,kx,ky);nw*=kk;nh*=kk;ax=fijo[0]+sx*nw;ay=fijo[1]+sy*nh}
      e.rect=[Math.min(fijo[0],ax),Math.min(fijo[1],ay),Math.max(fijo[0],ax),Math.max(fijo[1],ay)]}
    US.cache={};dibujar()}
  arrastres(svg,{mover,soltar:()=>guardar(),seleccionar:id=>{sel=id;dibujar()}});
  barra.append(html(`<button id="en-todo">⛶ Toda la foto</button>`));
  $('#en-todo').onclick=()=>{e.prop='libre';e.rect=[0,0,p.w,p.h];US.cache={};guardar();pintarPanel();dibujar()};
  function info(){const [x0,y0,x1,y1]=e.rect,t=$('#en-info');if(t)t.textContent=`El recuadro ocupa ${pct((x1-x0)*(y1-y0)/(p.w*p.h))} de la foto y su proporción es ${fmt((x1-x0)/(y1-y0),2)} : 1.`}
  function pintarPanel(){panel.innerHTML='';
    const c1=html(`<div class="caja"><h2 class="ch">Papel</h2><div class="ops" role="group" aria-label="Proporción del papel">${PROPS.map(x=>`<button data-prop="${x[0]}" aria-pressed="${e.prop===x[0]}">${x[1]}</button>`).join('')}</div>
      <p class="muted" style="margin-top:8px">Los cuadernos A5, A4 y A3 tienen la misma proporción: 1,41 : 1.</p><p class="muted" id="en-info" role="status"></p></div>`);
    c1.addEventListener('click',ev=>{const b=ev.target.closest('[data-prop]');if(!b)return;e.prop=b.dataset.prop;const rt=ratio(),[x0,y0,x1,y1]=e.rect;
      if(rt){let w=x1-x0,h=w/rt;if(h>p.h){h=p.h;w=h*rt}if(w>p.w){w=p.w;h=w/rt}const cx=Math.min(p.w-w/2,Math.max(w/2,(x0+x1)/2)),cy=Math.min(p.h-h/2,Math.max(h/2,(y0+y1)/2));e.rect=[cx-w/2,cy-h/2,cx+w/2,cy+h/2]}
      US.cache={};guardar();pintarPanel();dibujar();anunciar('Papel: '+b.textContent)});
    const c2=html(`<div class="caja"><h2 class="ch">Guía</h2><div class="ops" role="group" aria-label="Guía de composición"><button data-guia="tercios" aria-pressed="${e.guia==='tercios'}">▦ Tercios</button><button data-guia="cielo" aria-pressed="${e.guia==='cielo'}">🌅 Cielo y suelo</button><button data-guia="nada" aria-pressed="${e.guia==='nada'}">Sin guía</button></div>
      <div id="en-cielo" ${e.guia==='cielo'?'':'hidden'} style="margin-top:10px"><label for="en-cielo-sel">Dónde va el horizonte</label><select id="en-cielo-sel" style="width:100%;margin-top:4px">${CIELO.map(c=>`<option value="${c[0]}" ${c[0]===e.cielo?'selected':''}>${c[1]}</option>`).join('')}</select>
      <p class="muted" style="margin-top:8px">Masao Yamada reparte el papel entre cielo y suelo con la proporción áurea redondeada (5:8 u 8:5), la del papel (5:7 o 7:5) o la áurea al cuadrado (5:13 o 13:5). Lo que ocupa más espacio es lo que se lleva la atención.</p></div></div>`);
    c2.addEventListener('click',ev=>{const b=ev.target.closest('[data-guia]');if(!b)return;e.guia=b.dataset.guia;guardar();pintarPanel();dibujar()});
    c2.querySelector('select').onchange=ev=>{e.cielo=ev.target.value;guardar();dibujar()};
    const c3=html(`<div class="caja"><h2 class="ch">Nombre del apunte</h2><input type="text" id="en-nombre" aria-label="Nombre del apunte" placeholder="Por ejemplo: Puerta de Purchena" value="${esc(p.nombre)}" style="width:100%"></div>`);
    c3.querySelector('input').oninput=ev=>{p.nombre=ev.target.value.slice(0,60);$('#h1').textContent=p.nombre||'Apunte sin nombre';guardar()};
    panel.append(c1,c2,c3);
    const pad=html('<div class="caja"></div>');padMover(pad,d=>mover(sel||'mover',null,d),'Mover el punto elegido (el centro mueve todo el recuadro):');panel.append(pad);
    panel.append(html(`<p class="nota">Encuadra lo que de verdad vas a dibujar: casi siempre es menos de lo que sale en la foto.</p>`));
    panel.append(botonSiguiente('encuadre'));info()}
  pintarPanel();dibujar();
  const ro=new ResizeObserver(()=>dibujar());ro.observe(svg);limpiar=()=>ro.disconnect();
}};
})();
