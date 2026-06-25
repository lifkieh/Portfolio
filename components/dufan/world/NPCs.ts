export class NPCs {
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
    ctx.save();
    
    // Naga terbang di background (Parallax ~0.4)
    ctx.translate(-camX * 0.4, 0);
    this.drawDragon(ctx, this.width * 0.5 + Math.sin(this.time * 0.2) * 500, this.height * 0.3 + Math.cos(this.time * 0.3) * 100);
    ctx.restore();

    ctx.save();
    // Penyihir terbang (Parallax ~0.6)
    ctx.translate(-camX * 0.6, 0);
    this.drawWitch(ctx, (this.time * 150) % (this.width * 2) - 200, this.height * 0.4 + Math.sin(this.time * 2) * 50);
    ctx.restore();

    ctx.save();
    // Balon udara (Parallax ~0.3)
    ctx.translate(-camX * 0.3, 0);
    this.drawBalloon(ctx, this.width * 0.8, this.height * 0.5 + Math.sin(this.time * 0.5) * 30);
    ctx.restore();

    ctx.save();
    // Pangeran & Ratu di ground (Parallax 1.0)
    ctx.translate(-camX, 0);
    const groundY = this.height - 80;
    this.drawRoyals(ctx, 1500, groundY);
    ctx.restore();
    
    // Kembang api (fixed to screen, random positions)
    if (Math.random() < 0.02) {
      // create fireworks particles - omitted for brevity, just draw a burst
    }
  }

  // TODO: ganti dengan sprite naga
  drawDragon(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#ff6ec7';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff6ec7';
    
    // Badan melengkung (segmen)
    for(let i=0; i<10; i++) {
      const segY = Math.sin(this.time * 4 - i * 0.5) * 20;
      ctx.beginPath();
      ctx.arc(-i * 30, segY, 15 - i, 0, Math.PI * 2);
      ctx.fill();
    }
    // Sayap
    ctx.beginPath();
    ctx.moveTo(-60, Math.sin(this.time * 4 - 2) * 20);
    const wingFlap = Math.cos(this.time * 8) * 80;
    ctx.lineTo(-30, -50 + wingFlap);
    ctx.lineTo(-90, -30 + wingFlap * 0.5);
    ctx.fill();
    ctx.restore();
  }

  // TODO: ganti dengan sprite penyihir
  drawWitch(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    // Sapu
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
    // Badan penyihir
    ctx.fillStyle = '#4a2c8f';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, -30);
    ctx.fill();
    // Topi
    ctx.fillStyle = '#1a1040';
    ctx.beginPath();
    ctx.moveTo(-15, -25);
    ctx.lineTo(15, -25);
    ctx.lineTo(0, -50);
    ctx.fill();
    ctx.restore();
  }

  // TODO: ganti dengan sprite balon
  drawBalloon(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#ff6ec7';
    ctx.beginPath();
    ctx.arc(0, -30, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(-10, 5, 20, 15);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-20, -10);
    ctx.lineTo(-10, 5);
    ctx.moveTo(20, -10);
    ctx.lineTo(10, 5);
    ctx.stroke();
    ctx.restore();
  }

  // TODO: ganti dengan sprite Pangeran & Ratu
  drawRoyals(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    // Pangeran
    ctx.fillStyle = '#4a2c8f';
    ctx.fillRect(-30, -60, 20, 60);
    ctx.fillStyle = '#ffceb4';
    ctx.beginPath(); ctx.arc(-20, -70, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd166'; // mahkota
    ctx.fillRect(-26, -85, 12, 8);
    
    // Ratu
    ctx.fillStyle = '#ff6ec7';
    ctx.beginPath(); ctx.moveTo(20, -60); ctx.lineTo(35, 0); ctx.lineTo(5, 0); ctx.fill();
    ctx.fillStyle = '#ffceb4';
    ctx.beginPath(); ctx.arc(20, -70, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd166'; // mahkota
    ctx.fillRect(14, -85, 12, 8);
    ctx.restore();
  }
}
