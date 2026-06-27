/* Preload Be Vietnam Pro — bắt buộc cho Canvas hiển thị dấu tiếng Việt */

const FontLoader = (() => {
  const FAMILY = 'Be Vietnam Pro';
  const STACK = `"${FAMILY}", "Segoe UI", Tahoma, "Arial Unicode MS", sans-serif`;
  let loadPromise = null;

  function ensureLoaded() {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      if (!document.fonts?.load) return;
      const specs = [
        '400 16px', '500 16px', '600 16px', '700 16px', '800 16px', '800 24px',
      ];
      await Promise.all(specs.map((s) => document.fonts.load(`${s} ${STACK}`)));
      await document.fonts.ready;
    })();
    return loadPromise;
  }

  function scale(canvasW, basePx) {
    const ratio = canvasW / 280;
    return Math.max(Math.round(basePx * 0.8), Math.round(basePx * ratio));
  }

  function canvasFont(weight, sizePx) {
    return `${weight} ${sizePx}px ${STACK}`;
  }

  function wrapVN(ctx, text, maxW, maxLines = 4) {
    if (!text) return [];
    const lines = [];
    let line = '';
    for (const ch of text) {
      if (ch === '\n') {
        if (line) lines.push(line);
        line = '';
        continue;
      }
      const test = line + ch;
      if (ctx.measureText(test).width > maxW && line.length > 0) {
        lines.push(line);
        line = ch;
        if (lines.length >= maxLines) return lines;
      } else {
        line = test;
      }
    }
    if (line && lines.length < maxLines) lines.push(line);
    return lines;
  }

  function drawText(ctx, text, x, y, opts = {}) {
    const {
      weight = 700,
      size = 14,
      align = 'center',
      maxW = 0,
      color = '#fff',
      stroke = true,
      baseline = 'middle',
    } = opts;
    ctx.font = canvasFont(weight, size);
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    const lines = maxW ? wrapVN(ctx, text, maxW) : [text];
    const lh = size * 1.38;
    const startY = baseline === 'top' ? y : y - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      const ly = startY + i * lh;
      if (stroke) {
        ctx.strokeStyle = 'rgba(0,0,0,0.9)';
        ctx.lineWidth = Math.max(2, size * 0.16);
        ctx.lineJoin = 'round';
        ctx.strokeText(ln, x, ly);
      }
      ctx.fillStyle = color;
      ctx.fillText(ln, x, ly);
    });
    return lines;
  }

  return { ensureLoaded, scale, canvasFont, wrapVN, drawText, STACK, FAMILY };
})();