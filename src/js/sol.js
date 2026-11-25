/* ===== El sol: dónde está a cada hora y en cada sitio (sin conexión) =====
   Fórmulas aproximadas del U.S. Naval Observatory («Approximate Solar Coordinates»): precisión de unas décimas de grado,
   de sobra para saber de dónde viene la luz y cuánto mide una sombra. */
(function(raiz){
const R=Math.PI/180,mod=(a,m)=>((a%m)+m)%m;
// Altura (sobre el horizonte) y acimut (desde el norte, en el sentido de las agujas del reloj), en grados
function posicion(fecha,lat,lon){
  const n=fecha.getTime()/86400000+2440587.5-2451545.0;
  const L=mod(280.460+0.9856474*n,360),g=mod(357.528+0.9856003*n,360)*R;
  const lam=(L+1.915*Math.sin(g)+0.020*Math.sin(2*g))*R,eps=(23.439-0.0000004*n)*R;
  const ra=Math.atan2(Math.cos(eps)*Math.sin(lam),Math.cos(lam)),dec=Math.asin(Math.sin(eps)*Math.sin(lam));
  const gmst=mod(18.697374558+24.06570982441908*n,24),H=mod(gmst*15+lon-ra/R+180,360)-180;
  const f=lat*R,h=H*R;
  const alt=Math.asin(Math.sin(f)*Math.sin(dec)+Math.cos(f)*Math.cos(dec)*Math.cos(h))/R;
  const az=mod(Math.atan2(Math.sin(h),Math.cos(h)*Math.sin(f)-Math.tan(dec)*Math.cos(f))/R+180,360);
  // refracción del aire cerca del horizonte (Bennett): el sol se ve un poco más alto
  const ref=alt>-1?1.02/Math.tan((alt+10.3/(alt+5.11))*R)/60:0;
  return {alt:alt+ref,altReal:alt,az,dec:dec/R}}
// Momento (Date) del día local «dia» (Date a las 0:00) en que la altura real cruza «umbral», buscando en un tramo
function cruce(dia,lat,lon,umbral,desde,hasta,sube){
  const f=m=>posicion(new Date(dia.getTime()+m*60000),lat,lon).altReal-umbral;let prev=f(desde);
  for(let m=desde+5;m<=hasta;m+=5){const v=f(m);if(sube?(prev<0&&v>=0):(prev>0&&v<=0)){let a=m-5,b=m;for(let k=0;k<12;k++){const c=(a+b)/2,fc=f(c);if((fc<0)===sube?true:false)a=c;else b=c}
      return new Date(dia.getTime()+(a+b)/2*60000)}prev=v}return null}
// Resumen del día: salida, puesta, mediodía solar (altura máxima) y horas doradas (sol entre −4° y 6°)
function dia(dia,lat,lon){
  let mx=-99,mm=0;for(let m=0;m<1440;m+=5){const a=posicion(new Date(dia.getTime()+m*60000),lat,lon).altReal;if(a>mx){mx=a;mm=m}}
  for(let m=mm-5;m<=mm+5;m+=0.5){const a=posicion(new Date(dia.getTime()+m*60000),lat,lon).altReal;if(a>mx){mx=a;mm=m}}
  const salida=cruce(dia,lat,lon,-0.833,0,mm,true),puesta=cruce(dia,lat,lon,-0.833,mm,1440,false);
  const d1=cruce(dia,lat,lon,6,0,mm,true),d2=cruce(dia,lat,lon,6,mm,1440,false);
  return {salida,puesta,mediodia:new Date(dia.getTime()+mm*60000),altMax:mx,doradaM:salida&&d1?[salida,d1]:null,doradaT:puesta&&d2?[d2,puesta]:null}}
// Puntos cardinales en palabras
const RUMBOS=['norte','nornordeste','nordeste','estenordeste','este','estesudeste','sudeste','sursudeste','sur','sursuroeste','suroeste','oestesuroeste','oeste','oestenoroeste','noroeste','nornoroeste'];
const RUMBOS8=['norte','nordeste','este','sudeste','sur','suroeste','oeste','noroeste'];
const rumbo=(az,fino)=>fino?RUMBOS[Math.round(mod(az,360)/22.5)%16]:RUMBOS8[Math.round(mod(az,360)/45)%8];
// Largo de la sombra de algo de alto h con el sol a «alt» grados
const sombra=(h,alt)=>alt>0.5?h/Math.tan(alt*R):Infinity;
const SOL={posicion,dia,rumbo,sombra};
raiz.SOL=SOL;if(typeof module!=='undefined')module.exports=SOL;
})(typeof window!=='undefined'?window:globalThis);
