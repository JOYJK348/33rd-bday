/**
 * scene7.js — "The Masters Chapter" 🎓
 * 2013 – 2015 · M.Tech in IT · Determination · Depth · Dreams
 *
 * VISUAL CONCEPT: An open book spreads across the screen.
 * Lines of "knowledge" draw themselves like ink.
 * Stars of insight appear above the pages.
 * Tone: Quiet. Focused. Deeply proud.
 * Ends with a glowing star constellation forming "her path".
 */
import gsap from 'gsap';

const $ = id => document.getElementById(id);

const SVG_NS = 'http://www.w3.org/2000/svg';

/* ═══════════ KNOWLEDGE STAR CONSTELLATION ═══════════ */
const STARS = [
    { x: 0.22, y: 0.25, r: 4, label: 'Data Structures' },
    { x: 0.55, y: 0.18, r: 5, label: 'Networks' },
    { x: 0.78, y: 0.30, r: 3, label: 'Algorithms' },
    { x: 0.35, y: 0.42, r: 4, label: 'Research' },
    { x: 0.65, y: 0.38, r: 6, label: 'Masters Thesis', big: true },
    { x: 0.20, y: 0.58, r: 3, label: 'Late Nights' },
    { x: 0.80, y: 0.55, r: 4, label: 'Hostel Bonds' },
];

/* ═══════════ FLOATING INK LINES ═══════════ */
class InkCanvas {
    constructor(canvas) {
        this.c = canvas;
        this.ctx = canvas.getContext('2d');
        this.lines = [];
        this.raf = null;
        this.active = false;
    }
    init() {
        const dpr = Math.min(devicePixelRatio, 2);
        this.W = window.innerWidth; this.H = window.innerHeight;
        this.c.width = this.W * dpr; this.c.height = this.H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    addLine(y, delay = 0) {
        setTimeout(() => {
            this.lines.push({ y, progress: 0, maxW: this.W * 0.6, startX: this.W * 0.2 });
        }, delay);
    }
    start() {
        this.active = true;
        const tick = () => {
            if (!this.active) return;
            this.raf = requestAnimationFrame(tick);
            this.ctx.clearRect(0, 0, this.W, this.H);
            this.lines.forEach(ln => {
                ln.progress = Math.min(ln.progress + 0.012, 1);
                const w = ln.maxW * ln.progress;
                const grd = this.ctx.createLinearGradient(ln.startX, 0, ln.startX + ln.maxW, 0);
                grd.addColorStop(0, 'rgba(167,139,250,0.4)');
                grd.addColorStop(0.5, 'rgba(216,180,254,0.6)');
                grd.addColorStop(1, 'rgba(167,139,250,0.05)');
                this.ctx.strokeStyle = grd;
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(ln.startX, ln.y);
                this.ctx.lineTo(ln.startX + w, ln.y);
                this.ctx.stroke();
            });
        };
        requestAnimationFrame(tick);
    }
    stop() {
        this.active = false;
        if (this.raf) cancelAnimationFrame(this.raf);
    }
}

/* ═══════════ SCENE 7 CLASS ═══════════ */
export default class Scene7 {
    constructor() {
        this.started = false;
        this.tl = null;
        this.ink = null;
    }

    start() {
        if (this.started) return;
        this.started = true;
        this._initInk();
        this._buildConstellation();
        this._run();
    }

    _initInk() {
        const canvas = $('s7-ink-canvas');
        if (!canvas) return;
        this.ink = new InkCanvas(canvas);
        this.ink.init();
        this.ink.start();
        // Add ink lines at various heights (book lines)
        const lineYs = [0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.70];
        lineYs.forEach((pct, i) => {
            const y = pct * this.ink.H;
            this.ink.addLine(y, 2000 + i * 600);
        });
    }

    _buildConstellation() {
        const svg = $('s7-constellation-svg');
        if (!svg) return;
        svg.innerHTML = '';
        const W = window.innerWidth, H = window.innerHeight;

        // Draw connection lines first
        const pairs = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [4, 5], [4, 6]];
        pairs.forEach(([a, b]) => {
            const s1 = STARS[a], s2 = STARS[b];
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', s1.x * W); line.setAttribute('y1', s1.y * H);
            line.setAttribute('x2', s2.x * W); line.setAttribute('y2', s2.y * H);
            line.setAttribute('stroke', 'rgba(167,139,250,0.25)');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('opacity', '0');
            line.id = `s7-cline-${a}-${b}`;
            svg.appendChild(line);
        });

        // Then dots
        STARS.forEach((star, i) => {
            const g = document.createElementNS(SVG_NS, 'g');
            g.setAttribute('transform', `translate(${star.x * W}, ${star.y * H})`);
            g.setAttribute('opacity', '0');
            g.id = `s7-star-${i}`;

            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('r', star.r);
            circle.setAttribute('fill', star.big ? '#FBBF24' : '#A78BFA');
            circle.setAttribute('filter', 'url(#s7-glow)');
            g.appendChild(circle);

            // Text label
            const txt = document.createElementNS(SVG_NS, 'text');
            txt.setAttribute('y', star.r + 14);
            txt.setAttribute('text-anchor', 'middle');
            txt.setAttribute('fill', 'rgba(216,180,254,0.8)');
            txt.setAttribute('font-size', '10');
            txt.setAttribute('font-family', 'Outfit, sans-serif');
            txt.textContent = star.label;
            g.appendChild(txt);

            svg.appendChild(g);
        });

        // Glow filter
        const defs = document.createElementNS(SVG_NS, 'defs');
        defs.innerHTML = `
            <filter id="s7-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>`;
        svg.insertBefore(defs, svg.firstChild);
    }

    _run() {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        this.tl = tl;

        // Atmosphere → calm deep purple, studious
        tl.to('#galaxy-canvas', {
            filter: 'brightness(0.25) saturate(0.45) hue-rotate(-15deg)',
            duration: 2, ease: 'power1.inOut'
        });

        // Book pages open (CSS animation triggered via class)
        tl.fromTo('#s7-book-left', { rotateY: -90, opacity: 0, transformOrigin: 'right center' }, {
            rotateY: 0, opacity: 1, duration: 1.4, ease: 'power3.out'
        }, '-=1');
        tl.fromTo('#s7-book-right', { rotateY: 90, opacity: 0, transformOrigin: 'left center' }, {
            rotateY: 0, opacity: 1, duration: 1.4, ease: 'power3.out'
        }, '<');

        // Title writes in
        tl.fromTo('#s7-chapter-label', { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 1 }, '+=0.3');
        tl.fromTo('#s7-title', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1 }, '-=0.5');
        tl.fromTo('#s7-years', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.3');

        // Left page content lines appear
        const leftLines = document.querySelectorAll('.s7-left-line');
        leftLines.forEach((ln, i) => {
            tl.fromTo(ln, { scaleX: 0, transformOrigin: 'left', opacity: 0 }, {
                scaleX: 1, opacity: 1, duration: 0.6
            }, `+=0.3`);
        });

        // Right page — hostel note
        tl.fromTo('#s7-hostel-note', { opacity: 0, y: 10, rotate: -2 }, {
            opacity: 1, y: 0, rotate: -2, duration: 1.1
        }, '+=0.4');

        // Constellation fades in
        tl.fromTo('#s7-constellation-svg', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '+=0.5');

        // Stars appear one by one
        STARS.forEach((_, i) => {
            tl.to(`#s7-star-${i}`, { opacity: 1, duration: 0.4, ease: 'back.out(2)' }, `+=0.25`);
        });

        // Connection lines draw between stars
        const pairs = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [4, 5], [4, 6]];
        pairs.forEach(([a, b]) => {
            tl.to(`#s7-cline-${a}-${b}`, { opacity: 1, duration: 0.4 }, `+=0.2`);
        });

        // Thesis star pulses gold
        tl.to('#s7-star-4 circle', {
            attr: { r: 10 }, fill: '#FBBF24',
            duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut'
        }, '+=0.3');

        // Closing powerful text
        tl.fromTo('#s7-closing-text', {
            opacity: 0, y: 20, filter: 'blur(8px)'
        }, {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 1.5
        }, '+=0.5');

        // Final glow
        tl.to('#s7-closing-text', {
            textShadow: '0 0 40px rgba(167,139,250,0.8)',
            duration: 0.8, yoyo: true, repeat: 1
        }, '+=0.2');

        tl.add(() => {
            window.dispatchEvent(new CustomEvent('scene7:complete'));
        }, '+=0.5');
    }

    reset() {
        this.started = false;
        if (this.tl) this.tl.kill();
        if (this.ink) { this.ink.stop(); this.ink = null; }

        gsap.set('#galaxy-canvas', { filter: 'none' });
        gsap.set(['#s7-book-left', '#s7-book-right'], { rotateY: 90, opacity: 0 });
        gsap.set(['#s7-book-left'], { rotateY: -90 });
        gsap.set(['#s7-chapter-label', '#s7-title', '#s7-years', '#s7-closing-text'], { opacity: 0, y: 15 });
        gsap.set('#s7-hostel-note', { opacity: 0, y: 10 });
        gsap.set('.s7-left-line', { scaleX: 0, opacity: 0 });
        gsap.set('#s7-constellation-svg', { opacity: 0 });
        // Re-build clears star states
        this._buildConstellation();
    }

    skipToEnd() {
        if (this.started) return;
        this.started = true;
        this._initInk();
        this._buildConstellation();
        gsap.set('#galaxy-canvas', { filter: 'brightness(0.25) saturate(0.45) hue-rotate(-15deg)' });
        gsap.set(['#s7-book-left', '#s7-book-right'], { rotateY: 0, opacity: 1 });
        gsap.set(['#s7-chapter-label', '#s7-title', '#s7-years', '#s7-closing-text'], { opacity: 1, y: 0 });
        gsap.set('#s7-hostel-note', { opacity: 1, y: 0 });
        gsap.set('.s7-left-line', { scaleX: 1, opacity: 1 });
        gsap.set('#s7-constellation-svg', { opacity: 1 });
        STARS.forEach((_, i) => gsap.set(`#s7-star-${i}`, { opacity: 1 }));
        const pairs = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [4, 5], [4, 6]];
        pairs.forEach(([a, b]) => gsap.set(`#s7-cline-${a}-${b}`, { opacity: 1 }));
    }
}
