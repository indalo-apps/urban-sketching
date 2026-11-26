/* ===== Para salir a dibujar: Sol y sombras, Rutas por Almería y Lista de material ===== */
const R_GRAD=Math.PI/180;
const hhmm=d=>d?d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}):'—';
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const leccionN=id=>LECCIONES.findIndex(l=>l.id===id)+1;
const metros=v=>!isFinite(v)?'muy larga (el sol está casi en el horizonte)':v>60?'más de 60 m':fmt(v,v<10?1:0)+' m';

/* Envolvente convexa (en el suelo, coordenadas x, z) y recorte de lo que queda delante del ojo */
function envolvente(p){p=p.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[],up=[];for(const q of p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}
  for(const q of p.slice().reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}
  return lo.slice(0,-1).concat(up.slice(0,-1))}
// Recorta un polígono del suelo para quedarse con lo que está delante del ojo (z ≥ zmin)
function recortar(pol,zmin){const out=[];for(let i=0;i<pol.length;i++){const a=pol[i],b=pol[(i+1)%pol.length],ia=a[1]>=zmin,ib=b[1]>=zmin;
    if(ia)out.push(a);if(ia!==ib){const t=(zmin-a[1])/(b[1]-a[1]);out.push([a[0]+t*(b[0]-a[0]),zmin])}}return out}
/* ---------- Sol y sombras ----------
   Sombra propia y sombra arrojada: Phil Metzger, cap. 4. Las sombras de las verticales fugan a un punto
   del horizonte justo debajo del sol: Sarah Haley, «Shadow vanishing point». */
const VISTA_SOL=(function(){
  const st=store.get('us-sol-v1',{lugar:'almeria',lat:36.84,lon:-2.46,mira:0});
  const guardarS=()=>store.set('us-sol-v1',st);
  // Dirección hacia el sol en la escena (X derecha, Y arriba, Z hacia donde miras)
  const haciaSol=(p,mira)=>{const r=(p.az-mira)*R_GRAD,c=Math.cos(p.alt*R_GRAD);return [c*Math.sin(r),Math.sin(p.alt*R_GRAD),c*Math.cos(r)]};
  function relativo(p,mira){const r=((p.az-mira)%360+540)%360-180,lado=r>0?'derecha':'izquierda';
    if(Math.abs(r)<35)return 'de frente: a contraluz. Las fachadas que ves están en sombra y los bordes brillan';
    if(Math.abs(r)>145)return 'de tu espalda: todo lo que ves está iluminado, con pocas sombras';
    return `por la ${lado}${Math.abs(r)<80?', un poco de frente':Math.abs(r)>100?', un poco de detrás':''}: luz lateral, una cara clara y otra oscura. Es la que mejor marca el volumen`}
  function escena(p,mira){
    const W=600,H=380,cam=ESCENA.camara({ojo:1.6,f:380,w:W,h:H,pitch:4}),hy=cam.horizonteY,dia=p.alt>0,s=haciaSol(p,mira);
    let o=`<rect width="${W}" height="${H}" fill="${dia?'#e4ecf0':p.alt>-6?'#b9b6c2':'#3d4250'}"/><rect y="${hy}" width="${W}" height="${H-hy}" fill="${dia?'#e6dccb':p.alt>-6?'#a8a093':'#4e4a42'}"/>`;
    const caja=ESCENA.caja({x:-1.5,z:19,w:7,d:7,h:9,giro:35,ventanas:true}),poste={x:4.5,z:11,h:4.2},pers={x:1.6,z:8.5,h:1.7};
    const sombras=[],puntas=[];
    if(dia&&s[1]>0.008){const k=h=>[-h*s[0]/s[1],-h*s[2]/s[1]];
      const pts=[];for(const q of caja.esquinas.b)pts.push([q[0],q[2]]);for(const q of caja.esquinas.t){const d=k(q[1]);pts.push([q[0]+d[0],q[2]+d[1]]);puntas.push([[q[0],q[2]],[q[0]+d[0],q[2]+d[1]]])}
      sombras.push(envolvente(pts));
      for(const v of [poste,pers]){const d=k(v.h),w=v===pers?0.22:0.09,ux=-d[1],uz=d[0],L=Math.hypot(ux,uz)||1,nx=ux/L*w,nz=uz/L*w;
        sombras.push([[v.x-nx,v.z-nz],[v.x+nx,v.z+nz],[v.x+d[0]+nx*0.6,v.z+d[1]+nz*0.6],[v.x+d[0]-nx*0.6,v.z+d[1]-nz*0.6]]);puntas.push([[v.x,v.z],[v.x+d[0],v.z+d[1]]])}}
    const vista=pol=>{const c=recortar(pol,0.6);return c.length>2?c.map(q=>cam.ver([q[0],0,q[1]])):null};
    for(const pol of sombras){const pp=vista(pol);if(pp)o+=`<polygon points="${ESCENA.pts(pp)}" fill="#2b2118" fill-opacity=".38"/>`}
    // Punto de fuga de las sombras (S): en el horizonte, debajo del sol (o del punto opuesto, si el sol está a tu espalda)
    let S=null;if(dia&&s[1]>0.008){const d=[-s[0],0,-s[2]],v=cam.dir(d),v2=cam.dir([s[0],0,s[2]]);S=v&&v.delante?v.p:v2&&v2.delante?v2.p:null;
      if(S&&S[0]>-150&&S[0]<W+150){for(const [a,b] of puntas){const A=a[1]>0.6?cam.ver([a[0],0,a[1]]):null;if(A)o+=`<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${S[0].toFixed(1)}" y2="${S[1].toFixed(1)}" stroke="#9a4527" stroke-width="1" stroke-dasharray="4 4" opacity=".8"/>`}}else S=null}
    // Edificio: cara al sol, clara; cara sin sol (sombra propia), oscura
    for(const {f,pp,hs} of ESCENA.proyectar(cam,[caja])){const l=f.n[0]*s[0]+f.n[1]*s[1]+f.n[2]*s[2],luz=dia&&l>0?0.72+0.28*l:dia?0.5:0.34;
      const c=[243,231,210].map(v=>Math.round(v*luz));o+=`<polygon points="${ESCENA.pts(pp)}" fill="rgb(${c})" stroke="#1d1a16" stroke-width="1.6" stroke-linejoin="round"/>`;
      for(const w of hs)o+=`<polygon points="${ESCENA.pts(w)}" fill="#1d1a16" fill-opacity=".55"/>`}
    const pb=cam.ver([poste.x,0,poste.z]),pt=cam.ver([poste.x,poste.h,poste.z]);if(pb&&pt)o+=`<line x1="${pb[0]}" y1="${pb[1]}" x2="${pt[0]}" y2="${pt[1]}" stroke="#1d1a16" stroke-width="3"/><circle cx="${pt[0]}" cy="${pt[1]}" r="5" fill="#1d1a16"/>`;
    o+=ESCENA.persona(cam,pers.x,pers.z,pers.h,'').replace('<g class="">','<g fill="#1d1a16">');
    o+=`<line x1="0" y1="${hy}" x2="${W}" y2="${hy}" stroke="#fff" stroke-width="4" opacity=".7"/><line x1="0" y1="${hy}" x2="${W}" y2="${hy}" stroke="#1d1a16" stroke-width="2" stroke-dasharray="14 5"/>`;
    if(S){const sx=Math.min(W-14,Math.max(14,S[0]));o+=`<circle cx="${sx}" cy="${hy}" r="12" fill="#fff" stroke="#1d1a16" stroke-width="2"/><text x="${sx}" y="${hy+5}" text-anchor="middle" font-size="14" font-weight="700" fill="#1d1a16">S</text>`}
    if(dia){const v=cam.dir(s);if(v&&v.delante&&v.p[0]>-10&&v.p[0]<W+10&&v.p[1]>-10&&v.p[1]<H){const [x,y]=v.p;let r='';for(let i=0;i<8;i++){const a=i*Math.PI/4;r+=`<line x1="${x+Math.cos(a)*16}" y1="${y+Math.sin(a)*16}" x2="${x+Math.cos(a)*24}" y2="${y+Math.sin(a)*24}"/>`}
        o+=`<g stroke="#1d1a16" stroke-width="2.4" stroke-linecap="round">${r}</g><circle cx="${x}" cy="${y}" r="12" fill="#fff" stroke="#1d1a16" stroke-width="2.4"/>`}}
    else o+=`<text x="${W/2}" y="40" text-anchor="middle" font-size="20" font-weight="700" fill="#fff" font-family="Inter,system-ui,sans-serif">${p.alt>-6?'Crepúsculo: el sol acaba de esconderse':'De noche: el sol está bajo el horizonte'}</text>`;
    return o}
  // Brújula vista desde arriba: norte arriba, hacia dónde miras y dónde está el sol
  function brujula(p,mira){const C=100,Rr=78;let o=`<circle cx="${C}" cy="${C}" r="${Rr}" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="${C}" cy="${C}" r="${Rr/2}" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" opacity=".6"/>`;
    [['N',0],['E',90],['S',180],['O',270]].forEach(([t,a])=>{const x=C+Math.sin(a*R_GRAD)*(Rr+12),y=C-Math.cos(a*R_GRAD)*(Rr+12)+5;o+=`<text x="${x}" y="${y}" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">${t}</text>`});
    const pto=(a,r)=>[C+Math.sin(a*R_GRAD)*r,C-Math.cos(a*R_GRAD)*r];
    const [mx,my]=pto(mira,Rr-6);o+=`<line x1="${C}" y1="${C}" x2="${mx}" y2="${my}" stroke="currentColor" stroke-width="3"/><path d="M${pto(mira,Rr-2)} L${pto(mira-7,Rr-18)} L${pto(mira+7,Rr-18)}Z" fill="currentColor"/>`;
    o+=`<circle cx="${C}" cy="${C}" r="5" fill="currentColor"/>`;
    if(p.alt>0){const r=Rr*(1-p.alt/90),[sx,sy]=pto(p.az,r),[hx,hy]=pto(p.az+180,Math.min(Rr-8,18+Rr*0.5*(1-p.alt/90)));
      o+=`<line x1="${C}" y1="${C}" x2="${hx}" y2="${hy}" stroke="currentColor" stroke-width="6" opacity=".35" stroke-linecap="round"/>`;
      let ry='';for(let i=0;i<8;i++){const a=i*Math.PI/4;ry+=`<line x1="${sx+Math.cos(a)*10}" y1="${sy+Math.sin(a)*10}" x2="${sx+Math.cos(a)*15}" y2="${sy+Math.sin(a)*15}"/>`}
      o+=`<g stroke="currentColor" stroke-width="2" stroke-linecap="round">${ry}</g><circle cx="${sx}" cy="${sy}" r="7" fill="var(--card)" stroke="currentColor" stroke-width="2"/>`}
    return o}
  // El día entero: altura del sol hora a hora
  function grafica(dia0,lat,lon,min,D){const W=600,H=220,y0=H-44,esc=(H-40)/90,X=m=>m/1440*W,Y=a=>y0-Math.max(-5,a)*esc;let d='';
    for(let m=0;m<=1440;m+=10){const a=SOL.posicion(new Date(dia0.getTime()+m*60000),lat,lon).alt;d+=(m?'L':'M')+X(m).toFixed(1)+' '+Y(a).toFixed(1)}
    let o=`<defs><pattern id="so-rayas" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-width="1.6" opacity=".45"/></pattern></defs>`;
    for(const b of [D.doradaM,D.doradaT])if(b){const a=(b[0]-dia0)/60000,z=(b[1]-dia0)/60000;o+=`<rect x="${X(a)}" y="8" width="${Math.max(2,X(z)-X(a))}" height="${y0-8}" fill="url(#so-rayas)"/>`}
    o+=`<line x1="0" y1="${y0}" x2="${W}" y2="${y0}" stroke="currentColor" stroke-width="1.5"/>`;
    for(let h=0;h<=24;h+=3)o+=`<line x1="${X(h*60)}" y1="${y0}" x2="${X(h*60)}" y2="${y0+6}" stroke="currentColor" stroke-width="1.5"/>`;
    for(let h=0;h<=24;h+=6)o+=`<text x="${Math.min(W-26,Math.max(26,X(h*60)))}" y="${H-6}" text-anchor="middle" font-size="27" fill="currentColor">${h}h</text>`;
    o+=`<path d="${d}" fill="none" stroke="currentColor" stroke-width="2.4"/>`;
    const a=SOL.posicion(new Date(dia0.getTime()+min*60000),lat,lon).alt;o+=`<line x1="${X(min)}" y1="8" x2="${X(min)}" y2="${y0}" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/><circle cx="${X(min)}" cy="${Y(a)}" r="7" fill="var(--card)" stroke="currentColor" stroke-width="2.4"/>`;
    o+=`<text x="6" y="${y0-10}" font-size="25" fill="currentColor">horizonte</text>`;
    return o}
  return function(main){
    cabecera('sol','Sol y sombras','De dónde viene la luz, a cada hora');
    const ahora=new Date();let fecha=ymd(ahora),min=Math.min(1435,Math.round((ahora.getHours()*60+ahora.getMinutes())/5)*5);
    const z=html(`<div class="cz"><div class="lienzo"><svg class="dib" viewBox="0 0 600 380" role="img" id="so-esc"></svg>
      <svg viewBox="0 0 600 220" id="so-dia" role="img" style="display:block;width:100%;height:auto;margin-top:10px;color:var(--ink);touch-action:none"></svg>
      <p class="muted" style="margin:4px 0 0">Toca la gráfica para ir a esa hora. Rayado: las horas doradas, con el sol bajo.</p></div><div class="panel"></div></div>`);
    main.append(z);const panel=z.querySelector('.panel'),svg=z.querySelector('#so-esc'),gr=z.querySelector('#so-dia');
    const c1=html(`<div class="caja"><h2 class="ch">Cuándo</h2>
      <div class="fila"><label for="so-fecha">Día</label><input type="date" id="so-fecha" value="${fecha}" style="font:inherit;min-height:44px;border:1px solid var(--line);border-radius:10px;padding:6px 10px;background:var(--btn);color:var(--ink)"></div>
      <div class="fila"><label for="so-hora">Hora: <b id="so-hh" class="dato"></b></label><input type="range" id="so-hora" min="0" max="1435" step="5" value="${min}"></div>
      <div class="ops"><button id="so-menos">−1 h</button><button id="so-ahora">Ahora</button><button id="so-mas">+1 h</button></div></div>`);
    const c2=html(`<div class="caja"><h2 class="ch">Dónde</h2><div class="ops" role="group" aria-label="Lugar"><button data-lugar="almeria">Almería</button><button data-lugar="gps">📍 Mi ubicación</button></div>
      <p class="muted" id="so-lugar" role="status" aria-live="polite" style="margin-top:8px"></p></div>`);
    const c3=html(`<div class="caja"><h2 class="ch">Hacia dónde miras</h2>
      <div class="fila"><label for="so-mira">Miras al <b id="so-mira-t"></b></label><input type="range" id="so-mira" min="0" max="355" step="5" value="${st.mira}"></div>
      <div class="ops" role="group" aria-label="Puntos cardinales"><button data-m="0">Norte</button><button data-m="90">Este</button><button data-m="180">Sur</button><button data-m="270">Oeste</button><button id="so-brujula" aria-pressed="false">🧭 Brújula</button></div>
      <p class="muted" id="so-br-msg" role="status" aria-live="polite" style="margin-top:8px">Con la brújula: pon el móvil plano, con la parte de arriba apuntando al edificio que vas a dibujar.</p>
      <svg viewBox="-12 -12 224 224" width="190" height="190" role="img" id="so-bru" style="display:block;margin:6px auto 0;color:var(--ink)"></svg></div>`);
    const c4=html(`<div class="caja"><h2 class="ch">El sol a esa hora</h2><ul class="lista" id="so-datos"></ul></div>`);
    const c5=html(`<div class="caja"><h2 class="ch">Ese día</h2><ul class="lista" id="so-diatx"></ul></div>`);
    panel.append(c1,c2,c3,c4,c5,html(`<p class="nota"><b>Para dibujar:</b> hay dos sombras, la <b>propia</b> (la cara del edificio que no mira al sol) y la <b>arrojada</b> (la mancha que deja en el suelo), como explica Phil Metzger. Las sombras arrojadas por cosas verticales fugan a un punto del horizonte que está justo debajo del sol (Sarah Haley): en el dibujo, la letra S. Y recuerda a Felix Scheinberger: en acuarela, lo importante es pintar las sombras; la luz es el blanco del papel. Las sombras se mueven deprisa: decide al principio dónde van y no las cambies.</p>`));
    const dia0=()=>{const [y,m,d]=fecha.split('-').map(Number);return new Date(y,m-1,d)};
    let D=null,Dk='';
    function pintarTodo(){
      const lat=st.lat,lon=st.lon,d0=dia0(),t=new Date(d0.getTime()+min*60000),p=SOL.posicion(t,lat,lon);
      const k=fecha+lat+lon;if(k!==Dk){D=SOL.dia(d0,lat,lon);Dk=k}
      $('#so-hh').textContent=hhmm(t);$('#so-hora').setAttribute('aria-valuetext',hhmm(t));
      $('#so-mira-t').textContent=SOL.rumbo(st.mira,true)+' ('+st.mira+'°)';$('#so-mira').setAttribute('aria-valuetext',SOL.rumbo(st.mira,true));
      svg.innerHTML=escena(p,st.mira);
      const desc=p.alt>0?`Un edificio, una farola y una persona con el sol a ${fmt(p.alt,0)}° de altura, que llega ${relativo(p,st.mira).split(':')[0]}.`:'De noche: no hay sol.';
      svg.setAttribute('aria-label',desc);
      $('#so-bru').innerHTML=brujula(p,st.mira);$('#so-bru').setAttribute('aria-label',`Brújula: miras al ${SOL.rumbo(st.mira,true)}${p.alt>0?' y el sol está al '+SOL.rumbo(p.az,true):''}.`);
      gr.innerHTML=grafica(d0,lat,lon,min,D);gr.setAttribute('aria-label',`Altura del sol durante el día: sale a las ${hhmm(D.salida)} y se pone a las ${hhmm(D.puesta)}. Ahora, ${fmt(p.alt,0)}°.`);
      $('#so-datos').innerHTML=p.alt>0?`<li>Altura: <b class="dato">${fmt(p.alt,0)}°</b> sobre el horizonte${p.alt<10?' (muy bajo: sombras larguísimas y luz cálida)':p.alt>60?' (muy alto: sombras cortas, luz dura y plana)':''}.</li>
        <li>Viene del <b>${SOL.rumbo(p.az,true)}</b> (${fmt(p.az,0)}°).</li><li>Te llega ${relativo(p,st.mira)}.</li>
        <li>La sombra de una persona de 1,70 m mide <b class="dato">${metros(SOL.sombra(1.7,p.alt))}</b>; la de un edificio de 10 m, <b class="dato">${metros(SOL.sombra(10,p.alt))}</b>.</li>`
        :`<li>El sol está ${fmt(-p.alt,0)}° por debajo del horizonte: no hay sombras de sol.</li>`;
      const dor=b=>b?hhmm(b[0])+' a '+hhmm(b[1]):'—';
      $('#so-diatx').innerHTML=D.salida?`<li>Sale a las <b class="dato">${hhmm(D.salida)}</b> y se pone a las <b class="dato">${hhmm(D.puesta)}</b>.</li><li>Mediodía solar: <b class="dato">${hhmm(D.mediodia)}</b>, a ${fmt(D.altMax,0)}° de altura (sombras más cortas del día).</li><li>Horas doradas: de ${dor(D.doradaM)} y de ${dor(D.doradaT)}.</li>`:'<li>Ese día el sol no sale o no se pone en este sitio.</li>';
      c2.querySelectorAll('[data-lugar]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lugar===st.lugar));
      $('#so-lugar').textContent=st.lugar==='almeria'?'Almería (36,84° N, 2,46° O).':'Tu ubicación ('+fmt(Math.abs(st.lat),2)+'° '+(st.lat>=0?'N':'S')+', '+fmt(Math.abs(st.lon),2)+'° '+(st.lon>=0?'E':'O')+'). Se guarda solo en este móvil.'}
    const hora=$('#so-hora');
    hora.oninput=()=>{min=+hora.value;pintarTodo()};
    const mover=d=>{min=Math.max(0,Math.min(1435,min+d));hora.value=min;pintarTodo();anunciar($('#so-hh').textContent)};
    $('#so-menos').onclick=()=>mover(-60);$('#so-mas').onclick=()=>mover(60);
    $('#so-ahora').onclick=()=>{const a=new Date();fecha=ymd(a);$('#so-fecha').value=fecha;min=Math.min(1435,Math.round((a.getHours()*60+a.getMinutes())/5)*5);hora.value=min;pintarTodo();anunciar('Ahora: '+$('#so-hh').textContent)};
    $('#so-fecha').onchange=e=>{if(/^\d{4}-\d\d-\d\d$/.test(e.target.value)){fecha=e.target.value;pintarTodo()}};
    gr.addEventListener('pointerdown',e=>{const r=gr.getBoundingClientRect();min=Math.max(0,Math.min(1435,Math.round((e.clientX-r.left)/r.width*1440/5)*5));hora.value=min;pintarTodo()});
    const mira=$('#so-mira');mira.oninput=()=>{st.mira=+mira.value;guardarS();pintarTodo()};
    c3.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;st.mira=+b.dataset.m;mira.value=st.mira;guardarS();pintarTodo();anunciar('Miras al '+SOL.rumbo(st.mira,true))});
    c2.addEventListener('click',e=>{const b=e.target.closest('[data-lugar]');if(!b)return;
      if(b.dataset.lugar==='almeria'){Object.assign(st,{lugar:'almeria',lat:36.84,lon:-2.46});guardarS();pintarTodo();anunciar('Almería');return}
      if(!navigator.geolocation){$('#so-lugar').textContent='Este navegador no da la ubicación. Se usa Almería.';return}
      $('#so-lugar').textContent='Buscando tu ubicación…';
      navigator.geolocation.getCurrentPosition(pos=>{Object.assign(st,{lugar:'gps',lat:Math.round(pos.coords.latitude*100)/100,lon:Math.round(pos.coords.longitude*100)/100});guardarS();pintarTodo()},
        ()=>{$('#so-lugar').textContent='No se ha podido saber tu ubicación (quizá no has dado permiso). Se usa la anterior.'},{timeout:15000,maximumAge:600000})});
    // Brújula del móvil
    let brOn=false;const brB=$('#so-brujula');
    function rumboEv(e){let h=null;if(typeof e.webkitCompassHeading==='number')h=e.webkitCompassHeading;else if(e.absolute&&e.alpha!=null)h=(360-e.alpha)%360;if(h==null)return;
      const v=Math.round(h/5)*5%360;if(v!==st.mira){st.mira=v;mira.value=v;guardarS();pintarTodo()}}
    function parar(){brOn=false;brB.setAttribute('aria-pressed','false');removeEventListener('deviceorientationabsolute',rumboEv);removeEventListener('deviceorientation',rumboEv)}
    brB.onclick=async()=>{if(brOn){parar();$('#so-br-msg').textContent='Brújula apagada.';return}
      try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')throw 0}}
      catch(_){$('#so-br-msg').textContent='Sin permiso para la brújula: elige el punto cardinal a mano.';return}
      if(!('ondeviceorientationabsolute' in window)&&!('ondeviceorientation' in window)){$('#so-br-msg').textContent='Este dispositivo no tiene brújula: elige el punto cardinal a mano.';return}
      brOn=true;brB.setAttribute('aria-pressed','true');addEventListener('deviceorientationabsolute',rumboEv);addEventListener('deviceorientation',rumboEv);
      $('#so-br-msg').textContent='Brújula encendida: pon el móvil plano y apunta con la parte de arriba al edificio.'};
    limpiar=parar;
    pintarTodo()}
})();

/* ---------- Rutas y retos por Almería ---------- */
const SITIOS=[
 {id:'alcazaba',z:'c',t:'La Alcazaba',q:'Alcazaba de Almería',que:'Las murallas y las torres que suben por el cerro. Desde abajo, mirando hacia arriba; desde dentro, los patios y la muralla de Jayrán al otro lado del valle.',reto:'Dibuja la muralla mirando hacia arriba: las verticales se juntan.',lec:'trespuntos'},
 {id:'catedral',z:'c',t:'La Catedral',q:'Catedral de Almería',que:'Una catedral que parece una fortaleza, con torres y almenas. Su esquina, con la plaza delante, es perfecta para dos puntos de fuga.',reto:'Encaja una esquina con sus dos puntos de fuga, sin juntarlos en el papel.',lec:'dospuntos'},
 {id:'plazavieja',z:'c',t:'La Plaza Vieja',q:'Plaza de la Constitución, Almería',que:'La plaza cerrada, con soportales y el Ayuntamiento al fondo.',reto:'Los arcos de los soportales: busca el centro de cada arco con las diagonales.',lec:'arcos'},
 {id:'cable',z:'c',t:'El Cable Inglés',q:'Cable Inglés, Almería',que:'El antiguo cargadero de mineral, de hierro, entrando en el mar. Muchas vigas paralelas.',reto:'Todas las vigas paralelas, a su punto de fuga. Y el mar, en el horizonte.',lec:'paralelas'},
 {id:'purchena',z:'c',t:'Puerta de Purchena',q:'Puerta de Purchena, Almería',que:'Un cruce de calles con edificios en esquina y mucha gente.',reto:'Cada edificio torcido, con su punto de fuga en el mismo horizonte. Añade cinco personas a escala.',lec:'muchos'},
 {id:'paseo',z:'c',t:'El Paseo de Almería',q:'Paseo de Almería',que:'Una calle larga y recta, con árboles y fachadas a los dos lados.',reto:'La calle de frente, con un solo punto de fuga.',lec:'unpunto'},
 {id:'mercado',z:'c',t:'El Mercado Central',q:'Mercado Central de Almería',que:'Una fachada simétrica, con su gran puerta en el centro.',reto:'Busca los cuadrados de la fachada antes de dibujar los detalles.',lec:'cuadrados'},
 {id:'chanca',z:'c',t:'La Chanca',q:'Barrio de La Chanca, Almería',que:'Casas cúbicas de colores en la ladera, bajo la Alcazaba. Luz fuerte y sombras muy marcadas.',reto:'Solo tres tonos: el blanco del papel, un medio y las sombras.',lec:'tonos'},
 {id:'sancristobal',z:'c',t:'Cerro de San Cristóbal',q:'Cerro de San Cristóbal, Almería',que:'El mirador sobre la ciudad y el puerto: cerca, lejos y muy lejos.',reto:'Tres planos: lo lejano, más claro y con menos detalle.',lec:'atmosfera'},
 {id:'maritimo',z:'c',t:'El Paseo Marítimo',q:'Paseo Marítimo, Almería',que:'El mar es el mejor sitio para ver de verdad la línea del horizonte.',reto:'Pon el horizonte a la altura de tus ojos y la gente con la cabeza en la línea.',lec:'personas'},
 {id:'estacion',z:'c',t:'La antigua estación de tren',q:'Antigua estación de ferrocarril, Almería',que:'Una fachada simétrica de hierro y cristal.',reto:'Mide con el lápiz el ancho y el alto antes de empezar.',lec:'lapiz'},
 {id:'rambla',z:'c',t:'La Rambla',q:'Rambla Federico García Lorca, Almería',que:'Un paseo ancho y largo, con palmeras y gente a distintas distancias.',reto:'Personas cerca y lejos: las de lejos, más pequeñas y con los pies más cerca del horizonte.',lec:'lejos'},
 {id:'nijar',z:'p',t:'Níjar',q:'Níjar, Almería',que:'Calles blancas en cuesta.',reto:'Una calle en cuesta: su punto de fuga sube o baja, no está en el horizonte.',lec:'cuesta'},
 {id:'mojacar',z:'p',t:'Mojácar',q:'Mojácar pueblo',que:'Un pueblo blanco colgado del monte: cubos, terrazas y escaleras.',reto:'Unas escaleras, peldaño a peldaño.',lec:'escaleras'},
 {id:'sanjose',z:'p',t:'San José',q:'San José, Níjar, Almería',que:'Casas bajas y blancas frente al mar, en el Cabo de Gata.',reto:'Una calle con un punto de fuga y el horizonte del mar al fondo.',lec:'horizonte'},
 {id:'faro',z:'p',t:'Faro de Cabo de Gata',q:'Faro de Cabo de Gata',que:'El faro sobre el arrecife de las Sirenas, con el mar detrás.',reto:'Haz el apunte en tres pasos: encaje, volúmenes y valores.',lec:'pasoapaso'},
 {id:'rodalquilar',z:'p',t:'Rodalquilar',q:'Rodalquilar, Níjar',que:'Las ruinas de las minas de oro en la ladera.',reto:'Muchos volúmenes a distintas alturas: dónde corta cada uno el horizonte.',lec:'arriba'}];
const RETOS=[
 {id:'r10',t:'Un apunte en 10 minutos: solo el horizonte y las líneas principales.'},
 {id:'r3t',t:'Un apunte con solo tres tonos (claro, medio y oscuro).'},
 {id:'r3c',t:'Un apunte con tu paleta limitada de 3 colores (en la etapa Color).'},
 {id:'rman',t:'El mismo sitio por la mañana y por la tarde: mira antes en «Sol y sombras» de dónde vendrá la luz.'},
 {id:'rtin',t:'Un apunte solo a tinta, con tramas para las sombras.'},
 {id:'rgro',t:'Un apunte con tres grosores de línea: grueso delante, fino al fondo.'},
 {id:'rsen',t:'Sentado en un banco: el horizonte baja contigo. ¿Dónde corta ahora a la gente?'},
 {id:'rinv',t:'Mira tu apunte en la etapa Comparar y apunta qué corregirías la próxima vez.'}];
const VISTA_RUTAS=(function(){
  const hechos=store.get('us-rutas-v1',{});const guardarR=()=>store.set('us-rutas-v1',hechos);
  return function(main){
    cabecera('rutas','Rutas y retos','Sitios de Almería para dibujar, cada uno con un reto');
    const total=SITIOS.length+RETOS.length,cuenta=()=>Object.keys(hechos).filter(k=>hechos[k]).length;
    const cab=html(`<p class="dato" id="ru-cuenta" role="status" aria-live="polite"></p>`);main.append(cab);
    const pintaCuenta=()=>{$('#ru-cuenta').textContent=`Llevas ${cuenta()} de ${total}.`};
    const marcaH=id=>`<span class="hecho" data-marca="${id}">${hechos[id]?'✓ Hecho':''}</span>`;
    const tarjeta=s=>{const n=leccionN(s.lec),L=LECCIONES[n-1],h=hechos[s.id];
      return `<li class="caja sitio" data-sitio="${s.id}"><details><summary><h3 class="st">${esc(s.t)}</h3>${marcaH(s.id)}</summary><div><p>${esc(s.que)}</p><p><b>Reto:</b> ${esc(s.reto)}</p>
        <div class="ops">${L?`<a class="boton" href="#aprender/${n}">📖 Lección: ${esc(L.t)}</a>`:''}<button data-hecho="${s.id}" aria-pressed="${!!h}">${h?'✓ Dibujado el '+fecha(h):'Marcar como dibujado'}</button><a class="boton" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(s.q)}" target="_blank" rel="noopener">Ver en el mapa<span class="sr"> (se abre fuera de la app)</span></a></div></div></details></li>`};
    main.append(html(`<div class="ops" role="group" aria-label="Qué sitios enseñar" style="margin:4px 0 6px">${[['todos','Todos'],['pendientes','Sin hacer'],['hechos','Hechos']].map(([k,t])=>`<button data-filtro="${k}" aria-pressed="${k==='todos'}">${t}</button>`).join('')}</div>`),
      html(`<p class="muted">Toca un sitio para ver su reto.</p>`));
    main.append(html(`<h2>En la ciudad</h2>`),html(`<ul class="sitios">${SITIOS.filter(s=>s.z==='c').map(tarjeta).join('')}</ul>`));
    main.append(html(`<h2>Por la provincia</h2>`),html(`<ul class="sitios">${SITIOS.filter(s=>s.z==='p').map(tarjeta).join('')}</ul>`));
    main.append(html(`<h2>Retos para cualquier sitio</h2>`),html(`<ul class="sitios">${RETOS.map(r=>{const h=hechos[r.id];return `<li class="caja sitio" data-sitio="${r.id}"><p>${esc(r.t)}</p><div class="ops"><button data-hecho="${r.id}" aria-pressed="${!!h}">${h?'✓ Hecho el '+fecha(h):'Marcar como hecho'}</button></div></li>`}).join('')}</ul>`));
    main.append(html(`<p class="nota">«Ver en el mapa» abre Google Maps fuera de la app. Antes de salir, mira en «Sol y sombras» de dónde vendrá la luz y prepara la mochila con la «Lista de material».</p>`));
    main.append(html(`<div class="ops" style="margin-top:12px"><a class="boton" href="#sol">☀ Sol y sombras</a><a class="boton" href="#material">🎒 Lista de material</a></div>`));
    let filtro='todos';const filtrar=()=>{main.querySelectorAll('[data-sitio]').forEach(li=>{const h=!!hechos[li.dataset.sitio];li.hidden=filtro==='hechos'?!h:filtro==='pendientes'?h:false});
      main.querySelectorAll('ul.sitios').forEach(ul=>{const h2=ul.previousElementSibling;if(h2&&h2.tagName==='H2')h2.hidden=![...ul.children].some(li=>!li.hidden)})};
    main.addEventListener('click',e=>{const f=e.target.closest('[data-filtro]');if(f){filtro=f.dataset.filtro;main.querySelectorAll('[data-filtro]').forEach(x=>x.setAttribute('aria-pressed',x===f));filtrar();
        anunciar(f.textContent+': '+main.querySelectorAll('[data-sitio]:not([hidden])').length+' sitios y retos.');return}
      const b=e.target.closest('[data-hecho]');if(!b)return;const id=b.dataset.hecho,es=SITIOS.some(s=>s.id===id);
      hechos[id]=hechos[id]?0:Date.now();if(!hechos[id])delete hechos[id];guardarR();
      b.setAttribute('aria-pressed',!!hechos[id]);b.textContent=hechos[id]?'✓ '+(es?'Dibujado':'Hecho')+' el '+fecha(hechos[id]):(es?'Marcar como dibujado':'Marcar como hecho');
      const mk=main.querySelector(`[data-marca="${id}"]`);if(mk)mk.textContent=hechos[id]?'✓ Hecho':'';pintaCuenta()});
    pintaCuenta()}
})();

/* ---------- Lista de material ---------- */
const MATERIAL=[
 ['Para dibujar',[['cuaderno','Cuaderno de dibujo'],['lapiz','Lápiz o portaminas'],['goma','Goma'],['tinta','Rotulador calibrado o pluma'],['afilar','Sacapuntas o minas de repuesto']]],
 ['Para el color',[['caja','Caja de acuarelas o rotuladores'],['pinagua','Pincel de agua'],['pincel','Pincel redondo'],['agua','Agua para pintar y un vaso'],['trapo','Trapo o papel de cocina'],['pinzas','Pinzas o clips para el papel']]],
 ['Para estar a gusto',[['taburete','Taburete plegable'],['sol','Gorra y crema para el sol'],['beber','Agua para beber'],['movil','Móvil cargado']]]];
const VISTA_MATERIAL=(function(){
  const st=store.get('us-material-v1',{mios:[],quitados:[],llevo:[]});const guardarM=()=>store.set('us-material-v1',st);
  const todos=()=>[...MATERIAL.map(([g,l])=>[g,l.filter(([id])=>!st.quitados.includes(id))]),['Lo tuyo',st.mios.map(m=>[m.id,m.t])]].filter(([,l])=>l.length);
  return function(main){
    cabecera('material','Lista de material','Lo que llevas al salir a dibujar');
    const z=html(`<div class="cz"><div><div id="ma-lista"></div>
      <div class="caja" style="margin-top:12px"><h2 class="ch">Añadir algo</h2><div class="fila"><label for="ma-nuevo" class="sr">Qué quieres añadir</label><input type="text" id="ma-nuevo" maxlength="60" placeholder="Por ejemplo: lápices de colores" style="flex:1;min-width:160px"><button id="ma-anadir">Añadir</button></div></div></div>
      <div class="panel"><div class="caja"><h2 class="ch">Antes de salir</h2><p class="dato" id="ma-cuenta" role="status" aria-live="polite"></p>
        <div class="ops"><button id="ma-nueva">Desmarcar todo (nueva salida)</button><button id="ma-compartir">📤 Compartir la lista</button><button id="ma-restaurar">Recuperar lo que quité</button></div></div>
      <div class="caja"><h2 class="ch">Recordatorio en tu calendario</h2>
        <div class="fila"><label for="ma-dia">Día</label><input type="date" id="ma-dia" style="font:inherit;min-height:44px;border:1px solid var(--line);border-radius:10px;padding:6px 10px;background:var(--btn);color:var(--ink)"></div>
        <div class="fila"><label for="ma-hora">Hora de salida</label><input type="time" id="ma-hora" value="10:00" style="font:inherit;min-height:44px;border:1px solid var(--line);border-radius:10px;padding:6px 10px;background:var(--btn);color:var(--ink)"></div>
        <div class="fila"><label for="ma-sitio">Adónde</label><select id="ma-sitio"><option value="">Sin decidir</option>${SITIOS.map(s=>`<option value="${s.id}">${esc(s.t)}</option>`).join('')}</select></div>
        <div class="fila"><label for="ma-aviso">Avisar</label><select id="ma-aviso"><option value="30">30 minutos antes</option><option value="60" selected>1 hora antes</option><option value="720">La víspera (12 horas antes)</option></select></div>
        <div class="ops"><button class="prim" id="ma-ics">📅 Añadir al calendario</button></div>
        <p class="muted" id="ma-ics-msg" role="status" aria-live="polite" style="margin-top:8px">Se descarga un archivo de calendario (.ics) con el aviso y la lista: ábrelo y tu calendario lo guarda.</p></div></div></div>`);
    main.append(z);
    const man=new Date(Date.now()+86400000);$('#ma-dia').value=ymd(man);
    function pintarLista(){const c=$('#ma-lista');c.innerHTML='';
      for(const [g,l] of todos()){const caja=html(`<fieldset class="caja grupo-mat"><legend class="ch">${esc(g)}</legend></fieldset>`);
        for(const [id,t] of l)caja.append(html(`<div class="item-mat"><label><input type="checkbox" data-id="${id}" ${st.llevo.includes(id)?'checked':''}> <span>${esc(t)}</span></label><button class="quitar" data-quitar="${id}" aria-label="Quitar ${esc(t)} de la lista">✕</button></div>`));
        c.append(caja)}
      cuenta()}
    function cuenta(){const ids=todos().flatMap(([,l])=>l.map(([id])=>id)),n=ids.filter(i=>st.llevo.includes(i)).length;
      $('#ma-cuenta').textContent=n===ids.length&&n?'¡Lo llevas todo!':`Llevas ${n} de ${ids.length}.`}
    $('#ma-lista').addEventListener('change',e=>{const i=e.target.closest('[data-id]');if(!i)return;const id=i.dataset.id;st.llevo=st.llevo.filter(x=>x!==id);if(i.checked)st.llevo.push(id);guardarM();cuenta()});
    $('#ma-lista').addEventListener('click',e=>{const b=e.target.closest('[data-quitar]');if(!b)return;const id=b.dataset.quitar;
      if(st.mios.some(m=>m.id===id))st.mios=st.mios.filter(m=>m.id!==id);else st.quitados.push(id);st.llevo=st.llevo.filter(x=>x!==id);guardarM();pintarLista();anunciar('Quitado de la lista.');
      const p=$('#ma-anadir');if(p)p.focus()});
    const anadir=()=>{const t=$('#ma-nuevo').value.trim();if(!t)return;st.mios.push({id:'m'+Date.now().toString(36),t});guardarM();$('#ma-nuevo').value='';pintarLista();anunciar('Añadido: '+t)};
    $('#ma-anadir').onclick=anadir;$('#ma-nuevo').addEventListener('keydown',e=>{if(e.key==='Enter')anadir()});
    $('#ma-nueva').onclick=()=>{st.llevo=[];guardarM();pintarLista();anunciar('Lista desmarcada para una salida nueva.')};
    $('#ma-restaurar').onclick=()=>{st.quitados=[];guardarM();pintarLista();anunciar('Recuperado lo que habías quitado.')};
    const textoLista=()=>todos().map(([g,l])=>g+':\n'+l.map(([,t])=>'- '+t).join('\n')).join('\n\n');
    $('#ma-compartir').onclick=async()=>{const t='Para salir a dibujar\n\n'+textoLista();
      try{if(navigator.share){await navigator.share({title:'Lista de material',text:t});return}await navigator.clipboard.writeText(t);anunciar('Lista copiada.');$('#ma-cuenta').textContent='Lista copiada: pégala donde quieras.'}catch(e){}};
    $('#ma-ics').onclick=()=>{const d=$('#ma-dia').value,h=$('#ma-hora').value;if(!/^\d{4}-\d\d-\d\d$/.test(d)||!/^\d\d:\d\d$/.test(h)){$('#ma-ics-msg').textContent='Elige el día y la hora.';return}
      const s=SITIOS.find(x=>x.id===$('#ma-sitio').value),av=+$('#ma-aviso').value,ini=d.replace(/-/g,'')+'T'+h.replace(':','')+'00';
      const escI=t=>t.replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
      const sello=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
      const desc='Lleva:\n'+todos().flatMap(([,l])=>l.map(([,t])=>'- '+t)).join('\n')+(s?'\n\nReto: '+s.reto:'');
      const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//indalo-apps//Urban Sketching//ES','BEGIN:VEVENT','UID:us-'+Date.now()+'@indalo-apps.github.io','DTSTAMP:'+sello,
        'DTSTART:'+ini,'DURATION:PT2H','SUMMARY:'+escI('Salir a dibujar'+(s?': '+s.t:'')),s?'LOCATION:'+escI(s.q):'','DESCRIPTION:'+escI(desc),
        'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+escI('Prepara el material para dibujar'),'TRIGGER:-PT'+av+'M','END:VALARM','END:VEVENT','END:VCALENDAR'].filter(Boolean).join('\r\n');
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='salir-a-dibujar.ics';document.body.append(a);a.click();
      setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);$('#ma-ics-msg').textContent='Listo: abre el archivo «salir-a-dibujar.ics» para guardarlo en tu calendario.'};
    pintarLista()}
})();
