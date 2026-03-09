/**
 * scene3.js — The Quiet Magic 🕯️
 * Birthday cake · 33 candles one by one · Make a wish
 */
import gsap from 'gsap';
const $ = s => document.querySelector(s);

/* ── rounded rect helper ── */
function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

/* ══════════════ CAKE RENDERER ══════════════ */
class CakeRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.candles = []; this._tiers = [];
        this.litCount = 0; this._t = 0; this._raf = null;
    }

    init() {
        const dpr = Math.min(devicePixelRatio, 2);
        const W = Math.min(400, window.innerWidth * 0.8);
        const H = W * 0.82;
        this.W = W; this.H = H;
        this.canvas.width = W * dpr; this.canvas.height = H * dpr;
        this.canvas.style.width = `${W}px`; this.canvas.style.height = `${H}px`;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this._buildLayout();
    }

    _buildLayout() {
        const { W, H } = this;
        const cx = W / 2;
        // 3 tiers: 13 + 11 + 9 = 33 candles
        this._tiers = [
            { cx, y: H * 0.84, w: W * 0.74, h: H * 0.11, n: 13 },
            { cx, y: H * 0.70, w: W * 0.56, h: H * 0.10, n: 11 },
            { cx, y: H * 0.57, w: W * 0.40, h: H * 0.09, n: 9 },
        ];
        this.candles = [];
        this._tiers.forEach(tier => {
            for (let i = 0; i < tier.n; i++) {
                const x = (tier.cx - tier.w / 2) + (i + 0.5) * (tier.w / tier.n);
                this.candles.push({
                    x, y: tier.y, lit: false, blown: false,
                    phase: Math.random() * Math.PI * 2, smoke: [],
                });
            }
        });
    }

    lightOne(idx) {
        if (idx < this.candles.length) { this.candles[idx].lit = true; this.litCount++; }
    }

    blowAll(onDone) {
        this.candles.forEach((c, i) => {
            setTimeout(() => {
                c.lit = false; c.blown = true;
                for (let j = 0; j < 7; j++) c.smoke.push({
                    x: c.x, y: c.y - 20,
                    vx: (Math.random() - 0.5) * 1.3, vy: -(1 + Math.random() * 2),
                    life: 1, r: 1.5 + Math.random() * 2,
                });
            }, i * 50);
        });
        setTimeout(onDone, this.candles.length * 50 + 2000);
    }

    startLoop() {
        let last = null;
        const tick = now => {
            this._raf = requestAnimationFrame(tick);
            const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016; last = now;
            this._t += dt;
            this.candles.forEach(c => {
                c.smoke.forEach(s => { s.x += s.vx; s.y += s.vy; s.vx *= 0.97; s.life -= 0.007; s.r += 0.06; });
                c.smoke = c.smoke.filter(s => s.life > 0);
            });
            this._draw();
        };
        requestAnimationFrame(tick);
    }

    _draw() {
        const { ctx, W, H, _t: t } = this;
        const warm = this.litCount / 33;
        ctx.clearRect(0, 0, W, H);

        // Ambient warm glow
        if (warm > 0) {
            const ag = ctx.createRadialGradient(W / 2, H * 0.68, 0, W / 2, H * 0.68, W * 0.75);
            ag.addColorStop(0, `rgba(255,175,55,${warm * 0.22})`);
            ag.addColorStop(0.5, `rgba(255,120,30,${warm * 0.1})`);
            ag.addColorStop(1, 'transparent');
            ctx.fillStyle = ag; ctx.fillRect(0, 0, W, H);
        }

        // Gold plate
        const pg = ctx.createLinearGradient(W * 0.1, 0, W * 0.9, 0);
        pg.addColorStop(0, '#8B6914'); pg.addColorStop(0.5, '#FFD700'); pg.addColorStop(1, '#8B6914');
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.ellipse(W / 2, H * 0.924, W * 0.44, H * 0.033, 0, 0, Math.PI * 2); ctx.fill();

        // Tiers (bottom up)
        [...this._tiers].reverse().forEach(tier => {
            const x = tier.cx - tier.w / 2, y = tier.y;
            ctx.save();
            ctx.shadowColor = `rgba(255,150,50,${warm * 0.35})`; ctx.shadowBlur = warm * 25;
            const bg = ctx.createLinearGradient(x, y, x + tier.w, y + tier.h);
            bg.addColorStop(0, '#4C1D95'); bg.addColorStop(0.4, '#6D28D9');
            bg.addColorStop(0.6, '#8B5CF6'); bg.addColorStop(1, '#4C1D95');
            ctx.fillStyle = bg; rrect(ctx, x, y, tier.w, tier.h, 7); ctx.fill(); ctx.restore();

            // Gold frosting rim
            const rg = ctx.createLinearGradient(x, y, x + tier.w, y);
            rg.addColorStop(0, '#7A5E0A'); rg.addColorStop(0.5, '#FFD700'); rg.addColorStop(1, '#7A5E0A');
            ctx.fillStyle = rg; rrect(ctx, x, y, tier.w, 8, 4); ctx.fill();

            // Pearl dots
            for (let i = 1; i < 7; i++) {
                ctx.fillStyle = 'rgba(255,215,0,0.55)';
                ctx.beginPath(); ctx.arc(x + (tier.w / 7) * i, y + tier.h - 6, 2.5, 0, Math.PI * 2); ctx.fill();
            }
        });

        // Candles
        this.candles.forEach(c => {
            const sH = 16, sW = 4, fy0 = c.y - sH - 5;
            // Stick
            const sg = ctx.createLinearGradient(c.x - sW / 2, 0, c.x + sW / 2, 0);
            sg.addColorStop(0, '#FFF8E7'); sg.addColorStop(0.5, '#FFFACD'); sg.addColorStop(1, '#EDD9A3');
            ctx.fillStyle = sg; ctx.fillRect(c.x - sW / 2, c.y - sH, sW, sH);
            // Wick
            if (!c.blown) {
                ctx.strokeStyle = '#444'; ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.moveTo(c.x, c.y - sH); ctx.lineTo(c.x, fy0); ctx.stroke();
            }
            // Flame
            if (c.lit) {
                const flk = Math.sin(t * 9 + c.phase) * 1.5 + Math.sin(t * 14 + c.phase * 1.7) * 0.8;
                const fh = 11 + flk;
                const og = ctx.createRadialGradient(c.x + flk * 0.2, fy0 - fh * 0.3, 0, c.x, fy0, fh * 0.85);
                og.addColorStop(0, 'rgba(255,245,120,0.95)'); og.addColorStop(0.45, 'rgba(255,140,30,0.65)');
                og.addColorStop(1, 'rgba(255,60,0,0)');
                ctx.fillStyle = og;
                ctx.beginPath(); ctx.ellipse(c.x + flk * 0.18, fy0 - fh * 0.38, 3.5, fh * 0.58, flk * 0.06, 0, Math.PI * 2); ctx.fill();
                const ic = ctx.createRadialGradient(c.x, fy0 - fh * 0.28, 0, c.x, fy0 - fh * 0.2, 4);
                ic.addColorStop(0, 'rgba(255,255,245,1)'); ic.addColorStop(1, 'rgba(255,200,80,0)');
                ctx.fillStyle = ic; ctx.beginPath(); ctx.arc(c.x + flk * 0.1, fy0 - fh * 0.28, 2.5, 0, Math.PI * 2); ctx.fill();
            }
            // Smoke
            if (c.smoke.length) {
                c.smoke.forEach(s => {
                    ctx.globalAlpha = s.life * 0.3;
                    ctx.fillStyle = `rgba(200,205,225,${s.life})`;
                    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
                });
                ctx.globalAlpha = 1;
            }
        });
    }

    stop() { if (this._raf) cancelAnimationFrame(this._raf); }

    reset() {
        this.stop();
        this.litCount = 0;
        this.candles.forEach(c => { c.lit = false; c.blown = false; c.smoke = []; });
    }
}

/* ══════════════ SOFT SNOW CONFETTI ══════════════ */
class SoftSnow {
    constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.pieces = []; }

    resize() {
        const dpr = Math.min(devicePixelRatio, 2);
        this.W = window.innerWidth; this.H = window.innerHeight;
        this.canvas.width = this.W * dpr; this.canvas.height = this.H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    spawn(n = 22) {
        const hues = [265, 275, 285, 295, 42, 48, 54, 300];
        for (let i = 0; i < n; i++) this.pieces.push({
            x: Math.random() * this.W, y: -15 - Math.random() * 80,
            vx: (Math.random() - 0.5) * 0.7, vy: 0.5 + Math.random() * 1.3,
            rot: Math.random() * Math.PI * 2, rotSpd: (Math.random() - 0.5) * 0.04,
            size: 3 + Math.random() * 4.5, life: 1,
            hue: hues[Math.floor(Math.random() * hues.length)],
            wobble: Math.random() * Math.PI * 2, wSpd: 0.5 + Math.random() * 0.9,
        });
    }

    start() {
        this.resize();
        let last = null;
        const tick = now => {
            requestAnimationFrame(tick);
            const dt = last ? (now - last) / 1000 : 0.016; last = now;
            this.ctx.clearRect(0, 0, this.W, this.H);
            this.pieces.forEach(p => {
                p.wobble += p.wSpd * dt; p.x += p.vx + Math.sin(p.wobble) * 0.4; p.y += p.vy; p.rot += p.rotSpd;
                if (p.y > this.H + 20) p.life = 0;
            });
            this.pieces = this.pieces.filter(p => p.life > 0);
            this.pieces.forEach(p => {
                this.ctx.save(); this.ctx.translate(p.x, p.y); this.ctx.rotate(p.rot);
                this.ctx.globalAlpha = 0.65;
                this.ctx.fillStyle = `hsl(${p.hue},75%,78%)`;
                this.ctx.shadowColor = `hsl(${p.hue},80%,60%)`; this.ctx.shadowBlur = 5;
                this.ctx.beginPath();
                this.ctx.moveTo(0, -p.size); this.ctx.lineTo(p.size * 0.42, 0);
                this.ctx.lineTo(0, p.size); this.ctx.lineTo(-p.size * 0.42, 0);
                this.ctx.closePath(); this.ctx.fill(); this.ctx.restore();
            });
            this.ctx.globalAlpha = 1; this.ctx.shadowBlur = 0;
        };
        requestAnimationFrame(tick);
    }
}

/* ══════════════ SCENE 3 ══════════════ */
export default class Scene3 {
    constructor() {
        this.cake = new CakeRenderer(document.getElementById('cake-canvas'));
        this.snow = new SoftSnow(document.getElementById('soft-confetti-canvas'));
        this.started = false;
    }

    start() {
        if (this.started) return; this.started = true;

        const section = document.getElementById('scene-3');
        section.style.pointerEvents = 'auto';

        const tl = gsap.timeline();

        // Galaxy dims to intimate warmth
        tl.to('#galaxy-canvas', { filter: 'brightness(0.55) saturate(0.7)', duration: 1.5, ease: 'power1.inOut' });

        // Cake rises from below
        tl.fromTo('#cake-canvas', { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: 'power2.out' }, '+=0.2');

        // Init cake + start candle lighting
        tl.add(() => { this.cake.init(); this.cake.startLoop(); this._lightSequence(); });

        this.tl = tl;
    }

    _lightSequence() {
        // Bottom (13) → mid (11) → top (9) sequentially, 200ms each
        const light = i => {
            if (i >= 33) { setTimeout(() => this._revealText(), 2200); return; }
            this.cake.lightOne(i);
            setTimeout(() => light(i + 1), 200);
        };
        light(0);
    }

    _revealText() {
        const tl = gsap.timeline();
        tl.to('#s3-text-1', { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' });
        tl.to('#s3-text-2', { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' }, '+=0.9');
        tl.to('#s3-wish-prompt', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, '+=0.9');
        tl.add(() => {
            const btn = document.getElementById('s3-wish-prompt');
            btn.style.pointerEvents = 'auto';
            btn.addEventListener('click', () => this._blowOut(), { once: true });
        });
    }

    _blowOut() {
        gsap.to('#s3-wish-prompt', { opacity: 0, scale: 0.85, duration: 0.4 });

        this.cake.blowAll(() => {
            // Galaxy shifts cool
            gsap.to('#galaxy-canvas', { filter: 'brightness(0.4) saturate(0.4) hue-rotate(30deg)', duration: 1.5, ease: 'power1.inOut' });

            // Stars peek through (nebula subtle)
            gsap.to('#nebula-overlay', { opacity: 0.8, duration: 1.5 });

            // Wish text
            gsap.to('#s3-wish-text', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.3 });

            // Gentle snow confetti
            this.snow.start();
            [0, 1300, 2600, 4000].forEach((delay, i) => setTimeout(() => this.snow.spawn(18 + i * 5), delay));

            // Show "Continue" button after wish settles
            setTimeout(() => {
                const btn = document.getElementById('s3-next-btn');
                btn.style.pointerEvents = 'auto';
                gsap.to(btn, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' });
            }, 2000);

            // Signal main.js to unlock scroll
            setTimeout(() => window.dispatchEvent(new CustomEvent('scene3:complete')), 5500);
        });
    }

    /**
     * Skip to final resting state (for refresh mid-page)
     */
    skipToEnd() {
        if (this.started) return;
        this.started = true;

        // Init cake with all candles lit
        this.cake.init();
        this.cake.startLoop();
        for (let i = 0; i < 33; i++) this.cake.lightOne(i);

        // Show cake
        gsap.set('#cake-canvas', { opacity: 1, y: 0 });

        // Show text
        gsap.set('#s3-text-1', { opacity: 1, y: 0 });
        gsap.set('#s3-text-2', { opacity: 1, y: 0 });

        // Hide prompt, show wish text
        gsap.set('#s3-wish-prompt', { opacity: 0, pointerEvents: 'none' });
        gsap.set('#s3-wish-text', { opacity: 1, y: 0 });

        // Show continue button
        const btn = document.getElementById('s3-next-btn');
        btn.style.pointerEvents = 'auto';
        gsap.set(btn, { opacity: 1, y: 0 });

        // Dim galaxy
        gsap.set('#galaxy-canvas', { filter: 'brightness(0.55) saturate(0.7)' });
    }

    reset() {
        this.started = false;
        if (this.tl) this.tl.kill();
        this.cake.reset();

        // Hide UI
        gsap.set(['#cake-canvas', '#s3-text-1', '#s3-text-2', '#s3-wish-text', '#s3-next-btn', '#s3-wish-prompt'], { opacity: 0, scale: 1 });
        gsap.set(['#s3-text-1', '#s3-text-2', '#s3-wish-text', '#s3-next-btn', '#s3-wish-prompt'], { y: 20 });

        // Block interaction
        document.getElementById('s3-wish-prompt').style.pointerEvents = 'none';
        document.getElementById('s3-next-btn').style.pointerEvents = 'none';
    }
}
