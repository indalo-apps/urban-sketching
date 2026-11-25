// Prueba en el navegador: crea el apunte de ejemplo y recorre todas las pantallas (inicio, las 5 etapas,
// Al natural, Aprender y sus 12 lecciones, Mis apuntes y Ajustes) en claro y oscuro, móvil, iPad y ordenador;
// (y la etapa Comparar con un apunte de prueba) pasa axe (accesibilidad) y falla si hay errores de JavaScript.
// Necesita Playwright, Chrome y axe-core:  npm i playwright axe-core
// Uso: node pruebas/con-servidor.js pruebas/navegador.js       (CAPTURAS=/tmp/capturas para guardar imágenes)
const {chromium}=require('playwright'),fs=require('fs');
const AX=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const U='http://localhost:8765/index.html',CAP=process.env.CAPTURAS;
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome'});let fallos=0;
  const casos=[['light',390,844],['dark',390,844],['light',820,1180],['dark',1280,860]];
  for(const [tema,ancho,alto] of casos){
    const ctx=await b.newContext({locale:'es-ES',colorScheme:tema,viewport:{width:ancho,height:alto}});const pg=await ctx.newPage();
    const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    await pg.goto(U+'#inicio');await pg.waitForTimeout(500);
    await pg.click('#t-ejemplo');await pg.waitForFunction(()=>location.hash.startsWith('#foto/'),null,{timeout:8000});await pg.waitForTimeout(400);
    const id=await pg.evaluate(()=>location.hash.split('/')[1]),ORDEN=await pg.evaluate(()=>ORDEN_ETAPAS);
    const nl=await pg.evaluate(()=>LECCIONES.length);
    const rutas=['#inicio','#mis','#natural','#sol','#rutas','#material','#aprender',...Array.from({length:nl},(_,i)=>'#aprender/'+(i+1)),...ORDEN.map(e=>`#foto/${id}/${e}`)];
    const malas=new Map();
    for(const r of rutas){await pg.goto(U+r);await pg.waitForTimeout(r.endsWith('color')?2500:r.endsWith('resumen')?4500:350);
      if(CAP)await pg.screenshot({path:`${CAP}/${tema}_${ancho}_${r.replace(/\W/g,'_')}.png`,fullPage:false});
      await pg.evaluate(AX);const v=await pg.evaluate(async()=>(await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']})).violations.map(v=>v.id+'('+v.nodes.length+')'));
      for(const x of v)malas.set(x,(malas.get(x)||[]).concat(r))}
    const revisar=async nombre=>{if(CAP)await pg.screenshot({path:`${CAP}/${tema}_${ancho}_${nombre}.png`,fullPage:false});
      await pg.evaluate(AX);for(const x of await pg.evaluate(async()=>(await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']})).violations.map(v=>v.id+'('+v.nodes.length+')')))malas.set(x,(malas.get(x)||[]).concat(nombre))};
    // Valores: vistas de bordes y de trama (las tres tramas)
    for(const [vista,tr] of [['bordes'],['trama','paralela'],['trama','cruzada'],['trama','puntos']]){
      await pg.goto(U+'#inicio');await pg.waitForTimeout(150);
      await pg.evaluate(([id,vista,tr])=>ALMACEN.leer(id).then(p=>{p.val.vista=vista;if(tr)p.val.trama=tr;return ALMACEN.guardar(p)}).then(()=>{US.id=null}),[id,vista,tr]);
      await pg.goto(U+`#foto/${id}/valores`);await pg.waitForTimeout(700);await revisar('valores-'+vista+(tr||''))}
    // Color: paleta limitada de 3 pinturas
    if(ancho===390||ancho===1280){await pg.goto(U+`#foto/${id}/color`);await pg.waitForTimeout(1500);await pg.click('#co-trio-b');
      try{await pg.waitForFunction(()=>document.querySelector('#co-trio .mezcla'),null,{timeout:30000})}catch(e){malas.set('paleta limitada sin resultado',['color'])}
      await revisar('color-trio')}
    // Sol: de noche, al amanecer y con otra dirección
    await pg.goto(U+'#sol');await pg.waitForTimeout(300);
    for(const [h,m] of [[0,0],[480,90],[780,180],[1200,270]]){await pg.evaluate(([h,m])=>{const r=document.querySelector('#so-hora');r.value=h;r.dispatchEvent(new Event('input'));const q=document.querySelector('#so-mira');q.value=m;q.dispatchEvent(new Event('input'))},[h,m]);await pg.waitForTimeout(120)}
    await revisar('sol-tarde');
    // Material: marcar, añadir y quitar
    await pg.goto(U+'#material');await pg.waitForTimeout(300);await pg.check('[data-id="cuaderno"]');await pg.fill('#ma-nuevo','Lápices de colores');await pg.click('#ma-anadir');await pg.waitForTimeout(100);
    if(!(await pg.textContent('#ma-lista')).includes('Lápices de colores'))malas.set('material: no se añade',['material']);await revisar('material-editado');
    // Proporciones de una fachada del ejemplo (9 × 6 m y 8 × 6 m): la app deshace la perspectiva (máx. 3 % de error)
    if(tema==='light'&&ancho===390){const pr=await pg.evaluate(id=>{location.hash='#foto/'+id+'/encaje';return new Promise(ok=>setTimeout(()=>{const cam=ESCENA.camara({ojo:1.6,yaw:-8,pitch:4,f:780,w:1200,h:900}),k=ESCENA.caja({x:-2,z:22,w:9,d:8,h:13,giro:38}),R=ENCAJE.calcular(US.p);
        ok([[0,1,1.5],[1,2,8/6]].map(([i,j,esp])=>{const r=ENCAJE.proporcion(US.p,R,{a:cam.ver(k.esquinas.b[i]),b:cam.ver([k.esquinas.b[j][0],6,k.esquinas.b[j][2]])});return [esp,r.ratio]}))},600))},id);
      for(const [esp,r] of pr)if(!(Math.abs(r/esp-1)<0.03))malas.set('proporcion '+esp+' → '+r,['encaje'])}
    // Ajustes abierto
    await pg.goto(U+'#inicio');await pg.waitForTimeout(300);await pg.click('#btn-ajustes');await pg.waitForTimeout(250);
    if(CAP)await pg.screenshot({path:`${CAP}/${tema}_${ancho}_ajustes.png`});
    await pg.evaluate(AX);for(const x of await pg.evaluate(async()=>(await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']})).violations.map(v=>v.id+'('+v.nodes.length+')')))malas.set(x,(malas.get(x)||[]).concat('ajustes'));
    const ok=!malas.size&&!errs.length;if(!ok)fallos++;
    console.log(`${ok?'✓':'✗'} ${tema} ${ancho}px · ${rutas.length+1} pantallas`+(malas.size?' · axe: '+[...malas].map(([k,r])=>k+' en '+r.slice(0,3).join(' ')).join('; '):'')+(errs.length?' · errores: '+[...new Set(errs)].slice(0,5).join(' | '):''));
    await ctx.close()}
  await b.close();process.exit(fallos?1:0)})();
