/**
 * scene11.js — "The Challenges" 🚫
 * Full Cinematic BG: Falling envelopes · Red static · Rising gold particles
 * Dark → Struggle → Resilient glow
 */
import gsap from 'gsap';

const $ = id => document.getElementById(id);

/* ════════════════════════════════════════════════════
   CINEMATIC CANVAS — multi-layer particle engine
   Layers:
     1. Dark falling "rejection letters" (envelopes)
     2. Red pulse / static beats on rejection stamps
     3. Rising gold fire-sparks for resilience phase
   ════════════════════════════════════════════════════ */
class CinematicCanvas {
    constructor(canvas) {
        this.c = canvas;
        this.ctx = canvas.getContext('2d');
        this.raf = null;
        this.active = false;
        this.t = 0;

        // Phase: 0 = struggle, 1 = resilience
        this.phase = 0;
        this.phaseBlend = 0; // 0 → 1 as resilience kicks in

        this.letters = [];   // Falling rejection papers
        this.sparks = [];    // Rising gold sparks
        this.pulses = [];    // Red radial pulses
    }

    init() {
        const dpr = Math.min(devicePixelRatio, 2);
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.c.width = this.W * dpr;
        this.c.height = this.H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Clear existing arrays for re-scroll compatibility
        this.letters = [];
        this.sparks = [];
        this.pulses = [];

        // Falling rejection letter particles
        for (let i = 0; i < 28; i++) {
            this._spawnLetter(true);
        }

        // Rising gold sparks (start invisible, brighten in resilience phase)
        for (let i = 0; i < 50; i++) {
            this._spawnSpark(true);
        }
    }

    _spawnLetter(init = false) {
        this.letters.push({
            x: Math.random() * this.W,
            y: init ? Math.random() * this.H : -40,
            w: 28 + Math.random() * 18,
            h: 20 + Math.random() * 12,
            speed: 0.6 + Math.random() * 1.2,
            rot: (Math.random() - 0.5) * 0.4,
            angle: (Math.random() - 0.5) * 0.6,
            driftX: (Math.random() - 0.5) * 0.3,
            alpha: 0.08 + Math.random() * 0.18,
            stamped: Math.random() > 0.5,   // red X mark
        });
    }

    _spawnSpark(init = false) {
        this.sparks.push({
            x: Math.random() * this.W,
            y: init ? Math.random() * this.H : this.H + 10,
            s: 0.8 + Math.random() * 2.2,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -(0.4 + Math.random() * 1.2),
            hue: 35 + Math.random() * 25,   // gold range
            alpha: 0,
            maxAlpha: 0.3 + Math.random() * 0.5,
            life: 0,
            maxLife: 120 + Math.random() * 180,
        });
    }

    triggerPulse(x, y) {
        this.pulses.push({ x, y, r: 0, maxR: 180, alpha: 0.7 });
    }

    /* Called from GSAP to shift from dark/red to golden */
    setPhaseBlend(v) { this.phaseBlend = Math.max(0, Math.min(1, v)); }

    start() {
        this.active = true;
        const loop = () => {
            if (!this.active) return;
            this.raf = requestAnimationFrame(loop);
            this._draw();
        };
        requestAnimationFrame(loop);
    }

    _draw() {
        this.t += 0.02;
        const ctx = this.ctx;
        const W = this.W, H = this.H;
        const b = this.phaseBlend; // 0=dark/red, 1=gold

        ctx.clearRect(0, 0, W, H);

        /* ── Layer 0: Dramatic vignette bg sweep ── */
        const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.8);
        const innerAlpha = 0.05 + b * 0.12;
        const innerHue = b > 0.3 ? 45 : 0; // red glow → gold glow
        bgGrad.addColorStop(0, `hsla(${innerHue}, 80%, 30%, ${innerAlpha})`);
        bgGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        /* ── Layer 1: Falling rejection envelopes ── */
        const letterDim = Math.max(0, 1 - b * 1.5); // fade out envelopes as resilience rises
        if (letterDim > 0) {
            this.letters.forEach((l, idx) => {
                l.y += l.speed;
                l.x += l.driftX;
                l.angle += l.rot * 0.008;
                if (l.y > H + 50) {
                    this.letters[idx] = this._freshLetter();
                }

                ctx.save();
                ctx.translate(l.x, l.y);
                ctx.rotate(l.angle);
                ctx.globalAlpha = l.alpha * letterDim;

                // Envelope body
                ctx.fillStyle = `rgba(180, 160, 200, 1)`;
                ctx.beginPath();
                ctx.roundRect(-l.w / 2, -l.h / 2, l.w, l.h, 2);
                ctx.fill();

                // Envelope flap
                ctx.strokeStyle = 'rgba(120, 100, 150, 0.6)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(-l.w / 2, -l.h / 2);
                ctx.lineTo(0, 0);
                ctx.lineTo(l.w / 2, -l.h / 2);
                ctx.stroke();

                // Red X stamp on some
                if (l.stamped) {
                    ctx.strokeStyle = 'rgba(255, 60, 60, 0.85)';
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(-4, -4); ctx.lineTo(4, 4);
                    ctx.moveTo(4, -4); ctx.lineTo(-4, 4);
                    ctx.stroke();
                }

                ctx.restore();
            });
        }

        /* ── Layer 2: Red radial pulse rings (rejection beats) ── */
        this.pulses = this.pulses.filter(p => p.alpha > 0.01);
        this.pulses.forEach(p => {
            p.r += 4;
            p.alpha *= 0.93;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 60, 60, ${p.alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner ring
            if (p.r > 30) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 100, 100, ${p.alpha * 0.4})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        /* ── Layer 3: Rising gold sparks (resilience phase) ── */
        if (b > 0.05) {
            this.sparks.forEach((s, idx) => {
                s.life++;
                s.x += s.vx;
                s.y += s.vy;

                const progress = s.life / s.maxLife;
                // Fade in then out
                s.alpha = progress < 0.3
                    ? (progress / 0.3) * s.maxAlpha * b
                    : ((1 - progress) / 0.7) * s.maxAlpha * b;

                if (s.life >= s.maxLife) {
                    this.sparks[idx] = this._freshSpark();
                }

                // Draw spark
                const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.s * 3);
                glow.addColorStop(0, `hsla(${s.hue}, 100%, 80%, ${s.alpha})`);
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.fillRect(s.x - s.s * 3, s.y - s.s * 3, s.s * 6, s.s * 6);

                // Core dot
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.s * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${s.hue}, 100%, 95%, ${s.alpha * 1.5})`;
                ctx.fill();
            });
        }

        /* ── Layer 4: Horizontal scan-line for cinematic CRT feel ── */
        const scanY = ((this.t * 30) % (H + 40)) - 20;
        const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(0.5, `rgba(200, 180, 255, ${0.03 * (1 - b * 0.5)})`);
        scanGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 30, W, 60);

        /* ── Layer 5: Gold horizon glow at bottom (resilience) ── */
        if (b > 0.2) {
            const horizGrad = ctx.createLinearGradient(0, H * 0.7, 0, H);
            horizGrad.addColorStop(0, 'transparent');
            horizGrad.addColorStop(1, `hsla(45, 100%, 60%, ${0.08 * b})`);
            ctx.fillStyle = horizGrad;
            ctx.fillRect(0, H * 0.7, W, H * 0.3);
        }
    }

    _freshLetter() {
        return {
            x: Math.random() * this.W, y: -40,
            w: 28 + Math.random() * 18, h: 20 + Math.random() * 12,
            speed: 0.5 + Math.random() * 1.0,
            rot: (Math.random() - 0.5) * 0.4,
            angle: (Math.random() - 0.5) * 0.5,
            driftX: (Math.random() - 0.5) * 0.3,
            alpha: 0.08 + Math.random() * 0.18,
            stamped: Math.random() > 0.5,
        };
    }

    _freshSpark() {
        return {
            x: Math.random() * this.W, y: this.H + 10,
            s: 0.8 + Math.random() * 2.2,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -(0.4 + Math.random() * 1.2),
            hue: 35 + Math.random() * 25,
            alpha: 0, maxAlpha: 0.3 + Math.random() * 0.5,
            life: 0, maxLife: 120 + Math.random() * 180,
        };
    }

    stop() {
        this.active = false;
        if (this.raf) cancelAnimationFrame(this.raf);
    }
}

/* ════════════════════════════════════════════════════
   SCENE 11
   ════════════════════════════════════════════════════ */
export default class Scene11 {
    constructor() {
        this.started = false;
        this.tl = null;
        this.cinema = null;
    }

    start() {
        if (this.started) return;
        this.started = true;
        this._initCinema();
        this._run();
    }

    _initCinema() {
        const c = $('s11-rejection-canvas');
        if (!c) return;
        this.cinema = new CinematicCanvas(c);
        this.cinema.init();
        this.cinema.start();
    }

    _run() {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        this.tl = tl;

        // ── Initial state ──
        gsap.set(['#s11-t1', '#s11-t2', '#s11-t3', '#s11-t4', '#s11-t5', '#s11-t-final', '#s11-t-never',
            '.s11-icon-wrap', '.s11-stamp', '#s11-next-trigger', '#s11-final-trigger-wrap',
            '#scene-11 .recap-btn'], { opacity: 0, y: 30 });
        gsap.set('.s11-stamp', { scale: 4, filter: 'blur(8px)', opacity: 0 });
        gsap.set('#s11-t-final', { scale: 0.8 });

        // Helper to scroll to a specific vertical offset within the scene
        const scrollScene = (yOffset, duration = 1.5) => {
            const sceneEl = $('scene-11');
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

        // ── ACT 1: Dark atmosphere drops in ──────────────────────
        tl.add(() => scrollScene(0)); // Start at top
        tl.to('#galaxy-canvas', {
            filter: 'brightness(0.2) saturate(0.3)',
            duration: 2, ease: 'power2.inOut'
        });
        tl.to('#vignette', {
            background: 'radial-gradient(circle, transparent 15%, #000 92%)',
            duration: 2
        }, '<');

        tl.fromTo('#s11-t1',
            { opacity: 0, y: 25, filter: 'blur(6px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5 },
            '+=0.3'
        );

        // ── ACT 2: Company icons appear ─────────────────────────
        tl.fromTo('.s11-icon-wrap',
            { opacity: 0, scale: 0.6, y: 20 },
            { opacity: 0.85, scale: 1, y: 0, duration: 0.8, stagger: 0.2 },
            '+=0.4'
        );

        // ── ACT 3: REJECTION stamps crash in one by one ─────────
        const iconEls = document.querySelectorAll('.s11-icon-wrap');
        iconEls.forEach((icon, i) => {
            const stamp = icon.querySelector('.s11-stamp');
            if (!stamp) return;

            tl.to(stamp, {
                opacity: 1, scale: 1, filter: 'blur(0px)',
                duration: 0.35, ease: 'back.out(3)'
            }, `+=${i === 0 ? 0.5 : 0.4}`);

            tl.add(() => {
                const rect = icon.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                if (this.cinema) this.cinema.triggerPulse(cx, cy);
            }, '<');

            tl.to(icon, {
                filter: 'grayscale(1) brightness(0.4)',
                opacity: 0.35,
                duration: 0.4
            }, '+=0.05');
        });

        tl.fromTo('#s11-t2',
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 1.2 },
            '+=0.4'
        );

        // ── ACT 4: Career Gap text ─────────────────
        tl.add(() => {
            // Mobile check for scroll offset
            const offset = window.innerWidth < 768 ? 150 : 100;
            scrollScene(offset);
        });
        tl.fromTo('#s11-t3',
            { opacity: 0, scale: 1.3, filter: 'blur(12px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' },
            '+=0.5'
        );
        tl.to('#scene-11', {
            x: 6, y: -3, duration: 0.08, repeat: 5, yoyo: true, ease: 'none'
        }, '<0.4');
        tl.set('#scene-11', { x: 0, y: 0 }, '+=0.05');

        tl.fromTo('#s11-t4',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 1 },
            '+=0.2'
        );

        // ── ACT 5: Pause ───────────
        tl.to(['#s11-t1', '#s11-t2', '#s11-t3', '#s11-t4', '.s11-icon-wrap'], {
            opacity: 0.5, duration: 2 // Increased from 0.18 to 0.5 for constant visibility
        }, '+=1');

        // ── ACT 6: RESILIENCE ───────────────────
        tl.add(() => {
            const offset = window.innerWidth < 768 ? 280 : 220;
            scrollScene(offset);
        });
        tl.to(this.cinema || {}, {
            phaseBlend: 1,
            duration: 3.5,
            ease: 'power1.inOut',
            onUpdate: () => {
                if (this.cinema) this.cinema.setPhaseBlend(this.cinema.phaseBlend);
            }
        }, '+=0.3');

        tl.to('#galaxy-canvas', {
            filter: 'brightness(0.65) saturate(1.3) hue-rotate(10deg)',
            duration: 3
        }, '<');
        tl.to('#vignette', {
            background: 'radial-gradient(circle, transparent 35%, rgba(0,0,0,0.82) 100%)',
            duration: 3
        }, '<');

        tl.fromTo('#s11-t5',
            { opacity: 0, y: 30, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'back.out(1.4)' },
            '-=2'
        );
        tl.to('#s11-t5', {
            textShadow: '0 0 40px rgba(251,191,36,0.8), 0 0 80px rgba(251,191,36,0.3)',
            duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
        });

        // ── ACT 7: THE FINAL BLOW ─────────
        tl.fromTo('#s11-t-final',
            { opacity: 0, scale: 0.7, y: 50, filter: 'blur(20px)' },
            {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 2.2, ease: 'expo.out'
            },
            '+=0.5'
        );

        // "But she never gave up." 💜
        tl.fromTo('#s11-t-never',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' },
            '+=0.6'
        );

        tl.to('#s11-t-final, #s11-t-never', {
            textShadow: '0 0 60px rgba(251,191,36,1), 0 0 120px rgba(251,191,36,0.5), 0 0 200px rgba(167,139,250,0.3)',
            duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut'
        }, '+=0.1');

        // ── ACT 8: Next button ───────────────────────────────────
        tl.add(() => {
            const offset = window.innerWidth < 768 ? 450 : 400;
            scrollScene(offset);
        });

        tl.fromTo('#s11-final-trigger-wrap',
            { opacity: 0, scale: 0.8, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'back.out(1.7)' },
            '+=0.5'
        );
        tl.fromTo('#scene-11 .recap-btn',
            { opacity: 0, scale: 0.8 },
            { opacity: 0.6, scale: 1, duration: 1 }, '-=1.5'
        );

        tl.add(() => window.dispatchEvent(new CustomEvent('scene11:complete')), '+=0.3');
    }

    reset() {
        this.started = false;
        if (this.tl) {
            this.tl.pause().kill();
            this.tl.clear();
            this.tl = null;
        }
        if (this.cinema) { this.cinema.stop(); this.cinema = null; }

        gsap.set('#galaxy-canvas', { filter: 'none' });
        gsap.set('#vignette', { background: '' });
        gsap.set('#scene-11', { x: 0, y: 0 });

        gsap.set(['#s11-t1', '#s11-t2', '#s11-t3', '#s11-t4', '#s11-t5', '#s11-t-final', '#s11-t-never',
            '.s11-icon-wrap', '.s11-stamp', '#s11-next-trigger', '#s11-final-trigger-wrap',
            '#scene-11 .recap-btn'
        ], {
            opacity: 0, y: 0, scale: 1, filter: 'none',
            clearProps: 'textShadow,boxShadow,x,transform,filter'
        });
        gsap.set('.s11-stamp', { scale: 4, filter: 'blur(8px)', opacity: 0 });
        gsap.set('.s11-icon-wrap', { filter: 'none', opacity: 0 });
    }

    skipToEnd() {
        if (this.started) return;
        this.started = true;
        this._initCinema();
        if (this.cinema) this.cinema.setPhaseBlend(1);

        gsap.set('#galaxy-canvas', { filter: 'brightness(0.65) saturate(1.3)' });

        // Show all story lines and icons
        gsap.set([
            '#s11-t1', '#s11-t2', '#s11-t3', '#s11-t4', '#s11-t5', '#s11-t-final', '#s11-t-never',
            '.s11-icon-wrap', '#s11-next-trigger', '#s11-final-trigger-wrap'
        ], { opacity: 1, y: 0, scale: 1, filter: 'none' });

        // Half-dim the earlier lines for that 'constant' but focused look
        gsap.set(['#s11-t1', '#s11-t2', '#s11-t3', '#s11-t4', '.s11-icon-wrap'], { opacity: 0.5 });

        // Show rejections stamps in their final state
        gsap.set('.s11-stamp', { opacity: 1, scale: 1, filter: 'none' });

        gsap.set('#scene-11 .recap-btn', { opacity: 0.6, scale: 1 });
    }
}
