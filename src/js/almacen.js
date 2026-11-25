/* ===== Lo guardado en el móvil: preferencias (localStorage) y apuntes con su foto (IndexedDB) ===== */
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
// Preferencias de la app: letra, tema, altura de los ojos, marca de acuarelas y «mi caja» de cada marca
const PREF=Object.assign({letra:'normal',tema:'auto',ojo:1.6,marca:'vg',caja:{}},store.get('us-pref-v1',{}));
const guardarPref=()=>store.set('us-pref-v1',PREF);
const ALMACEN=(function(){
  let db=null,memoria={proyectos:new Map(),fotos:new Map()};
  const abrir=()=>new Promise(ok=>{try{const r=indexedDB.open('urban-sketching',1);
    r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('proyectos'))d.createObjectStore('proyectos',{keyPath:'id'});if(!d.objectStoreNames.contains('fotos'))d.createObjectStore('fotos')};
    r.onsuccess=()=>{db=r.result;ok(true)};r.onerror=()=>ok(false);r.onblocked=()=>ok(false)}catch(e){ok(false)}});
  const listo=abrir();
  const tx=(st,modo,fn)=>new Promise((ok,ko)=>{const t=db.transaction(st,modo),s=t.objectStore(st);const r=fn(s);t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>ko(t.error)});
  async function lista(){await listo;if(!db)return [...memoria.proyectos.values()].sort((a,b)=>b.cambiado-a.cambiado);
    const r=await tx('proyectos','readonly',s=>s.getAll());return (r||[]).sort((a,b)=>b.cambiado-a.cambiado)}
  async function leer(id){await listo;if(!db)return memoria.proyectos.get(id)||null;return (await tx('proyectos','readonly',s=>s.get(id)))||null}
  async function foto(id){await listo;if(!db)return memoria.fotos.get(id)||null;return (await tx('fotos','readonly',s=>s.get(id)))||null}
  async function guardar(p){p.cambiado=Date.now();await listo;const c=JSON.parse(JSON.stringify(p));if(!db){memoria.proyectos.set(p.id,c);return}
    try{await tx('proyectos','readwrite',s=>s.put(c))}catch(e){}}
  async function guardarFoto(id,blob){await listo;if(!db){memoria.fotos.set(id,blob);return}try{await tx('fotos','readwrite',s=>s.put(blob,id))}catch(e){}}
  async function borrarFoto(id){await listo;if(!db){memoria.fotos.delete(id);return}try{await tx('fotos','readwrite',s=>s.delete(id))}catch(e){}}
  async function borrar(id){await listo;if(!db){memoria.proyectos.delete(id);memoria.fotos.delete(id);memoria.fotos.delete(id+'-apunte');return}
    await tx('proyectos','readwrite',s=>s.delete(id));await tx('fotos','readwrite',s=>s.delete(id));await borrarFoto(id+'-apunte')}
  const persistente=async()=>{await listo;return !!db};
  return {lista,leer,foto,guardar,guardarFoto,borrarFoto,borrar,persistente}
})();
