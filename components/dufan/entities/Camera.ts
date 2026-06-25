export class Camera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  width: number;
  height: number;
  mode: 'follow' | 'pan';

  constructor(width: number, height: number) {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.width = width;
    this.height = height;
    this.mode = 'follow';
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  update(dt: number, playerX: number, playerY: number) {
    if (this.mode === 'follow') {
      // Center the camera on the player
      this.targetX = playerX - this.width / 2;
      
      // Clamp camera Y to prevent seeing below ground or too high
      this.targetY = 0; // Simple horizontal scroll for now
    }

    // Smooth interpolation (lerp)
    const lerpFactor = 5 * dt;
    this.x += (this.targetX - this.x) * lerpFactor;
    this.y += (this.targetY - this.y) * lerpFactor;

    // Optional bounds checking could be added here
    if (this.x < 0) this.x = 0; 
  }

  panTo(x: number, y: number) {
    this.mode = 'pan';
    this.targetX = x;
    this.targetY = y;
  }

  follow() {
    this.mode = 'follow';
  }
}
