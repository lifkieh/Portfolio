export class KoraKoraCutscene {
  time: number = 0;
  isFinished: boolean = false;
  score: number = 0;
  attempts: number = 0;
  maxAttempts: number = 3;
  spacePressed: boolean = false;
  feedbackText: string = "";
  feedbackTimer: number = 0;

  start() {
    this.time = 0;
    this.isFinished = false;
    this.score = 0;
    this.attempts = 0;
    this.spacePressed = false;
    this.feedbackText = "";
  }

  update(dt: number, keys: Record<string, boolean>) {
    this.time += dt;

    if (this.feedbackTimer > 0) {
      this.feedbackTimer -= dt;
    }

    if (this.attempts >= this.maxAttempts && this.feedbackTimer <= 0) {
      this.isFinished = true;
    }

    const isSpaceDown = keys[' '] || false;
    if (isSpaceDown && !this.spacePressed && this.attempts < this.maxAttempts) {
      this.spacePressed = true;
      this.attempts++;
      
      // Calculate swing angle (-Math.PI/3 to Math.PI/3)
      const swingPhase = Math.sin(this.time * 2);
      const absSwing = Math.abs(swingPhase);
      
      // Peak is when absSwing is close to 1
      if (absSwing > 0.9) {
        this.score += 100;
        this.feedbackText = "PERFECT! +100";
      } else if (absSwing > 0.7) {
        this.score += 50;
        this.feedbackText = "GOOD! +50";
      } else {
        this.feedbackText = "MISS!";
      }
      this.feedbackTimer = 1.0;
    } else if (!isSpaceDown) {
      this.spacePressed = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#100a26');
    bgGrad.addColorStop(1, '#2d1b69');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.translate(width / 2, height * 0.2); // pivot point

    // Tiang penyangga
    ctx.fillStyle = '#4a2c8f';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-100, height * 0.8);
    ctx.lineTo(-80, height * 0.8);
    ctx.lineTo(0, 0);
    ctx.lineTo(80, height * 0.8);
    ctx.lineTo(100, height * 0.8);
    ctx.fill();

    // Ayunan
    const swingAngle = Math.sin(this.time * 2) * (Math.PI / 3);
    ctx.rotate(swingAngle);

    // Lengan pendulum
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 300);
    ctx.stroke();

    // TODO: ganti dengan sprite perahu kora-kora
    ctx.translate(0, 300);
    
    ctx.fillStyle = '#ffd166';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffd166';
    ctx.beginPath();
    ctx.arc(0, -100, 150, 0, Math.PI, false);
    ctx.fill();
    ctx.fillStyle = '#ff6ec7';
    ctx.beginPath();
    ctx.arc(0, -100, 130, 0, Math.PI, false);
    ctx.fill();

    // Lampu tepi
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 140, -100 + Math.sin(a) * 140, 5, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();

    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Skor: ${this.score}`, width / 2, 50);
    ctx.fillText(`Sisa Percobaan: ${this.maxAttempts - this.attempts}`, width / 2, 90);
    
    if (this.attempts < this.maxAttempts) {
      ctx.fillText(`Tekan SPACE saat perahu di ujung tertinggi!`, width / 2, height - 50);
    }

    if (this.feedbackTimer > 0) {
      ctx.fillStyle = this.feedbackText.includes('PERFECT') ? '#ffd166' : 
                      this.feedbackText.includes('GOOD') ? '#ff6ec7' : '#ff0000';
      ctx.font = 'bold 48px sans-serif';
      // Pulse animation
      const scale = 1 + Math.sin(this.feedbackTimer * Math.PI) * 0.2;
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.fillText(this.feedbackText, 0, 0);
      ctx.restore();
    }
  }
}
