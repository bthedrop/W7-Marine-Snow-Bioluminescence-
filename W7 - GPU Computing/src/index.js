/* eslint-disable no-undef, no-unused-vars, import/first */



import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Create renderer.
const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Create scene.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x292f33);

// Create camera.
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);
camera.position.z = 5.0;
scene.add(camera);

// Add mouse controls for camera.
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

let lastClickTime = -999.0;
window.addEventListener("mousedown", () => {
  lastClickTime = clock.getElapsedTime();
});

// Decrease the size significantly so we have fewer, more drawn-out particles. 64x64 = 4096 particles.
const size = 64;

// Populate an array of positions.
const posData = new Float32Array(size * size * 4);
for (let i = 0; i < size * size; i++) {
  // Spread particles out over a massive 30x30x30 unit volume to prevent overlapping
  posData[i * 4 + 0] = Math.random() * 30.0 - 15.0;
  posData[i * 4 + 1] = Math.random() * 30.0 - 15.0;
  posData[i * 4 + 2] = Math.random() * 30.0 - 15.0;
}

// Upload the positions to a DataTexture.
const texPositions = new THREE.DataTexture(
  posData,
  size,
  size,
  THREE.RGBAFormat,
  THREE.FloatType
);
texPositions.needsUpdate = true;

// Create offscreen render buffer.
const bufferPosition = new THREE.WebGLRenderTarget(size, size, {
  format: THREE.RGBAFormat,
  type: THREE.FloatType,
});

// Create offscreen draw rectangle.
const planeGeo = new THREE.PlaneGeometry(1, 1, 1, 1);

// Create offscreen scene for updating positions.
const updatePosScene = new THREE.Scene();

// Create material and mesh for updating positions.
const posVert = await fetch("./src/shaders/update.vert?v=" + Date.now()).then(r => r.text());
const posFrag = await fetch("./src/shaders/update.frag?v=" + Date.now()).then(r => r.text());
const updatePosMat = new THREE.RawShaderMaterial({
  vertexShader: posVert,
  fragmentShader: posFrag,
  uniforms: {
    uTexPositions: { value: texPositions },
    uTime: { value: 0.0 },
  },
});
const updatePosMesh = new THREE.Mesh(planeGeo, updatePosMat);
updatePosScene.add(updatePosMesh);

// Create points geometry.
const uvs = [];
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    uvs.push(x / size, y / size);
  }
}

const pointsGeo = new THREE.BufferGeometry();
pointsGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
pointsGeo.setDrawRange(0, size * size);

// Create points material.
const renderVert = await fetch("./src/shaders/render.vert?v=" + Date.now()).then(r => r.text());
const renderFrag = await fetch("./src/shaders/render.frag?v=" + Date.now()).then(r => r.text());
const pointsMat = new THREE.RawShaderMaterial({
  vertexShader: renderVert,
  fragmentShader: renderFrag,
  uniforms: {
    uTexPositions: { value: bufferPosition.texture },
    uTime: { value: 0.0 },
    uLastClickTime: { value: -999.0 }
  },
  blending: THREE.AdditiveBlending,
  depthTest: false,
  transparent: true
});

// Create and add mesh to scene.
const points = new THREE.Points(pointsGeo, pointsMat);
scene.add(points);

// Debug offscreen texture.
// const debugGeo = new THREE.PlaneGeometry(2, 2);
// const debugMat = new THREE.MeshBasicMaterial({
//   map: bufferPosition.texture
// });
// const debugMesh = new THREE.Mesh(debugGeo, debugMat);
// scene.add(debugMesh);

// Animation loop.
const clock = new THREE.Clock();
const tick = () => {
  const time = clock.getElapsedTime();
  const timeSinceClick = Math.max(0.0, time - lastClickTime);

  // Background Flash Logic
  if (timeSinceClick < 0.2) {
    // Lerp from white to black over 0.2 seconds
    const flash = 1.0 - (timeSinceClick / 0.2);
    scene.background.setRGB(flash, flash, flash);
  } else {
    // Return to pitch black default ocean bg
    scene.background.setHex(0x000000);
  }
  // Render positions to offscreen buffer.
  updatePosMat.uniforms.uTime.value = time;
  renderer.setRenderTarget(bufferPosition);
  renderer.render(updatePosScene, camera);
  renderer.setRenderTarget(null);

  // Render points onscreen.
  pointsMat.uniforms.uTime.value = time;
  pointsMat.uniforms.uLastClickTime.value = lastClickTime;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  requestAnimationFrame(tick);
};
tick();

// Window resize listener.
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
