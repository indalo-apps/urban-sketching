/* ===== Escenas 3D muy sencillas (cajas, calles, personas) proyectadas en perspectiva =====
   Sirven para los dibujos de «Aprender», la portada y la foto de ejemplo. Mundo: X a la derecha,
   Y hacia arriba, Z hacia delante, en metros. El ojo está en (cx, ojo, cz). */
const ESCENA=(function(){
  const R=Math.PI/180;
  function camara({ojo=1.6,yaw=0,pitch=0,f=500,w=600,h=400,cx=0,cz=0}){
    const cy=Math.cos(yaw*R),sy=Math.sin(yaw*R),cp=Math.cos(pitch*R),sp=Math.sin(pitch*R);
    const local=([X,Y,Z])=>{X-=cx;Z-=cz;const x=X*cy-Z*sy,z=X*sy+Z*cy,y=Y-ojo;return [x,y*cp-z*sp,y*sp+z*cp]};
    const ver=P=>{const [x,y,z]=local(P);if(z<0.05)return null;return [w/2+f*x/z,h/2-f*y/z]};
    const prof=P=>local(P)[2];
    const dir=([X,Y,Z])=>{const x=X*cy-Z*sy,z0=X*sy+Z*cy,y=Y;const y2=y*cp-z0*sp,z2=y*sp+z0*cp;if(Math.abs(z2)<1e-9)return null;return {p:[w/2+f*x/z2,h/2-f*y2/z2],delante:z2>0}};
    // Horizonte: dirección horizontal hacia delante y otra a 90°
    const h1=dir([Math.sin(yaw*R),0,Math.cos(yaw*R)]),hy=h/2+f*Math.tan(pitch*R);
    return {ver,prof,dir,ojo,yaw,pitch,f,w,h,cx,cz,horizonteY:pitch?hy:h/2,pos:[cx,ojo,cz]}}
  // Caja (edificio): centro (x, z) en el suelo, ancho w, fondo d, alto h, giro en grados, base y0
  function caja({x=0,z=10,w=4,d=4,h=6,giro=0,y0=0,color,ventanas,tejado}){
    const c=Math.cos(giro*R),s=Math.sin(giro*R),P=(lx,ly,lz)=>[x+lx*c+lz*s,y0+ly,z-lx*s+lz*c];
    const hw=w/2,hd=d/2;
    const b=[P(-hw,0,-hd),P(hw,0,-hd),P(hw,0,hd),P(-hw,0,hd)],t=[P(-hw,h,-hd),P(hw,h,-hd),P(hw,h,hd),P(-hw,h,hd)];
    const caras=[
      {pts:[b[0],b[1],t[1],t[0]],n:[-s,0,-c],tipo:'frente',ancho:w},{pts:[b[1],b[2],t[2],t[1]],n:[c,0,-s],tipo:'lado',ancho:d},
      {pts:[b[2],b[3],t[3],t[2]],n:[s,0,c],tipo:'frente',ancho:w},{pts:[b[3],b[0],t[0],t[3]],n:[-c,0,s],tipo:'lado',ancho:d},
      {pts:t,n:[0,1,0],tipo:'techo'}];
    caras.forEach(f=>{f.color=color;f.alto=h;f.ventanas=ventanas&&f.tipo!=='techo'});
    return {caras,esquinas:{b,t},P,w,d,h}}
  // Ventanas de una cara vertical: filas y columnas de huecos (para ver que sus líneas también fugan)
  function huecos(cara,{filas,altoPlanta=3,margen=0.9,ancho=1.1,alto=1.5}={}){
    const [p0,p1,,p3]=cara.pts,L=Math.hypot(p1[0]-p0[0],p1[2]-p0[2]),u=[(p1[0]-p0[0])/L,0,(p1[2]-p0[2])/L],H=p3[1]-p0[1];
    const nf=filas||Math.max(1,Math.floor(H/altoPlanta)),nc=Math.max(1,Math.floor((L-margen)/(ancho+margen))),out=[];
    const paso=L/nc;
    for(let i=0;i<nf;i++)for(let j=0;j<nc;j++){const cx=paso*(j+0.5),y=p0[1]+altoPlanta*i+(altoPlanta-alto)/2+0.3;
      if(y+alto>p3[1]-0.2)continue;const q=(a,yy)=>[p0[0]+u[0]*a+cara.n[0]*0.02,yy,p0[2]+u[2]*a+cara.n[2]*0.02];
      out.push([q(cx-ancho/2,y),q(cx+ancho/2,y),q(cx+ancho/2,y+alto),q(cx-ancho/2,y+alto)])}
    return out}
  // Caras visibles ordenadas de lejos a cerca (pintor), ya proyectadas
  function proyectar(cam,cajas){const out=[];
    for(const k of cajas)for(const f of k.caras){
      const cen=f.pts.reduce((a,p)=>[a[0]+p[0]/f.pts.length,a[1]+p[1]/f.pts.length,a[2]+p[2]/f.pts.length],[0,0,0]);
      const v=[cam.pos[0]-cen[0],cam.pos[1]-cen[1],cam.pos[2]-cen[2]];if(v[0]*f.n[0]+v[1]*f.n[1]+v[2]*f.n[2]<=0)continue;
      const pp=f.pts.map(cam.ver);if(pp.some(p=>!p))continue;
      const hs=f.ventanas?huecos(f).map(w=>w.map(cam.ver)).filter(w=>w.every(Boolean)):[];
      out.push({f,pp,hs,z:cam.prof(cen)})}
    return out.sort((a,b)=>b.z-a.z)}
  const pts=a=>a.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  // Persona sencilla de pie en (x, z), alto «alto»: devuelve su silueta en SVG
  function persona(cam,x,z,alto,clase){const pie=cam.ver([x,0,z]),cab=cam.ver([x,alto,z]);if(!pie||!cab)return '';
    return siluetaSVG(pie,cab,clase)}
  function siluetaSVG(pie,cab,clase){const H=pie[1]-cab[1];if(H<2)return '';const x=pie[0],y=cab[1],r=H*0.075,an=H*0.13;
    return `<g class="${clase||'persona'}"><circle cx="${x}" cy="${y+r}" r="${r}"/><path d="M${x-an} ${y+H*0.52}L${x-an*0.9} ${y+H*0.2}Q${x} ${y+H*0.15} ${x+an*0.9} ${y+H*0.2}L${x+an} ${y+H*0.52}L${x+an*0.45} ${y+H*0.55}L${x+an*0.4} ${y+H}L${x-an*0.4} ${y+H}L${x-an*0.45} ${y+H*0.55}Z"/></g>`}
  return {camara,caja,huecos,proyectar,pts,persona,siluetaSVG}
})();
