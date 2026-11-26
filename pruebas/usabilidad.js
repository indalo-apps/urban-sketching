// Prueba de usabilidad en el móvil (v1.5): lo que falló en la revisión del 26-11-2026 no puede volver.
// - la foto se ve (fija arriba) mientras se usan las flechas y los botones de Encaje y Encuadre
// - la foto empieza arriba (cabecera compacta) en un móvil pequeño
// - ningún botón de las etapas mide menos de 44 px
// - Encaje en cuatro partes; Deshacer devuelve un punto arrastrado a su sitio; la lupa sale al arrastrar
// - «Ver la foto» se queda puesto con un toque; tabla de mezclas con valor escrito y casilla que se explica
// - Rutas: sitios plegados y filtro
// Uso: node pruebas/con-servidor.js pruebas/usabilidad.js
const {chromium}=require('playwright');
const U='http://localhost:8765/index.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome'});const mal=[],errs=[];
  const ok=(c,t)=>{if(!c)mal.push(t)};
  for(const [w,h] of [[375,667],[390,844]]){
    const ctx=await b.newContext({locale:'es-ES',viewport:{width:w,height:h},hasTouch:true,isMobile:true});const pg=await ctx.newPage();
    pg.on('pageerror',e=>errs.push(e.message));
    await pg.goto(U+'#inicio');await pg.evaluate(()=>localStorage.setItem('us-aviso-fotos','true'));await pg.reload();await pg.waitForTimeout(300);
    await pg.click('#t-ejemplo');await pg.waitForFunction(()=>location.hash.startsWith('#foto/'));await pg.waitForTimeout(400);
    const id=await pg.evaluate(()=>location.hash.split('/')[1]),T=`${w}x${h}`;
    const visible=()=>pg.evaluate(()=>{const l=document.querySelector('.lienzo svg');const q=l.getBoundingClientRect();return Math.max(0,Math.min(innerHeight,q.bottom)-Math.max(0,q.top))/q.height});
    for(const et of ['encuadre','encaje','valores','color','comparar']){await pg.goto(U+`#foto/${id}/${et}`);await pg.waitForTimeout(et==='color'?1500:500);
      const top=await pg.evaluate(()=>Math.round(document.querySelector('.lienzo svg').getBoundingClientRect().top));ok(top<=230,`${T} ${et}: la foto empieza en ${top} px`);
      const peq=await pg.evaluate(()=>[...document.querySelectorAll('#app button,#app a.boton,#app summary')].filter(e=>{const q=e.getBoundingClientRect();return q.width&&q.height&&!e.closest('[hidden]')&&(q.width<44||q.height<44)}).map(e=>e.textContent.trim().slice(0,20)));
      ok(!peq.length,`${T} ${et}: botones pequeños ${peq.join(', ')}`);
      const ancho=await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth);ok(ancho<=0,`${T} ${et}: se sale ${ancho} px por la derecha`);
      // al bajar hasta el final, la foto sigue a la vista
      await pg.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await pg.waitForTimeout(150);
      if(et!=='color'&&et!=='comparar'){const v=await visible();ok(v>0.95,`${T} ${et}: al bajar se ve el ${Math.round(v*100)} % de la foto`)}}
    // Encaje: partes, flechas a la vista, deshacer y lupa
    await pg.goto(U+`#foto/${id}/encaje`);await pg.waitForTimeout(500);
    const partes=await pg.$$eval('[data-parte]',x=>x.map(b=>b.textContent));ok(partes.join()==='Rectas,Medir,Ver,Cuaderno',`${T} encaje: partes ${partes}`);
    await pg.locator('.mover').scrollIntoViewIfNeeded();ok(await visible()>0.95,`${T} encaje: con las flechas no se ve la foto`);
    const antes=await pg.evaluate(()=>JSON.stringify(US.p.pers.lineas.A[0][0]));
    const asa=await pg.$('[data-asa="A:0:0"]');const q=await asa.boundingBox();
    await pg.mouse.move(q.x+q.width/2,q.y+q.height/2);await pg.mouse.down();await pg.mouse.move(q.x+q.width/2+25,q.y+q.height/2+12,{steps:4});
    ok(await pg.$('.lupa'),`${T} encaje: no sale la lupa al arrastrar`);
    await pg.mouse.up();ok(!(await pg.$('.lupa')),`${T} encaje: la lupa no se quita al soltar`);
    const movido=await pg.evaluate(()=>JSON.stringify(US.p.pers.lineas.A[0][0]));ok(movido!==antes,`${T} encaje: el punto no se ha movido`);
    await pg.click('#ej-deshacer');await pg.waitForTimeout(100);
    ok(await pg.evaluate(()=>JSON.stringify(US.p.pers.lineas.A[0][0]))===antes,`${T} encaje: Deshacer no devuelve el punto`);
    ok(await pg.$eval('#ej-deshacer',b=>b.disabled),`${T} encaje: Deshacer sigue activo sin nada que deshacer`);
    await pg.click('[data-parte="medir"]');await pg.waitForTimeout(150);ok(await pg.evaluate(()=>US.p.pers.herramienta)!=='rectas',`${T} encaje: Medir no elige herramienta`);
    await pg.click('[data-parte="cuaderno"]');await pg.waitForTimeout(150);ok((await pg.textContent('#ej-cuaderno')).includes('Horizonte'),`${T} encaje: Cuaderno vacío`);
    await pg.click('[data-parte="rectas"]');await pg.waitForTimeout(150);
    // Siguiente debajo de la foto
    ok(await pg.$('.lienzo .sig-mini'),`${T} encaje: falta «Siguiente» debajo de la foto`);
    // Valores: un toque deja la foto puesta
    await pg.goto(U+`#foto/${id}/valores`);await pg.waitForTimeout(500);await pg.tap('#va-ver');await pg.waitForTimeout(100);
    ok(await pg.getAttribute('#va-ver','aria-pressed')==='true',`${T} valores: un toque no deja la foto puesta`);
    await pg.tap('#va-ver');await pg.waitForTimeout(100);ok(await pg.getAttribute('#va-ver','aria-pressed')==='false',`${T} valores: otro toque no la quita`);
    // Color: casillas con letra de valor y explicación al tocar
    await pg.goto(U+`#foto/${id}/color`);await pg.waitForFunction(()=>document.querySelector('[data-celda]'),null,{timeout:30000});
    const letras=await pg.$$eval('#co-tabla [data-celda]',x=>[...new Set(x.map(b=>b.textContent))]);ok(letras.every(l=>['C','M','O'].includes(l)),`${T} color: letras ${letras}`);
    const c0=await pg.$('#co-tabla [data-celda]');await c0.scrollIntoViewIfNeeded();await c0.tap();ok((await pg.textContent('#co-celda')).includes('Valor'),`${T} color: la casilla no se explica`);
    // Rutas: plegadas y con filtro
    await pg.goto(U+'#rutas');await pg.waitForTimeout(300);
    const alto=await pg.evaluate(()=>document.documentElement.scrollHeight/innerHeight);ok(alto<6,`${T} rutas: ocupa ${alto.toFixed(1)} pantallas`);
    await pg.click('[data-sitio] summary');await pg.click('[data-sitio] [data-hecho]');await pg.click('[data-filtro="hechos"]');
    const n=await pg.$$eval('[data-sitio]:not([hidden])',x=>x.length);ok(n===1,`${T} rutas: el filtro «Hechos» enseña ${n}`);
    await ctx.close()}
  await b.close();
  if(errs.length)mal.push('errores: '+[...new Set(errs)].join(' | '));
  console.log(mal.length?'✗ usabilidad:\n  '+mal.join('\n  '):'✓ usabilidad: foto fija, botones, Encaje, lupa, deshacer, ver la foto, mezclas y rutas');
  process.exit(mal.length?1:0)})();
