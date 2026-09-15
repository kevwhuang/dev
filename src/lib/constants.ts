export const CLASS_BUTTON = 'disabled:opacity-50 focus-visible:border-vermilion focus-visible:text-vermilion not-disabled:active:bg-vermilion-10 not-disabled:hover:border-vermilion not-disabled:hover:text-vermilion inline-flex items-center justify-center min-h-12 px-6 border border-slate font-mono text-xs tracking-[0.14em] uppercase text-frost duration-(--duration-fast) transition-[background-color,border-color,color,opacity] select-none';
export const CLASS_ERROR_CODE = 'max-w-full w-max -ml-[0.04em] mb-(--gap-m) font-bold leading-[0.9] text-numeral tracking-[-0.06em] bg-clip-text bg-linear-to-b from-vermilion-bright text-transparent to-vermilion select-none';
export const CONTACT_EMAIL = 'kevin@aephonics.com';
export const EMAIL_MAX = 200;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const FRAMES_MIN = 2;
export const HERO_SHOWN_KEY = 'dev_hero_shown';
export const MESSAGE_MAX = 2_000;
export const NAME_MAX = 100;
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const ROUTES = [
    { href: '/', label: 'Home' },
    { href: '/work', label: 'Work' },
    { href: '/eng', label: 'Eng' },
] as const;

export const TIERS = [
    { id: 'enterprise', label: 'Enterprise' },
    { id: 'entrepreneur', label: 'Entrepreneur' },
    { id: 'creative', label: 'Creative' },
    { id: 'personal', label: 'Personal' },
    { id: 'dev', label: 'Dev' },
] as const;

export const TIMEZONE = 'America/Chicago';
