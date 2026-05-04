const canvas = document.querySelector('.overlay1-noise');
const ctx = canvas.getContext('2d', { alpha: true });

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawNoise() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const img = ctx.createImageData(w, h);
  const data = img.data;

  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = Math.random() < 0.05 ? 15 : 0;
  }

  ctx.putImageData(img, 0, 0);
}

resizeCanvas();
drawNoise();
window.addEventListener('resize', () => {
  resizeCanvas();
  drawNoise();
});
setInterval(drawNoise, 90);
