/* ===== Etapa 5 · Resumen: una tarjeta en imagen para llevar en el cuaderno o compartir ===== */
(function(){
function envolver(x,t,maxW){const pal=t.split(' '),out=[];let l='';for(const w of pal){const p=l?l+' '+w:w;if(x.measureText(p).width>maxW&&l){out.push(l);l=w}else l=p}if(l)out.push(l);return out}
async function tarjeta(mz){
  const p=US.p,W=1080,M=56,c=document.createElement('canvas'),x=c.getContext('2d');
  try{await Promise.all(['600 60px "Cormorant Garamond"','400 28px Inter','600 28px Inter','700 28px Inter'].map(f=>document.fonts.load(f)))}catch(e){}
  const R=ENCAJE.calcular(p),[ex0,ey0,ex1,ey1]=rectEncuadre(),ew=ex1-ex0,eh=ey1-ey0;
  const colW=(W-M*2-24)/2,imgH=Math.round(colW*eh/ew);
  const lineas=[];// texto del cuaderno
  const a=ENCAJE.alturaHz(R);
  if(R.h)lineas.push('Horizonte: '+(a<0?'por debajo del dibujo':a>1?'por encima del dibujo':'al '+Math.round(a*100)+' % de la altura, desde abajo'));
  if(R.A)lineas.push('Punto A: '+ENCAJE.dondeEn(R.A,'x'));if(R.B)lineas.push('Punto B: '+ENCAJE.dondeEn(R.B,'x'));if(R.V)lineas.push('Punto V: '+ENCAJE.dondeEn(R.V,'y'));for(const f of (p.pers.extra||[]))if(R[f])lineas.push('Punto '+f+': '+ENCAJE.dondeEn(R[f],'x'));
  const v=p.val,D=VALORES.claridades(600,v.borroso),u=VALORES.cortes(v,D.L),T=VALORES.tonos(D.L,u);
  const plan=['Reserva los blancos ('+pct(T.cuenta[0])+')'];for(let k=1;k<v.n;k++)plan.push((k===1?'Aguada clara':k===v.n-1?'Oscuros':'Aguada media')+' ('+pct(T.cuenta.slice(k).reduce((s,b)=>s+b,0))+')');
  c.width=W;c.height=4000;
  x.fillStyle='#f5efe4';x.fillRect(0,0,W,c.height);
  let y=M;
  x.fillStyle='#9a4527';x.font='600 24px Inter';x.fillText('URBAN SKETCHING',M,y+4);y+=58;
  x.fillStyle='#24201b';x.font='600 60px "Cormorant Garamond", Georgia, serif';x.fillText((p.nombre||'Apunte').slice(0,34),M,y);y+=40;
  x.fillStyle='#6b6256';x.font='400 24px Inter';x.fillText(fecha(p.creado),M,y);y+=30;
  // foto con el encaje y foto en tonos
  const foto=canvasRecorte(900),k=colW/ew;
  x.drawImage(foto,M,y,colW,imgH);
  x.save();x.beginPath();x.rect(M,y,colW,imgH);x.clip();x.translate(M-ex0*k,y-ey0*k);x.scale(k,k);x.lineWidth=2.4/k;x.strokeStyle='rgba(255,255,255,.9)';
  const lin=(a,b,d)=>{x.setLineDash(d.map(z=>z/k));x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=4.5/k;x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke();x.strokeStyle='#141210';x.lineWidth=2/k;x.stroke()};
  if(R.h){const d=GEOM.norm(GEOM.sub(R.h[1],R.h[0]));lin(GEOM.add(R.h[0],GEOM.mul(d,-1e5)),GEOM.add(R.h[0],GEOM.mul(d,1e5)),[14,5])}
  for(const f of ['A','B','V',...(p.pers.extra||[])])if(R[f])for(const ln of p.pers.lineas[f]||[]){const lejos=GEOM.dist(ln[0],R[f])>GEOM.dist(ln[1],R[f])?ln[0]:ln[1];lin(lejos,R[f],(TRAZO[f]||'').split(' ').filter(Boolean).map(Number))}
  x.restore();
  const ton=VALORES.TONOS[v.n].map(VALORES.Lg),tc=document.createElement('canvas');tc.width=D.w;tc.height=D.h;const tx=tc.getContext('2d'),id=tx.createImageData(D.w,D.h);
  for(let i=0,j=0;i<D.w*D.h;i++,j+=4){const g=ton[T.t[i]];id.data[j]=id.data[j+1]=id.data[j+2]=g;id.data[j+3]=255}tx.putImageData(id,0,0);
  x.drawImage(tc,M+colW+24,y,colW,imgH);
  x.fillStyle='#6b6256';x.font='400 20px Inter';x.fillText('Encaje',M,y+imgH+28);x.fillText(v.n+' tonos',M+colW+24,y+imgH+28);y+=imgH+40;
  const titulo=t=>{y+=40;x.fillStyle='#9a4527';x.font='700 22px Inter';x.fillText(t.toUpperCase(),M,y);y+=8};
  const texto=t=>{x.fillStyle='#24201b';x.font='400 26px Inter';for(const l of envolver(x,t,W-M*2)){y+=36;x.fillText(l,M,y)}};
  titulo('Pásalo a tu cuaderno');lineas.forEach(l=>texto('• '+l));if(!lineas.length)texto('Sin encaje todavía.');y+=20;
  titulo('Plan de aguadas');plan.forEach((l,i)=>texto((i+1)+'. '+l));y+=30;
  titulo('Paleta');y+=10;
  for(let i=0;i<mz.length;i++){const g=mz[i];x.fillStyle=g.hex;x.fillRect(M,y+12,80,80);x.strokeStyle='rgba(0,0,0,.2)';x.lineWidth=1;x.setLineDash([]);x.strokeRect(M,y+12,80,80);
    if(g.op){x.fillStyle=g.op.hex;x.fillRect(M+88,y+12,40,80);x.strokeRect(M+88,y+12,40,80)}
    x.fillStyle='#24201b';x.font='600 25px Inter';x.fillText(`${i+1}. ${g.nombre} · ${g.peso}`,M+148,y+40);
    x.font='400 22px Inter';x.fillStyle='#4a4136';const ls=envolver(x,g.op?g.op.texto:'',W-M*2-148);ls.slice(0,2).forEach((l,j)=>x.fillText(l,M+148,y+70+j*26));y+=104}
  y+=34;x.fillStyle='#6b6256';x.font='400 20px Inter';x.fillText('Colores y mezclas aproximados · indalo-apps.github.io/urban-sketching',M,y);y+=M-10;
  const out=document.createElement('canvas');out.width=W;out.height=Math.ceil(y);out.getContext('2d').drawImage(c,0,0);
  return {canvas:out,lineas,plan}}
ETAPAS.resumen={pintar(cont){
  const p=US.p;
  const z=html(`<div class="cz"><div class="lienzo"><img class="resumen-img" id="re-img" alt="Tarjeta resumen del apunte"><div class="cargando" id="re-carga">Preparando la tarjeta…</div></div><div class="panel"></div></div>`);cont.append(z);
  const panel=z.querySelector('.panel');
  panel.append(html(`<div class="caja"><h2 class="ch">Tu tarjeta</h2><p>El encaje, los tonos, el plan de aguadas y la paleta de este apunte, en una imagen para llevar en el móvil mientras dibujas.</p>
    <div class="ops"><button class="prim" id="re-comp">📤 Compartir imagen</button><button id="re-bajar">⬇ Descargar</button><button id="re-texto">📋 Copiar texto</button></div><p class="muted" id="re-msg" role="status" aria-live="polite" style="margin-top:8px"></p></div>`));
  panel.append(botonSiguiente('resumen'));
  let T=null,yo=true;limpiar=()=>{yo=false};
  // mezclas de la paleta (las mismas de la etapa Color)
  const pinturas=PALETA.pinturas(),G=COLOR.kmedias((()=>{const cv=canvasRecorte(160),d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data,pts=[];for(let j=0;j<d.length;j+=4)pts.push(COLOR.rgbLab([d[j],d[j+1],d[j+2]]));return pts})(),p.col.k).sort((a,b)=>b.peso-a.peso);
  const mz=[];
  const sig=i=>{if(!yo)return;if(i<G.length){const o=COLOR.buscarMezcla(G[i].lab,pinturas,1)[0];mz.push({hex:COLOR.labHex(G[i].lab),nombre:COLOR.nombre(G[i].lab),peso:pct(G[i].peso),op:o&&{hex:o.hex,texto:PALETA.textoMezcla(o,pinturas)}});setTimeout(()=>sig(i+1),15);return}
    tarjeta(mz).then(r=>{if(!yo)return;T=r;$('#re-img').src=r.canvas.toDataURL('image/png');$('#re-carga').hidden=true})};
  setTimeout(()=>sig(0),40);
  const nombreArchivo=()=>'urban-sketching-'+(p.nombre||'apunte').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.png';
  const msg=t=>{$('#re-msg').textContent=t};
  function bajar(){if(!T)return;const a=document.createElement('a');a.download=nombreArchivo();a.href=T.canvas.toDataURL('image/png');document.body.append(a);a.click();a.remove();msg('Imagen descargada.')}
  $('#re-bajar').onclick=bajar;
  $('#re-comp').onclick=async()=>{if(!T){msg('Espera un momento: la tarjeta se está preparando.');return}
    try{const b=await new Promise(ok=>T.canvas.toBlob(ok,'image/png')),f=new File([b],nombreArchivo(),{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:p.nombre||'Urban Sketching'});msg('Compartida.')}else bajar()}catch(e){if(e&&e.name!=='AbortError')bajar()}};
  $('#re-texto').onclick=async()=>{if(!T)return;const t=`${p.nombre||'Apunte'} · Urban Sketching\n\nPásalo a tu cuaderno:\n${T.lineas.map(l=>'• '+l).join('\n')}\n\nPlan de aguadas:\n${T.plan.map((l,i)=>(i+1)+'. '+l).join('\n')}\n\nPaleta:\n${mz.map((g,i)=>`${i+1}. ${g.nombre} (${g.peso}): ${g.op?g.op.texto:''}`).join('\n')}\n\nColores y mezclas aproximados.`;
    try{await navigator.clipboard.writeText(t);msg('✓ Texto copiado.')}catch(e){msg('No se ha podido copiar.')}};
}};
})();
