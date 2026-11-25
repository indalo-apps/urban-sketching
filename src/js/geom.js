/* ===== Cálculos de perspectiva (sin pantalla, para poder probarlos) =====
   Puntos como [x, y] en píxeles de la foto (y hacia abajo). Rectas como [p, q] (dos puntos). */
(function(raiz){
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]], add=(a,b)=>[a[0]+b[0],a[1]+b[1]], mul=(a,k)=>[a[0]*k,a[1]*k];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1], len=a=>Math.hypot(a[0],a[1]), dist=(a,b)=>len(sub(a,b));
const norm=a=>{const l=len(a)||1;return [a[0]/l,a[1]/l]};
// Recta en forma homogénea (a, b, c) con a·x + b·y + c = 0 y (a, b) unitario
function homog(p,q){const a=p[1]-q[1],b=q[0]-p[0],c=p[0]*q[1]-q[0]*p[1],l=Math.hypot(a,b)||1;return [a/l,b/l,c/l]}
// Corte de dos rectas; null si son (casi) paralelas
function corte(r1,r2){const A=homog(r1[0],r1[1]),B=homog(r2[0],r2[1]);
  const x=A[1]*B[2]-A[2]*B[1],y=A[2]*B[0]-A[0]*B[2],w=A[0]*B[1]-A[1]*B[0];
  if(Math.abs(w)<1e-9)return null;return [x/w,y/w]}
/* Punto de fuga de una familia de rectas que en la realidad son paralelas (regla 2 de Mollière, «convergencia» de Pastrana).
   Con dos rectas, su corte; con más, el punto que menos se aparta de todas (mínimos cuadrados).
   Devuelve null si las rectas son paralelas en la foto (punto de fuga en el infinito). */
function puntoFuga(rectas){
  const rs=rectas.filter(r=>r&&dist(r[0],r[1])>2);if(rs.length<2)return null;
  if(rs.length===2){const p=corte(rs[0],rs[1]);return p&&Math.abs(p[0])<1e7&&Math.abs(p[1])<1e7?p:null}
  let s11=0,s12=0,s22=0,t1=0,t2=0;
  for(const r of rs){const [a,b,c]=homog(r[0],r[1]);s11+=a*a;s12+=a*b;s22+=b*b;t1-=a*c;t2-=b*c}
  const det=s11*s22-s12*s12;if(Math.abs(det)<1e-9*rs.length)return null;
  const p=[(t1*s22-t2*s12)/det,(s11*t2-s12*t1)/det];return Math.abs(p[0])<1e7&&Math.abs(p[1])<1e7?p:null}
// Ángulo de una recta respecto a la horizontal, en grados (−90…90)
function angulo(p,q){let a=Math.atan2(q[1]-p[1],q[0]-p[0])*180/Math.PI;if(a>90)a-=180;if(a<-90)a+=180;return a}
// Proyección de un punto sobre la recta p-q
function proyectar(pt,p,q){const d=norm(sub(q,p));return add(p,mul(d,dot(sub(pt,p),d)))}
// Distancia con signo de un punto a la recta del horizonte (positiva = por debajo, en la foto)
function ladoHorizonte(pt,h){const [a,b,c]=homog(h[0],h[1]);let s=a*pt[0]+b*pt[1]+c;if(b<0)s=-s;return s}
/* Cono de visión (Norling, D'Amelio cap. 9, Pastrana cap. 4, Haley cap. 8).
   Con dos puntos de fuga A y B de direcciones que forman 90° (las dos caras de una esquina),
   el ojo ve A y B en ángulo recto: la distancia d del ojo al cuadro cumple d² = |CV−A|·|CV−B|,
   donde CV (centro de visión) es el pie de la perpendicular desde el centro de la foto al horizonte.
   El círculo de 60° tiene radio d·tan 30°. Lo que queda fuera sale deformado. */
function cono(A,B,centro,grados){
  if(!A||!B)return null;const cv=proyectar(centro,A,B);
  const ab=dist(A,B),ca=dist(cv,A),cb=dist(cv,B);
  if(ca+cb>ab*1.0001)return {cv,d:null,r:null,fuera:true};// CV no queda entre A y B: no es una esquina en ángulo recto
  const d=Math.sqrt(ca*cb),r=d*Math.tan((grados||60)/2*Math.PI/180);return {cv,d,r,fuera:false}}
// Ángulo que abarca la foto (en su diagonal), visto desde el ojo a distancia d del centro
function anguloFoto(w,h,d){return 2*Math.atan(Math.hypot(w,h)/2/d)*180/Math.PI}
/* Alturas con la línea del horizonte (Pastrana cap. 8, D'Amelio cap. 10).
   En suelo llano, el horizonte corta todo lo vertical a la altura de los ojos del que mira.
   base: pie del objeto en el suelo; cima: su punto alto; h: recta del horizonte; V: punto de fuga
   de las verticales (null si las verticales salen paralelas, perspectiva de 1 o 2 puntos).
   Devuelve la altura en las mismas unidades que «ojo». Usa la razón doble, válida también con 3 puntos. */
// Dirección «hacia arriba» de la vertical que pasa por p (hacia el punto de fuga V o desde él)
function arriba(p,V){if(!V)return [0,-1];let u=norm(sub(V,p));if(u[1]>0)u=[-u[0],-u[1]];return u}
function altura(base,cima,h,ojo,V){
  const u=arriba(base,V),H=corte([base,add(base,u)],h);if(!H)return null;
  const s=p=>dot(sub(p,base),u),sT=s(cima),sH=s(H);
  if(Math.abs(sH)<1e-6)return null;
  if(!V)return ojo*sT/sH;
  const sV=s(V);return ojo*(sT/sH)*((sV-sH)/(sV-sT))}
// Lo contrario: dónde queda la cima de algo de altura «alto» que está de pie en «base»
function cimaDe(base,alto,h,ojo,V){
  const u=arriba(base,V),H=corte([base,add(base,u)],h);if(!H)return null;
  const hh=dot(sub(H,base),u),t=alto/ojo;
  if(!V)return add(base,mul(u,hh*t));
  const v=dot(sub(V,base),u),x=t*hh*v/(v-hh+t*hh);return add(base,mul(u,x))}
/* Horizonte en vivo a partir de la inclinación del móvil (DeviceOrientation β y γ, en grados).
   Vector «arriba» en el sistema del móvil (x a la derecha, y hacia arriba, z saliendo de la pantalla):
   up = (−sen γ·cos β, sen β, cos γ·cos β). La cámara mira hacia −z. Un punto de la pantalla (u, v),
   medido desde el centro con v hacia arriba y f = distancia focal en píxeles, ve la dirección (u/f, v/f, −1);
   está en el horizonte si esa dirección es horizontal: −u·sen γ·cos β + v·sen β = f·cos γ·cos β.
   giro: ángulo de la pantalla (0 vertical, 90 o −90 apaisada). Devuelve la recta en coordenadas de
   pantalla (x a la derecha, y hacia abajo, desde el centro) como dos puntos, y el punto de fuga de las verticales. */
function horizonteMovil(beta,gamma,f,giro){
  const r=Math.PI/180,b=beta*r,g=gamma*r;
  let up=[-Math.sin(g)*Math.cos(b),Math.sin(b),Math.cos(g)*Math.cos(b)];
  const t=(giro||0)*r,ux=up[0]*Math.cos(t)+up[1]*Math.sin(t),uy=-up[0]*Math.sin(t)+up[1]*Math.cos(t);up=[ux,uy,up[2]];
  // −u·up0... en pantalla con y hacia abajo: v = −y  →  u·up0 − y·up1 = f·up2·(−1)·(−1)
  const A=up[0],B=-up[1],C=-f*up[2];// A·x + B·y + C = 0  ⇔  x·up0 − y·up1 − f·up2 = 0
  let p,q;const L=4000;
  if(Math.abs(B)>Math.abs(A)){p=[-L,(-C-A*-L)/B];q=[L,(-C-A*L)/B]}else{p=[(-C-B*-L)/A,-L];q=[(-C-B*L)/A,L]}
  // Punto de fuga de las verticales: dirección (u/f, v/f, −1) paralela a up
  const vv=Math.abs(up[2])>1e-6?[-f*up[0]/up[2],f*up[1]/up[2]]:null;
  // Elevación de la mirada de la cámara (−z) sobre la horizontal: positiva si mira hacia arriba
  const mirada=-Math.asin(Math.max(-1,Math.min(1,up[2])))*180/Math.PI;
  return {recta:[p,q],vertical:vv,mirada}}
// Rayos de una rejilla de perspectiva desde un punto de fuga, repartidos por el rectángulo [x0,y0,x1,y1]
function rayos(P,rect,n){
  const [x0,y0,x1,y1]=rect,esq=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
  if(P[0]>=x0&&P[0]<=x1&&P[1]>=y0&&P[1]<=y1){const out=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*2*Math.PI;out.push([P,add(P,mul([Math.cos(a),Math.sin(a)],1e4))])}return out}
  const ang=esq.map(c=>Math.atan2(c[1]-P[1],c[0]-P[0]));let base=ang[0];
  const rel=ang.map(a=>{let d=a-base;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d});
  const a0=base+Math.min(...rel),a1=base+Math.max(...rel),out=[];
  for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;out.push([P,add(P,mul([Math.cos(a),Math.sin(a)],1e5))])}
  return out}
// Recorta un segmento al rectángulo (Liang-Barsky); null si queda fuera
function recortar(p,q,rect){const [x0,y0,x1,y1]=rect;let t0=0,t1=1;const dx=q[0]-p[0],dy=q[1]-p[1];
  for(const [pp,qq] of [[-dx,p[0]-x0],[dx,x1-p[0]],[-dy,p[1]-y0],[dy,y1-p[1]]]){
    if(pp===0){if(qq<0)return null}else{const r=qq/pp;if(pp<0){if(r>t1)return null;if(r>t0)t0=r}else{if(r<t0)return null;if(r<t1)t1=r}}}
  return [[p[0]+t0*dx,p[1]+t0*dy],[p[0]+t1*dx,p[1]+t1*dy]]}
const GEOM={sub,add,mul,dot,len,dist,norm,homog,corte,puntoFuga,angulo,proyectar,ladoHorizonte,cono,anguloFoto,arriba,altura,cimaDe,horizonteMovil,rayos,recortar};
raiz.GEOM=GEOM;if(typeof module!=='undefined')module.exports=GEOM;
})(typeof window!=='undefined'?window:globalThis);
