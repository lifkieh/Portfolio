import { roundRect } from '../utils';

export class IstanaBonekaCutscene {
  time: number = 0;
  isFinished: boolean = false;
  score: number = 0;
  private particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

  start() {
    this.time = 0;
    this.isFinished = false;
    this.score = 20;
    this.particles = [];
  }

  update(dt: number, _keys: Record<string, boolean>) {
    this.time += dt;
    if (this.time > 18) {
      this.isFinished = true;
    }

    // Spawn magical sparkles along the boat path
    if (Math.random() < 0.35) {
      this.particles.push({
        x: 200 + Math.random() * 300,
        y: 300 + Math.random() * 150,
        vx: (Math.random() - 0.5) * 30,
        vy: -40 - Math.random() * 60,
        life: 1,
        color: Math.random() < 0.5 ? '#ffd166' : '#ff6ec7',
      });
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 1.5;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();

    // ── Background: dark enchanted night ─────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#03010e');
    bgGrad.addColorStop(0.6, '#130b2e');
    bgGrad.addColorStop(1, '#2d0a40');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Floating stars
    for (let i = 0; i < 80; i++) {
      const sx = (i * 317 + 53) % width;
      const sy = (i * 211 + 11) % (height * 0.55);
      const twinkle = Math.sin(this.time * 3 + i) * 0.5 + 0.5;
      ctx.globalAlpha = twinkle * 0.7 + 0.1;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, i % 5 === 0 ? 1.5 : 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Scrolling offset for dark-ride auto-pan
    const scrollX = this.time * 100;

    // ── Castle background (parallax 0.3) ─────────────────────────────────
    ctx.save();
    ctx.translate(-scrollX * 0.3, 0);
    this.drawCastleBackground(ctx, width, height);
    ctx.restore();

    // ── Diorama stage layer (parallax 1.0) ───────────────────────────────
    ctx.save();
    ctx.translate(-scrollX, 0);
    this.drawDiorama1(ctx, 320, height);
    this.drawDiorama2(ctx, 1100, height);
    this.drawDiorama3(ctx, 1900, height);
    ctx.restore();

    // ── Magical particles ─────────────────────────────────────────────────
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // ── Enchanted canal water ─────────────────────────────────────────────
    const waterY = height - 110;
    const waterGrad = ctx.createLinearGradient(0, waterY, 0, height);
    waterGrad.addColorStop(0, 'rgba(100, 20, 180, 0.85)');
    waterGrad.addColorStop(1, 'rgba(30, 5, 60, 0.95)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterY, width, height - waterY);

    // Water shimmer lines
    ctx.strokeStyle = 'rgba(200, 100, 255, 0.3)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const wy = waterY + 15 + i * 18;
      ctx.beginPath();
      for (let x = 0; x < width; x += 8) {
        const yy = wy + Math.sin((x + this.time * 60 * (i + 1)) * 0.04) * 3;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    // Canal edge glow
    ctx.strokeStyle = '#ff6ec7';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff6ec7';
    ctx.beginPath();
    ctx.moveTo(0, waterY);
    ctx.lineTo(width, waterY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ── Player boat ──────────────────────────────────────────────────────
    const boatX = width / 2;
    const boatY = waterY + 10 + Math.sin(this.time * 2.5) * 4;

    ctx.save();
    ctx.translate(boatX, boatY);

    // Boat body
    const boatGrad = ctx.createLinearGradient(-70, -20, 70, 20);
    boatGrad.addColorStop(0, '#ffd166');
    boatGrad.addColorStop(1, '#c9860a');
    ctx.fillStyle = boatGrad;
    ctx.beginPath();
    ctx.moveTo(-70, -18);
    ctx.quadraticCurveTo(-80, 0, -55, 18);
    ctx.lineTo(55, 18);
    ctx.quadraticCurveTo(80, 0, 70, -18);
    ctx.closePath();
    ctx.fill();

    // Gold trim
    ctx.strokeStyle = '#ffe07a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Boat interior
    ctx.fillStyle = '#4a2c8f';
    ctx.fillRect(-50, -14, 100, 18);

    // Serenova silhouette in boat
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00ffff';
    ctx.beginPath();
    ctx.arc(0, -25, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d1b69';
    ctx.fillRect(-8, -14, 16, 18);
    // Wizard hat
    ctx.fillStyle = '#1a1040';
    ctx.beginPath();
    ctx.moveTo(-13, -23); ctx.lineTo(13, -23); ctx.lineTo(0, -50); ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Boat bow star ornament
    ctx.fillStyle = '#ffd166';
    this.drawStar(ctx, 75, -8, 8, 5);

    ctx.restore();

    // ── Vignette ─────────────────────────────────────────────────────────
    const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.25, width / 2, height / 2, width * 0.75);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // ── HUD ───────────────────────────────────────────────────────────────
    const progress = Math.min(this.time / 18, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    roundRect(ctx, width / 2 - 100, height - 30, 200, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#ff6ec7';
    ctx.beginPath();
    roundRect(ctx, width / 2 - 100, height - 30, 200 * progress, 8, 4);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Istana Boneka • Tekan ESC untuk keluar', width / 2, height - 40);

    ctx.restore();
  }

  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, n: number) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const angle = (i * Math.PI) / n - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.42;
      if (i === 0) ctx.moveTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad);
      else ctx.lineTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad);
    }
    ctx.closePath();
    ctx.fill();
  }

  // ── Castle silhouette background ─────────────────────────────────────────
  private drawCastleBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Main body
    ctx.fillStyle = '#1e0b3a';
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ff6ec7';
    ctx.fillRect(width * 0.25, height * 0.3, width * 0.5, height * 0.55);
    ctx.shadowBlur = 0;

    // Battlements on main body
    ctx.fillStyle = '#1e0b3a';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(width * 0.25 + i * (width * 0.5 / 8), height * 0.3 - 18, width * 0.5 / 16, 18);
    }

    // Left tower
    this.drawTower(ctx, width * 0.25, height * 0.55, 90, 200, height);
    // Right tower
    this.drawTower(ctx, width * 0.75, height * 0.55, 90, 200, height);
    // Center spire (tallest)
    this.drawTower(ctx, width * 0.5, height * 0.3, 70, 280, height);

    // Windows row
    const winColors = ['#ffd166', '#ff6ec7', '#a78bfa'];
    for (let i = 0; i < 3; i++) {
      const wx = width * 0.35 + i * (width * 0.5 / 4);
      const wy = height * 0.55;
      ctx.fillStyle = winColors[i];
      ctx.shadowBlur = 20;
      ctx.shadowColor = winColors[i];
      ctx.beginPath();
      ctx.arc(wx, wy, 10, Math.PI, 0); // arch top
      ctx.fill();
      ctx.fillRect(wx - 10, wy, 20, 25);
      ctx.shadowBlur = 0;
    }
  }

  private drawTower(ctx: CanvasRenderingContext2D, cx: number, topY: number, w: number, h: number, screenH: number) {
    // Tower body
    ctx.fillStyle = '#250d45';
    ctx.fillRect(cx - w / 2, topY, w, screenH - topY);

    // Cone roof
    ctx.fillStyle = '#3d0f6e';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#a78bfa';
    ctx.beginPath();
    ctx.moveTo(cx - w / 2 - 12, topY);
    ctx.lineTo(cx + w / 2 + 12, topY);
    ctx.lineTo(cx, topY - h);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Flag on tip
    ctx.fillStyle = '#ff6ec7';
    ctx.beginPath();
    ctx.moveTo(cx, topY - h);
    ctx.lineTo(cx + 26, topY - h + 14);
    ctx.lineTo(cx, topY - h + 28);
    ctx.closePath();
    ctx.fill();

    // Tower window
    ctx.fillStyle = '#ffd166';
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#ffd166';
    ctx.beginPath();
    ctx.arc(cx, topY + 40, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - 8, topY + 40, 16, 18);
    ctx.shadowBlur = 0;
  }

  // ── Diorama scenes along the canal ───────────────────────────────────────
  private drawDiorama1(ctx: CanvasRenderingContext2D, x: number, screenH: number) {
    const stageY = screenH - 180;
    ctx.save();
    ctx.translate(x, stageY);

    // Stage platform
    const platGrad = ctx.createLinearGradient(-120, 0, 120, 30);
    platGrad.addColorStop(0, '#3d0f6e');
    platGrad.addColorStop(1, '#1e0b3a');
    ctx.fillStyle = platGrad;
    ctx.beginPath();
    roundRect(ctx, -120, 0, 240, 35, 6);
    ctx.fill();
    ctx.strokeStyle = '#ff6ec7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Witch puppet with cauldron
    ctx.translate(-50, 0);
    // Cauldron
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(0, -22, 28, 0, Math.PI, false);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(0, -22, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // Legs
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-16, -22); ctx.lineTo(-14, 0);
    ctx.moveTo(16, -22); ctx.lineTo(14, 0);
    ctx.stroke();
    // Bubbles
    const bubblePhase = this.time * 4;
    for (let i = 0; i < 3; i++) {
      const bx = (Math.sin(bubblePhase + i * 2.1) * 14);
      const by = -50 - (((this.time * 50 + i * 30) % 60));
      ctx.globalAlpha = Math.max(0, 1 - (by + 50) / 60);
      ctx.fillStyle = i % 2 === 0 ? '#00ffcc' : '#a78bfa';
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(bx, by, 5 + i * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Witch puppet
    const witchBob = Math.sin(this.time * 2) * 4;
    ctx.translate(48, witchBob);
    ctx.fillStyle = '#4a2c8f';
    // Robe (triangle body)
    ctx.beginPath();
    ctx.moveTo(-14, -50); ctx.lineTo(14, -50); ctx.lineTo(20, -10); ctx.lineTo(-20, -10);
    ctx.closePath(); ctx.fill();
    // Head
    ctx.fillStyle = '#f2c27c';
    ctx.beginPath(); ctx.arc(0, -60, 13, 0, Math.PI * 2); ctx.fill();
    // Hat
    ctx.fillStyle = '#1a1040';
    ctx.beginPath();
    ctx.moveTo(-18, -68); ctx.lineTo(18, -68); ctx.lineTo(4, -105); ctx.closePath();
    ctx.fill();
    // Hat star
    ctx.fillStyle = '#ffd166';
    ctx.shadowBlur = 8; ctx.shadowColor = '#ffd166';
    this.drawStar(ctx, 4, -88, 5, 5);
    ctx.shadowBlur = 0;
    // Arms
    ctx.strokeStyle = '#f2c27c'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-14, -52); ctx.lineTo(-28, -42);
    ctx.moveTo(14, -52); ctx.lineTo(28, -42);
    ctx.stroke();

    ctx.restore();
  }

  private drawDiorama2(ctx: CanvasRenderingContext2D, x: number, screenH: number) {
    const stageY = screenH - 200;
    ctx.save();
    ctx.translate(x, stageY);

    // Stage platform
    ctx.fillStyle = '#1e0b3a';
    ctx.beginPath();
    roundRect(ctx, -150, 0, 300, 35, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mini castle backdrop
    ctx.fillStyle = '#2d1b69';
    ctx.fillRect(-120, -120, 80, 120);
    ctx.fillStyle = '#3d0f6e';
    ctx.beginPath();
    ctx.moveTo(-130, -120); ctx.lineTo(-80, -180); ctx.lineTo(-30, -120);
    ctx.closePath(); ctx.fill();
    // Castle window
    ctx.fillStyle = '#ffd166';
    ctx.shadowBlur = 12; ctx.shadowColor = '#ffd166';
    ctx.beginPath(); ctx.arc(-80, -100, 8, Math.PI, 0); ctx.fill();
    ctx.fillRect(-88, -100, 16, 18); ctx.fill();
    ctx.shadowBlur = 0;

    // Dragon puppet
    const dBob = Math.sin(this.time * 3) * 8;
    ctx.save();
    ctx.translate(60, -60 + dBob);
    ctx.fillStyle = '#ff6ec7';
    ctx.shadowBlur = 12; ctx.shadowColor = '#ff6ec7';
    // Dragon body segments
    for (let i = 0; i < 5; i++) {
      const sx = i * -18;
      const sy = Math.sin(this.time * 3 + i * 0.8) * 6;
      ctx.beginPath();
      ctx.arc(sx, sy, 18 - i * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Head
    ctx.fillStyle = '#ff8edb';
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
    // Eye
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(8, -6, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(9, -6, 3, 0, Math.PI * 2); ctx.fill();
    // Horn
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.moveTo(-4, -22); ctx.lineTo(0, -40); ctx.lineTo(6, -22); ctx.fill();
    // Wings
    ctx.fillStyle = 'rgba(180,50,200,0.7)';
    const wingFlap = Math.cos(this.time * 6) * 25;
    ctx.beginPath();
    ctx.moveTo(-30, -5);
    ctx.quadraticCurveTo(-60, -20 - wingFlap, -80, -wingFlap);
    ctx.quadraticCurveTo(-60, 10, -30, 5);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();
  }

  private drawDiorama3(ctx: CanvasRenderingContext2D, x: number, screenH: number) {
    const stageY = screenH - 170;
    ctx.save();
    ctx.translate(x, stageY);

    // Stage
    ctx.fillStyle = '#1e0b3a';
    ctx.beginPath();
    roundRect(ctx, -130, 0, 260, 35, 6);
    ctx.fill();
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Prince & Princess puppets (idle bob)
    const royalBob = Math.sin(this.time * 1.8) * 3;

    // Prince
    ctx.save();
    ctx.translate(-40, royalBob);
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(-14, -55); ctx.lineTo(14, -55); ctx.lineTo(18, 0); ctx.lineTo(-18, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2c27c'; ctx.beginPath(); ctx.arc(0, -64, 12, 0, Math.PI * 2); ctx.fill();
    // Crown
    ctx.fillStyle = '#ffd166';
    ctx.shadowBlur = 10; ctx.shadowColor = '#ffd166';
    ctx.fillRect(-12, -82, 24, 8);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(-8 + i * 8, -82, 4, Math.PI, 0); ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Princess
    ctx.save();
    ctx.translate(40, royalBob);
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(-16, -55); ctx.lineTo(16, -55); ctx.lineTo(26, 0); ctx.lineTo(-26, 0);
    ctx.closePath(); ctx.fill();
    // Skirt flair
    ctx.beginPath();
    ctx.moveTo(-26, -10); ctx.lineTo(-38, 0); ctx.lineTo(38, 0); ctx.lineTo(26, -10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2c27c'; ctx.beginPath(); ctx.arc(0, -64, 12, 0, Math.PI * 2); ctx.fill();
    // Crown
    ctx.fillStyle = '#ffd166';
    ctx.shadowBlur = 10; ctx.shadowColor = '#ffd166';
    ctx.fillRect(-14, -84, 28, 9);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(-9 + i * 9, -84, 5, Math.PI, 0); ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();
  }
}
