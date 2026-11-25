// Junta src/plantilla.html y las partes de src/ en un solo index.html (la app se publica en un archivo).
// Uso: node herramientas/construir.js        → escribe index.html
//      node herramientas/construir.js --ver  → solo comprueba que index.html está al día (sale con error si no)
const fs=require('fs'),path=require('path');
const raiz=path.join(__dirname,'..'),src=path.join(raiz,'src');
const tpl=fs.readFileSync(path.join(src,'plantilla.html'),'utf8');
const html=tpl.split('\n').map(l=>{const m=l.match(/^(?:\/\*|<!--)@incluir (\S+?)(?:\*\/|-->)$/);
  return m?fs.readFileSync(path.join(src,m[1]),'utf8').replace(/\n$/,''):l;}).join('\n');
const dest=path.join(raiz,'index.html');
if(process.argv.includes('--ver')){const ok=fs.readFileSync(dest,'utf8')===html;console.log(ok?'index.html al día':'index.html NO está al día: ejecuta node herramientas/construir.js');process.exit(ok?0:1);}
fs.writeFileSync(dest,html);console.log('index.html construido:',(html.length/1024).toFixed(0),'KB');
