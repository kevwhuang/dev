import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { $ } from 'bun';

type Completion = { backup: string; crops: string[]; original: string };

const BACKUP_MARKER = '___backup___';
const COMPLETED: Completion[] = [];
const CONCURRENCY = 4;
const CREATION_TIME = '2026-01-01T12:00:00Z';
const CROP_COUNT = 5;
const CROPPER = path.join(os.tmpdir(), 'instagram-crop');
const JPEG_QUALITY = 95;
const PHOTO_EXTENSIONS = new Set(['.heic', '.jpeg', '.jpg', '.png']);
const TARGET = { height: 1_350, width: 1_080 };

function backupPath(file: string) {
    const { dir, ext, name } = path.parse(file);

    return path.join(dir, name + BACKUP_MARKER + ext);
}

async function checkDependencies() {
    if (!Bun.which('swiftc')) process.exit(1);

    await compile('crop.swift', CROPPER);
}

function collectPhotos(directory: string) {
    return fs
        .readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isFile())
        .map(entry => entry.name)
        .filter(name => !name.startsWith('.'))
        .filter(name => !name.includes(BACKUP_MARKER))
        .filter(name => PHOTO_EXTENSIONS.has(path.extname(name).toLowerCase()))
        .map(name => path.join(directory, name));
}

async function compile(script: string, binary: string) {
    const source = path.join(import.meta.dir, script);

    const fresh = fs.existsSync(binary) && fs.statSync(binary).mtimeMs >= fs.statSync(source).mtimeMs;

    if (!fresh) await $`swiftc -O ${source} -o ${binary}`.quiet();
}

async function crop(photo: string) {
    const offsets = await measureOffsets(photo);

    if (!offsets) return null;

    const crops: string[] = [];

    for (const [index, offset] of offsets.entries()) {
        crops.push(await render(photo, offset, index + 1));
    }

    return crops;
}

async function finalize() {
    if (COMPLETED.length === 0) return;

    const answer = prompt('\nAccept? (y)');

    if (answer?.toLowerCase() === 'y') {
        const backups = COMPLETED.map(completion => completion.backup);

        await $`/usr/bin/trash ${backups}`.quiet();

        return;
    }

    for (const { backup, crops, original } of COMPLETED) {
        for (const crop of crops) {
            fs.rmSync(crop, { force: true });
        }

        fs.renameSync(backup, original);
    }
}

async function main() {
    await checkDependencies();

    const directory = resolveDirectory();

    const photos = collectPhotos(directory);

    const workers = Array.from({ length: CONCURRENCY }, () => processQueue(photos));

    await Promise.all(workers);
    await finalize();
}

async function measureOffsets(photo: string) {
    const { height, width } = await readDimensions(photo);

    const scaledHeight = Math.round((TARGET.width * height) / width);
    const slack = scaledHeight - TARGET.height;

    if (slack < 0) return null;

    return Array.from({ length: CROP_COUNT }, (_, index) => Math.round((slack * index) / (CROP_COUNT - 1)));
}

async function normalizeTimestamps(file: string) {
    const date = new Date(CREATION_TIME);

    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const year = date.getFullYear();

    const stamp = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;

    await $`/usr/bin/touch -d ${CREATION_TIME} ${file}`.quiet();
    await $`/usr/bin/SetFile -d ${stamp} ${file}`.quiet();
}

async function processQueue(queue: string[]) {
    while (queue.length > 0) {
        const file = queue.shift();

        if (!file) return;

        await transcode(file);
    }
}

async function readDimensions(photo: string) {
    const output = await $`sips -g pixelWidth -g pixelHeight ${photo}`.text();

    const height = Number(/pixelHeight: (\d+)/.exec(output)?.[1]);
    const width = Number(/pixelWidth: (\d+)/.exec(output)?.[1]);

    if (!height || !width) throw new Error('Unreadable dimensions.');

    return { height, width };
}

async function render(photo: string, offset: number, position: number) {
    const { dir, name } = path.parse(photo);

    const output = path.join(dir, `${name}_${position}.jpg`);
    const flags = [photo, output, JPEG_QUALITY / 100, TARGET.width, TARGET.height, offset].map(String);

    await $`${CROPPER} ${flags}`.quiet();
    await normalizeTimestamps(output);

    return output;
}

function resolveDirectory() {
    const input = process.argv[2];

    if (!input) process.exit(1);

    const directory = path.resolve(input);

    if (!fs.existsSync(directory)) process.exit(1);
    if (!fs.statSync(directory).isDirectory()) process.exit(1);

    return directory;
}

function rollback(file: string) {
    const backup = backupPath(file);
    const { dir, name } = path.parse(file);

    for (let position = 1; position <= CROP_COUNT; position++) {
        fs.rmSync(path.join(dir, `${name}_${position}.jpg`), { force: true });
    }

    if (fs.existsSync(backup)) fs.renameSync(backup, file);

    return null;
}

async function transcode(file: string) {
    try {
        fs.copyFileSync(file, backupPath(file));

        const crops = await crop(file);

        if (!crops) return rollback(file);

        fs.rmSync(file);
        COMPLETED.push({ backup: backupPath(file), crops, original: file });

        return crops;
    } catch {
        return rollback(file);
    }
}

await main();
