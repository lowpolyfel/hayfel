const root = document.documentElement;
let t = 0;

function animateGlow() {
  t += 0.02;
  const pulse = 0.38 + Math.sin(t) * 0.03 + (Math.random() - 0.5) * 0.015;
  root.style.setProperty('--glow', `rgba(255,255,255,${pulse.toFixed(3)})`);
  requestAnimationFrame(animateGlow);
}
animateGlow();

const palette = ['#1a1a1a', '#30000d', '#8a001f', '#d90037', '#fc0341'];
const randomColor = () => palette[Math.floor(Math.random() * palette.length)];

function paintElement(element) {
  const color = randomColor();
  element.style.backgroundColor = color;
  element.style.color = color;
  element.style.boxShadow = `0 0 10px ${color}, 0 0 24px ${color}99, 0 0 42px ${color}55`;
}

function randomizeElement(element, minDelay, maxDelay) {
  paintElement(element);
  function loop() {
    paintElement(element);
    const nextDelay = minDelay + Math.random() * (maxDelay - minDelay);
    setTimeout(loop, nextDelay);
  }
  const initialDelay = Math.random() * maxDelay;
  setTimeout(loop, initialDelay);
}

document.querySelectorAll('.dot').forEach((dot) => randomizeElement(dot, 180, 520));
document.querySelectorAll('.slash').forEach((slash) => randomizeElement(slash, 300, 900));
document.querySelectorAll('.loader-bar').forEach((bar) => randomizeElement(bar, 220, 640));
