import { useEffect, useRef } from 'react';

type GameLoopCallback = (deltaTime: number, time: number) => void;

export function useGameLoop(callback: GameLoopCallback, isActive: boolean) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const isPausedRef = useRef<boolean>(false);

  // Simpan callback terbaru di ref supaya loop tidak perlu re-subscribe
  // tiap kali callback (arrow inline) dibuat ulang saat re-render.
  const callbackRef = useRef<GameLoopCallback>(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isActive) return;

    // Pause loop saat tab hidden — cegah deltaTime besar & hemat resource.
    const handleVisibilityChange = () => {
      isPausedRef.current = document.hidden;
      if (!document.hidden) {
        // Reset waktu saat balik ke tab supaya tidak ada lonjakan delta.
        previousTimeRef.current = performance.now();
      }
    };

    // FIX: visibilitychange dipasang di document, bukan window.
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined && !isPausedRef.current) {
        const deltaTime = (time - previousTimeRef.current) / 1000; // detik
        // Cap deltaTime supaya tidak melonjak kalau sempat tidak aktif.
        callbackRef.current(Math.min(deltaTime, 0.1), time);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    previousTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Reset supaya saat loop start lagi tidak pakai waktu basi.
      previousTimeRef.current = undefined;
    };
  }, [isActive]); // hanya bergantung pada isActive sekarang
}