/* ===== Al natural: la cámara con tu horizonte en vivo (sensor de inclinación del móvil) =====
   El horizonte está siempre a la altura de los ojos (Mollière, «La línea del horizonte»; D'Amelio, cap. 5; Norling, paso 1). */
const VISTA_NATURAL=(function(){
  const ajuste=store.get('us-natural-v1',{fov:64,desplaza:0,verticales:true,personas:false});
  const guardarAj=()=>store.set('us-natural-v1',ajuste);
  return function(main){
    cabecera('natural','Al natural','Tu horizonte en vivo, con la cámara');
    const intro=html(`<div class="caja" style="max-width:720px">
      <p>Sujeta el móvil delante de tus ojos y apunta a la calle. La app dibuja sobre la imagen tu <b>línea del horizonte</b>, que siempre está a la altura de tus ojos, y te dice si las verticales del edificio fugan.</p>
      <p>Para eso necesita la <b>cámara</b> y el <b>sensor de inclinación</b> del móvil. La imagen no sale del móvil y no se guarda nada hasta que tú hagas una foto.</p>
      <div class="ops"><button class="prim" id="na-abrir">📷 Abrir la cámara</button></div><p class="muted" id="na-msg" role="status" aria-live="polite" style="margin-top:8px"></p></div>`);
    main.append(intro);
    let stream=null,up=null,tieneSensor=false,raf=0,vivo=true;
    const zona=html(`<div class="cz" hidden><div><div class="cam"><video playsinline muted autoplay></video><svg aria-hidden="true"></svg><span class="estado" id="na-estado">Buscando la inclinación…</span></div>
      <div class="lienzo" style="background:none;padding:8px 0 0"><div class="barra"><button class="prim" id="na-foto">📷 Hacer foto y encajarla</button><button id="na-sube" aria-label="Subir la línea">Subir línea</button><button id="na-baja" aria-label="Bajar la línea">Bajar línea</button><button id="na-cero">Línea a cero</button></div></div></div><div class="panel"></div></div>`);
    main.append(zona);
    const video=zona.querySelector('video'),svg=zona.querySelector('svg'),panel=zona.querySelector('.panel'),cam=zona.querySelector('.cam');
    panel.append(html(`<div class="caja"><h2 class="ch">Qué hay en la pantalla</h2><ul class="leyenda">
      <li><svg width="46" height="14" aria-hidden="true"><line x1="2" y1="7" x2="44" y2="7" stroke="currentColor" stroke-width="3.5" stroke-dasharray="12 5"/></svg><span><b>Horizonte</b>: la altura de tus ojos. Lo que la línea corta en el edificio va, en tu dibujo, a la altura del horizonte.</span></li>
      <li><svg width="46" height="14" aria-hidden="true"><line x1="2" y1="7" x2="44" y2="7" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 5"/></svg><span><b>Verticales</b>: si se juntan hacia arriba o hacia abajo, estás mirando inclinado (tres puntos de fuga). Si quieres verticales rectas, mira de frente.</span></li></ul></div>`));
    const c2=html(`<div class="caja"><h2 class="ch">Ver</h2><div class="ops"><button data-op="verticales" aria-pressed="${ajuste.verticales}">Verticales</button><button data-op="personas" aria-pressed="${ajuste.personas}">🧍 Personas a escala</button></div>
      <div class="fila" style="margin-top:6px"><label for="na-fov">Campo de visión de tu cámara (°)</label><input type="range" id="na-fov" min="44" max="84" step="1" value="${ajuste.fov}"></div>
      <p class="muted">Si la línea no coincide con el horizonte real (el mar desde el Paseo Marítimo es perfecto para comprobarlo), muévela con «Subir» o «Bajar», o cambia el campo de visión.</p></div>`);
    c2.addEventListener('click',e=>{const b=e.target.closest('[data-op]');if(!b)return;ajuste[b.dataset.op]=!ajuste[b.dataset.op];b.setAttribute('aria-pressed',ajuste[b.dataset.op]);guardarAj()});
    c2.querySelector('#na-fov').oninput=e=>{ajuste.fov=+e.target.value;guardarAj()};
    panel.append(c2,html(`<p class="nota"><b>Recuerda la regla de Mollière:</b> las horizontales del edificio que quedan por encima de esta línea bajan hacia ella; las de debajo suben. Y las cabezas de la gente que está de pie, en suelo llano, quedan más o menos en la línea.</p>`));
    const msg=t=>{$('#na-msg').textContent=t};
    function alOrientar(e){if(e.beta==null)return;tieneSensor=true;const r=Math.PI/180,b=e.beta*r,g=(e.gamma||0)*r;
      const n=[-Math.sin(g)*Math.cos(b),Math.sin(b),Math.cos(g)*Math.cos(b)];// vector «arriba» en el móvil; se suaviza el vector, no los ángulos
      up=up?up.map((v,i)=>v*0.75+n[i]*0.25):n}
    function giroPantalla(){try{return (screen.orientation&&screen.orientation.angle)||window.orientation||0}catch(e){return 0}}
    function dibujar(){if(!vivo)return;raf=requestAnimationFrame(dibujar);
      const cw=cam.clientWidth,ch=cam.clientHeight,vw=video.videoWidth||1,vh=video.videoHeight||1;if(!cw)return;
      svg.setAttribute('viewBox',`0 0 ${cw} ${ch}`);const s=Math.max(cw/vw,ch/vh),f=(Math.max(vw,vh)/2)/Math.tan(ajuste.fov/2*Math.PI/180)*s;
      const H=up?horizonteDeUp(up,f,giroPantalla()):GEOM.horizonteMovil(90,0,f,0);
      const off=ajuste.desplaza,c=[cw/2,ch/2+off],tr=q=>[q[0]+c[0],q[1]+c[1]];
      const [p,q]=H.recta.map(tr);let s2='';
      const lin=(a,b,w,d,op)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#fff" stroke-width="${w+3}" opacity="${0.7*(op||1)}" stroke-linecap="round"/><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#141210" stroke-width="${w}" stroke-dasharray="${d}" opacity="${op||1}"/>`;
      if(ajuste.verticales){const dir=GEOM.norm(GEOM.sub(q,p)),nrm=[-dir[1],dir[0]];const V=H.vertical?tr(H.vertical):null,lejos=!V||GEOM.dist(V,c)>ch*25;
        for(let i=-3;i<=3;i++){const base=GEOM.add(c,GEOM.mul(dir,i*cw/7));if(lejos){s2+=lin(GEOM.add(base,GEOM.mul(nrm,-2000)),GEOM.add(base,GEOM.mul(nrm,2000)),1.3,'2 6',.85)}else s2+=lin(V,GEOM.add(base,GEOM.mul(GEOM.norm(GEOM.sub(base,V)),3000)),1.3,'2 6',.85)}}
      s2+=lin(p,q,3.5,'16 6');
      const hy=y=>p[1]+(q[1]-p[1])*(y-p[0])/((q[0]-p[0])||1e-9);
      if(ajuste.personas){for(const [fx,fy] of [[.2,.92],[.5,.62],[.8,.78]]){const x=cw*fx,yh=hy(x),pie=[x,yh+(ch-yh)*fy];if(pie[1]<=yh+4)continue;const alto=(pie[1]-yh)*1.70/PREF.ojo;
        s2+=ESCENA.siluetaSVG(pie,[x,pie[1]-alto],'').replace('<g class="">','<g fill="#141210" stroke="#fff" stroke-width="1.5">')}}
      const ty=hy(14);s2+=`<text x="14" y="${ty-10}" font-size="14" font-weight="700" fill="#141210" stroke="#fff" stroke-width="4" paint-order="stroke" font-family="Inter,system-ui,sans-serif">HORIZONTE · altura de tus ojos</text>`;
      svg.innerHTML=s2;
      const e=$('#na-estado');if(e){const m=H.mirada;e.textContent=!tieneSensor?'Sin sensor de inclinación: línea en el centro':Math.abs(m)<2.5?'Mirando de frente':'Mirando '+fmt(Math.abs(m),0)+'° hacia '+(m>0?'arriba':'abajo')}
      ultimo={H,c,s,cw,ch,vw,vh}}
    let ultimo=null;
    function horizonteDeUp(u,f,giro){// igual que GEOM.horizonteMovil pero a partir del vector «arriba» ya calculado
      const L=Math.hypot(...u);let [a,b,c]=u.map(v=>v/L);const t=giro*Math.PI/180,ux=a*Math.cos(t)+b*Math.sin(t),uy=-a*Math.sin(t)+b*Math.cos(t);a=ux;b=uy;
      const A=a,B=-b,C=-f*c,Lg=4000;let p,q;if(Math.abs(B)>Math.abs(A)){p=[-Lg,(-C+A*Lg)/B];q=[Lg,(-C-A*Lg)/B]}else{p=[(-C+B*Lg)/A,-Lg];q=[(-C-B*Lg)/A,Lg]}
      if(p[0]>q[0])[p,q]=[q,p];return {recta:[p,q],vertical:Math.abs(c)>1e-6?[-f*a/c,f*b/c]:null,mirada:-Math.asin(Math.max(-1,Math.min(1,c)))*180/Math.PI}}
    async function abrir(){
      msg('Pidiendo permiso…');
      try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')msg('Sin permiso para el sensor de inclinación: la línea se quedará en el centro.')}}catch(e){}
      addEventListener('deviceorientation',alOrientar);
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg('Este navegador no deja usar la cámara desde la app. Ábrela instalada o en Safari o Chrome.');return}
      try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1440}},audio:false})}
      catch(e){msg(e&&e.name==='NotAllowedError'?'Sin permiso para la cámara. Puedes darlo en los ajustes del navegador.':'No se ha podido abrir la cámara.');return}
      video.srcObject=stream;try{await video.play()}catch(e){}
      intro.hidden=true;zona.hidden=false;dibujar();anunciar('Cámara abierta. La línea del horizonte se dibuja sobre la imagen.')}
    intro.querySelector('#na-abrir').onclick=abrir;
    zona.querySelector('#na-sube').onclick=()=>{ajuste.desplaza-=6;guardarAj()};zona.querySelector('#na-baja').onclick=()=>{ajuste.desplaza+=6;guardarAj()};zona.querySelector('#na-cero').onclick=()=>{ajuste.desplaza=0;guardarAj()};
    zona.querySelector('#na-foto').onclick=async()=>{if(!ultimo||!video.videoWidth)return;const {H,c,s,cw,ch,vw,vh}=ultimo,k=Math.min(1,1600/Math.max(vw,vh));
      const cv=document.createElement('canvas');cv.width=Math.round(vw*k);cv.height=Math.round(vh*k);cv.getContext('2d').drawImage(video,0,0,cv.width,cv.height);
      const aFoto=q=>{const xd=q[0]+c[0],yd=q[1]+c[1];return [((xd-cw/2)/s+vw/2)*k,((yd-ch/2)/s+vh/2)*k]};
      const extra={nombre:'Al natural · '+new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})};
      const id=await crearApunte(cv,extra);const p=await ALMACEN.leer(id);p.pers.h0=H.recta.map(aFoto);
      if(H.vertical&&Math.abs(H.mirada)>8)p.pers.modo=3;await ALMACEN.guardar(p);location.hash='#foto/'+id+'/encuadre'};
    limpiar=()=>{vivo=false;cancelAnimationFrame(raf);removeEventListener('deviceorientation',alOrientar);if(stream)stream.getTracks().forEach(t=>t.stop())};
  }
})();
