// TODO: ganti layer-layer ini dengan sprite bertekstur resolusi tinggi
export class Parallax {
  width: number;
  height: number;
  time: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.time = 0;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  update(dt: number) {
    this.time += dt;
  }

  draw(ctx: CanvasRenderingContext2D, camX: number) {
    const W = this.width;
    const H = this.height;
    const t = this.time;

    // ════════════════════════════════════════════════════
    // LAYER 0 — SKY BASE (fixed, no parallax)
    // ════════════════════════════════════════════════════
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#06021a');
    skyGrad.addColorStop(0.55, '#1a1040');
    skyGrad.addColorStop(1, '#2d1b69');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // ════════════════════════════════════════════════════
    // LAYER 1 — GALACTIC STARS + NEBULA (parallax 0.05)
    // ════════════════════════════════════════════════════
    ctx.save();
    ctx.translate(-camX * 0.05, 0);

    // Nebula blobs — three overlapping radial gradients
    const nebulaDefs = [
      { x: W * 0.45, y: H * 0.28, r: 380, c0: 'rgba(160, 60, 255, 0.14)', c1: 'rgba(160, 60, 255, 0)' },
      { x: W * 0.75, y: H * 0.18, r: 260, c0: 'rgba(255, 110, 199, 0.10)', c1: 'rgba(255, 110, 199, 0)' },
      { x: W * 0.2,  y: H * 0.38, r: 200, c0: 'rgba(80, 140, 255, 0.08)',  c1: 'rgba(80, 140, 255, 0)' },
    ];
    for (const n of nebulaDefs) {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, n.c0);
      g.addColorStop(1, n.c1);
      ctx.fillStyle = g;
      ctx.fillRect(-W, 0, W * 3, H * 0.7);
    }

    // Milky-way band
    const mwGrad = ctx.createLinearGradient(W * 0.1, H * 0.05, W * 0.9, H * 0.55);
    mwGrad.addColorStop(0, 'rgba(255,255,255,0)');
    mwGrad.addColorStop(0.5, 'rgba(255,255,255,0.025)');
    mwGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = mwGrad;
    ctx.fillRect(-W, 0, W * 3, H * 0.7);

    // Stars — two size classes, pseudo-random deterministic positions
    for (let i = 0; i < 300; i++) {
      const sx = (i * 251 + 17) % (W * 3) - W;
      const sy = (i * 149 + 31) % (H * 0.72);
      const twinkle = Math.sin(t * (1.5 + (i % 7) * 0.3) + i) * 0.5 + 0.5;
      const r = i % 20 === 0 ? 1.8 : i % 5 === 0 ? 1.2 : 0.65;
      ctx.globalAlpha = twinkle * 0.75 + 0.15;
      ctx.fillStyle = i % 15 === 0 ? '#b3cfff' : '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Moon (crescent)
    const moonX = W * 0.82;
    const moonY = H * 0.14;
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ffd166';
    ctx.fillStyle = '#ffe57a';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#06021a'; // cutout to make crescent
    ctx.beginPath();
    ctx.arc(moonX - 22, moonY - 10, 46, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // ════════════════════════════════════════════════════
    // LAYER 2 — DISTANT CITY SPIRES (parallax 0.18)
    // ════════════════════════════════════════════════════
    ctx.save();
    ctx.translate(-camX * 0.18, 0);

    ctx.fillStyle = '#0e0625';
    ctx.beginPath();
    const spires = [
      { x: -50, bh: 220, w: 70, coneH: 80 },
      { x: 200, bh: 160, w: 55, coneH: 60 },
      { x: 420, bh: 260, w: 85, coneH: 100 },
      { x: 700, bh: 190, w: 60, coneH: 70 },
      { x: 900, bh: 300, w: 100, coneH: 120 },
      { x: 1200, bh: 170, w: 55, coneH: 65 },
      { x: 1450, bh: 240, w: 75, coneH: 90 },
      { x: 1700, bh: 200, w: 65, coneH: 80 },
      { x: 1900, bh: 280, w: 90, coneH: 110 },
      { x: 2100, bh: 150, w: 50, coneH: 60 },
    ];
    for (const s of spires) {
      // Body
      ctx.fillRect(s.x, H - s.bh, s.w, s.bh);
      // Cone
      ctx.beginPath();
      ctx.moveTo(s.x - 10, H - s.bh);
      ctx.lineTo(s.x + s.w + 10, H - s.bh);
      ctx.lineTo(s.x + s.w / 2, H - s.bh - s.coneH);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // ════════════════════════════════════════════════════
    // LAYER 3 — BACKGROUND GOD-RAYS + CASTLE (parallax 0.45)
    // ════════════════════════════════════════════════════
    ctx.save();
    ctx.translate(-camX * 0.45, 0);

    // God-rays emanating from castle center
    const godCX = W * 0.5;
    const godCY = H * 0.55;
    for (let i = 0; i < 14; i++) {
      const baseAngle = ((i / 14) * Math.PI * 2) - Math.PI / 2;
      const rayAlpha = (Math.abs(Math.sin(t * 0.35 + i * 0.45)) * 0.07) + 0.02;
      ctx.save();
      ctx.translate(godCX, godCY);
      ctx.rotate(baseAngle);
      const rg = ctx.createLinearGradient(0, -H * 0.7, 0, 0);
      rg.addColorStop(0, `rgba(255, 210, 100, 0)`);
      rg.addColorStop(1, `rgba(255, 210, 100, ${rayAlpha})`);
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(-45, 0);
      ctx.lineTo(45, 0);
      ctx.lineTo(18, -H * 0.7);
      ctx.lineTo(-18, -H * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Castle silhouette
    const castleX = W * 0.5 - 200;
    const castleTopY = H - 420;
    // Main keep
    ctx.fillStyle = '#1e0b3a';
    ctx.shadowBlur = 60;
    ctx.shadowColor = '#ff6ec7';
    ctx.fillRect(castleX + 60, castleTopY + 80, 280, H - castleTopY - 80);
    ctx.shadowBlur = 0;

    // Battlements
    ctx.fillStyle = '#1e0b3a';
    for (let b = 0; b < 7; b++) {
      ctx.fillRect(castleX + 60 + b * (280 / 7), castleTopY + 62, 280 / 14, 18);
    }

    // Side towers
    this.drawBgTower(ctx, castleX + 60, castleTopY + 60, 70, 190, H);
    this.drawBgTower(ctx, castleX + 340, castleTopY + 60, 70, 190, H);
    // Center spire (tallest)
    this.drawBgTower(ctx, castleX + 165, castleTopY, 80, 260, H);

    // Glowing windows
    const winCols = ['#ffd166', '#ff6ec7', '#a78bfa', '#ffd166'];
    for (let w = 0; w < 4; w++) {
      const wx = castleX + 90 + w * 60;
      const wy = H - 280;
      const pulse = Math.abs(Math.sin(t * 1.5 + w * 0.8)) * 0.5 + 0.5;
      ctx.fillStyle = winCols[w];
      ctx.shadowBlur = 20 * pulse;
      ctx.shadowColor = winCols[w];
      ctx.beginPath();
      ctx.arc(wx + 10, wy, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(wx, wy, 20, 30);
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // ════════════════════════════════════════════════════
    // LAYER 3.5 — FLOATING CLOUDS / MIST (parallax 0.3)
    // ════════════════════════════════════════════════════
    ctx.save();
    ctx.translate(-camX * 0.3, 0);

    const cloudDefs = [
      { x: W * 0.1, y: H * 0.45, rx: 160, ry: 30, alpha: 0.12 },
      { x: W * 0.55, y: H * 0.52, rx: 220, ry: 25, alpha: 0.09 },
      { x: W * 0.85, y: H * 0.40, rx: 130, ry: 20, alpha: 0.10 },
      { x: W * 1.3,  y: H * 0.47, rx: 180, ry: 28, alpha: 0.08 },
    ];
    for (const c of cloudDefs) {
      // Animated horizontal drift
      const drift = Math.sin(t * 0.25 + c.x * 0.002) * 25;
      const fogGrad = ctx.createRadialGradient(c.x + drift, c.y, 0, c.x + drift, c.y, c.rx);
      fogGrad.addColorStop(0, `rgba(160, 120, 255, ${c.alpha})`);
      fogGrad.addColorStop(1, `rgba(160, 120, 255, 0)`);
      ctx.fillStyle = fogGrad;
      ctx.save();
      ctx.scale(1, c.ry / c.rx);
      ctx.beginPath();
      ctx.arc(c.x + drift, c.y * (c.rx / c.ry), c.rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Ground mist band
    const mistGrad = ctx.createLinearGradient(0, H - 180, 0, H - 80);
    mistGrad.addColorStop(0, 'rgba(100, 50, 180, 0)');
    mistGrad.addColorStop(1, 'rgba(100, 50, 180, 0.18)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(-W, H - 180, W * 4, 100);

    ctx.restore();

    // ════════════════════════════════════════════════════
    // LAYER 4 — GROUND + LANTERNS (parallax 1.0)
    // ════════════════════════════════════════════════════
    ctx.save();
    ctx.translate(-camX, 0);

    const groundY = H - 80;

    // Ground fill
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
    groundGrad.addColorStop(0, '#1a0d3f');
    groundGrad.addColorStop(1, '#0d0620');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(-camX - W, groundY, (camX + W) * 3, H - groundY);

    // Ground edge neon line
    ctx.strokeStyle = '#ff6ec7';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff6ec7';
    ctx.beginPath();
    ctx.moveTo(-camX - W, groundY);
    ctx.lineTo(camX + W * 3, groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Path tiles (decorative)
    ctx.fillStyle = 'rgba(255, 110, 199, 0.06)';
    for (let tx = -camX; tx < camX + W * 3; tx += 120) {
      ctx.fillRect(tx, groundY + 5, 80, H - groundY - 5);
    }

    // Lanterns — every 600px
    for (let i = -2; i < 20; i++) {
      const lx = i * 600 + 100;
      if (lx < camX - 300 || lx > camX + W + 300) continue;

      // Pole
      ctx.fillStyle = '#2d1b69';
      ctx.fillRect(lx - 5, groundY - 130, 10, 130);

      // Cross-arm
      ctx.fillRect(lx - 20, groundY - 130, 40, 6);

      // Left lantern
      this.drawLantern(ctx, lx - 22, groundY - 138, t + i);
      // Right lantern
      this.drawLantern(ctx, lx + 22, groundY - 138, t + i + Math.PI);
    }

    ctx.restore();
  }

  private drawBgTower(ctx: CanvasRenderingContext2D, cx: number, topY: number, w: number, coneH: number, H: number) {
    ctx.fillStyle = '#250d45';
    ctx.fillRect(cx - w / 2, topY, w, H - topY);
    ctx.fillStyle = '#3d0f6e';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#a78bfa';
    ctx.beginPath();
    ctx.moveTo(cx - w / 2 - 12, topY);
    ctx.lineTo(cx + w / 2 + 12, topY);
    ctx.lineTo(cx, topY - coneH);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Flag
    ctx.fillStyle = '#ff6ec7';
    ctx.beginPath();
    ctx.moveTo(cx, topY - coneH);
    ctx.lineTo(cx + 22, topY - coneH + 12);
    ctx.lineTo(cx, topY - coneH + 24);
    ctx.closePath();
    ctx.fill();
  }

  private drawLantern(ctx: CanvasRenderingContext2D, x: number, y: number, phase: number) {
    const swing = Math.sin(phase * 0.7) * 6;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((swing * Math.PI) / 180);

    // Chain
    ctx.strokeStyle = '#4a2c8f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 8);
    ctx.stroke();

    // Lantern body
    const lGrad = ctx.createRadialGradient(0, 18, 2, 0, 18, 14);
    lGrad.addColorStop(0, '#ffe57a');
    lGrad.addColorStop(0.6, '#ffb700');
    lGrad.addColorStop(1, 'rgba(255,180,0,0)');
    ctx.fillStyle = lGrad;
    ctx.shadowBlur = 22;
    ctx.shadowColor = '#ffd166';
    ctx.beginPath();
    ctx.arc(0, 18, 13, 0, Math.PI * 2);
    ctx.fill();

    // Glow halo on ground
    const halo = ctx.createRadialGradient(0, 60, 0, 0, 60, 45);
    halo.addColorStop(0, 'rgba(255, 220, 80, 0.12)');
    halo.addColorStop(1, 'rgba(255, 220, 80, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.ellipse(0, 60, 45, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}
