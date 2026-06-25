import { roundRect } from '../utils';

export class SerenovaPlayer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  speed: number;
  isGrounded: boolean;
  dir: number; // 1 for right, -1 for left
  trail: { x: number; y: number; life: number; maxLife: number }[];
  time: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = 24;
    this.height = 40;
    this.speed = 300; // pixels per second
    this.isGrounded = false;
    this.dir = 1;
    this.trail = [];
    this.time = 0;
  }

  update(dt: number, keys: Record<string, boolean>, groundY: number) {
    this.time += dt;

    // Movement
    if (keys['ArrowLeft'] || keys['a']) {
      this.vx = -this.speed;
      this.dir = -1;
    } else if (keys['ArrowRight'] || keys['d']) {
      this.vx = this.speed;
      this.dir = 1;
    } else {
      this.vx = 0;
    }

    // Gravity
    if (!this.isGrounded) {
      this.vy += 800 * dt; // Gravity
    }

    // Jump
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && this.isGrounded) {
      this.vy = -400;
      this.isGrounded = false;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Ground collision
    if (this.y + this.height / 2 >= groundY) {
      this.y = groundY - this.height / 2;
      this.vy = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Trail logic
    if (this.vx !== 0 && this.isGrounded && Math.random() < 0.3) {
      this.trail.push({
        x: this.x - this.dir * 10,
        y: this.y + this.height / 2 - 5,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.5, // seconds
      });
    }

    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].life += dt;
      this.trail[i].y -= 20 * dt; // float up
      if (this.trail[i].life >= this.trail[i].maxLife) {
        this.trail.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Draw trail
    this.trail.forEach(t => {
      const alpha = 1 - t.life / t.maxLife;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff6ec7';
      ctx.beginPath();
      // Draw small star shape
      const size = 3;
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const a2 = a + Math.PI / 5;
        ctx.lineTo(t.x + Math.cos(a) * size, t.y + Math.sin(a) * size);
        ctx.lineTo(t.x + Math.cos(a2) * size * 0.4, t.y + Math.sin(a2) * size * 0.4);
      }
      ctx.fill();
    });

    ctx.translate(this.x, this.y);
    ctx.scale(this.dir, 1);

    // TODO: ganti placeholder dengan sprite Serenova
    
    // Aura Glow
    const auraPulse = Math.sin(this.time * 5) * 5;
    ctx.shadowBlur = 20 + auraPulse;
    ctx.shadowColor = '#00ffff';

    // Body (Kapsul ungu-cyan)
    const bodyGrad = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
    bodyGrad.addColorStop(0, '#4a2c8f');
    bodyGrad.addColorStop(1, '#00ffff');
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    roundRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 12);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, -5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Topi penyihir kerucut
    ctx.shadowBlur = 0; // reset shadow for hat
    ctx.fillStyle = '#1a1040';
    ctx.beginPath();
    ctx.moveTo(-15, -this.height / 2 + 2);
    ctx.lineTo(15, -this.height / 2 + 2); // brim
    ctx.lineTo(-5, -this.height / 2 - 25); // peak
    ctx.closePath();
    ctx.fill();
    
    // Bintang di topi
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(-2, -this.height / 2 - 10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}
