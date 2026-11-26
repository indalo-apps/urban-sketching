# Urban Sketching · Perspectiva, valores y color

© 2026 **Carlos Moreno Otto**. Todos los derechos reservados (ver [LICENSE](LICENSE)).

App para dibujar la ciudad (urban sketching): encaja la perspectiva de una foto, planifica los valores y las aguadas, saca la paleta de acuarela y aprende perspectiva con dibujos que se mueven.

Se publica con GitHub Pages: https://indalo-apps.github.io/urban-sketching/  
Enlace para instalarla en el móvil: https://indalo-apps.github.io/urban-sketching/?instalar

## Qué tiene (rutas con `#`)

- **Inicio** (`#inicio`): seguir donde se dejó, nueva foto, Al natural, Sol y sombras, Rutas y retos, Lista de material, Aprender, Mis apuntes y un ejemplo inventado.
- **Un apunte** (`#foto/<id>/<etapa>`), en seis etapas:
  1. **Encuadre**: recorte con la proporción del cuaderno (A5 apaisado o vertical, cuadrado, doble página), guía de tercios y de cielo y suelo (5:8, 8:5, 5:7, 7:5, 5:13, 13:5, de Masao Yamada).
  2. **Encaje**, en cuatro partes (Rectas, Medir, Ver y Cuaderno), con lupa al arrastrar un punto y Deshacer: rectas sobre las aristas del edificio, puntos de fuga (1, 2 o 3 puntos; con más de dos rectas, mínimos cuadrados), horizonte, rejilla, regla de las alturas de Mollière, cono de visión de 60°, «Pásalo a tu cuaderno» (dónde caen el horizonte y los puntos respecto al dibujo), personas a escala, medir alturas con el horizonte (razón doble, válida también con 3 puntos), otras fachadas C, D y E con su punto de fuga en el mismo horizonte, medir con el lápiz (ángulo con la horizontal y proporción respecto a una primera medida) y proporciones de una fachada (se deshace la perspectiva con el cono de visión y se dibujan los cuadrados que caben, como propone Stephanie Bower).
  3. **Valores**: la foto en 2 (notan) a 5 tonos, con desenfoque (entrecerrar los ojos), cortes automáticos (k-medias) o a mano, plan de aguadas capa a capa, mapa de bordes (Sobel con adelgazado e histéresis: qué contornos merecen tinta) y trama (cada tono en líneas paralelas, cruzadas o puntos, como enumera Sarah Haley).
  4. **Color**: los colores principales (k-medias en CIELAB) con nombre, valor y temperatura, y con qué pinturas de la carta salen (una o dos y cuánta agua), más la tabla de mezclas y la «Paleta limitada» (las 3 pinturas que mejor cubren toda la foto, con una sola o dos de ellas; `COLOR.paletaLimitada`, un generador que no bloquea el móvil). Cartas de Van Gogh, Daniel Smith y Cotman (las de Mosaicos), los 30 rotuladores Albrecht Dürer de Faber-Castell y «Mi caja», con hoja de pruebas para imprimir en PDF (`src/js/hoja.js`).
  5. **Resumen**: tarjeta en imagen para compartir, descargar o copiar como texto.
  6. **Comparar**: la foto de tu apunte encima de la foto, transparente o en «diferencia», con el horizonte y las fugas (el «sight sizing» de Brehm).
- **Al natural** (`#natural`): cámara con el horizonte en vivo según la inclinación del móvil, verticales y personas a escala; la foto pasa a Encaje con el horizonte medido.
- **Sol y sombras** (`#sol`): posición del sol (fórmulas aproximadas del U.S. Naval Observatory, `src/js/sol.js`) en Almería o en tu ubicación, con la escena desde donde miras (sombra propia y arrojada, punto de fuga de las sombras de Sarah Haley), brújula, largo de las sombras, salida, puesta, mediodía solar y horas doradas.
- **Rutas y retos** (`#rutas`): 17 sitios de Almería y su provincia con un reto y su lección, más retos para cualquier sitio; se pliegan, se marcan como hechos y se filtran (sin hacer o hechos).
- **Lista de material** (`#material`): lista para marcar, editable, para compartir y con recordatorio en el calendario (archivo `.ics` con aviso).
- **Aprender** (`#aprender`, cada lección en `#aprender/<n>`): 21 lecciones con escenas 3D sencillas (`ESCENA`).
- **Mis apuntes** (`#mis`): fotos y apuntes guardados solo en el móvil (IndexedDB).

Las mezclas usan un modelo espectral: cada pintura se convierte en un espectro de reflectancia suave (sigmoide de un polinomio, Jakob y Hanika, 2019) y se mezcla con Kubelka-Munk longitud de onda a longitud de onda. Es una aproximación.

## Fuentes

- Bruno Mollière, *La perspectiva en urban sketching. Trucos y técnicas para dibujantes*. Gustavo Gili, 2017.
- Stephanie Bower, *The Urban Sketching Handbook: Understanding Perspective*. Quarry, 2016.
- Masao Yamada, *A Beginner’s Guide to Sketching Buildings & Landscapes*. Tuttle, 2023.
- Matthew Brehm, *Drawing Perspective: How to See It and How to Apply It*. Barron’s, 2015.
- Ernest R. Norling, *Perspective Made Easy*. Dover, 1999 (Macmillan, 1939).
- Joseph D’Amelio, *Perspective Drawing Handbook*. Dover, 2004 (Tudor, 1964).
- Robert Pastrana, *Simplifying Perspective*. Focal Press, 2015.
- Sarah Haley, *Perspective Drawing*. Tempe Digital, 2018.
- Phil Metzger, *The Art of Perspective*. North Light Books, 2007.
- Craig Attebery, *The Complete Guide to Perspective Drawing: From One-Point to Six-Point*. Focal Press, 2018.
- Jorge Paricio, *Perspective Sketching*. Rockport, 2015.
- Mitch Leeuwe, *How to Draw in Perspective*. Edición del autor, 2020.
- Dong Ho Kim, *Space Drawing: Perspective*.
- Felix Scheinberger, *Acuarela para urban sketchers*. Gustavo Gili, 2015.

Los textos y los dibujos de la app son propios, rehechos a partir de las explicaciones de los libros.

## Cómo está hecha

Sigue la «Guía común para nuestras apps» (proyecto APPS de Claude). Se escribe por partes en `src/` y se publica en un solo `index.html`:

- `node herramientas/construir.js` junta las partes; con `--ver` comprueba que `index.html` está al día.
- `npm test`: comprueba que `index.html` está al día, pasa `pruebas/calculos.js` (perspectiva y color con una cámara simulada: puntos de fuga, horizonte, cono, alturas, horizonte del móvil, CIEDE2000, mezclas, paleta limitada, posición del sol), `pruebas/navegador.js` (todas las pantallas en claro y oscuro, móvil, iPad y ordenador, con axe y sin errores) y `pruebas/usabilidad.js` (en el móvil: la foto fija a la vista, botones de 44 px, Encaje en cuatro partes, lupa, Deshacer, «Ver la foto», tabla de mezclas y filtro de Rutas).

## Cómo sacar una versión nueva

1. Subir el número en `<meta name="app-version">` (`src/plantilla.html`) y en `CACHE` (`sw.js`).
2. Añadir sus novedades arriba del todo en `NOVEDADES` (`src/js/ajustes.js`).
3. `node herramientas/construir.js` y `npm test`.
4. El mensaje del commit empieza por la versión: `v1.1: …`.

Los datos se guardan con claves `us-…` en `localStorage` y en la base IndexedDB `urban-sketching`.

## Autor

Carlos Moreno Otto.

## Licencia

Todos los derechos reservados. Uso personal y educativo gratuito de la app publicada (ver [LICENSE](LICENSE)).

## Aviso

Esta app es una ayuda para aprender y practicar el dibujo urbano y puede contener errores. Los colores en pantalla y las mezclas son aproximados. En caso de error o duda, la fuente fiable son los libros citados.
