/* ===== Aprender perspectiva: lecciones cortas con un dibujo que se mueve =====
   Textos propios a partir de los libros citados en cada lección y en Ajustes › Los libros. */
const LAMINA={cielo:'#eef1f0',suelo:'#e6dccb',tinta:'#1d1a16',guia:'#9a4527',caras:['#f3e7d2','#e2c9a6','#d6b48c'],techo:'#cfc3b0'};
function svgEscena(cam,cajas,o){o=o||{};const W=cam.w,H=cam.h,hy=cam.horizonteY;
  let s=`<rect width="${W}" height="${H}" fill="${LAMINA.cielo}"/><rect y="${Math.min(H,Math.max(0,hy))}" width="${W}" height="${Math.max(0,H-hy)}" fill="${LAMINA.suelo}"/>`;
  if(o.antes)s+=o.antes;
  const caras=ESCENA.proyectar(cam,cajas),R=Math.PI/180;
  // guías a los puntos de fuga desde las esquinas de las caras visibles
  const fugas={};
  if(o.guias!==false)for(const {f,pp} of caras){if(f.tipo==='techo')continue;const d=[f.pts[1][0]-f.pts[0][0],0,f.pts[1][2]-f.pts[0][2]],v=cam.dir(d)||null;
    if(!v||!v.delante&&!cam.dir(d.map(x=>-x)).delante)continue;const P=v.delante?v.p:cam.dir(d.map(x=>-x)).p;
    const k=Math.round(Math.atan2(d[2],d[0])/R+360)%180;fugas[k]=P;
    if(Math.abs(P[0])>W*8)continue;for(const q of pp)s+=`<line x1="${q[0].toFixed(1)}" y1="${q[1].toFixed(1)}" x2="${P[0].toFixed(1)}" y2="${P[1].toFixed(1)}" stroke="${LAMINA.guia}" stroke-width="1" stroke-dasharray="4 4" opacity=".7"/>`}
  for(const {f,pp,hs} of caras){const t=f.tipo==='techo'?LAMINA.techo:f.tipo==='lado'?LAMINA.caras[2]:LAMINA.caras[1];
    s+=`<polygon points="${ESCENA.pts(pp)}" fill="${f.color||t}" stroke="${LAMINA.tinta}" stroke-width="1.6" stroke-linejoin="round"/>`;
    for(const w of hs)s+=`<polygon points="${ESCENA.pts(w)}" fill="${LAMINA.tinta}" fill-opacity=".62"/>`}
  if(o.personas)for(const [x,z,a] of o.personas)s+=ESCENA.persona(cam,x,z,a||1.7,'').replace('<g class="">',`<g fill="${LAMINA.tinta}">`);
  if(o.despues)s+=o.despues;
  if(o.horizonte!==false&&hy>-50&&hy<H+50){s+=`<line x1="0" y1="${hy}" x2="${W}" y2="${hy}" stroke="#fff" stroke-width="4.5" opacity=".8"/><line x1="0" y1="${hy}" x2="${W}" y2="${hy}" stroke="${LAMINA.tinta}" stroke-width="2.2" stroke-dasharray="14 5"/>`;
    s+=etiqueta(8,hy-8,'HORIZONTE',16)}
  if(o.letras!==false){const dentro=k=>{const P=fugas[k];return P[0]>-20&&P[0]<W+20&&P[1]>-20&&P[1]<H+20};const ks=Object.keys(fugas).filter(dentro).sort((a,b)=>fugas[a][0]-fugas[b][0]);ks.forEach((k,i)=>{const P=fugas[k];if(true)
    s+=`<circle cx="${P[0]}" cy="${P[1]}" r="11" fill="#fff" stroke="${LAMINA.tinta}" stroke-width="2"/><text x="${P[0]}" y="${P[1]+5}" text-anchor="middle" font-size="14" font-weight="700" fill="${LAMINA.tinta}">${ks.length>1?'ABCDEF'[i]||'':'F'}</text>`})}
  return s}
function etiqueta(x,y,t,tam,anchor){return `<text x="${x}" y="${y}" font-size="${tam||17}" font-weight="700" fill="${LAMINA.tinta}" stroke="#fff" stroke-width="3.5" paint-order="stroke" text-anchor="${anchor||'start'}" font-family="Inter,system-ui,sans-serif">${t}</text>`}
const m=v=>fmt(v,v<10?1:0)+' m';
const LECCIONES=[
 {id:'horizonte',t:'La línea del horizonte',c:[['ojo','Altura de tus ojos',0.4,20,0.1,1.6,m]],
  p:['La línea del horizonte es la línea imaginaria donde se juntarían el cielo y el suelo si nada los tapara. Siempre está a la altura de tus ojos: si te sientas, baja contigo; si subes a la muralla de la Alcazaba, sube contigo.',
   'Por eso, lo primero de un apunte es decidir dónde va el horizonte en el papel y fijarse en qué parte de la fachada queda a la altura de tus ojos: esa parte irá en la línea.',
   'Mueve la altura de los ojos. Con los ojos por encima de los tejados, los ves desde arriba; sentado en el suelo, el horizonte corta las puertas por abajo. En el dibujo la línea no se mueve: lo que cambia es lo que corta.'],
  f:'Bruno Mollière, «La línea del horizonte»; Joseph D’Amelio, cap. 5; Ernest Norling, paso 1.',
  d:v=>{const cam=ESCENA.camara({ojo:v.ojo,f:430,w:600,h:380,pitch:0});return svgEscena(cam,[ESCENA.caja({x:-6,z:16,w:6,d:6,h:9,giro:30,ventanas:true}),ESCENA.caja({x:5,z:24,w:7,d:7,h:6,giro:30,ventanas:true}),ESCENA.caja({x:-1,z:40,w:8,d:8,h:15,giro:30,ventanas:true})],{guias:false,letras:false,personas:[[1.5,10,1.7]]})}},
 {id:'paralelas',t:'Las paralelas se juntan',c:[['giro','Giro de la mirada',-40,40,1,22,v=>fmt(v,0)+'°']],
  p:['Las líneas que en la realidad son paralelas, como el alero y el zócalo de una fachada, en el dibujo se van acercando a medida que se alejan hasta juntarse en un punto del horizonte: el punto de fuga.',
   'Cada grupo de paralelas tiene su propio punto de fuga. Las filas de ventanas de una misma fachada van también a ese punto. Mollière la llama su regla número 2 y Pastrana, «convergencia»: las líneas no se juntan de verdad, solo lo parece.',
   'Gira la mirada: cuando miras la fachada de frente, sus líneas se quedan horizontales y solo fugan las que se alejan de ti.'],
  f:'Bruno Mollière, regla n.º 2; Robert Pastrana, cap. 3 («las tres reglas»); Joseph D’Amelio, cap. 5.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:420,w:600,h:380,yaw:v.giro});return svgEscena(cam,[ESCENA.caja({x:0,z:18,w:16,d:5,h:10,giro:0,ventanas:true})])}},
 {id:'lejos',t:'Lejos: más pequeño y más cerca del horizonte',c:[['dist','Distancia de la persona',3,60,1,12,m]],
  p:['Las cosas iguales se ven más pequeñas cuanto más lejos están. Es la disminución, la segunda regla de Pastrana.',
   'Y, como insiste Dong Ho Kim, cuanto más lejos está algo, más se acerca a la línea del horizonte: los pies de la gente lejana suben en el papel y la base de las farolas del fondo acaba casi pegada a la línea.',
   'Mueve a la persona por la calle y fíjate en sus pies.'],
  f:'Robert Pastrana, cap. 3; Dong Ho Kim, parte 2; Phil Metzger, cap. 3.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:430,w:600,h:380});const faro=[];for(let z=6;z<=90;z+=12){faro.push(ESCENA.caja({x:-3.2,z,w:0.15,d:0.15,h:4.5,color:'#6b6256'}),ESCENA.caja({x:3.2,z,w:0.15,d:0.15,h:4.5,color:'#6b6256'}))}
   return svgEscena(cam,faro,{guias:false,letras:false,personas:[[0.8,v.dist,1.7]],antes:`<polygon points="${ESCENA.pts([cam.ver([-2.5,0,2]),cam.ver([2.5,0,2]),cam.ver([2.5,0,400]),cam.ver([-2.5,0,400])])}" fill="#d6c9b2"/>`})}},
 {id:'arriba',t:'Arriba bajan, abajo suben',c:[['ojo','Altura de tus ojos',0.5,14,0.1,4.5,m]],
  p:['Bruno Mollière resume casi toda la perspectiva en una regla: desde la arista más cercana del edificio, las líneas horizontales bajan si están por encima de tu horizonte, suben si están por debajo y van planas si quedan justo a la altura de tus ojos. Según él, ahí está el 80 % de la perspectiva.',
   'Cuanto más lejos del horizonte está una línea, más inclinada sale: el alero de un edificio alto baja mucho; un escalón cerca del suelo sube mucho.',
   'Antes de trazar una horizontal, pregúntate si está por encima o por debajo de tus ojos.'],
  f:'Bruno Mollière, «La arista más cercana» y regla n.º 1.',
  d:v=>{const cam=ESCENA.camara({ojo:v.ojo,f:330,w:600,h:380}),k=ESCENA.caja({x:0,z:24,w:9,d:9,h:12,giro:38});let s='';
   const cerca=k.esquinas.b.map((b,i)=>[i,cam.prof(b)]).sort((a,b)=>a[1]-b[1])[0][0],B=k.esquinas.b[cerca];
   for(const y of [0,3,6,9,12]){const p=cam.ver([B[0],y,B[2]]);if(!p)continue;const d=y-v.ojo;const t=Math.abs(d)<0.35?'plana':d>0?'baja':'sube';
     for(const j of [(cerca+1)%4,(cerca+3)%4]){const C=k.esquinas.b[j],q=cam.ver([C[0],y,C[2]]);if(q)s+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${LAMINA.tinta}" stroke-width="${t==='plana'?3.5:2.2}"/>`}
     s+=etiqueta(p[0]+10,p[1]+(t==='sube'?20:-8),t,20)}
   return svgEscena(cam,[k],{despues:s})}},
 {id:'unpunto',t:'Un punto de fuga: la calle de frente',c:[['x','Dónde te pones en la calle',-5,5,0.1,0,v=>v===0?'en el centro':fmt(Math.abs(v),1)+' m a la '+(v<0?'izquierda':'derecha')],['ojo','Altura de tus ojos',0.5,10,0.1,1.6,m]],
  p:['Cuando miras una calle de frente, las fachadas de los lados, los bordillos y los aleros van todos a un solo punto de fuga, en el horizonte, justo enfrente de ti.',
   'Las líneas de lo que ves de frente siguen horizontales y las verticales, verticales. Es la perspectiva más sencilla y la mejor para empezar.',
   'Si te mueves a un lado de la calle, el punto de fuga se mueve contigo: siempre está enfrente de tus ojos.'],
  f:'Ernest Norling, pasos 3 y 4; Jorge Paricio, cap. 1; Bruno Mollière.',
  d:v=>{const cam=ESCENA.camara({ojo:v.ojo,f:380,w:600,h:380,cx:v.x});const c=[];for(let i=0;i<5;i++){c.push(ESCENA.caja({x:-9,z:10+i*11,w:8,d:10,h:7+((i*5)%7),ventanas:true}),ESCENA.caja({x:9,z:12+i*11,w:8,d:10,h:8+((i*3)%6),ventanas:true}))}
   return svgEscena(cam,c,{letras:true})}},
 {id:'dospuntos',t:'Dos puntos de fuga: la esquina',c:[['giro','Giro del edificio',8,82,1,40,v=>fmt(v,0)+'°']],
  p:['Ante una esquina ves dos fachadas, y cada una tiene su punto de fuga: los dos en el horizonte, uno a la izquierda (A) y otro a la derecha (B). Las verticales siguen verticales.',
   'Gira el edificio. Cuando una fachada se pone casi de frente, su punto de fuga se va muy lejos, fuera del papel, y el de la otra fachada se acerca.',
   'En la calle, busca primero la arista más cercana: desde ella salen las dos fachadas, cada una hacia su punto.'],
  f:'Ernest Norling, pasos 5 a 7; Sarah Haley, cap. 4; Robert Pastrana, cap. 5.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:330,w:600,h:380});return svgEscena(cam,[ESCENA.caja({x:0,z:17,w:9,d:9,h:11,giro:v.giro,ventanas:true})],{personas:[[-3,10,1.7]]})}},
 {id:'cuadrados',t:'Busca cuadrados',c:[['ancho','Ancho de la fachada',3,15,0.5,9,v=>fmt(v,1)+' m'],['alto','Alto hasta el alero',3,9,0.5,6,v=>fmt(v,1)+' m']],
  p:['Para que un edificio no salga demasiado alto ni demasiado ancho, Stephanie Bower aconseja verlo primero como formas sencillas (cuadrados y rectángulos) y medir con el lápiz cuántas veces cabe el alto en el ancho. Cerrar un ojo ayuda, porque aplana lo que ves.',
   'Esa proporción es la que pasas al papel: no importa el tamaño, sino la relación. Esta fachada mide, por ejemplo, un cuadrado y medio.',
   'Y para encontrar el centro de una pared (donde va el pico del tejado o la puerta principal), traza sus diagonales: se cruzan en el centro, también en perspectiva. En la etapa Encaje, «Proporciones» hace todo esto sobre tu foto, deshaciendo la perspectiva.'],
  x:v=>ENCAJE.textoProporcion(v.ancho/v.alto)+'.',
  f:'Stephanie Bower, «Proportions and measuring» y el uso de las diagonales; Matthew Brehm, «Pencil sighting».',
  d:v=>{const k=Math.min(470/v.ancho,250/(v.alto+2.5)),W=v.ancho*k,H=v.alto*k,x0=300-W/2,y0=350,top=y0-H,pk=top-1.6*k;
   let s=`<rect width="600" height="380" fill="#fbf7ee"/><polygon points="${x0},${y0} ${x0+W},${y0} ${x0+W},${top} ${x0},${top}" fill="${LAMINA.caras[0]}" stroke="${LAMINA.tinta}" stroke-width="2.6"/>`;
   s+=`<polygon points="${x0-8},${top} ${x0+W+8},${top} ${300},${pk}" fill="${LAMINA.techo}" stroke="${LAMINA.tinta}" stroke-width="2.6"/>`;
   const dw=Math.min(1.4*k,W*0.25);s+=`<rect x="${300-dw/2}" y="${y0-2.3*k}" width="${dw}" height="${2.3*k}" fill="${LAMINA.tinta}" fill-opacity=".55"/>`;
   for(const fx of [.2,.8])if(W>4*k)s+=`<rect x="${x0+W*fx-0.6*k}" y="${top+H*0.2}" width="${1.2*k}" height="${1.5*k}" fill="${LAMINA.tinta}" fill-opacity=".55"/>`;
   const r=v.ancho/v.alto;if(r>=1){for(let i=1;i*H<W-1e-6;i++)s+=`<line x1="${x0+i*H}" y1="${top}" x2="${x0+i*H}" y2="${y0}" stroke="${LAMINA.guia}" stroke-width="2.2" stroke-dasharray="10 5"/>`}
   else{for(let i=1;i*W<H-1e-6;i++)s+=`<line x1="${x0}" y1="${y0-i*W}" x2="${x0+W}" y2="${y0-i*W}" stroke="${LAMINA.guia}" stroke-width="2.2" stroke-dasharray="10 5"/>`}
   s+=`<line x1="${x0}" y1="${y0}" x2="${x0+W}" y2="${top}" stroke="${LAMINA.tinta}" stroke-width="1.2" stroke-dasharray="4 4"/><line x1="${x0+W}" y1="${y0}" x2="${x0}" y2="${top}" stroke="${LAMINA.tinta}" stroke-width="1.2" stroke-dasharray="4 4"/><line x1="300" y1="${pk}" x2="300" y2="${y0}" stroke="${LAMINA.tinta}" stroke-width="1" stroke-dasharray="2 4"/>`;
   return s+etiqueta(12,28,fmt(Math.max(r,1/r),2)+(r>=1?' cuadrados a lo ancho':' cuadrados a lo alto'),18)}},
 {id:'muchos',t:'Muchos puntos de fuga',c:[['giro','Giro de la casa del centro',5,85,1,30,v=>fmt(v,0)+'°']],
  p:['En las calles de verdad, sobre todo en los cascos antiguos, las casas no están alineadas en una cuadrícula: cada fachada mira hacia un lado y tiene su propio punto de fuga. Matthew Brehm llega a contar seis en una sola calle.',
   'La buena noticia: si las fachadas son verticales y sus aleros horizontales, todos esos puntos están en la misma línea, el horizonte. Basta con encontrarlo una vez.',
   'Gira la casa del centro y mira cómo sus puntos de fuga se mueven por el horizonte sin salirse de él. En la etapa Encaje, «Otra fachada» añade una letra más: con una sola recta, la app la prolonga hasta el horizonte y te da su punto.'],
  f:'Matthew Brehm, «Multi-point perspective»; Bruno Mollière, regla n.º 2.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:300,w:600,h:380});return svgEscena(cam,[ESCENA.caja({x:-13,z:30,w:8,d:8,h:9,giro:12,ventanas:true}),ESCENA.caja({x:0,z:24,w:8,d:8,h:11,giro:v.giro,ventanas:true}),ESCENA.caja({x:13,z:32,w:8,d:8,h:8,giro:72,ventanas:true})],{personas:[[-2,12,1.7]]})}},
 {id:'nojuntes',t:'No juntes los puntos de fuga',c:[['f','Distancia del ojo al papel',110,900,10,330,v=>v<220?'muy cerca':v<420?'normal':'lejos']],
  p:['Si en tu cuaderno colocas los dos puntos de fuga muy juntos, el edificio sale deformado, como estirado hacia ti. Es el error más corriente al empezar, y Ernest Norling le dedica un paso entero.',
   'Vemos con nitidez dentro de un cono de unos 60°. Lo que queda fuera se deforma, como en los bordes de las fotos del móvil, que usan gran angular. Pastrana, D’Amelio y Haley lo explican con el «cono de visión»: el círculo del dibujo.',
   'Una regla práctica: la esquina más cercana, abajo, no debería formar un ángulo más cerrado que recto (90°). Si sale más cerrado, separa los puntos, aunque se salgan del papel.'],
  f:'Ernest Norling, paso 6; Joseph D’Amelio, cap. 9; Robert Pastrana, cap. 4; Sarah Haley, cap. 8; Dong Ho Kim, parte 4.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:v.f,w:600,h:380}),z=v.f/330*22,k=ESCENA.caja({x:0,z,w:8,d:8,h:8,giro:45,ventanas:true});
   const r=v.f*Math.tan(Math.PI/6);const B=k.esquinas.b.map(b=>[b,cam.prof(b)]).sort((a,b)=>a[1]-b[1]);const c0=cam.ver(B[0][0]),c1=cam.ver(B[1][0]),c2=cam.ver(B[2][0]);
   let ang=null;if(c0&&c1&&c2){const a=GEOM.sub(c1,c0),b=GEOM.sub(c2,c0);ang=Math.acos(GEOM.dot(a,b)/(GEOM.len(a)*GEOM.len(b)))*180/Math.PI}
   return svgEscena(cam,[k],{despues:`<circle cx="300" cy="190" r="${r}" fill="none" stroke="${LAMINA.tinta}" stroke-width="2" stroke-dasharray="3 3 12 3"/>`+etiqueta(300,Math.max(20,190-r-8),'cono de 60°',16,'middle')+(ang?etiqueta(c0[0],Math.min(372,c0[1]+26),'esquina: '+fmt(ang,0)+'°'+(ang<90?' (deformada)':''),19,'middle'):'')})}},
 {id:'curvilinea',t:'Perspectiva curvilínea',c:[['ancho','Anchura de la vista',60,170,5,140,v=>fmt(v,0)+'°'],['tipo','Cómo se dibuja',0,1,1,1,v=>v?'curvilínea':'lineal']],
  p:['Las perspectivas de uno, dos y tres puntos funcionan bien dentro del cono de visión de unos 60°. Si quieres meter en el dibujo lo que ves por el rabillo del ojo, las líneas rectas tienen que curvarse: es la perspectiva curvilínea.',
   'Brehm la usa para calles vistas de frente: los aleros de la acera de enfrente se curvan y bajan hacia un punto de fuga a la izquierda y otro a la derecha, los dos en el horizonte, que es la única línea que sigue recta.',
   'Compara con la perspectiva lineal a la misma anchura: los extremos se estiran muchísimo. Es lo que hacen el gran angular y las fotos panorámicas del móvil.'],
  f:'Matthew Brehm, «Curvilinear perspective»; Dong Ho Kim, parte 4 (gran angular y ojo de pez).',
  d:v=>{const W=600,H=380,hy=190,ojo=1.6,Zf=10,ang=v.ancho*Math.PI/180,cur=v.tipo===1;
   const f=cur?(W/2)/(ang/2):(W/2)/Math.tan(Math.min(ang/2,1.48));
   const P=(X,Y,Z)=>{if(cur){const th=Math.atan2(X,Z),r=Math.hypot(X,Z);return [W/2+f*th,hy-f*(Y-ojo)/r]}return Z>0.05?[W/2+f*X/Z,hy-f*(Y-ojo)/Z]:null};
   const linea=(a,b,n,extra)=>{let d='';for(let i=0;i<=n;i++){const t=i/n,q=P(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t);if(!q)continue;d+=(d?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)}return `<path d="${d}" fill="none" stroke="${LAMINA.tinta}" ${extra||'stroke-width="2"'}/>`};
   const X0=-70,X1=70,alto=10.5;let s=`<rect width="600" height="380" fill="${LAMINA.cielo}"/><rect y="${hy}" width="600" height="190" fill="${LAMINA.suelo}"/>`;
   // fachada de enfrente rellena
   let d='';for(let i=0;i<=80;i++){const q=P(X0+(X1-X0)*i/80,alto,Zf);if(q)d+=(d?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)}for(let i=80;i>=0;i--){const q=P(X0+(X1-X0)*i/80,0,Zf);if(q)d+='L'+q[0].toFixed(1)+' '+q[1].toFixed(1)}
   s+=`<path d="${d}Z" fill="${LAMINA.caras[1]}"/>`;
   for(const y of [0,3.5,7,alto])s+=linea([X0,y,Zf],[X1,y,Zf],120,`stroke-width="${y===0||y===alto?2.4:1.3}"`);
   for(let x=-68;x<=68;x+=8)s+=linea([x,0,Zf],[x,alto,Zf],2);
   for(let x=-66;x<=66;x+=4)for(const y of [1,4.5,8]){const q=[[x,y,Zf],[x+1.4,y,Zf],[x+1.4,y+1.7,Zf],[x,y+1.7,Zf]].map(a=>P(...a));if(q.every(Boolean))s+=`<polygon points="${ESCENA.pts(q)}" fill="${LAMINA.tinta}" fill-opacity=".55"/>`}
   s+=linea([X0,0,2.5],[X1,0,2.5],120,'stroke-width="2" stroke-dasharray="8 6"');
   s+=`<line x1="0" y1="${hy}" x2="600" y2="${hy}" stroke="#fff" stroke-width="4.5" opacity=".8"/><line x1="0" y1="${hy}" x2="600" y2="${hy}" stroke="${LAMINA.tinta}" stroke-width="2.2" stroke-dasharray="14 5"/>`+etiqueta(8,hy-8,'HORIZONTE',16);
   if(cur){for(const sg of [-1,1]){const x=W/2+sg*f*Math.PI/2;if(x>-10&&x<W+10)s+=`<circle cx="${x}" cy="${hy}" r="11" fill="#fff" stroke="${LAMINA.tinta}" stroke-width="2"/>`}}
   return s+etiqueta(300,30,cur?'los aleros se curvan; el horizonte, recto':'los extremos se estiran',17,'middle')}},
 {id:'personas',t:'Personas a escala',c:[['ojo','Altura de tus ojos',1,1.9,0.05,1.6,m]],
  p:['En suelo llano, si estás de pie, las cabezas de la gente que también está de pie quedan más o menos en tu horizonte, estén cerca o lejos. Lo que cambia es dónde ponen los pies.',
   'Si te sientas, el horizonte baja y las cabezas quedan por encima. Alguien más alto que tú asoma un poco por encima de la línea; un niño queda por debajo.',
   'Con el mismo truco se miden alturas: el horizonte corta todo lo vertical a la altura de tus ojos. Si una puerta mide dos veces lo que hay del suelo al horizonte, mide el doble que tus ojos. En la etapa Encaje, «Medir alturas» lo hace por ti.'],
  f:'Ernest Norling, paso 9; Robert Pastrana, cap. 8; Joseph D’Amelio, cap. 10.',
  d:v=>{const cam=ESCENA.camara({ojo:v.ojo,f:430,w:600,h:380});return svgEscena(cam,[ESCENA.caja({x:-9,z:30,w:8,d:30,h:9,ventanas:true}),ESCENA.caja({x:10,z:34,w:8,d:30,h:11,ventanas:true})],{personas:[[-1.5,5,1.72],[1.6,9,1.65],[-0.5,16,1.75],[2.5,28,1.7],[-2,45,1.68],[0.4,70,1.72],[3,7,1.1]]})}},
 {id:'trespuntos',t:'Tres puntos de fuga: mirar hacia arriba',c:[['pitch','Inclinación de la mirada',-30,45,1,22,v=>v===0?'de frente':fmt(Math.abs(v),0)+'° hacia '+(v>0?'arriba':'abajo')]],
  p:['Si levantas la mirada para ver una torre, sus verticales dejan de ser paralelas en el dibujo y se juntan en un tercer punto de fuga, muy arriba. Si miras hacia abajo desde un mirador, se juntan por debajo.',
   'Mirando hacia arriba, el horizonte baja en el papel; mirando hacia abajo, sube, aunque siga a la altura de tus ojos.',
   'En urban sketching muchas veces basta con inclinar un poco las verticales para que se note que miras hacia arriba.'],
  f:'Sarah Haley, cap. 5; Robert Pastrana, cap. 13; Joseph D’Amelio, cap. 8.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:300,w:600,h:380,pitch:v.pitch});const V=cam.dir([0,1,0]);let s='';
   const k=ESCENA.caja({x:0,z:14,w:7,d:7,h:30,giro:35,ventanas:true});
   if(V){const P=V.delante?V.p:cam.dir([0,-1,0]).p;for(const b of k.esquinas.b){const q=cam.ver(b);if(q&&Math.abs(P[1])<4000)s+=`<line x1="${q[0]}" y1="${q[1]}" x2="${P[0]}" y2="${P[1]}" stroke="${LAMINA.guia}" stroke-width="1" stroke-dasharray="2 4" opacity=".8"/>`}
     if(P[1]>-20&&P[1]<400)s+=`<circle cx="${P[0]}" cy="${P[1]}" r="11" fill="#fff" stroke="${LAMINA.tinta}" stroke-width="2"/>`+etiqueta(P[0],P[1]+4.5,'V',13,'middle')}
   return svgEscena(cam,[k],{despues:s})}},
 {id:'cuesta',t:'Calles en cuesta',c:[['pend','Pendiente de la calle',-18,18,1,10,v=>v===0?'llana':fmt(Math.abs(v),0)+'° hacia '+(v>0?'arriba':'abajo')]],
  p:['En una calle que sube, el suelo y las aceras van a un punto de fuga que está por encima del horizonte, justo encima del punto de fuga que tendría la calle llana. Si la calle baja, ese punto queda por debajo.',
   'Las casas no se inclinan: sus verticales siguen verticales y las líneas de sus ventanas y aleros van al horizonte. Por eso las fachadas se escalonan.',
   'Fíjate en las cuestas del barrio de la Alcazaba: las ventanas van al horizonte; la calle, más arriba.'],
  f:'Robert Pastrana, cap. 10; Phil Metzger, parte 3 («calles en cuesta»); Craig Attebery, cap. 9; Dong Ho Kim, parte 5.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:380,w:600,h:380});const t=Math.tan(v.pend*Math.PI/180),c=[];
   for(let i=0;i<6;i++){const z=8+i*8;c.push(ESCENA.caja({x:-7,z,w:6,d:8,h:7,y0:z*t-1.5,ventanas:true}),ESCENA.caja({x:7,z:z+3,w:6,d:8,h:6.5,y0:(z+3)*t-1.5,ventanas:true}))}
   const S=cam.dir([0,t,1]),F=cam.dir([0,0,1]);let s='';const calle=[cam.ver([-4,4*t,4]),cam.ver([4,4*t,4]),cam.ver([4,90*t,90]),cam.ver([-4,90*t,90])];
   const antes=calle.every(Boolean)?`<polygon points="${ESCENA.pts(calle)}" fill="#cbbb9f" stroke="${LAMINA.tinta}" stroke-width="1.2"/>`:'';
   if(S&&S.delante&&F){for(const x of [-4,4]){const q=cam.ver([x,4*t,4]);if(q)s+=`<line x1="${q[0]}" y1="${q[1]}" x2="${S.p[0]}" y2="${S.p[1]}" stroke="${LAMINA.guia}" stroke-width="1.2" stroke-dasharray="6 4"/>`}
     s+=`<line x1="${F.p[0]}" y1="${F.p[1]}" x2="${S.p[0]}" y2="${S.p[1]}" stroke="${LAMINA.tinta}" stroke-width="1" stroke-dasharray="2 3"/>`;
     if(S.p[1]>-10&&S.p[1]<390)s+=`<circle cx="${S.p[0]}" cy="${S.p[1]}" r="9" fill="#fff" stroke="${LAMINA.tinta}" stroke-width="2"/>`+etiqueta(S.p[0]+14,S.p[1]+5,'fuga de la cuesta',17)}
   return svgEscena(cam,c,{antes,despues:s,letras:false})}},
 {id:'escaleras',t:'Escaleras',c:[['n','Peldaños',3,14,1,8,v=>String(v)],['ojo','Altura de tus ojos',0.6,6,0.1,1.6,m]],
  p:['Phil Metzger aconseja imaginar primero la escalera como una cuña, una rampa que va del suelo hasta donde llega. La pendiente de esa rampa fuga a un punto por encima del horizonte, como una calle en cuesta.',
   'Después se divide la altura en tantos peldaños iguales como haga falta y se llevan esas marcas hacia el punto de fuga de la fachada. Con ellas se levantan las tabicas, que son verticales, y las huellas, que son horizontales.',
   'Fíjate en las huellas: de los peldaños que quedan cerca de la altura de tus ojos ves muy poca huella, y de los de abajo, más. Por encima de tus ojos ya no se ven: solo se ven las tabicas y los bordes.'],
  f:'Phil Metzger, parte 3, problema 8 («Stairs»); Craig Attebery, capítulos de planos inclinados.',
  d:v=>{const cam=ESCENA.camara({ojo:v.ojo,f:400,w:600,h:380,yaw:22,cx:-4.5}),n=v.n,run=4/n,rise=2.4/n,c=[];
   for(let i=0;i<n;i++)c.push(ESCENA.caja({x:0,z:7+i*run+run/2,w:3.2,d:run,h:(i+1)*rise,color:i%2?'#efe3cc':'#e2d2b6'}));
   c.push(ESCENA.caja({x:0,z:12.5,w:8,d:3,h:2.4,color:'#e2c9a6'}),ESCENA.caja({x:0,z:14.5,w:8,d:1,h:7,ventanas:true}));
   const S=cam.dir([0,2.4,4]);let s='';
   if(S&&S.delante){for(const x of [-1.6,1.6]){const q=cam.ver([x,0,7]);if(q)s+=`<line x1="${q[0]}" y1="${q[1]}" x2="${S.p[0]}" y2="${S.p[1]}" stroke="${LAMINA.guia}" stroke-width="1.4" stroke-dasharray="6 4"/>`}
     if(S.p[1]>-10&&S.p[1]<390)s+=`<circle cx="${S.p[0]}" cy="${S.p[1]}" r="9" fill="#fff" stroke="${LAMINA.tinta}" stroke-width="2"/>`+etiqueta(S.p[0]+14,S.p[1]+5,'fuga de la rampa',16)}
   return svgEscena(cam,c,{despues:s,letras:false,guias:false})}},
 {id:'arcos',t:'Arcos y círculos',c:[['giro','Giro de la pared',-55,55,1,30,v=>fmt(v,0)+'°'],['ojo','Altura de tus ojos',0.5,6,0.1,1.6,m]],
  p:['Los círculos casi nunca se ven redondos: en perspectiva son elipses. Stephanie Bower lo resuelve con un cuadrado. Primero dibuja un cuadrado en perspectiva, con sus puntos de fuga. Después traza sus diagonales para encontrar el centro.',
   'Por ese centro, las líneas que dividen el cuadrado en cuatro tocan sus lados en los cuatro puntos por donde pasa la elipse. Solo queda unirlos con curvas suaves. Con medio cuadrado sale un arco: el de una puerta, una ventana o una bóveda.',
   'Un detalle que avisa Bower: la parte más ancha de la elipse no pasa por el centro del cuadrado, sino un poco más cerca de ti. Gira la pared y sube los ojos para ver cómo cambian.'],
  f:'Stephanie Bower, capítulo de elipses, arcos y cúpulas; Phil Metzger, «Where circles become ellipses».',
  d:v=>{const cam=ESCENA.camara({ojo:v.ojo,f:400,w:600,h:380}),k=ESCENA.caja({x:-2.6,z:10,w:7,d:0.6,h:5,giro:v.giro,color:'#efe1c6'});
   const P=k.P,lz=-0.32,pp=a=>a.map(cam.ver),ok=a=>a.every(Boolean),pl=(a,ex)=>ok(a)?`<polyline points="${ESCENA.pts(a)}" fill="none" ${ex}/>`:'';let s='';
   const G=`stroke="${LAMINA.guia}" stroke-width="1.3" stroke-dasharray="5 4"`,T=`stroke="${LAMINA.tinta}" stroke-width="2.6"`;
   // arco de la puerta: medio cuadrado sobre las jambas
   const r=1.3,y0=2.3,arco=[];for(let i=0;i<=40;i++){const t=Math.PI*i/40;arco.push(P(-r*Math.cos(t),y0+r*Math.sin(t),lz))}
   const sq=pp([P(-r,y0,lz),P(r,y0,lz),P(r,y0+r,lz),P(-r,y0+r,lz),P(-r,y0,lz)]);s+=pl(sq,G)+pl(pp([P(-r,y0,lz),P(r,y0+r,lz)]),G)+pl(pp([P(r,y0,lz),P(-r,y0+r,lz)]),G)+pl(pp([P(0,y0,lz),P(0,y0+r,lz)]),G);
   const hueco=pp([P(-r,0,lz),...arco,P(r,0,lz)]);if(ok(hueco))s+=`<polygon points="${ESCENA.pts(hueco)}" fill="${LAMINA.tinta}" fill-opacity=".5"/>`;s+=pl(hueco,T);
   // círculo en el suelo (una fuente): cuadrado, diagonales, cruz y los cuatro puntos
   const cx=2.1,cz=6,R2=1.3,C=(x,z)=>[cx+x,0,cz+z],sq2=pp([C(-R2,-R2),C(R2,-R2),C(R2,R2),C(-R2,R2),C(-R2,-R2)]);
   s+=pl(sq2,G)+pl(pp([C(-R2,-R2),C(R2,R2)]),G)+pl(pp([C(R2,-R2),C(-R2,R2)]),G)+pl(pp([C(0,-R2),C(0,R2)]),G)+pl(pp([C(-R2,0),C(R2,0)]),G);
   const el=[];for(let i=0;i<=64;i++){const t=2*Math.PI*i/64;el.push(C(R2*Math.cos(t),R2*Math.sin(t)))}const ep=pp(el);if(ok(ep))s+=`<polygon points="${ESCENA.pts(ep)}" fill="#86acd2" fill-opacity=".5" ${T}/>`;
   for(const q of pp([C(0,-R2),C(R2,0),C(0,R2),C(-R2,0),P(-r,y0,lz),P(0,y0+r,lz),P(r,y0,lz)]))if(q)s+=`<circle cx="${q[0]}" cy="${q[1]}" r="5" fill="#fff" stroke="${LAMINA.tinta}" stroke-width="2"/>`;
   return svgEscena(cam,[k],{despues:s,guias:false,letras:false})}},
 {id:'lapiz',t:'Mirar con el lápiz',c:[['giro','Giro del edificio',10,80,1,35,v=>fmt(v,0)+'°']],
  p:['Matthew Brehm propone dos trucos para comprobar el dibujo sin instrumentos. El primero es dibujar «a la medida»: sostén el cuaderno levantado junto al motivo y acércalo o aléjalo hasta que tu dibujo y lo que ves tengan el mismo tamaño. Así se ven enseguida los ángulos y las proporciones que se han ido.',
   'El segundo, con el lápiz: cierra un ojo, estira el brazo siempre igual y pon el lápiz horizontal junto al alero para ver qué ángulo forma. O úsalo de regla, marcando con el pulgar, para comparar un tamaño con otro: esta ventana es tan alta como ancha; esa fachada, dos veces la otra.',
   'En la etapa Encaje, «Medir con el lápiz» hace lo mismo sobre la foto, y la etapa Comparar pone tu apunte encima de la foto.'],
  f:'Matthew Brehm, «Perspective basics»: sight sizing y pencil sighting; Stephanie Bower, «Proportions and measuring».',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:330,w:600,h:380}),k=ESCENA.caja({x:0,z:30,w:9,d:9,h:9,giro:v.giro,ventanas:true});
   const B=k.esquinas.t.map((b,i)=>[i,cam.prof(b)]).sort((a,b)=>a[1]-b[1]),T=cam.ver(k.esquinas.t[B[0][0]]),vec=[(B[0][0]+1)%4,(B[0][0]+3)%4].map(j=>cam.ver(k.esquinas.t[j]));
   let s=`<g transform="translate(${T[0]} ${T[1]-14})"><rect x="-170" y="-7" width="320" height="14" fill="#e9b949" stroke="${LAMINA.tinta}" stroke-width="1.5"/><polygon points="150,-7 178,0 150,7" fill="#f1d7a8" stroke="${LAMINA.tinta}" stroke-width="1.5"/><polygon points="170,-2 178,0 170,2" fill="${LAMINA.tinta}"/><rect x="-186" y="-7" width="16" height="14" fill="#c96f4a" stroke="${LAMINA.tinta}" stroke-width="1.5"/></g>`;
   for(const q of vec){if(!q)continue;const a=Math.abs(Math.atan2(q[1]-T[1],q[0]-T[0])*180/Math.PI),ang=a>90?180-a:a,lado=q[0]<T[0]?-1:1;
     s+=`<line x1="${T[0]}" y1="${T[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#9a4527" stroke-width="4"/>`+etiqueta(T[0]+lado*95,T[1]+34,fmt(ang,0)+'°',20,'middle')}
   return svgEscena(cam,[k],{despues:s})}},
 {id:'pasoapaso',t:'Un apunte paso a paso',c:[['paso','Paso',1,6,1,1,v=>['encuadre y horizonte','líneas principales','volúmenes','huecos','personas y detalles','valores'][v-1]]],
  x:v=>['Mira primero la escena entera y decide el encuadre con marcas muy suaves. Traza la línea del horizonte, a la altura de tus ojos: ahí estarán los puntos de fuga, aunque se salgan del papel.',
   'Con el lápiz, compara los ángulos de los aleros y los zócalos y traza las líneas principales hacia sus puntos de fuga. Siempre suaves: todavía se pueden mover.',
   'Encaja los volúmenes: la arista más cercana, las alturas y los anchos. Comprueba las proporciones con el lápiz antes de seguir.',
   'Cuando el conjunto está en su sitio, añade puertas, ventanas y balcones. Además ayudan a comprobar la perspectiva: sus filas van a los mismos puntos de fuga.',
   'Personas y detalles, sin perderte en uno solo: Brehm aconseja ir dando vueltas por todo el dibujo en lugar de acabar una zona y pasar a la siguiente.',
   'Por último, los valores: oscurece por capas, de arriba abajo, y comprueba de vez en cuando que los ángulos siguen bien.'][v.paso-1],
  p:['Brehm termina cada capítulo con un «paso a paso» de un apunte real. Todos siguen el mismo orden: primero la estructura y la perspectiva, con líneas suaves, y después los detalles y los valores.',
   'Mueve el paso: lo nuevo de cada paso sale en negro y más grueso; lo de los pasos anteriores, en gris.'],
  f:'Matthew Brehm, «How-to sequence» de los capítulos de uno y dos puntos.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:300,w:600,h:380}),k1=ESCENA.caja({x:-1,z:22,w:9,d:9,h:11,giro:38}),k2=ESCENA.caja({x:12,z:32,w:8,d:8,h:8,giro:38});
   const A=cam.dir([Math.cos(38*Math.PI/180),0,-Math.sin(38*Math.PI/180)]).p,Bv=cam.dir([Math.sin(38*Math.PI/180),0,Math.cos(38*Math.PI/180)]).p,hy=cam.horizonteY;
   const col=n=>n===v.paso?LAMINA.tinta:'#9b9389',an=n=>n===v.paso?2.6:1.3,vis=n=>v.paso>=n;
   let s=`<rect width="600" height="380" fill="#fbf7ee"/>`;
   if(vis(6)){for(const {f,pp} of ESCENA.proyectar(cam,[k1,k2]))if(f.tipo==='lado'||f.tipo==='techo')s+=`<polygon points="${ESCENA.pts(pp)}" fill="#8f8a84" fill-opacity="${f.tipo==='lado'?.45:.2}"/>`}
   if(vis(1))s+=`<rect x="40" y="40" width="520" height="300" fill="none" stroke="${col(1)}" stroke-width="${an(1)}" stroke-dasharray="3 6"/><line x1="20" y1="${hy}" x2="580" y2="${hy}" stroke="${col(1)}" stroke-width="${an(1)+.6}"/>`;
   if(vis(2)){const T=cam.ver(k1.esquinas.t[0]),Bo=cam.ver(k1.esquinas.b[0]);for(const q of [T,Bo])for(const P of [A,Bv])s+=`<line x1="${q[0]}" y1="${q[1]}" x2="${P[0]}" y2="${P[1]}" stroke="${col(2)}" stroke-width="${an(2)*.7}" stroke-dasharray="6 5"/>`;s+=`<line x1="${T[0]}" y1="${T[1]}" x2="${Bo[0]}" y2="${Bo[1]}" stroke="${col(2)}" stroke-width="${an(2)}"/>`}
   if(vis(3))for(const {pp} of ESCENA.proyectar(cam,[k1,k2]))s+=`<polygon points="${ESCENA.pts(pp)}" fill="none" stroke="${col(3)}" stroke-width="${an(3)}" stroke-linejoin="round"/>`;
   if(vis(4)){const kk=[ESCENA.caja({x:-1,z:22,w:9,d:9,h:11,giro:38,ventanas:true}),ESCENA.caja({x:12,z:32,w:8,d:8,h:8,giro:38,ventanas:true})];for(const {hs} of ESCENA.proyectar(cam,kk))for(const w of hs)s+=`<polygon points="${ESCENA.pts(w)}" fill="${vis(6)?LAMINA.tinta:'none'}" fill-opacity="${vis(6)?.6:0}" stroke="${col(4)}" stroke-width="${an(4)*.8}"/>`}
   if(vis(5))for(const [x,z] of [[-4,10],[3,14],[6,26]])s+=ESCENA.persona(cam,x,z,1.7,'').replace('<g class="">',`<g fill="${col(5)}">`);
   return s+etiqueta(12,28,'Paso '+v.paso+' de 6',17)}},
 {id:'atmosfera',t:'Más lejos, más claro',c:[['aire','Aire entre tú y el fondo',0,1,0.05,0.6,v=>v<0.2?'muy limpio':v<0.6?'normal':'con bruma']],
  p:['El aire que hay entre tú y lo que miras aclara y apaga los colores: lo lejano se ve más claro, con menos contraste, menos detalle y algo más azulado. Phil Metzger lo llama perspectiva atmosférica y le dedica la primera parte de su libro.',
   'En la acuarela se aprovecha pintando el fondo con aguadas claras y frías, y guardando los oscuros, los bordes nítidos y los colores fuertes para lo que está cerca.',
   'En la etapa Valores lo verás en tus fotos: los montes del fondo caen casi siempre en el tono claro.'],
  f:'Phil Metzger, cap. 1 y 2; Joseph D’Amelio, cap. 1.',
  d:v=>{const cielo=[214,226,232];let s=`<rect width="600" height="380" fill="rgb(${cielo})"/>`;const capas=[[0.95,'#3b4a3e',150],[0.7,'#3d4b45',200],[0.42,'#30392f',250],[0.12,'#2a2621',300]];
   capas.forEach(([lejos,hex,y],i)=>{const c=COLOR.hexRgb(hex),k=Math.min(1,lejos*v.aire*1.15),col=c.map((x,j)=>Math.round(x*(1-k)+cielo[j]*k));let d=`M0 380L0 ${y}`;for(let x=0;x<=600;x+=30)d+=`L${x} ${y-18*Math.sin(x/70+i*1.7)-10*Math.sin(x/23+i)}`;s+=`<path d="${d}L600 380Z" fill="rgb(${col})"/>`});
   const t=ESCENA.camara({ojo:1.6,f:400,w:600,h:380});s+=ESCENA.siluetaSVG([470,372],[470,300],'').replace('<g class="">','<g fill="#1d1a16">');
   return s+etiqueta(12,28,'lejos: claro y suave',18)+etiqueta(12,370,'cerca: oscuro y con contraste',18)}},
 {id:'tonos',t:'Tres tonos y el plan de aguadas',c:[['paso','Capa',1,4,1,1,v=>['blancos','aguada clara','aguada media','oscuros'][v-1]]],
  p:['Antes de pintar conviene reducir lo que ves a tres manchas: claros, medios y oscuros. Entrecerrar los ojos ayuda, porque desaparecen los detalles y quedan las formas grandes.',
   'La acuarela es transparente: se pinta de claro a oscuro y los blancos son el propio papel. Por eso se planifica por capas, como explica Felix Scheinberger: primero se reservan los blancos; después, una aguada clara en todo lo demás; encima, ya seca, la media; y al final, los oscuros.',
   'Mueve la capa y mira cómo se construye el dibujo. La etapa Valores hace este plan con tus fotos.'],
  f:'Felix Scheinberger, «Capa a capa: el glaseado»; Phil Metzger, cap. 4.',
  d:v=>{const T=[255,206,140,62],k=v.paso-1,g=t=>{const c=k===0?(t===0?255:224):T[Math.min(t,k)];return `rgb(${c},${c},${c})`};
   const piezas=[[`<rect width="600" height="380"`,1],[`<rect y="300" width="600" height="80"`,2],[`<polygon points="120,300 120,90 330,60 330,300"`,0],[`<polygon points="330,300 330,60 480,110 480,300"`,2],
     [`<polygon points="120,90 330,60 480,110 260,135"`,1],[`<rect x="200" y="210" width="50" height="90"`,3],[`<rect x="150" y="130" width="34" height="46"`,3],[`<rect x="250" y="120" width="34" height="46"`,3],[`<polygon points="370,140 400,150 400,195 370,186"`,3],[`<polygon points="120,300 330,300 280,330 60,330"`,2]];
   let s='';for(const [p,t] of piezas)s+=`${p} fill="${g(t)}" stroke="#1d1a16" stroke-width="1.2"/>`;
   return s+etiqueta(12,24,['Paso 1: reserva los blancos','Paso 2: aguada clara en todo lo demás','Paso 3: aguada media, ya seca la anterior','Paso 4: los oscuros, al final'][k],18)}},
 {id:'tramas',t:'Tramas y sombreados',c:[['tipo','Tipo de trama',0,2,1,0,v=>['líneas paralelas','trama cruzada','puntos'][v]],['sep','Separación de los trazos',4,14,1,8,v=>v<7?'muy juntos (más oscuro)':v<11?'normal':'separados (más claro)']],
  p:['Con tinta no hay grises: los tonos se hacen con trazos. Sarah Haley repasa las maneras: líneas paralelas, trama cruzada, líneas que siguen la forma, puntos y garabatos.',
   'La regla es la misma que en la acuarela: lo más claro es el papel sin tocar. Para oscurecer, junta las líneas, hazlas más gruesas o cruza otra capa en otra dirección. Phil Metzger distingue dos sombras: la propia, en la cara que no mira a la luz, y la arrojada, en el suelo, que suele ser más oscura. Aquí la propia lleva una capa y la arrojada, dos.',
   'Mantén la misma dirección en toda una zona para que se lea como un solo tono, y no lo rellenes todo: deja respirar el papel. En la etapa Valores, la vista «Trama» pasa tus fotos a tonos de trama.'],
  f:'Sarah Haley, «Shading»; Phil Metzger, cap. 4; The Urban Sketching Handbook: Understanding Perspective (los apuntes a tinta de Paul Heaston y James Akers).',
  d:v=>{const e=v.sep,sol=[-0.7,0.55,-0.45],cam=ESCENA.camara({ojo:1.6,f:420,w:600,h:380,yaw:-4});
   const pat=(id,capas)=>{let s=`<pattern id="${id}" width="${e}" height="${e}" patternUnits="userSpaceOnUse"${v.tipo===2?'':' patternTransform="rotate(45)"'}><rect width="${e}" height="${e}" fill="#fffdf8"/>`;
     if(v.tipo===2){s+=`<circle cx="${e*0.3}" cy="${e*0.3}" r="1.3" fill="${LAMINA.tinta}"/>`;if(capas>1)s+=`<circle cx="${e*0.8}" cy="${e*0.75}" r="1.3" fill="${LAMINA.tinta}"/><circle cx="${e*0.75}" cy="${e*0.2}" r="1.1" fill="${LAMINA.tinta}"/>`}
     else{s+=`<line x1="0" y1="0" x2="0" y2="${e}" stroke="${LAMINA.tinta}" stroke-width="${capas>1&&v.tipo===0?2.2:1.3}"/>`;if(capas>1&&v.tipo===1)s+=`<line x1="0" y1="${e/2}" x2="${e}" y2="${e/2}" stroke="${LAMINA.tinta}" stroke-width="1.3"/>`;if(capas>1&&v.tipo===0)s+=`<line x1="${e/2}" y1="0" x2="${e/2}" y2="${e}" stroke="${LAMINA.tinta}" stroke-width="1.6"/>`}
     return s+'</pattern>'};
   const k=ESCENA.caja({x:-3,z:22,w:8,d:7,h:9,giro:32,ventanas:true});
   k.caras.forEach(f=>{f.color=f.n[0]*sol[0]+f.n[1]*sol[1]+f.n[2]*sol[2]>0?'#fffdf8':'url(#le-t1)'});
   const pts=[];for(const q of k.esquinas.b)pts.push([q[0],q[2]]);for(const q of k.esquinas.t)pts.push([q[0]-q[1]*sol[0]/sol[1],q[2]-q[1]*sol[2]/sol[1]]);
   const c=recortar(envolvente(pts),0.8),pp=c.map(q=>cam.ver([q[0],0,q[1]]));
   let s=`<defs>${pat('le-t1',1)}${pat('le-t2',2)}</defs><rect width="600" height="380" fill="#fffdf8"/>`;
   s+=`<polygon points="${ESCENA.pts(pp)}" fill="url(#le-t2)" stroke="${LAMINA.tinta}" stroke-width="1"/>`;
   s+=svgEscena(cam,[k],{guias:false,letras:false,horizonte:false}).replace(/^<rect[^>]*\/><rect[^>]*\/>/,'');
   return s+etiqueta(12,306,'papel: luz',20)+etiqueta(12,336,'una capa: sombra propia',20)+etiqueta(12,366,'dos capas: sombra arrojada',20)}},
 {id:'grosor',t:'Grosor de línea',c:[['modo','Cómo es la línea',0,2,1,0,v=>['toda igual','más gruesa cerca','gruesa fuera, fina dentro'][v]]],
  p:['Con un solo rotulador y sin color también se puede dar profundidad: basta cambiar el grosor de la línea. Bruno Mollière lo llama un degradado de nitidez: trazos gruesos y bien marcados delante y más finos al fondo, con minas o rotuladores de distintos grosores.',
   'Robert Pastrana añade otra regla: líneas más gruesas para el contorno exterior de cada volumen y más finas para lo de dentro (aristas interiores, ventanas, detalles). Así el dibujo no se lee ambiguo.',
   'Con tres grosores suele bastar, por ejemplo un rotulador de 0,8 mm, uno de 0,3 mm y uno de 0,1 mm. Jorge Paricio habla de tener un «vocabulario» de grosores. Mueve el control y compara.'],
  f:'Bruno Mollière, «degradado de nitidez»; Robert Pastrana, «Line weight»; Jorge Paricio, «line weight vocabulary».',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:420,w:600,h:380});
   const cajas=[ESCENA.caja({x:24,z:90,w:12,d:12,h:26,giro:35,ventanas:true}),ESCENA.caja({x:5,z:33,w:8,d:8,h:10,giro:35,ventanas:true}),ESCENA.caja({x:-5,z:17,w:6,d:6,h:5,giro:35,ventanas:true})];
   let s=`<rect width="600" height="380" fill="#fffdf8"/><line x1="0" y1="${cam.horizonteY}" x2="600" y2="${cam.horizonteY}" stroke="${LAMINA.tinta}" stroke-width=".8" stroke-dasharray="6 6"/>`;
   for(const k of cajas){const z=cam.prof([k.esquinas.b[0][0],0,k.esquinas.b[0][2]]),g=v.modo===0?1.6:Math.max(0.6,Math.min(4.6,60/z)),det=v.modo===2?g*0.4:g;
     for(const {pp,hs} of ESCENA.proyectar(cam,[k])){s+=`<polygon points="${ESCENA.pts(pp)}" fill="#fffdf8" stroke="${LAMINA.tinta}" stroke-width="${det.toFixed(2)}" stroke-linejoin="round"/>`;
       for(const w of hs)s+=`<polygon points="${ESCENA.pts(w)}" fill="none" stroke="${LAMINA.tinta}" stroke-width="${(v.modo===0?1.2:det*0.8).toFixed(2)}"/>`}
     if(v.modo===2){const pts=[...k.esquinas.b,...k.esquinas.t].map(cam.ver).filter(Boolean),h=envolvente(pts);s+=`<polygon points="${ESCENA.pts(h)}" fill="none" stroke="${LAMINA.tinta}" stroke-width="${(g*1.5).toFixed(2)}" stroke-linejoin="round"/>`}}
   for(const [x,z] of [[1.5,10],[-1,22],[2,45]])s+=ESCENA.persona(cam,x,z,1.7,'').replace('<g class="">',`<g fill="${LAMINA.tinta}">`);
   return s+etiqueta(12,366,['todas las líneas iguales: plano','delante, más grueso; al fondo, fino','contorno grueso, detalles finos'][v.modo],20)}}
];
// ---- Vistas ----
const VIEJAS=['horizonte','paralelas','lejos','arriba','unpunto','dospuntos','nojuntes','personas','trespuntos','cuesta','atmosfera','tonos'];
const visto=()=>store.get('us-aprender-v1',[]).map(x=>typeof x==='number'?VIEJAS[x-1]:x).filter(Boolean);
function VISTA_APRENDER(main){
  cabecera('aprender','Aprender perspectiva','Y un poco de valores para la acuarela');
  const v=visto(),ul=html('<ol class="lecciones"></ol>');
  LECCIONES.forEach((l,i)=>{const ok=v.includes(l.id);ul.append(html(`<li><a href="#aprender/${i+1}" class="${ok?'visto':''}"><span class="num" aria-hidden="true">${ok?'✓':i+1}</span><span><b>${l.t}</b>${ok?'<span class="sr"> (vista)</span>':''}</span></a></li>`))});
  main.append(ul);
  const sig=LECCIONES.findIndex(l=>!v.includes(l.id));
  if(sig>=0)main.append(html(`<p style="margin-top:14px"><a class="boton prim" href="#aprender/${sig+1}">${v.length?'Sigue por aquí':'Empieza'}: ${LECCIONES[sig].t} →</a></p>`));
  main.append(html(`<p class="fuente">Los textos y los dibujos son propios, hechos a partir de los libros que se citan en cada lección (la lista completa está en Ajustes › Los libros).</p>`))}
function VISTA_LECCION(main,n){
  const l=LECCIONES[n-1];if(!l){location.replace('#aprender');return}
  cabecera('leccion',l.t,`Lección ${n} de ${LECCIONES.length}`);
  const v=visto();if(!v.includes(l.id)){v.push(l.id);store.set('us-aprender-v1',v)}
  const val={};l.c.forEach(c=>val[c[0]]=c[5]);
  const z=html(`<div class="cz"><div class="lienzo" style="background:#fbf7ee"><svg class="dib" viewBox="0 0 600 380" role="img" aria-label="${esc(l.t)}: dibujo que cambia con los controles"></svg></div><div class="panel"></div></div>`);main.append(z);
  const svg=z.querySelector('svg'),panel=z.querySelector('.panel');
  let pintarDib=()=>{svg.innerHTML=l.d(val)};
  const caja=html('<div class="caja"></div>');
  l.c.forEach(([id,et,mi,ma,pa,ini,f])=>{const r=html(`<div><div class="fila"><label for="lc-${id}">${et}: <span class="dato" id="lc-${id}-v">${f(ini)}</span></label></div><input type="range" id="lc-${id}" min="${mi}" max="${ma}" step="${pa}" value="${ini}" aria-valuetext="${esc(f(ini))}"></div>`);
    const inp=r.querySelector('input');inp.oninput=()=>{val[id]=+inp.value;const t=f(val[id]);r.querySelector('.dato').textContent=t;inp.setAttribute('aria-valuetext',t);pintarDib()};caja.append(r)});
  if(l.x){const px=html('<p class="nota" aria-live="polite" style="margin-top:8px"></p>');caja.append(px);const viejo=pintarDib;pintarDib=()=>{viejo();px.textContent=l.x(val)}}
  const texto=html(`<div class="leccion-texto">${l.p.map(p=>`<p>${p}</p>`).join('')}<p class="fuente">Fuentes: ${l.f}</p></div>`);
  panel.append(caja,texto);
  const nav=html(`<div class="navlec">${n>1?`<a class="boton" href="#aprender/${n-1}">‹ ${esc(LECCIONES[n-2].t)}</a>`:''}${n<LECCIONES.length?`<a class="boton prim" href="#aprender/${n+1}">Siguiente: ${esc(LECCIONES[n].t)} →</a>`:`<a class="boton prim" href="#natural">Siguiente: sal a dibujar con «Al natural» →</a>`}</div>`);
  panel.append(nav);pintarDib()}
