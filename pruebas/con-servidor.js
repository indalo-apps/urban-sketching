// Arranca un servidor local de la app (puerto 8765), ejecuta la prueba indicada y lo apaga al terminar.
// Uso: node pruebas/con-servidor.js pruebas/navegador.js
const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = process.env.APP_DIR || path.join(__dirname, '..'), PUERTO = 8765;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css' };
const srv = http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html';
  const p = path.join(RAIZ, path.normalize(f));
  if (!p.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end('no'); } res.writeHead(200, { 'Content-Type': TIPOS[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(d); });
});
srv.on('error', e => { if (e.code === 'EADDRINUSE') { console.log('(el puerto 8765 ya está en uso: se usa ese servidor)'); correr(); } else throw e; });
srv.listen(PUERTO, '127.0.0.1', correr);
let hecho = false;
async function correr() {
  if (hecho) return; hecho = true;
  const { spawn } = require('child_process');
  let fallo = 0;
  for (const t of process.argv.slice(2)) {
    fallo |= await new Promise(ok => spawn(process.execPath, [path.resolve(t)], { stdio: 'inherit' }).on('exit', c => ok(c ? 1 : 0)));
  }
  srv.close(); process.exit(fallo);
}
