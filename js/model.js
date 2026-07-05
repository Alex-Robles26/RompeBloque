"use strict";

/* =========================================================================
   MODEL
   -------------------------------------------------------------------------
   GameModel contiene el estado puro del juego (pala, bola, ladrillos,
   puntuación, vidas, nivel) y toda la lógica de física/colisiones.
   No conoce el canvas ni el DOM: solo datos y reglas.
   ========================================================================= */
class GameModel {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.reset(true);
  }

  reset(fullReset) {
    if (fullReset) {
      this.level = 1;
      this.score = 0;
      this.lives = 3;
    }
    this.paddle = {
      w: this.width * 0.18,
      h: 14,
      x: this.width / 2 - (this.width * 0.18) / 2,
      y: this.height - 34,
      speed: this.width * 1.6
    };
    this.ball = {
      r: Math.max(6, this.width * 0.015),
      x: this.width / 2,
      y: this.paddle.y - 12,
      dx: 0,
      dy: 0,
      speed: this.width * 0.55,
      launched: false
    };
    this.particles = [];
    this.buildBricks();
    this.state = "ready"; // ready | playing | paused | win | lose
  }

  buildBricks() {
    const cols = 8;
    const rows = Math.min(4 + this.level, 8);
    const padding = 6;
    const marginTop = 50;
    const marginSide = 14;
    const brickW = (this.width - marginSide * 2 - padding * (cols - 1)) / cols;
    const brickH = 18;
    const palette = ["#00f0ff", "#3fd3ff", "#ff2e8b", "#ff6bb0", "#ffb800", "#ffd166"];

    this.bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // patrón: algunos huecos aleatorios en niveles superiores para variar
        if (this.level > 2 && Math.random() < 0.06) continue;
        const hits = r < rows * 0.25 ? 2 : 1; // fila superior más resistente
        this.bricks.push({
          x: marginSide + c * (brickW + padding),
          y: marginTop + r * (brickH + padding),
          w: brickW,
          h: brickH,
          alive: true,
          hits: hits,
          maxHits: hits,
          color: palette[(r + c) % palette.length]
        });
      }
    }
  }

  resize(width, height) {
    const scaleX = width / this.width;
    const scaleY = height / this.height;
    this.paddle.x *= scaleX;
    this.paddle.w = width * 0.18;
    this.paddle.y = height - 34;
    this.ball.x *= scaleX;
    this.ball.y *= scaleY;
    this.ball.r = Math.max(6, width * 0.015);
    this.bricks.forEach(b => {
      b.x *= scaleX; b.y *= scaleY; b.w *= scaleX; b.h *= scaleY;
    });
    this.width = width;
    this.height = height;
  }

  launchBall() {
    if (this.ball.launched) return;
    const angle = (-Math.PI / 2) + (Math.random() * 0.6 - 0.3);
    this.ball.dx = Math.cos(angle) * this.ball.speed;
    this.ball.dy = Math.sin(angle) * this.ball.speed;
    this.ball.launched = true;
    this.state = "playing";
  }

  movePaddleTo(centerX) {
    this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.w, centerX - this.paddle.w / 2));
    if (!this.ball.launched) {
      this.ball.x = this.paddle.x + this.paddle.w / 2;
    }
  }

  movePaddleBy(dx) {
    this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.w, this.paddle.x + dx));
    if (!this.ball.launched) {
      this.ball.x = this.paddle.x + this.paddle.w / 2;
    }
  }

  spawnParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x, y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color
      });
    }
  }

  update(dt) {
    if (this.state !== "playing") return;

    // partículas
    this.particles.forEach(p => {
      p.x += p.dx * dt;
      p.y += p.dy * dt;
      p.life -= dt;
    });
    this.particles = this.particles.filter(p => p.life > 0);

    if (!this.ball.launched) return;

    const b = this.ball;
    b.x += b.dx * dt;
    b.y += b.dy * dt;

    // rebote en paredes
    if (b.x - b.r < 0) { b.x = b.r; b.dx *= -1; }
    if (b.x + b.r > this.width) { b.x = this.width - b.r; b.dx *= -1; }
    if (b.y - b.r < 0) { b.y = b.r; b.dy *= -1; }

    // colisión con pala
    const p = this.paddle;
    if (b.y + b.r >= p.y && b.y + b.r <= p.y + p.h + 10 &&
        b.x >= p.x && b.x <= p.x + p.w && b.dy > 0) {
      const hitPos = (b.x - (p.x + p.w / 2)) / (p.w / 2); // -1..1
      const angle = hitPos * (Math.PI / 3); // hasta 60°
      const speed = Math.hypot(b.dx, b.dy);
      b.dx = Math.sin(angle) * speed;
      b.dy = -Math.abs(Math.cos(angle) * speed);
      b.y = p.y - b.r;
    }

    // colisión con ladrillos
    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      if (b.x + b.r > brick.x && b.x - b.r < brick.x + brick.w &&
          b.y + b.r > brick.y && b.y - b.r < brick.y + brick.h) {

        // determinar lado de impacto (simplificado)
        const overlapLeft = (b.x + b.r) - brick.x;
        const overlapRight = (brick.x + brick.w) - (b.x - b.r);
        const overlapTop = (b.y + b.r) - brick.y;
        const overlapBottom = (brick.y + brick.h) - (b.y - b.r);
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapTop || minOverlap === overlapBottom) {
          b.dy *= -1;
        } else {
          b.dx *= -1;
        }

        brick.hits -= 1;
        if (brick.hits <= 0) {
          brick.alive = false;
          this.score += 100 * this.level;
          this.spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
        } else {
          this.score += 25;
        }
        break;
      }
    }

    // bola caída
    if (b.y - b.r > this.height) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.state = "lose";
      } else {
        this.ball.launched = false;
        this.ball.x = this.paddle.x + this.paddle.w / 2;
        this.ball.y = this.paddle.y - 12;
        this.ball.dx = 0; this.ball.dy = 0;
        this.state = "ready";
      }
    }

    // nivel superado
    if (this.bricks.every(br => !br.alive)) {
      this.state = "win";
    }
  }
}
