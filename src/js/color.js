/* ===== Cálculos de color (sin pantalla, para poder probarlos) =====
   Colores en sRGB (0–255), CIELAB (D65) y reflectancia por canal para las mezclas de acuarela. */
(function(raiz){
const hexRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const rgbHex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const lin=v=>{v/=255;return v>0.04045?Math.pow((v+0.055)/1.055,2.4):v/12.92};
const gam=v=>{v=Math.max(0,Math.min(1,v));return 255*(v>0.0031308?1.055*Math.pow(v,1/2.4)-0.055:12.92*v)};
function rgbLab(c){const [r,g,b]=c.map(lin);
  const f=t=>t>0.008856?Math.cbrt(t):7.787*t+16/116;
  const x=f((r*0.4124+g*0.3576+b*0.1805)/0.95047),y=f(r*0.2126+g*0.7152+b*0.0722),z=f((r*0.0193+g*0.1192+b*0.9505)/1.08883);
  return [116*y-16,500*(x-y),200*(y-z)]}
function labRgb(L){const fy=(L[0]+16)/116,fx=fy+L[1]/500,fz=fy-L[2]/200;
  const fi=t=>t*t*t>0.008856?t*t*t:(t-16/116)/7.787;
  const x=fi(fx)*0.95047,y=fi(fy),z=fi(fz)*1.08883;
  return [gam(3.2406*x-1.5372*y-0.4986*z),gam(-0.9689*x+1.8758*y+0.0415*z),gam(0.0557*x-0.2040*y+1.0570*z)]}
const labHex=L=>rgbHex(labRgb(L)),hexLab=h=>rgbLab(hexRgb(h));
const lch=L=>{let h=Math.atan2(L[2],L[1])*180/Math.PI;if(h<0)h+=360;return [L[0],Math.hypot(L[1],L[2]),h]};
// Diferencia de color CIEDE2000 (Sharma, Wu y Dalal, 2005)
function dE(l1,l2){
  const [L1,a1,b1]=l1,[L2,a2,b2]=l2,rad=Math.PI/180;
  const C1=Math.hypot(a1,b1),C2=Math.hypot(a2,b2),Cm=(C1+C2)/2,G=0.5*(1-Math.sqrt(Math.pow(Cm,7)/(Math.pow(Cm,7)+Math.pow(25,7))));
  const a1p=(1+G)*a1,a2p=(1+G)*a2,C1p=Math.hypot(a1p,b1),C2p=Math.hypot(a2p,b2);
  const hp=(a,b)=>{if(a===0&&b===0)return 0;let h=Math.atan2(b,a)/rad;return h<0?h+360:h};
  const h1p=hp(a1p,b1),h2p=hp(a2p,b2),dL=L2-L1,dC=C2p-C1p;
  let dh=0;if(C1p*C2p!==0){dh=h2p-h1p;if(dh>180)dh-=360;else if(dh<-180)dh+=360}
  const dH=2*Math.sqrt(C1p*C2p)*Math.sin(dh/2*rad),Lm=(L1+L2)/2,Cmp=(C1p+C2p)/2;
  let hm=h1p+h2p;if(C1p*C2p!==0){if(Math.abs(h1p-h2p)>180)hm=(h1p+h2p+(h1p+h2p<360?360:-360))/2;else hm=(h1p+h2p)/2}
  const T=1-0.17*Math.cos((hm-30)*rad)+0.24*Math.cos(2*hm*rad)+0.32*Math.cos((3*hm+6)*rad)-0.20*Math.cos((4*hm-63)*rad);
  const dT=30*Math.exp(-Math.pow((hm-275)/25,2)),RC=2*Math.sqrt(Math.pow(Cmp,7)/(Math.pow(Cmp,7)+Math.pow(25,7)));
  const SL=1+0.015*Math.pow(Lm-50,2)/Math.sqrt(20+Math.pow(Lm-50,2)),SC=1+0.045*Cmp,SH=1+0.015*Cmp*T,RT=-Math.sin(2*dT*rad)*RC;
  return Math.sqrt(Math.pow(dL/SL,2)+Math.pow(dC/SC,2)+Math.pow(dH/SH,2)+RT*(dC/SC)*(dH/SH))}
// Generador de números pseudoaleatorios con semilla (para que el resultado sea siempre el mismo)
function azar(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* k-medias en CIELAB con arranque k-means++ y semilla fija. pts: lista de [L,a,b]. Devuelve centros y su peso (fracción). */
function kmedias(pts,k,iter){
  const r=azar(7),n=pts.length;if(!n)return [];k=Math.min(k,n);
  const d2=(p,q)=>(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2;
  const C=[pts[Math.floor(r()*n)].slice()];const md=new Float64Array(n).fill(Infinity);
  while(C.length<k){let tot=0;const c=C[C.length-1];for(let i=0;i<n;i++){md[i]=Math.min(md[i],d2(pts[i],c));tot+=md[i]}
    let x=r()*tot,i=0;for(;i<n-1;i++){x-=md[i];if(x<=0)break}C.push(pts[i].slice())}
  const asig=new Int32Array(n);
  for(let it=0;it<(iter||25);it++){let cambia=0;
    for(let i=0;i<n;i++){let mj=0,mv=Infinity;for(let j=0;j<k;j++){const v=d2(pts[i],C[j]);if(v<mv){mv=v;mj=j}}if(asig[i]!==mj){asig[i]=mj;cambia++}}
    const S=C.map(()=>[0,0,0,0]);for(let i=0;i<n;i++){const s=S[asig[i]];s[0]+=pts[i][0];s[1]+=pts[i][1];s[2]+=pts[i][2];s[3]++}
    S.forEach((s,j)=>{if(s[3])C[j]=[s[0]/s[3],s[1]/s[3],s[2]/s[3]]});if(!cambia&&it)break}
  const cuenta=new Array(k).fill(0);for(let i=0;i<n;i++)cuenta[asig[i]]++;
  return C.map((c,j)=>({lab:c,peso:cuenta[j]/n})).filter(c=>c.peso>0)}
// k-medias en una dimensión (claridades): umbrales entre n valores
function umbrales(Ls,n){
  const s=Float64Array.from(Ls).sort(),N=s.length;if(!N)return [];
  let c=[];for(let j=0;j<n;j++)c.push(s[Math.min(N-1,Math.floor((j+0.5)/n*N))]);
  for(let it=0;it<30;it++){const cortes=c.slice(1).map((v,j)=>(v+c[j])/2),sum=new Array(n).fill(0),cnt=new Array(n).fill(0);
    let j=0;for(let i=0;i<N;i++){while(j<n-1&&s[i]>cortes[j])j++;sum[j]+=s[i];cnt[j]++}
    const nc=c.map((v,j)=>cnt[j]?sum[j]/cnt[j]:v);if(nc.every((v,j)=>Math.abs(v-c[j])<0.01)){c=nc;break}c=nc}
  return c.slice(1).map((v,j)=>(v+c[j])/2)}
/* Mezclas de acuarela: modelo de Kubelka-Munk de una constante, longitud de onda por longitud de onda.
   Cada pintura se convierte en un espectro de reflectancia suave (sigmoide de un polinomio de grado 2,
   como en Jakob y Hanika, 2019) que da su mismo color; las mezclas se calculan con K/S = (1−R)²/(2R)
   sumado en proporción. Así azul + amarillo dan verde, como en el papel. Es una aproximación:
   las pinturas reales tienen espectros propios, granulan y cambian al secar.
   Añadir agua se aproxima con una capa más fina sobre papel blanco: R^t (t = carga de pigmento). */
const LAM=[];for(let l=400;l<=700;l+=10)LAM.push(l);
const gs=(l,m,a,b)=>{const t=(l-m)/(l<m?a:b);return Math.exp(-0.5*t*t)};
// Funciones de color CIE 1931 aproximadas (Wyman, Sloan y Shirley, 2013)
const CMF=LAM.map(l=>[1.056*gs(l,599.8,37.9,31.0)+0.362*gs(l,442.0,16.0,26.7)-0.065*gs(l,501.1,20.4,26.2),
  0.821*gs(l,568.8,46.9,40.5)+0.286*gs(l,530.9,16.3,31.1),1.217*gs(l,437.0,11.8,36.0)+0.681*gs(l,459.0,26.0,13.8)]);
const BLANCO=[0,1,2].map(k=>CMF.reduce((a,c)=>a+c[k],0)),D65=[0.95047,1,1.08883];
const TT=LAM.map(l=>(l-550)/150);
function xyzRel(S){const o=[0,0,0];for(let i=0;i<S.length;i++){o[0]+=S[i]*CMF[i][0];o[1]+=S[i]*CMF[i][1];o[2]+=S[i]*CMF[i][2]}return o.map((v,k)=>v/BLANCO[k])}
const linXyz=([r,g,b])=>[r*0.4124+g*0.3576+b*0.1805,r*0.2126+g*0.7152+b*0.0722,r*0.0193+g*0.1192+b*0.9505];
const xyzLin=([x,y,z])=>[3.2406*x-1.5372*y-0.4986*z,-0.9689*x+1.8758*y+0.0415*z,0.0557*x-0.2040*y+1.0570*z];
const sig=x=>0.5+x/(2*Math.sqrt(1+x*x)),dsig=x=>0.5/Math.pow(1+x*x,1.5);
function sol3(A,b){const M=A.map((r,i)=>[...r,b[i]]);for(let c=0;c<3;c++){let p=c;for(let r=c+1;r<3;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;[M[c],M[p]]=[M[p],M[c]];
  if(Math.abs(M[c][c])<1e-14)return null;for(let r=0;r<3;r++)if(r!==c){const f=M[r][c]/M[c][c];for(let k=c;k<4;k++)M[r][k]-=f*M[c][k]}}return M.map((r,i)=>r[3]/r[i])}
const CACHE_ESP={};
// Espectro de reflectancia de un color (hex)
function reflect(hex){if(CACHE_ESP[hex])return CACHE_ESP[hex];
  const lrgb=hexRgb(hex).map(v=>Math.min(0.985,Math.max(0.004,lin(v))));
  const obj=linXyz(lrgb).map((v,k)=>v/D65[k]);
  let c=[0,0,0],mu=1e-3;
  const eval_=c=>{const x=TT.map(t=>c[0]+c[1]*t+c[2]*t*t);return {x,S:x.map(sig)}};
  let {x,S}=eval_(c),f=xyzRel(S).map((v,k)=>v-obj[k]),e=f.reduce((a,v)=>a+v*v,0);
  for(let it=0;it<120&&e>1e-10;it++){
    const J=[[0,0,0],[0,0,0],[0,0,0]];// J[fila xyz][coef]
    for(let i=0;i<LAM.length;i++){const d=dsig(x[i]),t=TT[i],dd=[d,d*t,d*t*t];for(let r=0;r<3;r++)for(let k=0;k<3;k++)J[r][k]+=dd[k]*CMF[i][r]/BLANCO[r]}
    const JtJ=[0,1,2].map(a=>[0,1,2].map(b=>J[0][a]*J[0][b]+J[1][a]*J[1][b]+J[2][a]*J[2][b]+(a===b?mu:0)));
    const Jtf=[0,1,2].map(a=>J[0][a]*f[0]+J[1][a]*f[1]+J[2][a]*f[2]);
    const dl=sol3(JtJ,Jtf.map(v=>-v));if(!dl)break;
    const c2=c.map((v,k)=>v+dl[k]),r2=eval_(c2),f2=xyzRel(r2.S).map((v,k)=>v-obj[k]),e2=f2.reduce((a,v)=>a+v*v,0);
    if(e2<e){c=c2;x=r2.x;S=r2.S;f=f2;e=e2;mu=Math.max(1e-9,mu/3)}else mu*=4}
  return CACHE_ESP[hex]=Float64Array.from(S)}
const ks=R=>(1-R)*(1-R)/(2*R),deKs=k=>1+k-Math.sqrt(k*k+2*k);
function mezclar(Rs,props,carga){const tot=props.reduce((a,b)=>a+b,0),t=carga==null?1:carga,out=new Float64Array(LAM.length);
  for(let i=0;i<LAM.length;i++){let k=0;for(let j=0;j<Rs.length;j++)k+=props[j]/tot*ks(Math.max(1e-4,Rs[j][i]));out[i]=Math.pow(deKs(k),t)}return out}
// Del espectro al color en pantalla
const espRgb=S=>xyzLin(xyzRel(S).map((v,k)=>v*D65[k])).map(gam);
const reflHex=S=>rgbHex(espRgb(S));
const PROPS=[[1,0],[3,1],[2,1],[1,1],[1,2],[1,3]];
const CARGAS=[1,0.75,0.55,0.4,0.28,0.2,0.14,0.09,0.06];
/* Busca con qué pinturas de la carta sale un color: una sola o dos mezcladas, y cuánta agua.
   pinturas: lista de {hex, ...}. Devuelve las mejores opciones, prefiriendo una sola pintura si casi da igual. */
function buscarMezcla(obj,pinturas,cuantas){
  const R=pinturas.map(p=>reflect(p.hex)),res=[];
  const prueba=(ids,pr,t)=>{const r=mezclar(ids.map(i=>R[i]),pr,t),rgb=espRgb(r),lab=rgbLab(rgb);return {ids,props:pr,carga:t,hex:rgbHex(rgb),lab,de:dE(obj,lab)}};
  for(let i=0;i<R.length;i++)for(const t of CARGAS)res.push(prueba([i],[1],t));
  for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++)for(const pr of PROPS.slice(1))for(const t of CARGAS)res.push(prueba([i,j],pr,t));
  // una pintura sola es más fácil: se prefiere si la diferencia es pequeña; las mezclas «de conveniencia» (con blanco, grises hechos) cuentan algo menos
  const pen=pinturas.map(p=>p.extra?1.5:0);
  res.forEach(o=>o.nota=o.de+(o.ids.length>1?1.5:0)+o.ids.reduce((a,i)=>a+pen[i],0));
  res.sort((a,b)=>a.nota-b.nota);
  const vistos=new Set(),out=[];for(const o of res){const k=o.ids.join('+');if(vistos.has(k))continue;vistos.add(k);out.push(o);if(out.length>=(cuantas||3))break}
  return out}
// Palabras para la carga de agua
function textoCarga(t){return t>=0.75?'cargada, casi sin agua':t>=0.5?'aguada media':t>=0.28?'aguada clara':t>=0.14?'muy aguada':'apenas un velo'}
// Nombre aproximado del color, para no depender de verlo (la app nunca usa el color como única señal)
function nombre(L){const [l,c,h]=lch(L);
  const claro=l>85?'muy claro':l>68?'claro':l>45?'medio':l>28?'oscuro':'muy oscuro';
  if(c<6)return l>92?'blanco':l<14?'negro':'gris '+claro;
  let t;
  if(h<20||h>=345)t='rojo carmín';else if(h<45)t=(l<55?'rojo teja':'rojo anaranjado');else if(h<70)t=(l<60&&c<45?'marrón tostado':'naranja');
  else if(h<95)t=(l<65&&c<50?'ocre':'amarillo anaranjado');else if(h<110)t='amarillo';else if(h<135)t='verde amarillento';
  else if(h<170)t='verde';else if(h<205)t='verde azulado';else if(h<240)t='azul turquesa';else if(h<290)t='azul';else if(h<305)t='azul violáceo';else if(h<325)t='violeta';else t='púrpura rosado';
  const apag=c<18?' grisáceo':c<32?' apagado':c>65?' intenso':'';
  return t+apag+' '+claro}
// Temperatura del color: cálido (rojos, naranjas, amarillos), frío (verdes azulados, azules, violetas) o neutro
function temperatura(L){const [,c,h]=lch(L);if(c<8)return 'neutro';return (h<105||h>=330)?'cálido':(h<150?'templado':'frío')}
// Valor (claridad) en tres palabras
function valor(L){return L[0]>66?'claro':L[0]>36?'medio':'oscuro'}
const COLOR={espRgb,LAM,hexRgb,rgbHex,rgbLab,labRgb,labHex,hexLab,lch,dE,azar,kmedias,umbrales,reflect,mezclar,reflHex,buscarMezcla,textoCarga,nombre,temperatura,valor,lin,gam};
raiz.COLOR=COLOR;if(typeof module!=='undefined')module.exports=COLOR;
})(typeof window!=='undefined'?window:globalThis);
