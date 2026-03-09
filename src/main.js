/**
 * main.js — Entry Point (v6)
 *
 * Flow:
 *  Scene 1 (cinematic intro)
 *    ↓ scroll
 *  Warp Zone (galaxy stretches)
 *    ↓ scroll
 *  Scene 2 (Bharathi Akka — fireworks, name reveal) → LOCKED
 *    ↓ auto-chain after Scene 2 completes
 *  Scene 3 (Quiet Magic — cake, 33 candles, make a wish) → LOCKED
 *    ↓ user clicks wish → scroll unlocks
 *  Scene 4 → Scene 5 → Scene 6
 */
import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Galaxy from './galaxy.js';
import Scene1 from './scene1.js';
import Scene2 from './scene2.js';
import Scene3 from './scene3.js';
import Scene4 from './scene4.js';
import Scene5 from './scene5.js';
import Scene6 from './scene6.js';
import Scene8 from './scene8.js';
import Scene10 from './scene10.js';
import Scene11 from './scene11.js';
import Scene13 from './scene13.js';
import Scene14 from './scene14.js';

gsap.registerPlugin(ScrollTrigger);

/* ── Galaxy ── */
const galaxy = new Galaxy(document.getElementById('galaxy-canvas'));

/* ── Scenes ── */
const scene1 = new Scene1(galaxy);
const scene2 = new Scene2(galaxy);
const scene3 = new Scene3();
const scene4 = new Scene4();
const scene5 = new Scene5();
const scene6 = new Scene6();
const scene8 = new Scene8();
const scene10 = new Scene10();
const scene11 = new Scene11();
const scene13 = new Scene13();
const scene14 = new Scene14();


/* ── Mouse / Touch Parallax ── */
document.addEventListener('mousemove', (e) => {
    galaxy.setMouse(
        (e.clientX / window.innerWidth - 0.5) * 2,
        (e.clientY / window.innerHeight - 0.5) * 2
    );
});
document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) galaxy.setMouse(
        (e.touches[0].clientX / window.innerWidth - 0.5) * 2,
        (e.touches[0].clientY / window.innerHeight - 0.5) * 2
    );
}, { passive: true });

/* ══════════════════════════════════════════════════
   SCROLL LOCK HELPERS
   ══════════════════════════════════════════════════ */
let _savedScrollY = 0;

function lockScroll() {
    _savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${_savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
}

function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    window.scrollTo(0, _savedScrollY);
}

/* ══════════════════════════════════════════════════
   CUSTOM SMOOTH SCROLL — GSAP driven, cinematic pace
   ══════════════════════════════════════════════════ */
function smoothScrollTo(targetY, duration, onComplete) {
    const proxy = { y: window.scrollY };
    gsap.to(proxy, {
        y: targetY,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => window.scrollTo(0, proxy.y),
        onComplete,
    });
}

/* ══════════════════════════════════════════════════
   SCENE 2 → SCENE 3 CHAIN
   ══════════════════════════════════════════════════ */
let scene2Fired = false;
let s2Timer = null;
let s2Interval = null;

function triggerScene2({ snap = true, force = false } = {}) {
    if (scene2Fired && !force) return;

    if (force) {
        scene2Fired = false;
        scene2.reset();
    }

    scene2Fired = true;

    const el = document.getElementById('scene-2');
    const targetY = el.offsetTop;

    const runAnimation = () => {
        lockScroll();

        if (s2Timer) clearTimeout(s2Timer);
        if (s2Interval) clearInterval(s2Interval);

        scene2.start();

        s2Timer = setTimeout(() => chainScene3(), 12000);
        s2Interval = setInterval(() => {
            const tl = scene2.tl;
            if (tl && tl.progress() >= 0.99) {
                clearInterval(s2Interval);
                clearTimeout(s2Timer);
                s2Interval = s2Timer = null;
                setTimeout(() => chainScene3(), 600);
            }
        }, 250);
    };

    if (snap) {
        smoothScrollTo(targetY, 1.6, runAnimation);
    } else {
        runAnimation();
    }
}

function chainScene3() {
    const el = document.getElementById('scene-3');
    const targetY = el.offsetTop;

    unlockScroll();

    smoothScrollTo(targetY, 1.8, () => {
        lockScroll();
        scene3.reset();
        scene3.start();
    });
}

/* ══════════════════════════════════════════════════
   SCENE TRANSITION WIRING
   ══════════════════════════════════════════════════ */
let isAutoNavigating = false;

function forcePlayScene(sceneObj, targetId, duration = 1.8, startOptions = []) {
    const target = document.getElementById(targetId);
    if (!target) return;

    isAutoNavigating = true;
    sceneObj.reset();

    const targetY = target.getBoundingClientRect().top + window.pageYOffset;

    smoothScrollTo(targetY, duration, () => {
        sceneObj.start(...startOptions);
        setTimeout(() => { isAutoNavigating = false; }, 500);
    });
}

function wireSceneButtons() {
    // S3 to S4
    const s3btn = document.getElementById('s3-next-btn');
    if (s3btn) {
        s3btn.onclick = (e) => {
            e.preventDefault();
            forcePlayScene(scene4, 'scene-4', 1.8, [false]);
        };
    }

    // S4 to S5
    const s4btn = document.getElementById('s4-next-trigger');
    if (s4btn) {
        s4btn.onclick = (e) => {
            e.preventDefault();
            forcePlayScene(scene5, 'scene-5', 1.8);
        };
    }

    // S5 to S6
    const s5btn = document.querySelector('.next-scene-btn.s5-to-s6');
    if (s5btn) {
        s5btn.onclick = (e) => {
            e.preventDefault();
            forcePlayScene(scene6, 'scene-6', 1.8);
        };
    }

    // S6 to S8
    const s6btn = document.getElementById('s6-next-trigger');
    if (s6btn) {
        s6btn.onclick = (e) => {
            e.preventDefault();
            forcePlayScene(scene8, 'scene-8', 1.8);
        };
    }

    // S8 to S10
    const s8btn = document.getElementById('s8-next-trigger');
    if (s8btn) {
        s8btn.onclick = (e) => {
            e.preventDefault();
            forcePlayScene(scene10, 'scene-10', 1.8);
        };
    }

    // S10 to S11
    const s10btn = document.getElementById('s10-next-trigger');
    if (s10btn) {
        s10btn.onclick = (e) => {
            e.preventDefault();
            forcePlayScene(scene11, 'scene-11', 1.8);
        };
    }

    // S11 to S13
    const s11Next = document.getElementById('s11-btn-next');
    if (s11Next) {
        s11Next.onclick = (e) => {
            if (e) e.preventDefault();
            forcePlayScene(scene13, 'scene-13', 2.0);
        };
    }

    // S13 to S14
    const s13FinaleBtn = document.getElementById('s13-btn-finale');
    if (s13FinaleBtn) {
        s13FinaleBtn.onclick = (e) => {
            if (e) e.preventDefault();
            forcePlayScene(scene14, 'scene-14', 2.0);
        };
    }
}

/* ══════════════════════════════════════════════════
   SCENE COMPLETION LISTENERS
   ══════════════════════════════════════════════════ */
window.addEventListener('scene3:complete', () => {
    unlockScroll();
});

window.addEventListener('scene5:complete', () => {
    // Buttons are pre-wired in wireSceneButtons()
});

window.addEventListener('scene6:complete', () => {
    // Buttons are pre-wired in wireSceneButtons()
});

/* ══════════════════════════════════════════════════
   SCENE 8 COMPLETE → ready for Scene 10
   ══════════════════════════════════════════════════ */
window.addEventListener('scene8:complete', () => {
    // S8 → S10 wired via button
});

/* ══════════════════════════════════════════════════
   SCENE 10 COMPLETE → ready for Scene 11
   ══════════════════════════════════════════════════ */
window.addEventListener('scene10:complete', () => {
    // S10 → S11 wired via button
});

/* ══════════════════════════════════════════════════
   SCENE 11 COMPLETE → ready for Scene 9
   ══════════════════════════════════════════════════ */
window.addEventListener('scene13:complete', () => {
    // Auto-scroll to grand finale
    const el = document.getElementById('scene-14');
    if (el) {
        smoothScrollTo(el.offsetTop, 2, () => scene14.start());
    }
});

/* ══════════════════════════════════════════════════
   SMART INIT — handles refresh at any scroll position
   ══════════════════════════════════════════════════ */
let scenesInitialized = false;

async function initScenes() {
    if (scenesInitialized) return;
    scenesInitialized = true;

    if (document.fonts) await document.fonts.ready;
    await new Promise(r => requestAnimationFrame(r));
    ScrollTrigger.refresh();

    const sy = window.scrollY || window.pageYOffset;
    const vH = window.innerHeight;

    const s2Top = document.getElementById('scene-2').offsetTop;
    const s3Top = document.getElementById('scene-3').offsetTop;
    const s4Top = document.getElementById('scene-4').offsetTop;

    if (sy < 10) {
        scene1.start();
    } else {
        scene1.skipToEnd();
        gsap.set('#black-veil', { opacity: 0 });
        galaxy.setWarp(0);

        const s5Top = document.getElementById('scene-5').offsetTop;
        const s6El = document.getElementById('scene-6');
        const s6Top = s6El ? s6El.offsetTop : Infinity;
        const s8El = document.getElementById('scene-8');
        const s8Top = s8El ? s8El.offsetTop : Infinity;
        const s10El = document.getElementById('scene-10');
        const s10Top = s10El ? s10El.offsetTop : Infinity;
        const s11El = document.getElementById('scene-11');
        const s11Top = s11El ? s11El.offsetTop : Infinity;

        if (sy >= s11Top - vH * 0.5) {
            scene2Fired = true;
            scene2.skipToEnd();
            scene3.skipToEnd();
            scene4.start(true);
            scene5.start();
            scene6.skipToEnd();
            scene8.skipToEnd();
            scene10.skipToEnd();
            window.scrollTo(0, s11Top);
            scene11.skipToEnd();
        } else if (sy >= s10Top - vH * 0.5) {
            scene2Fired = true;
            scene2.skipToEnd();
            scene3.skipToEnd();
            scene4.start(true);
            scene5.start();
            scene6.skipToEnd();
            scene8.skipToEnd();
            window.scrollTo(0, s10Top);
            scene10.skipToEnd();
        } else if (sy >= s8Top - vH * 0.5) {
            scene2Fired = true;
            scene2.skipToEnd();
            scene3.skipToEnd();
            scene4.start(true);
            scene5.start();
            scene6.skipToEnd();
            window.scrollTo(0, s8Top);
            scene8.skipToEnd();
        } else if (sy >= s6Top - vH * 0.5) {
            scene2Fired = true;
            scene2.skipToEnd();
            scene3.skipToEnd();
            scene4.start(true);
            scene5.start();
            window.scrollTo(0, s6Top);
            scene6.skipToEnd();
        } else if (sy >= s5Top - vH * 0.5) {
            scene2Fired = true;
            scene2.skipToEnd();
            scene3.skipToEnd();
            scene4.start(true);
            window.scrollTo(0, s5Top);
            scene5.start();
        } else if (sy >= s4Top - vH * 0.5) {
            scene2Fired = true;
            scene2.skipToEnd();
            scene3.skipToEnd();
            window.scrollTo(0, s4Top);
            scene4.start(true);
        } else if (sy >= s3Top - vH * 0.5) {
            scene2Fired = true;
            scene2.skipToEnd();
            window.scrollTo(0, s3Top);
            lockScroll();
            scene3.start();
        } else if (sy >= s2Top - vH * 0.8) {
            window.scrollTo(0, s2Top);
            triggerScene2({ snap: false });
        }
    }

    /* ── ScrollTriggers ── */

    // Warp Zone
    ScrollTrigger.create({
        trigger: '#warp-zone',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
        onUpdate(self) {
            const p = self.progress;
            if (p < 0.65) {
                galaxy.setWarp(p / 0.65);
                gsap.set('#black-veil', { opacity: 0 });
            } else {
                galaxy.setWarp(1);
                gsap.set('#black-veil', { opacity: (p - 0.65) / 0.35 });
            }
        },
        onLeave() {
            galaxy.setWarp(0);
            gsap.to('#black-veil', { opacity: 0, duration: 0.5, delay: 0.3, ease: 'power1.out' });
        },
        onEnterBack() {
            gsap.set('#black-veil', { opacity: 0 });
            galaxy.setWarp(0);
        },
    });

    // Scene 2 Trigger
    ScrollTrigger.create({
        trigger: '#scene-2',
        start: 'top 70%',
        once: true,
        onEnter: () => {
            if (!isAutoNavigating) triggerScene2({ snap: false });
        },
    });

    // Scene 4 Trigger
    ScrollTrigger.create({
        trigger: '#scene-4',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            if (!isAutoNavigating) scene4.start(true);
        },
    });

    // Scene 5 Trigger
    ScrollTrigger.create({
        trigger: '#scene-5',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            if (!isAutoNavigating) scene5.skipToEnd();
        },
    });



    // Scene 6 Trigger
    ScrollTrigger.create({
        trigger: '#scene-6',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            if (!isAutoNavigating) scene6.skipToEnd();
        },
    });

    // Scene 8 Trigger
    ScrollTrigger.create({
        trigger: '#scene-8',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            if (!isAutoNavigating) scene8.skipToEnd();
        },
    });

    // Scene 10 Trigger
    ScrollTrigger.create({
        trigger: '#scene-10',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            if (!isAutoNavigating) scene10.skipToEnd();
        },
    });

    // Scene 11 Trigger
    ScrollTrigger.create({
        trigger: '#scene-11',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            if (!isAutoNavigating) scene11.skipToEnd();
        },
    });

    // Scene 13 Trigger
    ScrollTrigger.create({
        trigger: '#scene-13',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            if (!isAutoNavigating) scene13.skipToEnd();
        },
    });

    // Scene 14 Trigger (Grand Finale)
    ScrollTrigger.create({
        trigger: '#scene-14',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            if (!isAutoNavigating) scene14.start();
        },
    });

    // Wire all continue/next buttons
    wireSceneButtons();

    ScrollTrigger.refresh();
}

/**
 * Wait for browser to restore scroll position before running init
 */
window.addEventListener('load', () => {
    let attempts = 0;
    const checkScroll = () => {
        attempts++;
        const sy = window.scrollY || window.pageYOffset;
        if (sy > 0 || attempts > 20) {
            initScenes();
        } else {
            requestAnimationFrame(checkScroll);
        }
    };
    checkScroll();
});

/* ══════════════════════════════════════════════════
   SCROLL INDICATOR CLICK → jump to Scene 2
   ══════════════════════════════════════════════════ */
document.getElementById('scroll-indicator').addEventListener('click', () => {
    triggerScene2({ snap: true, force: true });
});

/* ══════════════════════════════════════════════════
   RECAP BUTTONS (Replay Scene)
   ══════════════════════════════════════════════════ */
document.querySelectorAll('.recap-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const sceneNum = btn.getAttribute('data-scene');

        if (sceneNum === '1') {
            scene1.reset();
            scene1.start();
        } else if (sceneNum === '2') {
            triggerScene2({ snap: false, force: true });
        } else if (sceneNum === '3') {
            scene3.reset();
            scene3.start();
        } else if (sceneNum === '4') {
            scene4.reset();
            scene4.start();
        } else if (sceneNum === '5') {
            scene5.reset();
            scene5.start();
        } else if (sceneNum === '6') {
            const el = document.getElementById('scene-6');
            smoothScrollTo(el.offsetTop, 1.2, () => {
                scene6.reset();
                scene6.start();
            });
        } else if (sceneNum === '8') {
            const el = document.getElementById('scene-8');
            smoothScrollTo(el.offsetTop, 1.2, () => {
                scene8.reset();
                scene8.start();
            });
        } else if (sceneNum === '10') {
            const el = document.getElementById('scene-10');
            smoothScrollTo(el.offsetTop, 1.2, () => {
                scene10.reset();
                scene10.start();
            });
        } else if (sceneNum === '11') {
            const el = document.getElementById('scene-11');
            smoothScrollTo(el.offsetTop, 1.2, () => {
                scene11.reset();
                scene11.start();
            });
        } else if (sceneNum === '13') {
            const el = document.getElementById('scene-13');
            smoothScrollTo(el.offsetTop, 1.2, () => {
                scene13.reset();
                scene13.start();
            });
        } else if (sceneNum === '14') {
            const el = document.getElementById('scene-14');
            smoothScrollTo(el.offsetTop, 1.2, () => {
                scene14.reset();
                scene14.start();
            });
        }
    });

    gsap.to(btn, { opacity: 0.6, duration: 0.1 });
    btn.addEventListener('mouseenter', () => gsap.to(btn, { opacity: 1, duration: 0.3 }));
    btn.addEventListener('mouseleave', () => gsap.to(btn, { opacity: 0.6, duration: 0.3 }));
});

/* ══════════════════════════════════════════════════
   NEXT SCENE BUTTONS (Smooth Scroll)
   ══════════════════════════════════════════════════ */

