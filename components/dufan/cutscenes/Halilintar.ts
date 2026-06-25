export class HalilintarCutscene {
  time: number = 0;
  isFinished: boolean = false;
  score: number = 0;
  distance: number = 0;
  maxDistance: number = 15000; // 15 seconds * 1000 speed
  
  // Player state
  y: number = 0;
  vy: number = 0;
  isGrounded: boolean = true;
  spacePressed: boolean = false;

  // Obstacles
  obstacles: { x: number; passed: boolean }[] = [];
  nextObstacleDist: number = 800;

  start() {
    this.time = 0;
    this.isFinished = false;
    this.score = 0;
    this.distance = 0;
    this.y = 0;
    this.vy = 0;
    this.isGrounded = true;
    this.spacePressed = false;
    this.obstacles = [];
    this.nextObstacleDist = 800;
  }

  update(dt: number, keys: Record<string, boolean>) {
    if (this.isFinished) return;

    this.time += dt;
    const speed = 1000; // pixels per second
    this.distance += speed * dt;

    if (this.distance > this.maxDistance) {
      this.isFinished = true;
      return;
    }

    // Jump logic
    const isSpaceDown = keys[' '] || false;
    if (isSpaceDown && !this.spacePressed && this.isGrounded) {
      this.vy = -600;
      this.isGrounded = false;
      this.spacePressed = true;
    } else if (!isSpaceDown) {
      this.spacePressed = false;
    }

    // Gravity
    if (!this.isGrounded) {
      this.vy += 1500 * dt;
    }
    this.y += this.vy * dt;

    // Ground collision
    if (this.y >= 0) {
      this.y = 0;
      this.vy = 0;
      this.isGrounded = true;
    }

    // Spawn obstacles
    if (this.distance > this.nextObstacleDist) {
      this.obstacles.push({ x: this.distance + 1500, passed: false });
      this.nextObstacleDist += 600 + Math.random() * 800;
    }

    // Update obstacles and collision
    const playerHitbox = { x: 200, y: this.y - 40, w: 60, h: 40 };
    for (const obs of this.obstacles) {
      const screenX = obs.x - this.distance;
      const obsHitbox = { x: screenX, y: -40, w: 40, h: 40 };

      // Check hit
      if (screenX > 100 && screenX < 300) {
        if (
          playerHitbox.x < obsHitbox.x + obsHitbox.w &&
          playerHitbox.x + playerHitbox.w > obsHitbox.x &&
          playerHitbox.y < obsHitbox.y + obsHitbox.h &&
          playerHitbox.y + playerHitbox.h > obsHitbox.y
        ) {
          // Hit! Penalty score, remove obstacle
          this.score = Math.max(0, this.score - 50);
          obs.passed = true;
          obs.x = -9999; // move away
        }
      }

      // Check pass
      if (!obs.passed && screenX < 150) {
        obs.passed = true;
        this.score += 100;
      }
    }

    // Cleanup passed obstacles
    this.obstacles = this.obstacles.filter(obs => obs.x - this.distance > -200);
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    // Fast moving space background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a0514');
    bgGrad.addColorStop(1, '#2d1b69');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Speed lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const lx = (this.distance * 2 + i * 200) % width;
      const ly = (i * 37) % height;
      ctx.moveTo(width - lx, ly);
      ctx.lineTo(width - lx + 100, ly);
    }
    ctx.stroke();

    const groundY = height * 0.7;
    ctx.translate(0, groundY);

    // Draw track (Bezier curve illusion)
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 8;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff6ec7';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let i = 0; i < width; i += 50) {
      // Simulate bumps based on distance
      const bump = Math.sin((this.distance + i) * 0.005) * 20;
      ctx.lineTo(i, bump);
    }
    ctx.stroke();

    // Draw Obstacles
    ctx.fillStyle = '#ff6ec7';
    for (const obs of this.obstacles) {
      const screenX = obs.x - this.distance;
      if (screenX > -100 && screenX < width + 100) {
        const bump = Math.sin((obs.x) * 0.005) * 20;
        ctx.fillRect(screenX, bump - 40, 40, 40);
        // Bintang obstacle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(screenX + 20, bump - 20, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ff6ec7';
      }
    }

    // Draw Player (Serenova on coaster)
    ctx.translate(200, this.y + Math.sin(this.distance * 0.005 + 200) * 20); // follow bump logic approx
    
    // Coaster cart
    ctx.fillStyle = '#ffceb4';
    ctx.fillRect(0, -20, 60, 20);
    // Wheels
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(10, 0, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(50, 0, 8, 0, Math.PI*2); ctx.fill();

    // Serenova
    ctx.fillStyle = '#4a2c8f';
    ctx.fillRect(15, -50, 30, 30);
    ctx.fillStyle = '#00ffff';
    ctx.beginPath(); ctx.arc(30, -55, 10, 0, Math.PI*2); ctx.fill();

    // Sparks
    if (this.isGrounded) {
      ctx.fillStyle = '#ffd166';
      for (let i=0; i<3; i++) {
        ctx.fillRect(-10 + Math.random()*20, Math.random()*10, 4, 4);
      }
    }

    ctx.restore();

    // HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Skor: ${this.score}`, 20, 40);
    
    // Progress bar
    const progress = this.distance / this.maxDistance;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(20, 60, 200, 10);
    ctx.fillStyle = '#ff6ec7';
    ctx.fillRect(20, 60, 200 * progress, 10);

    ctx.textAlign = 'center';
    ctx.fillText(`Tekan SPACE untuk Lompat!`, width / 2, height - 50);
  }
}
