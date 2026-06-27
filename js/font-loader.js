/* Preload Be Vietnam Pro — bắt buộc cho Canvas hiển thị dấu tiếng Việt */

const FontLoader = (() => {
  const FAMILY = 'Be Vietnam Pro';
  const STACK = `"${FAMILY}", "Segoe UI", Tahoma, "Arial Unicode MS", sans-serif`;
  let loadPromise = null;
  let loaded = false;

  function ensureLoaded() {
    if (loaded) return Promise.resolve();
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      if (!document.fonts?.load) {
        loaded = true;
        return;
      }
      const weights = [400, 500, 600, 700, 800];
      await Promise.all(
        weights.map((w) => document.fonts.load(`${w} 16px "${FAMILY}"`))
      );
      await document.fonts.ready;

      if (!document.fonts.check(`16px "${FAMILY}"`)) {
        await document.fonts.load(`16px "${FAMILY}"`);
        await new Promise((r) => setTimeout(r, 120));
      }

      loaded = document.fonts.check(`16px "${FAMILY}"`) || loaded;
      window.dispatchEvent(new CustomEvent('fonts-ready'));
    })();

    return loadPromise;
  }

  function scale(canvasW, basePx) {
    const ratio = canvasW / 280;
    return Math.max(Math.round(basePx * 0.85), Math.round(basePx * ratio));
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
        line = ch === ' ' ? '' : ch;
        if (lines.length >= maxLines) return lines;
      } else {
        line = test;
      }
    }
    if (line && lines.length < maxLines) lines.push(line.trim());
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

    const lines = maxW ? wrapVN(ctx, text, maxW, opts.maxLines || 4) : [text];
    const lh = size * 1.38;
    const startY = baseline === 'top' ? y : y - ((lines.length - 1) * lh) / 2;

    lines.forEach((ln, i) => {
      const ly = startY + i * lh;
      if (stroke) {
        ctx.strokeStyle = 'rgba(0,0,0,0.92)';
        ctx.lineWidth = Math.max(2, size * 0.14);
        ctx.lineJoin = 'round';
        ctx.strokeText(ln, x, ly);
      }
      ctx.fillStyle = color;
      ctx.fillText(ln, x, ly);
    });
    return lines;
  }

  return { ensureLoaded, scale, canvasFont, wrapVN, drawText, STACK, FAMILY, get loaded() { return loaded; } };
})();