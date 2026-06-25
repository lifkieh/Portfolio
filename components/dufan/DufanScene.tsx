'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ActionRegistry } from '@/lib/serenova/actions/registry';
import { roundRect } from './utils';
import { useGameLoop } from './useGameLoop';
import { SerenovaPlayer } from './entities/Serenova';
import { Camera } from './entities/Camera';
import { Parallax } from './world/Parallax';
import { NPCs } from './world/NPCs';
import { rides, checkInteraction, RideDef } from './rides/ridesData';
import { BianglalaCutscene } from './cutscenes/Bianglala';
import { KoraKoraCutscene } from './cutscenes/KoraKora';
import { IstanaBonekaCutscene } from './cutscenes/IstanaBoneka';
import { HalilintarCutscene } from './cutscenes/Halilintar';

type GameState = 'EXPLORE' | 'CUTSCENE';

export default function DufanScene() {
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [globalScore, setGlobalScore] = useState(0);
  const [nearestRide, setNearestRide] = useState<RideDef | null>(null);
  const [gamePhase, setGamePhase] = useState<'EXPLORE' | 'CUTSCENE'>('EXPLORE');
  const nearestRideRef = useRef<RideDef | null>(null); // mirror to prevent per-frame setState

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Record<string, boolean>>({});

  // Game Entities
  const gameStateRef = useRef<GameState>('EXPLORE');
  const playerRef = useRef<SerenovaPlayer>();
  const cameraRef = useRef<Camera>();
  const parallaxRef = useRef<Parallax>();
  const npcsRef = useRef<NPCs>();

  // Cutscenes
  const activeCutsceneRef = useRef<any>(null);
  const bianglalaRef = useRef(new BianglalaCutscene());
  const koraKoraRef = useRef(new KoraKoraCutscene());
  const istanaBonekaRef = useRef(new IstanaBonekaCutscene());
  const halilintarRef = useRef(new HalilintarCutscene());

  // Mount/Unmount detection
  useEffect(() => {
    const checkTheme = () => {
      const cls = document.documentElement.className;
      const isDufan = cls.includes('theme-dufan');
      setIsActive((prev) => {
        if (isDufan && !prev) {
          setTimeout(() => setIsVisible(true), 100);
          return true;
        } else if (!isDufan && prev) {
          setIsVisible(false);
          setTimeout(() => setIsActive(false), 1000);
          return prev; // setIsActive(false) scheduled via timeout
        }
        return prev;
      });
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []); // dependency array kosong: observer hanya dipasang sekali

  // Init Game
  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      if (!cameraRef.current) {
        cameraRef.current = new Camera(window.innerWidth, window.innerHeight);
        playerRef.current = new SerenovaPlayer(500, window.innerHeight - 80);
        parallaxRef.current = new Parallax(window.innerWidth, window.innerHeight);
        npcsRef.current = new NPCs(window.innerWidth, window.innerHeight);
      } else {
        cameraRef.current.resize(window.innerWidth, window.innerHeight);
        parallaxRef.current?.resize(window.innerWidth, window.innerHeight);
        npcsRef.current?.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const onKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      keysRef.current = {}; // Reset keys
    };
  }, [isActive]);

  useGameLoop((dt) => {
    const canvas = canvasRef.current;
    if (!canvas || !playerRef.current || !cameraRef.current || !parallaxRef.current || !npcsRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const keys = keysRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Handle Cutscene Transitions
    if (gameStateRef.current === 'EXPLORE') {
      const ride = checkInteraction(playerRef.current.x);
      // Hanya setState kalau nilai benar-benar berubah (cegah re-render tiap frame)
      if (ride?.id !== nearestRideRef.current?.id) {
        nearestRideRef.current = ride;
        setNearestRide(ride);
      }

      if (ride && (keys['e'] || keys['E'])) {
        keys['e'] = false; // consume key
        keys['E'] = false;
        gameStateRef.current = 'CUTSCENE';

        let nextCutscene = null;
        if (ride.id === 'bianglala') nextCutscene = bianglalaRef.current;
        else if (ride.id === 'korakora') nextCutscene = koraKoraRef.current;
        else if (ride.id === 'istanaboneka') nextCutscene = istanaBonekaRef.current;
        else if (ride.id === 'halilintar') nextCutscene = halilintarRef.current;

        if (nextCutscene) {
          nextCutscene.start();
          activeCutsceneRef.current = nextCutscene;
        } else {
          // No valid cutscene found — stay in EXPLORE
          gameStateRef.current = 'EXPLORE';
        }
      }
    } else if (gameStateRef.current === 'CUTSCENE') {
      if (nearestRideRef.current !== null) {
        nearestRideRef.current = null;
        setNearestRide(null); // Hide HUD — hanya jika belum null
      }
      // Snapshot BEFORE we potentially null it — prevents reading .score after null
      const currentCutscene = activeCutsceneRef.current;
      const shouldExit = keys['Escape'] || (currentCutscene != null && currentCutscene.isFinished === true);
      if (shouldExit) {
        if (currentCutscene != null) {
          const earned = typeof currentCutscene.score === 'number' ? currentCutscene.score : 0;
          setGlobalScore(prev => prev + earned);
        }
        // Clear state BEFORE setting to EXPLORE so next frame sees clean state
        activeCutsceneRef.current = null;
        gameStateRef.current = 'EXPLORE';
        keys['Escape'] = false; // consume key
      }
    }

    // Update Phase
    if (gameStateRef.current === 'EXPLORE') {
      playerRef.current.update(dt, keys, height - 80);
      cameraRef.current.update(dt, playerRef.current.x, playerRef.current.y);
      parallaxRef.current.update(dt);
      npcsRef.current.update(dt);
    } else if (gameStateRef.current === 'CUTSCENE' && activeCutsceneRef.current) {
      activeCutsceneRef.current.update(dt, keys);
    }

    // Draw Phase
    ctx.clearRect(0, 0, width, height);

    if (gameStateRef.current === 'EXPLORE') {
      parallaxRef.current.draw(ctx, cameraRef.current.x);

      // ── Draw Rides in World ───────────────────────────────────────────
      ctx.save();
      ctx.translate(-cameraRef.current.x, 0);
      const t = performance.now() / 1000;
      const gY = height - 80; // ground Y

      rides.forEach(ride => {
        const rx = ride.x + ride.width / 2; // center X
        ctx.save();
        ctx.translate(rx, gY);

        // Ride label
        ctx.fillStyle = '#e0f2fe';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffd166';
        ctx.fillText(ride.name, 0, -220);
        ctx.shadowBlur = 0;

        if (ride.id === 'bianglala') {
          // Tiang
          ctx.fillStyle = '#2d1b69';
          ctx.fillRect(-10, -180, 20, 180);
          // Mini roda
          ctx.strokeStyle = '#ffd166';
          ctx.lineWidth = 5;
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#ffd166';
          ctx.beginPath();
          ctx.arc(0, -180, 80, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          const rot = t * 0.4;
          for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI * 2) / 8 + rot;
            ctx.strokeStyle = '#c9a227';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -180);
            ctx.lineTo(Math.cos(a) * 80, -180 + Math.sin(a) * 80);
            ctx.stroke();
            // Gondola
            ctx.save();
            ctx.translate(Math.cos(a) * 80, -180 + Math.sin(a) * 80);
            ctx.rotate(-rot);
            ctx.fillStyle = '#ff6ec7';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff6ec7';
            ctx.fillRect(-8, 2, 16, 12);
            ctx.shadowBlur = 0;
            ctx.restore();
          }

        } else if (ride.id === 'korakora') {
          // Tiang A-frame
          ctx.fillStyle = '#4a2c8f';
          ctx.beginPath();
          ctx.moveTo(-90, 0);
          ctx.lineTo(0, -160);
          ctx.lineTo(90, 0);
          ctx.lineTo(75, 0);
          ctx.lineTo(0, -140);
          ctx.lineTo(-75, 0);
          ctx.fill();
          // Pendulum arm
          const swingAng = Math.sin(t * 1.8) * 0.65;
          ctx.save();
          ctx.translate(0, -160);
          ctx.rotate(swingAng);
          ctx.strokeStyle = '#ffd166';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 90);
          ctx.stroke();
          // Boat hull (crescent)
          ctx.fillStyle = '#ffd166';
          ctx.shadowBlur = 16;
          ctx.shadowColor = '#ffd166';
          ctx.beginPath();
          ctx.arc(0, 90, 55, 0, Math.PI, false);
          ctx.fill();
          ctx.fillStyle = '#ff6ec7';
          ctx.beginPath();
          ctx.arc(0, 90, 44, 0, Math.PI, false);
          ctx.fill();
          // Lights along hull
          for (let i = 0; i < 5; i++) {
            const a = (i * Math.PI) / 4;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(Math.cos(a) * 50, 90 + Math.sin(a) * 50, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          ctx.restore();

        } else if (ride.id === 'istanaboneka') {
          // Main keep
          ctx.fillStyle = '#1e0b3a';
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#ff6ec7';
          ctx.fillRect(-70, -200, 140, 200);
          ctx.shadowBlur = 0;
          // Left tower
          ctx.fillStyle = '#250d45';
          ctx.fillRect(-90, -180, 40, 180);
          // Right tower
          ctx.fillRect(50, -180, 40, 180);
          // Cone roofs
          ctx.fillStyle = '#3d0f6e';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#a78bfa';
          ([[0, -200, 60, 80], [-70, -180, 40, 60], [70, -180, 40, 60]] as const).forEach(([cx, ty, w, ch]) => {
            ctx.beginPath();
            ctx.moveTo(cx - w / 2 - 8, ty);
            ctx.lineTo(cx + w / 2 + 8, ty);
            ctx.lineTo(cx, ty - ch);
            ctx.closePath();
            ctx.fill();
            // Flag
            ctx.fillStyle = '#ff6ec7';
            ctx.beginPath();
            ctx.moveTo(cx, ty - ch);
            ctx.lineTo(cx + 16, ty - ch + 9);
            ctx.lineTo(cx, ty - ch + 18);
            ctx.fill();
            ctx.fillStyle = '#3d0f6e';
          });
          ctx.shadowBlur = 0;
          // Glowing windows
          const wPulse = Math.abs(Math.sin(t * 1.5)) * 0.6 + 0.4;
          ctx.fillStyle = `rgba(255, 209, 102, ${wPulse})`;
          ctx.shadowBlur = 15 * wPulse;
          ctx.shadowColor = '#ffd166';
          ([[-40, -140], [0, -140], [40, -140], [-40, -90], [40, -90]] as const).forEach(([wx, wy]) => {
            ctx.beginPath();
            ctx.arc(wx, wy, 8, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(wx - 8, wy, 16, 20);
          });
          ctx.shadowBlur = 0;

        } else if (ride.id === 'halilintar') {
          // Support pillars
          ctx.fillStyle = '#2d1b69';
          [-80, 0, 80].forEach(px => {
            ctx.fillRect(px - 8, -180, 16, 180);
            ctx.fillRect(px - 20, -10, 40, 10); // footing
          });
          // Rail track (Bézier S-curve)
          ctx.strokeStyle = '#ffd166';
          ctx.lineWidth = 7;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ffd166';
          ctx.beginPath();
          ctx.moveTo(-90, 0);
          ctx.bezierCurveTo(-90, -80, -20, -100, 0, -160);
          ctx.bezierCurveTo(20, -220, 90, -180, 90, -80);
          ctx.stroke();
          ctx.shadowBlur = 0;
          // Rail ties
          ctx.strokeStyle = '#4a2c8f';
          ctx.lineWidth = 3;
          for (let seg = 0; seg < 10; seg++) {
            const s = seg / 10;
            // Approximate position along curve
            const tx2 = -90 + s * 180;
            const ty2 = -60 - Math.sin(s * Math.PI) * 120;
            ctx.beginPath();
            ctx.moveTo(tx2 - 8, ty2 - 4);
            ctx.lineTo(tx2 + 8, ty2 + 4);
            ctx.stroke();
          }
          // Coaster car
          const carProgress = ((t * 0.5) % 1);
          const carX = -90 + carProgress * 180;
          const carY = -60 - Math.sin(carProgress * Math.PI) * 120;
          ctx.fillStyle = '#ff6ec7';
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#ff6ec7';
          ctx.beginPath();
          roundRect(ctx, carX - 18, carY - 16, 36, 16, 4);
          ctx.fill();
          // Spark trail
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffd166';
          for (let sp = 1; sp <= 5; sp++) {
            const sp2 = Math.max(0, carProgress - sp * 0.02);
            const spx = -90 + sp2 * 180;
            const spy = -60 - Math.sin(sp2 * Math.PI) * 120;
            ctx.globalAlpha = 1 - sp * 0.18;
            ctx.beginPath();
            ctx.arc(spx, spy, 3 - sp * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }

        ctx.restore();
      });

      ctx.restore();

      npcsRef.current.draw(ctx, cameraRef.current.x);

      ctx.save();
      ctx.translate(-cameraRef.current.x, 0);
      playerRef.current.draw(ctx);
      ctx.restore();

    } else if (gameStateRef.current === 'CUTSCENE' && activeCutsceneRef.current) {
      activeCutsceneRef.current.draw(ctx, width, height);
      // Draw Escape Hint
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Tekan ESC untuk keluar', 20, 20);
    }

  }, isActive);

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Global Score HUD (similar to Ghibli) */}
      <div className="absolute top-6 right-6 p-4 rounded-xl bg-[#1a1040]/80 backdrop-blur-md border border-[#ff6ec7]/30 shadow-[0_0_15px_rgba(255,110,199,0.5)]">
        <div className="text-xl font-bold text-[#e0f2fe] mb-1">Skor Dufan</div>
        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd166] to-[#ff6ec7]">
          {globalScore}
        </div>
      </div>

      {/* Interaction Hint */}
      {nearestRide && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-32 p-4 rounded-xl bg-[#1a1040]/80 backdrop-blur-md border border-[#ffd166]/30 text-center animate-bounce">
          <div className="text-[#ffd166] font-bold text-lg mb-1">{nearestRide.name}</div>
          <div className="text-[#e0f2fe] text-sm">Tekan <span className="font-bold text-[#ff6ec7] px-2 py-1 bg-white/10 rounded">E</span> untuk masuk</div>
        </div>
      )}

      {/* Exit Game Button */}
      <button
        onClick={() => {
          // Use ActionRegistry for proper full class-cleanup (same path as Serenova chat)
          ActionRegistry.execute('switch_theme', { theme: 'dark' });
        }}
        className="absolute top-6 left-6 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-[#e0f2fe] font-medium transition-all hover:scale-105"
      >
        ← Keluar Dufan
      </button>

      {/* Mobile Touch Controls — bagian bawah-kanan */}
      <div className="absolute bottom-6 right-6 flex gap-4 md:hidden">
        {nearestRide && gameStateRef.current === 'EXPLORE' && (
          <button
            className="w-16 h-16 rounded-full bg-[#ff6ec7]/50 backdrop-blur-md border border-[#ff6ec7] text-white font-bold text-xl active:bg-[#ff6ec7]/80"
            onTouchStart={() => keysRef.current['e'] = true}
            onTouchEnd={() => keysRef.current['e'] = false}
            onMouseDown={() => keysRef.current['e'] = true}
            onMouseUp={() => keysRef.current['e'] = false}
          >E</button>
        )}
        <button
          className="w-16 h-16 rounded-full bg-[#ffd166]/50 backdrop-blur-md border border-[#ffd166] text-white font-bold text-sm active:bg-[#ffd166]/80"
          onTouchStart={() => keysRef.current[' '] = true}
          onTouchEnd={() => keysRef.current[' '] = false}
          onMouseDown={() => keysRef.current[' '] = true}
          onMouseUp={() => keysRef.current[' '] = false}
        >SPACE</button>
      </div>
    </div>
  );
}