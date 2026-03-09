/**
 * scene1.js — CINEMATIC HOOK (v3)
 *
 * FIXES:
 *  - Burst no longer kills the screen. Stars stay visible throughout.
 *  - Burst = warp-speed stars + small centered bloom + expanding ring ripple
 *  - Galaxy new galaxy.js handles z-drift 3D depth automatically
 */
import gsap from 'gsap';

const $ = (sel) => document.querySelector(sel);

/* ============================================================
   WORD SPLITTER
   ============================================================ */
function splitWords(id) {
    const el = document.getElementById(id);
    if (!el) return [];

    // Safety: If already split, restore to ensure we have valid text
    const words = el.querySelectorAll('.word');
    if (words.length > 0) {
        const combined = Array.from(words).map(w => w.textContent.trim()).join(' ');
        el.textContent = combined;
    }

    const text = el.textContent.trim();
    if (!text) return [];

    el.textContent = '';
    el.style.opacity = '1';
    text.split(/\s+/).forEach(word => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word + '\u00A0';
        el.appendChild(span);
    });
    return el.querySelectorAll('.word');
}

/* ============================================================
   ORBIT STARS
   ============================================================ */
function createOrbitStars() {
    const ring = document.getElementById('orbit-ring');
    for (let i = 0; i < 12; i++) {
        const star = document.createElement('div');
        star.className = 'orbit-star';
        const size = 3 + Math.random() * 4;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--radius', `${90 + Math.random() * 80}px`);
        star.style.setProperty('--duration', `${5 + Math.random() * 5}s`);
        star.style.setProperty('--delay', `-${Math.random() * 8}s`);
        star.style.setProperty('--scale', `${0.5 + Math.random()}`);
        star.style.boxShadow = `0 0 ${size * 2}px ${size}px rgba(168,85,247,0.5)`;
        ring.appendChild(star);
    }
}

/* ============================================================
   SHOOTING STARS
   ============================================================ */
function spawnShootingStar() {
    const container = document.getElementById('shooting-stars');
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = `${15 + Math.random() * 50}%`;
    star.style.top = `${5 + Math.random() * 40}%`;
    star.style.setProperty('--angle', `${-25 - Math.random() * 35}deg`);
    star.style.setProperty('--duration', `${0.6 + Math.random() * 0.5}s`);
    container.appendChild(star);
    star.addEventListener('animationend', () => star.remove());
}

/* ============================================================
   STAR FORMATION — Canvas API "33" with comet trails
   ============================================================ */
class StarFormation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.progress = 0;
        this._glow = this._createGlowTexture();
    }

    _createGlowTexture() {
        const c = document.createElement('canvas');
        c.width = c.height = 48;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(24, 24, 0, 24, 24, 24);
        g.addColorStop(0, 'rgba(240, 230, 255, 1)');
        g.addColorStop(0.15, 'rgba(212, 165, 255, 0.9)');
        g.addColorStop(0.4, 'rgba(168, 85, 247, 0.4)');
        g.addColorStop(1, 'rgba(124, 58, 237, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 48, 48);
        return c;
    }

    _sampleTargets(text, count) {
        const tmp = document.createElement('canvas');
        tmp.width = 400; tmp.height = 200;
        const ctx = tmp.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 140px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 200, 100);
        const data = ctx.getImageData(0, 0, 400, 200).data;
        const pts = [];
        for (let y = 0; y < 200; y += 4) {
            for (let x = 0; x < 400; x += 4) {
                // Check if red or alpha is present (white text on transparent)
                if (data[(y * 400 + x) * 4] > 120 || data[(y * 400 + x) * 4 + 3] > 120) {
                    pts.push({ x, y });
                }
            }
        }

        if (pts.length === 0) return []; // Sampling failed (maybe font not ready)

        const out = [];
        const targetCount = Math.min(count, pts.length);
        for (let i = 0; i < targetCount; i++) {
            const idx = Math.floor(Math.random() * pts.length);
            out.push(pts.splice(idx, 1)[0]);
        }
        return out;
    }

    init() {
        if (this.particles.length > 0) return true; // Already sampled

        const dpr = Math.min(window.devicePixelRatio, 2);
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width === 0) return false;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.w = rect.width;
        this.h = rect.height;

        const targets = this._sampleTargets('33', 130);
        if (targets.length === 0) return false;

        const sx = this.w / 400;
        const sy = this.h / 200;

        this.particles = targets.map(t => {
            const angle = Math.random() * Math.PI * 2;
            const dist = 300 + Math.random() * 200;
            return {
                sx: this.w / 2 + Math.cos(angle) * dist,
                sy: this.h / 2 + Math.sin(angle) * dist,
                tx: t.x * sx, ty: t.y * sy,
                size: 2 + Math.random() * 4,
                trail: [],
            };
        });
        return true;
    }

    setProgress(p) { this.progress = p; this._draw(); }
    dissolve(alpha) { this._draw(alpha); }

    _draw(overrideAlpha) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.w, this.h);
        const p = this.progress;
        const ep = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

        this.particles.forEach(pt => {
            const x = pt.sx + (pt.tx - pt.sx) * ep;
            const y = pt.sy + (pt.ty - pt.sy) * ep;
            if (p < 1) { pt.trail.push({ x, y }); if (pt.trail.length > 8) pt.trail.shift(); }

            const alpha = overrideAlpha !== undefined ? overrideAlpha : Math.min(p * 3, 1);

            if (p < 1 && p > 0.05) {
                pt.trail.forEach((tp, ti) => {
                    ctx.globalAlpha = (ti / pt.trail.length) * alpha * 0.3;
                    const ts = pt.size * 0.5;
                    ctx.drawImage(this._glow, tp.x - 24, tp.y - 24, 48 * (ts / 3), 48 * (ts / 3));
                });
            }
            ctx.globalAlpha = alpha;
            ctx.drawImage(this._glow, x - 24, y - 24, 48, 48);
        });
        ctx.globalAlpha = 1;
    }
}

/* ============================================================
   SCENE 1 — CINEMATIC TIMELINE
   ============================================================ */
export default class Scene1 {
    constructor(galaxy) {
        this.galaxy = galaxy;
        this.formation = new StarFormation($('#formation-canvas'));
        this.started = false;
    }

    _spawnSparkles() {
        const ring = document.getElementById('sparkle-ring');
        const display = document.getElementById('number-display');
        const dw = display.offsetWidth || 480;
        const dh = display.offsetHeight || 260;
        const rw = dw + 120, rh = dh + 120;
        const cx = rw / 2, cy = rh / 2;
        const rx = dw / 2 + 40, ry = dh / 2 + 30;

        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const rf = 0.75 + Math.random() * 0.5;
            const x = cx + Math.cos(angle) * rx * rf;
            const y = cy + Math.sin(angle) * ry * rf;
            const size = 3 + Math.random() * 5;
            const hue = 260 + Math.random() * 60;
            const sat = 50 + Math.random() * 50;

            const spark = document.createElement('div');
            spark.className = 'sparkle';
            spark.style.width = `${size}px`;
            spark.style.height = `${size}px`;
            spark.style.left = `${x}px`;
            spark.style.top = `${y}px`;
            spark.style.setProperty('--sdur', `${1.5 + Math.random() * 2}s`);
            spark.style.setProperty('--sdel', `-${Math.random() * 2}s`);
            spark.style.background = `hsl(${hue}, ${sat}%, 85%)`;
            spark.style.boxShadow = `0 0 ${size * 2}px ${size}px hsla(${hue}, 80%, 70%, 0.6)`;
            ring.appendChild(spark);
        }
    }

    async start() {
        if (this.started) return;
        this.started = true;

        // Ensure fonts are parsed so canvas sampling finds the text pixels
        if (document.fonts) await document.fonts.ready;

        createOrbitStars();
        this.formation.init();

        const galaxy = this.galaxy;
        const tl = gsap.timeline({ delay: 0.2 });

        /* ─── PHASE 0: FROM BLACK ─── */
        tl.to('#galaxy-canvas', { opacity: 0.35, duration: 2, ease: 'power1.inOut' });
        tl.to('#nebula-overlay', { opacity: 0.6, duration: 2.5, ease: 'power1.inOut' }, '<0.5');
        tl.to('#galaxy-canvas', { opacity: 1, duration: 1.5, ease: 'power1.in' }, '-=1');
        tl.add(() => spawnShootingStar(), '-=1.5');

        /* ─── PHASE 1: TEXT 1 — word by word ─── */
        const words1 = splitWords('text-line-1');
        tl.to(words1, {
            opacity: 1, filter: 'blur(0px)', y: 0,
            duration: 0.55, stagger: 0.13, ease: 'power2.out',
            onComplete: () => words1.forEach(w => w.classList.add('revealed')),
        }, '-=0.5');
        tl.to('#orbit-ring', { opacity: 1, duration: 1.2, ease: 'power1.in' }, '-=0.3');
        tl.add(() => spawnShootingStar(), '+=0.3');

        /* ─── PHASE 2: TEXT 2 ─── */
        const words2 = splitWords('text-line-2');
        tl.to(words2, {
            opacity: 1, filter: 'blur(0px)', y: 0,
            duration: 0.5, stagger: 0.11, ease: 'power2.out',
            onComplete: () => words2.forEach(w => w.classList.add('revealed')),
        }, '+=0.4');

        /* ─── PHASE 3: BREATH BEFORE BURST ─── */
        // Galaxy stays alive, text stays constant
        tl.to('#galaxy-canvas', { opacity: 0.75, duration: 0.4, ease: 'power2.in' }, '+=0.8');
        tl.to('#galaxy-canvas', { opacity: 0.75, duration: 0.4, ease: 'power2.in' }, '<');
        tl.to({}, { duration: 0.25 }); // held breath

        /* ─── PHASE 4: THE BURST — warp stars, ring ripple, small bloom ─── */

        // WARP: star z-speed spikes → they rush at you
        const warpObj = { v: 0 };
        tl.to(warpObj, {
            v: 1, duration: 0.3, ease: 'power3.in',
            onUpdate: () => galaxy.setWarp(warpObj.v),
        });

        // Small centered bloom (NOT full-screen white)
        tl.to('#burst-overlay', { opacity: 0.5, duration: 0.12, ease: 'power4.in' }, '<');

        // Camera shake
        tl.add(() => {
            $('#scene-1').classList.add('shake');
            setTimeout(() => $('#scene-1').classList.remove('shake'), 450);
        }, '<');

        // Burst ring ripple from center
        tl.set('#burst-ring', { opacity: 1, scale: 0.05 });
        tl.to('#burst-ring', { scale: 5, opacity: 0, duration: 1.1, ease: 'power1.out' }, '<0.05');

        // Lens flare — quick, not dominating
        tl.to('#lens-flare', { opacity: 0.6, scale: 1.0, duration: 0.18, ease: 'power2.out' }, '<');

        // Pull stars toward user
        const pullObj = { v: 0 };
        tl.to(pullObj, {
            v: 1, duration: 0.2, ease: 'power3.in',
            onUpdate: () => galaxy.setBurst(pullObj.v),
        }, '<');

        // Galaxy stays at full brightness — burst THROUGH the stars not instead
        tl.to('#galaxy-canvas', { opacity: 1, duration: 0.3, ease: 'power1.out' }, '<0.1');

        // Bloom fades fast
        tl.to('#burst-overlay', { opacity: 0, duration: 0.5, ease: 'power2.out' }, '+=0.05');

        // Warp settles
        tl.to(warpObj, {
            v: 0, duration: 1.4, ease: 'power2.out',
            onUpdate: () => galaxy.setWarp(warpObj.v),
        }, '<0.1');
        tl.to(pullObj, {
            v: 0, duration: 1.0, ease: 'power2.out',
            onUpdate: () => galaxy.setBurst(pullObj.v),
        }, '<');
        tl.to('#lens-flare', { opacity: 0, scale: 0.3, duration: 0.7, ease: 'power2.inOut' }, '<');
        tl.add(() => spawnShootingStar(), '-=0.3');

        // Orbit ring settles
        tl.to('#orbit-ring', {
            opacity: 0.4, duration: 0.8, ease: 'power1.inOut',
        }, '-=0.8');

        /* ─── PHASE 5: "33" FORMATION ─── */
        tl.set('#number-display', { opacity: 1 });
        tl.add(() => {
            // Attempt to init formation. If it fails (pixel sampling 0), retry once
            const ok = this.formation.init();
            if (!ok) {
                console.warn("Formation init failed (pixels 0), retrying in 250ms...");
                setTimeout(() => this.formation.init(), 250);
            }
            this._spawnSparkles();
        });

        const formObj = { p: 0 };
        tl.to(formObj, {
            p: 1, duration: 2.2, ease: 'power3.inOut',
            onUpdate: () => this.formation.setProgress(formObj.p),
        }, '+=0.2');

        // Impact moment: shockwave + glow + "33" blast in
        tl.set('#shockwave', { opacity: 1, scale: 0.1 });
        tl.to('#shockwave', { scale: 9, opacity: 0, duration: 1.0, ease: 'power2.out' }, '+=0');
        tl.to('#number-33-glow', { opacity: 1, duration: 0.5, ease: 'power3.out' }, '<');
        tl.to('#number-33', {
            opacity: 1, scale: 1.12, filter: 'blur(0px)',
            duration: 0.35, ease: 'power4.out',
        }, '<0.05');
        tl.to('#number-33', { scale: 1, duration: 0.25, ease: 'back.out(3)' });
        tl.to('#sparkle-ring', { opacity: 1, duration: 0.6, ease: 'power1.in' }, '<');

        // Dissolve canvas particles
        const dissolveObj = { o: 1 };
        tl.to(dissolveObj, {
            o: 0, duration: 0.8, ease: 'power1.out',
            onUpdate: () => this.formation.dissolve(dissolveObj.o),
        }, '-=0.4');

        // Heartbeat glow
        tl.add(() => document.getElementById('number-33').classList.add('beating'), '<0.2');
        tl.to('#number-33-glow', { opacity: 1.8, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut' }, '+=0.15');

        /* ─── PHASE 6: TEXT 3 ─── */
        const words3 = splitWords('text-line-3');
        tl.to(words3, {
            opacity: 1, filter: 'blur(0px)', y: 0,
            duration: 0.5, stagger: 0.1, ease: 'power2.out',
            onComplete: () => words3.forEach(w => w.classList.add('revealed')),
        }, '-=0.2');

        /* ─── PHASE 7: SCROLL INDICATOR ─── */
        tl.to('#scroll-indicator', {
            opacity: 1, duration: 1, ease: 'power1.in',
            onComplete: () => document.body.classList.add('scroll-enabled'),
        }, '+=0.5');

        // Ambient shooting stars - REMOVED for cleaner background
        /*
        const shootingInterval = setInterval(() => {
            if (!document.hidden) spawnShootingStar();
        }, 4000 + Math.random() * 3000);
        window.addEventListener('beforeunload', () => clearInterval(shootingInterval));
        */

        this.tl = tl;
    }

    /**
     * skipToEnd() — called when page loads with scroll > 0.
     * Instantly shows Scene 1's final state with no animation.
     */
    skipToEnd() {
        // Galaxy fully visible
        gsap.set('#galaxy-canvas', { opacity: 1 });
        gsap.set('#nebula-overlay', { opacity: 0.6 });

        // Show story preface
        gsap.set(['#text-line-1', '#text-line-2'], { opacity: 1 });
        this._showStaticText('text-line-1');
        this._showStaticText('text-line-2');

        // Orbit ring subtle
        gsap.set('#orbit-ring', { opacity: 0.4 });

        // FX hidden
        gsap.set(['#burst-overlay', '#burst-ring', '#lens-flare',
            '#shockwave', '#scene2-spark'], { opacity: 0 });

        // Final "33" state — visible, sharp, glowing
        this._spawnSparkles();
        gsap.set('#number-33-glow', { opacity: 1 });
        gsap.set('#sparkle-ring', { opacity: 1 });
        gsap.set('#number-33', {
            opacity: 1, scale: 1, filter: 'blur(0px)',
        });
        document.getElementById('number-33').classList.add('beating');

        // Text 3 — split and show instantly
        const el = document.getElementById('text-line-3');
        if (!el.querySelector('.word')) {
            const text = el.textContent.trim();
            el.textContent = '';
            el.style.opacity = '1';
            text.split(/\s+/).forEach((w, i, arr) => {
                const span = document.createElement('span');
                span.className = 'word revealed';
                span.textContent = w + (i < arr.length - 1 ? '\u00A0' : '');
                el.appendChild(span);
            });
        } else {
            el.querySelectorAll('.word').forEach(w => {
                gsap.set(w, { opacity: 1, filter: 'blur(0px)', y: 0 });
            });
        }
        gsap.set('#text-line-3', { opacity: 1 });
        gsap.set('#scroll-indicator', { opacity: 1 });

        // Unlock scroll immediately
        document.body.classList.add('scroll-enabled');

        // Ambient shooting stars - REMOVED
        /*
        const shootingInterval = setInterval(() => {
            if (!document.hidden) spawnShootingStar();
        }, 4000 + Math.random() * 3000);
        window.addEventListener('beforeunload', () => clearInterval(shootingInterval));
        */
    }

    /**
     * Helper to show text without word animations
     */
    _showStaticText(id) {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.querySelector('.word')) {
            el.querySelectorAll('.word').forEach(w => {
                gsap.set(w, { opacity: 1, filter: 'blur(0px)', y: 0 });
                w.classList.add('revealed');
            });
        } else {
            const text = el.textContent.trim();
            el.textContent = '';
            el.style.opacity = '1';
            text.split(/\s+/).forEach((w, i, arr) => {
                const span = document.createElement('span');
                span.className = 'word revealed';
                span.textContent = w + (i < arr.length - 1 ? '\u00A0' : '');
                el.appendChild(span);
            });
        }
    }

    reset() {
        this.started = false;
        if (this.tl) this.tl.kill();

        // Restore original text for word-splitter
        ['text-line-1', 'text-line-2', 'text-line-3'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const words = el.querySelectorAll('.word');
            if (words.length > 0) {
                const combined = Array.from(words).map(w => w.textContent.trim()).join(' ');
                el.textContent = combined;
            }
            gsap.set(el, { opacity: 0 });
        });

        gsap.set(['#orbit-ring', '#number-display', '#number-33', '#number-33-glow', '#sparkle-ring', '#scroll-indicator', '#burst-overlay', '#burst-ring', '#lens-flare'], { opacity: 0 });
        gsap.set('#number-33', { scale: 0.3, filter: 'blur(20px)' });
        document.getElementById('number-33')?.classList.remove('beating');

        document.getElementById('orbit-ring').innerHTML = '';
        document.getElementById('sparkle-ring').innerHTML = '';

        // Clear formation state
        if (this.formation) {
            this.formation.particles = [];
            this.formation.progress = 0;
            if (this.formation.ctx) {
                this.formation.ctx.clearRect(0, 0, this.formation.w, this.formation.h);
            }
        }

        gsap.set(['#galaxy-canvas', '#nebula-overlay'], { opacity: 0 });
    }
}
