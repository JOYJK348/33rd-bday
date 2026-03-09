/**
 * galaxy.js — Three.js Star Particle System (v2)
 *
 * KEY UPGRADES:
 *  - Stars continuously drift toward camera (z-axis) → real fly-through feeling
 *  - 3 layers with different speeds → true depth parallax
 *  - During burst: z-speed spikes → warp effect (stars stretch via size)
 *  - Mouse tilt: rotates whole scene for organic depth feel
 *  - Subtle camera bob (sin wave y offset) → breathing universe feel
 *  - Stars wrap around when they pass camera → seamless infinite tunnel
 */
import * as THREE from 'three';

/* ---------- Shaders ---------- */
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uWarp;     // 0 = normal, 1 = warp (stretch stars)
  uniform float uPull;     // burst pull toward camera

  attribute float aSize;
  attribute float aOpacity;
  attribute float aPhase;

  varying float vOpacity;
  varying float vWarp;

  void main() {
    vec3 pos = position;

    // During burst pull, push stars toward viewer on z
    pos.z += uPull * 20.0;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Warp: stars further from center get bigger (speed-line illusion)
    float dist = length(pos.xy);
    float warpBoost = 1.0 + uWarp * dist * 0.3;
    float size = aSize * uPixelRatio * (200.0 / -mvPos.z) * warpBoost;
    gl_PointSize = clamp(size, 0.5, 60.0);

    // Twinkle
    float twinkle = sin(uTime * (1.0 + aPhase * 2.5) + aPhase * 6.2831) * 0.35 + 0.65;
    vOpacity = aOpacity * twinkle;
    vWarp = uWarp;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vOpacity;
  varying float vWarp;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    // During warp: elongate star into streak along y-axis
    float streakMask = 1.0;
    if (vWarp > 0.01) {
      float streak = length(vec2(uv.x * 3.0, uv.y));
      streakMask = 1.0 - smoothstep(0.0, 0.5, streak);
    } else {
      streakMask = 1.0 - smoothstep(0.0, 0.5, d);
    }

    float alpha = pow(streakMask, 1.3) * vOpacity;

    // White hot core
    float core = 1.0 - smoothstep(0.0, 0.1, d);
    vec3 color = mix(uColor, vec3(1.0), core * 0.7);

    gl_FragColor = vec4(color, alpha);
  }
`;

/* ---------- Galaxy ---------- */
export default class Galaxy {
    constructor(container) {
        this.container = container;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 500
        );
        this.camera.position.z = 5;

        // Mobile performance check
        const isMobile = window.innerWidth < 768;
        this.pr = isMobile ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2);
        const pr = this.pr;
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
        });
        this.renderer.setPixelRatio(pr);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        this.layers = [];
        this.clock = new THREE.Clock();
        this.mouse = { x: 0, y: 0 };
        this.targetRot = { x: 0, y: 0 };
        this.scrollProgress = 0;

        // Flight control
        this.warpValue = 0;   // 0→1 during burst
        this.pullValue = 0;   // burst particle pull

        // Camera bob
        this._bobTime = 0;

        this.disposed = false;
        this._createLayers();
        this._bindResize();
        this._animate();
    }

    /* ────────── Layer Configs ────────── */
    _createLayers() {
        /**
         * Each layer:
         *  - spread: XY spread area
         *  - depth: Z spread (how deep the tunnel is)
         *  - zSpeed: how fast they drift toward camera (per second)
         *  - color, count, sizes
         */
        const isMobile = window.innerWidth < 768;
        const configs = [
            {
                count: isMobile ? 300 : 500,
                minSize: 1.0, maxSize: 2.2,
                spread: 120, depth: 200,
                color: 0xa08cc8,
                zSpeed: 0.8,    // gentle far drift
                parallaxMult: 0.3,
            },
            {
                count: isMobile ? 180 : 280,
                minSize: 1.8, maxSize: 3.5,
                spread: 70, depth: 120,
                color: 0xc8a0f0,
                zSpeed: 1.8,    // mid layer
                parallaxMult: 1.0,
            },
            {
                count: isMobile ? 60 : 100,
                minSize: 2.5, maxSize: 5.5,
                spread: 40, depth: 50,
                color: 0xf0e0ff,
                zSpeed: 3.5,    // near layer — noticeable but not rushing
                parallaxMult: 2.5,
            },
        ];

        configs.forEach(cfg => {
            const count = cfg.count;
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array(count * 3);
            const sizes = new Float32Array(count);
            const opacities = new Float32Array(count);
            const phases = new Float32Array(count);

            for (let i = 0; i < count; i++) {
                pos[i * 3] = (Math.random() - 0.5) * cfg.spread;
                pos[i * 3 + 1] = (Math.random() - 0.5) * cfg.spread;
                // Distribute z BEHIND camera (negative = behind in THREE, but we want in front)
                // Camera is at z=5, stars are at z = 5 - depth...5+0
                pos[i * 3 + 2] = this.camera.position.z - Math.random() * cfg.depth;
                sizes[i] = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
                opacities[i] = 0.25 + Math.random() * 0.75;
                phases[i] = Math.random();
            }

            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
            geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
            geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

            const mat = new THREE.ShaderMaterial({
                uniforms: {
                    uColor: { value: new THREE.Color(cfg.color) },
                    uTime: { value: 0 },
                    uPixelRatio: { value: this.pr },
                    uWarp: { value: 0 },
                    uPull: { value: 0 },
                },
                vertexShader,
                fragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });

            const points = new THREE.Points(geo, mat);
            this.scene.add(points);
            this.layers.push({
                points,
                mat,
                geo,
                pos,         // reference to the typed array for z-updates
                cfg,
                zSpeed: cfg.zSpeed,
            });
        });
    }

    /* ────────── Controls ────────── */
    setMouse(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
    }

    setScroll(progress) {
        this.scrollProgress = progress;
    }

    // Called by scene1.js during burst
    setWarp(v) {
        this.warpValue = v;
        this.layers.forEach(l => {
            l.mat.uniforms.uWarp.value = v;
        });
    }

    setBurst(v) {
        this.pullValue = v;
        this.layers.forEach(l => {
            l.mat.uniforms.uPull.value = v;
        });
    }

    /* ────────── Z-drift: stars fly toward camera ────────── */
    _updateZDrift(delta) {
        // Speed during warp = 5x. Scroll also boosts speed slightly.
        const warpMult = 1 + this.warpValue * 8;
        const scrollBoost = 1 + this.scrollProgress * 0.5;

        this.layers.forEach(l => {
            const posAttr = l.geo.attributes.position;
            const arr = posAttr.array;
            const speed = l.zSpeed * warpMult * scrollBoost * delta;

            for (let i = 0; i < posAttr.count; i++) {
                arr[i * 3 + 2] += speed;

                // When star passes camera (z > camZ), wrap it far back
                // Also randomize XY so same star doesn't repeat in same position
                if (arr[i * 3 + 2] > this.camera.position.z + 1) {
                    arr[i * 3 + 2] -= l.cfg.depth;
                    arr[i * 3] = (Math.random() - 0.5) * l.cfg.spread;
                    arr[i * 3 + 1] = (Math.random() - 0.5) * l.cfg.spread;
                }
            }
            posAttr.needsUpdate = true;
        });
    }

    /* ────────── Resize ────────── */
    _bindResize() {
        const onResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);
        this._onResize = onResize;
    }

    /* ────────── Render Loop ────────── */
    _animate() {
        if (this.disposed) return;
        requestAnimationFrame(() => this._animate());

        // Performance: Cap mobile background at 30fps to save GPU for overlays
        const isMobile = window.innerWidth < 768;
        const now = performance.now();
        if (isMobile) {
            if (this._lastFrameTime && now - this._lastFrameTime < 33) return;
            this._lastFrameTime = now;
        }

        const elapsed = this.clock.getElapsedTime();
        const delta = this.clock.getDelta ? this.clock.getDelta() : 0.016;

        // Use a simple elapsed diff instead since getDelta clears
        if (!this._lastElapsed) this._lastElapsed = elapsed;
        const dt = Math.min(elapsed - this._lastElapsed, 0.05); // cap at 50ms
        this._lastElapsed = elapsed;

        // time uniforms
        this.layers.forEach(l => {
            l.mat.uniforms.uTime.value = elapsed;
        });

        // Z-drift — stars flying toward camera
        this._updateZDrift(dt);

        // Slow clockwise scene rotation
        this.scene.rotation.z -= 0.00005;

        // Camera bob — gentle vertical sine (3D depth feel)
        this._bobTime += dt * 0.3;
        this.camera.position.y = Math.sin(this._bobTime) * 0.3;
        this.camera.position.x = Math.cos(this._bobTime * 0.7) * 0.2;

        // Mouse parallax tilt (lerped)
        this.targetRot.x += (this.mouse.y * 0.18 - this.targetRot.x) * 0.04;
        this.targetRot.y += (this.mouse.x * 0.18 - this.targetRot.y) * 0.04;
        this.scene.rotation.x = this.targetRot.x;
        this.scene.rotation.y = this.targetRot.y;

        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.disposed = true;
        window.removeEventListener('resize', this._onResize);
        this.layers.forEach(l => {
            l.geo.dispose();
            l.mat.dispose();
        });
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}
