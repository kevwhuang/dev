import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { $ } from 'bun';

type Completion = { backup: string; final: string; original: string };
type Counts = { failed: number; processed: number };
type Size = { height: number; width: number };

interface Geometry {
    cropHeight: number;
    cropWidth: number;
    targetHeight: number;
    targetWidth: number;
}

const ASPECT = { height: 4, width: 3 };
const BACKUP_MARKER = '___backup___';
const COLUMN_GAP = 2;
const COMPLETED: Completion[] = [];
const CONCURRENCY = 4;
const CREATION_TIME = '2026-01-01T06:00:00Z';
const CROP_TOLERANCE = 10;
const DEVELOPER = path.join(os.tmpdir(), 'media-develop');
const JPEG_QUALITY = 95;
const KEEP_PROFILE = ['-all=', '-tagsfromfile', '@', '-icc_profile'];

const LABELS: Record<string, string> = {
    develop: 'Developed',
    preserve: 'Preserved',
    video: 'Videos',
};

const PHOTO_EXTENSIONS = new Set(['.heic', '.jpeg', '.jpg', '.png']);

const SCRUB = [
    '-Artist=',
    '-Copyright=',
    '-GPS:all=',
    '-HostComputer=',
    '-IFD1:all=',
    '-IPTC:all=',
    '-LensInfo=',
    '-LensMake=',
    '-LensModel=',
    '-LensSerialNumber=',
    '-Make=',
    '-Model=',
    '-OffsetTime=',
    '-OffsetTimeDigitized=',
    '-OffsetTimeOriginal=',
    '-SerialNumber=',
    '-Software=',
    '-SubSecTime=',
    '-SubSecTimeDigitized=',
    '-SubSecTimeOriginal=',
    '-XMP:all=',
    '-alldates=',
];

const STRIP_ALL = ['-all='];
const TALLIES = new Map(['preserve', 'develop', 'video'].map(key => [key, 0]));
const TARGET = { height: 4800, width: 3600 };
const TOUCH_TIMESTAMP = '202601010600.00';
const TRANSPOSED_ORIENTATION = 5;
const VIDEO_EXTENSIONS = new Set(['.mov', '.mp4']);

function backupPath(file: string) {
    const { dir, ext, name } = path.parse(file);

    return path.join(dir, name + BACKUP_MARKER + ext);
}

async function checkDependencies() {
    if (!Bun.which('exiftool')) fail('Missing exiftool; brew install it.');
    if (!Bun.which('ffmpeg')) fail('Missing ffmpeg; brew install it.');
    if (!Bun.which('swiftc')) fail('Missing swiftc; install the Xcode CLT.');

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
        throw new Error(`${path.basename(developed)} already exists`);
    }

    const { cropHeight = 0, cropWidth = 0, targetHeight = 0, targetWidth = 0 } = geometry ?? {};

    const flags = [photo, developed, JPEG_QUALITY / 100, cropHeight, cropWidth, targetHeight, targetWidth].map(String);

    await $`${DEVELOPER} ${flags}`.quiet();

    if (developed !== photo) fs.rmSync(photo);

    tally('develop');

    return developed;
}

function dropCollisions(names: string[]) {
    const counts = new Map<string, number>();

    for (const name of names.filter(isPhoto)) {
        const stem = stemOf(name);

        counts.set(stem, (counts.get(stem) ?? 0) + 1);
    }

    return names.filter((name) => {
        if (!isPhoto(name) || (counts.get(stemOf(name)) ?? 0) < 2) return true;

        skip(`Cannot process ${name}; another photo shares its name.`);

        return false;
    });
}

function fail(message: string) {
    console.error(message);
    process.exit(1);
}

async function finalize() {
    if (COMPLETED.length === 0) return;

    const answer = prompt('\nAccept? (y)');

    if (answer?.toLowerCase() === 'y') {
        const backups = COMPLETED.map(completion => completion.backup);

        await $`/usr/bin/trash ${backups}`.quiet();

        console.log('\nBackups trashed');

        return;
    }

    for (const { backup, final, original } of COMPLETED) {
        if (final !== original) fs.rmSync(final, { force: true });

        fs.renameSync(backup, original);
    }

    console.log('\nReverted');
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

    const counts = { failed: 0, processed: 0 };
    const media = collectMedia(directory);

    if (media.length > 0) console.log();

    const workers = Array.from({ length: CONCURRENCY }, () => processQueue(media, counts));

    await Promise.all(workers);
    report(counts);
    await finalize();
    console.log();
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

    if (!cleanName) {
        return skip(`Cannot normalize ${path.basename(file)}; the name is empty.`);
    }

    const renamed = path.join(dir, cleanName + cleanExtension);

    if (renamed === file) return file;

    if (fs.existsSync(renamed) && fs.statSync(renamed).ino !== fs.statSync(file).ino) {
        return skip(`Cannot rename ${path.basename(file)}; ${path.basename(renamed)} already exists.`);
    }

    fs.renameSync(file, renamed);

    return renamed;
}

async function normalizeTimestamps(file: string) {
    await $`/usr/bin/touch -t ${TOUCH_TIMESTAMP} ${file}`.quiet();
}

function preprocess(file: string) {
    fs.copyFileSync(file, backupPath(file));

    return normalizeFilename(file);
}

async function preserve(photo: string) {
    const flags = await scrubFlags(photo);

    await $`exiftool ${flags} -overwrite_original ${photo}`.quiet();
    tally('preserve');

    return photo;
}

async function processQueue(queue: string[], counts: Counts) {
    while (queue.length > 0) {
        const file = queue.shift();

        if (!file) return;

        const result = await transcode(file);

        if (result) {
            counts.processed++;
            console.log(path.basename(result));
        } else {
            counts.failed++;
        }
    }
}

async function readDimensions(photo: string) {
    const output = await $`sips -g pixelWidth -g pixelHeight ${photo}`.text();

    const height = Number(/pixelHeight: (\d+)/.exec(output)?.[1]);
    const width = Number(/pixelWidth: (\d+)/.exec(output)?.[1]);

    if (!height || !width) throw new Error('unreadable dimensions');

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

async function remuxVideo(video: string) {
    const { dir, ext, name } = path.parse(video);

    const scrubbed = path.join(dir, `.${name}${ext}`);

    const flags = [
        '-loglevel', 'error',
        '-y',
        '-i', video,
        '-map', '0:v',
        '-map', '0:a?',
        '-c', 'copy',
        '-map_metadata', '-1',
        '-map_chapters', '-1',
        '-bitexact',
        '-metadata', `creation_time=${CREATION_TIME}`,
    ];

    try {
        await $`ffmpeg ${flags} ${scrubbed}`.quiet();
    } catch (error) {
        fs.rmSync(scrubbed, { force: true });

        throw error;
    }

    fs.renameSync(scrubbed, video);
    tally('video');

    return video;
}

function report({ failed, processed }: Counts) {
    if (failed === 0 && processed === 0) {
        console.log('\nNo media found');

        return;
    }

    const labels = Object.values(LABELS);

    const columnWidth = Math.max(...labels.map(label => label.length)) + COLUMN_GAP;

    console.log(`\n${processed} processed, ${failed} failed\n`);

    for (const [kind, count] of TALLIES) {
        console.log(`${(LABELS[kind] ?? kind).padEnd(columnWidth)}${count}`);
    }
}

function resolveDirectory() {
    const input = process.argv[2];

    if (!input) fail('Usage: bun scripts/media.ts <directory>');

    const directory = path.resolve(input);

    if (!fs.existsSync(directory)) fail(`Path not found: ${directory}`);
    if (!fs.statSync(directory).isDirectory()) fail(`Not a directory: ${directory}`);

    return directory;
}

function rollback(file: string, working: string) {
    const backup = backupPath(file);

    if (working !== file) fs.rmSync(working, { force: true });
    if (fs.existsSync(backup)) fs.renameSync(backup, file);

    return null;
}

async function scrubFlags(photo: string) {
    if (await hasGainMap(photo)) return SCRUB;

    const profile = await readProfile(photo);

    return profile.includes('P3') ? KEEP_PROFILE : STRIP_ALL;
}

function skip(message: string) {
    console.error(message);

    return null;
}

function stemOf(name: string) {
    const stem = path.parse(name).name.split(BACKUP_MARKER)[0];

    return cleanStem(stem).toLowerCase();
}

function tally(kind: string) {
    TALLIES.set(kind, (TALLIES.get(kind) ?? 0) + 1);
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
    } catch (error) {
        rollback(file, current);

        const message = error instanceof Error ? error.message : String(error);

        return skip(`Failed ${path.basename(file)}; restored original: ${message}`);
    }
}

async function transform(file: string) {
    const { ext } = path.parse(file);

    if (VIDEO_EXTENSIONS.has(ext)) return remuxVideo(file);

    const geometry = await measureGeometry(file);

    if (ext === '.jpg' && !geometry) return preserve(file);

    return develop(file, geometry);
}

function transpose(size: Size) {
    return { height: size.width, width: size.height };
}

await main();
