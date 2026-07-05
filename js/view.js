"use strict";

/* =========================================================================
   VIEW
   -------------------------------------------------------------------------
   GameView se encarga exclusivamente de dibujar el estado del modelo en
   el <canvas> y de actualizar el HUD (elementos del DOM). No contiene
   lógica de juego ni de entrada de usuario.
   ========================================================================= */
class GameView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dom = {
      score: document.getElementById("scoreVal"),
      lives: document.getElementById("livesVal"),
      level: document.getElementById("levelVal"),
      start: document.getElementById("startOverlay"),
      pause: document.getElementById("pauseOverlay"),
      lose: document.getElementById("loseOverlay"),
      win: document.getElementById("winOverlay"),
      finalScore: document.getElementById("finalScore"),
      winScore: document.getElementById("winScore")
    };
  }

  fitToContainer() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cssWidth = rect.width;
    this.cssHeight = rect.height;
  }

  render(model) {
    const ctx = this.ctx;
    const w = this.cssWidth, h = this.cssHeight;
    ctx.clearRect(0, 0, w, h);

    // fondo con leve grid
    ctx.fillStyle = "#060812";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(0,240,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }

    // ladrillos
    model.bricks.forEach(b => {
      if (!b.alive) return;
      const alpha = b.hits < b.maxHits ? 0.55 : 1;
      ctx.fillStyle = b.color;
      ctx.globalAlpha = alpha;
      this.roundRect(ctx, b.x, b.y, b.w, b.h, 3);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // partículas
    model.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // pala con glow
    const p = model.paddle;
    ctx.save();
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#e8ecfb";
    this.roundRect(ctx, p.x, p.y, p.w, p.h, 7);
    ctx.fill();
    ctx.restore();

    // bola con glow
    const b = model.ball;
    ctx.save();
    ctx.shadowColor = "#ff2e8b";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // HUD DOM
    this.dom.score.textContent = model.score;
    this.dom.lives.textContent = model.lives;
    this.dom.level.textContent = model.level;
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  showOverlay(name) {
    [this.dom.start, this.dom.pause, this.dom.lose, this.dom.win].forEach(el => el.classList.add("hidden"));
    if (name === "start") this.dom.start.classList.remove("hidden");
    if (name === "pause") this.dom.pause.classList.remove("hidden");
    if (name === "lose") this.dom.lose.classList.remove("hidden");
    if (name === "win") this.dom.win.classList.remove("hidden");
  }

  hideAllOverlays() {
    [this.dom.start, this.dom.pause, this.dom.lose, this.dom.win].forEach(el => el.classList.add("hidden"));
  }
}
