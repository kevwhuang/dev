import type { ImageMetadata } from 'astro';

const IMAGES = import.meta.glob<{ default: ImageMetadata }>('/src/images/*/*.webp', { eager: true });

export function getFrames(id: string): ImageMetadata[] {
    const pattern = new RegExp(`^/src/images/${id}/(\\d+)\\.webp$`);

    return Object.entries(IMAGES)
        .map(([path, module]) => ({ frame: pattern.exec(path), module }))
        .filter((entry): entry is { frame: RegExpExecArray; module: { default: ImageMetadata } } => entry.frame !== null)
        .sort((a, b) => Number(a.frame[1]) - Number(b.frame[1]))
        .map(entry => entry.module.default);
}
