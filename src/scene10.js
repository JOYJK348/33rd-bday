/**
 * scene10.js — "The Course Completion" 🎓
 * Timeline glows · Certificate · Sparkles · Hard Work
 */
import gsap from 'gsap';

const $ = id => document.getElementById(id);

// ── Sparkle particle system on canvas ──────────────────────────────
class SparkleCanvas {
    constructor(canvas) {
        this.c = canvas;
        this.ctx = canvas.getContext('2d');
        this.raf = null;
        this.active = false;
        this.t = 0;
        this.intensity = 0;
        this.particles = [];
        this.certificates = [];
    }

    init() {
        const dpr = Math.min(devicePixelRatio, 2);
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.c.width = this.W * dpr;
        this.c.height = this.H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.particles = [];
        this.orbs = [];
        this.certificates = [];

        // Floating sparkle dots
        for (let i = 0; i < 60; i++) {
            this.particles.push({
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                s: 0.4 + Math.random() * 2,
                v: 0.15 + Math.random() * 0.35,
                o: 0.1 + Math.random() * 0.4,
                hue: 40 + Math.random() * 260,
                drift: (Math.random() - 0.5) * 0.5
            });
        }

        // Timeline glow orbs
        this.orbs = [];
        for (let i = 0; i < 5; i++) {
            this.orbs.push({
                x: (this.W / 6) * (i + 0.5),
                y: this.H * 0.82,
                r: 30 + Math.random() * 20,
                phase: Math.random() * Math.PI * 2,
                hue: 45 + i * 50
            });
        }
    }

    start() {
        this.active = true;
        const tick = () => {
            if (!this.active) return;
            this.raf = requestAnimationFrame(tick);
            this.t += 0.018;
            const ctx = this.ctx;
            const p = Math.min(this.intensity, 1);

            ctx.clearRect(0, 0, this.W, this.H);

            // Sparkle dots
            this.particles.forEach(pt => {
                pt.y -= pt.v * (1 + p * 1.5);
                pt.x += pt.drift;
                if (pt.y < -10) { pt.y = this.H + 10; pt.x = Math.random() * this.W; }
                if (pt.x < -10 || pt.x > this.W + 10) pt.x = Math.random() * this.W;

                const flicker = 0.5 + 0.5 * Math.sin(this.t * 4 + pt.x);
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.s, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${pt.hue}, 90%, 75%, ${pt.o * (0.2 + p * 0.8) * flicker})`;
                ctx.fill();
            });

            // Timeline orb glows at bottom (brighten with intensity)
            if (p > 0.1) {
                this.orbs.forEach(orb => {
                    const pulse = 0.6 + 0.4 * Math.sin(this.t * 2 + orb.phase);
                    const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * 2 * pulse);
                    g.addColorStop(0, `hsla(${orb.hue}, 80%, 75%, ${0.25 * p})`);
                    g.addColorStop(1, 'transparent');
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, this.W, this.H);
                });
            }

            // Certificate sparkle burst (at high intensity)
            if (p > 0.7) {
                const cx = this.W / 2;
                const cy = this.H * 0.35;
                const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220 * p);
                g2.addColorStop(0, `hsla(45, 100%, 80%, ${0.12 * p})`);
                g2.addColorStop(0.5, `hsla(270, 80%, 70%, ${0.06 * p})`);
                g2.addColorStop(1, 'transparent');
                ctx.fillStyle = g2;
                ctx.fillRect(0, 0, this.W, this.H);
            }
        };
        requestAnimationFrame(tick);
    }

    stop() {
        this.active = false;
        if (this.raf) cancelAnimationFrame(this.raf);
    }
}

// ── Confetti burst for course completion ─────────────────────────
function burstConfetti(container) {
    const colors = ['#fbbf24', '#a78bfa', '#f472b6', '#34d399', '#60a5fa', '#fff'];
    for (let i = 0; i < 80; i++) {
        const el = document.createElement('div');
        el.className = 's10-confetti-piece';
        const size = 5 + Math.random() * 7;
        el.style.cssText = `
            position:absolute;
            width:${size}px;
            height:${size}px;
            background:${colors[Math.floor(Math.random() * colors.length)]};
            border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
            top:50%; left:50%; opacity:0; pointer-events:none;
        `;
        container.appendChild(el);

        const angle = Math.random() * Math.PI * 2;
        const dist = 150 + Math.random() * 400;
        gsap.fromTo(el,
            { x: 0, y: 0, opacity: 1, scale: 0, rotation: 0 },
            {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                opacity: 0,
                scale: 1 + Math.random(),
                rotation: Math.random() * 720 - 360,
                duration: 1.8 + Math.random() * 1.2,
                delay: Math.random() * 0.4,
                ease: 'power2.out',
                onComplete: () => el.remove()
            }
        );
    }
}

// ── Main Scene Class ──────────────────────────────────────────────
export default class Scene10 {
    constructor() {
        this.started = false;
        this.tl = null;
        this.spark = null;
    }

    start() {
        if (this.started) return;
        this.started = true;
        this._initSpark();
        this._run();
    }

    _initSpark() {
        const c = $('s10-spark-canvas');
        if (!c) return;
        this.spark = new SparkleCanvas(c);
        this.spark.init();
        this.spark.start();
    }

    _run() {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        this.tl = tl;

        // Reset everything hidden
        gsap.set([
            '#s10-timeline-bar',
            '#s10-t-step', '#s10-t-day',
            '#s10-cert-wrap',
            '#s10-cert-glow',
            '#s10-t-hardwork',
            '#s10-t-notover',
            '#s10-next-trigger',
            '#scene-10 .recap-btn'
        ], { opacity: 0, y: 20 });
        gsap.set('#s10-cert-wrap', { scale: 0.5, opacity: 0, y: 0 });
        gsap.set('#s10-cert-glow', { scale: 0.3, opacity: 0 });
        gsap.set('#s10-timeline-bar', { scaleX: 0, transformOrigin: 'left center', opacity: 1 });

        // ── ACT 1: Timeline glows brighter ──
        tl.to('#galaxy-canvas', {
            filter: 'brightness(0.55) saturate(1.2)',
            duration: 2, ease: 'power2.inOut'
        });
        tl.to(this.spark, { intensity: 0.3, duration: 2 }, '<');

        // Timeline bar fills up
        tl.fromTo('#s10-timeline-glow-pulse',
            { opacity: 0 },
            { opacity: 1, duration: 1 }, '<'
        );
        tl.to('#s10-timeline-bar',
            { scaleX: 1, duration: 2.5, ease: 'power1.inOut' },
            '-=0.5'
        );
        tl.to('#s10-timeline-bar', {
            boxShadow: '0 0 30px 8px rgba(251,191,36,0.7), 0 0 60px 15px rgba(167,139,250,0.4)',
            duration: 1.2, yoyo: true, repeat: 1, ease: 'sine.inOut'
        }, '-=0.5');

        // ── ACT 2: "Step by step…" text ──
        tl.fromTo('#s10-t-step',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
            '+=0.3'
        );
        tl.fromTo('#s10-t-day',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1 },
            '+=0.5'
        );

        // ── ACT 3: Certificate animation drops in ──
        tl.to(this.spark, { intensity: 0.65, duration: 1.5 }, '+=0.6');

        // Certificate glow halo first
        tl.fromTo('#s10-cert-glow',
            { opacity: 0, scale: 0.3 },
            { opacity: 1, scale: 1.4, duration: 1.2, ease: 'back.out(2)' },
            '-=0.8'
        );
        // Then certificate itself
        tl.fromTo('#s10-cert-wrap',
            { opacity: 0, scale: 0.4, y: -30, rotation: -6 },
            {
                opacity: 1, scale: 1, y: 0, rotation: 0,
                duration: 1.4, ease: 'back.out(2)',
                onComplete: () => {
                    // Confetti burst on certificate arrival
                    const c = document.getElementById('s10-confetti-container');
                    if (c) burstConfetti(c);
                }
            },
            '-=0.6'
        );

        // Certificate subtle float
        tl.to('#s10-cert-wrap', {
            y: -12, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, '+=0.2');

        // Glow pulse on cert
        tl.to('#s10-cert-glow', {
            scale: 1.6, opacity: 0.5, duration: 2,
            repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, '<');

        // ── ACT 4: "She pushed forward with hard work." ──
        tl.fromTo('#s10-t-hardwork',
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 1.3 },
            '+=0.5'
        );

        // ── ACT 5 & 6 Removed per request ──
        tl.to(this.spark, { intensity: 1.0, duration: 1.5 }, '+=0.4');
        tl.to('#galaxy-canvas', { filter: 'brightness(0.75) saturate(1.4)', duration: 2 }, '<');

        // ── ACT 7: "But the journey was still not over." ──
        tl.fromTo('#s10-t-notover',
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' },
            '+=1'
        );
        tl.to('#s10-t-notover', {
            textShadow: '0 0 30px rgba(212,165,255,0.8)',
            duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
        }, '+=0.2');

        // ── ACT 8: Next button ──
        tl.fromTo('#s10-next-trigger',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1 },
            '+=0.5'
        );

        tl.fromTo('#scene-10 .recap-btn',
            { opacity: 0, scale: 0.8 },
            { opacity: 0.6, scale: 1, duration: 1 }, '-=1.5'
        );

        tl.add(() => window.dispatchEvent(new CustomEvent('scene10:complete')), '+=0.3');
    }

    reset() {
        this.started = false;
        if (this.tl) this.tl.kill();
        if (this.spark) { this.spark.stop(); this.spark = null; }

        gsap.set('#galaxy-canvas', { filter: 'none' });
        gsap.set('#s10-timeline-bar', { scaleX: 0, transformOrigin: 'left center', opacity: 1 });

        const allIds = [
            '#s10-t-step', '#s10-t-day', '#s10-cert-wrap',
            '#s10-cert-glow', '#s10-t-hardwork',
            '#s10-t-notover',
            '#s10-next-trigger', '#s10-timeline-glow-pulse', '#scene-10 .recap-btn'
        ];
        gsap.set(allIds, { opacity: 0, y: 0, scale: 1, clearProps: 'textShadow,rotation,boxShadow' });
        gsap.set('#s10-cert-wrap', { scale: 0.5 });
        gsap.set('#s10-cert-glow', { scale: 0.3 });
    }

    skipToEnd() {
        if (this.started) return;
        this.started = true;
        this._initSpark();
        if (this.spark) this.spark.intensity = 1.0;

        gsap.set('#galaxy-canvas', { filter: 'brightness(0.7) saturate(1.3)' });
        gsap.set('#s10-timeline-bar', { scaleX: 1, transformOrigin: 'left center' });

        // Show all content clearly
        gsap.set(['#s10-t-step', '#s10-t-day', '#s10-cert-wrap', '#s10-cert-glow',
            '#s10-t-hardwork',
            '#s10-t-notover', '#s10-next-trigger', '#s10-timeline-glow-pulse'
        ], {
            opacity: 1, y: 0, scale: 1,
            clearProps: 'textShadow'
        });

        // Set 'whisper' lines to a half-dimmed but readable state
        gsap.set(['#s10-t-step', '#s10-t-day'], { opacity: 0.6 });

        gsap.set('#scene-10 .recap-btn', { opacity: 0.6, scale: 1 });
    }
}
