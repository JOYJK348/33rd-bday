/**
 * scene6.js — "A New Chapter" 💍
 * Marriage · Sacrifice · Love · Family First
 *
 * VISUAL CONCEPT (Enhanced):
 *  — Dual canvas: warm embers RISE + rose petals DRIFT left to right
 *  — A pulsing sacred-bloom mandala drawn behind the ring icon
 *  — Heart particles orbit the ring, then float away
 *  — Bokeh soft-light circles drift in the background
 *  — Each text line has a subtle left-edge glow sweep on entry
 *  — MNC line: gold shatter-gleam effect
 *  — Family moment: radial bloom burst from center
 */
import gsap from 'gsap';

const $ = id => document.getElementById(id);

/* ══════════════════════════════════════════
   IMMERSIVE CANVAS — Embers + Petals + Bokeh
   ══════════════════════════════════════════ */
class Scene6Canvas {
    constructor(canvas) {
        this.c = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.raf = null;
        this.active = false;
        this.t = 0;
    }

    init() {
        const isMobile = window.innerWidth < 768;
        const dpr = isMobile ? Math.min(devicePixelRatio, 1.25) : Math.min(devicePixelRatio, 2);
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.c.width = this.W * dpr;
        this.c.height = this.H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // ── Embers (gold, rise)
        const emberCount = isMobile ? 25 : 55;
        for (let i = 0; i < emberCount; i++) this.particles.push(this._ember(true));

        // ── Petals (pink/rose, drift diagonally)
        const petalCount = isMobile ? 15 : 30;
        for (let i = 0; i < petalCount; i++) this.particles.push(this._petal(true));

        // ── Bokeh soft orbs (large, very faint)
        const bokehCount = isMobile ? 8 : 15;
        for (let i = 0; i < bokehCount; i++) this.particles.push(this._bokeh(true));
    }

    // ── Ember spec ──
    _ember(rand = false) {
        return {
            type: 'ember',
            x: Math.random() * this.W,
            y: rand ? Math.random() * this.H : this.H + 10,
            r: 0.8 + Math.random() * 1.8,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -(0.3 + Math.random() * 0.7),
            hue: 18 + Math.random() * 28,
            op: 0.15 + Math.random() * 0.45,
            life: 0, maxLife: 220 + Math.random() * 280,
        };
    }

    // ── Rose Petal spec (drawn as small rounded oval with rotation) ──
    _petal(rand = false) {
        return {
            type: 'petal',
            x: rand ? Math.random() * this.W : -30,
            y: rand ? Math.random() * this.H : Math.random() * this.H,
            w: 8 + Math.random() * 10,
            h: 4 + Math.random() * 5,
            rot: Math.random() * Math.PI * 2,
            vrot: (Math.random() - 0.5) * 0.02,
            vx: 0.4 + Math.random() * 0.6,
            vy: (Math.random() - 0.3) * 0.4,
            hue: 340 + Math.random() * 20, // pink–rose
            op: 0.2 + Math.random() * 0.4,
            life: 0, maxLife: 400 + Math.random() * 400,
        };
    }

    // ── Bokeh orb spec ──
    _bokeh(rand = false) {
        return {
            type: 'bokeh',
            x: rand ? Math.random() * this.W : Math.random() * this.W,
            y: rand ? Math.random() * this.H : Math.random() * this.H,
            r: 40 + Math.random() * 80,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.08,
            hue: Math.random() < 0.5 ? (20 + Math.random() * 25) : (330 + Math.random() * 20),
            op: 0.025 + Math.random() * 0.04,
            life: 0, maxLife: 800 + Math.random() * 600,
        };
    }

    start() {
        this.active = true;
        const tick = () => {
            if (!this.active) return;
            this.raf = requestAnimationFrame(tick);
            this.t += 0.016;
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.W, this.H);

            this.particles.forEach((p, i) => {
                p.life++;

                if (p.type === 'ember') {
                    p.x += p.vx + Math.sin(this.t + i) * 0.15;
                    p.y += p.vy;
                    const fade = Math.sin((p.life / p.maxLife) * Math.PI);
                    ctx.globalAlpha = p.op * fade;
                    ctx.shadowColor = `hsl(${p.hue},90%,65%)`;
                    ctx.shadowBlur = 8;
                    ctx.fillStyle = `hsl(${p.hue},90%,70%)`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                    if (p.life >= p.maxLife || p.y < -10) this.particles[i] = this._ember(false);

                } else if (p.type === 'petal') {
                    p.x += p.vx;
                    p.y += p.vy + Math.sin(this.t * 0.6 + i) * 0.18;
                    p.rot += p.vrot;
                    const fade = Math.sin((p.life / p.maxLife) * Math.PI);
                    ctx.globalAlpha = p.op * fade;
                    ctx.shadowBlur = 0;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
                    ctx.fillStyle = `hsl(${p.hue}, 80%, 78%)`;
                    ctx.fill();
                    ctx.restore();
                    if (p.life >= p.maxLife || p.x > this.W + 30) this.particles[i] = this._petal(false);

                } else if (p.type === 'bokeh') {
                    p.x += p.vx;
                    p.y += p.vy;
                    const fade = 0.5 + 0.5 * Math.sin((p.life / p.maxLife) * Math.PI);
                    ctx.globalAlpha = p.op * fade;
                    ctx.shadowBlur = 0;
                    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                    g.addColorStop(0, `hsla(${p.hue},80%,75%,1)`);
                    g.addColorStop(1, `hsla(${p.hue},80%,75%,0)`);
                    ctx.fillStyle = g;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                    if (p.life >= p.maxLife) this.particles[i] = this._bokeh(true);
                }
            });

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        };
        requestAnimationFrame(tick);
    }

    stop() {
        this.active = false;
        if (this.raf) cancelAnimationFrame(this.raf);
    }
}

/* ══════════════════════════════════════════
   MANDALA / BLOOM — drawn on a separate canvas
   ══════════════════════════════════════════ */
class MandalaBloom {
    constructor(canvas) {
        this.c = canvas;
        this.ctx = canvas.getContext('2d');
        this.raf = null;
        this.active = false;
        this.progress = 0; // 0→1 bloom in
        this.t = 0;
    }

    init() {
        const isMobile = window.innerWidth < 768;
        const dpr = isMobile ? Math.min(devicePixelRatio, 1.2) : Math.min(devicePixelRatio, 2);
        const s = Math.min(window.innerWidth, window.innerHeight) * 0.55;
        this.c.width = s * dpr;
        this.c.height = s * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.S = s;
    }

    start() {
        this.active = true;
        // Bloom in over ~3s
        gsap.to(this, { progress: 1, duration: 3, ease: 'power2.out' });

        const tick = () => {
            if (!this.active) return;
            this.raf = requestAnimationFrame(tick);
            this.t += 0.008;
            this._draw();
        };
        requestAnimationFrame(tick);
    }

    _draw() {
        const ctx = this.ctx;
        const cx = this.S / 2;
        const cy = this.S / 2;
        const p = this.progress;
        ctx.clearRect(0, 0, this.S, this.S);

        const PETALS = 12;
        const R = cx * 0.85 * p;

        for (let k = 0; k < PETALS; k++) {
            const angle = (k / PETALS) * Math.PI * 2 + this.t;
            const wobble = 1 + 0.04 * Math.sin(this.t * 3 + k);
            const pr = R * wobble;
            const px = cx + Math.cos(angle) * pr * 0.45;
            const py = cy + Math.sin(angle) * pr * 0.45;

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(angle + Math.PI / 2);

            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pr * 0.6);
            const alpha = 0.08 * p;
            grad.addColorStop(0, `rgba(251,191,36,${alpha * 2})`);
            grad.addColorStop(0.5, `rgba(251,100,80,${alpha})`);
            grad.addColorStop(1, `rgba(255,100,150,0)`);

            ctx.beginPath();
            ctx.ellipse(0, 0, pr * 0.28, pr * 0.55, 0, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        }

        // Inner ring
        ctx.save();
        ctx.globalAlpha = 0.12 * p;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.6 + Math.sin(this.t * 2) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.arc(cx, cy, R * 0.82, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    stop() {
        this.active = false;
        if (this.raf) cancelAnimationFrame(this.raf);
    }
}

/* ══════════════════════════════════════════
   SCENE 6 CLASS
   ══════════════════════════════════════════ */
export default class Scene6 {
    constructor() {
        this.started = false;
        this.tl = null;
        this.canvas6 = null;
        this.mandala = null;
    }

    start() {
        if (this.started) return;
        this.started = true;
        this._initCanvas();
        this._initMandala();
        this._run();
    }

    _initCanvas() {
        const c = $('s6-embers-canvas');
        if (!c) return;
        this.canvas6 = new Scene6Canvas(c);
        this.canvas6.init();
        this.canvas6.start();
    }

    _initMandala() {
        const c = $('s6-mandala-canvas');
        if (!c) return;
        this.mandala = new MandalaBloom(c);
        this.mandala.init();
    }

    _run() {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        this.tl = tl;

        // ── 1. Warm atmosphere shift
        tl.to('#galaxy-canvas', {
            filter: 'brightness(0.3) saturate(0.8) hue-rotate(10deg)',
            duration: 2.5, ease: 'power1.inOut'
        });

        // ── 2. Mandala starts blooming (behind ring)
        tl.add(() => {
            if (this.mandala) this.mandala.start();
        }, '-=1.5');

        tl.fromTo('#s6-mandala-canvas',
            { opacity: 0, scale: 0.6, rotate: -20 },
            { opacity: 1, scale: 1, rotate: 0, duration: 2.5, ease: 'power2.out' },
            '<'
        );

        // ── 3. Ring rises with spring + orbiting hearts
        tl.fromTo('#s6-ring-wrap',
            { opacity: 0, y: 80, scale: 0.3 },
            { opacity: 1, y: 0, scale: 1, duration: 1.8, ease: 'back.out(1.6)' },
            '-=1.2'
        );

        // Glow ring pulse (infinite)
        tl.to('#s6-ring-glow', {
            opacity: 0.7, scale: 2,
            duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, '<+0.5');

        // Ring wobble shake after landing
        tl.to('#s6-ring-icon', {
            rotate: 12, duration: 0.12, yoyo: true, repeat: 5, ease: 'sine.inOut'
        }, '<+1.2');

        // Spawn heart sparks around the ring
        tl.add(() => this._spawnHearts(), '-=0.2');

        // ── 4. "As life moved forward…"
        tl.fromTo('#s6-t1',
            { opacity: 0, x: -30, filter: 'blur(6px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.0 },
            '+=0.7'
        );
        tl.fromTo('#s6-t2',
            { opacity: 0, x: -30, filter: 'blur(6px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.0 },
            '+=0.3'
        );

        // Divider line
        tl.fromTo('#s6-divider',
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power1.inOut' },
            '+=0.4'
        );

        // ── 5. "She chose to say yes…"
        tl.fromTo('#s6-t3',
            { opacity: 0, x: 30, filter: 'blur(6px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.0 },
            '+=0.5'
        );
        tl.fromTo('#s6-t4',
            { opacity: 0, x: 30, filter: 'blur(6px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.0 },
            '+=0.3'
        );

        // ── 6. "At a time when big dreams…"
        tl.fromTo('#s6-t5',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.0 },
            '+=0.9'
        );

        // ── 7. MNC line — gold gleam sweep
        tl.fromTo('#s6-t6',
            { opacity: 0, scale: 0.92, y: 12 },
            { opacity: 1, scale: 1, y: 0, duration: 1.1 },
            '+=0.4'
        );
        // shimmer sweep on MNC text
        tl.fromTo('#s6-mnc-shine',
            { x: '-110%', opacity: 0.8 },
            { x: '110%', opacity: 0, duration: 0.8, ease: 'power1.inOut' },
            '<+0.1'
        );
        tl.to('#s6-t6', {
            textShadow: '0 0 40px rgba(251,191,36,1), 0 0 80px rgba(251,191,36,0.5)',
            duration: 0.5, yoyo: true, repeat: 1
        }, '<');

        // ── 8. "But sometimes… love and family come first."
        tl.fromTo('#s6-t7',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.0 },
            '+=0.9'
        );
        tl.fromTo('#s6-t8',
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 1.3, ease: 'back.out(1.2)' },
            '+=0.3'
        );

        // ── 9. Family moment bursts in
        tl.fromTo('#s6-family-wrap',
            { opacity: 0, scale: 0.5, filter: 'blur(20px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.8, ease: 'back.out(1.3)' },
            '+=0.8'
        );
        // Family icon bounce
        tl.to('#s6-family-icon', {
            y: -15, duration: 0.4, yoyo: true, repeat: 3, ease: 'power1.inOut'
        }, '<+0.5');

        tl.fromTo('#s6-family-caption',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 1.0 },
            '-=0.4'
        );

        // ── 10. Timeline glow
        tl.fromTo('#s6-timeline-glow',
            { opacity: 0, scaleX: 0 },
            { opacity: 1, scaleX: 1, duration: 1.4, ease: 'power2.inOut' },
            '+=0.4'
        );
        tl.to('#s6-timeline-glow', {
            boxShadow: '0 0 50px rgba(251,191,36,0.9), 0 0 100px rgba(251,191,36,0.4)',
            duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut'
        }, '<');

        // ── 11. Next button
        tl.fromTo('#s6-next-trigger',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.0 },
            '+=0.6'
        );

        // ── 12. Recap Button
        tl.fromTo('#scene-6 .recap-btn',
            { opacity: 0, scale: 0.8 },
            { opacity: 0.6, scale: 1, duration: 1, ease: 'back.out(1.2)' },
            '+=0.4'
        );

        tl.add(() => window.dispatchEvent(new CustomEvent('scene6:complete')), '+=0.3');
    }

    /* Heart particles burst from ring area */
    _spawnHearts() {
        const wrap = $('s6-ring-wrap');
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const hearts = ['❤️', '💛', '🌸', '💕', '✨', '💖'];
        for (let i = 0; i < 12; i++) {
            const h = document.createElement('div');
            h.className = 's6-heart-spark';
            h.textContent = hearts[i % hearts.length];
            h.style.cssText = `
                position:fixed; left:${cx}px; top:${cy}px;
                font-size:${1 + Math.random() * 1.2}rem;
                pointer-events:none; z-index:100;
                transform:translate(-50%,-50%);
            `;
            document.body.appendChild(h);

            const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
            const dist = 80 + Math.random() * 140;
            gsap.to(h, {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist - 40,
                opacity: 0,
                scale: 0.3,
                duration: 1.4 + Math.random() * 0.8,
                ease: 'power2.out',
                delay: Math.random() * 0.4,
                onComplete: () => h.remove()
            });
        }
    }

    reset() {
        this.started = false;
        if (this.tl) this.tl.kill();
        if (this.canvas6) { this.canvas6.stop(); this.canvas6 = null; }
        if (this.mandala) { this.mandala.stop(); this.mandala = null; }

        gsap.set('#galaxy-canvas', { filter: 'none' });
        gsap.set('#s6-mandala-canvas', { opacity: 0, scale: 0.6, rotate: -20 });
        gsap.set('#s6-ring-wrap', { opacity: 0, y: 80, scale: 0.3 });
        gsap.set('#s6-ring-glow', { opacity: 0, scale: 1 });
        gsap.set(['#s6-t1', '#s6-t2', '#s6-t3', '#s6-t4', '#s6-t5', '#s6-t6', '#s6-t7', '#s6-t8'], { opacity: 0 });
        gsap.set('#s6-divider', { scaleX: 0, opacity: 0 });
        gsap.set('#s6-family-wrap', { opacity: 0, scale: 0.5, filter: 'blur(20px)' });
        gsap.set('#s6-family-caption', { opacity: 0 });
        gsap.set('#s6-timeline-glow', { opacity: 0, scaleX: 0 });
        gsap.set('#s6-next-trigger', { opacity: 0, y: 20 });
        gsap.set('#scene-6 .recap-btn', { opacity: 0, scale: 0.8 });
        document.querySelectorAll('.s6-heart-spark').forEach(h => h.remove());
    }

    skipToEnd() {
        if (this.started) return;
        this.started = true;
        this._initCanvas();
        gsap.set('#galaxy-canvas', { filter: 'brightness(0.2) saturate(0.7) hue-rotate(10deg)' });
        gsap.set('#s6-ring-wrap', { opacity: 1, y: 0, scale: 1 });
        gsap.set('#s6-ring-glow', { opacity: 0.4 });
        gsap.set('#s6-mandala-canvas', { opacity: 0.6, scale: 1, rotate: 0 });
        gsap.set(['#s6-t1', '#s6-t2', '#s6-t3', '#s6-t4', '#s6-t5', '#s6-t6', '#s6-t7', '#s6-t8'], { opacity: 1, x: 0, y: 0, filter: 'none' });
        gsap.set('#s6-divider', { scaleX: 1, opacity: 1 });
        gsap.set('#s6-family-wrap', { opacity: 1, scale: 1, filter: 'blur(0px)' });
        gsap.set('#s6-family-caption', { opacity: 1 });
        gsap.set('#s6-timeline-glow', { opacity: 1, scaleX: 1 });
        gsap.set('#s6-next-trigger', { opacity: 1, y: 0 });
        gsap.set('#scene-6 .recap-btn', { opacity: 0.6, scale: 1 });
    }
}
