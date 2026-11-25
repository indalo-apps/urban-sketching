// Pruebas de los cálculos de perspectiva y de color, sin navegador.
// Se fotografía con una cámara simulada una escena de medidas conocidas y se comprueba que la app
// recupera los puntos de fuga, el horizonte, la distancia del ojo y las alturas.
// Uso: node pruebas/calculos.js
const path=require('path');
const G=require(path.join(__dirname,'../src/js/geom.js')),C=require(path.join(__dirname,'../src/js/color.js'));
let ok=0,mal=0;
function prueba(nombre,cond,detalle){if(cond)ok++;else{mal++;console.log('✗ '+nombre+(detalle?' · '+detalle:''))}}
const cerca=(a,b,tol)=>Math.abs(a-b)<=tol,cercaP=(p,q,tol)=>p&&q&&G.dist(p,q)<=tol;
// Cámara: ojo a «ojo» metros, mira con giro (yaw) y cabeceo (pitch), focal f en píxeles, foto w×h
function camara({ojo=1.6,yaw=30,pitch=0,f=800,w=1200,h=900}){
  const r=Math.PI/180,cy=Math.cos(yaw*r),sy=Math.sin(yaw*r),cp=Math.cos(pitch*r),sp=Math.sin(pitch*r);
  const ver=([X,Y,Z])=>{// mundo: X derecha, Y arriba, Z adelante
    let x=X*cy-Z*sy,z=X*sy+Z*cy,y=Y-ojo;const y2=y*cp-z*sp,z2=y*sp+z*cp;return [w/2+f*x/z2,h/2-f*y2/z2]};
  const dir=([X,Y,Z])=>{let x=X*cy-Z*sy,z=X*sy+Z*cy,y=Y;const y2=y*cp-z*sp,z2=y*sp+z*cp;return Math.abs(z2)<1e-12?null:[w/2+f*x/z2,h/2-f*y2/z2]};
  return {ver,dir,w,h,f,ojo}}
// 1) Dos puntos de fuga de un edificio en esquina, cámara a nivel
for(const yaw of [20,35,50]){
  const c=camara({yaw});
  const A=c.dir([1,0,0]),B=c.dir([0,0,1]);// dirección de las dos fachadas (en ángulo recto)
  const e=[[-4,0,12],[-4,9,12],[6,0,12],[6,9,12]];// fachada paralela al eje X
  const lA=[[c.ver(e[0]),c.ver(e[2])],[c.ver(e[1]),c.ver(e[3])]];
  const pA=G.puntoFuga(lA);prueba(`punto de fuga A (giro ${yaw}°)`,cercaP(pA,A,0.5),JSON.stringify([pA,A]));
  const lB=[[c.ver([-4,0,12]),c.ver([-4,0,22])],[c.ver([-4,9,12]),c.ver([-4,9,22])],[c.ver([-4,4,12]),c.ver([-4,4,22])]];
  const pB=G.puntoFuga(lB);prueba(`punto de fuga B con 3 rectas (giro ${yaw}°)`,cercaP(pB,B,0.5));
  prueba('el horizonte queda a la altura de los ojos (centro de la foto)',cerca(pA[1],450,0.5)&&cerca(pB[1],450,0.5));
  const k=G.cono(pA,pB,[600,450],60);
  prueba(`distancia del ojo = focal (giro ${yaw}°)`,k&&cerca(k.d,800,1),k&&k.d);
  prueba('radio del cono de 60° = f·tan 30°',k&&cerca(k.r,800*Math.tan(Math.PI/6),1));
  // Persona de 1,75 m a 9 m, y farola de 4 m a 15 m
  const h=[pA,pB];
  for(const [X,Z,alto] of [[1,9,1.75],[-2,15,4],[3,6,0.9]]){
    const base=c.ver([X,0,Z]),cima=c.ver([X,alto,Z]);
    const a=G.altura(base,cima,h,1.6,null);prueba(`altura de ${alto} m con el horizonte`,cerca(a,alto,0.01),a);
    prueba(`cima de algo de ${alto} m`,cercaP(G.cimaDe(base,alto,h,1.6,null),cima,0.3))}
  prueba('todo lo que mide como el ojo corta el horizonte',cerca(c.ver([5,1.6,30])[1],450,0.01));
}
// 2) Tres puntos de fuga: mirando hacia arriba una torre (cabeceo 20°)
{const c=camara({yaw:30,pitch:20});
  const V=c.dir([0,1,0]),A=c.dir([1,0,0]),B=c.dir([0,0,1]);
  const lV=[[c.ver([0,0,20]),c.ver([0,30,20])],[c.ver([6,0,20]),c.ver([6,30,20])]];
  prueba('punto de fuga de las verticales (3 puntos)',cercaP(G.puntoFuga(lV),V,1));
  prueba('con la cámara inclinada, el horizonte baja',A[1]>450&&B[1]>450);
  const h=[A,B];const base=c.ver([2,0,14]),cima=c.ver([2,1.75,14]);
  const a=G.altura(base,cima,h,1.6,V);prueba('altura con 3 puntos (razón doble)',cerca(a,1.75,0.01),a);
  prueba('cima con 3 puntos',cercaP(G.cimaDe(base,1.75,h,1.6,V),cima,0.3));}
// 3) Rectas paralelas en la foto: sin punto de fuga
prueba('rectas paralelas: punto de fuga en el infinito',G.puntoFuga([[[0,0],[100,0]],[[0,50],[100,50]]])===null);
// 4) Regla 1 de Mollière: por encima del horizonte las líneas bajan hacia el punto de fuga; por debajo, suben
{const c=camara({yaw:30}),A=c.dir([1,0,0]);
  const alta=[c.ver([-4,9,12]),c.ver([6,9,12])],baja=[c.ver([-4,0,12]),c.ver([6,0,12])],h=[A,[A[0]+100,A[1]]];
  prueba('el alero queda por encima del horizonte',G.ladoHorizonte(alta[0],h)<0);
  prueba('el zócalo queda por debajo del horizonte',G.ladoHorizonte(baja[0],h)>0);
  const haciaA=s=>{const [p,q]=G.dist(s[0],A)>G.dist(s[1],A)?[s[0],s[1]]:[s[1],s[0]];return q[1]-p[1]};// avance en y yendo hacia A
  prueba('el alero baja hacia el punto de fuga',haciaA(alta)>0);prueba('el zócalo sube hacia el punto de fuga',haciaA(baja)<0);}
// 5) Horizonte en vivo desde la inclinación del móvil
{const f=1000;
  let r=G.horizonteMovil(90,0,f,0);prueba('móvil recto: horizonte en el centro',cerca(r.recta[0][1],0,0.01)&&cerca(r.recta[1][1],0,0.01)&&cerca(r.mirada,0,0.01));
  r=G.horizonteMovil(100,0,f,0);const y=r.recta[0][1];
  prueba('mirando 10° hacia arriba: el horizonte baja f·tan 10°',cerca(y,f*Math.tan(10*Math.PI/180),0.5)&&cerca(r.mirada,10,0.01),y);
  r=G.horizonteMovil(80,0,f,0);prueba('mirando hacia abajo: el horizonte sube',r.recta[0][1]<0&&cerca(r.mirada,-10,0.01));
  r=G.horizonteMovil(80,-90,f,0);const p=r.recta[0],q=r.recta[1],ang=Math.atan2(q[1]-p[1],q[0]-p[0])*180/Math.PI;
  prueba('móvil girado 10°: el horizonte se inclina 10° al otro lado',cerca(Math.abs(ang),10,0.01),ang);
  r=G.horizonteMovil(110,0,f,0);prueba('mirando hacia arriba: las verticales fugan por encima',r.vertical&&r.vertical[1]<0);}
// 6) Recortes y rayos
prueba('recortar un segmento al rectángulo',(()=>{const s=G.recortar([-10,50],[210,50],[0,0,100,100]);return s&&cerca(s[0][0],0,1e-9)&&cerca(s[1][0],100,1e-9)})());
prueba('rayos de la rejilla cubren la foto',G.rayos([2000,450],[0,0,1200,900],10).length===11);
// ---- Color ----
{let peor=0,cual='';const carta=require('fs').readFileSync(path.join(__dirname,'../src/js/cartas.js'),'utf8').match(/#[0-9a-f]{6}/gi);
  for(const h of carta){const d=C.dE(C.hexLab(h),C.rgbLab(C.espRgb(C.reflect(h))));if(d>peor){peor=d;cual=h}}
  prueba('el espectro de cada pintura de las cartas da su mismo color (ΔE < 3)',peor<3,cual+' ΔE '+peor.toFixed(2));
  const rojo=C.rgbLab(C.espRgb(C.mezclar([C.reflect('#e4130f'),C.reflect('#f6e66c')],[1,1],1)));prueba('rojo + amarillo dan naranja',C.lch(rojo)[2]>30&&C.lch(rojo)[2]<85,C.lch(rojo)[2]);}
prueba('Lab ida y vuelta',['#ffffff','#336699','#c0392b','#2a2522'].every(h=>C.labHex(C.hexLab(h))===h));
// Pares de referencia de Sharma et al. (2005) para CIEDE2000
for(const [a,b,v] of [[[50,2.6772,-79.7751],[50,0,-82.7485],2.0425],[[50,2.5,0],[73,25,-18],27.1492],[[50,-0.001,2.49],[50,0.0009,-2.49],4.8045],[[50,-0.001,2.49],[50,0.0011,-2.49],4.7461],[[60.2574,-34.0099,36.2677],[60.4626,-34.1751,39.4387],1.2644]])
  prueba('CIEDE2000 '+v,cerca(C.dE(a,b),v,0.001),C.dE(a,b));
{const am=C.reflect('#f6e66c'),az=C.reflect('#2b4698');const m=C.mezclar([am,az],[3,1],1),lab=C.rgbLab(C.espRgb(m)),[,,h]=C.lch(lab);
  prueba('3 de amarillo + 1 de azul ftalo dan verde',h>120&&h<200,h);
  const r1=C.mezclar([az],[1],1),r2=C.mezclar([az],[1],0.3);prueba('con más agua el color se aclara',C.rgbLab(C.espRgb(r2))[0]>C.rgbLab(C.espRgb(r1))[0]+15);
  const tierra=C.reflect('#b63915'),gris=C.rgbLab(C.espRgb(C.mezclar([tierra,C.reflect('#342c86')],[1,1],1)));
  prueba('siena tostada + ultramar dan un gris oscuro poco saturado',C.lch(gris)[1]<25&&gris[0]<45,JSON.stringify(gris));}
{const pins=[{hex:'#f6e66c'},{hex:'#2b4698'},{hex:'#b63915'},{hex:'#342c86'}];
  const obj=C.hexLab('#2b4698'),r=C.buscarMezcla(obj,pins,3);prueba('un color de la carta sale con esa pintura sola',r[0].ids.length===1&&r[0].ids[0]===1&&r[0].de<1,JSON.stringify(r[0]));
  const claro=C.rgbLab(C.espRgb(C.mezclar([C.reflect('#2b4698')],[1],0.28))),r2=C.buscarMezcla(claro,pins,1)[0];
  prueba('un azul claro sale con azul y más agua',r2.ids[0]===1&&r2.carga<0.5&&r2.de<1.5,JSON.stringify(r2));}
{const pts=[];const r=C.azar(3);for(const c of [[80,0,0],[50,40,30],[30,-20,-40]])for(let i=0;i<200;i++)pts.push([c[0]+r()*4-2,c[1]+r()*4-2,c[2]+r()*4-2]);
  const k=C.kmedias(pts,3).sort((a,b)=>b.lab[0]-a.lab[0]);
  prueba('k-medias encuentra los tres colores',k.length===3&&cerca(k[0].lab[0],80,1)&&cerca(k[1].lab[1],40,1)&&cerca(k[2].lab[2],-40,1));
  prueba('k-medias es siempre igual (semilla fija)',JSON.stringify(C.kmedias(pts,3))===JSON.stringify(C.kmedias(pts,3)));}
{const Ls=[];for(let i=0;i<300;i++)Ls.push(i<100?20:i<200?55:85);const u=C.umbrales(Ls,3);
  prueba('umbrales entre tres valores',u.length===2&&u[0]>20&&u[0]<55&&u[1]>55&&u[1]<85,JSON.stringify(u));}
prueba('nombre de colores',C.nombre(C.hexLab('#2b4698')).startsWith('azul')&&C.nombre(C.hexLab('#ffffff'))==='blanco'&&C.nombre(C.hexLab('#b63915')).startsWith('rojo')&&C.nombre(C.hexLab('#f9b622')).includes('amarillo'),[C.nombre(C.hexLab('#2b4698')),C.nombre(C.hexLab('#b63915')),C.nombre(C.hexLab('#f9b622'))].join(' / '));
prueba('temperatura',C.temperatura(C.hexLab('#e7450b'))==='cálido'&&C.temperatura(C.hexLab('#2b4698'))==='frío'&&C.temperatura(C.hexLab('#808080'))==='neutro');
// ---- Paleta limitada ----
{const pins=[{hex:'#f6e66c'},{hex:'#2b4698'},{hex:'#b63915'},{hex:'#342c86'},{hex:'#e4130f'}];
  const objs=[C.rgbLab(C.espRgb(C.mezclar([C.reflect('#f6e66c'),C.reflect('#2b4698')],[3,1],0.55))),C.hexLab('#b63915'),C.rgbLab(C.espRgb(C.mezclar([C.reflect('#2b4698')],[1],0.28)))];
  const g=C.paletaLimitada(objs,[0.5,0.3,0.2],pins);let r,pasos=0;while(!(r=g.next()).done)pasos++;
  const ids=r.value[0].ids.slice().sort();
  prueba('paleta limitada: encuentra las tres pinturas que hacen los colores (amarillo, azul ftalo y siena)',JSON.stringify(ids)==='[0,1,2]'&&r.value[0].media<1.5,JSON.stringify(r.value[0]));
  prueba('paleta limitada: avisa del progreso y da varias opciones ordenadas',pasos>0&&r.value.length===3&&r.value[0].nota<=r.value[1].nota);}
// ---- Sol ----
{const S=require(path.join(__dirname,'../src/js/sol.js')),lat=36.84,lon=-2.46;
  const dia=(d,h)=>new Date(Date.UTC(...d,0,0)-h*3600000);// medianoche local con h horas de diferencia con UTC
  const ver=S.dia(dia([2026,5,21],2),lat,lon),equi=S.dia(dia([2026,2,20],1),lat,lon),inv=S.dia(dia([2026,11,21],1),lat,lon);
  prueba('sol en Almería: altura a mediodía en el solsticio de verano ≈ 90 − 36,84 + 23,44',cerca(ver.altMax,76.6,0.3),ver.altMax);
  prueba('sol: equinoccio ≈ 90 − latitud',cerca(equi.altMax,53.2,0.6),equi.altMax);
  prueba('sol: solsticio de invierno ≈ 29,7°',cerca(inv.altMax,29.7,0.3),inv.altMax);
  const hm=d=>d.getUTCHours()*60+d.getUTCMinutes();
  prueba('sol: en verano sale hacia las 6:51 y se pone hacia las 21:32 (hora de España)',Math.abs(hm(ver.salida)-(4*60+51))<6&&Math.abs(hm(ver.puesta)-(19*60+32))<6,ver.salida.toISOString()+' '+ver.puesta.toISOString());
  prueba('sol: mediodía solar hacia las 14:11 en verano',Math.abs(hm(ver.mediodia)-(12*60+11))<4,ver.mediodia.toISOString());
  const p=S.posicion(ver.mediodia,lat,lon);prueba('sol: a mediodía está al sur',cerca(p.az,180,1.5),p.az);
  const m=S.posicion(new Date(Date.UTC(2026,2,20,8,0)),lat,lon),t=S.posicion(new Date(Date.UTC(2026,2,20,16,0)),lat,lon);
  prueba('sol: por la mañana al este y por la tarde al oeste',m.az>90&&m.az<150&&t.az>210&&t.az<270,m.az+' '+t.az);
  prueba('sol: sombra de 1 m con el sol a 45° mide 1 m',cerca(S.sombra(1,45),1,1e-9));
  prueba('sol: rumbos',S.rumbo(0)==='norte'&&S.rumbo(225)==='suroeste'&&S.rumbo(90,true)==='este'&&S.rumbo(350,true)==='norte');
  prueba('sol: horas doradas antes de la puesta',ver.doradaT&&ver.doradaT[1]-ver.puesta===0&&ver.doradaT[0]<ver.puesta);}
console.log(`${mal?'✗':'✓'} cálculos: ${ok} comprobaciones bien${mal?', '+mal+' mal':''}`);process.exit(mal?1:0);
