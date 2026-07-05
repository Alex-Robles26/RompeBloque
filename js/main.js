"use strict";

/* =========================================================================
   BOOTSTRAP
   -------------------------------------------------------------------------
   Punto de entrada: instancia Model, View y Controller, y arranca el
   primer render mostrando la pantalla de inicio.
   ========================================================================= */
window.addEventListener("load", () => {
  const canvas = document.getElementById("gameCanvas");
  const view = new GameView(canvas);
  view.fitToContainer();

  const model = new GameModel(view.cssWidth, view.cssHeight);
  const controller = new GameController(model, view, canvas);

  view.render(model);
  view.showOverlay("start");
});
