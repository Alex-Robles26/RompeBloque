# Brick Blast 🧱

Juego arcade estilo *rompe-ladrillos*, construido con **HTML5 Canvas + JavaScript puro**, siguiendo el patrón **MVC (Modelo-Vista-Controlador)**. Sin frameworks ni dependencias: funciona con solo abrir `index.html`.

Compatible con escritorio, móvil y tablet (ratón, teclado y controles táctiles).

## Estructura del proyecto

```
brick-blast/
├── index.html          # Estructura HTML (HUD, canvas, overlays, controles táctiles)
├── css/
│   └── style.css       # Todos los estilos visuales
├── js/
│   ├── model.js         # MODEL   -> Estado del juego, física, colisiones
│   ├── view.js          # VIEW    -> Dibujo en canvas + actualización del HUD
│   ├── controller.js     # CONTROLLER -> Entrada de usuario + bucle de juego
│   └── main.js          # Bootstrap: instancia Model/View/Controller
└── README.md
```

### Arquitectura MVC

| Capa | Archivo | Responsabilidad |
|---|---|---|
| **Model** | `js/model.js` | Estado puro: pala, bola, ladrillos, puntuación, vidas, nivel, física y colisiones. No conoce el DOM ni el canvas. |
| **View** | `js/view.js` | Renderiza el estado del modelo en el `<canvas>` y sincroniza el HUD (marcador, vidas, nivel) y los overlays. |
| **Controller** | `js/controller.js` | Escucha teclado, ratón y eventos táctiles; actualiza el modelo y ejecuta el bucle de juego (`requestAnimationFrame`). |

## Cómo jugar

- **Escritorio**: mueve el ratón o usa las flechas ◀ ▶, pulsa `Espacio` para lanzar la bola, `Esc` para pausar.
- **Móvil/tablet**: arrastra el dedo sobre el área de juego, o usa los botones IZQUIERDA/DERECHA en pantalla.

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `brick-blast`).
2. Sube todos los archivos de esta carpeta a la raíz del repositorio:
   ```bash
   git init
   git add .
   git commit -m "Brick Blast: primera versión"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/brick-blast.git
   git push -u origin main
   ```
3. En GitHub, entra a **Settings → Pages**.
4. En **Source**, selecciona la rama `main` y la carpeta `/ (root)`.
5. Guarda. En un par de minutos tu juego estará disponible en:
   ```
   https://TU-USUARIO.github.io/brick-blast/
   ```

No requiere build, ni `npm install`, ni servidor: es HTML/CSS/JS estático, ideal para GitHub Pages, Netlify o Vercel.

## Notas técnicas

- El canvas se re-escala automáticamente al cambiar el tamaño de ventana u orientación del dispositivo.
- Los niveles aumentan la cantidad de filas de ladrillos y añaden ladrillos de dos golpes.
- Sin librerías externas: 100% JavaScript vanilla.
