export const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    const cr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + cr, y);
    ctx.arcTo(x + w, y, x + w, y + h, cr);
    ctx.arcTo(x + w, y + h, x, y + h, cr);
    ctx.arcTo(x, y + h, x, y, cr);
    ctx.arcTo(x, y, x + w, y, cr);
    ctx.closePath();
  }
};
