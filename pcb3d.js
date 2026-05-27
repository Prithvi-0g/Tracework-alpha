/* ═══════════════════════════════════════════
   pcb3d.js — Three.js interactive PCB hero
   TraceWorks Alpha · r128
═══════════════════════════════════════════ */
(function () {
  'use strict';

  const container = document.getElementById('pcb-container');
  if (!container || typeof THREE === 'undefined') return;

  /* ── Scene ── */
  const scene = new THREE.Scene();

  /* ── Camera ── */
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 12;

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  /* ── Lighting ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x6633ff, 0.5);
  fillLight.position.set(-5, -5, 5);
  scene.add(fillLight);

  const greenGlow = new THREE.PointLight(0x22c55e, 1.4, 20);
  greenGlow.position.set(-2, 2, 3);
  scene.add(greenGlow);

  /* ── Shared materials ── */
  const M = {
    board:  new THREE.MeshStandardMaterial({ color: 0x0a5c36, roughness: 0.25, metalness: 0.1 }),
    gold:   new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3,  metalness: 0.8 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.1,  metalness: 0.9 }),
    chip:   new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5,  metalness: 0.1 }),
    hole:   new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9  }),
  };

  /* ── PCB group ── */
  const pcbGroup = new THREE.Group();

  /* Board substrate */
  const board = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 0.15), M.board);
  board.receiveShadow = true;
  board.castShadow   = true;
  pcbGroup.add(board);

  /* ── Helpers ── */
  function trace(x, y, len, horiz) {
    if (horiz === undefined) horiz = true;
    var geo = horiz
      ? new THREE.BoxGeometry(len, 0.04, 0.01)
      : new THREE.BoxGeometry(0.04, len, 0.01);
    var m = new THREE.Mesh(geo, M.gold);
    m.position.set(x, y, 0.08);
    pcbGroup.add(m);
  }

  function chip(w, h, d, x, y, pins) {
    var body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.chip);
    body.position.set(x, y, 0.075 + d / 2);
    body.castShadow = true;
    pcbGroup.add(body);
    var spacing = h / (pins / 2 + 1);
    for (var i = 1; i <= pins / 2; i++) {
      var py = y - h / 2 + i * spacing;
      [-1, 1].forEach(function (s) {
        var pin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.02), M.silver);
        pin.position.set(x + s * (w / 2 + 0.03), py, 0.08);
        pcbGroup.add(pin);
      });
    }
  }

  function smd(x, y, color) {
    var mat  = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.08), mat);
    body.position.set(x, y, 0.115);
    pcbGroup.add(body);
    [-1, 1].forEach(function (s) {
      var cap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.11, 0.09), M.silver);
      cap.position.set(x + s * 0.09, y, 0.115);
      pcbGroup.add(cap);
    });
  }

  function mountHole(x, y) {
    var barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.18, 16), M.hole);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(x, y, 0);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 24), M.gold);
    ring.position.set(x, y, 0.085);
    pcbGroup.add(barrel, ring);
  }

  /* ── Component layout ── */
  chip(1.2, 1.2, 0.22, -1.2,  0.5, 12);   // main MCU
  chip(0.8, 1.4, 0.15,  1.5, -0.6, 16);   // flash memory
  chip(0.6, 0.6, 0.14,  1.5,  1.0,  8);   // power reg

  smd(-1.2, -1.0, 0x0044cc);
  smd(-0.7, -1.0, 0xcc1111);
  smd( 1.5,  1.6, 0x222222);
  smd(-1.9,  0.2, 0x7c3aed);
  smd(-1.9, -0.3, 0x333333);
  smd( 0.2, -1.0, 0xdd8800);

  trace(-1.2, -0.38, 1.6, false);
  trace( 0.2,  0.5,  1.5);
  trace( 1.0,  0.5,  0.8, false);
  trace( 0.5, -0.6,  1.0);
  trace(-2.0,  0.5,  0.8);
  trace( 0.5,  1.2,  1.4);
  trace(-0.5, -1.0,  1.0);
  trace(-0.3,  1.5,  2.2);
  trace( 1.5,  0.2,  0.6, false);

  /* Edge connector gold pads */
  for (var i = -2.5; i <= 2.5; i += 0.15) {
    var pad = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.01), M.gold);
    pad.position.set(i, -1.76, 0.08);
    pcbGroup.add(pad);
  }

  /* Mounting holes */
  mountHole(-2.7,  1.7);
  mountHole( 2.7,  1.7);
  mountHole(-2.7, -1.7);
  mountHole( 2.7, -1.7);

  /* Default resting tilt */
  pcbGroup.rotation.x =  0.5;
  pcbGroup.rotation.y = -0.6;
  scene.add(pcbGroup);

  /* ── Mouse parallax ── */
  var mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', function (e) {
    mouseX =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });
  window.addEventListener('mouseleave', function () {
    mouseX = 0; mouseY = 0;
  });

  /* ── Animation loop ── */
  var clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    var baseY = -0.6 + Math.sin(t * 0.5) * 0.1;
    var baseX =  0.5 + Math.cos(t * 0.3) * 0.05;

    pcbGroup.rotation.y += (baseY + mouseX * 0.4 - pcbGroup.rotation.y) * 0.05;
    pcbGroup.rotation.x += (baseX + mouseY * 0.3 - pcbGroup.rotation.x) * 0.05;

    greenGlow.intensity = 1.2 + Math.sin(t * 2.2) * 0.3;

    renderer.render(scene, camera);
  })();

  /* ── Resize ── */
  window.addEventListener('resize', function () {
    if (!container.clientWidth) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }, { passive: true });
})();
