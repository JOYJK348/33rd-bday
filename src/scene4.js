/**
 * scene4.js — The Journey Begins 📖
 * Calm · Emotional · Like opening a storybook
 */
import gsap from 'gsap';

const SVG_NS = 'http://www.w3.org/2000/svg';
const $ = id => document.getElementById(id);

const STOPS = [
    { id: 'school', icon: '🎓', label: 'School', sub: '', desc: 'Where it all started', side: 'top' },
    { id: 'ug', icon: '📚', label: 'UG', sub: '', desc: 'B.Sc IT Dreams', side: 'bottom' },
    { id: 'pg', icon: '🏫', label: 'PG', sub: '', desc: 'M.Sc IT Mastery', side: 'top' },
    { id: 'marriage', icon: '💍', label: 'Marriage', sub: '', desc: 'A new chapter', side: 'bottom' },
    { id: 'family', icon: '👨‍👩‍👧', label: 'Family', sub: '10 yrs', desc: 'Love over everything', side: 'top' },
    { id: 'comeback', icon: '💪', label: 'Comeback', sub: '', desc: 'The brave decision', side: 'bottom' },
    { id: 'course', icon: '💻', label: 'Course', sub: '', desc: 'Starting over, stronger', side: 'top' },
    { id: 'job', icon: '⭐', label: 'Job', sub: '', desc: 'Proof of every sacrifice', side: 'bottom' },
    { id: 'today', icon: '🎂', label: 'Today', sub: '33', desc: 'Here. Celebrated.', side: 'top', big: true },
];

/* ─── Calm floating particles ─── */
class CalmParticles {
    constructor(canvas) {
        this.c = canvas; this.ctx = canvas.getContext('2d'); this.dots = [];
    }
    start() {
        const dpr = Math.min(devicePixelRatio, 2);
        const W = this.W = window.innerWidth, H = this.H = window.innerHeight;
        this.c.width = W * dpr; this.c.height = H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        for (let i = 0; i < 55; i++) this.dots.push({
            x: Math.random() * W, y: Math.random() * H,
            r: 0.7 + Math.random() * 1.8,
            vx: (Math.random() - 0.5) * 0.14, vy: (Math.random() - 0.5) * 0.14,
            op: 0.07 + Math.random() * 0.2, hue: 235 + Math.random() * 65,
        });
        const tick = () => {
            requestAnimationFrame(tick);
            this.ctx.clearRect(0, 0, W, H);
            this.dots.forEach(d => {
                d.x = (d.x + d.vx + W) % W; d.y = (d.y + d.vy + H) % H;
                this.ctx.globalAlpha = d.op;
                this.ctx.fillStyle = `hsl(${d.hue},55%,78%)`;
                this.ctx.beginPath(); this.ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); this.ctx.fill();
            });
            this.ctx.globalAlpha = 1;
        };
        requestAnimationFrame(tick);
    }
}

/* ─── Scene 4 ─── */
export default class Scene4 {
    constructor() { this.started = false; }

    start(isSkip = false) {
        if (this.started) return; this.started = true;

        if (isSkip) {
            gsap.set(['#s4-t1', '#s4-t2', '#s4-t3'], { opacity: 1, y: 0 });
            gsap.set('#galaxy-canvas', { filter: 'brightness(0.3) saturate(0.45) hue-rotate(-20deg)' });
        } else {
            gsap.to('#galaxy-canvas', { filter: 'brightness(0.3) saturate(0.45) hue-rotate(-20deg)', duration: 2.5, ease: 'power1.inOut' });
        }

        if (!this.particlesInitialized) {
            new CalmParticles($('s4-particle-canvas')).start();
            this.particlesInitialized = true;
        }

        this._buildTimeline();
        this._runSequence(isSkip);

        // Add resize listener to rebuild timeline on orientation/size change
        window.addEventListener('resize', () => {
            if (this.started) {
                this.reset();
                this.start(true); // Re-start in skip mode to show current state
            }
        });
    }

    _buildTimeline() {
        const track = $('s4-timeline-track');
        const rowT = $('s4-row-top'), rowB = $('s4-row-bottom');
        if (!track || !rowT || !rowB) return;

        // CRITICAL: Clear EVERY container to prevent duplication
        track.innerHTML = '';
        rowT.innerHTML = '';
        rowB.innerHTML = '';

        const isMobile = window.innerWidth < 768;
        const W = track.offsetWidth || window.innerWidth * 0.9;
        const H = isMobile ? (STOPS.length * 85) : 160;
        const MID = isMobile ? (W / 2) : (H / 2);

        // Rows clearing
        rowT.style.display = isMobile ? 'none' : 'flex';
        rowB.style.display = isMobile ? 'none' : 'flex';

        // Vertical vs Horizontal logic
        const N = STOPS.length;
        const PAD = isMobile ? 30 : Math.min(60, W * 0.07);
        const SPAN = (isMobile ? H : W) - PAD * 2;
        const GAP = SPAN / (N - 1);

        // SVG Container
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', H);
        svg.style.overflow = 'visible';
        svg.id = 's4-svg';

        // Gradient
        const defs = document.createElementNS(SVG_NS, 'defs');
        const lg = document.createElementNS(SVG_NS, 'linearGradient');
        lg.id = 's4-lg';
        // Gradient direction: vertical for mobile, horizontal for desktop
        if (isMobile) { lg.setAttribute('x1', '0%'); lg.setAttribute('y1', '0%'); lg.setAttribute('x2', '0%'); lg.setAttribute('y2', '100%'); }
        else { lg.setAttribute('x1', '0%'); lg.setAttribute('x2', '100%'); }

        [['0%', '#6D28D9'], ['55%', '#a78bfa'], ['100%', '#FBBF24']].forEach(([o, c]) => {
            const s = document.createElementNS(SVG_NS, 'stop');
            s.setAttribute('offset', o); s.setAttribute('stop-color', c); lg.appendChild(s);
        });
        defs.appendChild(lg); svg.appendChild(defs);

        // Path Calculation
        let pathD = "";
        const pts = [];
        STOPS.forEach((stop, i) => {
            let x, y;
            if (isMobile) {
                y = PAD + i * GAP;
                x = stop.side === 'top' ? MID - 35 : MID + 35; // 'top' = left side on mobile
            } else {
                x = PAD + i * GAP;
                y = stop.side === 'top' ? MID - 35 : MID + 35;
            }
            pts.push({ x, y });
            pathD += (i === 0 ? "M " : " L ") + `${x} ${y}`;
        });

        // Drawing helpers
        const mkPath = (id, sw, op, blur) => {
            const p = document.createElementNS(SVG_NS, 'path');
            p.setAttribute('d', pathD);
            p.setAttribute('fill', 'none');
            p.setAttribute('stroke', 'url(#s4-lg)');
            p.setAttribute('stroke-width', sw);
            p.setAttribute('stroke-opacity', op);
            p.setAttribute('stroke-linejoin', 'round');
            p.setAttribute('stroke-linecap', 'round');
            p.id = id;
            if (blur) p.style.filter = `blur(${blur}px)`;

            // Calc length
            const temp = document.createElementNS(SVG_NS, 'path');
            temp.setAttribute('d', pathD);
            document.body.appendChild(temp);
            const len = temp.getTotalLength();
            document.body.removeChild(temp);
            p.setAttribute('stroke-dasharray', len);
            p.setAttribute('stroke-dashoffset', len);
            p._len = len;
            return p;
        };

        const glowP = mkPath('s4-glow-p', '10', '0.25', 6);
        const mainP = mkPath('s4-main-p', '2', '1', 0);
        svg.appendChild(glowP);
        svg.appendChild(mainP);

        // Labels for mobile (single absolute-positioned cell)
        if (isMobile) {
            STOPS.forEach((stop, i) => {
                const { x, y } = pts[i];
                const d = document.createElement('div');
                d.className = 's4-cell s4-mobile-cell';
                d.id = `s4-mobile-${stop.id}`;
                d.style.position = 'absolute';
                d.style.top = `${y}px`;
                d.style.left = stop.side === 'top' ? '0' : 'auto';
                d.style.right = stop.side === 'bottom' ? '0' : 'auto';
                d.style.width = '42%';
                d.style.textAlign = stop.side === 'top' ? 'right' : 'left';
                d.style.transform = 'translateY(-50%)'; // Center on peak
                d.innerHTML = `
                    <div class="s4-icon">${stop.icon}</div>
                    <div class="s4-lbl">${stop.label}${stop.sub ? `<br><small class="s4-sub">${stop.sub}</small>` : ''}</div>
                    <div class="s4-desc-text">${stop.desc}</div>`;
                track.appendChild(d);
            });
        } else {
            STOPS.forEach(stop => {
                const mkCell = (hasContent, row) => {
                    const d = document.createElement('div');
                    d.className = 's4-cell'; d.id = `s4-${row}-${stop.id}`;
                    if (hasContent) d.innerHTML = `
                        <div class="s4-icon">${stop.icon}</div>
                        <div class="s4-lbl">${stop.label}${stop.sub ? `<br><small class="s4-sub">${stop.sub}</small>` : ''}</div>
                        <div class="s4-desc-text">${stop.desc}</div>`;
                    return d;
                };
                rowT.appendChild(mkCell(stop.side === 'top', 'top'));
                rowB.appendChild(mkCell(stop.side === 'bottom', 'bot'));
            });
        }

        // Dots
        STOPS.forEach((stop, i) => {
            const { x, y } = pts[i];
            const c = document.createElementNS(SVG_NS, 'circle');
            c.setAttribute('cx', x); c.setAttribute('cy', y);
            c.setAttribute('r', stop.big ? 9 : 6);
            c.setAttribute('fill', stop.big ? '#FBBF24' : '#8B5CF6');
            c.setAttribute('stroke', 'rgba(255,255,255,0.4)'); c.setAttribute('stroke-width', '1.5');
            c.setAttribute('opacity', '0'); c.id = `s4-dot-${stop.id}`;
            svg.appendChild(c);
        });

        track.appendChild(svg);
        this._lW = mainP._len;
    }

    _runSequence(isSkip = false) {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        const isMobile = window.innerWidth < 768;

        if (!isSkip) {
            // Text reveals — appear one by one and STAY
            ['s4-t1', 's4-t2', 's4-t3'].forEach((id) => {
                tl.to(`#${id}`, { opacity: 1, y: 0, duration: 1.2 }, "+=0.5");
            });
        }

        // "And her journey begins here…" fades in below the story sentences
        tl.to('#s4-t-final', { opacity: 1, y: 0, duration: 1.2 }, isSkip ? "+=0.1" : "+=0.8");

        // Zig-Zag Path draws left → right
        tl.to(['#s4-main-p', '#s4-glow-p'], {
            attr: { 'stroke-dashoffset': 0 },
            duration: 4.0, ease: 'power1.inOut',
        }, '+=0.4');



        // Dots + labels, one by one
        STOPS.forEach((stop, i) => {
            tl.add(() => {
                const dot = $(`s4-dot-${stop.id}`);
                const rTop = $(`s4-top-${stop.id}`);
                const rBot = $(`s4-bot-${stop.id}`);
                const rMob = $(`s4-mobile-${stop.id}`);

                const targets = [rTop, rBot, rMob].filter(Boolean);

                gsap.timeline()
                    .to(dot, { attr: { opacity: 1, r: stop.big ? 14 : 10 }, duration: 0.25, ease: 'back.out(3)' })
                    .to(dot, { attr: { r: stop.big ? 9 : 6 }, duration: 0.2 })
                    .to(targets, { opacity: 1, y: 0, duration: 0.45 }, '-=0.2');
            }, `+=0.35`);
        });

        // After all dots: last dot glows (setup for S5 zoom-out)
        tl.add(() => {
            const lastDot = $('s4-dot-today');
            gsap.to(lastDot, {
                attr: { r: 13 }, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut',
            });

            // Fade in the next scene button
            gsap.to('#s4-next-trigger', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });

            window.dispatchEvent(new CustomEvent('scene4:complete'));
        }, '+=0.5');

        this.tl = tl;
    }

    reset() {
        this.started = false;
        if (this.tl) this.tl.kill();

        // Narrative text
        gsap.set(['#s4-t1', '#s4-t2', '#s4-t3', '#s4-t-final'], { opacity: 0, y: 15 });
        gsap.set('#s4-next-trigger', { opacity: 0, y: 20 });

        // Timeline SVG path
        if (this._lW) {
            gsap.set(['#s4-main-p', '#s4-glow-p'], { attr: { 'stroke-dashoffset': this._lW } });
        }

        // Dots and label rows
        STOPS.forEach(stop => {
            gsap.set(`#s4-dot-${stop.id}`, { opacity: 0 });
            gsap.set([`#s4-top-${stop.id}`, `#s4-bot-${stop.id}`], { opacity: 0, y: 10 });
        });

        // Atmosphere reset
        gsap.set('#galaxy-canvas', { filter: 'none' });
    }
}
