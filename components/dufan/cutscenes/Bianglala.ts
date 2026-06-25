import { roundRect } from '../utils';

export class BianglalaCutscene {
  time: number = 0;
  isFinished: boolean = false;
  score: number = 0;

  start() {
    this.time = 0;
    this.isFinished = false;
    this.score = 10; // Free score for watching
  }

  update(dt: number, _keys: Record<string, boolean>) {
    this.time += dt;
    if (this.time > 10) {
      this.isFinished = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();

    // ── Background sky ──────────────────────────────────────────────────
    const panY = Math.min(this.time * 40, 250);
    ctx.save();
    ctx.translate(0, panY);

    const skyGrad = ctx.createLinearGradient(0, -panY, 0, height);
    skyGrad.addColorStop(0, '#06021a');
    skyGrad.addColorStop(0.5, '#2d1b69');
    skyGrad.addColorStop(1, '#ff6ec7');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, -panY, width, height + panY);

    // God-rays from behind wheel (fan of light)
    const cx = width / 2;
    const wheelCY = height - 350;
    for (let i = 0; i < 12; i++) {
      const angle = (-Math.PI / 2) + ((i - 6) * Math.PI) / 18;
      const rayAlpha = 0.04 + Math.abs(Math.sin(this.time * 0.4 + i * 0.5)) * 0.06;
      ctx.save();
      ctx.translate(cx, wheelCY);
      ctx.rotate(angle);
      const rayGrad = ctx.createLinearGradient(0, -800, 0, 0);
      rayGrad.addColorStop(0, `rgba(255, 220, 100, 0)`);
      rayGrad.addColorStop(1, `rgba(255, 220, 100, ${rayAlpha})`);
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(-60, 0);
      ctx.lineTo(60, 0);
      ctx.lineTo(30, -800);
      ctx.lineTo(-30, -800);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Stars
    for (let i = 0; i < 120; i++) {
      const sx = (i * 251 + 17) % width;
      const sy = (i * 149 + 31) % (height * 0.7);
      const twinkle = Math.sin(this.time * 2.5 + i * 0.8) * 0.5 + 0.5;
      ctx.globalAlpha = twinkle * 0.8 + 0.15;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy - panY, (i % 4 === 0) ? 1.5 : 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Nebula cloud
    const nebula = ctx.createRadialGradient(cx * 0.8, height * 0.1, 0, cx * 0.8, height * 0.1, 300);
    nebula.addColorStop(0, 'rgba(180, 90, 255, 0.12)');
    nebula.addColorStop(1, 'rgba(180, 90, 255, 0)');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, -panY, width, height + panY);

    // Moon crescent
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ffd166';
    ctx.fillStyle = '#ffe57a';
    ctx.beginPath();
    ctx.arc(width * 0.82, height * 0.12 - panY, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a0a3c';
    ctx.beginPath();
    ctx.arc(width * 0.82 - 18, height * 0.12 - panY - 8, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // end pan translate

    // ── Support structure ────────────────────────────────────────────────
    // Center A-frame pole
    ctx.save();
    ctx.translate(width / 2, height);

    ctx.fillStyle = '#2d1b69';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff6ec7';
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(0, -370);
    ctx.lineTo(14, -370);
    ctx.lineTo(24, 0);
    ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(-14, -370);
    ctx.lineTo(0, -370);
    ctx.lineTo(18, 0);
    ctx.fill();
    // Cross brace
    ctx.strokeStyle = '#4a2c8f';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-22, -80);
    ctx.lineTo(22, -180);
    ctx.moveTo(22, -80);
    ctx.lineTo(-22, -180);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ── Ferris Wheel ─────────────────────────────────────────────────────
    const R = 160;
    const wheelCenterY = -370;
    const SPOKES = 12;
    const rotation = this.time * 0.35;

    ctx.translate(0, wheelCenterY);

    // Outer ring glow
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ffd166';
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner decorative ring
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating group
    ctx.save();
    ctx.rotate(rotation);

    // Spokes
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 3;
    for (let i = 0; i < SPOKES; i++) {
      const a = (i * Math.PI * 2) / SPOKES;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
      ctx.stroke();
    }

    // Hub
    ctx.fillStyle = '#ffd166';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffd166';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Gondolas — counter-rotated to stay upright
    for (let i = 0; i < SPOKES; i++) {
      const a = (i * Math.PI * 2) / SPOKES;
      const gx = Math.cos(a) * R;
      const gy = Math.sin(a) * R;

      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(-rotation); // keep gondola upright

      // Gondola body (rounded rect)
      ctx.fillStyle = (i % 3 === 0) ? '#ff6ec7' : (i % 3 === 1) ? '#4a2c8f' : '#1a6b8a';
      ctx.beginPath();
      roundRect(ctx, -14, 4, 28, 22, 4);
      ctx.fill();

      // Window (glowing)
      ctx.fillStyle = '#ffd166';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffd166';
      ctx.fillRect(-7, 8, 14, 8);
      ctx.shadowBlur = 0;

      // Lamp (bottom of gondola)
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffe88a';
      ctx.beginPath();
      ctx.arc(0, 28, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Hanger rod
      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 4);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore(); // end rotation group

    // Center cap bolt
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // end wheel translate

    // ── Progress bar ─────────────────────────────────────────────────────
    const progress = Math.min(this.time / 10, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    roundRect(ctx, width / 2 - 100, height - 30, 200, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    roundRect(ctx, width / 2 - 100, height - 30, 200 * progress, 8, 4);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bianglala • Tekan ESC untuk keluar', width / 2, height - 40);

    ctx.restore();
  }
}
