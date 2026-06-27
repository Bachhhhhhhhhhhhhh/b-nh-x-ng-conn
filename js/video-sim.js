/* Video Simulation Engine — animated storyboard playback */

const SCENE_ANIM_MAP = {
  1: ['bus-hook', 'bus-sneak', 'bus-confront', 'bus-twist', 'outro-wallet'],
  2: ['street-phone', 'street-snatch', 'street-fall', 'street-cctv', 'outro-snatch'],
  3: ['traffic-crash', 'traffic-yell', 'traffic-jam', 'traffic-police', 'outro-calm'],
  4: ['vendor-block', 'vendor-walk', 'vendor-police', 'vendor-after', 'outro-viahe'],
  5: ['bet-lose', 'bet-whisper', 'bet-steal', 'bet-caught', 'outro-cado'],
  6: ['night-walk', 'night-follow', 'night-shop', 'night-twist', 'outro-safe'],
  7: ['market-busy', 'market-bump', 'market-split', 'market-caught', 'outro-cho'],
  8: ['cards-play', 'cards-cheat', 'cards-expose', 'cards-police', 'outro-cobac'],
  9: ['drunk-sing', 'drunk-block', 'drunk-pull', 'drunk-police', 'outro-say'],
  10: ['witness-see', 'witness-ignore', 'witness-burglary', 'witness-report', 'outro-bao'],
};

const SCENE_MS = 2800;

/* Canvas renderer in canvas-scenes.js */
function parseTotalSeconds(durationStr) {
  const m = String(durationStr || '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 30;
}

function formatTime(sec) {
  const s = Math.floor(sec);
  return `0:${String(s).padStart(2, '0')}`;
}

class VideoPlayer {
  constructor(item, options = {}) {
    this.item = item;
    this.options = options;
    this.sceneIndex = 0;
    this.playing = false;
    this.elapsed = 0;
    this.lastTick = 0;
    this.rafId = null;
    this.anims = SCENE_ANIM_MAP[item.id] || SCENE_ANIM_MAP[1];
    this.totalSec = parseTotalSeconds(item.duration);
    this.sceneCount = this.anims.length;
    this.onSceneChange = options.onSceneChange || (() => {});
    this.compact = options.compact || false;
    this.autoplay = options.autoplay || false;
    this.mountEl = null;
    this.root = null;
    this.canvas = null;
    this.ctx = null;
    this.lastSceneNotified = -1;
  }

  getSceneDuration() {
    return this.totalSec / this.sceneCount;
  }

  mount(container) {
    this.mountEl = container;
    this.root = document.createElement('div');
    this.root.className = this.compact ? 'mini-vp' : 'vp-phone vp-phone-xl';
    this.root.innerHTML = this._html();
    container.innerHTML = '';
    container.appendChild(this.root);
    this._setupCanvas();
    this._bind();
    const boot = () => {
      this._drawCanvas();
      if (this.autoplay) this.play();
    };
    if (typeof FontLoader !== 'undefined') FontLoader.ensureLoaded().then(boot);
    else boot();
    return this;
  }

  _html() {
    if (this.compact) {
      return `<div class="vp-viewport vp-viewport-canvas">
        <canvas class="vp-canvas"></canvas>
        <div class="vp-grain"></div><div class="vp-vignette"></div>
        <div class="vp-mini-label">笆ｶ Xem th盻ｭ</div>
      </div>`;
    }

    const marks = this.anims.map((_, i) => {
      const left = (i / this.sceneCount) * 100;
      return `<div class="vp-scene-mark" style="left:${left}%"></div>`;
    }).join('');

    const title = this.item.title.replace(/"/g, '&quot;');

    return `
      <div class="vp-notch"></div>
      <div class="vp-screen">
        <div class="vp-viewport vp-viewport-canvas">
          <canvas class="vp-canvas"></canvas>
          <div class="vp-grain"></div>
          <div class="vp-vignette"></div>
          <div class="vp-scanline"></div>
          <div class="vp-rec"><span class="vp-rec-dot"></span> ﾄ植NG QUAY</div>
          <div class="vp-scene-badge">C蘯｣nh <span class="vp-scene-num">1</span> / ${this.sceneCount}</div>
          <div class="vp-tiktok-side">
            <div class="vp-tiktok-btn" title="Thﾃｭch">笶､</div>
            <div class="vp-tiktok-btn" title="Bﾃｬnh lu蘯ｭn">町</div>
            <div class="vp-tiktok-btn" title="Chia s蘯ｻ">竊・/div>
          </div>
        </div>
        <div class="vp-controls">
          <div class="vp-controls-top">
            <button type="button" class="vp-play-btn" aria-label="Phﾃ｡t / T蘯｡m d盻ｫng">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <span class="vp-time">0:00 / ${formatTime(this.totalSec)}</span>
            <div class="vp-wave"><span></span><span></span><span></span><span></span><span></span></div>
          </div>
          <div class="vp-scrubber" role="slider" aria-label="Ti蘯ｿn trﾃｬnh video">
            <div class="vp-scene-marks">${marks}</div>
            <div class="vp-scrubber-fill" style="width:0%"></div>
          </div>
        </div>
        <div class="vp-tiktok-footer">
          <div class="vp-footer-text"><strong>@BinhXangCon</strong><span>${title}</span></div>
          <div class="vp-footer-stats">笶､ ${this.item.viralLikes}</div>
        </div>
      </div>`;
  }

  _setupCanvas() {
    this.canvas = this.root.querySelector('.vp-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    const resize = () => {
      const parent = this.canvas.parentElement;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._drawCanvas();
    };
    resize();
    this._resizeObs = new ResizeObserver(resize);
    this._resizeObs.observe(this.canvas.parentElement);
  }

  _sceneMeta(index) {
    const story = this.item.storyboard[index] || {};
    return { overlay: story.overlay || this.item.hook, title: story.title || '' };
  }

  _drawCanvas() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const sceneDur = this.getSceneDuration();
    const within = Math.max(0, Math.min(1, (this.elapsed - this.sceneIndex * sceneDur) / sceneDur));
    const animId = this.anims[this.sceneIndex];
    if (typeof CanvasScenes !== 'undefined') {
      CanvasScenes.draw(animId, this.ctx, w, h, within, this._sceneMeta(this.sceneIndex));
    }
  }

  _bind() {
    if (this.compact) return;
    const playBtn = this.root.querySelector('.vp-play-btn');
    const scrubber = this.root.querySelector('.vp-scrubber');
    playBtn?.addEventListener('click', () => (this.playing ? this.pause() : this.play()));
    scrubber?.addEventListener('click', (e) => {
      const rect = scrubber.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const scene = Math.min(this.sceneCount - 1, Math.floor(ratio * this.sceneCount));
      this.goToScene(scene);
      if (!this.playing) this.play();
    });
  }

  _notifySceneChange(index) {
    if (index === this.lastSceneNotified) return;
    this.lastSceneNotified = index;
    const story = this.item.storyboard[index] || {};
    const num = this.root.querySelector('.vp-scene-num');
    if (num) num.textContent = index + 1;
    const viewport = this.root.querySelector('.vp-viewport');
    if (viewport) {
      viewport.classList.remove('vp-glitch');
      void viewport.offsetWidth;
      viewport.classList.add('vp-glitch');
    }
    this.onSceneChange(index, story);
  }

  _updateProgress() {
    const sceneDur = this.getSceneDuration();
    const base = this.sceneIndex * sceneDur;
    const within = Math.min(this.elapsed - base, sceneDur);
    const pct = ((base + Math.max(0, within)) / this.totalSec) * 100;
    const fill = this.root.querySelector('.vp-scrubber-fill');
    const time = this.root.querySelector('.vp-time');
    if (fill) fill.style.width = `${Math.min(100, pct)}%`;
    if (time) {
      const cur = base + Math.max(0, within);
      time.textContent = `${formatTime(cur)} / ${formatTime(this.totalSec)}`;
    }
  }

  _tick(ts) {
    if (!this.playing) return;
    if (!this.lastTick) this.lastTick = ts;
    const delta = (ts - this.lastTick) / 1000;
    this.lastTick = ts;
    this.elapsed += delta;

    const sceneDur = this.getSceneDuration();
    const newIndex = Math.min(this.sceneCount - 1, Math.floor(this.elapsed / sceneDur));

    if (newIndex !== this.sceneIndex) {
      this.sceneIndex = newIndex;
      this._notifySceneChange(this.sceneIndex);
    }

    this._drawCanvas();
    this._updateProgress();

    if (this.elapsed >= this.totalSec) {
      if (this.options.loop) {
        this.elapsed = 0;
        this.sceneIndex = 0;
        this.lastSceneNotified = -1;
        this._notifySceneChange(0);
      } else {
        this.pause();
        return;
      }
    }
    this.rafId = requestAnimationFrame((t) => this._tick(t));
  }

  play() {
    if (this.playing) return;
    this.playing = true;
    this.lastTick = 0;
    const wave = this.root.querySelector('.vp-wave');
    wave?.classList.remove('paused');
    const svg = this.root.querySelector('.vp-play-btn svg');
    if (svg) svg.innerHTML = '<rect x="6" y="4" width="4" height="16" fill="#000"/><rect x="14" y="4" width="4" height="16" fill="#000"/>';
    this.rafId = requestAnimationFrame((t) => this._tick(t));
  }

  pause() {
    this.playing = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    const wave = this.root.querySelector('.vp-wave');
    wave?.classList.add('paused');
    const svg = this.root.querySelector('.vp-play-btn svg');
    if (svg) svg.innerHTML = '<path d="M8 5v14l11-7z" fill="#000"/>';
    this._drawCanvas();
  }

  goToScene(index) {
    this.sceneIndex = Math.max(0, Math.min(this.sceneCount - 1, index));
    this.elapsed = this.sceneIndex * this.getSceneDuration();
    this.lastSceneNotified = -1;
    this._notifySceneChange(this.sceneIndex);
    this._drawCanvas();
    this._updateProgress();
  }

  destroy() {
    this.pause();
    this._resizeObs?.disconnect();
    if (this.root?.parentNode) this.root.parentNode.innerHTML = '';
    this.root = null;
    this.canvas = null;
    this.ctx = null;
  }
}

const _players = new Map();

function mountVideoPlayer(containerIdOrEl, item, options = {}) {
  const el = typeof containerIdOrEl === 'string' ? document.getElementById(containerIdOrEl) : containerIdOrEl;
  if (!el) return null;
  const key = el.id || String(item.id);
  if (_players.has(key)) _players.get(key).destroy();
  const player = new VideoPlayer(item, { loop: true, ...options }).mount(el);
  _players.set(key, player);
  return player;
}

function destroyPlayer(key) {
  if (_players.has(key)) {
    _players.get(key).destroy();
    _players.delete(key);
  }
}
