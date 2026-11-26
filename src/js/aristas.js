/* ===== Buscar las aristas en la foto (sin pantalla, para poder probarlo) =====
   1) Segmentos rectos: se agrupan píxeles de borde con la misma orientación del gradiente y se ajusta una recta
      a cada grupo (idea del detector LSD de Grompone von Gioi et al., muy simplificada).
   2) Puntos de fuga: entre los segmentos largos se prueban cortes de parejas y gana el punto hacia el que apuntan
      más metros de arista (RANSAC). Los segmentos casi verticales se apartan: en una esquina son las verticales.
   3) Para cada punto de fuga se eligen dos aristas largas y bien separadas: serán las rectas A1 y A2 (o B1 y B2).
   Entrada: datos RGBA (ImageData.data), ancho y alto; salida en píxeles de esa imagen. */
(function(raiz){
const RAD=Math.PI/180;
// Segmentos rectos de la imagen: [{p:[x,y],q:[x,y],l:longitud,a:ángulo 0..180}]
function segmentos(d,w,h,{minLong}={}){
  const N=w*h,g=new Float32Array(N);for(let i=0,j=0;i<N;i++,j+=4)g[i]=0.299*d[j]+0.587*d[j+1]+0.114*d[j+2];
  // suavizado 3×3 para quitar ruido de la compresión
  const s=new Float32Array(N);for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;
    s[i]=(4*g[i]+2*(g[i-1]+g[i+1]+g[i-w]+g[i+w])+g[i-w-1]+g[i-w+1]+g[i+w-1]+g[i+w+1])/16}
  const m=new Float32Array(N),ang=new Float32Array(N);let hist=new Uint32Array(256);
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;
    const gx=(s[i-w+1]+2*s[i+1]+s[i+w+1])-(s[i-w-1]+2*s[i-1]+s[i+w-1]),gy=(s[i+w-1]+2*s[i+w]+s[i+w+1])-(s[i-w-1]+2*s[i-w]+s[i-w+1]);
    const v=Math.hypot(gx,gy)/4;m[i]=v;hist[Math.min(255,v|0)]++;ang[i]=Math.atan2(gy,gx)}// dirección del gradiente (perpendicular a la arista)
  // umbral: el 15 % de píxeles con más contraste, y nunca por debajo de 8
  let acc=0,T=8;for(let k=255;k>=0;k--){acc+=hist[k];if(acc>N*0.15){T=Math.max(8,k);break}}
  // bordes finos (supresión de no máximos, como en Canny): un píxel por arista, así dos aristas juntas no se mezclan
  const fino=new Uint8Array(N);
  for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){const i=y*w+x,v=m[i];if(v<=T)continue;
    let a=ang[i];if(a<0)a+=Math.PI;const q=Math.round(a/(Math.PI/4))%4,o=q===0?1:q===1?w+1:q===2?w:w-1;
    if(v>=m[i+o]&&v>=m[i-o])fino[i]=1}
  const orden=[];for(let i=0;i<N;i++)if(fino[i]&&m[i]>T*1.5)orden.push(i);orden.sort((a,b)=>m[b]-m[a]);
  const usado=new Uint8Array(N),tol=22.5*RAD,out=[],cola=new Int32Array(N),minL=minLong||Math.max(18,Math.max(w,h)*0.035);
  const dif=(a,b)=>{let x=Math.abs(a-b)%(2*Math.PI);if(x>Math.PI)x=2*Math.PI-x;return Math.min(x,Math.PI-x)};// orientación de recta (sin sentido)
  for(const semilla of orden){if(usado[semilla])continue;
    let n=0,cab=0,cx=Math.cos(2*ang[semilla]),cy=Math.sin(2*ang[semilla]),ref=ang[semilla];cola[n++]=semilla;usado[semilla]=1;
    while(cab<n){const i=cola[cab++],x=i%w,y=(i-x)/w;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(xx<1||yy<1||xx>=w-1||yy>=h-1)continue;
        const k=yy*w+xx;if(usado[k]||!fino[k]||dif(ang[k],ref)>tol)continue;usado[k]=1;cola[n++]=k;
        cx+=Math.cos(2*ang[k]);cy+=Math.sin(2*ang[k]);ref=Math.atan2(cy,cx)/2}}
    if(n<minL*0.8)continue;
    // recta por mínimos cuadrados (componente principal), pesando por el contraste
    let sw=0,mx=0,my=0;for(let t=0;t<n;t++){const i=cola[t],x=i%w,y=(i-x)/w,p=m[i];sw+=p;mx+=p*x;my+=p*y}mx/=sw;my/=sw;
    let sxx=0,syy=0,sxy=0;for(let t=0;t<n;t++){const i=cola[t],x=i%w-mx,y=(i-i%w)/w-my,p=m[i];sxx+=p*x*x;syy+=p*y*y;sxy+=p*x*y}
    const tr=(sxx+syy)/sw,det=(sxx*syy-sxy*sxy)/(sw*sw),l1=tr/2+Math.sqrt(Math.max(0,tr*tr/4-det)),l2=tr-l1;
    const a=0.5*Math.atan2(2*sxy,sxx-syy),u=[Math.cos(a),Math.sin(a)];
    let t0=1e9,t1=-1e9;for(let t=0;t<n;t++){const i=cola[t],x=i%w,y=(i-x)/w,v=(x-mx)*u[0]+(y-my)*u[1];if(v<t0)t0=v;if(v>t1)t1=v}
    const L=t1-t0;if(L<minL||Math.sqrt(Math.max(l2,0))>1.2||n/L>2.2)continue;// largo, fino y sin manchas
    const P0=[mx+u[0]*t0,my+u[1]*t0],P1=[mx+u[0]*t1,my+u[1]*t1],borde=q=>q[0]<4||q[1]<4||q[0]>w-5||q[1]>h-5;if(borde(P0)&&borde(P1))continue;// el canto de la foto no es una arista
    let gA=a/RAD;if(gA<0)gA+=180;if(gA>=180)gA-=180;
    out.push({p:[mx+u[0]*t0,my+u[1]*t0],q:[mx+u[0]*t1,my+u[1]*t1],l:L,a:gA})}
  return out}
// ¿Apunta el segmento hacia el punto P? (ángulo entre el segmento y la recta de su centro a P, en grados)
function desvio(sg,P){const c=[(sg.p[0]+sg.q[0])/2,(sg.p[1]+sg.q[1])/2],d=[sg.q[0]-sg.p[0],sg.q[1]-sg.p[1]];
  let e=[P[0]-c[0],P[1]-c[1]];const le=Math.hypot(e[0],e[1]);if(le<sg.l*0.6)return 90;// el punto no puede caer encima del segmento
  const s=Math.abs(d[0]*e[1]-d[1]*e[0])/(sg.l*le);return Math.asin(Math.min(1,s))/RAD}
function corteSeg(a,b){const h=(p,q)=>[p[1]-q[1],q[0]-p[0],p[0]*q[1]-q[0]*p[1]],A=h(a.p,a.q),B=h(b.p,b.q);
  const x=A[1]*B[2]-A[2]*B[1],y=A[2]*B[0]-A[0]*B[2],z=A[0]*B[1]-A[1]*B[0];if(Math.abs(z)<1e-9)return null;return [x/z,y/z]}
// Puntos de fuga posibles para unos segmentos (RANSAC con parejas de los más largos), del más apoyado al menos.
// acepta(P) filtra candidatos; se devuelven hasta n puntos distintos entre sí.
function candidatosFuga(segs,{tol=1.5,acepta=()=>true,n=1,c=[0,0]}={}){
  const top=segs.slice().sort((a,b)=>b.l-a.l).slice(0,70),hs=[];
  for(let i=0;i<top.length;i++)for(let j=i+1;j<top.length;j++){
    if(Math.abs(((top[i].a-top[j].a+270)%180)-90)>88.5)continue;// casi paralelas: corte poco fiable
    const P=corteSeg(top[i],top[j]);if(!P||!isFinite(P[0])||!acepta(P))continue;
    let sc=0;for(const s of segs){const e=desvio(s,P);if(e<tol)sc+=s.l*(1-e/tol*0.5)}
    if(sc>0)hs.push({P,sc})}
  hs.sort((a,b)=>b.sc-a.sc);const dir=P=>Math.atan2(P[1]-c[1],P[0]-c[0]),out=[];
  for(const x of hs){if(out.some(o=>{let d=Math.abs(dir(o.P)-dir(x.P));d=Math.min(d,2*Math.PI-d);return d<2*RAD&&Math.abs(Math.log(Math.hypot(o.P[0]-c[0],o.P[1]-c[1])/Math.hypot(x.P[0]-c[0],x.P[1]-c[1])))<0.5}))continue;
    out.push(pulir(segs,x,tol,acepta));if(out.length>=n)break}
  return out}
function pulir(segs,x,tol,acepta){let inl=segs.filter(s=>desvio(s,x.P)<tol);
  // afinado: el punto que menos se aparta de todas las aristas que apuntan a él (pesando por largo)
  const P=afinar(inl,x.P);if(P&&acepta(P)){const i2=segs.filter(s=>desvio(s,P)<tol);if(i2.length>=inl.length*0.8)return {P,inl:i2,sc:i2.reduce((a,s)=>a+s.l,0)}}
  return {P:x.P,inl,sc:inl.reduce((a,s)=>a+s.l,0)}}
const mejorFuga=(segs,o)=>candidatosFuga(segs,Object.assign({n:1},o))[0]||null;
function afinar(segs,P0){let s11=0,s12=0,s22=0,t1=0,t2=0;
  for(const s of segs){let a=s.p[1]-s.q[1],b=s.q[0]-s.p[0];const l=Math.hypot(a,b)||1;a/=l;b/=l;const c=-(a*s.p[0]+b*s.p[1]),w=s.l;
    s11+=w*a*a;s12+=w*a*b;s22+=w*b*b;t1-=w*a*c;t2-=w*b*c}
  const det=s11*s22-s12*s12;if(Math.abs(det)<1e-6*s11*s22)return P0;return [(t1*s22-t2*s12)/det,(s11*t2-s12*t1)/det]}
// Dos aristas largas y bien separadas de una familia, para que su corte sea estable.
// Cada una se gira un pelo para que pase por el punto de fuga afinado con todas las aristas de la familia.
function dosRectas(inl,P){const o=inl.slice().sort((a,b)=>b.l-a.l).slice(0,30);if(o.length<2)return null;
  const largo=o[0].l;let mejor=null;
  for(let i=0;i<o.length;i++)for(let j=i+1;j<o.length;j++){const s1=o[i],s2=o[j];let da=Math.abs(s1.a-s2.a)%180;da=Math.min(da,180-da);
    const v=Math.min(s1.l,s2.l)/largo*Math.min(da,15)+(s1.l+s2.l)/largo*0.4;if(da>=1&&(!mejor||v>mejor.v))mejor={v,par:[s1,s2]}}
  if(!mejor)return null;
  return mejor.par.map(s=>{const c=[(s.p[0]+s.q[0])/2,(s.p[1]+s.q[1])/2];let d=[P[0]-c[0],P[1]-c[1]];const l=Math.hypot(d[0],d[1])||1;d=[d[0]/l,d[1]/l];
    const t=q=>(q[0]-c[0])*d[0]+(q[1]-c[1])*d[1],a=t(s.p),b=t(s.q);return [[c[0]+d[0]*a,c[1]+d[1]*a],[c[0]+d[0]*b,c[1]+d[1]*b]]})}
/* Ajuste completo según el modo (1 de frente, 2 esquina, 3 mirando arriba).
   Devuelve {A:[[p,q],[p,q]], B:…, V:…} con las familias que se han encontrado y la confianza de cada una. */
function buscar(d,w,h,modo){
  const segs=segmentos(d,w,h),c=[w/2,h/2],D=Math.max(w,h);
  const casiV=s=>Math.abs(s.a-90)<20,casiH=s=>s.a<4||s.a>176;
  const oblicuas=segs.filter(s=>!casiV(s)),res={segs:segs.length,conf:{}};
  const dentroCampo=P=>Math.abs(P[1]-c[1])<h*1.6&&Math.hypot(P[0]-c[0],P[1]-c[1])<D*14;
  const recta=s=>[s.p.map(v=>Math.round(v*10)/10),s.q.map(v=>Math.round(v*10)/10)];
  const familia=(f,v)=>{const two=v&&dosRectas(v.inl,v.P);if(!two)return false;res[f]=two.map(([p,q])=>recta({p,q}));res.conf[f]=v.sc/D;res['P'+f]=v.P;return true};
  if(modo===1){const v=mejorFuga(segs.filter(s=>!casiV(s)&&!casiH(s)),{acepta:P=>Math.abs(P[0]-c[0])<w*1.2&&Math.abs(P[1]-c[1])<h*1.2});familia('A',v);return res}
  // esquina: dos puntos de fuga, uno a cada lado del centro, y el horizonte que los une perpendicular a las verticales
  // de la foto (con el móvil derecho, las verticales salen verticales y el horizonte, horizontal).
  const vert=segs.filter(s=>Math.abs(s.a-90)<12);let inc=0,pv=0;for(const s of vert){inc+=(s.a-90)*s.l;pv+=s.l}
  const giro=pv>D*0.3?inc/pv:0,tolGiro=pv>D*0.3?4:8;// inclinación esperada del horizonte, en grados
  const bien=(P,Q)=>{let g=Math.atan2(Q[1]-P[1],Q[0]-P[0])/RAD;if(g>90)g-=180;if(g<-90)g+=180;return Math.abs(g-giro)<tolGiro};
  const c1=candidatosFuga(oblicuas,{acepta:dentroCampo,n:8,c});let par=null;
  for(const v1 of c1){const resto=oblicuas.filter(s=>desvio(s,v1.P)>=1.5);
    const v2=mejorFuga(resto,{acepta:P=>dentroCampo(P)&&Math.sign(P[0]-c[0])!==Math.sign(v1.P[0]-c[0])&&bien(v1.P,P),c});
    const sc=v1.sc+(v2?v2.sc:0)+(v2?Math.min(v1.sc,v2.sc):0);// premia que las dos fachadas tengan apoyo
    if(!par||sc>par.sc)par={sc,v1,v2}}
  if(!par)return res;const {v1,v2}=par;
  let [vA,vB]=v2&&v2.P[0]<v1.P[0]?[v2,v1]:[v1,v2];if(!v2&&v1.P[0]>c[0]){vB=v1;vA=null}
  familia('A',vA);familia('B',vB);
  if(modo===3){const vv=mejorFuga(segs.filter(s=>Math.abs(s.a-90)<30),{tol:1.2,acepta:P=>Math.abs(P[1]-c[1])>h*0.6});familia('V',vv)}
  return res}
const ARISTAS={segmentos,mejorFuga,candidatosFuga,desvio,buscar};
raiz.ARISTAS=ARISTAS;if(typeof module!=='undefined')module.exports=ARISTAS;
})(typeof window!=='undefined'?window:globalThis);
