import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { REDUCED_MOTION_QUERY } from '@lib/constants';

const SCROLL_DURATION = 0.7;
const SCROLL_EASE = 'power3.out';
const SCROLL_OFFSET = 24;
const SCROLL_START = 'top 85%';

const revealTweens: gsap.core.Tween[] = [];

function handleFocusIn(event: FocusEvent) {
    const { target } = event;

    if (!(target instanceof Element)) return;

    const revealTarget = target.closest<HTMLElement>('[data-scroll]');

    if (!revealTarget) return;

    ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger && revealTarget.contains(trigger.trigger)) trigger.kill();
    });

    revealInstantly(revealTarget);
}

function initScrollAnimations() {
    document.querySelectorAll<HTMLElement>('[data-scroll]').forEach((element) => {
        const from: gsap.TweenVars = { opacity: 0, y: SCROLL_OFFSET };
        const stagger = Number.parseFloat(element.dataset.scrollStagger || '0');

        const to: gsap.TweenVars = {
            duration: SCROLL_DURATION,
            ease: SCROLL_EASE,
            opacity: 1,
            scrollTrigger: {
                once: true,
                start: SCROLL_START,
                trigger: element,
            },
            y: 0,
        };

        if (stagger > 0) {
            const children = element.children;

            to.stagger = stagger;
            gsap.set(children, from);
            gsap.set(element, { opacity: 1 });
            revealTweens.push(gsap.to(children, to));
        } else {
            revealTweens.push(gsap.fromTo(element, from, to));
        }
    });
}

function revealInstantly(element: HTMLElement) {
    const children = Array.from(element.children);

    gsap.getTweensOf([element, ...children]).forEach(tween => tween.kill());
    gsap.set(element, { clearProps: 'transform', opacity: 1 });

    if (children.length > 0) gsap.set(children, { clearProps: 'opacity,transform' });
}

document.addEventListener('focusin', handleFocusIn);
gsap.registerPlugin(ScrollTrigger);

export async function initMotion(): Promise<void> {
    const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

    revealTweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
    });

    revealTweens.length = 0;

    if (prefersReducedMotion) {
        document.querySelectorAll<HTMLElement>('[data-scroll]').forEach(revealInstantly);

        return;
    }

    await document.fonts.ready;

    initScrollAnimations();
    ScrollTrigger.refresh();

    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
}
