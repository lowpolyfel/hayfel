(() => {
  const overlay = document.querySelector('.overlay');
  const svg = document.querySelector('.wave-layer svg');
  if (!overlay || !svg) return;

  const buttons = Array.from(document.querySelectorAll('.mode-btn'));
  const NS = 'http://www.w3.org/2000/svg';
  const PALETTE = ['#590209', '#7f0220', '#a60321', '#cc1638', '#f20530', '#ff6a00', '#f2b705', '#1f6fcf', '#35a8ff'];

  const layers = Array.from({ length: 9 }, (_, i) => {
    const path = document.createElementNS(NS, 'path');
    path.classList.add('wave-path');
    path.setAttribute('fill', PALETTE[i % PALETTE.length]);
    path.setAttribute('fill-opacity', String(0.22 + i * 0.07));
    svg.appendChild(path);
    return {
      path,
      baseY: 44 + i * 8.8,
      amp: 8 + (i % 5) * 5,
      speed: 0.6 + i * 0.11,
      freq: 1.1 + (i % 4) * 0.36,
      seed: Math.random() * Math.PI * 2,
      skew: (Math.random() - 0.5) * 24,
    };
  });

  const state = { mode: 'normal', t: 0, v: 0, amp: 0, target: 0 };

  const wavePath = (cfg, t, modeBoost) => {
    const points = [];
    const count = 7;
    for (let i = 0; i <= count; i += 1) {
      const x = (600 / count) * i;
      const phase = t * cfg.speed + cfg.seed + i * 0.75;
      const wobble = Math.sin(phase * cfg.freq) * cfg.amp * modeBoost;
      const chaos = Math.cos(phase * 1.37 + cfg.skew * 0.05) * cfg.amp * 0.52 * modeBoost;
      points.push({ x, y: cfg.baseY + wobble + chaos });
    }

    let d = `M0,140 L0,${points[0].y.toFixed(2)}`;
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) * 0.35;
      const cy1 = p0.y - cfg.skew * 0.08;
      const cx2 = p0.x + (p1.x - p0.x) * 0.65;
      const cy2 = p1.y + cfg.skew * 0.08;
      d += ` C${cx1.toFixed(2)},${cy1.toFixed(2)} ${cx2.toFixed(2)},${cy2.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`;
    }
    d += ' L600,140 Z';
    return d;
  };

  const setMode = (mode) => {
    state.mode = mode;
    overlay.dataset.mode = mode;
    buttons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode)));
  };

  buttons.forEach((btn) => btn.addEventListener('click', () => setMode(btn.dataset.mode)));

  const animate = () => {
    state.t += 0.016;

    if (state.mode === 'physics') {
      state.target = Math.sin(state.t * 1.3) * 18;
      const force = (state.target - state.amp) * 0.1;
      state.v = (state.v + force) * 0.88;
      state.amp += state.v;
    } else {
      state.amp *= 0.9;
      state.v *= 0.8;
    }

    const boost = state.mode === 'physics' ? 1.45 : state.mode === 'vhs' ? 1.2 : 1;
    layers.forEach((layer, idx) => {
      layer.path.setAttribute('d', wavePath(layer, state.t + idx * 0.16 + state.amp * 0.01, boost));
      if (state.mode === 'physics') {
        const dx = state.amp * (0.08 + idx * 0.02);
        const dy = Math.cos(state.t * 2 + idx) * (1 + idx * 0.3);
        layer.path.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      } else {
        layer.path.style.transform = '';
      }
    });

    overlay.style.setProperty('--vhs-jitter', state.mode === 'vhs' ? `${((Math.random() - 0.5) * 3).toFixed(2)}px` : '0px');
    requestAnimationFrame(animate);
  };

  setMode('normal');
  requestAnimationFrame(animate);
})();
