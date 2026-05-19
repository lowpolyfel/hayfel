(() => {
  const overlay = document.querySelector('.overlay');
  if (!overlay) return;

  const buttons = Array.from(document.querySelectorAll('.mode-btn'));
  const wavePaths = Array.from(document.querySelectorAll('.wave-layer path'));
  if (!buttons.length || !wavePaths.length) return;

  const state = {
    mode: 'normal',
    t: 0,
    v: 0,
    amp: 0,
    target: 0,
  };

  const setMode = (mode) => {
    state.mode = mode;
    overlay.dataset.mode = mode;
    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode));
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  const animate = () => {
    state.t += 0.016;

    if (state.mode === 'physics') {
      state.target = Math.sin(state.t * 1.4) * 24;
      const force = (state.target - state.amp) * 0.08;
      state.v = (state.v + force) * 0.92;
      state.amp += state.v;

      wavePaths.forEach((path, idx) => {
        const swing = state.amp * (0.48 + idx * 0.28);
        const lift = Math.cos(state.t * 2 + idx) * (3 + idx * 1.4);
        path.style.transform = `translate3d(${swing}px, ${lift}px, 0) scale(${1 + idx * 0.02})`;
      });
    } else {
      wavePaths.forEach((path) => {
        path.style.transform = '';
      });
    }

    if (state.mode === 'vhs') {
      const jitter = (Math.random() - 0.5) * 2.2;
      overlay.style.setProperty('--vhs-jitter', `${jitter.toFixed(2)}px`);
    } else {
      overlay.style.setProperty('--vhs-jitter', '0px');
    }

    requestAnimationFrame(animate);
  };

  setMode('normal');
  requestAnimationFrame(animate);
})();
