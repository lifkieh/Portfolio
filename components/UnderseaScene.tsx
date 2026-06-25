'use client';

import { useEffect, useRef, useState } from "react";

export default function UnderseaScene() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  const fisherIndexRef = useRef(0);
  const pointerRef = useRef({ x: -1000, y: -1000, clicked: false });

  // Pantau class theme-undersea pada <html>
  useEffect(() => {
    const check = () =>
      setActive(document.documentElement.classList.contains("theme-undersea"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  // ===== Canvas parallax bawah laut =====
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    // ===== Events =====
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) return;
      pointerRef.current.x = (e as MouseEvent).clientX;
      pointerRef.current.y = (e as MouseEvent).clientY;
    }
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        pointerRef.current.x = e.touches[0].clientX;
        pointerRef.current.y = e.touches[0].clientY;
      } else {
        pointerRef.current.x = (e as MouseEvent).clientX;
        pointerRef.current.y = (e as MouseEvent).clientY;
      }
      pointerRef.current.clicked = true;
    }
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown, { passive: true });

    let scrollY = window.scrollY;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });

    // garis air
    const surface = () => H * 0.14;

    // --- entitas ---
    const rng = (a: number, b: number) => a + Math.random() * (b - a);

    const bubbles = Array.from({ length: 60 }, () => ({
      x: rng(0, 1), y: rng(0, 1), r: rng(1, 4), s: rng(0.05, 0.25),
    }));

    const fishes = Array.from({ length: 12 }, () => ({
      x: rng(0, 1), y: rng(0.35, 0.92), s: rng(0.0008, 0.0022),
      size: rng(10, 22), dir: Math.random() > 0.5 ? 1 : -1,
      hue: [22, 30, 200, 48][Math.floor(rng(0, 4))], wob: rng(0, 6.28),
    }));

    const seaweeds = Array.from({ length: 14 }, () => ({
      x: rng(0.02, 0.98), h: rng(60, 150), w: rng(8, 16), phase: rng(0, 6.28),
    }));

    const jellies = Array.from({ length: 5 }, () => ({
      x: rng(0.1, 0.9), y: rng(0.4, 0.85), s: rng(0.05, 0.12),
      size: rng(10, 18), phase: rng(0, 6.28),
    }));

    const dolphins = Array.from({ length: 2 }, (_, i) => ({
      x: rng(0, 1), y: rng(0.22, 0.34), s: rng(0.0015, 0.0025),
      dir: i % 2 ? 1 : -1, phase: rng(0, 6.28),
    }));

    let t = 0;

    const draw = () => {
      t += 0.016;
      const surf = surface();
      const parY = scrollY * 0.15; // parallax offset

      ctx.clearRect(0, 0, W, H);

      // ===== langit =====
      const sky = ctx.createLinearGradient(0, 0, 0, surf);
      sky.addColorStop(0, "#bfe6ff");
      sky.addColorStop(1, "#7fc4e8");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, surf);

      // ===== air dalam =====
      const water = ctx.createLinearGradient(0, surf, 0, H);
      water.addColorStop(0, "#1b6f9e");
      water.addColorStop(0.5, "#0f4f78");
      water.addColorStop(1, "#072f4d");
      ctx.fillStyle = water;
      ctx.fillRect(0, surf, W, H - surf);

      // ===== light rays =====
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) {
        const x = W * (0.2 + i * 0.16) + Math.sin(t * 0.3 + i) * 20;
        const grd = ctx.createLinearGradient(x, surf, x + 60, H);
        grd.addColorStop(0, "rgba(180,230,255,0.18)");
        grd.addColorStop(1, "rgba(180,230,255,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(x, surf);
        ctx.lineTo(x + 50, surf);
        ctx.lineTo(x + 160, H);
        ctx.lineTo(x - 60, H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // ===== ombak =====
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 8) {
        const y = surf + Math.sin(x * 0.03 + t * 2) * 4;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // ===== KRAKEN =====
      drawKraken(ctx, W * 0.5, H * 0.95 - parY * 0.3, t, Math.min(W, H));

      // ===== Bikini Bottom =====
      drawBikiniBottom(ctx, W * 0.78, H - 80 - parY * 0.5, Math.min(W, 900) / 900);

      // ===== mermaid & merman =====
      drawMermaid(ctx, W * 0.18 + Math.sin(t * 0.4) * 25, H * 0.55 - parY * 0.2, t, "#ff8fb0");
      drawMerman(ctx, W * 0.62 + Math.cos(t * 0.35) * 25, H * 0.68 - parY * 0.2, t, "#4fd0c0");

      // ===== lumba-lumba =====
      for (const d of dolphins) {
        d.x += d.s * d.dir;
        if (d.x > 1.1) d.x = -0.1;
        if (d.x < -0.1) d.x = 1.1;
        const y = (d.y) * H + Math.sin(t + d.phase) * 8 - parY * 0.1;
        drawDolphin(ctx, d.x * W, y, d.dir, t);
      }

      // ===== ikan =====
      for (const f of fishes) {
        f.x += f.s * f.dir;
        if (f.x > 1.1) f.x = -0.1;
        if (f.x < -0.1) f.x = 1.1;
        const y = f.y * H + Math.sin(t * 1.5 + f.wob) * 6 - parY * 0.2;
        drawFish(ctx, f.x * W, y, f.size, f.dir, f.hue);
      }

      // ===== ubur-ubur =====
      for (const j of jellies) {
        const y = j.y * H + Math.sin(t * 0.8 + j.phase) * 20 - parY * 0.3;
        drawJelly(ctx, j.x * W, y, j.size, t + j.phase);
      }

      // ===== SpongeBob & Patrick =====
      drawJellyChase(ctx, W, H - parY * 0.5, t);

      // ===== rumput laut =====
      ctx.fillStyle = "#1f7a4d";
      for (const s of seaweeds) {
        drawSeaweed(ctx, s.x * W, H - parY * 0.5, s.h, s.w, t + s.phase);
      }

      // ===== gelembung =====
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (const b of bubbles) {
        b.y -= b.s * 0.01;
        if (b.y < 0) b.y = 1;
        const yy = surf + b.y * (H - surf) - parY * 0.1;
        ctx.beginPath();
        ctx.arc(b.x * W + Math.sin(t + b.y * 10) * 4, yy, b.r, 0, 7);
        ctx.fill();
      }

      // ===== Thousand Sunny & Mugiwara Crew (Canvas Draw) =====
      const shipX = W * 0.35;
      const shipY = surf - 25 + Math.sin(t * 2) * 4; // Hull bottom at waterline
      let hovered = false;

      ctx.save();
      ctx.translate(shipX, shipY);
      const sway = Math.sin(t * 1.5) * 0.04;
      ctx.rotate(sway);

      // --- Ship Hull ---
      ctx.fillStyle = '#f1c40f'; // Bright Yellow
      ctx.beginPath();
      ctx.moveTo(-100, -10);
      ctx.lineTo(100, -10);
      ctx.lineTo(80, 25);
      ctx.lineTo(-80, 25);
      ctx.closePath();
      ctx.fill();

      // Green trim
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(-98, -10, 196, 4);
      ctx.fillRect(-85, 20, 170, 4);

      // Cabin
      ctx.fillStyle = '#f5deb3';
      ctx.fillRect(-60, -50, 120, 40);
      ctx.strokeStyle = '#d2b48c';
      ctx.lineWidth = 2;
      for (let i = -50; i <= 50; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, -50); ctx.lineTo(i, -10); ctx.stroke();
      }
      // Door
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(-10, -35, 20, 25);
      ctx.fillStyle = '#ffd700'; // Knob
      ctx.beginPath(); ctx.arc(6, -22, 2, 0, Math.PI * 2); ctx.fill();

      // Mast
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(-5, -180, 10, 130);
      // Crow's nest
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(-15, -180, 30, 20);

      // Sail
      ctx.fillStyle = '#fff';
      ctx.fillRect(-45, -150, 110, 70);

      // Jolly Roger
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(10, -120, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(2, -108, 16, 6); // Teeth
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(6, -122, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(14, -122, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(6, -122, 1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(14, -122, 1, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-5, -135); ctx.lineTo(25, -95); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(25, -135); ctx.lineTo(-5, -95); ctx.stroke();

      // Lion head (Sun)
      ctx.fillStyle = '#e67e22';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(-100, -5);
        ctx.lineTo(-100 + Math.cos(angle - 0.2) * 20, -5 + Math.sin(angle - 0.2) * 20);
        ctx.lineTo(-100 + Math.cos(angle + 0.2) * 20, -5 + Math.sin(angle + 0.2) * 20);
        ctx.fill();
      }
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath(); ctx.arc(-100, -5, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(-104, -8, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-96, -8, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-100, -1, 6, 0, Math.PI, false); ctx.stroke();

      // --- Crew Hit Detection & Draw ---
      const crew = [
        { name: 'Luffy', shirt: '#e74c3c', hair: '#000', hat: '#f1c40f', xOffset: -55 },
        { name: 'Zoro', shirt: '#2ecc71', hair: '#27ae60', hat: null, xOffset: -33 },
        { name: 'Nami', shirt: '#3498db', hair: '#d35400', hat: null, xOffset: -11 },
        { name: 'Usopp', shirt: '#c0392b', hair: '#000', hat: '#7f8c8d', xOffset: 11 },
        { name: 'Sanji', shirt: '#2c3e50', hair: '#f1c40f', hat: null, xOffset: 33 },
        { name: 'Chopper', shirt: '#e91e63', hair: '#8b4513', hat: '#e91e63', xOffset: 55 },
      ];

      // Convert global mouse pointer to local ship space to check hits
      const dx = pointerRef.current.x - shipX;
      const dy = pointerRef.current.y - shipY;
      const localX = dx * Math.cos(-sway) - dy * Math.sin(-sway);
      const localY = dx * Math.sin(-sway) + dy * Math.cos(-sway);

      crew.forEach((c, i) => {
        const cx = c.xOffset;
        const cy = -10; // deck level

        // Hitbox roughly covers the body and head
        const isHover = localX > cx - 14 && localX < cx + 14 && localY > cy - 35 && localY < cy + 5;
        if (isHover) {
          hovered = true;
          if (pointerRef.current.clicked) {
            fisherIndexRef.current = i;
          }
        }

        const isActive = fisherIndexRef.current === i;
        const bob = isActive ? Math.sin(t * 5) * 2 : 0;

        // Body
        ctx.fillStyle = c.shirt;
        ctx.fillRect(cx - 7, cy - 18 + bob, 14, 16);

        // Head
        ctx.fillStyle = '#ffceb4'; // Skin
        ctx.beginPath(); ctx.arc(cx, cy - 23 + bob, 7, 0, Math.PI * 2); ctx.fill();

        if (c.hat) {
          ctx.fillStyle = c.hat;
          ctx.beginPath(); ctx.ellipse(cx, cy - 28 + bob, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx, cy - 30 + bob, 6, Math.PI, 0); ctx.fill();
        } else {
          ctx.fillStyle = c.hair;
          ctx.beginPath(); ctx.arc(cx, cy - 25 + bob, 7, Math.PI, 0); ctx.fill();
        }

        // Active Outline Highlight
        if (isActive) {
          ctx.strokeStyle = 'rgba(255,255,255,0.8)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx - 12, cy - 36 + bob, 24, 40);
        }
      });

      // --- Fishing Rod & Line ---
      const activeC = crew[fisherIndexRef.current];
      const acx = activeC.xOffset;
      const acy = -10 + Math.sin(t * 5) * 2; // match deck cy

      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(acx + 7, acy - 12);
      ctx.lineTo(acx + 45, acy - 35);
      ctx.stroke();

      const tipX = acx + 45;
      const tipY = acy - 35;

      // Line to deep water
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      const localSeaDepth = (H - shipY) * 0.8;
      ctx.lineTo(tipX, localSeaDepth);
      ctx.stroke();

      // Bobber
      ctx.fillStyle = '#ff4757';
      ctx.beginPath(); ctx.arc(tipX, tipY + 40, 3, 0, Math.PI * 2); ctx.fill();

      // Hook/Bait at the bottom
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(tipX, localSeaDepth, 2, 0, Math.PI * 2); ctx.fill();

      ctx.restore(); // end ship

      // Handle cursor style
      canvas.style.cursor = hovered ? 'pointer' : 'default';

      pointerRef.current.clicked = false;
      rafRef.current = requestAnimationFrame(draw);
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-0 transition-opacity duration-1000 opacity-100 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" style={{ pointerEvents: 'auto' }} />
    </div>
  );
}

/* ===================== Helper Gambar (Canvas) ===================== */

function drawFish(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, dir: number, hue: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.fillStyle = `hsl(${hue} 80% 55%)`;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.55, 0, 0, 7);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.lineTo(-size * 1.6, -size * 0.5);
  ctx.lineTo(-size * 1.6, size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(size * 0.5, -size * 0.1, size * 0.12, 0, 7); ctx.fill();
  ctx.restore();
}

function drawJelly(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(180,140,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.7, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = "rgba(200,170,255,0.5)";
  ctx.lineWidth = 1.5;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * size * 0.3, 0);
    for (let s = 0; s < 4; s++) {
      ctx.lineTo(i * size * 0.3 + Math.sin(t * 3 + s + i) * 3, s * size * 0.4);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawSeaweed(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number, w: number, t: number) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  for (let i = 0; i <= 10; i++) {
    const yy = baseY - (h / 10) * i;
    const xx = x + Math.sin(t + i * 0.5) * (i * 1.2);
    ctx.lineTo(xx, yy);
  }
  for (let i = 10; i >= 0; i--) {
    const yy = baseY - (h / 10) * i;
    const xx = x + Math.sin(t + i * 0.5) * (i * 1.2) + w;
    ctx.lineTo(xx, yy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawKraken(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(90,40,70,0.45)";
  ctx.beginPath();
  ctx.ellipse(0, 0, scale * 0.18, scale * 0.16, 0, 0, 7);
  ctx.fill();
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * scale * 0.04, 0);
    for (let s = 0; s < 6; s++) {
      const yy = -s * scale * 0.04;
      const xx = i * scale * 0.05 + Math.sin(t * 1.5 + s * 0.6 + i) * scale * 0.03;
      ctx.lineTo(xx, yy);
    }
    ctx.lineWidth = scale * 0.02;
    ctx.strokeStyle = "rgba(90,40,70,0.45)";
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,220,120,0.7)";
  ctx.beginPath(); ctx.arc(-scale * 0.05, -scale * 0.02, scale * 0.02, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(scale * 0.05, -scale * 0.02, scale * 0.02, 0, 7); ctx.fill();
  ctx.restore();
}

function drawDolphin(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.rotate(Math.sin(t) * 0.1);
  ctx.fillStyle = "#9fb8c8";
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 9, 0, 0, 7);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-26, 0); ctx.lineTo(-38, -8); ctx.lineTo(-30, 0); ctx.lineTo(-38, 8);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(2, -7); ctx.lineTo(10, -20); ctx.lineTo(14, -6);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawMermaid(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#ffd9b0";
  ctx.beginPath(); ctx.arc(0, -22, 7, 0, 7); ctx.fill();
  ctx.fillStyle = "#7a3b1a";
  ctx.beginPath(); ctx.arc(0, -24, 8, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#ffd9b0";
  ctx.fillRect(-5, -16, 10, 14);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-5, -2);
  ctx.quadraticCurveTo(0, 20 + Math.sin(t * 2) * 4, -8, 30);
  ctx.lineTo(8, 30);
  ctx.quadraticCurveTo(0, 20, 5, -2);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawMerman(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#e8c8a0";
  ctx.beginPath(); ctx.arc(0, -22, 7, 0, 7); ctx.fill();
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath(); ctx.arc(0, -25, 8, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#e8c8a0";
  ctx.fillRect(-6, -16, 12, 15);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-6, -1);
  ctx.quadraticCurveTo(0, 22 + Math.cos(t * 2) * 4, -9, 32);
  ctx.lineTo(9, 32);
  ctx.quadraticCurveTo(0, 22, 6, -1);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawBikiniBottom(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // rumah nanas
  ctx.fillStyle = "#e0a83c";
  ctx.beginPath();
  ctx.ellipse(0, -40, 28, 48, 0, 0, 7);
  ctx.fill();
  ctx.strokeStyle = "rgba(120,80,10,0.5)";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(i * 12, -84); ctx.lineTo(i * 12, 4); ctx.stroke();
  }
  ctx.fillStyle = "#7bc043";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 8, -84);
    ctx.lineTo(i * 8 - 6, -100);
    ctx.lineTo(i * 8 + 6, -100);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = "#5a3210";
  ctx.beginPath(); ctx.ellipse(0, -10, 8, 12, 0, 0, 7); ctx.fill();
  // batu Squidward
  ctx.fillStyle = "#9a8f7a";
  ctx.beginPath(); ctx.ellipse(48, -18, 22, 26, 0, 0, 7); ctx.fill();
  ctx.restore();
}

function drawJellyChase(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  const jx = W * (0.35 + 0.2 * (0.5 + 0.5 * Math.sin(t * 0.6)));
  const jy = H * 0.82 + Math.sin(t * 3) * 6;
  drawJelly(ctx, jx, jy, 12, t);

  // SpongeBob
  const sx = jx - 70 + Math.sin(t * 6) * 4;
  const sy = H * 0.86;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.fillStyle = "#ffe23d";
  ctx.fillRect(-12, -16, 24, 24);
  ctx.strokeStyle = "#c9a400"; ctx.strokeRect(-12, -16, 24, 24);
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-5, -8, 4, 0, 7); ctx.arc(5, -8, 4, 0, 7); ctx.fill();
  ctx.fillStyle = "#1b6fb5";
  ctx.beginPath(); ctx.arc(-5, -7, 1.6, 0, 7); ctx.arc(5, -7, 1.6, 0, 7); ctx.fill();
  ctx.strokeStyle = "#8a4a00";
  ctx.beginPath(); ctx.moveTo(12, -10); ctx.lineTo(26, -22); ctx.stroke();
  ctx.beginPath(); ctx.arc(30, -26, 7, 0, 7); ctx.stroke();
  ctx.restore();

  // Patrick
  const px = jx - 110 + Math.cos(t * 6) * 4;
  const py = H * 0.88;
  ctx.save();
  ctx.translate(px, py);
  ctx.fillStyle = "#ff9aa8";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const a2 = a + Math.PI / 5;
    ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16);
    ctx.lineTo(Math.cos(a2) * 7, Math.sin(a2) * 7);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-4, -3, 2.5, 0, 7); ctx.arc(4, -3, 2.5, 0, 7); ctx.fill();
  ctx.restore();
}