/**
 * scene8.js — "The Brave Comeback" 💜
 * Short & Crispy Version
 */
import gsap from 'gsap';

const $ = id => document.getElementById(id);

class SparkCanvas {
    constructor(canvas) {
        this.c = canvas;
        this.ctx = canvas.getContext('2d');
        this.raf = null;
        this.active = false;
        this.t = 0;
        this.intensity = 0;
        this.color = { h: 260, s: 80, l: 60 };
        this.dataParticles = [];
        this.lightLeaks = [];
    }

    init() {
        const dpr = Math.min(devicePixelRatio, 2);
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.c.width = this.W * dpr;
        this.c.height = this.H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.particles = [];
        for (let i = 0; i < 40; i++) {
            this.particles.push({
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                s: 0.5 + Math.random() * 1.5,
                v: 0.2 + Math.random() * 0.4,
                o: 0.1 + Math.random() * 0.3
            });
        }
    }

    start() {
        this.active = true;
        const tick = () => {
            if (!this.active) return;
            this.raf = requestAnimationFrame(tick);
            this.t += 0.02;
            const ctx = this.ctx;
            const cx = this.W / 2;
            const cy = this.H / 2;
            const p = this.intensity;

            ctx.clearRect(0, 0, this.W, this.H);

            this.particles.forEach(pt => {
                pt.y -= pt.v * (1 + p);
                if (pt.y < -10) pt.y = this.H + 10;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.s, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(260, 80%, 90%, ${pt.o * (0.3 + p)})`;
                ctx.fill();
            });

            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.H * 0.6);
            g.addColorStop(0, `hsla(${this.color.h}, 90%, 70%, ${0.1 * p})`);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, this.W, this.H);
        };
        requestAnimationFrame(tick);
    }

    stop() {
        this.active = false;
        if (this.raf) cancelAnimationFrame(this.raf);
    }
}

export default class Scene8 {
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
        const c = $('s8-spark-canvas');
        if (!c) return;
        this.spark = new SparkCanvas(c);
        this.spark.init();
        this.spark.start();
    }

    _run() {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        this.tl = tl;

        gsap.set('#s8-main-container', { y: 0 });

        // Reset state
        const allIds = [
            '#s8-t-years', '#s8-t-dream1', '#s8-t-turn',
            '#s8-t-courage', '#s8-t-fullstack',
            '#s8-t-nevergaveup', '#s8-timeline-container', '#s8-next-trigger'
        ];
        gsap.set(allIds, { opacity: 0, y: 30 });
        gsap.set('#s8-laptop-glow', { opacity: 0, scale: 0.5 });

        // ACT 1: Years + Dream
        tl.to('#galaxy-canvas', {
            filter: 'brightness(0.35) saturate(0.6) contrast(1.1)',
            duration: 1.5
        });
        tl.to('#s8-dark-overlay', { opacity: 0.85, duration: 1.5 }, '<');

        tl.fromTo('#s8-t-years',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8 },
            '+=0.2'
        );

        const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
        years.forEach((yr, i) => {
            tl.fromTo(`#s8-yr-${yr}`,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.2 }, // Faster per year
                `+=${i === 0 ? 0.1 : 0.1}`
            );
        });

        tl.fromTo('#s8-t-dream1',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1 },
            '+=0.4'
        );

        // ACT 2: Decision
        tl.to('#s8-main-container', { y: -320, duration: 1.2, ease: 'power2.inOut' }, '+=0.6');
        tl.to(this.spark, { intensity: 0.4, duration: 1.2 }, '<');

        tl.fromTo(['#s8-t-turn', '#s8-t-courage'],
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.3 },
            '-=0.8'
        );

        tl.fromTo('#s8-laptop-glow',
            { opacity: 0, scale: 0.5 },
            { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
            '+=0.2'
        );
        tl.fromTo('#s8-t-fullstack',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1 },
            '+=0.1'
        );

        // ACT 3: Triumph
        tl.to('#s8-main-container', { y: -720, duration: 1.5, ease: 'power3.inOut' }, '+=0.6');
        tl.to(this.spark, { intensity: 1.0, duration: 1.5 }, '<');
        tl.to('#galaxy-canvas', { filter: 'brightness(0.7) saturate(1.1)', duration: 1.5 }, '<');

        tl.fromTo('#s8-t-nevergaveup',
            { opacity: 0, scale: 0.8, y: 40 },
            { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'back.out(1.5)' },
            '-=1.1'
        );

        tl.fromTo(['#s8-timeline-container', '#s8-next-trigger'],
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.2 },
            '+=0.2'
        );

        tl.fromTo('#scene-8 .recap-btn', { opacity: 0, scale: 0.8 }, { opacity: 0.6, scale: 1, duration: 0.8 }, '-=0.5');

        tl.add(() => window.dispatchEvent(new CustomEvent('scene8:complete')), '+=0.2');
    }

    reset() {
        this.started = false;
        if (this.tl) {
            this.tl.pause().kill();
            this.tl.clear();
            this.tl = null;
        }
        if (this.spark) { this.spark.stop(); this.spark = null; }

        gsap.set('#galaxy-canvas', { filter: 'none', scale: 1 });
        gsap.set('#s8-dark-overlay', { opacity: 0 });
        gsap.set('#s8-main-container', { y: 0 });

        const allIds = [
            '#s8-t-years', '#s8-t-dream1', '#s8-t-turn',
            '#s8-t-courage', '#s8-t-fullstack',
            '#s8-t-nevergaveup', '#s8-timeline-container', '#s8-next-trigger', '#scene-8 .recap-btn'
        ];
        gsap.set(allIds, { opacity: 0, y: 0, scale: 1, filter: 'none' });

        const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
        years.forEach(yr => {
            gsap.set(`#s8-yr-${yr}`, { opacity: 0, scale: 1, y: 0 });
        });
        gsap.set('#s8-laptop-glow', { opacity: 0, scale: 0.5, y: 0 });
    }

    skipToEnd() {
        if (this.started) return;
        this.started = true;
        this._initSpark();
        if (this.spark) {
            this.spark.intensity = 0.8;
            this.spark.color.h = 45;
        }

        gsap.set('#galaxy-canvas', { filter: 'brightness(0.6) saturate(1.1)', scale: 1 });
        gsap.set('#s8-dark-overlay', { opacity: 0.6 });

        // Keep container at the top for natural reading
        gsap.set('#s8-main-container', { y: 0 });

        // Show all content clearly
        gsap.set([
            '#s8-t-years', '#s8-t-dream1', '#s8-t-turn',
            '#s8-t-courage', '#s8-t-fullstack', '#s8-laptop-glow',
            '#s8-t-nevergaveup', '#s8-timeline-container', '#s8-next-trigger'
        ], { opacity: 1, y: 0, scale: 1, filter: 'none' });

        const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
        years.forEach(yr => {
            gsap.set(`#s8-yr-${yr}`, { opacity: 0.8, scale: 1, y: 0 });
        });

        gsap.set('#scene-8 .recap-btn', { opacity: 0.6, scale: 1 });
    }
}
