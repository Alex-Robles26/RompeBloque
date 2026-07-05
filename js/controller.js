"use strict";

/* =========================================================================
   CONTROLLER
   -------------------------------------------------------------------------
   GameController conecta la entrada de usuario (teclado, ratón, táctil)
   y el bucle de juego (requestAnimationFrame) con el modelo, y le pide a
   la vista que renderice cada frame.
   ========================================================================= */
class GameController {
  constructor(model, view, canvas) {
    this.model = model;
    this.view = view;
    this.canvas = canvas;
    this.lastTime = null;
    this.keys = { left: false, right: false };
    this.running = false;

    this.bindUI();
    this.bindInput();
    window.addEventListener("resize", () => this.handleResize());
  }

  bindUI() {
    document.getElementById("startBtn").addEventListener("click", () => this.startGame());
    document.getElementById("retryBtn").addEventListener("click", () => this.startGame(true));
    document.getElementById("nextBtn").addEventListener("click", () => this.nextLevel());
    document.getElementById("resumeBtn").addEventListener("click", () => this.togglePause(false));
    document.getElementById("pauseBtn").addEventListener("click", () => this.togglePause());
  }

  bindInput() {
    // teclado
    window.addEventListener("keydown", (e) => {
      if (e.code === "ArrowLeft") this.keys.left = true;
      if (e.code === "ArrowRight") this.keys.right = true;
      if (e.code === "Space") { e.preventDefault(); this.handlePrimaryAction(); }
      if (e.code === "Escape") this.togglePause();
    });
    window.addEventListener("keyup", (e) => {
      if (e.code === "ArrowLeft") this.keys.left = false;
      if (e.code === "ArrowRight") this.keys.right = false;
    });

    // ratón sobre el canvas
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.model.movePaddleTo(e.clientX - rect.left);
    });
    this.canvas.addEventListener("mousedown", () => this.handlePrimaryAction());

    // táctil directo sobre el canvas (arrastrar)
    this.canvas.addEventListener("touchstart", (e) => {
      this.handleTouch(e);
      this.handlePrimaryAction();
    }, { passive: true });
    this.canvas.addEventListener("touchmove", (e) => this.handleTouch(e), { passive: true });

    // botones táctiles de izquierda/derecha (para modo sin arrastre)
    const left = document.getElementById("leftZone");
    const right = document.getElementById("rightZone");
    const setHold = (el, dir, val) => {
      const on = () => this.keys[dir] = val;
      el.addEventListener("touchstart", () => on(true), { passive: true });
      el.addEventListener("touchend", () => on(false), { passive: true });
      el.addEventListener("touchcancel", () => on(false), { passive: true });
      el.addEventListener("mousedown", () => on(true));
      el.addEventListener("mouseup", () => on(false));
      el.addEventListener("mouseleave", () => on(false));
    };
    setHold(left, "left", true);
    setHold(right, "right", true);
  }

  handleTouch(e) {
    if (e.touches.length === 0) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    this.model.movePaddleTo(x);
  }

  handlePrimaryAction() {
    if (this.model.state === "ready") {
      this.model.launchBall();
    }
  }

  startGame(fromRetry) {
    this.view.hideAllOverlays();
    this.model.resize(this.view.cssWidth, this.view.cssHeight);
    this.model.reset(fromRetry ? true : true);
    this.model.state = "ready";
    if (!this.running) {
      this.running = true;
      this.lastTime = null;
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  nextLevel() {
    this.model.level += 1;
    this.view.hideAllOverlays();
    this.model.resize(this.view.cssWidth, this.view.cssHeight);
    this.model.reset(false);
    this.model.state = "ready";
  }

  togglePause(force) {
    if (this.model.state === "playing" || this.model.state === "ready") {
      this.pausedFrom = this.model.state;
      this.model.state = "paused";
      this.view.showOverlay("pause");
    } else if (this.model.state === "paused" && force !== true) {
      this.model.state = this.pausedFrom || "ready";
      this.view.hideAllOverlays();
    } else if (force === false) {
      this.model.state = this.pausedFrom || "ready";
      this.view.hideAllOverlays();
    }
  }

  handleResize() {
    this.view.fitToContainer();
    this.model.resize(this.view.cssWidth, this.view.cssHeight);
  }

  loop(timestamp) {
    if (!this.running) return;
    if (this.lastTime === null) this.lastTime = timestamp;
    const dt = Math.min(0.033, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    if (this.keys.left) this.model.movePaddleBy(-this.model.paddle.speed * dt);
    if (this.keys.right) this.model.movePaddleBy(this.model.paddle.speed * dt);

    this.model.update(dt);
    this.view.render(this.model);

    if (this.model.state === "lose") {
      this.view.dom.finalScore.textContent = this.model.score;
      this.view.showOverlay("lose");
    } else if (this.model.state === "win") {
      this.view.dom.winScore.textContent = this.model.score;
      this.view.showOverlay("win");
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}
