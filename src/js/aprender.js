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
  if(o.letras!==false){const ks=Object.keys(fugas).sort((a,b)=>fugas[a][0]-fugas[b][0]);ks.forEach((k,i)=>{const P=fugas[k];if(P[0]>-20&&P[0]<W+20&&P[1]>-20&&P[1]<H+20)
    s+=`<circle cx="${P[0]}" cy="${P[1]}" r="11" fill="#fff" stroke="${LAMINA.tinta}" stroke-width="2"/><text x="${P[0]}" y="${P[1]+5}" text-anchor="middle" font-size="14" font-weight="700" fill="${LAMINA.tinta}">${ks.length>1?'AB'[i]||'':'F'}</text>`})}
  return s}
function etiqueta(x,y,t,tam,anchor){return `<text x="${x}" y="${y}" font-size="${tam||17}" font-weight="700" fill="${LAMINA.tinta}" stroke="#fff" stroke-width="3.5" paint-order="stroke" text-anchor="${anchor||'start'}" font-family="Inter,system-ui,sans-serif">${t}</text>`}
const m=v=>fmt(v,v<10?1:0)+' m';
const LECCIONES=[
 {t:'La línea del horizonte',c:[['ojo','Altura de tus ojos',0.4,20,0.1,1.6,m]],
  p:['La línea del horizonte es la línea imaginaria donde se juntarían el cielo y el suelo si nada los tapara. Siempre está a la altura de tus ojos: si te sientas, baja contigo; si subes a la muralla de la Alcazaba, sube contigo.',
   'Por eso, lo primero de un apunte es decidir dónde va el horizonte en el papel y fijarse en qué parte de la fachada queda a la altura de tus ojos: esa parte irá en la línea.',
   'Mueve la altura de los ojos. Con los ojos por encima de los tejados, los ves desde arriba; sentado en el suelo, el horizonte corta las puertas por abajo. En el dibujo la línea no se mueve: lo que cambia es lo que corta.'],
  f:'Bruno Mollière, «La línea del horizonte»; Joseph D’Amelio, cap. 5; Ernest Norling, paso 1.',
  d:v=>{const cam=ESCENA.camara({ojo:v.ojo,f:430,w:600,h:380,pitch:0});return svgEscena(cam,[ESCENA.caja({x:-6,z:16,w:6,d:6,h:9,giro:30,ventanas:true}),ESCENA.caja({x:5,z:24,w:7,d:7,h:6,giro:30,ventanas:true}),ESCENA.caja({x:-1,z:40,w:8,d:8,h:15,giro:30,ventanas:true})],{guias:false,letras:false,personas:[[1.5,10,1.7]]})}},
 {t:'Las paralelas se juntan',c:[['giro','Giro de la mirada',-40,40,1,22,v=>fmt(v,0)+'°']],
  p:['Las líneas que en la realidad son paralelas, como el alero y el zócalo de una fachada, en el dibujo se van acercando a medida que se alejan hasta juntarse en un punto del horizonte: el punto de fuga.',
   'Cada grupo de paralelas tiene su propio punto de fuga. Las filas de ventanas de una misma fachada van también a ese punto. Mollière la llama su regla número 2 y Pastrana, «convergencia»: las líneas no se juntan de verdad, solo lo parece.',
   'Gira la mirada: cuando miras la fachada de frente, sus líneas se quedan horizontales y solo fugan las que se alejan de ti.'],
  f:'Bruno Mollière, regla n.º 2; Robert Pastrana, cap. 3 («las tres reglas»); Joseph D’Amelio, cap. 5.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:420,w:600,h:380,yaw:v.giro});return svgEscena(cam,[ESCENA.caja({x:0,z:18,w:16,d:5,h:10,giro:0,ventanas:true})])}},
 {t:'Lejos: más pequeño y más cerca del horizonte',c:[['dist','Distancia de la persona',3,60,1,12,m]],
  p:['Las cosas iguales se ven más pequeñas cuanto más lejos están. Es la disminución, la segunda regla de Pastrana.',
   'Y, como insiste Dong Ho Kim, cuanto más lejos está algo, más se acerca a la línea del horizonte: los pies de la gente lejana suben en el papel y la base de las farolas del fondo acaba casi pegada a la línea.',
   'Mueve a la persona por la calle y fíjate en sus pies.'],
  f:'Robert Pastrana, cap. 3; Dong Ho Kim, parte 2; Phil Metzger, cap. 3.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:430,w:600,h:380});const faro=[];for(let z=6;z<=90;z+=12){faro.push(ESCENA.caja({x:-3.2,z,w:0.15,d:0.15,h:4.5,color:'#6b6256'}),ESCENA.caja({x:3.2,z,w:0.15,d:0.15,h:4.5,color:'#6b6256'}))}
   return svgEscena(cam,faro,{guias:false,letras:false,personas:[[0.8,v.dist,1.7]],antes:`<polygon points="${ESCENA.pts([cam.ver([-2.5,0,2]),cam.ver([2.5,0,2]),cam.ver([2.5,0,400]),cam.ver([-2.5,0,400])])}" fill="#d6c9b2"/>`})}},
 {t:'Arriba bajan, abajo suben',c:[['ojo','Altura de tus ojos',0.5,14,0.1,4.5,m]],
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
 {t:'Un punto de fuga: la calle de frente',c:[['x','Dónde te pones en la calle',-5,5,0.1,0,v=>v===0?'en el centro':fmt(Math.abs(v),1)+' m a la '+(v<0?'izquierda':'derecha')],['ojo','Altura de tus ojos',0.5,10,0.1,1.6,m]],
  p:['Cuando miras una calle de frente, las fachadas de los lados, los bordillos y los aleros van todos a un solo punto de fuga, en el horizonte, justo enfrente de ti.',
   'Las líneas de lo que ves de frente siguen horizontales y las verticales, verticales. Es la perspectiva más sencilla y la mejor para empezar.',
   'Si te mueves a un lado de la calle, el punto de fuga se mueve contigo: siempre está enfrente de tus ojos.'],
  f:'Ernest Norling, pasos 3 y 4; Jorge Paricio, cap. 1; Bruno Mollière.',
  d:v=>{const cam=ESCENA.camara({ojo:v.ojo,f:380,w:600,h:380,cx:v.x});const c=[];for(let i=0;i<5;i++){c.push(ESCENA.caja({x:-9,z:10+i*11,w:8,d:10,h:7+((i*5)%7),ventanas:true}),ESCENA.caja({x:9,z:12+i*11,w:8,d:10,h:8+((i*3)%6),ventanas:true}))}
   return svgEscena(cam,c,{letras:true})}},
 {t:'Dos puntos de fuga: la esquina',c:[['giro','Giro del edificio',8,82,1,40,v=>fmt(v,0)+'°']],
  p:['Ante una esquina ves dos fachadas, y cada una tiene su punto de fuga: los dos en el horizonte, uno a la izquierda (A) y otro a la derecha (B). Las verticales siguen verticales.',
   'Gira el edificio. Cuando una fachada se pone casi de frente, su punto de fuga se va muy lejos, fuera del papel, y el de la otra fachada se acerca.',
   'En la calle, busca primero la arista más cercana: desde ella salen las dos fachadas, cada una hacia su punto.'],
  f:'Ernest Norling, pasos 5 a 7; Sarah Haley, cap. 4; Robert Pastrana, cap. 5.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:330,w:600,h:380});return svgEscena(cam,[ESCENA.caja({x:0,z:17,w:9,d:9,h:11,giro:v.giro,ventanas:true})],{personas:[[-3,10,1.7]]})}},
 {t:'No juntes los puntos de fuga',c:[['f','Distancia del ojo al papel',110,900,10,330,v=>v<220?'muy cerca':v<420?'normal':'lejos']],
  p:['Si en tu cuaderno colocas los dos puntos de fuga muy juntos, el edificio sale deformado, como estirado hacia ti. Es el error más corriente al empezar, y Ernest Norling le dedica un paso entero.',
   'Vemos con nitidez dentro de un cono de unos 60°. Lo que queda fuera se deforma, como en los bordes de las fotos del móvil, que usan gran angular. Pastrana, D’Amelio y Haley lo explican con el «cono de visión»: el círculo del dibujo.',
   'Una regla práctica: la esquina más cercana, abajo, no debería formar un ángulo más cerrado que recto (90°). Si sale más cerrado, separa los puntos, aunque se salgan del papel.'],
  f:'Ernest Norling, paso 6; Joseph D’Amelio, cap. 9; Robert Pastrana, cap. 4; Sarah Haley, cap. 8; Dong Ho Kim, parte 4.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:v.f,w:600,h:380}),z=v.f/330*22,k=ESCENA.caja({x:0,z,w:8,d:8,h:8,giro:45,ventanas:true});
   const r=v.f*Math.tan(Math.PI/6);const B=k.esquinas.b.map(b=>[b,cam.prof(b)]).sort((a,b)=>a[1]-b[1]);const c0=cam.ver(B[0][0]),c1=cam.ver(B[1][0]),c2=cam.ver(B[2][0]);
   let ang=null;if(c0&&c1&&c2){const a=GEOM.sub(c1,c0),b=GEOM.sub(c2,c0);ang=Math.acos(GEOM.dot(a,b)/(GEOM.len(a)*GEOM.len(b)))*180/Math.PI}
   return svgEscena(cam,[k],{despues:`<circle cx="300" cy="190" r="${r}" fill="none" stroke="${LAMINA.tinta}" stroke-width="2" stroke-dasharray="3 3 12 3"/>`+etiqueta(300,Math.max(20,190-r-8),'cono de 60°',16,'middle')+(ang?etiqueta(c0[0],Math.min(372,c0[1]+26),'esquina: '+fmt(ang,0)+'°'+(ang<90?' (deformada)':''),19,'middle'):'')})}},
 {t:'Personas a escala',c:[['ojo','Altura de tus ojos',1,1.9,0.05,1.6,m]],
  p:['En suelo llano, si estás de pie, las cabezas de la gente que también está de pie quedan más o menos en tu horizonte, estén cerca o lejos. Lo que cambia es dónde ponen los pies.',
   'Si te sientas, el horizonte baja y las cabezas quedan por encima. Alguien más alto que tú asoma un poco por encima de la línea; un niño queda por debajo.',
   'Con el mismo truco se miden alturas: el horizonte corta todo lo vertical a la altura de tus ojos. Si una puerta mide dos veces lo que hay del suelo al horizonte, mide el doble que tus ojos. En la etapa Encaje, «Medir alturas» lo hace por ti.'],
  f:'Ernest Norling, paso 9; Robert Pastrana, cap. 8; Joseph D’Amelio, cap. 10.',
  d:v=>{const cam=ESCENA.camara({ojo:v.ojo,f:430,w:600,h:380});return svgEscena(cam,[ESCENA.caja({x:-9,z:30,w:8,d:30,h:9,ventanas:true}),ESCENA.caja({x:10,z:34,w:8,d:30,h:11,ventanas:true})],{personas:[[-1.5,5,1.72],[1.6,9,1.65],[-0.5,16,1.75],[2.5,28,1.7],[-2,45,1.68],[0.4,70,1.72],[3,7,1.1]]})}},
 {t:'Tres puntos de fuga: mirar hacia arriba',c:[['pitch','Inclinación de la mirada',-30,45,1,22,v=>v===0?'de frente':fmt(Math.abs(v),0)+'° hacia '+(v>0?'arriba':'abajo')]],
  p:['Si levantas la mirada para ver una torre, sus verticales dejan de ser paralelas en el dibujo y se juntan en un tercer punto de fuga, muy arriba. Si miras hacia abajo desde un mirador, se juntan por debajo.',
   'Mirando hacia arriba, el horizonte baja en el papel; mirando hacia abajo, sube, aunque siga a la altura de tus ojos.',
   'En urban sketching muchas veces basta con inclinar un poco las verticales para que se note que miras hacia arriba.'],
  f:'Sarah Haley, cap. 5; Robert Pastrana, cap. 13; Joseph D’Amelio, cap. 8.',
  d:v=>{const cam=ESCENA.camara({ojo:1.6,f:300,w:600,h:380,pitch:v.pitch});const V=cam.dir([0,1,0]);let s='';
   const k=ESCENA.caja({x:0,z:14,w:7,d:7,h:30,giro:35,ventanas:true});
   if(V){const P=V.delante?V.p:cam.dir([0,-1,0]).p;for(const b of k.esquinas.b){const q=cam.ver(b);if(q&&Math.abs(P[1])<4000)s+=`<line x1="${q[0]}" y1="${q[1]}" x2="${P[0]}" y2="${P[1]}" stroke="${LAMINA.guia}" stroke-width="1" stroke-dasharray="2 4" opacity=".8"/>`}
     if(P[1]>-20&&P[1]<400)s+=`<circle cx="${P[0]}" cy="${P[1]}" r="11" fill="#fff" stroke="${LAMINA.tinta}" stroke-width="2"/>`+etiqueta(P[0],P[1]+4.5,'V',13,'middle')}
   return svgEscena(cam,[k],{despues:s})}},
 {t:'Calles en cuesta',c:[['pend','Pendiente de la calle',-18,18,1,10,v=>v===0?'llana':fmt(Math.abs(v),0)+'° hacia '+(v>0?'arriba':'abajo')]],
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
 {t:'Más lejos, más claro',c:[['aire','Aire entre tú y el fondo',0,1,0.05,0.6,v=>v<0.2?'muy limpio':v<0.6?'normal':'con bruma']],
  p:['El aire que hay entre tú y lo que miras aclara y apaga los colores: lo lejano se ve más claro, con menos contraste, menos detalle y algo más azulado. Phil Metzger lo llama perspectiva atmosférica y le dedica la primera parte de su libro.',
   'En la acuarela se aprovecha pintando el fondo con aguadas claras y frías, y guardando los oscuros, los bordes nítidos y los colores fuertes para lo que está cerca.',
   'En la etapa Valores lo verás en tus fotos: los montes del fondo caen casi siempre en el tono claro.'],
  f:'Phil Metzger, cap. 1 y 2; Joseph D’Amelio, cap. 1.',
  d:v=>{const cielo=[214,226,232];let s=`<rect width="600" height="380" fill="rgb(${cielo})"/>`;const capas=[[0.95,'#3b4a3e',150],[0.7,'#3d4b45',200],[0.42,'#30392f',250],[0.12,'#2a2621',300]];
   capas.forEach(([lejos,hex,y],i)=>{const c=COLOR.hexRgb(hex),k=Math.min(1,lejos*v.aire*1.15),col=c.map((x,j)=>Math.round(x*(1-k)+cielo[j]*k));let d=`M0 380L0 ${y}`;for(let x=0;x<=600;x+=30)d+=`L${x} ${y-18*Math.sin(x/70+i*1.7)-10*Math.sin(x/23+i)}`;s+=`<path d="${d}L600 380Z" fill="rgb(${col})"/>`});
   const t=ESCENA.camara({ojo:1.6,f:400,w:600,h:380});s+=ESCENA.siluetaSVG([470,372],[470,300],'').replace('<g class="">','<g fill="#1d1a16">');
   return s+etiqueta(12,28,'lejos: claro y suave',18)+etiqueta(12,370,'cerca: oscuro y con contraste',18)}},
 {t:'Tres tonos y el plan de aguadas',c:[['paso','Capa',1,4,1,1,v=>['blancos','aguada clara','aguada media','oscuros'][v-1]]],
  p:['Antes de pintar conviene reducir lo que ves a tres manchas: claros, medios y oscuros. Entrecerrar los ojos ayuda, porque desaparecen los detalles y quedan las formas grandes.',
   'La acuarela es transparente: se pinta de claro a oscuro y los blancos son el propio papel. Por eso se planifica por capas, como explica Felix Scheinberger: primero se reservan los blancos; después, una aguada clara en todo lo demás; encima, ya seca, la media; y al final, los oscuros.',
   'Mueve la capa y mira cómo se construye el dibujo. La etapa Valores hace este plan con tus fotos.'],
  f:'Felix Scheinberger, «Capa a capa: el glaseado»; Phil Metzger, cap. 4.',
  d:v=>{const T=[255,206,140,62],k=v.paso-1,g=t=>{const c=k===0?(t===0?255:224):T[Math.min(t,k)];return `rgb(${c},${c},${c})`};
   const piezas=[[`<rect width="600" height="380"`,1],[`<rect y="300" width="600" height="80"`,2],[`<polygon points="120,300 120,90 330,60 330,300"`,0],[`<polygon points="330,300 330,60 480,110 480,300"`,2],
     [`<polygon points="120,90 330,60 480,110 260,135"`,1],[`<rect x="200" y="210" width="50" height="90"`,3],[`<rect x="150" y="130" width="34" height="46"`,3],[`<rect x="250" y="120" width="34" height="46"`,3],[`<polygon points="370,140 400,150 400,195 370,186"`,3],[`<polygon points="120,300 330,300 280,330 60,330"`,2]];
   let s='';for(const [p,t] of piezas)s+=`${p} fill="${g(t)}" stroke="#1d1a16" stroke-width="1.2"/>`;
   return s+etiqueta(12,24,['Paso 1: reserva los blancos','Paso 2: aguada clara en todo lo demás','Paso 3: aguada media, ya seca la anterior','Paso 4: los oscuros, al final'][k],18)}}
];
// ---- Vistas ----
const visto=()=>store.get('us-aprender-v1',[]);
function VISTA_APRENDER(main){
  cabecera('aprender','Aprender perspectiva','Y un poco de valores para la acuarela');
  const v=visto(),ul=html('<ol class="lecciones"></ol>');
  LECCIONES.forEach((l,i)=>ul.append(html(`<li><a href="#aprender/${i+1}" class="${v.includes(i+1)?'visto':''}"><span class="num" aria-hidden="true">${v.includes(i+1)?'✓':i+1}</span><span><b>${l.t}</b>${v.includes(i+1)?'<span class="sr"> (vista)</span>':''}</span></a></li>`)));
  main.append(ul);
  const sig=LECCIONES.findIndex((_,i)=>!v.includes(i+1));
  if(sig>=0)main.append(html(`<p style="margin-top:14px"><a class="boton prim" href="#aprender/${sig+1}">${v.length?'Sigue por aquí':'Empieza'}: ${LECCIONES[sig].t} →</a></p>`));
  main.append(html(`<p class="fuente">Los textos y los dibujos son propios, hechos a partir de los libros que se citan en cada lección (la lista completa está en Ajustes › Los libros).</p>`))}
function VISTA_LECCION(main,n){
  const l=LECCIONES[n-1];if(!l){location.replace('#aprender');return}
  cabecera('leccion',l.t,`Lección ${n} de ${LECCIONES.length}`);
  const v=visto();if(!v.includes(n)){v.push(n);store.set('us-aprender-v1',v)}
  const val={};l.c.forEach(c=>val[c[0]]=c[5]);
  const z=html(`<div class="cz"><div class="lienzo" style="background:#fbf7ee"><svg class="dib" viewBox="0 0 600 380" role="img" aria-label="${esc(l.t)}: dibujo que cambia con los controles"></svg></div><div class="panel"></div></div>`);main.append(z);
  const svg=z.querySelector('svg'),panel=z.querySelector('.panel');
  const pintarDib=()=>{svg.innerHTML=l.d(val)};
  const caja=html('<div class="caja"></div>');
  l.c.forEach(([id,et,mi,ma,pa,ini,f])=>{const r=html(`<div><div class="fila"><label for="lc-${id}">${et}: <span class="dato" id="lc-${id}-v">${f(ini)}</span></label></div><input type="range" id="lc-${id}" min="${mi}" max="${ma}" step="${pa}" value="${ini}" aria-valuetext="${esc(f(ini))}"></div>`);
    const inp=r.querySelector('input');inp.oninput=()=>{val[id]=+inp.value;const t=f(val[id]);r.querySelector('.dato').textContent=t;inp.setAttribute('aria-valuetext',t);pintarDib()};caja.append(r)});
  const texto=html(`<div class="leccion-texto">${l.p.map(p=>`<p>${p}</p>`).join('')}<p class="fuente">Fuentes: ${l.f}</p></div>`);
  panel.append(caja,texto);
  const nav=html(`<div class="navlec">${n>1?`<a class="boton" href="#aprender/${n-1}">‹ ${esc(LECCIONES[n-2].t)}</a>`:''}${n<LECCIONES.length?`<a class="boton prim" href="#aprender/${n+1}">Siguiente: ${esc(LECCIONES[n].t)} →</a>`:`<a class="boton prim" href="#natural">Siguiente: sal a dibujar con «Al natural» →</a>`}</div>`);
  panel.append(nav);pintarDib()}
