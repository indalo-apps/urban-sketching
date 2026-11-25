/* ===== Etapa 2 · Encaje: puntos de fuga, horizonte, rejilla, cono de visión, personas y alturas =====
   Reglas de Bruno Mollière (La perspectiva en urban sketching), Pastrana (Simplifying Perspective, cap. 3, 4 y 8),
   Norling (Perspective Made Easy, pasos 1 a 9), D'Amelio (Perspective Drawing Handbook, cap. 5, 9 y 10). */
(function(){
const NOMBRE={A:'A',B:'B',V:'V'};
function porDefecto(p,modo){const w=p.w,h=p.h,P=(x,y)=>[x*w,y*h];
  if(modo===1)return {A:[[P(.08,.12),P(.38,.4)],[P(.92,.12),P(.62,.4)]],B:[],V:[]};
  const L={A:[[P(.46,.18),P(.12,.33)],[P(.46,.86),P(.12,.72)]],B:[[P(.54,.18),P(.88,.33)],[P(.54,.86),P(.88,.72)]],V:[]};// A: fachada izquierda (fuga a la izquierda); B: derecha
  if(modo===3)L.V=[[P(.3,.15),P(.32,.85)],[P(.7,.15),P(.68,.85)]];return L}
function familias(modo){return modo===1?['A']:modo===2?['A','B']:['A','B','V']}
// Otras fachadas (Brehm, «Multi-point perspective»): en calles irregulares cada fachada tiene su punto de fuga,
// y si sus horizontales lo son de verdad, ese punto está en el mismo horizonte. Basta una recta: se corta con él.
const EXTRA=['C','D','E'];
const todas=s=>familias(s.modo).concat(s.extra||[]);
// Cálculo de lo que sale de las rectas
function calcular(p){
  const s=p.pers,L=s.lineas,r={};
  r.A=GEOM.puntoFuga(L.A);r.B=s.modo>=2?GEOM.puntoFuga(L.B):null;r.V=s.modo===3?GEOM.puntoFuga(L.V):null;
  if(s.modo===1){if(r.A)r.h=[r.A,[r.A[0]+100,r.A[1]]]}
  else if(r.A&&r.B)r.h=[r.A,r.B];
  else if(r.A||r.B){const q=r.A||r.B;r.h=[q,[q[0]+100,q[1]]]}
  if(r.h){const g=GEOM.angulo(r.h[0],r.h[1]);r.inclin=g;if(r.h[0][0]>r.h[1][0])r.h=[r.h[1],r.h[0]]}
  if(s.modo>=2&&r.A&&r.B)r.cono=GEOM.cono(r.A,r.B,[p.w/2,p.h/2],60);
  for(const f of (s.extra||[])){const ls=L[f]||[];r[f]=ls.length>=2?GEOM.puntoFuga(ls):(ls.length===1&&r.h?GEOM.corte(ls[0],r.h):null)}
  return r}
// Dónde cae un punto respecto al dibujo encuadrado, en palabras (para pasarlo al cuaderno)
function dondeEn(P,eje){const [x0,y0,x1,y1]=rectEncuadre(),W=x1-x0,H=y1-y0;
  if(eje==='x'){const r=(P[0]-x0)/W;if(r<0)return `a ${fmt(-r,1)} anchos del dibujo a la izquierda del borde`;if(r>1)return `a ${fmt(r-1,1)} anchos del dibujo a la derecha del borde`;return `dentro del dibujo, al ${Math.round(r*100)} % desde la izquierda`}
  const r=(P[1]-y0)/H;if(r<0)return `a ${fmt(-r,1)} altos del dibujo por encima del borde`;if(r>1)return `a ${fmt(r-1,1)} altos del dibujo por debajo del borde`;return `dentro del dibujo, al ${Math.round((1-r)*100)} % desde abajo`}
// Altura del horizonte en el centro del dibujo, de 0 (abajo) a 1 (arriba)
function alturaHz(R){if(!R.h)return null;const [x0,y0,x1,y1]=rectEncuadre(),cx=(x0+x1)/2,d=GEOM.sub(R.h[1],R.h[0]),y=R.h[0][1]+d[1]/(d[0]||1e-9)*(cx-R.h[0][0]);return 1-(y-y0)/(y1-y0)}
/* Proporciones de una fachada (Stephanie Bower, «Proportions and measuring»: busca cuadrados).
   a: esquina de abajo de un lado; b: esquina de arriba del otro lado. Con dos puntos de fuga en ángulo recto
   se conoce la distancia del ojo (cono de visión) y se puede deshacer la perspectiva: la fachada se lleva a 3D
   con los rayos de cada esquina y se mide de verdad. De frente (1 punto), la foto ya da la proporción. */
const cr=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],dt=(u,v)=>u[0]*v[0]+u[1]*v[1]+u[2]*v[2],n3=u=>{const l=Math.hypot(...u)||1;return u.map(x=>x/l)};
// Puntos de fuga posibles para la fachada, empezando por la familia cuyas rectas están más cerca de lo tocado
function candidatos(s,R,a,b){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],dseg=(q,u,v)=>{const d=GEOM.sub(v,u),L=GEOM.dot(d,d)||1,t=Math.max(0,Math.min(1,GEOM.dot(GEOM.sub(q,u),d)/L));return GEOM.dist(q,GEOM.add(u,GEOM.mul(d,t)))};
  const cerca=f=>Math.min(...(s.lineas[f]||[]).map(l=>Math.min(dseg(m,l[0],l[1]),dseg(a,l[0],l[1]))),1e9);
  return ['A','B',...(s.extra||[])].filter(f=>R[f]).sort((x,y)=>cerca(x)-cerca(y))}
function proporcion(p,R,m){const s=p.pers,a=m.a,b=m.b;
  if(s.modo===1||!R.h){const W=Math.abs(b[0]-a[0]),H=Math.abs(b[1]-a[1]);if(W<3||H<3)return {error:'Toca dos esquinas opuestas de la fachada.'};
    const q=[a,[a[0],b[1]],b,[b[0],a[1]]];return {quad:q,ratio:W/H,frente:true,marcas:marcasPlanas(q,W/H)}}
  if(s.modo===3)return {error:'Con tres puntos de fuga (mirando hacia arriba) la app aún no mide proporciones.'};
  if(!R.cono||!R.cono.d)return {error:'Para medir proporciones de verdad hacen falta los puntos A y B de una misma esquina (las dos fachadas en ángulo recto).'};
  const cand=candidatos(s,R,a,b);if(!cand.length)return {error:'Faltan los puntos de fuga: coloca antes las rectas A y B.'};
  const f=cand.includes(m.vp)?m.vp:cand[0],V=R[f];
  const fb=GEOM.corte([a,V],[b,[b[0],b[1]+1]]),nt=GEOM.corte([b,V],[a,[a[0],a[1]+1]]);if(!fb||!nt)return {error:'No se puede medir esa fachada.'};
  const c=R.cono.cv,d=R.cono.d,ray=q=>[q[0]-c[0],q[1]-c[1],d];
  let dH=n3(ray(V));let dV=n3(cr(ray(R.A),ray(R.B)));if(dV[1]>0)dV=dV.map(x=>-x);
  const nP=cr(dH,dV),X1=ray(a),en=q=>{const r=ray(q),t=dt(nP,X1)/dt(nP,r);return r.map(x=>x*t)};
  const Xf=en(fb),Xt=en(nt);let W=dt(Xf.map((x,i)=>x-X1[i]),dH);const H=dt(Xt.map((x,i)=>x-X1[i]),dV);
  if(W<0){dH=dH.map(x=>-x);W=-W}if(H<=0)return {error:'Toca primero una esquina de abajo y después una de arriba.'};
  const pr=X=>[c[0]+d*X[0]/X[2],c[1]+d*X[1]/X[2]],P=(u,v)=>pr(X1.map((x,i)=>x+dH[i]*u+dV[i]*v)),marcas=[];
  if(W>=H)for(let k=1;k*H<W-1e-6&&k<=12;k++)marcas.push([P(k*H,0),P(k*H,H)]);else for(let k=1;k*W<H-1e-6&&k<=12;k++)marcas.push([P(0,k*W),P(W,k*W)]);
  return {quad:[a,nt,b,fb],ratio:W/H,vp:f,cand,marcas}}
function marcasPlanas(q,r){const [a,nt,b,fb]=q,out=[],W=fb[0]-a[0],H=nt[1]-a[1];
  if(r>=1)for(let k=1;k*Math.abs(H)<Math.abs(W)-1e-6&&k<=12;k++){const x=a[0]+Math.sign(W)*k*Math.abs(H);out.push([[x,a[1]],[x,b[1]]])}
  else for(let k=1;k*Math.abs(W)<Math.abs(H)-1e-6&&k<=12;k++){const y=a[1]+Math.sign(H)*k*Math.abs(W);out.push([[a[0],y],[b[0],y]])}return out}
// En palabras: cuántos cuadrados caben
function textoProporcion(r){const ancha=r>=1,v=ancha?r:1/r,n=Math.floor(v+1e-9),rem=v-n;
  const num=['','un','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce'][n]||String(n);
  let t=rem<0.1?(n===1?'un cuadrado':`${num} cuadrados`):rem<0.35?`${num} cuadrado${n>1?'s':''} y un cuarto`:rem<0.65?`${num} cuadrado${n>1?'s':''} y medio`:rem<0.9?`${num} cuadrado${n>1?'s':''} y tres cuartos`:`casi ${['','un','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece'][n+1]||n+1} cuadrados`;
  t=t.replace(/^un cuadrado y/,'un cuadrado y');
  return (ancha?`Ancho = ${fmt(v,2)} × alto: `:`Alto = ${fmt(v,2)} × ancho: `)+t+(ancha?' a lo ancho':' a lo alto')}
window.ENCAJE={calcular,dondeEn,alturaHz,familias,porDefecto,todas,proporcion,textoProporcion};
ETAPAS.encaje={pintar(cont){
  const p=US.p,s=p.pers;if(!s.lineas)s.lineas=porDefecto(p,s.modo);if(s.ojo==null)s.ojo=PREF.ojo;
  const {svg,barra,panel}=crearZona(cont);
  svg.setAttribute('aria-label','Foto con las rectas de perspectiva. Cada recta tiene dos puntos que se arrastran hasta apoyarla en una arista del edificio.');
  let sel=null,vista={cx:p.w/2,cy:p.h/2,k:1},medida0=null,lapiz0=null,prop0=null,R={};if(!s.lapiz)s.lapiz=[];if(!s.extra)s.extra=[];if(!s.props)s.props=[];
  // Medir con el lápiz (Brehm, «Pencil sighting»): ángulo con la horizontal y tamaño respecto a la primera raya
  function lapizTexto(m,i){const hz=R.h?GEOM.sub(R.h[1],R.h[0]):[1,0],d=GEOM.sub(m.b,m.a);let a=Math.abs((Math.atan2(d[1],d[0])-Math.atan2(hz[1],hz[0]))*180/Math.PI)%180;if(a>90)a=180-a;
    const ang=a<2?'horizontal':a>88?'vertical':fmt(a,0)+'° con la horizontal';if(i===0)return 'Medida 1 · '+ang;
    const r=GEOM.len(d)/GEOM.len(GEOM.sub(s.lapiz[0].b,s.lapiz[0].a));return '×'+fmt(r,r<10?1:0)+' · '+ang}
  const ojo=()=>s.ojo||PREF.ojo;
  function viewBox(){const W=p.w*vista.k,H=p.h*vista.k;svg.setAttribute('viewBox',`${vista.cx-W/2} ${vista.cy-H/2} ${W} ${H}`);return [vista.cx-W/2,vista.cy-H/2,vista.cx+W/2,vista.cy+H/2]}
  function verFugas(){const pts=[[0,0],[p.w,p.h]];for(const k of ['A','B','V',...(s.extra||[])])if(R[k])pts.push(R[k]);
    const lim=3;let x0=Math.min(...pts.map(q=>q[0])),x1=Math.max(...pts.map(q=>q[0])),y0=Math.min(...pts.map(q=>q[1])),y1=Math.max(...pts.map(q=>q[1]));
    x0=Math.max(x0,-p.w*lim);x1=Math.min(x1,p.w*(1+lim));y0=Math.max(y0,-p.h*lim);y1=Math.min(y1,p.h*(1+lim));
    const k=Math.max((x1-x0)/p.w,(y1-y0)/p.h)*1.12;vista={cx:(x0+x1)/2,cy:(y0+y1)/2,k:Math.max(1,k)}}
  function dibujar(){
    R=calcular(p);s.horizonte=R.h||null;s.vV=R.V||null;
    const vb=viewBox(),u=unidad(svg);svg.innerHTML='';
    const foto=[0,0,p.w,p.h],NS2={'vector-effect':'non-scaling-stroke'};
    el('rect',{x:vb[0],y:vb[1],width:vb[2]-vb[0],height:vb[3]-vb[1],fill:'#d8cfbf'},svg);
    el('image',{href:US.url,x:0,y:0,width:p.w,height:p.h,preserveAspectRatio:'none'},svg);
    const linea=(a,b,{dash='',ancho=2.5,halo=true,op=1,g=svg}={})=>{if(halo)el('line',Object.assign({x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#fff','stroke-width':ancho+2.5,opacity:.75*op,'stroke-linecap':'round'},NS2),g);
      el('line',Object.assign({x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#141210','stroke-width':ancho,'stroke-dasharray':dash,opacity:op},NS2),g)};
    const texto=(x,y,t,{tam=13,anchor='start',peso=700}={})=>{const n=el('text',{x,y,'font-size':tam*u,'font-weight':peso,'text-anchor':anchor,fill:'#141210',stroke:'#fff','stroke-width':3.5*u,'paint-order':'stroke','font-family':'Inter,system-ui,sans-serif'},svg);n.textContent=t;return n};
    // encuadre
    const [ex0,ey0,ex1,ey1]=rectEncuadre();el('rect',Object.assign({x:ex0,y:ey0,width:ex1-ex0,height:ey1-ey0,fill:'none',stroke:'#fff','stroke-width':1.5,'stroke-dasharray':'4 6',opacity:.9},NS2),svg);
    // rejilla
    if(s.rejilla&&R.h){const g=el('g',{},svg),n=s.densidad||10;
      const ray=(P,fam)=>{for(const [a,b] of GEOM.rayos(P,foto,n)){const sg=GEOM.recortar(a,b,foto);if(sg)linea(sg[0],sg[1],{dash:TRAZO[fam],ancho:1,op:.75,g})}};
      if(R.A)ray(R.A,'A');if(R.B)ray(R.B,'B');
      if(s.modo===3&&R.V)ray(R.V,'V');else for(let i=1;i<n;i++){const x=p.w*i/n;linea([x,0],[x,p.h],{dash:'2 5',ancho:1,op:.6,g})}
      if(s.modo===1)for(let i=1;i<n;i++){const y=p.h*i/n;linea([0,y],[p.w,y],{ancho:1,op:.45,g})}}
    // regla de las alturas (Mollière, regla 1)
    const estrecho=svg.getBoundingClientRect().width<560;
    if(s.regla&&R.h&&!estrecho){const hx=Math.max(vb[0],0)+12*u,yh=y=>R.h[0][1]+(R.h[1][1]-R.h[0][1])*(y-R.h[0][0])/((R.h[1][0]-R.h[0][0])||1);
      const y=yh(hx);texto(hx,y-58*u,'Por encima del horizonte, las horizontales');texto(hx,y-42*u,'BAJAN hacia el punto de fuga');
      texto(hx,y+48*u,'Por debajo, SUBEN hacia él.');texto(hx,y+64*u,'A la altura de tus ojos van planas.',{peso:500})}
    // horizonte
    if(s.h0){linea(s.h0[0],s.h0[1],{dash:'2 4',ancho:1.5,op:.9});}
    if(R.h){const d=GEOM.norm(GEOM.sub(R.h[1],R.h[0])),L=1e5;linea(GEOM.add(R.h[0],GEOM.mul(d,-L)),GEOM.add(R.h[0],GEOM.mul(d,L)),{dash:'18 6',ancho:3});
      const lx=Math.max(vb[0],0)+(Math.min(vb[2],p.w)-Math.max(vb[0],0))*0.36,ly=R.h[0][1]+d[1]/(d[0]||1)*(lx-R.h[0][0]);texto(lx,ly-8*u,estrecho?'HORIZONTE':'HORIZONTE · altura de tus ojos',{tam:12})}
    // cono de visión
    if(s.cono&&R.cono&&R.cono.r){el('circle',Object.assign({cx:R.cono.cv[0],cy:R.cono.cv[1],r:R.cono.r,fill:'none',stroke:'#fff','stroke-width':4,opacity:.7},NS2),svg);
      el('circle',Object.assign({cx:R.cono.cv[0],cy:R.cono.cv[1],r:R.cono.r,fill:'none',stroke:'#141210','stroke-width':2,'stroke-dasharray':'3 3 12 3'},NS2),svg);
      if(!estrecho)texto(R.cono.cv[0],R.cono.cv[1]-R.cono.r-6*u,'Cono de visión de 60°',{anchor:'middle',tam:12})}
    // personas y medidas
    for(const b of s.personas){const t=R.h&&GEOM.cimaDe(b,1.7,R.h,ojo(),R.V);if(!t)continue;
      const g=html(`<svg xmlns="${NS}">${ESCENA.siluetaSVG(b,t,'')}</svg>`).firstElementChild;g.setAttribute('fill','#141210');g.setAttribute('stroke','#fff');g.setAttribute('stroke-width',1.5*u);svg.append(g)}
    for(const m of s.medidas){linea(m.base,m.cima,{ancho:2.5});const a=R.h&&GEOM.altura(m.base,m.cima,R.h,ojo(),R.V);
      texto(m.cima[0]+8*u,(m.base[1]+m.cima[1])/2,a!=null&&a>0?fmt(a,a<10?2:1)+' m':'?')}
    (s.props||[]).forEach((m,i)=>{const r=proporcion(p,R,m);if(r.error){texto(m.a[0]+8*u,m.a[1]-8*u,'?',{tam:14});return}
      const q=r.quad;for(let k=0;k<4;k++)linea(q[k],q[(k+1)%4],{ancho:3.4});linea(q[0],q[2],{ancho:1.2,dash:'6 5'});linea(q[1],q[3],{ancho:1.2,dash:'6 5'});
      for(const [u1,u2] of r.marcas)linea(u1,u2,{ancho:2,dash:'10 5'});
      const cx=(q[0][0]+q[2][0])/2;texto(Math.min(q[0][0],q[2][0])+6*u,Math.min(q[1][1],q[2][1])-8*u,(i+1)+' · '+fmt(Math.max(r.ratio,1/r.ratio),2)+(r.ratio>=1?' : 1':' de alto'),{tam:13})});
    if(prop0){el('rect',{x:prop0[0]-6*u,y:prop0[1]-6*u,width:12*u,height:12*u,fill:'#fff',stroke:'#141210','stroke-width':2.5*u},svg);texto(prop0[0]+10*u,prop0[1],'Ahora la esquina de arriba del otro lado')}
    (s.lapiz||[]).forEach((m,i)=>{linea(m.a,m.b,{ancho:3,dash:'1 5'});for(const q of [m.a,m.b])el('rect',{x:q[0]-4*u,y:q[1]-4*u,width:8*u,height:8*u,fill:'#fff',stroke:'#141210','stroke-width':2*u},svg);
      const t=lapizTexto(m,i);texto((m.a[0]+m.b[0])/2+8*u,(m.a[1]+m.b[1])/2-8*u,t,{tam:12})});
    if(lapiz0){el('rect',{x:lapiz0[0]-5*u,y:lapiz0[1]-5*u,width:10*u,height:10*u,fill:'#141210',stroke:'#fff','stroke-width':2*u},svg);texto(lapiz0[0]+10*u,lapiz0[1],'Ahora toca el otro extremo')}
    if(medida0){el('circle',{cx:medida0[0],cy:medida0[1],r:6*u,fill:'#141210',stroke:'#fff','stroke-width':2*u},svg);texto(medida0[0]+10*u,medida0[1],'Ahora toca la parte de arriba')}
    // rectas de cada familia, con su prolongación hasta el punto de fuga
    const fams=todas(s),activa=s.herramienta==='rectas';
    for(const f of fams)s.lineas[f].forEach((ln,i)=>{const P=R[f];
      if(P){const lejos=GEOM.dist(ln[0],P)>GEOM.dist(ln[1],P)?ln[0]:ln[1];linea(lejos,P,{dash:TRAZO[f]||'',ancho:1.3,op:.9})}
      linea(ln[0],ln[1],{dash:TRAZO[f],ancho:3.2});
      const m=[(ln[0][0]+ln[1][0])/2,(ln[0][1]+ln[1][1])/2];texto(m[0]+6*u,m[1]-6*u,(NOMBRE[f]||f)+(i+1),{tam:estrecho?12:14});
      if(activa)ln.forEach((q,j)=>{const id=`${f}:${i}:${j}`,on=sel===id;
        const g=el('g',{'data-asa':id,tabindex:0,role:'button','aria-label':`Recta ${NOMBRE[f]||f}${i+1}, punto ${j+1}`,style:'cursor:grab'},svg);
        el('circle',{cx:q[0],cy:q[1],r:22*u,fill:'transparent'},g);
        el('circle',Object.assign({cx:q[0],cy:q[1],r:(on?11:8)*u,fill:on?'#141210':'#fff',stroke:on?'#fff':'#141210','stroke-width':on?3:2},NS2),g);
        if(f==='B')el('rect',{x:q[0]-2.5*u,y:q[1]-2.5*u,width:5*u,height:5*u,fill:on?'#fff':'#141210'},g);
        if(f==='V')el('path',{d:`M${q[0]-3*u} ${q[1]+2.5*u}L${q[0]} ${q[1]-3*u}L${q[0]+3*u} ${q[1]+2.5*u}Z`,fill:on?'#fff':'#141210'},g);
        if(EXTRA.includes(f)){const t=el('text',{x:q[0],y:q[1]+3.5*u,'font-size':9*u,'font-weight':700,'text-anchor':'middle',fill:on?'#fff':'#141210','font-family':'Inter,system-ui,sans-serif'},g);t.textContent=f}})});
    // puntos de fuga: dentro de la vista, un círculo con su letra; fuera, una flecha en el borde
    for(const f of ['A','B','V',...(s.extra||[])]){const P=R[f];if(!P)continue;
      const dentro=P[0]>vb[0]&&P[0]<vb[2]&&P[1]>vb[1]&&P[1]<vb[3];
      if(dentro){el('circle',{cx:P[0],cy:P[1],r:13*u,fill:'#fff',stroke:'#141210','stroke-width':2.5*u},svg);texto(P[0],P[1]+4.5*u,f,{anchor:'middle',tam:13})}
      else{const c=[(vb[0]+vb[2])/2,(vb[1]+vb[3])/2],sg=GEOM.recortar(c,P,[vb[0]+24*u,vb[1]+24*u,vb[2]-24*u,vb[3]-24*u]);if(!sg)continue;const q=sg[1],d=GEOM.norm(GEOM.sub(P,c));
        const ang=Math.atan2(d[1],d[0])*180/Math.PI;const g=el('g',{transform:`translate(${q[0]} ${q[1]}) rotate(${ang})`},svg);
        el('path',{d:`M${-16*u} ${-9*u}L0 0L${-16*u} ${9*u}Z`,fill:'#141210',stroke:'#fff','stroke-width':2*u},g);
        texto(q[0]-d[0]*30*u,q[1]-d[1]*30*u+4*u,f+' fuera',{anchor:'middle',tam:12})}}
    actualizarInfo()}
  // ---- arrastres y toques ----
  function mover(id,pos,delta){const [f,i,j]=id.split(':'),ln=s.lineas[f][+i];if(!ln)return;
    const q=pos||[ln[+j][0]+delta[0],ln[+j][1]+delta[1]];ln[+j]=[Math.round(q[0]*10)/10,Math.round(q[1]*10)/10];dibujar()}
  function tocar(pt){
    if(s.herramienta==='personas'){if(!R.h){anunciar('Primero coloca las rectas para tener el horizonte.');return}
      if(GEOM.ladoHorizonte(pt,R.h)<=0){anunciar('Las personas tienen que estar de pie en el suelo, por debajo del horizonte.');return}
      s.personas.push([pt[0],pt[1]]);guardar();dibujar();anunciar('Persona colocada: sus pies donde has tocado y su cabeza cerca del horizonte.')}
    else if(s.herramienta==='proporcion'){if(!prop0){prop0=pt;dibujar();anunciar('Esquina de abajo marcada. Ahora toca la esquina de arriba del otro lado de la fachada.')}
      else{const m={a:prop0,b:pt};prop0=null;const r=proporcion(p,R,m);if(r.error){dibujar();anunciar(r.error);return}m.vp=r.vp;s.props.push(m);guardar();dibujar();pintarProp();anunciar(textoProporcion(r.ratio)+'.')}}
    else if(s.herramienta==='lapiz'){if(!lapiz0){lapiz0=pt;dibujar();anunciar('Primer extremo marcado. Toca el otro.')}
      else{s.lapiz.push({a:lapiz0,b:pt});lapiz0=null;guardar();dibujar();anunciar(lapizTexto(s.lapiz[s.lapiz.length-1],s.lapiz.length-1).replace('×','mide ').replace(' · ',' veces la medida 1, '))}}
    else if(s.herramienta==='medir'){if(!R.h){anunciar('Primero coloca las rectas para tener el horizonte.');return}
      if(!medida0){medida0=pt;dibujar();anunciar('Pie marcado. Ahora toca la parte de arriba.')}
      else{s.medidas.push({base:medida0,cima:pt});medida0=null;guardar();dibujar();const m=s.medidas[s.medidas.length-1],a=GEOM.altura(m.base,m.cima,R.h,ojo(),R.V);anunciar(a?'Mide unos '+fmt(a,2)+' metros.':'No se puede medir ahí.')}}}
  arrastres(svg,{mover,tocar,soltar:()=>{guardar();anunciar(resumenTexto())},seleccionar:id=>{sel=id;dibujar()}});
  // ---- barra bajo el dibujo ----
  barra.append(html(`<button id="ej-foto">⛶ La foto</button>`),html(`<button id="ej-fugas">Ver los puntos de fuga</button>`),html(`<button id="ej-menos" aria-label="Alejar">➖</button>`),html(`<button id="ej-mas" aria-label="Acercar">➕</button>`));
  $('#ej-foto').onclick=()=>{vista={cx:p.w/2,cy:p.h/2,k:1};dibujar()};$('#ej-fugas').onclick=()=>{verFugas();dibujar()};
  $('#ej-menos').onclick=()=>{vista.k=Math.min(8,vista.k*1.5);dibujar()};$('#ej-mas').onclick=()=>{vista.k=Math.max(0.35,vista.k/1.5);dibujar()};
  svg.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();vista.k=Math.min(8,Math.max(0.35,vista.k*(e.deltaY>0?1.15:1/1.15)));dibujar()},{passive:false});
  // ---- textos ----
  const donde=dondeEn,alturaHorizonte=()=>alturaHz(R);
  function resumenTexto(){if(!R.h)return 'Las rectas no se cortan: muévelas hasta que se apoyen en aristas que sean paralelas en la realidad.';
    const a=alturaHorizonte();return `Horizonte ${a<0?'por debajo del dibujo':a>1?'por encima del dibujo':'al '+Math.round(a*100)+' % de la altura, desde abajo'}.`+(R.A?' Punto A '+donde(R.A,'x')+'.':'')+(R.B?' Punto B '+donde(R.B,'x')+'.':'')}
  function actualizarInfo(){const t=$('#ej-cuaderno');if(!t)return;
    if(!R.h){t.innerHTML='<p>Las rectas de una misma letra no se cortan todavía. Muévelas hasta que cada una se apoye en una arista del edificio: las de A, en aristas que en la realidad son paralelas entre sí (el alero y el zócalo de una fachada).</p>';return}
    const a=alturaHorizonte();let s1=`<ul class="lista">`;
    s1+=`<li><b>Horizonte:</b>&nbsp;${a<0?'por debajo del dibujo':a>1?'por encima del dibujo':'al '+Math.round(a*100)+' % de la altura, contando desde abajo'}.</li>`;
    if(Math.abs(R.inclin)>2)s1+=`<li>El horizonte sale torcido ${fmt(Math.abs(R.inclin),0)}°: la foto se hizo con el móvil inclinado. En el papel, dibújalo recto.</li>`;
    if(R.A)s1+=`<li><b>Punto A:</b>&nbsp;${donde(R.A,'x')}.</li>`;else s1+=`<li>Las rectas A salen paralelas: su punto de fuga está muy lejos.</li>`;
    if(s.modo>=2){if(R.B)s1+=`<li><b>Punto B:</b>&nbsp;${donde(R.B,'x')}.</li>`;else s1+=`<li>Las rectas B salen paralelas: su punto de fuga está muy lejos.</li>`}
    if(s.modo===3){if(R.V)s1+=`<li><b>Punto V (verticales):</b>&nbsp;${donde(R.V,'y')}.</li>`;else s1+=`<li>Las verticales salen paralelas: no hace falta tercer punto.</li>`}
    for(const f of s.extra){s1+=R[f]?`<li><b>Punto ${f} (otra fachada):</b>&nbsp;${donde(R[f],'x')}.</li>`:`<li>La recta ${f} sale paralela al horizonte: esa fachada se ve de frente y no fuga.</li>`}
    t.innerHTML=s1+'</ul>';
    const c=$('#ej-cono');if(!c)return;
    if(s.modo===1||!R.cono){c.innerHTML='<p class="muted">El cono de visión se calcula con dos puntos de fuga de caras en ángulo recto (una esquina).</p>';return}
    if(!R.cono.r){c.innerHTML='<p>Con estos dos puntos de fuga el centro de la foto no queda entre ellos: revisa que A y B sean dos caras de una misma esquina, en ángulo recto.</p>';return}
    const ang=GEOM.anguloFoto(p.w,p.h,R.cono.d),sep=GEOM.dist(R.A,R.B)/p.w;
    c.innerHTML=`<p>La foto abarca unos <span class="dato">${fmt(ang,0)}°</span> en diagonal.${ang>70?' Es más que los 60° que vemos con nitidez: los bordes salen estirados, como con un gran angular. Al dibujar, no copies esa deformación.':' Está dentro de lo que vemos con nitidez.'}</p>
      <p>Los puntos de fuga están a <span class="dato">${fmt(sep,1)}</span> anchos de foto uno del otro. ${sep<1.6?'Están muy juntos: en tu cuaderno sepáralos más, aunque se salgan del papel (Norling lo llama «el error de juntar los puntos»).':'Es una separación cómoda: el edificio no se deforma.'}</p>`}
  // ---- lista de proporciones medidas ----
  function pintarProp(){const z=$('#ej-prop');if(!z)return;if(!s.props.length){z.innerHTML='';return}
    z.innerHTML='<ul class="lista" style="margin-top:8px">'+s.props.map((m,i)=>{const r=proporcion(p,R,m);return `<li><b>Fachada ${i+1}:</b> ${r.error?esc(r.error):esc(textoProporcion(r.ratio))+(r.frente?' (vista de frente)':'')}${r.cand&&r.cand.length>1?` <button data-otrovp="${i}" style="min-height:44px">Usar el punto ${r.cand[(r.cand.indexOf(r.vp)+1)%r.cand.length]}</button>`:''}</li>`}).join('')+'</ul>';
    z.querySelectorAll('[data-otrovp]').forEach(b=>b.onclick=()=>{const m=s.props[+b.dataset.otrovp],r=proporcion(p,R,m);m.vp=r.cand[(r.cand.indexOf(r.vp)+1)%r.cand.length];guardar();dibujar();pintarProp()})}
  // ---- panel ----
  function pintarPanel(){panel.innerHTML='';
    const c1=html(`<div class="caja"><h2 class="ch">Puntos de fuga</h2><div class="ops" role="group" aria-label="Tipo de perspectiva">
      <button data-modo="1" aria-pressed="${s.modo===1}">1 · De frente</button><button data-modo="2" aria-pressed="${s.modo===2}">2 · Esquina</button><button data-modo="3" aria-pressed="${s.modo===3}">3 · Mirando arriba</button></div>
      <p class="muted" style="margin-top:8px">${s.modo===1?'Una calle o una fachada vista de frente: las líneas que se alejan van a un solo punto.':s.modo===2?'Un edificio en esquina: cada fachada tiene su punto de fuga, A y B, los dos en el horizonte. Las verticales siguen verticales.':'Una torre vista desde abajo (o desde arriba): las verticales también fugan, hacia el punto V.'}</p>
      <ul class="leyenda">${todas(s).map(f=>`<li><svg width="46" height="14" aria-hidden="true"><line x1="2" y1="7" x2="44" y2="7" stroke="currentColor" stroke-width="3" stroke-dasharray="${TRAZO[f]}"/></svg><span><b>${f}</b> · ${f==='A'?(s.modo===1?'líneas que se alejan':'fachada de la izquierda'):f==='B'?'fachada de la derecha':f==='V'?'verticales':'otra fachada'} (${f==='A'?'trazo continuo, puntos redondos':f==='B'?'trazo a rayas, puntos con un cuadrado':f==='V'?'trazo de puntos, puntos con un triángulo':'trazo propio, puntos con su letra'})</span></li>`).join('')}</ul>
      <div class="ops" style="margin-top:8px">${familias(s.modo).map(f=>`<button data-mas="${f}">Otra recta ${f}</button>`).join('')}<button data-quitar="1">Quitar la última añadida</button></div>
      <p class="muted" style="margin-top:8px">Con más de dos rectas por letra, el punto de fuga es el que mejor encaja con todas.</p>
      <div class="ops" style="margin-top:8px">${s.extra.length<EXTRA.length?`<button data-fachada="1">Otra fachada (${EXTRA[s.extra.length]})</button>`:''}${s.extra.length?`<button data-sinfachada="1">Quitar la fachada ${s.extra[s.extra.length-1]}</button>`:''}</div>
      <p class="muted" style="margin-top:8px">En las calles torcidas cada fachada tiene su punto de fuga, y todos están en el mismo horizonte (Brehm). Para otra fachada basta una recta en su alero o su zócalo: la app la prolonga hasta el horizonte.</p></div>`);
    c1.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;
      if(b.dataset.modo){const m=+b.dataset.modo;if(m===s.modo)return;s.modo=m;const d=porDefecto(p,m);for(const f of ['A','B','V'])if(!s.lineas[f]||s.lineas[f].length<2||!familias(m).includes(f))s.lineas[f]=d[f];
        if(m===1)s.lineas.A=d.A;guardar();pintarPanel();dibujar();anunciar(b.textContent)}
      if(b.dataset.mas){const f=b.dataset.mas,l=s.lineas[f],a=l[l.length-1];l.push([[a[0][0],a[0][1]+p.h*0.08],[a[1][0],a[1][1]+p.h*0.08]]);s.ultima=(s.ultima||[]).concat(f);guardar();dibujar();anunciar('Recta '+f+(l.length)+' añadida.')}
      if(b.dataset.fachada){const f=EXTRA[s.extra.length];if(!f)return;s.extra.push(f);s.lineas[f]=[[[p.w*.56,p.h*.64],[p.w*.8,p.h*.68]]];sel=f+':0:0';guardar();pintarPanel();dibujar();anunciar('Fachada '+f+' añadida: mueve su recta hasta el alero o el zócalo de esa fachada.')}
      if(b.dataset.sinfachada){const f=s.extra.pop();delete s.lineas[f];s.ultima=(s.ultima||[]).filter(x=>x!==f);guardar();pintarPanel();dibujar();anunciar('Fachada '+f+' quitada.')}
      if(b.dataset.quitar){const f=(s.ultima||[]).pop();if(!f||s.lineas[f].length<=2){anunciar('Cada letra necesita al menos dos rectas.');return}s.lineas[f].pop();guardar();dibujar()}});
    const c2=html(`<div class="caja"><h2 class="ch">Pásalo a tu cuaderno</h2><div id="ej-cuaderno" aria-live="polite"></div></div>`);
    const c3=html(`<div class="caja"><h2 class="ch">Ver</h2><div class="ops" role="group" aria-label="Qué se ve sobre la foto">
      <button data-ver="rejilla" aria-pressed="${!!s.rejilla}">▦ Rejilla</button><button data-ver="regla" aria-pressed="${!!s.regla}">Regla de las alturas</button><button data-ver="cono" aria-pressed="${!!s.cono}">Cono de 60°</button></div>
      <div class="fila" style="margin-top:6px"><label for="ej-dens">Líneas de la rejilla</label><input type="range" id="ej-dens" min="4" max="24" step="1" value="${s.densidad||10}"></div>
      <div id="ej-cono" style="margin-top:6px"></div></div>`);
    c3.addEventListener('click',ev=>{const b=ev.target.closest('[data-ver]');if(!b)return;s[b.dataset.ver]=!s[b.dataset.ver];b.setAttribute('aria-pressed',s[b.dataset.ver]);guardar();dibujar()});
    c3.querySelector('#ej-dens').oninput=ev=>{s.densidad=+ev.target.value;guardar();dibujar()};
    const c4=html(`<div class="caja"><h2 class="ch">Personas y medidas</h2><div class="ops" role="group" aria-label="Qué hace un toque en la foto">
      <button data-herr="rectas" aria-pressed="${s.herramienta==='rectas'}">✋ Mover rectas</button><button data-herr="personas" aria-pressed="${s.herramienta==='personas'}">🧍 Poner personas</button><button data-herr="medir" aria-pressed="${s.herramienta==='medir'}">📏 Medir alturas</button><button data-herr="lapiz" aria-pressed="${s.herramienta==='lapiz'}">✏ Medir con el lápiz</button><button data-herr="proporcion" aria-pressed="${s.herramienta==='proporcion'}">▦ Proporciones</button></div><div id="ej-prop" aria-live="polite"></div>
      <p class="muted" style="margin-top:8px">${s.herramienta==='personas'?'Toca en el suelo donde está de pie una persona: la app la dibuja con 1,70 m. Si estabas de pie, su cabeza queda cerca del horizonte, esté cerca o lejos.':s.herramienta==='medir'?'Toca el pie de algo que esté en el suelo (una puerta, una farola) y después su parte de arriba. La altura sale de la del horizonte, que está a la altura de tus ojos.':s.herramienta==='proporcion'?'Como Stephanie Bower: busca cuadrados. Toca la esquina de abajo de un lado de una fachada y luego la de arriba del otro lado. La app deshace la perspectiva, mide la fachada de verdad y dibuja los cuadrados que caben y sus diagonales, que marcan el centro.':s.herramienta==='lapiz'?'Como el lápiz con el pulgar (Brehm): toca los dos extremos de algo. La primera raya es la medida 1; las siguientes dicen cuántas veces la miden y qué ángulo forman con la horizontal (un alero, una cuesta).':'Arrastra los puntos de las rectas, o elige uno y usa las flechas.'}</p>
      <div class="fila"><label for="ej-ojo">Altura de tus ojos al hacer la foto (m)</label><input type="number" id="ej-ojo" min="0.3" max="60" step="0.01" value="${ojo()}" style="width:96px" inputmode="decimal"></div>
      <div class="ops"><button data-ojo="${PREF.ojo}">De pie</button><button data-ojo="1.15">Sentado</button><button data-borrar="1">Quitar personas y medidas</button></div></div>`);
    c4.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;
      if(b.dataset.herr){s.herramienta=b.dataset.herr;medida0=null;lapiz0=null;prop0=null;sel=null;guardar();pintarPanel();dibujar()}
      if(b.dataset.ojo){s.ojo=+b.dataset.ojo;c4.querySelector('#ej-ojo').value=s.ojo;guardar();dibujar()}
      if(b.dataset.borrar){s.personas=[];s.medidas=[];s.lapiz=[];s.props=[];prop0=null;medida0=null;lapiz0=null;guardar();dibujar();anunciar('Personas y medidas quitadas.')}});
    c4.querySelector('#ej-ojo').onchange=ev=>{const v=parseFloat(String(ev.target.value).replace(',','.'));if(v>0){s.ojo=v;guardar();dibujar()}};
    panel.append(c1,c2,c4,c3);pintarProp();
    if(s.herramienta==='rectas'){const pad=html('<div class="caja"></div>');padMover(pad,d=>{if(sel)mover(sel,null,d);else anunciar('Elige antes un punto tocándolo.')},'Mover el punto elegido:');panel.append(pad)}
    if(s.h0)panel.append(html('<p class="nota">La línea de puntitos finos es el horizonte que midió el móvil al hacer la foto en «Al natural». Tu horizonte debería quedar cerca.</p>'));
    panel.append(html(`<p class="nota"><b>Regla de Mollière:</b> desde la arista más cercana, las horizontales suben o bajan según estén por debajo o por encima de tu horizonte. Según él, ahí está el 80 % de la perspectiva.</p>`));
    panel.append(botonSiguiente('encaje'));actualizarInfo()}
  pintarPanel();dibujar();
  const ro=new ResizeObserver(()=>dibujar());ro.observe(svg);limpiar=()=>ro.disconnect();
}};
})();
