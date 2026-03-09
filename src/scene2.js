/**
 * scene2.js — Grand Birthday Reveal ✨
 * CINEMATIC REWRITE:
 * Massive fireworks · Shockwave rings · Floating emojis
 * Heartbeat line · Badge row · Tagline
 */
import gsap from 'gsap';

const $ = (s) => document.querySelector(s);

/* ══════════════════════════════════════════════════
   PALETTE
   ══════════════════════════════════════════════════ */
const P_HUES = [265, 275, 285, 295, 305, 315];
const G_HUES = [42, 47, 52, 58];
const R_HUES = [0, 350, 10]; // rose/pink
const MIX = [...P_HUES, ...P_HUES, ...G_HUES, ...R_HUES, 180, 200];

/* ══════════════════════════════════════════════════
   DRAWING HELPERS
   ══════════════════════════════════════════════════ */
function drawStar(ctx, x, y, r, points = 5) {
    const ir = r * 0.4;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const a = (i * Math.PI) / points - Math.PI / 2;
        const d = i % 2 === 0 ? r : ir;
        i === 0 ? ctx.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d)
            : ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    ctx.closePath(); ctx.fill();
}

function drawHeart(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 10, s / 10);
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.bezierCurveTo(5, -8, 10, -2, 0, 6);
    ctx.bezierCurveTo(-10, -2, -5, -8, 0, -2);
    ctx.closePath(); ctx.fill(); ctx.restore();
}

/* ══════════════════════════════════════════════════
   ENHANCED FIREWORK — 3 layers + sparkle rings
   ══════════════════════════════════════════════════ */
class Firework {
    constructor(W, H, layer, forced) {
        this.layer = layer;
        this.W = W; this.H = H;
        // forced = { x, y } for center burst
        if (forced) {
            this.x = forced.x;
            this.y = forced.y;
        } else {
            const yBands = [[0.04, 0.28], [0.06, 0.42], [0.04, 0.36]];
            this.x = W * (0.08 + Math.random() * 0.84);
            this.y = H * (yBands[layer][0] + Math.random() * (yBands[layer][1] - yBands[layer][0]));
        }
        const isMobile = window.innerWidth < 768;
        const cnt = isMobile ? [20, 35, 50][layer] : [40, 70, 100][layer];
        const spd = [3, 5, 7.5][layer];

        this.particles = Array.from({ length: cnt }, (_, i) => {
            const a = (i / cnt) * Math.PI * 2;
            const v = spd * (0.5 + Math.random() * 0.9);
            const type = Math.random();
            return {
                x: this.x, y: this.y,
                vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.5,
                life: 1,
                size: 1.5 + Math.random() * (layer * 1.5 + 1.5),
                trail: [],
                hue: this.hue + (Math.random() - 0.5) * 40,
                shape: isMobile ? 'circle' : (type < 0.35 ? 'circle' : type < 0.6 ? 'star' : type < 0.8 ? 'heart' : 'circle')
            };
        });

        // Add sparkle ring burst at center
        this.sparkles = Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const v = 1.5 + Math.random() * 2;
            return {
                x: this.x, y: this.y,
                vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                life: 1, size: 2 + Math.random() * 3,
                hue: this.hue + 30
            };
        });

        this.dead = false;
    }

    update(dt) {
        const isMobile = window.innerWidth < 768;
        const g = [25, 50, 80][this.layer];
        const drag = 0.975;
        const decay = [0.28, 0.48, 0.62][this.layer];

        this.particles.forEach(p => {
            const maxTrail = isMobile ? 0 : 10;
            if (maxTrail > 0) {
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > maxTrail) p.trail.shift();
            }
            p.vx *= drag; p.vy *= drag; p.vy += g * dt;
            p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
            p.life -= decay * dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        this.sparkles.forEach(s => {
            s.x += s.vx; s.y += s.vy;
            s.vy += 0.05;
            s.life -= 0.04;
        });
        this.sparkles = this.sparkles.filter(s => s.life > 0);

        if (!this.particles.length && !this.sparkles.length) this.dead = true;
    }

    draw(ctx) {
        this.particles.forEach(p => {
            // Draw trail - disabled on mobile
            if (p.trail && p.trail.length > 0) {
                p.trail.forEach((tp, ti) => {
                    ctx.globalAlpha = (ti / p.trail.length) * p.life * 0.5;
                    ctx.fillStyle = `hsl(${p.hue},90%,72%)`;
                    ctx.beginPath(); ctx.arc(tp.x, tp.y, p.size * 0.35, 0, Math.PI * 2); ctx.fill();
                });
            }

            ctx.globalAlpha = p.life;
            const isMobile = window.innerWidth < 768;
            if (!isMobile) {
                ctx.shadowColor = `hsl(${p.hue},100%,65%)`;
                ctx.shadowBlur = 10;
            }
            ctx.fillStyle = `hsl(${p.hue},95%,82%)`;

            if (p.shape === 'star') {
                drawStar(ctx, p.x, p.y, p.size * 1.3);
            } else if (p.shape === 'heart') {
                drawHeart(ctx, p.x, p.y, p.size * 1.8);
            } else {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            }
        });

        // Sparkle ring
        const isMobile = window.innerWidth < 768;
        this.sparkles.forEach(s => {
            ctx.globalAlpha = s.life;
            if (!isMobile) {
                ctx.shadowColor = `hsl(${s.hue},100%,75%)`;
                ctx.shadowBlur = 8;
            }
            ctx.fillStyle = `hsl(${s.hue},100%,90%)`;
            drawStar(ctx, s.x, s.y, s.size, 4);
        });

        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
}

/* ══════════════════════════════════════════════════
   ENHANCED CONFETTI
   ══════════════════════════════════════════════════ */
class Confetti {
    constructor(cx, cy, burst = false) {
        const isMobile = window.innerWidth < 768;
        const a = Math.random() * Math.PI * 2;
        const spd = burst ? (10 + Math.random() * 22) : (5 + Math.random() * 14);
        const r = Math.random();
        const hue = r < 0.4 ? P_HUES[Math.floor(Math.random() * P_HUES.length)]
            : r < 0.72 ? G_HUES[Math.floor(Math.random() * G_HUES.length)]
                : R_HUES[Math.floor(Math.random() * R_HUES.length)];
        const sat = 85 + Math.random() * 10;
        const lig = 60 + Math.random() * 20;
        this.x = cx; this.y = cy;
        this.vx = Math.cos(a) * spd; this.vy = Math.sin(a) * spd - (burst ? 14 : 9);
        this.size = isMobile ? (2 + Math.random() * 4) : (4 + Math.random() * 7);
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpd = (Math.random() - 0.5) * 10;
        const t = Math.random();
        this.heart = !isMobile && (t < 0.25);
        this.star = !isMobile && (t > 0.7);
        this.color = `hsl(${hue},${sat}%,${lig}%)`;
        this.shadow = `hsl(${hue},90%,55%)`;
        this.life = 1; this.trail = [];
        this.grav = 120 + Math.random() * 120;
        this.drag = 0.968;
    }
    update(dt) {
        const isMobile = window.innerWidth < 768;
        const maxTrail = isMobile ? 0 : 7;
        if (maxTrail > 0) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > maxTrail) this.trail.shift();
        }
        this.vx *= this.drag; this.vy *= this.drag;
        this.vy += this.grav * dt;
        this.x += this.vx * dt * 60; this.y += this.vy * dt * 60;
        this.rot += this.rotSpd * dt; this.life -= 0.18 * dt;
    }
    draw(ctx) {
        const isMobile = window.innerWidth < 768;
        if (!isMobile && this.trail && this.trail.length > 0) {
            this.trail.forEach((tp, ti) => {
                ctx.globalAlpha = (ti / this.trail.length) * this.life * 0.3;
                ctx.fillStyle = this.color;
                ctx.beginPath(); ctx.arc(tp.x, tp.y, this.size * 0.4, 0, Math.PI * 2); ctx.fill();
            });
        }
        ctx.globalAlpha = this.life;
        if (!isMobile) {
            ctx.shadowColor = this.shadow;
            ctx.shadowBlur = 8;
        }
        ctx.fillStyle = this.color;
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot);
        if (this.heart) drawHeart(ctx, 0, 0, this.size);
        else if (this.star) drawStar(ctx, 0, 0, this.size);
        else { ctx.beginPath(); ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    isDead() { return this.life <= 0 || this.y > window.innerHeight + 120; }
}

/* ══════════════════════════════════════════════════
   CELEBRATION SYSTEM
   ══════════════════════════════════════════════════ */
class CelebSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.fws = []; this.conf = [];
        this.running = false; this._last = null;
        this.W = 0; this.H = 0;
    }

    resize() {
        const isMobile = window.innerWidth < 768;
        const dpr = isMobile ? Math.min(devicePixelRatio, 1.25) : Math.min(devicePixelRatio, 2);
        this.W = window.innerWidth; this.H = window.innerHeight;
        this.canvas.width = this.W * dpr;
        this.canvas.height = this.H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Massive center burst
    bigBurst() {
        const isMobile = window.innerWidth < 768;
        const cx = this.W / 2, cy = this.H * 0.42;
        // Center mega firework
        this.fws.push(new Firework(this.W, this.H, 2, { x: cx, y: cy }));
        // Flanking bursts
        [cx - this.W * 0.22, cx + this.W * 0.22].forEach(x => {
            this.fws.push(new Firework(this.W, this.H, 1, { x, y: cy * 0.9 }));
        });
        // Confetti explosion
        const count = isMobile ? 80 : 200;
        for (let i = 0; i < count; i++) this.conf.push(new Confetti(cx, cy * 1.1, true));
    }

    _schedule() {
        const isMobile = window.innerWidth < 768;
        const s = [];
        // Background layer 0 — slow, sparse
        const count0 = isMobile ? 4 : 8;
        for (let i = 0; i < count0; i++) s.push({ t: 2 + i * 2.4 + Math.random() * 1.2, l: 0 });
        // Mid layer 1
        const count1 = isMobile ? 7 : 14;
        for (let i = 0; i < count1; i++) s.push({ t: 0.3 + i * 0.65 + Math.random() * 0.35, l: 1 });
        // Front layer 2 — big, fast
        const count2 = isMobile ? 5 : 10;
        for (let i = 0; i < count2; i++) s.push({ t: 0.1 + i * 0.4 + Math.random() * 0.2, l: 2 });
        this._sched = s.sort((a, b) => a.t - b.t);
        this._si = 0; this._elapsed = 0;
    }

    // Continuous celebration after the big burst
    _scheduleContinuous() {
        setInterval(() => {
            if (!this.running) return;
            const layer = Math.random() < 0.5 ? 1 : 2;
            this.fws.push(new Firework(this.W, this.H, layer));
            if (Math.random() > 0.6) {
                const cx = Math.random() * this.W;
                const cy = Math.random() * this.H * 0.4;
                for (let i = 0; i < 35; i++) this.conf.push(new Confetti(cx, cy));
            }
        }, 1400);
    }

    start() {
        if (this.running) return;
        this.resize();
        this._schedule();
        this.running = true;
        this._loop(performance.now());
        this._scheduleContinuous();
    }

    stop() { this.running = false; }

    reset() {
        this.stop();
        this.fws = []; this.conf = [];
        this.ctx?.clearRect(0, 0, this.W, this.H);
        this._elapsed = 0; this._si = 0; this._last = 0;
    }

    _loop(now) {
        if (!this.running) return;
        requestAnimationFrame(t => this._loop(t));
        const dt = this._last ? Math.min((now - this._last) / 1000, 0.05) : 0.016;
        this._last = now; this._elapsed += dt;

        while (this._si < this._sched?.length && this._elapsed >= this._sched[this._si].t)
            this.fws.push(new Firework(this.W, this.H, this._sched[this._si++].l));

        this.fws.forEach(f => f.update(dt));
        this.fws = this.fws.filter(f => !f.dead);
        this.conf.forEach(c => c.update(dt));
        this.conf = this.conf.filter(c => !c.isDead());

        this.ctx.clearRect(0, 0, this.W, this.H);
        this.fws.forEach(f => f.draw(this.ctx));
        this.conf.forEach(c => c.draw(this.ctx));
    }
}

/* ══════════════════════════════════════════════════
   ORBIT STARS (3 rings, alternating directions)
   ══════════════════════════════════════════════════ */
function spawnOrbitStars() {
    const ring = document.getElementById('s2-orbit-ring');
    if (!ring) return;
    ring.innerHTML = '';
    const isMobile = window.innerWidth < 768;
    const scale = isMobile ? 0.55 : 1;
    const rings = [
        { n: 10, minR: 160 * scale, maxR: 200 * scale, minD: 9, maxD: 12, hue: 45 },
        { n: 12, minR: 215 * scale, maxR: 265 * scale, minD: 13, maxD: 18, hue: 275 },
        { n: 12, minR: 275 * scale, maxR: 330 * scale, minD: 19, maxD: 25, hue: 285 },
    ];
    rings.forEach((cfg, ri) => {
        for (let i = 0; i < cfg.n; i++) {
            const el = document.createElement('div');
            el.className = 'orbit-star-33';
            const radius = cfg.minR + Math.random() * (cfg.maxR - cfg.minR);
            const duration = cfg.minD + Math.random() * (cfg.maxD - cfg.minD);
            const size = 2.5 + Math.random() * 3;
            const dir = ri % 2 === 0 ? 1 : -1;
            el.style.setProperty('--r', `${radius}px`);
            el.style.setProperty('--dur', `${duration}s`);
            el.style.setProperty('--del', `-${(i / cfg.n) * duration}s`);
            el.style.setProperty('--dir', `${dir}`);
            el.style.width = `${size}px`; el.style.height = `${size}px`;
            const h = cfg.hue + (Math.random() - 0.5) * 25;
            el.style.background = `hsl(${h},90%,80%)`;
            const isMobile = window.innerWidth < 768;
            if (!isMobile) {
                el.style.boxShadow = `0 0 ${size * 2.5}px ${size}px hsla(${h},90%,65%,0.7)`;
            } else {
                el.style.boxShadow = `0 0 10px hsla(${h},90%,65%,0.5)`;
            }
            ring.appendChild(el);
        }
    });
}

/* ══════════════════════════════════════════════════
   FLOATING EMOJI LAYER
   ══════════════════════════════════════════════════ */
function startEmojiRain(container) {
    const emojis = ['🎉', '🎊', '💜', '✨', '🌟', '🎈', '💫', '🎂', '🥳', '🎁', '💎', '🌸'];
    const isMobile = window.innerWidth < 768;
    const maxEmojis = isMobile ? 15 : 40;
    let count = 0;
    const spawnOne = () => {
        if (count > maxEmojis) return;
        count++;
        const el = document.createElement('span');
        el.className = 's2-emoji-float';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = `${2 + Math.random() * 96}%`;
        el.style.fontSize = `${1 + Math.random() * 2}rem`;
        el.style.top = '-3rem';
        container.appendChild(el);

        const duration = 4 + Math.random() * 4;
        const drift = (Math.random() - 0.5) * 120;

        gsap.fromTo(el,
            { y: 0, x: 0, opacity: 1, rotation: (Math.random() - 0.5) * 30 },
            {
                y: window.innerHeight + 80,
                x: drift,
                opacity: 0,
                rotation: (Math.random() - 0.5) * 180,
                duration,
                ease: 'power1.in',
                onComplete: () => el.remove()
            }
        );
    };

    // Initial burst: 15 emojis fast
    for (let i = 0; i < 15; i++) setTimeout(spawnOne, i * 120);

    // Then continuous trickle
    const interval = setInterval(() => {
        spawnOne();
        if (count >= 40) clearInterval(interval);
    }, 400);
}

/* ══════════════════════════════════════════════════
   HEARTBEAT SVG ANIMATION
   ══════════════════════════════════════════════════ */
function animateHeartbeat(tl) {
    const line = document.getElementById('s2-hb-line');
    if (!line) return;
    const len = line.getTotalLength?.() || 600;
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    tl.to(line, {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: 'power2.inOut'
    }, '+=0.3');
    // Pulse the line color
    tl.to(line, {
        stroke: '#fbbf24',
        duration: 0.4,
        yoyo: true,
        repeat: 3,
        ease: 'sine.inOut'
    }, '<0.5');
}

/* ══════════════════════════════════════════════════
   SUBTITLE BEAM ANIMATION
   ══════════════════════════════════════════════════ */
function animateSubtitle(tl) {
    const el = document.getElementById('s2-subtitle');
    const beam = document.getElementById('s2-beam');
    if (!el) return;
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = ''; el.style.opacity = '1';
    words.forEach((w, i) => {
        const span = document.createElement('span');
        span.className = 's2-word';
        span.textContent = w + (i < words.length - 1 ? '\u00A0' : '');
        el.appendChild(span);
    });
    const wEls = el.querySelectorAll('.s2-word');
    tl.fromTo(beam,
        { left: '-5%', opacity: 0.9 },
        { left: '105%', opacity: 0, duration: wEls.length * 0.26 + 0.4, ease: 'none' },
        '+=0.5'
    );
    const isMobile = window.innerWidth < 768;
    tl.to(wEls, {
        opacity: 1,
        filter: isMobile ? 'none' : 'blur(0px)',
        textShadow: isMobile ? '0 2px 10px rgba(0,0,0,0.8)' : '0 0 20px rgba(192,132,252,0.7)',
        duration: isMobile ? 0.2 : 0.32,
        stagger: isMobile ? 0.1 : 0.22,
        ease: 'power1.out'
    }, '<0.1');
}

/* ══════════════════════════════════════════════════
   SCENE 2 CLASS
   ══════════════════════════════════════════════════ */
export default class Scene2 {
    constructor(galaxy) {
        this.galaxy = galaxy;
        this.cel = new CelebSystem(document.getElementById('celebration-canvas'));
        this.started = false;
    }

    start() {
        if (this.started) return;
        this.started = true;
        spawnOrbitStars();

        const tl = gsap.timeline();
        this.tl = tl;

        // ── ACT 1: Tiny spark ignites ──
        tl.to('#scene2-spark', { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' });
        tl.to('#scene2-spark', { scale: 15, duration: 0.5, ease: 'power4.in' });

        // ── ACT 2: MEGA BOOM + rings ──
        tl.add(() => {
            this.cel.start();
            this.cel.bigBurst();
        });

        // Three expanding shockwave rings
        const isMobile = window.innerWidth < 768;
        const ringConfigs = isMobile ? [['#s2-ring-1', 0.8, 'rgba(192,132,252,0.9)']] : [
            ['#s2-ring-1', 1.2, 'rgba(192,132,252,0.9)'],
            ['#s2-ring-2', 1.7, 'rgba(255,215,0,0.8)'],
            ['#s2-ring-3', 2.3, 'rgba(244,114,182,0.7)']
        ];

        ringConfigs.forEach(([id, d, color], i) => {
            tl.set(id, { opacity: 1, scale: 0.04, borderColor: color }, '<');
            tl.to(id, { scale: 11, opacity: 0, duration: d, ease: 'power1.out' }, `<${i * 0.08}`);
        });

        tl.to('#scene2-spark', { opacity: 0, duration: 0.25, ease: 'power2.out' }, '<');
        tl.to('#galaxy-canvas', {
            filter: 'brightness(1.6) saturate(1.4)',
            duration: 0.2, yoyo: true, repeat: 2, ease: 'none'
        }, '<');

        // ── ACT 3: Content arrives ──
        tl.from('#scene-2-content', { scale: 1.1, duration: 0.7, ease: 'power2.out' }, '<0.2');

        // Today label sparkles in
        tl.fromTo('#s2-today-label',
            { opacity: 0, y: -20, letterSpacing: '0.5em' },
            { opacity: 1, y: 0, letterSpacing: '0.2em', duration: 0.9, ease: 'power2.out' },
            '+=0.1'
        );

        // "Happy Birthday" above
        tl.to('#s2-happy-bday', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '+=0.15');

        // ── ACT 4: NAME — the hero moment ──
        tl.to('#s2-name', { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.7)' }, '+=0.2');
        tl.to('#s2-name', {
            textShadow: '0 0 80px rgba(255,215,0,1), 0 0 160px rgba(255,215,0,0.7), 0 0 240px rgba(192,132,252,0.5)',
            duration: 0.5, yoyo: true, repeat: 1, ease: 'power2.inOut'
        });
        tl.add(() => document.getElementById('s2-name')?.classList.add('beating'));

        // Emoji rain starts
        tl.add(() => {
            const layer = document.getElementById('s2-emoji-layer');
            if (layer) startEmojiRain(layer);
        }, '<0.5');

        // Orbit stars
        tl.to('#s2-orbit-ring', { opacity: 1, duration: 1.2, ease: 'power1.in' }, '+=0.3');

        // ── ACT 5: Number badge + traits ──
        tl.fromTo('#s2-number-badge',
            { opacity: 0, scale: 0.5, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(2)' },
            '+=0.3'
        );

        tl.fromTo('.s2-badge',
            { opacity: 0, scale: 0.6, y: 15 },
            { opacity: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.18, ease: 'back.out(2.5)' },
            '+=0.2'
        );
        tl.to('.s2-badge', {
            boxShadow: '0 0 25px rgba(167,139,250,0.5), 0 8px 30px rgba(0,0,0,0.4)',
            duration: 0.4, stagger: 0.12
        }, '<0.1');

        // ── ACT 6: Subtitle beam ──
        animateSubtitle(tl);

        // ── ACT 7: Heartbeat line draws ──
        animateHeartbeat(tl);

        // ── ACT 8: Final tagline ──
        tl.fromTo('#s2-tagline',
            { opacity: 0, scale: 0.92, filter: 'blur(8px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'expo.out' },
            '+=0.3'
        );
        tl.to('#s2-tagline', {
            textShadow: '0 0 30px rgba(251,191,36,0.7)',
            duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
        });

        this.tl = tl;
    }

    reset() {
        this.started = false;
        if (this.tl) this.tl.kill();
        this.cel.reset();

        gsap.set([
            '#s2-happy-bday', '#s2-name', '#s2-subtitle', '#s2-orbit-ring',
            '#scene2-spark', '.s2-ring', '#s2-today-label', '#s2-number-badge',
            '.s2-badge', '#s2-tagline'
        ], { opacity: 0 });
        gsap.set('#s2-name', { scale: 0.75 });
        gsap.set('#s2-happy-bday', { y: 10 });
        gsap.set('#s2-today-label', { y: -20 });
        gsap.set('#s2-number-badge', { scale: 0.5, y: 20 });
        document.getElementById('s2-name')?.classList.remove('beating');

        const hbLine = document.getElementById('s2-hb-line');
        if (hbLine) {
            const len = hbLine.getTotalLength?.() || 600;
            gsap.set(hbLine, { strokeDasharray: len, strokeDashoffset: len });
        }

        document.querySelectorAll('.s2-word').forEach(w => {
            gsap.set(w, { opacity: 0, filter: 'blur(10px)' });
        });

        const emojiLayer = document.getElementById('s2-emoji-layer');
        if (emojiLayer) emojiLayer.innerHTML = '';
    }

    skipToEnd() {
        if (this.started) return;
        this.started = true;
        spawnOrbitStars();
        this.cel.start();

        gsap.set('#scene2-spark', { opacity: 0 });
        gsap.set('.s2-ring', { opacity: 0 });
        gsap.set(['#s2-today-label', '#s2-happy-bday'], { opacity: 1, y: 0 });
        gsap.set('#s2-name', { opacity: 1, scale: 1 });
        gsap.set('#s2-orbit-ring', { opacity: 1 });
        gsap.set('#s2-subtitle', { opacity: 1 });
        gsap.set(['#s2-number-badge', '.s2-badge', '#s2-tagline'], { opacity: 1, scale: 1, y: 0 });

        const hbLine = document.getElementById('s2-hb-line');
        if (hbLine) gsap.set(hbLine, { strokeDashoffset: 0 });

        const words = document.querySelectorAll('.s2-word');
        words.forEach(w => { w.style.opacity = '1'; w.style.filter = 'none'; });

        document.getElementById('s2-name')?.classList.add('beating');
    }
}
