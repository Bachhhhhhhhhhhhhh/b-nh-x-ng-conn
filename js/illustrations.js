const SCENE_META = {
  bus: { emoji: '🚌', label: 'Xe buýt', gradient: 'from-blue-900 via-blue-700 to-slate-800' },
  street: { emoji: '🏃', label: 'Vỉa hè', gradient: 'from-slate-800 via-slate-600 to-orange-900' },
  traffic: { emoji: '🛵', label: 'Giao thông', gradient: 'from-amber-900 via-red-800 to-slate-900' },
  sidewalk: { emoji: '🛒', label: 'Vỉa hè phố', gradient: 'from-orange-800 via-amber-700 to-yellow-900' },
  cafe: { emoji: '☕', label: 'Quán cà phê', gradient: 'from-amber-900 via-brown-800 to-slate-900' },
  market: { emoji: '🏪', label: 'Chợ', gradient: 'from-emerald-900 via-teal-800 to-slate-900' },
  night: { emoji: '🌙', label: 'Đêm phố', gradient: 'from-indigo-950 via-purple-900 to-slate-950' },
  home: { emoji: '🏠', label: 'Khu dân cư', gradient: 'from-slate-900 via-blue-950 to-indigo-950' },
  cards: { emoji: '🃏', label: 'Cờ bạc', gradient: 'from-red-950 via-rose-900 to-slate-900' },
  drama: { emoji: '📱', label: 'Cá độ', gradient: 'from-green-950 via-emerald-900 to-slate-900' },
};

function renderMiniScene(scene, hook, isPlaying) {
  const meta = SCENE_META[scene] || SCENE_META.street;
  const playClass = isPlaying ? 'scene-playing' : '';
  return `
    <div class="mini-scene bg-gradient-to-br ${meta.gradient} ${playClass}" data-scene="${scene}">
      <div class="mini-scene-bg"></div>
      <div class="mini-scene-emoji">${meta.emoji}</div>
      <div class="mini-scene-overlay">
        <span class="mini-scene-hook">${hook || ''}</span>
      </div>
      <div class="tiktok-ui">
        <div class="tiktok-side">
          <div class="tiktok-icon">❤️</div>
          <div class="tiktok-icon">💬</div>
          <div class="tiktok-icon">↗️</div>
        </div>
        <div class="tiktok-bottom">
          <div class="tiktok-user">@BinhXangCon</div>
          <div class="tiktok-caption">${hook || ''}</div>
        </div>
      </div>
      ${isPlaying ? '<div class="play-pulse"></div>' : ''}
    </div>
  `;
}

function renderPhoneMockup(item, sceneIndex = 0, isPlaying = false) {
  const scene = item.storyboard[sceneIndex] || item.storyboard[0];
  const meta = SCENE_META[item.scene] || SCENE_META.street;
  const progress = ((sceneIndex + 1) / item.storyboard.length) * 100;

  return `
    <div class="phone-mockup ${isPlaying ? 'phone-playing' : ''}">
      <div class="phone-notch"></div>
      <div class="phone-screen bg-gradient-to-br ${meta.gradient}">
        <div class="phone-status">
          <span>9:41</span>
          <span class="phone-live ${isPlaying ? 'live-active' : ''}">${isPlaying ? '● MÔ PHỎNG' : 'PREVIEW'}</span>
        </div>
        <div class="phone-scene-content">
          <div class="phone-scene-emoji animate-bounce-slow">${meta.emoji}</div>
          <div class="phone-scene-visual scene-${item.scene}"></div>
          <div class="phone-text-overlay">${scene?.overlay || item.hook}</div>
        </div>
        <div class="phone-progress"><div class="phone-progress-bar" style="width:${progress}%"></div></div>
        <div class="phone-tiktok-bar">
          <div class="phone-tiktok-left">
            <strong>@BinhXangCon</strong>
            <p>${scene?.title || item.title}</p>
          </div>
          <div class="phone-tiktok-actions">
            <span>❤️ ${item.viralLikes}</span>
            <span>💬 ${item.viralComments}</span>
          </div>
        </div>
      </div>
    </div>
  `;
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