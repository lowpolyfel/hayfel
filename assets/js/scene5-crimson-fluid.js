import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 a0 = x - floor(x + 0.5);
  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  vec3 colorDark = vec3(0.06, 0.01, 0.03);
  vec3 colorCrimson = vec3(0.92, 0.04, 0.22);
  vec3 colorBright = vec3(1.0, 0.22, 0.36);

  float n = snoise(uv * 2.4 + uTime * 0.18);
  float m = snoise(uv * 4.8 - uTime * 0.12);
  float pattern = sin(n * 11.0 + m * 2.8);

  vec3 finalColor = mix(colorDark, colorCrimson, smoothstep(-1.0, 1.0, pattern));
  float highlight = pow(max(0.0, pattern), 4.2);
  finalColor = mix(finalColor, colorBright, highlight * 0.62);

  float grain = hash(uv + uTime * 0.01);
  finalColor = mix(finalColor, vec3(grain), 0.06);

  float vignette = distance(uv, vec2(0.5));
  finalColor *= smoothstep(0.86, 0.18, vignette);

  gl_FragColor = vec4(finalColor, 1.0);
}`;

const canvas = document.querySelector('.crimson-fluid-canvas');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 1;
const material = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 } }, vertexShader, fragmentShader });
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

function animate(time) {
  material.uniforms.uTime.value = time * 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
window.addEventListener('resize', () => renderer.setSize(window.innerWidth, window.innerHeight));
