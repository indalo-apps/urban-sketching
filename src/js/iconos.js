// ---------- Iconos (app): iconos de trazo propios en vez de emojis en botones y títulos ----------
// Los textos siguen escritos con su emoji (así se traducen igual); al pintarse, el emoji del principio
// se cambia por un icono dibujado, del mismo grosor que el resto de la app y que no cambia de un móvil a otro.
(function(){
const P={
  lapiz:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  imagen:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
  paleta:'<path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-1 1.6-2.1-.5-1.3.3-2.4 1.7-2.4H18a3 3 0 0 0 3-3C21 7.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>',
  compas:'<circle cx="12" cy="4" r="1.6"/><path d="M11.2 5.5L7 18M12.8 5.5L17 18"/><path d="M4 15.5c2.2 2.6 5 4 8 4s5.8-1.4 8-4"/>',
  cuadricula:'<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16"/>',
  documento:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  descargar:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  instalar:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M12 7v7M9.5 11.5L12 14l2.5-2.5"/>',
  movil:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
  libro:'<path d="M4 5.5c2.5-1 5.5-1 8 .5 2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v13.5"/>',
  deshacer:'<path d="M9 7L4 11l5 4"/><path d="M4 11h10a5 5 0 0 1 0 10h-3"/>',
  carrito:'<path d="M3 4h2.5l2 11h10.5l2-8H6.5"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
  tijeras:'<circle cx="6" cy="7" r="2.6"/><circle cx="6" cy="17" r="2.6"/><path d="M8.2 8.5L20 17M8.2 15.5L20 7"/>',
  actualizar:'<path d="M20 11a8 8 0 0 0-14.3-4.6L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.6L20 16"/><path d="M20 20v-4h-4"/>',
  copiar:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  imprimir:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  mezclar:'<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4"/><path d="M18 4l3 3-3 3M18 14l3 3-3 3"/>',
  hecho:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  cerrar:'<path d="M6 6l12 12M18 6L6 18"/>',
  correo:'<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  candado:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  regla:'<path d="M3 15.5L15.5 3l5.5 5.5L8.5 21z"/><path d="M7 11.5l2 2M9.5 9l1.5 1.5M12 6.5l2 2M14.5 4l1.5 1.5"/>',
  lugar:'<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  pasos:'<path d="M10 6h10M10 12h10M10 18h10"/><circle cx="5" cy="6" r="1.3"/><circle cx="5" cy="12" r="1.3"/><circle cx="5" cy="18" r="1.3"/>',
  piezas:'<path d="M12 2.5l2.2 5.3 5.3 2.2-5.3 2.2L12 17.5l-2.2-5.3L4.5 10l5.3-2.2z" transform="translate(0 2)"/>',
  repetir:'<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19 4v4h-4"/>',
  reiniciar:'<path d="M5 12a7 7 0 1 0 2.1-5"/><path d="M5 4v4h4"/>',
  camara:'<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  ojo:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  cuaderno:'<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M5 7H3.5M5 11H3.5M5 15H3.5M9 8h6M9 12h6"/>',
  perspectiva:'<path d="M2 9h20"/><path d="M8 9v9l6-2V9"/><path d="M8 18L2 9M14 16l8-7M8 9V5M14 9V6"/>',
  valores:'<rect x="3" y="6" width="5.5" height="12" rx="1"/><rect x="9.25" y="6" width="5.5" height="12" rx="1" fill="currentColor" fill-opacity=".35"/><rect x="15.5" y="6" width="5.5" height="12" rx="1" fill="currentColor"/>',
  compartir:'<path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/>',
  papelera:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  persona:'<circle cx="12" cy="5" r="2.3"/><path d="M12 8v7M8.5 11h7M12 15l-3 6M12 15l3 6"/>',
  horizonte:'<path d="M2 14h20"/><path d="M6 14a6 6 0 0 1 12 0"/><path d="M12 4v2M5 7l1.4 1.4M19 7l-1.4 1.4"/>',
  mas:'<circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M16 16l4.5 4.5"/>',
  menos:'<circle cx="11" cy="11" r="7"/><path d="M8 11h6M16 16l4.5 4.5"/>',
  ajustar:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  tiempo:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  mano:'<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7-3 0-4.5-1.5-6-4l-2-3.5a1.5 1.5 0 0 1 2.5-1.5L8 13"/>',
  sol:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  mochila:'<path d="M7 8a5 5 0 0 1 10 0v12H7z"/><path d="M10 4.5V3.5h4v1M7 13h10M10 13v2.5h4V13"/>',
  calendario:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  brujula:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  foto:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.5"/>'
};
const M={'✏':'lapiz','🖼':'imagen','🎨':'paleta','📐':'compas','▦':'cuadricula','📄':'documento','⬇':'descargar','📲':'instalar',
  '📱':'movil','📖':'libro','↶':'deshacer','✂':'tijeras','🔄':'actualizar','📋':'copiar','🖨':'imprimir','🔀':'mezclar',
  '✓':'hecho','📏':'regla','✉':'correo','🔒':'candado','✕':'cerrar','↺':'reiniciar','📷':'camara','👁':'ojo','📒':'cuaderno',
  '📤':'compartir','🗑':'papelera','🧍':'persona','🌅':'horizonte','➕':'mas','➖':'menos','⛶':'ajustar','⏱':'tiempo','✋':'mano','☀':'sol','🎒':'mochila','📅':'calendario','🧭':'brujula','📍':'lugar'};
const RE=new RegExp('^(\\s*)('+Object.keys(M).join('|')+')\\uFE0F?\\s*','u');
window.icono=(n,cl='ic')=>`<svg class="${cl}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[n]}</svg>`;
const SEL='button,h2,summary,a.boton,label.boton';
function poner(el){const t=[...el.childNodes].find(n=>n.nodeType===3&&n.nodeValue.trim());if(!t)return;
  const m=t.nodeValue.match(RE);if(!m||t.previousSibling&&t.previousSibling.nodeType===1&&t.previousSibling.matches('svg.ic'))return;
  t.nodeValue=t.nodeValue.slice(m[0].length);const tmp=document.createElement('span');tmp.innerHTML=icono(M[m[2]],t.nodeValue.trim()?'ic':'ic solo');el.insertBefore(tmp.firstChild,t);}
function todo(){document.querySelectorAll(SEL).forEach(poner);}
let pend=false;
new MutationObserver(()=>{if(pend)return;pend=true;queueMicrotask(()=>{pend=false;todo();});}).observe(document.body,{childList:true,characterData:true,subtree:true});
todo();
})();
