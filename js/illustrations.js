function renderMiniScene(item) {
  const anims = SCENE_ANIM_MAP[item.id] || SCENE_ANIM_MAP[1];
  const firstAnim = anims[0];
  const story = item.storyboard[0] || {};
  return `
    <div class="mini-vp" data-mini-id="${item.id}" data-mini-anim="${firstAnim}">
      <div class="vp-viewport vp-viewport-canvas">
        <canvas class="vp-canvas mini-canvas"></canvas>
        <div class="vp-grain"></div>
        <div class="vp-vignette"></div>
        <div class="vp-mini-label">Xem thử</div>
      </div>
    </div>
  `;
}

function initMiniCanvasPreviews(container) {
  if (typeof CanvasScenes === 'undefined') return;
  const root = container || document;

  const setup = () => {
    root.querySelectorAll('.mini-vp[data-mini-anim]').forEach((wrap) => {
      if (wrap._miniInterval) return;

      const canvas = wrap.querySelector('.mini-canvas');
      if (!canvas) return;

      const animId = wrap.dataset.miniAnim;
      const item = CONTENT_ITEMS.find((i) => String(i.id) === wrap.dataset.miniId);
      const meta = item ? { overlay: item.storyboard[0]?.overlay || item.hook } : {};

      const draw = () => {
        if (!canvas.isConnected) {
          clearInterval(wrap._miniInterval);
          wrap._miniInterval = null;
          return;
        }
        const parent = canvas.parentElement;
        const w = parent.clientWidth || 280;
        const h = parent.clientHeight || 200;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const t = (Date.now() % 3000) / 3000;
        CanvasScenes.draw(animId, ctx, w, h, t, meta);
      };

      draw();
      wrap._miniInterval = setInterval(draw, 80);
    });
  };

  if (typeof FontLoader !== 'undefined') FontLoader.ensureLoaded().then(setup);
  else setup();

  if (!window._miniFontListener) {
    window._miniFontListener = true;
    window.addEventListener('fonts-ready', () => setup());
  }
}

function renderStoryboardTimeline(storyboard, activeIndex = 0) {
  return `
    <div class="storyboard-timeline">
      ${storyboard
        .map(
          (s, i) => `
        <div class="storyboard-frame ${i === activeIndex ? 'active' : ''} ${i < activeIndex ? 'done' : ''}" data-index="${i}">
          <div class="storyboard-time">${s.time}</div>
          <div class="storyboard-dot"></div>
          <div class="storyboard-card">
            <p class="storyboard-title">${s.title}</p>
            <p class="storyboard-desc">${s.desc}</p>
            ${s.overlay ? `<span class="storyboard-overlay-tag">${s.overlay}</span>` : ''}
            ${s.legalOutro ? `<span class="storyboard-legal-tag">⚖️ ${s.legalOutro}</span>` : ''}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

function renderDialogues(dialogues) {
  return `
    <div class="dialogue-box">
      ${dialogues
        .map(
          (d) => `
        <div class="dialogue-bubble ${d.speaker === 'BXC' ? 'dialogue-bxc' : 'dialogue-other'}">
          <span class="dialogue-speaker">${d.speaker}</span>
          <p class="dialogue-line">"${d.line}"</p>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

function renderImpactBar(viralScore) {
  const level = viralScore >= 90 ? 'Cực cao' : viralScore >= 80 ? 'Cao' : 'Khá';
  const color = viralScore >= 90 ? 'bg-emerald-500' : viralScore >= 80 ? 'bg-blue-500' : 'bg-amber-500';
  return `
    <div class="impact-bar">
      <div class="flex justify-between text-xs mb-1">
        <span class="text-slate-500">Tiềm năng viral</span>
        <span class="font-bold text-police">${viralScore}% · ${level}</span>
      </div>
      <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div class="h-full ${color} rounded-full transition-all duration-1000 impact-fill" style="width:0%" data-target="${viralScore}"></div>
      </div>
    </div>
  `;
}