/**
 * KAV Performance & Marketing Digital
 * Interactive 3D Journey Engine (Three.js with Canvas Fallback)
 * 
 * Stages:
 * 1: Estruturação & Análise de Mercado (Radar & Grid Scanner)
 * 2: Núcleo HyperKav (Quantum Data Core & Particle Swarm)
 * 3: Escalada Gradual de Crescimento (Exponential Helix & Ascending Milestone Vectors)
 */

class KAV3DExperience {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.currentStage = 1;
    this.targetStage = 1;
    this.autoRotate = true;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.userRotation = { x: 0, y: 0 };
    this.targetUserRotation = { x: 0, y: 0 };

    this.stageColors = {
      1: { primary: 0x00f0ff, secondary: 0x0070f3, bgGlow: '#00f0ff' },
      2: { primary: 0x9d4edd, secondary: 0xff0080, bgGlow: '#7928ca' },
      3: { primary: 0x00df89, secondary: 0x00f0ff, bgGlow: '#00df89' }
    };

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded from CDN, initializing Canvas 2D fallback');
      this.initCanvasFallback();
      return;
    }

    try {
      this.setupThreeScene();
      this.createStages();
      this.setupEvents();
      this.animate();
      this.updateStatusText();
    } catch (e) {
      console.error('Error initializing WebGL:', e);
      this.initCanvasFallback();
    }
  }

  setupThreeScene() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 440;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x06090e, 0.025);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.cameraDefaultPos = new THREE.Vector3(0, 4, 18);
    this.camera.position.copy(this.cameraDefaultPos);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x06090e, 0);
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(this.ambientLight);

    this.pointLight1 = new THREE.PointLight(0x00f0ff, 2.5, 50);
    this.pointLight1.position.set(10, 10, 10);
    this.scene.add(this.pointLight1);

    this.pointLight2 = new THREE.PointLight(0x7928ca, 2.0, 50);
    this.pointLight2.position.set(-10, -5, 10);
    this.scene.add(this.pointLight2);

    // Master Group for All Stages
    this.masterGroup = new THREE.Group();
    this.scene.add(this.masterGroup);
  }

  createStages() {
    // ----------------------------------------------------
    // STAGE 1: Estruturação & Análise de Mercado (Wireframe Grid + Scanner Radar)
    // ----------------------------------------------------
    this.stage1Group = new THREE.Group();
    this.stage1Group.name = "Stage1_MarketAnalysis";

    // 1.1 Wireframe Scanning Terrain Grid
    const gridGeometry = new THREE.PlaneGeometry(24, 24, 20, 20);
    gridGeometry.rotateX(-Math.PI / 2);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.terrainGrid = new THREE.Mesh(gridGeometry, gridMaterial);
    this.terrainGrid.position.y = -2;
    this.stage1Group.add(this.terrainGrid);

    // 1.2 Radar Sweep Scanner Disc
    const radarGeo = new THREE.RingGeometry(0.1, 7, 32);
    radarGeo.rotateX(-Math.PI / 2);
    const radarMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15
    });
    this.radarDisc = new THREE.Mesh(radarGeo, radarMat);
    this.radarDisc.position.y = -1.9;
    this.stage1Group.add(this.radarDisc);

    // 1.3 Scanning Radar Needle Line
    const needlePoints = [new THREE.Vector3(0, -1.88, 0), new THREE.Vector3(7, -1.88, 0)];
    const needleGeo = new THREE.BufferGeometry().setFromPoints(needlePoints);
    const needleMat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    this.radarNeedle = new THREE.Line(needleGeo, needleMat);
    this.stage1Group.add(this.radarNeedle);

    // 1.4 Floating Market Opportunity Nodes
    this.marketNodes = [];
    const nodeGeo = new THREE.OctahedronGeometry(0.35);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00a3ff,
      roughness: 0.2,
      metalness: 0.8
    });

    const nodePositions = [
      { x: -3.5, y: 0.5, z: 2 },
      { x: 3.2, y: 1.2, z: -1 },
      { x: -1.8, y: -0.2, z: -3 },
      { x: 2.5, y: -0.5, z: 2.5 },
      { x: 0, y: 2.2, z: 0 }
    ];

    nodePositions.forEach((pos) => {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(pos.x, pos.y, pos.z);
      this.stage1Group.add(node);
      this.marketNodes.push(node);
    });

    this.masterGroup.add(this.stage1Group);

    // ----------------------------------------------------
    // STAGE 2: Núcleo HyperKav (Quantum Data Core & Concentric Rings)
    // ----------------------------------------------------
    this.stage2Group = new THREE.Group();
    this.stage2Group.name = "Stage2_HyperKavCore";

    // 2.1 The Central Quantum Core (Icosahedron Wireframe + Inner Glow)
    const coreOuterGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const coreOuterMat = new THREE.MeshStandardMaterial({
      color: 0x9d4edd,
      wireframe: true,
      emissive: 0x5a189a,
      emissiveIntensity: 0.8
    });
    this.hyperCoreOuter = new THREE.Mesh(coreOuterGeo, coreOuterMat);
    this.stage2Group.add(this.hyperCoreOuter);

    const coreInnerGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const coreInnerMat = new THREE.MeshStandardMaterial({
      color: 0xff0080,
      emissive: 0xff0055,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.9
    });
    this.hyperCoreInner = new THREE.Mesh(coreInnerGeo, coreInnerMat);
    this.stage2Group.add(this.hyperCoreInner);

    // 2.2 Concentric Data Orbital Rings
    this.hyperRings = [];
    const ringRadii = [3.4, 4.2, 5.0];
    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.TorusGeometry(r, 0.05, 12, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 1 ? 0x00f0ff : 0x7928ca,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / (2 + idx);
      ring.rotation.y = idx * 0.8;
      this.stage2Group.add(ring);
      this.hyperRings.push(ring);
    });

    // 2.3 Hyper Data Swarm Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 2.8 + Math.random() * 3.5;
      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.14,
      transparent: true,
      opacity: 0.85
    });
    this.hyperParticles = new THREE.Points(particleGeo, particleMat);
    this.stage2Group.add(this.hyperParticles);

    this.masterGroup.add(this.stage2Group);

    // ----------------------------------------------------
    // STAGE 3: Escalada & Crescimento (Exponential Growth Trajectory)
    // ----------------------------------------------------
    this.stage3Group = new THREE.Group();
    this.stage3Group.name = "Stage3_GrowthScale";

    // 3.1 Ascending Stepped Milestone Platforms (Hexagonal Pillars)
    this.growthPillars = [];
    const pillarHeights = [1.2, 2.2, 3.4, 4.8, 6.4];
    pillarHeights.forEach((h, i) => {
      const geo = new THREE.CylinderGeometry(0.8, 0.8, h, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00df89,
        wireframe: false,
        emissive: 0x007a4b,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8
      });
      const pillar = new THREE.Mesh(geo, mat);
      pillar.position.set((i - 2) * 2.2, h / 2 - 3, (2 - i) * 1.0);
      this.stage3Group.add(pillar);
      this.growthPillars.push(pillar);
    });

    // 3.2 Ascending Exponential Trajectory Line
    const curvePoints = [];
    for (let t = 0; t <= 1; t += 0.05) {
      const x = (t * 10) - 5;
      const y = Math.pow(t, 2.2) * 8 - 2.5;
      const z = - (t * 5) + 2.5;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const trajectoryCurve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(trajectoryCurve, 40, 0.12, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9
    });
    this.growthTrajectory = new THREE.Mesh(tubeGeo, tubeMat);
    this.stage3Group.add(this.growthTrajectory);

    // 3.3 Pulsing Velocity Rings along Curve
    this.velocityRings = [];
    [0.2, 0.5, 0.8, 1.0].forEach((t) => {
      const pt = trajectoryCurve.getPoint(t);
      const ringGeo = new THREE.TorusGeometry(0.6, 0.06, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00df89, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pt);
      ring.lookAt(trajectoryCurve.getPoint(Math.min(1, t + 0.05)));
      this.stage3Group.add(ring);
      this.velocityRings.push(ring);
    });

    this.masterGroup.add(this.stage3Group);

    // Set initial visibility
    this.setStage(1, true);
  }

  setStage(stageNum, immediate = false) {
    this.targetStage = stageNum;
    this.currentStage = stageNum;

    // Adjust target positions & opacities
    const duration = immediate ? 0 : 1;

    // Stage 1
    this.stage1Group.visible = true;
    this.stage2Group.visible = true;
    this.stage3Group.visible = true;

    if (stageNum === 1) {
      this.targetMasterPos = new THREE.Vector3(0, 0, 0);
      this.targetStageScales = { s1: 1, s2: 0.01, s3: 0.01 };
      this.pointLight1.color.setHex(0x00f0ff);
      this.pointLight2.color.setHex(0x0070f3);
    } else if (stageNum === 2) {
      this.targetMasterPos = new THREE.Vector3(0, 0, 0);
      this.targetStageScales = { s1: 0.01, s2: 1.1, s3: 0.01 };
      this.pointLight1.color.setHex(0x9d4edd);
      this.pointLight2.color.setHex(0xff0080);
    } else if (stageNum === 3) {
      this.targetMasterPos = new THREE.Vector3(0, 0, 0);
      this.targetStageScales = { s1: 0.01, s2: 0.01, s3: 1 };
      this.pointLight1.color.setHex(0x00df89);
      this.pointLight2.color.setHex(0x00f0ff);
    }

    if (immediate) {
      this.stage1Group.scale.setScalar(this.targetStageScales.s1);
      this.stage2Group.scale.setScalar(this.targetStageScales.s2);
      this.stage3Group.scale.setScalar(this.targetStageScales.s3);
    }

    this.updateStatusText();
  }

  updateStatusText() {
    const statusEl = document.getElementById('canvasStatusText');
    if (!statusEl) return;

    const titles = {
      1: 'Ambiente 3D: Etapa 1 • Estruturação & Mercado',
      2: 'Ambiente 3D: Etapa 2 • Núcleo HyperKav (Dados)',
      3: 'Ambiente 3D: Etapa 3 • Escalada de Crescimento'
    };
    statusEl.textContent = titles[this.currentStage] || 'Ambiente 3D Ativo';
  }

  setupEvents() {
    // Resize Handler
    window.addEventListener('resize', () => {
      if (!this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight || 440;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // Mouse Drag Rotation
    const onMouseDown = (e) => {
      this.isDragging = true;
      this.previousMousePosition = {
        x: e.clientX || (e.touches && e.touches[0].clientX),
        y: e.clientY || (e.touches && e.touches[0].clientY)
      };
    };

    const onMouseMove = (e) => {
      if (!this.isDragging) return;
      const currentX = e.clientX || (e.touches && e.touches[0].clientX);
      const currentY = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaX = currentX - this.previousMousePosition.x;
      const deltaY = currentY - this.previousMousePosition.y;

      this.targetUserRotation.y += deltaX * 0.006;
      this.targetUserRotation.x += deltaY * 0.006;

      // Clamp vertical rotation
      this.targetUserRotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, this.targetUserRotation.x));

      this.previousMousePosition = { x: currentX, y: currentY };
    };

    const onMouseUp = () => {
      this.isDragging = false;
    };

    this.container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    this.container.addEventListener('touchstart', onMouseDown, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // Auto-rotate toggle button
    const autoBtn = document.getElementById('toggleAutoRotate');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        this.autoRotate = !this.autoRotate;
        autoBtn.classList.toggle('active', this.autoRotate);
      });
    }

    // Reset camera button
    const resetBtn = document.getElementById('resetViewBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.targetUserRotation = { x: 0, y: 0 };
        this.camera.position.copy(this.cameraDefaultPos);
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // Smooth stage scaling transition (Lerp)
    if (this.targetStageScales) {
      const lerpFactor = 0.08;
      const curS1 = this.stage1Group.scale.x;
      const curS2 = this.stage2Group.scale.x;
      const curS3 = this.stage3Group.scale.x;

      this.stage1Group.scale.setScalar(curS1 + (this.targetStageScales.s1 - curS1) * lerpFactor);
      this.stage2Group.scale.setScalar(curS2 + (this.targetStageScales.s2 - curS2) * lerpFactor);
      this.stage3Group.scale.setScalar(curS3 + (this.targetStageScales.s3 - curS3) * lerpFactor);
    }

    // Rotate elements in Stage 1
    if (this.stage1Group.scale.x > 0.05) {
      if (this.radarNeedle) this.radarNeedle.rotation.y = time * 1.5;
      if (this.radarDisc) this.radarDisc.rotation.z = -time * 0.2;
      this.marketNodes.forEach((node, i) => {
        node.position.y += Math.sin(time * 2 + i) * 0.003;
        node.rotation.x = time * 0.8;
        node.rotation.y = time * 1.2;
      });
    }

    // Rotate elements in Stage 2 (HyperKav)
    if (this.stage2Group.scale.x > 0.05) {
      if (this.hyperCoreOuter) {
        this.hyperCoreOuter.rotation.x = time * 0.4;
        this.hyperCoreOuter.rotation.y = time * 0.6;
      }
      if (this.hyperCoreInner) {
        const pulse = 1.0 + Math.sin(time * 4) * 0.12;
        this.hyperCoreInner.scale.setScalar(pulse);
      }
      this.hyperRings.forEach((ring, idx) => {
        ring.rotation.x += 0.008 * (idx % 2 === 0 ? 1 : -1);
        ring.rotation.y += 0.012 * (idx + 1);
      });
      if (this.hyperParticles) {
        this.hyperParticles.rotation.y = -time * 0.3;
      }
    }

    // Rotate/Animate elements in Stage 3 (Escalada)
    if (this.stage3Group.scale.x > 0.05) {
      this.velocityRings.forEach((r, idx) => {
        const s = 1.0 + Math.sin(time * 3 + idx) * 0.2;
        r.scale.setScalar(s);
      });
      this.growthPillars.forEach((p, idx) => {
        p.position.y += Math.sin(time * 1.5 + idx) * 0.002;
      });
    }

    // User drag rotation lerp
    this.userRotation.x += (this.targetUserRotation.x - this.userRotation.x) * 0.08;
    this.userRotation.y += (this.targetUserRotation.y - this.userRotation.y) * 0.08;

    // Master rotation
    if (this.autoRotate && !this.isDragging) {
      this.masterGroup.rotation.y += 0.004;
    }
    this.masterGroup.rotation.x = this.userRotation.x;
    this.masterGroup.rotation.y += (this.userRotation.y * 0.02);

    this.renderer.render(this.scene, this.camera);
  }

  // Fallback 2D Canvas for environments without WebGL or if Three fails to load
  initCanvasFallback() {
    this.container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = this.container.clientWidth;
    canvas.height = this.container.clientHeight || 440;
    this.container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let angle = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      angle += 0.02;

      // Draw background cyber grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Draw 3D Core representation
      ctx.save();
      ctx.translate(cx, cy);

      if (this.currentStage === 1) {
        // Radar scanner
        ctx.strokeStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * 100, Math.sin(angle) * 100);
        ctx.stroke();
      } else if (this.currentStage === 2) {
        // HyperKav Core
        ctx.strokeStyle = '#9d4edd';
        ctx.beginPath();
        ctx.arc(0, 0, 70 + Math.sin(angle * 2) * 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ff0080';
        ctx.strokeRect(-40, -40, 80, 80);
      } else {
        // Growth trajectory
        ctx.strokeStyle = '#00df89';
        ctx.beginPath();
        ctx.moveTo(-100, 60);
        ctx.quadraticCurveTo(0, 30, 100, -80);
        ctx.stroke();
      }

      ctx.restore();
      requestAnimationFrame(render);
    };
    render();
  }
}

// Attach to window
window.KAV3DExperience = KAV3DExperience;
