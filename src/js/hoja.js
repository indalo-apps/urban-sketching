/* ===== Hoja de pruebas para imprimir: casillas para pintar cada pastilla y su tabla de mezclas ===== */
const HOJA=(function(){
  // PDF de varias páginas, cada una con una imagen JPEG (sin librerías: funciona sin conexión; como la lámina de Mosaicos)
  function pdfPaginas(pags,wpt,hpt){
    const enc=new TextEncoder(),partes=[],off=[];let pos=0;
    const add=b=>{const u=typeof b==='string'?enc.encode(b):b;partes.push(u);pos+=u.length};
    const obj=(n,cuerpo,flujo)=>{off[n]=pos;add(`${n} 0 obj\n${cuerpo}\n`);if(flujo){add('stream\n');add(flujo);add('\nendstream\n')}add('endobj\n')};
    const n=pags.length,kids=pags.map((_,i)=>`${3+i*3} 0 R`).join(' ');
    add('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
    obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`);
    pags.forEach((p,i)=>{const a=3+i*3,cont=`q ${wpt.toFixed(2)} 0 0 ${hpt.toFixed(2)} 0 0 cm /Im0 Do Q`;
      obj(a,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wpt.toFixed(2)} ${hpt.toFixed(2)}] /Resources << /XObject << /Im0 ${a+1} 0 R >> >> /Contents ${a+2} 0 R >>`);
      obj(a+1,`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpg.length} >>`,p.jpg);
      obj(a+2,`<< /Length ${cont.length} >>`,enc.encode(cont))});
    const info=3+n*3;obj(info,'<< /Creator (Urban Sketching - indalo-apps) /Producer (Urban Sketching) >>');
    const xref=pos;let x=`xref\n0 ${info+1}\n0000000000 65535 f \n`;for(let i=1;i<=info;i++)x+=String(off[i]).padStart(10,'0')+' 00000 n \n';
    add(x+`trailer\n<< /Size ${info+1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(partes,{type:'application/pdf'})}
  const DPI=150,MM=DPI/25.4,A4=[210,297];
  function pagina(){const c=document.createElement('canvas');c.width=Math.round(A4[0]*MM);c.height=Math.round(A4[1]*MM);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.textBaseline='alphabetic';return {c,x}}
  const mm=v=>v*MM;
  function cabecera(x,titulo,sub,n,tot){x.fillStyle='#9a4527';x.font=`700 ${mm(3)}px Inter, system-ui, sans-serif`;x.fillText('URBAN SKETCHING · HOJA DE PRUEBAS',mm(15),mm(16));
    x.fillStyle='#24201b';x.font=`600 ${mm(7.5)}px "Cormorant Garamond", Georgia, serif`;x.fillText(titulo,mm(15),mm(26));
    x.fillStyle='#555';x.font=`${mm(3)}px Inter, system-ui, sans-serif`;x.fillText(sub,mm(15),mm(32));
    x.fillStyle='#8c8c8c';x.font=`${mm(2.6)}px Inter, system-ui, sans-serif`;x.fillText('indalo-apps.github.io/urban-sketching',mm(15),mm(289));x.textAlign='right';x.fillText(`Página ${n} de ${tot}`,mm(195),mm(289));x.textAlign='left'}
  const recorta=(x,t,max)=>{if(x.measureText(t).width<=max)return t;while(t.length>3&&x.measureText(t+'…').width>max)t=t.slice(0,-1);return t+'…'};
  async function crear(){
    const carta=CARTAS[PREF.marca]||CARTAS.vg,caja=((PREF.caja||{})[PREF.marca])||[];
    let lista=carta.colores.map((c,i)=>({i,num:c[0],nombre:c[1],hex:c[3]}));
    if(caja.length>=2){const s=new Set(caja);lista=lista.filter(c=>s.has(c.i))}
    else if(lista.length>64)return {error:'Esta carta tiene '+lista.length+' colores. Marca antes en «Mi caja» las pastillas que tienes.'};
    try{await Promise.all(['600 30px "Cormorant Garamond"','400 20px Inter','600 20px Inter','700 20px Inter'].map(f=>document.fonts.load(f)))}catch(e){}
    const porPag=20,pagsLista=Math.ceil(lista.length/porPag),mez=lista.filter(c=>!/blanco|white|negro|black/i.test(c.nombre)).slice(0,12),tot=pagsLista+(mez.length>=2?1:0),out=[];
    const titulo=carta.nombre,sub=(caja.length>=2?`Tu caja: ${lista.length} colores`:`Toda la carta: ${lista.length} colores`)+' · '+new Date().toLocaleDateString('es-ES');
    for(let pg=0;pg<pagsLista;pg++){const {c,x}=pagina();cabecera(x,titulo,sub,pg+1,tot);
      x.fillStyle='#24201b';x.font=`${mm(2.9)}px Inter, system-ui, sans-serif`;
      x.fillText(carta.rotulador?'Pinta cada rotulador: trazo seco, y después con poca agua, más agua y mucha agua (con el pincel de agua).':'Pinta cada pastilla: cargada, con algo de agua, con más agua y muy aguada.',mm(15),mm(40));
      x.fillStyle='#8c8c8c';x.fillText('El color impreso es solo orientativo: lo que vale es lo que pintes tú.',mm(15),mm(45));
      const cols=[['Color',15],['Impreso',80],[carta.rotulador?'Seco':'Cargada',96],[carta.rotulador?'Poca agua':'Media',122],[carta.rotulador?'Más agua':'Clara',148],[carta.rotulador?'Mucha agua':'Muy aguada',174]];
      x.fillStyle='#555';x.font=`600 ${mm(2.6)}px Inter, system-ui, sans-serif`;cols.forEach(([t,xx])=>x.fillText(t,mm(xx),mm(53)));
      lista.slice(pg*porPag,pg*porPag+porPag).forEach((co,k)=>{const y=56+k*11.5;
        x.fillStyle='#24201b';x.font=`${mm(3)}px Inter, system-ui, sans-serif`;x.fillText(recorta(x,(co.num?co.num+' · ':'')+co.nombre,mm(62)),mm(15),mm(y+6.5));
        x.fillStyle=co.hex;x.fillRect(mm(80),mm(y),mm(12),mm(9));x.strokeStyle='#bbb';x.lineWidth=mm(0.2);x.strokeRect(mm(80),mm(y),mm(12),mm(9));
        for(const xx of [96,122,148,174]){x.strokeStyle='#9a9a9a';x.lineWidth=mm(0.25);x.strokeRect(mm(xx),mm(y),mm(22),mm(9))}});
      out.push(c)}
    if(mez.length>=2){const {c,x}=pagina();cabecera(x,titulo+' · tabla de mezclas',sub,tot,tot);const n=mez.length,cel=Math.min(13,(195-75)/n);
      x.fillStyle='#24201b';x.font=`${mm(2.9)}px Inter, system-ui, sans-serif`;x.fillText(carta.rotulador?'Cruza cada fila con cada columna: primero el de la fila y encima el de la columna. En la diagonal, el color solo.':'Mezcla a partes iguales el color de la fila con el de la columna. En la diagonal, el color solo.',mm(15),mm(40));
      if(lista.length>mez.length)x.fillStyle='#8c8c8c',x.fillText(`Van los ${n} primeros colores (sin blancos ni negros).`,mm(15),mm(45));
      const x0=75,y0=62;x.font=`600 ${mm(2.8)}px Inter, system-ui, sans-serif`;x.textAlign='center';
      mez.forEach((co,j)=>{x.fillStyle='#24201b';x.fillText(String(j+1),mm(x0+j*cel+cel/2),mm(y0-3))});x.textAlign='left';
      mez.forEach((co,i)=>{const y=y0+i*cel;x.fillStyle='#24201b';x.font=`${mm(2.8)}px Inter, system-ui, sans-serif`;x.fillText(recorta(x,`${i+1}. ${co.nombre}`,mm(52)),mm(15),mm(y+cel/2+1));
        x.fillStyle=co.hex;x.fillRect(mm(68),mm(y+cel/2-2.5),mm(5),mm(5));
        for(let j=0;j<n;j++){x.strokeStyle='#9a9a9a';x.lineWidth=mm(0.25);x.strokeRect(mm(x0+j*cel),mm(y),mm(cel),mm(cel));if(i===j){x.strokeStyle='#24201b';x.lineWidth=mm(0.5);x.strokeRect(mm(x0+j*cel+0.6),mm(y+0.6),mm(cel-1.2),mm(cel-1.2))}}});
      out.push(c)}
    const pags=[];for(const c of out){const b=await new Promise(ok=>c.toBlob(ok,'image/jpeg',0.9));pags.push({jpg:new Uint8Array(await b.arrayBuffer()),w:c.width,h:c.height})}
    return {blob:pdfPaginas(pags,595.28,841.89),nombre:'hoja-de-pruebas-'+carta.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/-+$/,'')+'.pdf',paginas:out.length}}
  async function descargar(msg){
    msg&&msg('Preparando la hoja…');const r=await crear();if(r.error){msg&&msg(r.error);return}
    const f=new File([r.blob],r.nombre,{type:'application/pdf'});
    try{if(navigator.canShare&&navigator.canShare({files:[f]})&&matchMedia('(pointer:coarse)').matches){await navigator.share({files:[f],title:'Hoja de pruebas'});msg&&msg('✓ Hoja lista ('+r.paginas+' páginas).');return}}catch(e){if(e&&e.name==='AbortError'){msg&&msg('');return}}
    const a=document.createElement('a');a.href=URL.createObjectURL(r.blob);a.download=r.nombre;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);msg&&msg('✓ Hoja descargada ('+r.paginas+' páginas, A4).')}
  return {crear,descargar,pdfPaginas}
})();
