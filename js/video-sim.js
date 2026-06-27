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

function renderAnimScene(animId) {
  const scenes = {
    'bus-hook': `
      <div class="anim-bg anim-bg-bus"></div>
      <div class="anim-bus-body"><div class="anim-bus-window">
        <div class="anim-bus-passenger p1"></div>
        <div class="anim-bus-passenger p2"></div>
        <div class="anim-bus-passenger p3"></div>
      </div></div>
      <div class="anim-hook-text">POV: Kẻ trộm trên xe buýt 🚌</div>`,

    'bus-sneak': `
      <div class="anim-bg anim-bg-bus"></div>
      <div class="anim-bus-body"></div>
      <div class="anim-hand-sneak"></div>
      <div class="anim-char bxc" style="bottom:22%;left:38%"><div class="anim-char-head">😏</div><div class="anim-char-body"></div></div>
      <div class="anim-dialogue">"Em... kiểm tra khóa thôi!"</div>`,

    'bus-confront': `
      <div class="anim-bg anim-bg-bus"></div>
      <div class="anim-char other" style="bottom:25%;left:25%"><div class="anim-char-head">😠</div><div class="anim-char-body"></div></div>
      <div class="anim-char bxc shake" style="bottom:25%;right:25%"><div class="anim-char-head">😰</div><div class="anim-char-body"></div></div>
      <div class="anim-hook-text anim-zoom-punch">Ví em sắp bay rồi!</div>`,

    'bus-twist': `
      <div class="anim-flash-white"></div>
      <div class="anim-bg anim-bg-bus"></div>
      <div class="anim-badge-flash"><div class="anim-badge">👮</div></div>
      <div class="anim-char bxc" style="bottom:20%;left:50%;transform:translateX(-50%)"><div class="anim-char-head">😱</div><div class="anim-char-body"></div></div>`,

    'outro-wallet': `
      <div class="anim-outro">
        <div class="anim-outro-logo">🛡️</div>
        <div class="anim-outro-text">CÔNG AN PHƯỜNG<br/>PHƯƠNG LIỆT</div>
        <div class="anim-outro-text">Đừng để ví bay!</div>
        <div class="anim-outro-hotline">📞 113</div>
      </div>`,

    'street-phone': `
      <div class="anim-bg anim-bg-street"></div>
      <div class="anim-road"><div class="anim-road-line"></div></div>
      <div class="anim-char other" style="bottom:30%;left:40%"><div class="anim-char-head">📱</div><div class="anim-char-body"></div></div>
      <div class="anim-hook-text">Đừng mải phone khi đi đường!</div>`,

    'street-snatch': `
      <div class="anim-bg anim-bg-street"></div>
      <div class="anim-road"><div class="anim-road-line"></div></div>
      <div class="anim-runner">🏃‍♂️💨</div>
      <div class="anim-phone-fly">📱</div>
      <div class="anim-hook-text">Giật phone kiểu ninja 🥷</div>`,

    'street-fall': `
      <div class="anim-bg anim-bg-street"></div>
      <div class="anim-road"></div>
      <div style="position:absolute;bottom:28%;left:55%;font-size:48px;animation:runner-sprint 0.01s forwards;transform:rotate(90deg) translateY(20px)">🤕</div>
      <div class="anim-hook-text">Karma tới nhanh quá!</div>`,

    'street-cctv': `
      <div class="anim-bg anim-bg-street"></div>
      <div class="anim-cctv" data-time="2026-06-27 15:32:08"></div>
      <div class="anim-char other" style="bottom:30%;left:30%"><div class="anim-char-head">📞</div><div class="anim-char-body"></div></div>
      <div class="anim-dialogue">"Em gọi 113 nhé."</div>`,

    'outro-snatch': `
      <div class="anim-outro">
        <div class="anim-outro-logo">🛡️</div>
        <div class="anim-outro-text">Cướp giật = Tự đào hố</div>
        <div class="anim-outro-hotline">📞 113</div>
      </div>`,

    'traffic-crash': `
      <div class="anim-bg anim-bg-traffic"></div>
      <div class="anim-road"></div>
      <div class="anim-bike b1">🛵</div>
      <div class="anim-bike b2">🛵</div>
      <div class="anim-hook-text">Va chạm nhẹ thôi mà...</div>`,

    'traffic-yell': `
      <div class="anim-bg anim-bg-traffic"></div>
      <div class="anim-char bxc yell" style="bottom:28%;left:35%"><div class="anim-char-head">🤬</div><div class="anim-char-body"></div></div>
      <div class="anim-char other" style="bottom:28%;right:30%"><div class="anim-char-head">😌</div><div class="anim-char-body"></div></div>
      <div class="anim-hook-text">Cáu lớn hơn va chạm!</div>`,

    'traffic-jam': `
      <div class="anim-bg anim-bg-traffic"></div>
      <div class="anim-crowd">🧑‍🤝‍🧑🚗📹🧑‍🤝‍🧑</div>
      <div class="anim-hook-text" style="color:#ef4444">Gây rối = Phạt nặng hơn!</div>`,

    'traffic-police': `
      <div class="anim-flash-white"></div>
      <div class="anim-bg anim-bg-traffic"></div>
      <div class="anim-char police" style="bottom:28%;left:40%"><div class="anim-char-head">👮</div><div class="anim-char-body"></div></div>
      <div class="anim-char bxc" style="bottom:22%;right:25%"><div class="anim-char-head">😔</div><div class="anim-char-body"></div></div>`,

    'outro-calm': `
      <div class="anim-outro">
        <div class="anim-outro-logo">✅</div>
        <div class="anim-outro-text">Bình tĩnh = Thắng</div>
        <div class="anim-outro-hotline">📞 113</div>
      </div>`,

    'vendor-block': `
      <div class="anim-bg anim-bg-street"></div>
      <div style="position:absolute;bottom:25%;left:10%;right:5%;height:20%;background:#d97706;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:28px">🛒📦📦📦</div>
      <div class="anim-hook-text">BEFORE: Vỉa hè = 0 mét</div>`,

    'vendor-walk': `
      <div class="anim-bg anim-bg-street"></div>
      <div class="anim-char other" style="bottom:30%;left:20%;animation:shadow-walk 2s ease infinite"><div class="anim-char-head">👵</div><div class="anim-char-body"></div></div>
      <div class="anim-hook-text">Vỉa hè là của chung!</div>`,

    'vendor-police': `
      <div class="anim-bg anim-bg-street"></div>
      <div class="anim-char police" style="bottom:28%;left:25%"><div class="anim-char-head">👮</div><div class="anim-char-body"></div></div>
      <div class="anim-char bxc" style="bottom:28%;right:25%"><div class="anim-char-head">🤔</div><div class="anim-char-body"></div></div>`,

    'vendor-after': `
      <div class="anim-before-after">
        <div class="anim-ba-side before"><span class="anim-ba-emoji">😤</span>BEFORE</div>
        <div class="anim-ba-side after"><span class="anim-ba-emoji">✅</span>AFTER</div>
      </div>`,

    'outro-viahe': `
      <div class="anim-outro">
        <div class="anim-outro-logo">🛤️</div>
        <div class="anim-outro-text">Vỉa hè không phải riêng ai</div>
        <div class="anim-outro-hotline">📞 113</div>
      </div>`,

    'bet-lose': `
      <div class="anim-bg anim-bg-cafe"></div>
      <div class="anim-char bxc" style="bottom:30%;left:40%"><div class="anim-char-head">😭</div><div class="anim-char-body"></div></div>
      <div class="anim-bet-screen"><div class="anim-bet-amount">-47.000.000đ</div></div>`,

    'bet-whisper': `
      <div class="anim-bg anim-bg-cafe"></div>
      <div class="anim-char bxc" style="bottom:30%;left:30%"><div class="anim-char-head">🤫</div><div class="anim-char-body"></div></div>
      <div class="anim-char other" style="bottom:30%;right:25%"><div class="anim-char-head">😈</div><div class="anim-char-body"></div></div>
      <div class="anim-dialogue">"Trộm xe kia gỡ đi..."</div>`,

    'bet-steal': `
      <div class="anim-bg anim-bg-cafe"></div>
      <div style="position:absolute;bottom:28%;left:50%;font-size:40px;animation:hand-sneak 1.5s ease infinite">🏍️🔑</div>
      <div class="anim-char bxc shake" style="bottom:32%;left:35%"><div class="anim-char-head">😬</div><div class="anim-char-body"></div></div>`,

    'bet-caught': `
      <div class="anim-flash-white"></div>
      <div class="anim-bg anim-bg-cafe"></div>
      <div class="anim-char police" style="bottom:28%;left:40%"><div class="anim-char-head">👮</div><div class="anim-char-body"></div></div>
      <div class="anim-char bxc" style="bottom:25%;right:28%"><div class="anim-char-head">🫠</div><div class="anim-char-body"></div></div>`,

    'outro-cado': `
      <div class="anim-outro">
        <div class="anim-outro-logo">⛔</div>
        <div class="anim-outro-text">Cá độ = Con đường chết</div>
        <div class="anim-outro-hotline">📞 113</div>
      </div>`,

    'night-walk': `
      <div class="anim-bg anim-bg-night"></div>
      <div class="anim-moon">🌙</div>
      <div class="anim-char other" style="bottom:30%;left:30%"><div class="anim-char-head">👩</div><div class="anim-char-body"></div></div>
      <div class="anim-hook-text">9PM — Đi nhà một mình</div>`,

    'night-follow': `
      <div class="anim-bg anim-bg-night"></div>
      <div class="anim-moon"></div>
      <div class="anim-shadow-follow">🚶‍♂️</div>
      <div class="anim-char other" style="bottom:30%;left:20%"><div class="anim-char-head">👩</div><div class="anim-char-body"></div></div>
      <div class="anim-hook-text">Cảm thấy không an toàn?</div>`,

    'night-shop': `
      <div class="anim-bg anim-bg-night"></div>
      <div style="position:absolute;bottom:25%;left:20%;right:20%;height:30%;background:rgba(251,191,36,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:32px">🏪💡</div>
      <div class="anim-dialogue">"Em gọi 113 ngay!"</div>`,

    'night-twist': `
      <div class="anim-bg anim-bg-night"></div>
      <div class="anim-char bxc" style="bottom:30%;left:40%"><div class="anim-char-head">🗺️</div><div class="anim-char-body"></div></div>
      <div class="anim-hook-text anim-zoom-punch">Plot twist: Đi nhầm ngõ 😅</div>`,

    'outro-safe': `
      <div class="anim-outro">
        <div class="anim-outro-logo">🌙</div>
        <div class="anim-outro-text">An toàn > Ngại ngần</div>
        <div class="anim-outro-hotline">📞 113</div>
      </div>`,

    'market-busy': `
      <div class="anim-bg anim-bg-market"></div>
      <div class="anim-crowd">🧺🥬🍖👩‍🌾🧑‍🍳</div>
      <div class="anim-hook-text">Chợ đông = Cơ hội trộm?</div>`,

    'market-bump': `
      <div class="anim-bg anim-bg-market"></div>
      <div class="anim-char bxc" style="bottom:30%;left:35%"><div class="anim-char-head">😇</div><div class="anim-char-body"></div></div>
      <div class="anim-char other" style="bottom:30%;right:30%"><div class="anim-char-head">🛍️</div><div class="anim-char-body"></div></div>
      <div class="anim-dialogue">"Em xin lỗi! Em xin lỗi!"</div>`,

    'market-split': `
      <div class="anim-split">
        <div class="anim-split-top">😊 "Xin lỗi ạ!"</div>
        <div class="anim-split-bottom"><div class="anim-pick-hand">🤚💰</div></div>
      </div>`,

    'market-caught': `
      <div class="anim-bg anim-bg-market"></div>
      <div class="anim-crowd" style="font-size:20px">👆😱📹</div>
      <div class="anim-char bxc" style="bottom:28%;left:42%"><div class="anim-char-head">🙌</div><div class="anim-char-body"></div></div>
      <div class="anim-hook-text">Móc túi có chủ!</div>`,

    'outro-cho': `
      <div class="anim-outro">
        <div class="anim-outro-logo">🏪</div>
        <div class="anim-outro-text">Để túi trước ngực!</div>
        <div class="anim-outro-hotline">📞 113</div>
      </div>`,

    'cards-play': `
      <div class="anim-bg anim-bg-cafe"></div>
      <div class="anim-table">
        <div class="anim-card"></div><div class="anim-card"></div>
        <div class="anim-card"></div><div class="anim-card"></div>
      </div>
      <div style="position:absolute;bottom:55%;left:50%;font-size:16px;transform:translateX(-50%)">💵💵</div>`,

    'cards-cheat': `
      <div class="anim-bg anim-bg-cafe"></div>
      <div class="anim-table"><div class="anim-card"></div><div class="anim-card"></div></div>
      <div class="anim-cheat-card">🃏</div>
      <div class="anim-char bxc" style="bottom:55%;right:25%"><div class="anim-char-head">🎩</div></div>`,

    'cards-expose': `
      <div class="anim-bg anim-bg-cafe"></div>
      <div class="anim-char other yell" style="bottom:30%;left:25%"><div class="anim-char-head">😤</div><div class="anim-char-body"></div></div>
      <div class="anim-char bxc shake" style="bottom:30%;right:25%"><div class="anim-char-head">😅</div><div class="anim-char-body"></div></div>
      <div class="anim-hook-text">Bị bắt quả tang!</div>`,

    'cards-police': `
      <div class="anim-flash-white"></div>
      <div class="anim-bg anim-bg-cafe"></div>
      <div class="anim-char police" style="bottom:28%;left:40%"><div class="anim-char-head">👮</div><div class="anim-char-body"></div></div>
      <div class="anim-char bxc" style="bottom:22%;right:30%"><div class="anim-char-head">✍️</div><div class="anim-char-body"></div></div>`,

    'outro-cobac': `
      <div class="anim-outro">
        <div class="anim-outro-logo">🃏</div>
        <div class="anim-outro-text">Cờ bạc = Hình sự</div>
        <div class="anim-outro-hotline">📞 113</div>
      </div>`,

    'drunk-sing': `
      <div class="anim-bg anim-bg-night"></div>
      <div class="anim-road"><div class="anim-road-line"></div></div>
      <div class="anim-drunk">🕺🎤</div>
      <div class="anim-hook-text">Say ≠ Được phép ngáo!</div>`,

    'drunk-block': `
      <div class="anim-bg anim-bg-night"></div>
      <div class="anim-road"><div class="anim-road-line"></div></div>
      <div class="anim-drunk"></div>
      <div class="anim-car-horn">🚗 BÍ BÍ BÍ!!!</div>`,

    'drunk-pull': `
      <div class="anim-bg anim-bg-night"></div>
      <div class="anim-drunk" style="font-size:40px"></div>
      <div style="position:absolute;bottom:32%;left:15%;font-size:24px">🧑‍🤝‍🧑</div>
      <div style="position:absolute;bottom:32%;right:15%;font-size:24px">🧑‍🤝‍🧑</div>
      <div class="anim-dialogue">"Về thôi! 3 người kéo không nổi!"</div>`,

    'drunk-police': `
      <div class="anim-bg anim-bg-night"></div>
      <div class="anim-char police" style="bottom:30%;left:35%"><div class="anim-char-head">👮</div><div class="anim-char-body"></div></div>
      <div class="anim-char bxc" style="bottom:28%;right:30%"><div class="anim-char-head">😴</div><div class="anim-char-body"></div></div>`,

    'outro-say': `
      <div class="anim-outro">
        <div class="anim-outro-logo">🍺</div>
        <div class="anim-outro-text">Uống có trách nhiệm</div>
        <div class="anim-outro-hotline">📞 113</div>
      </div>`,

    'witness-see': `
      <div class="anim-bg anim-bg-home"></div>
      <div class="anim-house">🏠</div>
      <div class="anim-char bxc" style="bottom:45%;left:35%"><div class="anim-char-head">👀</div><div class="anim-char-body"></div></div>
      <div style="position:absolute;bottom:25%;right:20%;font-size:32px;animation:shadow-walk 2s ease infinite">🏍️💨</div>
      <div class="anim-hook-text">Thấy mà... im lặng? 😶</div>`,

    'witness-ignore': `
      <div class="anim-bg anim-bg-home"></div>
      <div class="anim-char bxc" style="bottom:35%;left:45%"><div class="anim-char-head">🙈</div><div class="anim-char-body"></div></div>
      <div class="anim-dialogue">"Không muốn dính líu..."</div>`,

    'witness-burglary': `
      <div class="anim-bg anim-bg-home"></div>
      <div class="anim-house" style="filter:brightness(0.6)"></div>
      <div class="anim-door-open"></div>
      <div class="anim-char bxc shake" style="bottom:30%;left:42%"><div class="anim-char-head">😱</div><div class="anim-char-body"></div></div>
      <div class="anim-hook-text" style="color:#ef4444">3 ngày sau... nhà mình!</div>`,

    'witness-report': `
      <div class="anim-bg anim-bg-home"></div>
      <div class="anim-char bxc" style="bottom:30%;left:25%;animation:runner-sprint 3s ease infinite"><div class="anim-char-head">🏃</div><div class="anim-char-body"></div></div>
      <div class="anim-char police" style="bottom:30%;right:25%"><div class="anim-char-head">👮</div><div class="anim-char-body"></div></div>`,

    'outro-bao': `
      <div class="anim-outro">
        <div class="anim-outro-logo">💙</div>
        <div class="anim-outro-text">Thấy mà báo — Bảo vệ hàng xóm</div>
        <div class="anim-outro-hotline">📞 113</div>
      </div>`,
  };
  return scenes[animId] || scenes['outro-bao'];
}

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
  }

  getSceneDuration() {
    return this.totalSec / this.sceneCount;
  }

  mount(container) {
    this.mountEl = container;
    this.root = document.createElement('div');
    this.root.className = this.compact ? 'mini-vp' : 'vp-phone vp-phone-lg';
    this.root.innerHTML = this._html();
    container.innerHTML = '';
    container.appendChild(this.root);
    this._bind();
    this._renderScene(this.sceneIndex, false);
    if (this.autoplay) this.play();
    return this;
  }

  _html() {
    const compact = this.compact;
    const scenes = this.anims.map((animId, i) => `
      <div class="vp-scene ${i === 0 ? 'active' : ''}" data-scene="${i}">
        ${renderAnimScene(animId)}
      </div>
    `).join('');

    if (compact) {
      return `<div class="vp-viewport">${scenes}
        <div class="vp-grain"></div><div class="vp-vignette"></div>
        <div class="vp-subtitle show"></div>
      </div>`;
    }

    const marks = this.anims.map((_, i) => {
      const left = (i / this.sceneCount) * 100;
      return `<div class="vp-scene-mark" style="left:${left}%"></div>`;
    }).join('');

    return `
      <div class="vp-notch"></div>
      <div class="vp-screen">
        <div class="vp-viewport" id="vp-view-${this.item.id}">
          ${scenes}
          <div class="vp-grain"></div>
          <div class="vp-vignette"></div>
          <div class="vp-scanline"></div>
          <div class="vp-rec"><span class="vp-rec-dot"></span> REC</div>
          <div class="vp-scene-badge">Cảnh <span class="vp-scene-num">1</span>/${this.sceneCount}</div>
          <div class="vp-tiktok-side">
            <div class="vp-tiktok-btn">❤️</div>
            <div class="vp-tiktok-btn">💬</div>
            <div class="vp-tiktok-btn">↗️</div>
          </div>
          <div class="vp-subtitle show"></div>
        </div>
        <div class="vp-controls">
          <div class="vp-controls-top">
            <button class="vp-play-btn" aria-label="Play/Pause">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <span class="vp-time">0:00 / ${formatTime(this.totalSec)}</span>
            <div class="vp-wave"><span></span><span></span><span></span><span></span><span></span></div>
          </div>
          <div class="vp-scrubber">
            <div class="vp-scene-marks">${marks}</div>
            <div class="vp-scrubber-fill" style="width:0%"></div>
          </div>
        </div>
        <div class="vp-tiktok-footer">
          <div><strong>@BinhXangCon</strong> · ${this.item.title}</div>
          <div>❤️ ${this.item.viralLikes}</div>
        </div>
      </div>`;
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
    });
  }

  _renderScene(index, animate = true) {
    const scenes = this.root.querySelectorAll('.vp-scene');
    const story = this.item.storyboard[index] || {};
    const viewport = this.root.querySelector('.vp-viewport');

    scenes.forEach((s, i) => {
      s.classList.remove('active', 'exit');
      if (i === index) {
        if (animate) {
          s.classList.add('active');
          if (viewport) {
            viewport.classList.remove('vp-glitch');
            void viewport.offsetWidth;
            viewport.classList.add('vp-glitch');
          }
        } else {
          s.classList.add('active');
        }
      }
    });

    const sub = this.root.querySelector('.vp-subtitle');
    if (sub) {
      sub.classList.remove('show');
      void sub.offsetWidth;
      sub.textContent = story.overlay || this.item.hook;
      sub.classList.add('show');
    }

    const num = this.root.querySelector('.vp-scene-num');
    if (num) num.textContent = index + 1;

    this._updateProgress();
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
      this._renderScene(this.sceneIndex, true);
    } else {
      this._updateProgress();
    }

    if (this.elapsed >= this.totalSec) {
      if (this.options.loop) {
        this.elapsed = 0;
        this.sceneIndex = 0;
        this._renderScene(0, true);
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
    if (svg) svg.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    this.rafId = requestAnimationFrame((t) => this._tick(t));
  }

  pause() {
    this.playing = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    const wave = this.root.querySelector('.vp-wave');
    wave?.classList.add('paused');
    const svg = this.root.querySelector('.vp-play-btn svg');
    if (svg) svg.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }

  goToScene(index) {
    this.sceneIndex = Math.max(0, Math.min(this.sceneCount - 1, index));
    this.elapsed = this.sceneIndex * this.getSceneDuration();
    this._renderScene(this.sceneIndex, true);
  }

  destroy() {
    this.pause();
    if (this.root?.parentNode) this.root.parentNode.innerHTML = '';
    this.root = null;
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