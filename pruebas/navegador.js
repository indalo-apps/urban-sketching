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
    const rutas=['#inicio','#mis','#natural','#aprender',...Array.from({length:nl},(_,i)=>'#aprender/'+(i+1)),...ORDEN.map(e=>`#foto/${id}/${e}`)];
    const malas=new Map();
    for(const r of rutas){await pg.goto(U+r);await pg.waitForTimeout(r.endsWith('color')?2500:r.endsWith('resumen')?4500:350);
      if(CAP)await pg.screenshot({path:`${CAP}/${tema}_${ancho}_${r.replace(/\W/g,'_')}.png`,fullPage:false});
      await pg.evaluate(AX);const v=await pg.evaluate(async()=>(await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']})).violations.map(v=>v.id+'('+v.nodes.length+')'));
      for(const x of v)malas.set(x,(malas.get(x)||[]).concat(r))}
    // Ajustes abierto
    await pg.goto(U+'#inicio');await pg.waitForTimeout(300);await pg.click('#btn-ajustes');await pg.waitForTimeout(250);
    if(CAP)await pg.screenshot({path:`${CAP}/${tema}_${ancho}_ajustes.png`});
    await pg.evaluate(AX);for(const x of await pg.evaluate(async()=>(await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']})).violations.map(v=>v.id+'('+v.nodes.length+')')))malas.set(x,(malas.get(x)||[]).concat('ajustes'));
    const ok=!malas.size&&!errs.length;if(!ok)fallos++;
    console.log(`${ok?'✓':'✗'} ${tema} ${ancho}px · ${rutas.length+1} pantallas`+(malas.size?' · axe: '+[...malas].map(([k,r])=>k+' en '+r.slice(0,3).join(' ')).join('; '):'')+(errs.length?' · errores: '+[...new Set(errs)].slice(0,5).join(' | '):''));
    await ctx.close()}
  await b.close();process.exit(fallos?1:0)})();
