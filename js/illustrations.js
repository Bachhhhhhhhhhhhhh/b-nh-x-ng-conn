function renderMiniScene(item) {
  const anims = SCENE_ANIM_MAP[item.id] || SCENE_ANIM_MAP[1];
  const firstAnim = anims[0];
  const story = item.storyboard[0] || {};
  return `
    <div class="mini-vp" data-mini-id="${item.id}">
      <div class="vp-viewport">
        <div class="vp-scene active">${renderAnimScene(firstAnim)}</div>
        <div class="vp-grain"></div>
        <div class="vp-vignette"></div>
        <div class="vp-subtitle show">${story.overlay || item.hook}</div>
        <div style="position:absolute;top:6px;left:6px;z-index:25;background:rgba(239,68,68,0.8);color:#fff;font-size:7px;font-weight:800;padding:2px 5px;border-radius:3px">▶ PREVIEW</div>
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