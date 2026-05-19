(() => {
  const overlay = document.querySelector('.overlay');
  const svg = document.querySelector('.wave-layer svg');
  if (!overlay || !svg) return;

  const buttons = Array.from(document.querySelectorAll('.mode-btn'));
  const NS = 'http://www.w3.org/2000/svg';

  const buildLayers = (count, palette, opacityFn) => {
    svg.innerHTML = '';
    return Array.from({ length: count }, (_, i) => {
      const path = document.createElementNS(NS, 'path');
      path.classList.add('wave-path');
      path.setAttribute('fill', palette[i % palette.length]);
      path.setAttribute('fill-opacity', String(opacityFn(i, count)));
      svg.appendChild(path);
      return {
        path,
        baseY: 28 + i * (90 / count),
        amp: 6 + (i % 5) * 6,
        speed: 0.45 + i * 0.12,
        freq: 0.9 + (i % 4) * 0.42,
        seed: Math.random() * Math.PI * 2,
        skew: (Math.random() - 0.5) * 30,
      };
    });
  };

  const palettes = {
    normal: ['#7a1b2f', '#942342', '#ad2c54', '#c93667', '#f20530'],
    physics: ['#6f1f32', '#7e2a43', '#8f3452', '#a23d61', '#b44972', '#c45a83'],
    vhs: ['#7b2444', '#8f2f58', '#a33a6b', '#b8477f', '#cb5891', '#de6ca4'],
  };

  const state = {
    mode: 'normal',
    t: 0,
    v: 0,
    amp: 0,
    target: 0,
    layers: [],
  };

  const wavePath = (cfg, t, style) => {
    const points = [];
    const count = style === 'vhs' ? 10 : 7;
    for (let i = 0; i <= count; i += 1) {
      const x = (600 / count) * i;
      const phase = t * cfg.speed + cfg.seed + i * (style === 'physics' ? 1.15 : 0.75);
      const wobble = Math.sin(phase * cfg.freq) * cfg.amp;
      const chaos = Math.cos(phase * (style === 'normal' ? 1.45 : 1.9) + cfg.skew * 0.05) * cfg.amp * (style === 'normal' ? 0.55 : 0.9);
      const spike = style === 'vhs' ? Math.sin((phase + i) * 2.7) * cfg.amp * 0.35 : 0;
      points.push({ x, y: cfg.baseY + wobble + chaos + spike });
    }

    let d = `M0,140 L0,${points[0].y.toFixed(2)}`;
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const bend = style === 'physics' ? 0.2 : 0.35;
      const cx1 = p0.x + (p1.x - p0.x) * bend;
      const cy1 = p0.y - cfg.skew * (style === 'vhs' ? 0.14 : 0.08);
      const cx2 = p0.x + (p1.x - p0.x) * (1 - bend);
      const cy2 = p1.y + cfg.skew * (style === 'vhs' ? 0.14 : 0.08);
      d += ` C${cx1.toFixed(2)},${cy1.toFixed(2)} ${cx2.toFixed(2)},${cy2.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`;
    }
    return `${d} L600,140 Z`;
  };

  const applyModeScene = (mode) => {
    overlay.dataset.mode = mode;
    if (mode === 'normal') {
      state.layers = buildLayers(10, palettes.normal, (i, total) => {
        if (i === total - 1) return 1;
        return Math.min(0.92, 0.42 + i * 0.05);
      });
      const front = state.layers[state.layers.length - 1];
      front.path.setAttribute('fill', '#f20530');
      front.path.setAttribute('fill-opacity', '1');
      front.path.style.mixBlendMode = 'normal';
      front.path.style.filter = 'drop-shadow(0 0 10px rgba(242,5,48,.35))';
    }

    if (mode === 'physics') {
      state.layers = buildLayers(14, palettes.physics, (i, total) => Math.min(0.78, 0.24 + i * (0.48 / total)));
      state.layers.forEach((l, i) => { l.amp += i * 0.9; l.freq += 0.1; l.path.style.filter=''; l.path.style.mixBlendMode=''; });
    }

    if (mode === 'vhs') {
      state.layers = buildLayers(12, palettes.vhs, (i, total) => Math.min(0.8, 0.22 + i * (0.46 / total)));
      state.layers.forEach((l, i) => { l.speed += 0.22; l.skew *= 1.6; l.baseY += (i % 2 ? 2 : -2); l.path.style.filter=''; l.path.style.mixBlendMode=''; });
    }
  };

  const setMode = (mode) => {
    state.mode = mode;
    buttons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode)));
    applyModeScene(mode);
  };

  buttons.forEach((btn) => btn.addEventListener('click', () => setMode(btn.dataset.mode)));

  const animate = () => {
    state.t += 0.016;

    if (state.mode === 'physics') {
      state.target = Math.sin(state.t * 2.2) * 22;
      const force = (state.target - state.amp) * 0.11;
      state.v = (state.v + force) * 0.89;
      state.amp += state.v;
    } else {
      state.amp *= 0.92;
      state.v *= 0.84;
    }

    state.layers.forEach((layer, idx) => {
      const tt = state.t + idx * 0.22 + (state.mode === 'physics' ? state.amp * 0.017 : 0);
      layer.path.setAttribute('d', wavePath(layer, tt, state.mode));

      if (state.mode === 'physics') {
        const dx = Math.sin(state.t * 1.6 + idx) * (4 + idx * 0.6);
        const dy = Math.cos(state.t * 2.4 + idx) * (2 + idx * 0.22);
        const rz = Math.sin(state.t + idx) * 2;
        layer.path.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rz}deg)`;
      } else if (state.mode === 'vhs') {
        const scan = (idx % 3 - 1) * 1.8;
        layer.path.style.transform = `translate3d(${scan}px, 0, 0)`;
      } else {
        layer.path.style.transform = '';
      }
    });

    overlay.style.setProperty('--vhs-jitter', state.mode === 'vhs' ? `${((Math.random() - 0.5) * 4.4).toFixed(2)}px` : '0px');
    requestAnimationFrame(animate);
  };

  setMode('normal');
  requestAnimationFrame(animate);
})();
