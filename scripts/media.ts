import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { $ } from 'bun';

type Completion = { backup: string; final: string; original: string };
type Size = { height: number; width: number };

interface Geometry {
    cropHeight: number;
    cropWidth: number;
    targetHeight: number;
    targetWidth: number;
}

const ASPECT = { height: 4, width: 3 };
const BACKUP_MARKER = '___backup___';
const COMPLETED: Completion[] = [];
const CONCURRENCY = 4;
const CREATION_TIME = '2026-01-01T12:00:00Z';
const CREATION_TIME_EXIF = '2026:01:01 12:00:00';
const CROP_TOLERANCE = 10;
const DEVELOPER = path.join(os.tmpdir(), 'media-develop');
const JPEG_QUALITY = 95;

const KEEP_GAIN_MAP = [
    '-EXIF:all=',
    '-IPTC:all=',
    '-MakerNotes:all=',
    '-Photoshop:all=',
    '-XMP:all=',
];

const KEEP_PROFILE = ['-all=', '-tagsfromfile', '@', '-icc_profile'];
const PHOTO_EXTENSIONS = new Set(['.heic', '.jpeg', '.jpg', '.png']);
const STRIP_ALL = ['-all='];
const TARGET = { height: 4_800, width: 3_600 };
const TRANSPOSED_ORIENTATION = 5;
const VIDEO_EXTENSIONS = new Set(['.mov', '.mp4']);

function backupPath(file: string) {
    const { dir, ext, name } = path.parse(file);

    return path.join(dir, name + BACKUP_MARKER + ext);
}

async function checkDependencies() {
    if (!Bun.which('exiftool')) process.exit(1);
    if (!Bun.which('swiftc')) process.exit(1);

    await compile('develop.swift', DEVELOPER);
}

function cleanStem(stem: string) {
    return stem.trim().replace(/ {2,}/g, ' ');
}

function collectMedia(directory: string) {
    const names = fs
        .readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isFile())
        .map(entry => entry.name)
        .filter(name => !name.startsWith('.'));

    const backups = names.filter(name => name.includes(BACKUP_MARKER));

    const photoMarks = new Set(backups.filter(isPhoto).map(stemOf));
    const videoMarks = new Set(backups.filter(isVideo).map(stemOf));

    const fresh = names
        .filter(name => !name.includes(BACKUP_MARKER))
        .filter(name => isPhoto(name) || isVideo(name))
        .filter(name => !(isPhoto(name) ? photoMarks : videoMarks).has(stemOf(name)));

    return dropCollisions(fresh).map(name => path.join(directory, name));
}

async function compile(script: string, binary: string) {
    const source = path.join(import.meta.dir, script);

    const fresh = fs.existsSync(binary) && fs.statSync(binary).mtimeMs >= fs.statSync(source).mtimeMs;

    if (!fresh) await $`swiftc -O ${source} -o ${binary}`.quiet();
}

async function develop(photo: string, geometry: Geometry | null) {
    const { dir, name } = path.parse(photo);

    const developed = path.join(dir, `${name}.jpg`);

    if (developed !== photo && fs.existsSync(developed)) {
        throw new Error(`Cannot develop ${path.basename(photo)}; ${path.basename(developed)} already exists.`);
    }

    const { cropHeight = 0, cropWidth = 0, targetHeight = 0, targetWidth = 0 } = geometry ?? {};

    const flags = [photo, developed, JPEG_QUALITY / 100, cropHeight, cropWidth, targetHeight, targetWidth].map(String);

    await $`${DEVELOPER} ${flags}`.quiet();

    if (developed !== photo) fs.rmSync(photo);

    return developed;
}

function dropCollisions(names: string[]) {
    const counts = new Map<string, number>();

    for (const name of names.filter(isPhoto)) {
        const stem = stemOf(name);

        counts.set(stem, (counts.get(stem) ?? 0) + 1);
    }

    return names.filter(name => !isPhoto(name) || (counts.get(stemOf(name)) ?? 0) < 2);
}

async function finalize() {
    if (COMPLETED.length === 0) return;

    const answer = prompt('\nAccept? (y)');

    if (answer?.toLowerCase() === 'y') {
        const backups = COMPLETED.map(completion => completion.backup);

        await $`/usr/bin/trash ${backups}`.quiet();

        return;
    }

    for (const { backup, final, original } of COMPLETED) {
        if (final !== original) fs.rmSync(final, { force: true });

        fs.renameSync(backup, original);
    }
}

async function hasGainMap(photo: string) {
    const output = await $`exiftool -MPImage2 -s3 ${photo}`.text();

    return output.trim().length > 0;
}

function isPhoto(name: string) {
    return PHOTO_EXTENSIONS.has(path.extname(name).toLowerCase());
}

function isVideo(name: string) {
    return VIDEO_EXTENSIONS.has(path.extname(name).toLowerCase());
}

async function main() {
    await checkDependencies();

    const directory = resolveDirectory();

    const media = collectMedia(directory);

    const workers = Array.from({ length: CONCURRENCY }, () => processQueue(media));

    await Promise.all(workers);
    await finalize();
}

async function measureGeometry(photo: string) {
    const { height, width } = await readDimensions(photo);

    const landscape = width > height;

    const aspect = landscape ? transpose(ASPECT) : ASPECT;
    const target = landscape ? transpose(TARGET) : TARGET;

    const exact = height * aspect.width === width * aspect.height;
    const small = height < target.height || width < target.width;

    if (exact || small) return null;

    const unit = Math.min(Math.floor(height / aspect.height), Math.floor(width / aspect.width));

    const cropHeight = unit * aspect.height;
    const cropWidth = unit * aspect.width;

    const excessHeight = height - cropHeight;
    const excessWidth = width - cropWidth;

    if (excessHeight > CROP_TOLERANCE || excessWidth > CROP_TOLERANCE) {
        return null;
    }

    return { cropHeight, cropWidth, targetHeight: target.height, targetWidth: target.width };
}

function normalizeFilename(file: string) {
    const { dir, ext, name } = path.parse(file);

    const cleanExtension = ext.toLowerCase().replace('.jpeg', '.jpg');
    const cleanName = cleanStem(name);

    if (!cleanName) return null;

    const renamed = path.join(dir, cleanName + cleanExtension);

    if (renamed === file) return file;

    if (fs.existsSync(renamed) && fs.statSync(renamed).ino !== fs.statSync(file).ino) {
        return null;
    }

    fs.renameSync(file, renamed);

    return renamed;
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

function preprocess(file: string) {
    fs.copyFileSync(file, backupPath(file));

    return normalizeFilename(file);
}

async function preserve(photo: string) {
    const flags = await scrubFlags(photo);

    await $`exiftool ${flags} -overwrite_original ${photo}`.quiet();

    return photo;
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

    const orientation = await readOrientation(photo);

    if (orientation < TRANSPOSED_ORIENTATION) return { height, width };

    return { height: width, width: height };
}

async function readOrientation(photo: string) {
    const output = await $`exiftool -Orientation -n -s3 ${photo}`.text();

    return Number(output.trim()) || 1;
}

async function readProfile(photo: string) {
    const output = await $`sips -g profile ${photo}`.text();

    return /profile: (.+)/.exec(output)?.[1] ?? '';
}

function resolveDirectory() {
    const input = process.argv[2];

    if (!input) process.exit(1);

    const directory = path.resolve(input);

    if (!fs.existsSync(directory)) process.exit(1);
    if (!fs.statSync(directory).isDirectory()) process.exit(1);

    return directory;
}

function rollback(file: string, working: string) {
    const backup = backupPath(file);

    if (working !== file) fs.rmSync(working, { force: true });
    if (fs.existsSync(backup)) fs.renameSync(backup, file);

    return null;
}

async function scrubFlags(photo: string) {
    if (await hasGainMap(photo)) return KEEP_GAIN_MAP;

    const profile = await readProfile(photo);

    return profile.includes('P3') ? KEEP_PROFILE : STRIP_ALL;
}

async function scrubVideo(video: string) {
    const flags = [
        '-overwrite_original',
        '-Keys:all=',
        '-UserData:all=',
        '-VideoKeys:all=',
        `-CreateDate=${CREATION_TIME_EXIF}`,
        `-CreationDate=${CREATION_TIME_EXIF}-00:00`,
        `-MediaCreateDate=${CREATION_TIME_EXIF}`,
        `-MediaModifyDate=${CREATION_TIME_EXIF}`,
        `-ModifyDate=${CREATION_TIME_EXIF}`,
        `-TrackCreateDate=${CREATION_TIME_EXIF}`,
        `-TrackModifyDate=${CREATION_TIME_EXIF}`,
    ];

    await $`exiftool ${flags} ${video}`.quiet();

    return video;
}

function stemOf(name: string) {
    const stem = path.parse(name).name.split(BACKUP_MARKER)[0];

    return cleanStem(stem).toLowerCase();
}

async function transcode(file: string) {
    let current = file;

    try {
        const prepared = preprocess(file);

        if (!prepared) return rollback(file, current);

        current = prepared;

        current = await transform(current);

        await normalizeTimestamps(current);

        COMPLETED.push({ backup: backupPath(file), final: current, original: file });

        return current;
    } catch {
        return rollback(file, current);
    }
}

async function transform(file: string) {
    const { ext } = path.parse(file);

    if (VIDEO_EXTENSIONS.has(ext)) return scrubVideo(file);

    const geometry = await measureGeometry(file);

    if (ext === '.jpg' && !geometry) return preserve(file);

    return develop(file, geometry);
}

function transpose(size: Size) {
    return { height: size.width, width: size.height };
}

await main();
