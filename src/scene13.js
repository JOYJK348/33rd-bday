/**
 * scene13.js — "The Breakthrough" 💼
 * Cinematic career journey: Intern → Jr Developer → Team Lead
 */
import gsap from 'gsap';

const $ = id => document.getElementById(id);

// ── Particle Canvas ──────────────────────────────────────────────
class BreakthroughCanvas {
    constructor(canvas) {
        this.c = canvas;
        this.ctx = canvas.getContext('2d');
        this.raf = null;
        this.active = false;
        this.t = 0;
        this.intensity = 0;
        this.particles = [];
    }

    init() {
        const isMobile = window.innerWidth < 768;
        const dpr = isMobile ? Math.min(devicePixelRatio, 1.25) : Math.min(devicePixelRatio, 2);
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.c.width = this.W * dpr;
        this.c.height = this.H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.particles = [];

        const count = isMobile ? 30 : 70;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                s: 0.4 + Math.random() * 2,
                v: 0.15 + Math.random() * 0.5,
                o: 0.1 + Math.random() * 0.5,
                hue: 250 + Math.random() * 80, // purple-gold spectrum
                drift: (Math.random() - 0.5) * 0.4
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

            // Purple glow pulse
            const cx = this.W / 2, cy = this.H / 2;
            const pulse = 0.6 + 0.4 * Math.sin(this.t * 0.8);
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.W * 0.7);
            g.addColorStop(0, `hsla(270, 90%, 60%, ${0.12 * p * pulse})`);
            g.addColorStop(0.5, `hsla(300, 80%, 50%, ${0.05 * p})`);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, this.W, this.H);

            // Rising particles
            this.particles.forEach(pt => {
                pt.y -= pt.v * (1 + p);
                pt.x += pt.drift;
                if (pt.y < -10) { pt.y = this.H + 10; pt.x = Math.random() * this.W; }
                if (pt.x < -10 || pt.x > this.W + 10) pt.x = Math.random() * this.W;
                const flicker = 0.5 + 0.5 * Math.sin(this.t * 3 + pt.x * 0.01);
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.s, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${pt.hue}, 90%, 80%, ${pt.o * (0.3 + p * 0.7) * flicker})`;
                ctx.fill();
            });
        };
        requestAnimationFrame(tick);
    }

    stop() {
        this.active = false;
        if (this.raf) cancelAnimationFrame(this.raf);
    }
}

// ── Sparkle burst on role badge ───────────────────────────────────
function sparkleRole(el) {
    if (!el) return;
    const colors = ['#fbbf24', '#a78bfa', '#f472b6', '#fff'];
    for (let i = 0; i < 20; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position:absolute; border-radius:50%;
            width:${3 + Math.random() * 5}px; height:${3 + Math.random() * 5}px;
            background:${colors[Math.floor(Math.random() * colors.length)]};
            top:50%; left:50%; pointer-events:none;
            z-index:30;
        `;
        el.style.position = 'relative';
        el.style.overflow = 'visible';
        el.appendChild(dot);
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 60;
        gsap.fromTo(dot,
            { opacity: 1, x: 0, y: 0, scale: 0 },
            {
                opacity: 0,
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                scale: 1 + Math.random(),
                duration: 1 + Math.random() * 0.8,
                ease: 'power2.out',
                delay: Math.random() * 0.3,
                onComplete: () => dot.remove()
            }
        );
    }
}

// ── Main Scene Class ──────────────────────────────────────────────
export default class Scene13 {
    constructor() {
        this.started = false;
        this.tl = null;
        this.canvas = null;
    }

    start() {
        if (this.started) return;
        this.started = true;
        this._initCanvas();
        this._run();
    }

    _initCanvas() {
        const c = $('s13-canvas');
        if (!c) return;
        this.canvas = new BreakthroughCanvas(c);
        this.canvas.init();
        this.canvas.start();
    }

    _run() {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        this.tl = tl;

        // Helper to scroll to a specific vertical offset within the scene
        const scrollScene = (yOffset, duration = 1.5) => {
            const sceneEl = $('scene-13');
            if (sceneEl) {
                const targetY = sceneEl.offsetTop + yOffset;
                const proxy = { y: window.scrollY };
                gsap.to(proxy, {
                    y: targetY,
                    duration: duration,
                    ease: 'power2.inOut',
                    onUpdate: () => window.scrollTo(0, proxy.y)
                });
            }
        };

        const all = [
            '#s13-date-badge', '#s13-t1', '#s13-t2',
            '#s13-role-1', '#s13-t3', '#s13-t4', '#s13-t5',
            '#s13-role-2', '#s13-t6',
            '#s13-role-3', '#s13-t7', '#s13-t8', '#s13-t9',
            '#s13-balance-grid', '#s13-t10',
            '#s13-t-strength', '#s13-finale-btn-wrap',
            '#s13-tl-line', '#s13-dot-1', '#s13-dot-2', '#s13-dot-3', '#s13-dot-4',
            '#scene-13 .recap-btn'
        ];
        gsap.set(all, { opacity: 0, y: 20 });
        gsap.set('.s13-balance-item', { opacity: 0, scale: 0.8, y: 10 });
        gsap.set('#s13-tl-line', { scaleX: 0, transformOrigin: 'left center' });
        gsap.set('#s13-purple-glow', { opacity: 0 });

        // ── ACT 1: Spotlight entrance ──
        tl.add(() => scrollScene(0)); // Start at top
        tl.to('#galaxy-canvas', { filter: 'brightness(0.4) saturate(0.7)', duration: 1.5 });
        tl.to('#s13-purple-glow', { opacity: 1, duration: 2 }, '<');
        tl.to(this.canvas, { intensity: 0.3, duration: 2 }, '<');

        // Timeline line draws
        tl.to('#s13-tl-line', { scaleX: 1, opacity: 1, duration: 3, ease: 'power1.inOut' }, '-=1');
        tl.fromTo('#s13-dot-1', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, '-=2.5');

        tl.fromTo('#s13-date-badge', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }, '-=2');
        tl.fromTo(['#s13-t1', '#s13-t2'],
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.4 },
            '-=0.5'
        );

        // ── ACT 2: Intern ──
        tl.fromTo('#s13-dot-2', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1.2, duration: 0.5, ease: 'back.out(2)' }, '+=0.5');
        tl.to('#s13-dot-2', { scale: 1, duration: 0.3 });

        tl.add(() => {
            const offset = window.innerWidth < 768 ? 400 : 500;
            scrollScene(offset);
        });

        tl.fromTo('#s13-role-1', { opacity: 0, y: 20, scale: 0.9 }, {
            opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)',
            onComplete: () => sparkleRole($('s13-role-1'))
        }, '-=0.2');

        tl.fromTo(['#s13-t3', '#s13-t4', '#s13-t5'],
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.35 },
            '+=0.2'
        );
        tl.to(this.canvas, { intensity: 0.55, duration: 1 }, '<');

        // ── ACT 3: Junior Developer ──
        tl.fromTo('#s13-dot-3', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1.3, duration: 0.5, ease: 'back.out(2)' }, '+=0.6');
        tl.to('#s13-dot-3', { scale: 1, duration: 0.4 });

        tl.add(() => {
            const offset = window.innerWidth < 768 ? 400 : 500;
            scrollScene(offset);
        });

        tl.to('#galaxy-canvas', { filter: 'brightness(0.5) saturate(1.1)', duration: 1.5 }, '<');
        tl.fromTo('#s13-role-2', { opacity: 0, y: 20, scale: 0.9 }, {
            opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.7)',
            onComplete: () => sparkleRole($('s13-role-2'))
        }, '-=0.5');
        tl.fromTo('#s13-t6', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, '+=0.3');

        // ── ACT 4: Team Lead ──
        tl.fromTo('#s13-dot-4', { opacity: 0, scale: 0 }, {
            opacity: 1, scale: 1.5, duration: 0.6,
            ease: 'back.out(2)',
            boxShadow: '0 0 30px rgba(251,191,36,0.8)'
        }, '+=0.6');
        tl.to('#s13-dot-4', { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.5)' });

        tl.add(() => {
            const roleEl = $('s13-role-3');
            if (roleEl) {
                // Calculate offset to center the "Team Lead" block in the viewport
                const elementTop = roleEl.offsetTop;
                const elementHeight = roleEl.offsetHeight;
                const viewportHeight = window.innerHeight;

                // Element top - some padding to keep it visible nicely
                const offset = elementTop - (viewportHeight * 0.15);
                scrollScene(offset, 1.8);
            }
        });

        tl.to(this.canvas, { intensity: 0.9, duration: 1.5 }, '<');
        tl.to('#galaxy-canvas', { filter: 'brightness(0.65) saturate(1.3)', duration: 1.5 }, '<');

        tl.fromTo('#s13-role-3', { opacity: 0, y: 25, scale: 0.85 }, {
            opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'back.out(1.5)',
            onComplete: () => sparkleRole($('s13-role-3'))
        }, '-=0.8');
        tl.fromTo(['#s13-t7', '#s13-t8', '#s13-t9'],
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.4 },
            '+=0.3'
        );

        // ── ACT 5: Balance grid ──
        // (Removing auto-scroll for this section per user request)

        tl.fromTo('.s13-balance-item',
            { opacity: 0, scale: 0.8, y: 10 },
            { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)' },
            '+=0.5'
        );
        tl.fromTo('#s13-t10', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1 }, '+=0.2');

        // ── ACT 6: Final strength message ──
        // (Removing auto-scroll for this section per user request)

        tl.to(this.canvas, { intensity: 1.2, duration: 2 }, '+=0.4');
        tl.to('#galaxy-canvas', { filter: 'brightness(0.8) saturate(1.5)', duration: 2 }, '<');
        tl.fromTo('#s13-t-strength',
            { opacity: 0, scale: 0.75, y: 40, filter: 'blur(15px)' },
            { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 2, ease: 'expo.out' },
            '-=1'
        );
        tl.to('#s13-t-strength', {
            textShadow: '0 0 50px rgba(167,139,250,1), 0 0 100px rgba(167,139,250,0.5)',
            duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut'
        }, '+=0.5');

        tl.fromTo('#scene-13 .recap-btn', { opacity: 0, scale: 0.8 }, { opacity: 0.6, scale: 1, duration: 0.8 }, '+=0.8');

        // Grand Finale button appears
        tl.fromTo('#s13-finale-btn-wrap',
            { opacity: 0, scale: 0.8, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'back.out(1.7)' },
            '-=0.5'
        );

        // After a pause, auto-scroll to Grand Finale
        tl.add(() => window.dispatchEvent(new CustomEvent('scene13:complete')), '+=2.5');
    }

    reset() {
        this.started = false;
        if (this.tl) {
            this.tl.pause().kill();
            this.tl.clear();
            this.tl = null;
        }
        if (this.canvas) { this.canvas.stop(); this.canvas = null; }

        gsap.set('#galaxy-canvas', { filter: 'none' });
        gsap.set('#s13-purple-glow', { opacity: 0 });
        gsap.set('#s13-tl-line', { scaleX: 0, transformOrigin: 'left center', opacity: 0 });

        const all = [
            '#s13-date-badge', '#s13-t1', '#s13-t2',
            '#s13-role-1', '#s13-t3', '#s13-t4', '#s13-t5',
            '#s13-role-2', '#s13-t6',
            '#s13-role-3', '#s13-t7', '#s13-t8', '#s13-t9',
            '#s13-balance-grid', '#s13-t10',
            '#s13-t-strength', '#s13-finale-btn-wrap',
            '#s13-dot-1', '#s13-dot-2', '#s13-dot-3', '#s13-dot-4',
            '#scene-13 .recap-btn'
        ];
        gsap.set(all, { opacity: 0, y: 0, scale: 1, clearProps: 'textShadow,filter,boxShadow' });
        gsap.set('.s13-balance-item', { opacity: 0, scale: 0.8 });
    }

    skipToEnd() {
        if (this.started) return;
        this.started = true;
        this._initCanvas();
        if (this.canvas) this.canvas.intensity = 0.9;

        gsap.set('#galaxy-canvas', { filter: 'brightness(0.65) saturate(1.3)' });
        gsap.set('#s13-purple-glow', { opacity: 0.7 });
        gsap.set('#s13-tl-line', { scaleX: 1, transformOrigin: 'left center', opacity: 1 });

        const all = [
            '#s13-date-badge', '#s13-t1', '#s13-t2',
            '#s13-role-1', '#s13-t3', '#s13-t4', '#s13-t5',
            '#s13-role-2', '#s13-t6',
            '#s13-role-3', '#s13-t7', '#s13-t8', '#s13-t9',
            '#s13-balance-grid', '#s13-t10',
            '#s13-t-strength', '#s13-finale-btn-wrap',
            '#s13-dot-1', '#s13-dot-2', '#s13-dot-3', '#s13-dot-4'
        ];
        gsap.set(all, { opacity: 1, y: 0, scale: 1 });
        gsap.set('.s13-balance-item', { opacity: 1, scale: 1, y: 0 });
        gsap.set('#scene-13 .recap-btn', { opacity: 0.6, scale: 1 });
    }
}
