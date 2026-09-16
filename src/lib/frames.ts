import { REDUCED_MOTION_QUERY } from '@lib/constants';

const CONTAINER_SELECTOR = '[data-project]';
const CURRENT_ATTRIBUTE = 'data-current';
const FIRST_INDEX = 0;
const FRAME_INTERVAL = 1_000;
const FRAME_SELECTOR = '[data-frame]';
const MINIMUM_FRAMES = 2;
const VISIBILITY_THRESHOLD = 0.5;

const indexes = new Map<string, number>();
const playing = new Set<HTMLElement>();

let observer: IntersectionObserver | undefined;
let timer: ReturnType<typeof setInterval> | undefined;

function advanceFrames() {
    playing.forEach(container => applyFrame(container, (indexes.get(getProjectId(container)) ?? FIRST_INDEX) + 1));
}

function applyFrame(container: HTMLElement, index: number) {
    const frames = container.querySelectorAll<HTMLElement>(FRAME_SELECTOR);

    if (frames.length === 0) return;

    const current = index % frames.length;

    frames.forEach((frame, position) => frame.toggleAttribute(CURRENT_ATTRIBUTE, position === current));
    indexes.set(getProjectId(container), current);
}

function getProjectId(container: HTMLElement) {
    return container.dataset.project ?? '';
}

function handleIntersect(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
        if (!(entry.target instanceof HTMLElement)) return;

        if (entry.isIntersecting) playing.add(entry.target);
        else playing.delete(entry.target);
    });
}

function initFrames() {
    teardownFrames();

    const containers = document.querySelectorAll<HTMLElement>(CONTAINER_SELECTOR);

    if (containers.length === 0) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const frameObserver = new IntersectionObserver(handleIntersect, { threshold: VISIBILITY_THRESHOLD });

    containers.forEach((container) => {
        if (container.querySelectorAll(FRAME_SELECTOR).length < MINIMUM_FRAMES) return;

        applyFrame(container, indexes.get(getProjectId(container)) ?? FIRST_INDEX);
        frameObserver.observe(container);
    });

    observer = frameObserver;
    timer = setInterval(advanceFrames, FRAME_INTERVAL);
}

function teardownFrames() {
    clearInterval(timer);
    observer?.disconnect();
    observer = undefined;
    playing.clear();
    timer = undefined;
}

document.addEventListener('astro:before-swap', teardownFrames);
document.addEventListener('astro:page-load', initFrames);
