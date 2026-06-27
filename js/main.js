(function () {
  'use strict';

  let activeFilter = 'all';
  let currentModalItem = null;
  let simulatorIndex = 0;
  let heroIndex = 0;
  let heroPlayer = null;
  let simPlayer = null;
  let heroClipTimer = null;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const badgeClassMap = {
    'trom-cap': 'badge-blue',
    'gay-roi': 'badge-peach',
    'ca-do': 'badge-coral',
    'to-giac': 'badge-green',
  };

  function getFilteredItems() {
    if (activeFilter === 'all') return CONTENT_ITEMS;
    return CONTENT_ITEMS.filter((item) => item.category === activeFilter);
  }

  function renderCards() {
    const grid = $('#content-grid');
    const items = getFilteredItems();

    grid.innerHTML = items
      .map(
        (item) => `
      <article class="content-card card-shadcn overflow-hidden reveal visible cursor-pointer group" data-id="${item.id}" role="button" tabindex="0">
        <div class="card-preview-wrap">
          ${renderMiniScene(item)}
          <div class="card-preview-badge">
            <span class="badge ${badgeClassMap[item.category]}">${item.categoryLabel}</span>
            <span class="viral-pill">🔥 ${item.viralScore}%</span>
          </div>
        </div>
        <div class="p-5 flex flex-col gap-3">
          <div class="flex items-start gap-3">
            <div class="card-number">${String(item.id).padStart(2, '0')}</div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-police leading-tight group-hover:text-accent-blue transition-colors">${item.title}</h3>
              <p class="text-sm text-slate-500 mt-0.5">${item.subtitle}</p>
            </div>
          </div>
          <p class="text-sm font-medium text-accent-peach">"${item.hook}"</p>
          <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">${item.summary}</p>
          <div class="flex items-center gap-3 text-xs text-slate-400">
            <span>⏱ ${item.duration}</span>
            <span>📍 ${item.location.split('—')[0].trim()}</span>
          </div>
          ${renderImpactBar(item.viralScore)}
          <button class="btn btn-secondary btn-sm w-full view-detail-btn" data-id="${item.id}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Xem mô phỏng & kịch bản
          </button>
        </div>
      </article>
    `
      )
      .join('');

    bindCardEvents();
    animateImpactBars(grid);
  }

  function bindCardEvents() {
    $$('#content-grid .content-card, .view-detail-btn').forEach((el) => {
      const handler = (e) => {
        if (e.target.closest('.view-detail-btn')) e.stopPropagation();
        const id = parseInt(el.dataset.id || el.closest('[data-id]')?.dataset.id, 10);
        if (id) openModal(id);
      };
      el.addEventListener('click', handler);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler(e);
        }
      });
    });
  }

  function renderFilters() {
    const container = $('#filter-tabs');
    container.innerHTML = CATEGORIES.map(
      (cat) => `
      <button class="filter-tab ${cat.id === activeFilter ? 'active' : ''}" data-filter="${cat.id}">
        <span class="mr-1">${cat.icon}</span>${cat.label}
      </button>
    `
    ).join('');

    $$('.filter-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        activeFilter = tab.dataset.filter;
        $$('.filter-tab').forEach((t) => t.classList.toggle('active', t.dataset.filter === activeFilter));
        renderCards();
      });
    });
  }

  function openModal(id) {
    const item = CONTENT_ITEMS.find((i) => i.id === id);
    if (!item) return;
    currentModalItem = item;

    const body = $('#modal-body');
    body.innerHTML = `
      <div class="modal-hero-grid">
        <div class="modal-phone-col">
          <div id="modal-phone"></div>
          <p class="text-xs text-slate-400 text-center mt-2">▶ Nhấn play trên video · Click timeline để nhảy cảnh</p>
        </div>
        <div class="modal-info-col">
          <div class="flex items-start gap-3 mb-4">
            <div class="card-number text-xl w-12 h-12">${String(item.id).padStart(2, '0')}</div>
            <div>
              <h2 class="text-2xl font-bold text-police">${item.title}</h2>
              <p class="text-slate-500 mt-1">${item.subtitle}</p>
              <div class="flex flex-wrap gap-2 mt-2">
                <span class="badge ${badgeClassMap[item.category]}">${item.categoryLabel}</span>
                <span class="badge badge-peach">🔥 Viral ${item.viralScore}%</span>
              </div>
            </div>
          </div>
          <p class="text-lg font-semibold text-accent-peach mb-3">"${item.hook}"</p>
          <div class="grid grid-cols-2 gap-2 text-xs mb-4">
            <div class="meta-chip">⏱ ${item.duration}</div>
            <div class="meta-chip">📍 ${item.location}</div>
            <div class="meta-chip">🎭 ${item.mood}</div>
            <div class="meta-chip">❤️ ${item.viralLikes} · 💬 ${item.viralComments}</div>
          </div>
          ${renderImpactBar(item.viralScore)}
        </div>
      </div>

      <div class="space-y-6 mt-6">
        <section>
          <h4 class="section-label">Ý tưởng tóm tắt</h4>
          <p class="text-slate-600 leading-relaxed">${item.summary}</p>
        </section>

        <section>
          <h4 class="section-label">Storyboard — Mô phỏng từng cảnh</h4>
          <div id="modal-storyboard">${renderStoryboardTimeline(item.storyboard, 0)}</div>
        </section>

        <section>
          <h4 class="section-label">Đối thoại mẫu (viral lines)</h4>
          ${renderDialogues(item.dialogues)}
        </section>

        <section>
          <div class="flex items-center justify-between mb-2">
            <h4 class="section-label mb-0">Kịch bản chi tiết</h4>
            <button class="btn btn-ghost btn-sm copy-script-btn">📋 Sao chép kịch bản</button>
          </div>
          <ul class="script-list">
            ${item.script.map((line) => `<li>${line}</li>`).join('')}
          </ul>
        </section>

        <div class="grid sm:grid-cols-2 gap-4">
          <section class="info-panel">
            <h4 class="section-label">Vai diễn BXC</h4>
            <p class="text-sm text-slate-600">${item.role}</p>
          </section>
          <section class="info-panel info-panel-blue">
            <h4 class="section-label">Thông điệp chính</h4>
            <p class="text-sm text-slate-700">${item.message}</p>
          </section>
        </div>

        <section class="info-panel info-panel-orange">
          <h4 class="section-label">Call to Action</h4>
          <p class="text-sm font-medium text-slate-800">${item.cta}</p>
        </section>

        <section class="info-panel info-panel-red">
          <h4 class="section-label">⚖️ Căn cứ pháp lý</h4>
          <p class="text-sm text-slate-700">${item.legalNote}</p>
        </section>

        <section>
          <div class="flex items-center justify-between mb-2">
            <h4 class="section-label mb-0">Caption mẫu & Hashtag</h4>
            <div class="flex gap-2">
              <button class="btn btn-ghost btn-sm copy-caption-btn">Caption</button>
              <button class="btn btn-ghost btn-sm copy-hashtag-btn">Hashtag</button>
            </div>
          </div>
          <p class="text-sm bg-slate-50 p-3 rounded-lg border italic text-slate-600">"${item.sampleCaption}"</p>
          <p class="text-sm text-blue-600 mt-2 font-medium">${item.hashtags}</p>
          <p class="text-xs text-slate-500 mt-2">${item.production}</p>
        </section>
      </div>
    `;

    destroyPlayer('modal-phone');
    const modalPlayer = mountVideoPlayer('modal-phone', item, {
      loop: true,
      autoplay: true,
      onSceneChange: (idx) => {
        const tl = $('#modal-storyboard');
        if (tl) tl.innerHTML = renderStoryboardTimeline(item.storyboard, idx);
        bindTimelineClicks(modalPlayer);
      },
    });

    function bindTimelineClicks(player) {
      $$('#modal-storyboard .storyboard-frame').forEach((frame) => {
        frame.addEventListener('click', () => {
          player.goToScene(parseInt(frame.dataset.index, 10));
          player.play();
        });
      });
    }
    bindTimelineClicks(modalPlayer);

    $('.copy-script-btn')?.addEventListener('click', copyScript);
    $('.copy-hashtag-btn')?.addEventListener('click', copyHashtags);
    $('.copy-caption-btn')?.addEventListener('click', () => {
      copyToClipboard(item.sampleCaption, 'Đã sao chép caption!');
    });

    animateImpactBars(body);

    const overlay = $('#modal-overlay');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    overlay._pauseModal = () => destroyPlayer('modal-phone');
  }

  function closeModal() {
    const overlay = $('#modal-overlay');
    destroyPlayer('modal-phone');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentModalItem = null;
  }

  function copyScript() {
    if (!currentModalItem) return;
    const item = currentModalItem;
    const text = [
      `【${item.id}】${item.title} — ${item.subtitle}`,
      `Hook: ${item.hook}`,
      `Chủ đề: ${item.categoryLabel}`,
      `Thời lượng: ${item.duration} | Địa điểm: ${item.location}`,
      '',
      'STORYBOARD:',
      ...item.storyboard.map((s) => `[${s.time}] ${s.title}: ${s.desc}`),
      '',
      'ĐỐI THOẠI:',
      ...item.dialogues.map((d) => `${d.speaker}: "${d.line}"`),
      '',
      'KỊCH BẢN:',
      ...item.script,
      '',
      `Vai diễn: ${item.role}`,
      `Thông điệp: ${item.message}`,
      `CTA: ${item.cta}`,
      `Pháp lý: ${item.legalNote}`,
      `Caption: ${item.sampleCaption}`,
      `Hashtag: ${item.hashtags}`,
    ].join('\n');
    copyToClipboard(text, 'Đã sao chép kịch bản đầy đủ!');
  }

  function copyHashtags() {
    if (!currentModalItem) return;
    copyToClipboard(currentModalItem.hashtags, 'Đã sao chép hashtag!');
  }

  async function copyToClipboard(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(message);
    }
  }

  function showToast(message) {
    let toast = $('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function animateImpactBars(container) {
    requestAnimationFrame(() => {
      $$(container).length === 0
        ? container.querySelectorAll?.('.impact-fill')?.forEach?.(animateBar)
        : null;
      const root = container instanceof Element ? container : document;
      root.querySelectorAll('.impact-fill').forEach(animateBar);
    });
  }

  function animateBar(bar) {
    const target = bar.dataset.target;
    requestAnimationFrame(() => {
      bar.style.width = target + '%';
    });
  }

  function mountSimPlayer() {
    const item = CONTENT_ITEMS[simulatorIndex];
    const timelineEl = $('#simulator-timeline');
    destroyPlayer('simulator-phone');
    simPlayer = mountVideoPlayer('simulator-phone', item, {
      loop: true,
      autoplay: true,
      onSceneChange: (idx) => {
        if (timelineEl) timelineEl.innerHTML = renderStoryboardTimeline(item.storyboard, idx);
        $$('#simulator-timeline .storyboard-frame').forEach((f) => {
          f.addEventListener('click', () => {
            simPlayer?.goToScene(parseInt(f.dataset.index, 10));
            simPlayer?.play();
          });
        });
      },
    });
    if (timelineEl) timelineEl.innerHTML = renderStoryboardTimeline(item.storyboard, 0);
    $('#sim-hook').textContent = item.hook;
    $('#sim-title').textContent = item.title;
    $('#sim-meta').textContent = `${item.duration} · ${item.location} · Viral ${item.viralScore}%`;
    $$('#simulator-timeline .storyboard-frame').forEach((f) => {
      f.addEventListener('click', () => {
        simPlayer?.goToScene(parseInt(f.dataset.index, 10));
        simPlayer?.play();
      });
    });
  }

  function initSimulator() {
    const selector = $('#simulator-select');
    const playBtn = $('#sim-play');
    const pauseBtn = $('#sim-pause');
    if (!selector) return;

    selector.innerHTML = CONTENT_ITEMS.map(
      (item) => `<option value="${item.id}">${String(item.id).padStart(2, '0')}. ${item.title}</option>`
    ).join('');

    mountSimPlayer();
    if (playBtn && pauseBtn) {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'inline-flex';
    }

    playBtn?.addEventListener('click', () => {
      simPlayer?.play();
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'inline-flex';
    });
    pauseBtn?.addEventListener('click', () => {
      simPlayer?.pause();
      playBtn.style.display = 'inline-flex';
      pauseBtn.style.display = 'none';
    });

    selector.addEventListener('change', () => {
      simulatorIndex = CONTENT_ITEMS.findIndex((i) => i.id === parseInt(selector.value, 10));
      mountSimPlayer();
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'inline-flex';
    });

    $('#sim-prev')?.addEventListener('click', () => {
      simulatorIndex = (simulatorIndex - 1 + CONTENT_ITEMS.length) % CONTENT_ITEMS.length;
      selector.value = CONTENT_ITEMS[simulatorIndex].id;
      mountSimPlayer();
    });

    $('#sim-next')?.addEventListener('click', () => {
      simulatorIndex = (simulatorIndex + 1) % CONTENT_ITEMS.length;
      selector.value = CONTENT_ITEMS[simulatorIndex].id;
      mountSimPlayer();
    });
  }

  function initHeroPhone() {
    const el = $('#hero-phone');
    if (!el) return;

    function mountHero() {
      const item = CONTENT_ITEMS[heroIndex];
      destroyPlayer('hero-phone');
      el.classList.add('phone-switching');
      heroPlayer = mountVideoPlayer(el, item, { loop: true, autoplay: true });
      $('#hero-clip-title').textContent = item.title;
      $('#hero-clip-hook').textContent = item.hook;
      setTimeout(() => el.classList.remove('phone-switching'), 400);
    }

    mountHero();
    heroClipTimer = setInterval(() => {
      heroIndex = (heroIndex + 1) % CONTENT_ITEMS.length;
      mountHero();
    }, 12000);
  }

  function initHeroStats() {
    $$('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + suffix;
        if (current >= target) clearInterval(timer);
      }, 30);
    });
  }

  function exportExcel() {
    const BOM = '\uFEFF';
    const headers = [
      'STT', 'Tiêu đề', 'Phụ đề', 'Hook', 'Chủ đề', 'Thời lượng', 'Địa điểm',
      'Viral Score', 'Ý tưởng', 'Storyboard', 'Đối thoại', 'Kịch bản', 'Vai diễn BXC',
      'Thông điệp', 'CTA', 'Pháp lý', 'Caption mẫu', 'Hashtag', 'Gợi ý sản xuất',
    ];
    const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;

    const rows = CONTENT_ITEMS.map((item) =>
      [
        item.id, item.title, item.subtitle, item.hook, item.categoryLabel,
        item.duration, item.location, item.viralScore + '%', item.summary,
        item.storyboard.map((s) => `[${s.time}] ${s.title}: ${s.desc}`).join(' | '),
        item.dialogues.map((d) => `${d.speaker}: "${d.line}"`).join(' | '),
        item.script.join(' | '), item.role, item.message, item.cta, item.legalNote,
        item.sampleCaption, item.hashtags, item.production,
      ].map(escape).join(',')
    );

    const csv = BOM + [headers.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Binh-Xang-Con-10-Tieu-Pham-Phuong-Liet-Bach-Truong.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải file Excel (CSV) thành công!');
  }

  function initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.querySelectorAll('.impact-fill').forEach(animateBar);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    $$('.reveal').forEach((el) => observer.observe(el));
  }

  function initNavbar() {
    const navbar = $('#navbar');
    const toggle = () => navbar.classList.toggle('navbar-scrolled', window.scrollY > 20);
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  function initMobileMenu() {
    const btn = $('#mobile-menu-btn');
    const menu = $('#mobile-menu');
    btn?.addEventListener('click', () => {
      menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', menu.classList.contains('open'));
    });
    $$('#mobile-menu a').forEach((link) => {
      link.addEventListener('click', () => menu.classList.remove('open'));
    });
  }

  function initModal() {
    $('#modal-close')?.addEventListener('click', closeModal);
    $('#modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function initDownloadButtons() {
    $$('[data-download-excel]').forEach((btn) => btn.addEventListener('click', exportExcel));
  }

  function initAuthor() {
    $$('[data-author]').forEach((el) => {
      el.textContent = PROJECT_AUTHOR;
    });
  }

  function init() {
    renderFilters();
    renderCards();
    initScrollReveal();
    initNavbar();
    initMobileMenu();
    initModal();
    initDownloadButtons();
    initAuthor();
    initHeroPhone();
    initHeroStats();
    initSimulator();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();