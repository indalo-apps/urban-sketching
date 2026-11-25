# Urban Sketching · Perspectiva, valores y color

© 2026 **Carlos Moreno Otto**. Todos los derechos reservados (ver [LICENSE](LICENSE)).

App para dibujar la ciudad (urban sketching): encaja la perspectiva de una foto, planifica los valores y las aguadas, saca la paleta de acuarela y aprende perspectiva con dibujos que se mueven.

Se publica con GitHub Pages: https://indalo-apps.github.io/urban-sketching/  
Enlace para instalarla en el móvil: https://indalo-apps.github.io/urban-sketching/?instalar

## Qué tiene (rutas con `#`)

- **Inicio** (`#inicio`): seguir donde se dejó, nueva foto, Al natural, Aprender, Mis apuntes y un ejemplo inventado.
- **Un apunte** (`#foto/<id>/<etapa>`), en cinco etapas:
  1. **Encuadre**: recorte con la proporción del cuaderno (A5 apaisado o vertical, cuadrado, doble página), guía de tercios y de cielo y suelo (5:8, 8:5, 5:7, 7:5, 5:13, 13:5, de Masao Yamada).
  2. **Encaje**: rectas sobre las aristas del edificio, puntos de fuga (1, 2 o 3 puntos; con más de dos rectas, mínimos cuadrados), horizonte, rejilla, regla de las alturas de Mollière, cono de visión de 60°, «Pásalo a tu cuaderno» (dónde caen el horizonte y los puntos respecto al dibujo), personas a escala y medir alturas con el horizonte (razón doble, válida también con 3 puntos).
  3. **Valores**: la foto en 2 (notan) a 5 tonos, con desenfoque (entrecerrar los ojos), cortes automáticos (k-medias) o a mano y plan de aguadas capa a capa.
  4. **Color**: los colores principales (k-medias en CIELAB) con nombre, valor y temperatura, y con qué pinturas de la carta salen (una o dos y cuánta agua), más la tabla de mezclas. Cartas de Van Gogh, Daniel Smith y Cotman (las de Mosaicos) y «Mi caja».
  5. **Resumen**: tarjeta en imagen para compartir, descargar o copiar como texto.
- **Al natural** (`#natural`): cámara con el horizonte en vivo según la inclinación del móvil, verticales y personas a escala; la foto pasa a Encaje con el horizonte medido.
- **Aprender** (`#aprender`, cada lección en `#aprender/<n>`): 12 lecciones con escenas 3D sencillas (`ESCENA`).
- **Mis apuntes** (`#mis`): fotos y apuntes guardados solo en el móvil (IndexedDB).

Las mezclas usan un modelo espectral: cada pintura se convierte en un espectro de reflectancia suave (sigmoide de un polinomio, Jakob y Hanika, 2019) y se mezcla con Kubelka-Munk longitud de onda a longitud de onda. Es una aproximación.

## Fuentes

- Bruno Mollière, *La perspectiva en urban sketching. Trucos y técnicas para dibujantes*. Gustavo Gili, 2017.
- Stephanie Bower, *The Urban Sketching Handbook: Understanding Perspective*. Quarry, 2016.
- Masao Yamada, *A Beginner’s Guide to Sketching Buildings & Landscapes*. Tuttle, 2023.
- Matthew Brehm, *Drawing Perspective: How to See It and How to Apply It*. Barron’s, 2016.
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
- `npm test`: comprueba que `index.html` está al día, pasa `pruebas/calculos.js` (perspectiva y color con una cámara simulada: puntos de fuga, horizonte, cono, alturas, horizonte del móvil, CIEDE2000, mezclas) y `pruebas/navegador.js` (todas las pantallas en claro y oscuro, móvil, iPad y ordenador, con axe y sin errores).

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
