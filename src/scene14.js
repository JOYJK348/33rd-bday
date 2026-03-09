/**
 * scene14.js — "The Grand Finale" ✨
 * A cinematic, inspirational birthday finale.
 * Fireworks · Floating Hearts · Star Rain · 
 * Birthday Wish · Closing Message
 */
import gsap from 'gsap';

const $ = id => document.getElementById(id);

/* ══════════════════════════════════════════════════
   FIREWORKS CANVAS
   ══════════════════════════════════════════════════ */
class FireworksCanvas {
    constructor(canvas) {
        this.c = canvas;
        this.ctx = canvas.getContext('2d');
        this.raf = null;
        this.active = false;
        this.rockets = [];
        this.W = 0;
        this.H = 0;
        this.t = 0;
        this.launchInterval = null;
    }

    init() {
        const isMobile = window.innerWidth < 768;
        const dpr = isMobile ? Math.min(devicePixelRatio, 1.25) : Math.min(devicePixelRatio, 2);
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.c.width = this.W * dpr;
        this.c.height = this.H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    _launchRocket() {
        const x = this.W * (0.2 + Math.random() * 0.6);
        const targetY = this.H * (0.1 + Math.random() * 0.45);
        const hue = Math.random() * 360;
        const particles = [];
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? 35 : (60 + Math.floor(Math.random() * 50));

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 2.5 + Math.random() * 4;
            particles.push({
                x, y: targetY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                hue: hue + (Math.random() - 0.5) * 40,
                size: 1.5 + Math.random() * 2.5,
                tail: []
            });
        }
        // Add a starburst center
        this.rockets.push({ x, y: targetY, particles, exploded: true });
    }

    start() {
        this.active = true;

        // First burst immediately
        this._launchRocket();

        // Then burst every 900ms
        this.launchInterval = setInterval(() => {
            if (!this.active) return;
            this._launchRocket();
            if (Math.random() > 0.5) {
                setTimeout(() => this.active && this._launchRocket(), 300);
            }
        }, 900);

        const loop = () => {
            if (!this.active) return;
            this.raf = requestAnimationFrame(loop);
            this.t += 0.02;
            const ctx = this.ctx;

            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.fillRect(0, 0, this.W, this.H);

            this.rockets = this.rockets.filter(rk => {
                rk.particles = rk.particles.filter(p => p.alpha > 0.02);
                rk.particles.forEach(p => {
                    p.tail.push({ x: p.x, y: p.y, a: p.alpha * 0.4 });
                    if (p.tail.length > 5) p.tail.shift();

                    // Draw tail
                    p.tail.forEach((t, ti) => {
                        ctx.beginPath();
                        ctx.arc(t.x, t.y, p.size * 0.4 * (ti / p.tail.length), 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${t.a * (ti / p.tail.length)})`;
                        ctx.fill();
                    });

                    // Draw particle
                    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
                    grd.addColorStop(0, `hsla(${p.hue}, 100%, 95%, ${p.alpha})`);
                    grd.addColorStop(1, `hsla(${p.hue}, 100%, 65%, 0)`);
                    ctx.fillStyle = grd;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                    ctx.fill();

                    p.x += p.vx;
                    p.y += p.vy + 0.06; // gentle gravity
                    p.vx *= 0.97;
                    p.vy *= 0.97;
                    p.alpha *= 0.96;
                });
                return rk.particles.length > 0;
            });
        };

        requestAnimationFrame(loop);
    }

    stop() {
        this.active = false;
        if (this.raf) cancelAnimationFrame(this.raf);
        if (this.launchInterval) clearInterval(this.launchInterval);
    }
}

/* ══════════════════════════════════════════════════
   STARS / SPARKLE CANVAS
   ══════════════════════════════════════════════════ */
class StarsCanvas {
    constructor(canvas) {
        this.c = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = [];
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

        const count = isMobile ? 50 : 120;
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                r: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.5,
                hue: [270, 30, 330, 200][Math.floor(Math.random() * 4)]
            });
        }
    }

    start() {
        this.active = true;
        const loop = () => {
            if (!this.active) return;
            this.raf = requestAnimationFrame(loop);
            this.t += 0.015;
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.W, this.H);
            this.stars.forEach(s => {
                const a = 0.3 + 0.7 * Math.abs(Math.sin(this.t * s.speed + s.phase));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * (0.8 + 0.4 * Math.sin(this.t + s.phase)), 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${s.hue}, 90%, 85%, ${a})`;
                ctx.fill();
            });
        };
        requestAnimationFrame(loop);
    }

    stop() {
        this.active = false;
        if (this.raf) cancelAnimationFrame(this.raf);
    }
}

/* ══════════════════════════════════════════════════
   FLOATING HEARTS
   ══════════════════════════════════════════════════ */
function spawnHearts(container) {
    const hearts = ['💜', '✨', '🌟', '💜', '🎉', '💫', '💜', '🌸'];
    let count = 0;
    const max = 18;
    const interval = setInterval(() => {
        if (count >= max) { clearInterval(interval); return; }
        count++;
        const span = document.createElement('div');
        span.className = 's14-float-heart';
        span.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        span.style.left = `${5 + Math.random() * 90}%`;
        span.style.fontSize = `${1.2 + Math.random() * 1.8}rem`;
        container.appendChild(span);
        gsap.fromTo(span,
            { opacity: 0, y: 0, scale: 0.5 },
            {
                opacity: 1, scale: 1, y: -(120 + Math.random() * 200),
                duration: 2.5 + Math.random() * 2,
                ease: 'power1.out',
                delay: Math.random() * 0.5,
                onComplete: () => {
                    gsap.to(span, { opacity: 0, duration: 0.6, onComplete: () => span.remove() });
                }
            }
        );
    }, 180);

    // Loop hearts
    setInterval(() => {
        const span = document.createElement('div');
        span.className = 's14-float-heart';
        span.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        span.style.left = `${5 + Math.random() * 90}%`;
        span.style.fontSize = `${0.9 + Math.random() * 1.4}rem`;
        container.appendChild(span);
        gsap.fromTo(span,
            { opacity: 0, y: 0, scale: 0.3 },
            {
                opacity: 0.85, scale: 1, y: -(100 + Math.random() * 180),
                duration: 3 + Math.random() * 2,
                ease: 'power1.out',
                onComplete: () => span.remove()
            }
        );
    }, 900);
}

/* ══════════════════════════════════════════════════
   SCENE 14 CLASS
   ══════════════════════════════════════════════════ */
export default class Scene14 {
    constructor() {
        this.started = false;
        this.tl = null;
        this.fireworks = null;
        this.stars = null;
    }

    start() {
        if (this.started) return;
        this.started = true;
        this._initCanvases();
        this._run();
    }

    _initCanvases() {
        const fc = $('s14-fireworks-canvas');
        if (fc) {
            this.fireworks = new FireworksCanvas(fc);
            this.fireworks.init();
        }
        const sc = $('s14-stars-canvas');
        if (sc) {
            this.stars = new StarsCanvas(sc);
            this.stars.init();
            this.stars.start();
        }
    }

    _run() {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        this.tl = tl;

        const allEls = [
            '#s14-you-are', '#s14-title', '#s14-title-underline',
            '.s14-pillar',
            '#s14-quote-line1', '#s14-quote-line2', '#s14-quote-attr',
            '#s14-bday-cake', '#s14-bday-number', '#s14-bday-text', '#s14-bday-sub',
            '#s14-closing', '#scene-14 .recap-btn'
        ];
        gsap.set(allEls, { opacity: 0, y: 30 });
        gsap.set('.s14-pillar', { opacity: 0, scale: 0.6, y: 20 });
        gsap.set('#s14-title', { opacity: 0, scale: 0.7 });
        gsap.set('#s14-title-underline', { scaleX: 0, opacity: 0, transformOrigin: 'left center' });
        gsap.set('#s14-bday-cake', { opacity: 0, scale: 0.3 });
        gsap.set('#s14-bday-number', { opacity: 0, scale: 0.5 });
        gsap.set([...document.querySelectorAll('.s14-glow-orb')], { opacity: 0, scale: 0.5 });

        // ── ACT 1: Galaxy glows up ──
        tl.to('#galaxy-canvas', {
            filter: 'brightness(1) saturate(1.8) hue-rotate(10deg)',
            duration: 3, ease: 'power1.inOut'
        });

        // Glow orbs bloom
        tl.to('.s14-glow-orb', {
            opacity: 1, scale: 1,
            duration: 2.5, stagger: 0.4, ease: 'power2.out'
        }, '<0.3');

        // ── ACT 2: "You are our Inspiration" ──
        tl.fromTo('#s14-you-are',
            { opacity: 0, y: 20, letterSpacing: '0.4em' },
            { opacity: 1, y: 0, letterSpacing: '0.25em', duration: 1.2 },
            '+=0.4'
        );

        tl.fromTo('#s14-title',
            { opacity: 0, scale: 0.5, filter: 'blur(20px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 2, ease: 'expo.out' },
            '+=0.2'
        );

        tl.to('#s14-title', {
            textShadow: '0 0 60px rgba(251,191,36,1), 0 0 120px rgba(251,191,36,0.6), 0 0 200px rgba(167,139,250,0.4)',
            duration: 0.8
        });

        tl.to('#s14-title-underline', {
            scaleX: 1, opacity: 1, duration: 1.2, ease: 'power3.out'
        }, '-=0.4');

        // Fireworks begin when title appears
        tl.add(() => {
            if (this.fireworks) this.fireworks.start();
        }, '-=1');

        // ── ACT 3: Pillars of strength appear ──
        tl.fromTo('.s14-pillar',
            { opacity: 0, scale: 0.4, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.18, ease: 'back.out(2)' },
            '+=0.6'
        );

        // Each pillar glows in turn
        tl.to('.s14-pillar', {
            boxShadow: '0 0 30px rgba(167,139,250,0.5), 0 0 60px rgba(251,191,36,0.2)',
            duration: 0.5, stagger: 0.18
        }, '<0.2');

        // ── ACT 4: The Quote ──
        tl.fromTo('#s14-quote-line1',
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 1.2, ease: 'power3.out' },
            '+=0.5'
        );
        tl.fromTo('#s14-quote-line2',
            { opacity: 0, x: 30 },
            { opacity: 1, x: 0, duration: 1.2, ease: 'power3.out' },
            '-=0.8'
        );
        tl.fromTo('#s14-quote-attr',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 1 },
            '+=0.3'
        );

        // ── ACT 5: Birthday section ──
        // Cake bounces in
        tl.fromTo('#s14-bday-cake',
            { opacity: 0, scale: 0.2, y: 30 },
            { opacity: 1, scale: 1.2, y: 0, duration: 1, ease: 'back.out(2.5)' },
            '+=0.6'
        );
        tl.to('#s14-bday-cake', { scale: 1, duration: 0.4 });

        // "33" number spins in
        tl.fromTo('#s14-bday-number',
            { opacity: 0, scale: 0.2, rotation: -180 },
            { opacity: 1, scale: 1, rotation: 0, duration: 1.2, ease: 'back.out(1.5)' },
            '-=0.3'
        );
        tl.to('#s14-bday-number', {
            textShadow: '0 0 40px rgba(251,191,36,1), 0 0 80px rgba(251,191,36,0.5)',
            duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut'
        });

        // Birthday text fades in
        tl.fromTo('#s14-bday-text',
            { opacity: 0, scale: 0.8, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: 'back.out(1.3)' },
            '+=0.2'
        );
        tl.to('#s14-name', {
            textShadow: '0 0 30px rgba(167,139,250,0.9)',
            duration: 0.6
        });

        tl.fromTo('#s14-bday-sub',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.2 },
            '+=0.3'
        );

        // ── ACT 6: Floating hearts explode ──
        tl.add(() => {
            const container = $('s14-hearts-container');
            if (container) spawnHearts(container);
        }, '-=0.5');

        // ── ACT 7: Closing line ──
        tl.fromTo('#s14-closing',
            { opacity: 0, scale: 0.9, filter: 'blur(8px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.8, ease: 'expo.out' },
            '+=0.8'
        );
        tl.to('#s14-closing', {
            textShadow: '0 0 50px rgba(167,139,250,0.9), 0 0 100px rgba(251,191,36,0.4)',
            duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
        }, '+=0.2');

        // Recap button
        tl.fromTo('#scene-14 .recap-btn',
            { opacity: 0, scale: 0.8 },
            { opacity: 0.6, scale: 1, duration: 0.8 },
            '+=0.3'
        );
    }

    reset() {
        this.started = false;
        if (this.tl) { this.tl.pause().kill(); this.tl = null; }
        if (this.fireworks) { this.fireworks.stop(); this.fireworks = null; }
        if (this.stars) { this.stars.stop(); this.stars = null; }

        gsap.set('#galaxy-canvas', { filter: 'none' });
        gsap.set('.s14-glow-orb', { opacity: 0, scale: 0.5 });

        const all = [
            '#s14-you-are', '#s14-title', '#s14-title-underline',
            '.s14-pillar',
            '#s14-quote-line1', '#s14-quote-line2', '#s14-quote-attr',
            '#s14-bday-cake', '#s14-bday-number', '#s14-bday-text', '#s14-bday-sub',
            '#s14-closing', '#scene-14 .recap-btn'
        ];
        gsap.set(all, { opacity: 0, y: 0, scale: 1, clearProps: 'textShadow,filter,boxShadow,rotation,x' });

        const container = $('s14-hearts-container');
        if (container) container.innerHTML = '';
    }

    skipToEnd() {
        if (this.started) return;
        this.started = true;
        this._initCanvases();

        gsap.set('#galaxy-canvas', { filter: 'brightness(1) saturate(1.8)' });
        gsap.set('.s14-glow-orb', { opacity: 1, scale: 1 });
        const all = [
            '#s14-you-are', '#s14-title', '#s14-title-underline',
            '.s14-pillar',
            '#s14-quote-line1', '#s14-quote-line2', '#s14-quote-attr',
            '#s14-bday-cake', '#s14-bday-number', '#s14-bday-text', '#s14-bday-sub',
            '#s14-closing', '#scene-14 .recap-btn'
        ];
        gsap.set(all, { opacity: 1, y: 0, scale: 1 });
    }
}
