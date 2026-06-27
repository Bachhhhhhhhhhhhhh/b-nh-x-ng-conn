/* Canvas scene renderer — mô phỏng video 60fps */

const CanvasScenes = (() => {
  const FL = typeof FontLoader !== 'undefined' ? FontLoader : null;
  const fs = (w, base) => (FL ? FL.scale(w, base) : Math.round(base * (w / 280)));
  const font = (weight, size) => (FL ? FL.canvasFont(weight, size) : `${weight} ${size}px "Segoe UI", sans-serif`);

  const COLORS = {
    police: '#0F2C59',
    blue: '#3B82F6',
    peach: '#FB923C',
    red: '#EF4444',
    green: '#22C55E',
    yellow: '#FBBF24',
    dark: '#0f172a',
    road: '#374151',
    bus: '#F59E0B',
  };

  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function clear(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
  }

  function bg(ctx, w, h, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function road(ctx, w, h, t) {
    ctx.fillStyle = COLORS.road;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 2;
    ctx.setLineDash([18, 14]);
    ctx.lineDashOffset = -t * 120;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.86);
    ctx.lineTo(w, h * 0.86);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function person(ctx, x, y, scale, shirt, label, canvasW) {
    const s = scale;
    const cw = canvasW || ctx.canvas?.clientWidth || 280;
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    ctx.arc(x, y - 22 * s, 10 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = shirt;
    ctx.fillRect(x - 12 * s, y - 12 * s, 24 * s, 28 * s);
    ctx.fillRect(x - 18 * s, y - 8 * s, 8 * s, 18 * s);
    ctx.fillRect(x + 10 * s, y - 8 * s, 8 * s, 18 * s);
    if (label) {
      const lw = fs(cw, 13);
      if (FL) {
        FL.drawText(ctx, label, x, y + 32 * s, { weight: 600, size: lw, stroke: true });
      } else {
        ctx.fillStyle = '#fff';
        ctx.font = font(600, lw);
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 32 * s);
      }
    }
  }

  function bus(ctx, w, h, t) {
    const bx = w * 0.08 + Math.sin(t * 4) * 3;
    const by = h * 0.48;
    const bw = w * 0.84;
    const bh = h * 0.22;
    ctx.fillStyle = COLORS.bus;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#93C5FD';
    ctx.fillRect(bx + 12, by + 10, bw - 24, bh * 0.45);
    ctx.fillStyle = '#D97706';
    ctx.fillRect(bx, by + bh - 8, bw, 8);
    for (let i = 0; i < 3; i++) {
      person(ctx, bx + bw * (0.25 + i * 0.25), by + bh - 6, 0.9, i === 1 ? COLORS.peach : '#64748B', i === 1 ? 'BXC' : '');
    }
  }

  function badge(ctx, w, h, t) {
    const scale = easeOut(Math.min(1, t * 2));
    const cx = w / 2;
    const cy = h * 0.42;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = COLORS.blue;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 4;
    ctx.stroke();
    const badgeSize = fs(w, 26);
    ctx.fillStyle = '#fff';
    ctx.font = font(800, badgeSize);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CA', 0, 2);
    ctx.restore();
  }

  function overlayText(ctx, w, h, text, sub) {
    if (!text) return;
    const pad = 12;
    const mainSize = fs(w, 15);
    const subSize = fs(w, 12);
    ctx.font = font(700, mainSize);
    const lines = FL ? FL.wrapVN(ctx, text, w - 28, 3) : wrapText(ctx, text, w - 28);
    const lh = mainSize * 1.38;
    const boxH = lines.length * lh + pad * 2 + (sub ? subSize + 8 : 0);
    const y = h - boxH - 62;
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    roundRect(ctx, 10, y, w - 20, boxH, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
    const textY = y + pad + mainSize;
    if (FL) {
      lines.forEach((line, i) => {
        FL.drawText(ctx, line, w / 2, textY + i * lh, { weight: 700, size: mainSize, baseline: 'middle' });
      });
    } else {
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      lines.forEach((line, i) => ctx.fillText(line, w / 2, textY + i * lh));
    }
    if (sub) {
      if (FL) {
        FL.drawText(ctx, sub, w / 2, y + boxH - pad - 2, { weight: 700, size: subSize, color: COLORS.yellow, baseline: 'middle' });
      } else {
        ctx.fillStyle = COLORS.yellow;
        ctx.font = font(700, subSize);
        ctx.textAlign = 'center';
        ctx.fillText(sub, w / 2, y + boxH - pad);
      }
    }
  }

  function wrapText(ctx, text, maxW) {
    return FL ? FL.wrapVN(ctx, text, maxW, 3) : [text];
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function outro(ctx, w, h, t, title, hotline) {
    bg(ctx, w, h, COLORS.police, '#1a4a8a');
    const pulse = 1 + Math.sin(t * 6) * 0.03;
    ctx.save();
    ctx.translate(w / 2, h * 0.38);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    roundRect(ctx, -28, -28, 56, 56, 12);
    ctx.fill();
    const shieldSize = fs(w, 22);
    ctx.fillStyle = '#fff';
    ctx.font = font(800, shieldSize);
    ctx.textAlign = 'center';
    ctx.fillText('🛡', 0, 8);
    ctx.restore();
    const titleSize = fs(w, 13);
    const msgSize = fs(w, (title || '').length > 42 ? 10 : 12);
    const hotSize = fs(w, 20);
    const legalY = (title || '').length > 42 ? h * 0.58 : h * 0.6;
    if (FL) {
      FL.drawText(ctx, 'CÔNG AN PHƯỜNG PHƯƠNG LIỆT', w / 2, h * 0.48, { weight: 800, size: titleSize, maxW: w - 20 });
      FL.drawText(ctx, title, w / 2, legalY, { weight: 600, size: msgSize, color: '#BFDBFE', maxW: w - 16, maxLines: 5 });
      FL.drawText(ctx, hotline || '📞 113', w / 2, h * 0.8, { weight: 800, size: hotSize, color: COLORS.yellow, stroke: false });
    } else {
      ctx.fillStyle = '#fff';
      ctx.font = font(800, titleSize);
      ctx.textAlign = 'center';
      ctx.fillText('CÔNG AN PHƯỜNG PHƯƠNG LIỆT', w / 2, h * 0.52);
      ctx.fillStyle = COLORS.yellow;
      ctx.font = font(800, hotSize);
      ctx.fillText(hotline || '📞 113', w / 2, h * 0.78);
    }
  }

  const SCENE_DRAWERS = {
    'bus-hook': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e3a5f', '#334155');
      bus(ctx, w, h, t);
      overlayText(ctx, w, h, meta.overlay || 'POV: Kẻ trộm trên xe buýt', 'Cảnh 1 — Hook');
    },
    'bus-sneak': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e3a5f', '#334155');
      bus(ctx, w, h, t);
      const handX = lerp(w * 0.35, w * 0.55, easeInOut((Math.sin(t * 3) + 1) / 2));
      ctx.fillStyle = '#FCD34D';
      ctx.beginPath();
      ctx.ellipse(handX, h * 0.58, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      overlayText(ctx, w, h, meta.overlay || 'Tôi chỉ kiểm tra khóa thôi!', '');
    },
    'bus-confront': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e3a5f', '#334155');
      person(ctx, w * 0.3, h * 0.55, 1.1, COLORS.blue, 'Nạn nhân');
      person(ctx, w * 0.7, h * 0.55, 1.1, COLORS.peach, 'BXC');
      overlayText(ctx, w, h, meta.overlay || 'Ví em sắp bay rồi!', '');
    },
    'bus-twist': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e3a5f', '#0f172a');
      badge(ctx, w, h, t);
      person(ctx, w * 0.5, h * 0.68, 1, COLORS.peach, 'BXC 😱');
      overlayText(ctx, w, h, meta.overlay || 'Nạn nhân là Công an!', 'TWIST');
    },
    'outro-wallet': (ctx, w, h, t, meta) => outro(ctx, w, h, t, meta.legalOutro || meta.overlay || 'Điều 173 BLHS 2015 · Khoản 1', '📞 113'),

    'street-phone': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#64748b', '#334155');
      road(ctx, w, h, t);
      person(ctx, w * 0.45, h * 0.58, 1.2, COLORS.blue, '');
      ctx.font = '24px serif';
      ctx.fillText('📱', w * 0.48, h * 0.42);
      overlayText(ctx, w, h, meta.overlay || 'Đừng mải phone khi đi đường!', '');
    },
    'street-snatch': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#64748b', '#334155');
      road(ctx, w, h, t * 2);
      const rx = lerp(w * 0.2, w * 0.75, easeOut(Math.min(1, t * 1.5)));
      person(ctx, rx, h * 0.55, 1.1, COLORS.peach, 'BXC');
      ctx.fillStyle = '#fff';
      ctx.font = '20px serif';
      ctx.fillText('📱', lerp(w * 0.5, w * 0.65, t), h * 0.4);
      overlayText(ctx, w, h, meta.overlay || 'Giật phone!', '');
    },
    'street-fall': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#64748b', '#334155');
      road(ctx, w, h, t);
      ctx.save();
      ctx.translate(w * 0.65, h * 0.62);
      ctx.rotate(1.2);
      person(ctx, 0, 0, 1, COLORS.peach, '');
      ctx.restore();
      overlayText(ctx, w, h, meta.overlay || 'Karma tới nhanh!', '');
    },
    'street-cctv': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1f2937', '#111827');
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = '#ef4444';
      ctx.font = font(600, fs(w, 11));
      ctx.fillText('● CCTV REC', 12, 22);
      person(ctx, w * 0.4, h * 0.55, 1, COLORS.blue, 'Gọi 113');
      overlayText(ctx, w, h, meta.overlay || 'Bình tĩnh báo Công an', '');
    },
    'outro-snatch': (ctx, w, h, t, meta) => outro(ctx, w, h, t, meta.legalOutro || meta.overlay || 'Điều 171 BLHS 2015 · Khoản 1', '📞 113'),

    'traffic-crash': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#78350f', '#44403c');
      road(ctx, w, h, t);
      ctx.font = '28px serif';
      ctx.fillText('🛵', w * 0.22 + Math.sin(t * 8) * 4, h * 0.58);
      ctx.fillText('🛵', w * 0.58 + Math.sin(t * 8 + 1) * 4, h * 0.58);
      overlayText(ctx, w, h, meta.overlay || 'Va chạm nhẹ thôi mà...', '');
    },
    'traffic-yell': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#78350f', '#44403c');
      person(ctx, w * 0.32, h * 0.55, 1.15, COLORS.peach, 'BXC');
      person(ctx, w * 0.68, h * 0.55, 1.15, COLORS.blue, 'Bình tĩnh');
      overlayText(ctx, w, h, meta.overlay || 'Cáu lớn hơn va chạm!', '');
    },
    'traffic-jam': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#78350f', '#292524');
      road(ctx, w, h, t);
      for (let i = 0; i < 5; i++) {
        ctx.font = '22px serif';
        ctx.fillText('🧑', w * (0.1 + i * 0.18), h * (0.35 + (i % 2) * 0.08));
      }
      overlayText(ctx, w, h, meta.overlay || 'Gây rối = Phạt nặng hơn!', '');
    },
    'traffic-police': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#44403c', '#1c1917');
      person(ctx, w * 0.38, h * 0.55, 1.2, '#1e40af', 'Công an');
      person(ctx, w * 0.68, h * 0.58, 1, COLORS.peach, 'BXC');
      overlayText(ctx, w, h, meta.overlay || 'Phạt vì gây rối', '');
    },
    'outro-calm': (ctx, w, h, t, meta) => outro(ctx, w, h, t, meta.legalOutro || meta.overlay || 'Điều 318 BLHS 2015 · K1 + K2', '📞 113'),

    'vendor-block': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#c2410c', '#78350f');
      ctx.fillStyle = '#D97706';
      ctx.fillRect(w * 0.05, h * 0.5, w * 0.9, h * 0.18);
      ctx.fillStyle = '#fff';
      ctx.font = font(700, fs(w, 12));
      ctx.textAlign = 'center';
      ctx.fillText('HÀNG RONG CHIẾM VỈA HÈ', w / 2, h * 0.44);
      overlayText(ctx, w, h, meta.overlay || 'Vỉa hè là của chung!', '');
    },
    'vendor-walk': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#92400e', '#78350f');
      person(ctx, lerp(w * 0.15, w * 0.55, easeInOut(t)), h * 0.58, 1, '#94a3b8', 'Người đi bộ');
      overlayText(ctx, w, h, meta.overlay || 'Nhường lối đi!', '');
    },
    'vendor-police': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#92400e', '#78350f');
      person(ctx, w * 0.32, h * 0.55, 1.1, '#1e40af', 'CA');
      person(ctx, w * 0.68, h * 0.55, 1.1, COLORS.peach, 'BXC');
      overlayText(ctx, w, h, meta.overlay || 'Kinh doanh đúng quy định', '');
    },
    'vendor-after': (ctx, w, h, t, meta) => {
      ctx.fillStyle = 'rgba(239,68,68,0.5)';
      ctx.fillRect(0, 0, w / 2, h);
      ctx.fillStyle = 'rgba(34,197,94,0.5)';
      ctx.fillRect(w / 2, 0, w / 2, h);
      ctx.fillStyle = '#fff';
      ctx.font = font(800, fs(w, 13));
      ctx.textAlign = 'center';
      ctx.fillText('TRƯỚC', w * 0.25, h * 0.45);
      ctx.fillText('SAU ✅', w * 0.75, h * 0.45);
      overlayText(ctx, w, h, meta.overlay || 'Vỉa hè thông thoáng', '');
    },
    'outro-viahe': (ctx, w, h, t, meta) => outro(ctx, w, h, t, meta.legalOutro || meta.overlay || 'NĐ 168/2024 Điều 20 · K1', '📞 113'),

    'bet-lose': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#292524', '#1c1917');
      person(ctx, w * 0.42, h * 0.52, 1.1, COLORS.peach, 'BXC');
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      roundRect(ctx, w * 0.22, h * 0.28, w * 0.56, 36, 6);
      ctx.fill();
      ctx.fillStyle = COLORS.red;
      ctx.font = font(800, fs(w, 14));
      ctx.textAlign = 'center';
      ctx.fillText('-47.000.000 đ', w / 2, h * 0.28 + 23);
      overlayText(ctx, w, h, meta.overlay || 'Thua cá độ sạch', '');
    },
    'bet-whisper': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#292524', '#1c1917');
      person(ctx, w * 0.32, h * 0.55, 1, COLORS.peach, 'BXC');
      person(ctx, w * 0.68, h * 0.55, 1, '#64748B', 'Bạn');
      overlayText(ctx, w, h, meta.overlay || 'Trộm xe gỡ nợ...', '');
    },
    'bet-steal': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#292524', '#1c1917');
      ctx.font = '32px serif';
      ctx.fillText('🏍️', w * 0.55, h * 0.5);
      person(ctx, lerp(w * 0.25, w * 0.45, t), h * 0.58, 1, COLORS.peach, '');
      overlayText(ctx, w, h, meta.overlay || 'Đừng đi con đường này!', '');
    },
    'bet-caught': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1c1917', '#0f172a');
      badge(ctx, w, h, t);
      person(ctx, w * 0.72, h * 0.65, 0.95, COLORS.peach, 'BXC');
      overlayText(ctx, w, h, meta.overlay || 'Bị bắt quả tang!', '');
    },
    'outro-cado': (ctx, w, h, t, meta) => outro(ctx, w, h, t, meta.legalOutro || meta.overlay || 'Điều 321 + 173 BLHS 2015', '📞 113'),

    'night-walk': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#0f172a', '#312e81');
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.12, 18, 0, Math.PI * 2);
      ctx.fill();
      person(ctx, w * 0.35, h * 0.58, 1.1, COLORS.blue, '');
      overlayText(ctx, w, h, meta.overlay || 'Đi nhà một mình buổi tối', '');
    },
    'night-follow': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#0f172a', '#312e81');
      person(ctx, w * 0.28, h * 0.58, 1, COLORS.blue, '');
      person(ctx, lerp(w * 0.55, w * 0.42, easeInOut(t)), h * 0.58, 1, '#64748B', '???');
      overlayText(ctx, w, h, meta.overlay || 'Cảm thấy không an toàn?', '');
    },
    'night-shop': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e1b4b', '#312e81');
      ctx.fillStyle = 'rgba(251,191,36,0.35)';
      roundRect(ctx, w * 0.15, h * 0.38, w * 0.7, h * 0.28, 8);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = font(700, fs(w, 13));
      ctx.textAlign = 'center';
      ctx.fillText('TIỆM TẠP HÓA — AN TOÀN', w / 2, h * 0.52);
      overlayText(ctx, w, h, meta.overlay || 'Vào nơi đông người — Gọi 113', '');
    },
    'night-twist': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e1b4b', '#0f172a');
      person(ctx, w * 0.45, h * 0.55, 1.1, COLORS.peach, 'BXC');
      overlayText(ctx, w, h, meta.overlay || 'Đi nhầm ngõ — Xin lỗi!', 'TWIST');
    },
    'outro-safe': (ctx, w, h, t, meta) => outro(ctx, w, h, t, meta.legalOutro || meta.overlay || 'BLTTHS Điều 143 · K1', '📞 113'),

    'market-busy': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#14532d', '#422006');
      for (let i = 0; i < 6; i++) {
        ctx.font = '20px serif';
        ctx.fillText(['🧺', '🥬', '👩', '🧑', '🍖', '💰'][i], w * (0.08 + i * 0.15), h * (0.38 + (i % 3) * 0.1));
      }
      overlayText(ctx, w, h, meta.overlay || 'Chợ Phương Liệt đông người', '');
    },
    'market-bump': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#14532d', '#422006');
      person(ctx, w * 0.35 + Math.sin(t * 6) * 5, h * 0.55, 1, COLORS.peach, 'BXC');
      person(ctx, w * 0.62, h * 0.55, 1, COLORS.blue, '');
      overlayText(ctx, w, h, meta.overlay || 'Va chạm tình cờ...', '');
    },
    'market-split': (ctx, w, h, t, meta) => {
      ctx.fillStyle = 'rgba(59,130,246,0.45)';
      ctx.fillRect(0, 0, w, h / 2);
      ctx.fillStyle = 'rgba(239,68,68,0.45)';
      ctx.fillRect(0, h / 2, w, h / 2);
      ctx.fillStyle = '#fff';
      ctx.font = font(700, fs(w, 13));
      ctx.textAlign = 'center';
      ctx.fillText('😊 Xin lỗi liên tục', w / 2, h * 0.28);
      ctx.fillText('🤚 Móc túi lén lút', w / 2, h * 0.72);
      overlayText(ctx, w, h, meta.overlay || 'Hai mặt của kẻ trộm', '');
    },
    'market-caught': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#14532d', '#1c1917');
      person(ctx, w * 0.45, h * 0.55, 1.1, COLORS.peach, 'BXC');
      ctx.fillStyle = '#fff';
      ctx.font = font(700, fs(w, 12));
      ctx.fillText('CÓ TRỘM!', w / 2, h * 0.32);
      overlayText(ctx, w, h, meta.overlay || 'Bắt quả tang!', '');
    },
    'outro-cho': (ctx, w, h, t, meta) => outro(ctx, w, h, t, meta.legalOutro || meta.overlay || 'Điều 173 BLHS 2015 · K1 + K2', '📞 113'),

    'cards-play': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#292524', '#1c1917');
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.58, w * 0.35, h * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? '#FEF3C7' : '#fff';
        roundRect(ctx, w * (0.3 + i * 0.1), h * 0.48 - Math.sin(t * 4 + i) * 4, 22, 30, 3);
        ctx.fill();
      }
      overlayText(ctx, w, h, meta.overlay || 'Đánh bài ăn tiền = Vi phạm', '');
    },
    'cards-cheat': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#292524', '#1c1917');
      person(ctx, w * 0.7, h * 0.48, 0.9, COLORS.peach, 'BXC');
      ctx.fillStyle = '#fff';
      roundRect(ctx, w * 0.55, h * 0.32 + (1 - t) * 30, 20, 28, 3);
      ctx.fill();
      overlayText(ctx, w, h, meta.overlay || 'Gian lận bị lộ!', '');
    },
    'cards-expose': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#292524', '#1c1917');
      person(ctx, w * 0.3, h * 0.55, 1.1, '#64748B', '');
      person(ctx, w * 0.7, h * 0.55, 1.1, COLORS.peach, 'BXC');
      overlayText(ctx, w, h, meta.overlay || 'Bị bắt quả tang!', '');
    },
    'cards-police': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1c1917', '#0f172a');
      person(ctx, w * 0.38, h * 0.55, 1.15, '#1e40af', 'CA');
      person(ctx, w * 0.72, h * 0.6, 1, COLORS.peach, 'Viết cam kết');
      overlayText(ctx, w, h, meta.overlay || 'Xử lý cờ bạc', '');
    },
    'outro-cobac': (ctx, w, h, t, meta) => outro(ctx, w, h, t, meta.legalOutro || meta.overlay || 'Điều 321 + 322 BLHS 2015', '📞 113'),

    'drunk-sing': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e1b4b', '#0f172a');
      road(ctx, w, h, t);
      ctx.save();
      ctx.translate(w * 0.48, h * 0.52);
      ctx.rotate(Math.sin(t * 5) * 0.25);
      person(ctx, 0, 0, 1.2, COLORS.peach, 'BXC');
      ctx.restore();
      overlayText(ctx, w, h, meta.overlay || 'Say ≠ Được phép gây rối!', '');
    },
    'drunk-block': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e1b4b', '#0f172a');
      road(ctx, w, h, t);
      person(ctx, w * 0.45, h * 0.52, 1.2, COLORS.peach, '');
      ctx.fillStyle = COLORS.yellow;
      ctx.font = font(700, fs(w, 12));
      ctx.fillText('BÍ BÍ BÍ!!!', w / 2, h * 0.32);
      overlayText(ctx, w, h, meta.overlay || 'Chắn đường gây cản trở', '');
    },
    'drunk-pull': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e1b4b', '#0f172a');
      person(ctx, w * 0.45, h * 0.55, 1.1, COLORS.peach, 'BXC');
      person(ctx, w * 0.22, h * 0.55, 0.9, '#64748B', '');
      person(ctx, w * 0.72, h * 0.55, 0.9, '#64748B', '');
      overlayText(ctx, w, h, meta.overlay || '3 người kéo không nổi!', '');
    },
    'drunk-police': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e1b4b', '#0f172a');
      person(ctx, w * 0.35, h * 0.55, 1.1, '#1e40af', 'CA');
      person(ctx, w * 0.65, h * 0.58, 1, COLORS.peach, '😴');
      overlayText(ctx, w, h, meta.overlay || 'Đưa về an toàn', '');
    },
    'outro-say': (ctx, w, h, t, meta) => outro(ctx, w, h, t, meta.legalOutro || meta.overlay || 'Điều 318 BLHS 2015 · K1', '📞 113'),

    'witness-see': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e3a5f', '#0f172a');
      ctx.fillStyle = '#475569';
      roundRect(ctx, w * 0.2, h * 0.35, w * 0.6, h * 0.32, 6);
      ctx.fill();
      person(ctx, w * 0.35, h * 0.42, 0.85, COLORS.peach, '👀');
      ctx.font = '24px serif';
      ctx.fillText('🏍️💨', w * 0.72, h * 0.55);
      overlayText(ctx, w, h, meta.overlay || 'Thấy trộm mà im lặng?', '');
    },
    'witness-ignore': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#1e3a5f', '#0f172a');
      person(ctx, w * 0.45, h * 0.55, 1.2, COLORS.peach, '🙈 BXC');
      overlayText(ctx, w, h, meta.overlay || 'Không muốn dính líu', '');
    },
    'witness-burglary': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, '#0f172a', '#020617');
      ctx.fillStyle = '#475569';
      roundRect(ctx, w * 0.18, h * 0.32, w * 0.64, h * 0.36, 6);
      ctx.fill();
      ctx.fillStyle = COLORS.red;
      ctx.font = font(700, fs(w, 12));
      ctx.textAlign = 'center';
      ctx.fillText('NHÀ BỊ ĐỘT NHẬP', w / 2, h * 0.38);
      person(ctx, w * 0.45, h * 0.62, 1.1, COLORS.peach, '😱');
      overlayText(ctx, w, h, meta.overlay || '3 ngày sau... hối hận', '');
    },
    'witness-report': (ctx, w, h, t, meta) => {
      bg(ctx, w, h, COLORS.police, '#1a4a8a');
      person(ctx, lerp(w * 0.2, w * 0.38, easeOut(t)), h * 0.58, 1, COLORS.peach, 'BXC');
      person(ctx, w * 0.68, h * 0.55, 1.1, '#1e40af', 'CA');
      overlayText(ctx, w, h, meta.overlay || 'Tố giác ngay!', '');
    },
    'outro-bao': (ctx, w, h, t, meta) => outro(ctx, w, h, t, meta.legalOutro || meta.overlay || 'HP Điều 15 · K4 + BLTTHS 143', '📞 113'),
  };

  function draw(animId, ctx, w, h, progress, meta) {
    const fn = SCENE_DRAWERS[animId];
    if (fn) fn(ctx, w, h, progress, meta || {});
    else {
      bg(ctx, w, h, COLORS.police, COLORS.dark);
      overlayText(ctx, w, h, meta?.overlay || 'Mô phỏng clip', '');
    }
  }

  return { draw };
})();