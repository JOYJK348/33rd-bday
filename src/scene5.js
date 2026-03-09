/**
 * scene5.js — The Soul's Reflection 🕊️
 * Feel-good · Minimalist · Soulful
 * 
 * Inspired by Scene 1's "letter-by-letter" and "one-by-one" emotional pacing.
 * This scene presents a single, high-fidelity experience where each memory 
 * is a "breath" in the story. 
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const $ = id => document.getElementById(id);

const CHAPTERS = [
    {
        id: 'childhood',
        years: '1998 — 2010',
        title: 'Childhood Chapters',
        icon: '🌸',
        color: 'rgba(244, 114, 182, 0.15)',
        border: 'rgba(244, 114, 182, 0.35)',
        text: 'Twelve golden years of school bells, sticky friendships, and summer-afternoon daydreams. The little girl who smiled and dreamed — she was already extraordinary.'
    },
    {
        id: 'ug',
        years: '2010 — 2013',
        title: 'The College Soul',
        icon: '📚',
        color: 'rgba(96, 165, 250, 0.15)',
        border: 'rgba(96, 165, 250, 0.35)',
        text: 'B.Sc IT. Where code met curiosity, bunking classes felt like freedom, and every conversation with a friend was secretly a lesson in life.'
    },
    {
        id: 'hostel',
        years: 'The Chapter',
        title: 'Hostel Diaries',
        icon: '🏠',
        color: 'rgba(251, 191, 36, 0.15)',
        border: 'rgba(251, 191, 36, 0.35)',
        text: 'Late-night Maggi, whispered secrets under dim lights, and a sisterhood that no distance could break. These walls heard your laughter — and held your tears.'
    },
    {
        id: 'pg',
        years: '2013 — 2015',
        title: 'Mastering the Dream',
        icon: '🎓',
        color: 'rgba(167, 139, 250, 0.15)',
        border: 'rgba(167, 139, 250, 0.35)',
        text: 'M.Sc IT. You went deeper, sharper, and more focused. The world was about to meet a version of you that was completely ready.'
    }
];


/* ─── Calm floating particles (Magical Dust) ─── */
class CalmParticles {
    constructor(canvas) {
        this.c = canvas; this.ctx = canvas.getContext('2d'); this.dots = [];
    }
    start() {
        const isMobile = window.innerWidth < 768;
        const dpr = isMobile ? Math.min(devicePixelRatio, 1.25) : Math.min(devicePixelRatio, 2);
        const W = this.W = window.innerWidth, H = this.H = window.innerHeight;
        this.c.width = W * dpr; this.c.height = H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = isMobile ? 15 : 45;
        for (let i = 0; i < count; i++) this.dots.push({
            x: Math.random() * W, y: Math.random() * H,
            r: 0.6 + Math.random() * 1.5,
            vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
            op: 0.05 + Math.random() * 0.15, hue: 42, // Golden hue
        });
        const tick = () => {
            if (!this.running) return;
            requestAnimationFrame(tick);
            this.ctx.clearRect(0, 0, W, H);
            this.dots.forEach(d => {
                d.x = (d.x + d.vx + W) % W; d.y = (d.y + d.vy + H) % H;
                this.ctx.globalAlpha = d.op;
                this.ctx.fillStyle = `hsl(${d.hue},75%,85%)`;
                this.ctx.beginPath(); this.ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); this.ctx.fill();
            });
            this.ctx.globalAlpha = 1;
        };
        this.running = true;
        requestAnimationFrame(tick);
    }
    stop() { this.running = false; }
}

export default class Scene5 {
    constructor() {
        this.started = false;
        this.st = [];
        this.particles = null;
    }

    start() {
        if (this.started) return;
        this.started = true;

        if (!this.particles) {
            const canvas = $('s5-particle-canvas');
            if (canvas) {
                this.particles = new CalmParticles(canvas);
                this.particles.start();
            }
        } else {
            this.particles.start();
        }

        this._createSoulfulContent();
        this._runEmotionalSequence();
    }

    _createSoulfulContent() {
        const wrap = $('s5-soul-container');
        if (!wrap) return;
        wrap.innerHTML = ''; // Clear previous

        // 1. Path Container
        const pathWrap = document.createElement('div');
        pathWrap.id = 's5-timeline-path-wrap';
        wrap.appendChild(pathWrap);

        // 2. Build Milestone Cards (Alternating sides)
        CHAPTERS.forEach((ch, i) => {
            const side = i % 2 === 0 ? 'left' : 'right';
            const cell = document.createElement('div');
            cell.className = `s5-milestone-cell ${side}`;
            cell.innerHTML = `
                <div class="s5-milestone-card" id="s5-card-${ch.id}" style="background:${ch.color || 'rgba(167,139,250,0.1)'};border-color:${ch.border || 'rgba(167,139,250,0.3)'};--card-border:${ch.border || 'rgba(167,139,250,0.3)'}">
                    <div class="s5-milestone-icon">${ch.icon}</div>
                    <span class="s5-milestone-years">${ch.years}</span>
                    <h3 class="s5-milestone-title">${ch.title}</h3>
                    <p class="s5-milestone-text">${ch.text}</p>
                </div>
                <div class="s5-timeline-dot" id="s5-dot-${ch.id}" style="box-shadow:0 0 12px 4px ${ch.border || 'rgba(167,139,250,0.5)'}"></div>
            `;
            wrap.appendChild(cell);
        });

        // 3. Create SVG Vertical Path
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.overflow = 'visible';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.id = 's5-main-path';
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#fbbf24');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-dasharray', '5,5'); // Dashed for a "thread" feel
        path.setAttribute('opacity', '0.3');

        svg.appendChild(path);
        pathWrap.appendChild(svg);

        // We'll calculate the path D attribute in sequence after layout
    }

    _runEmotionalSequence() {
        // Intro Narrative from the top (Mirroring Scene 4's one-by-one reveal)
        gsap.set('.s5-narrative p', { opacity: 0, y: 30 });
        gsap.to('.s5-narrative p', {
            opacity: 1, y: 0,
            stagger: 1.2,
            duration: 1.5,
            ease: 'power2.out'
        });

        // Calculate the Vertical Path
        const dots = gsap.utils.toArray('.s5-timeline-dot');
        let d = "";
        dots.forEach((dot, i) => {
            const rect = dot.getBoundingClientRect();
            const parentRect = dot.offsetParent.getBoundingClientRect();
            const x = rect.left - parentRect.left + (rect.width / 2);
            const y = rect.top - parentRect.top + (rect.height / 2);
            d += (i === 0 ? "M" : "L") + ` ${x} ${y}`;
        });
        const path = document.getElementById('s5-main-path');
        if (path) path.setAttribute('d', d);

        // Milestone Sequence
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.s5-soul-container',
                start: 'top 70%',
                once: true
            }
        });

        CHAPTERS.forEach((ch, i) => {
            const dot = $(`s5-dot-${ch.id}`);
            const card = $(`s5-card-${ch.id}`);

            tl.to(dot, { opacity: 1, scale: 1.5, duration: 0.5, ease: 'back.out(2)' }, `+=${i === 0 ? 0.5 : 0.4}`);
            tl.to(card, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3');
        });

        // Finale
        gsap.fromTo('#s5-finale-retro',
            { opacity: 0, y: 20 },
            {
                opacity: 1, y: 0,
                duration: 1.2,
                scrollTrigger: {
                    trigger: '#s5-finale-retro',
                    start: 'top 90%',
                    once: true
                }
            }
        );

        // Next Scene Button
        gsap.fromTo('.next-scene-btn.s5-to-s6',
            { opacity: 0, y: 15 },
            {
                opacity: 1, y: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: '.next-scene-btn.s5-to-s6',
                    start: 'top 95%',
                    once: true
                }
            }
        );

        // Recap Button (S5)
        gsap.fromTo('#scene-5 .recap-btn',
            { opacity: 0, scale: 0.8 },
            {
                opacity: 0.6, scale: 1, duration: 1,
                scrollTrigger: {
                    trigger: '#scene-5',
                    start: 'bottom bottom',
                    once: true
                }
            }
        );

        window.dispatchEvent(new CustomEvent('scene5:complete'));
    }

    reset() {
        this.started = false;
        if (this.particles) this.particles.stop();
        this.st.forEach(t => t.kill());
        this.st = [];
        const wrap = $('s5-soul-container');
        if (wrap) wrap.innerHTML = '';
        gsap.set(['.s5-narrative p', '#s5-finale-retro', '.s5-to-s6', '.recap-btn[data-scene="5"]'], { clearProps: 'all' });
    }

    skipToEnd() {
        this.start();
    }
}
