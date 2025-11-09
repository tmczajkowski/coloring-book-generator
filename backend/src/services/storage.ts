import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { config } from '../config.ts';
import { logger } from '../utils/logger.ts';
import { EXT_JPG, EXT_PNG, FILE_IMAGE_JPG, FILE_IMAGE_PNG } from '../constants.ts';

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

export const getSessionDir = (id: string) => path.join(config.dataDir, id);

export const initStorage = async () => {
  await ensureDir(config.dataDir);
};

export const createSession = async (id?: string) => {
  const sessionId = id || String(Date.now());
  const dir = getSessionDir(sessionId);
  await ensureDir(dir);
  await fs.writeFile(path.join(dir, 'meta.json'), JSON.stringify({ id: sessionId, createdAt: Date.now() }, null, 2));
  return sessionId;
};

export const saveAudio = async (id: string, buffer: Buffer, ext = 'webm') => {
  const dir = getSessionDir(id);
  await ensureDir(dir);
  const audioPath = path.join(dir, `audio.${ext}`);
  await fs.writeFile(audioPath, buffer);
  return audioPath;
};

export const savePrompt = async (id: string, prompt: string) => {
  const dir = getSessionDir(id);
  await ensureDir(dir);
  const promptPath = path.join(dir, 'prompt.txt');
  await fs.writeFile(promptPath, prompt);
  return promptPath;
};

export const saveImageBuffer = async (id: string, buffer: Buffer, ext: typeof EXT_JPG | typeof EXT_PNG = 'png') => {
  const dir = getSessionDir(id);
  await ensureDir(dir);
  const imagePath = path.join(dir, `image.${ext}`);
  await fs.writeFile(imagePath, buffer);
  return imagePath;
};

export const listHistory = async () => {
  await ensureDir(config.dataDir);
  const entries = await fs.readdir(config.dataDir, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  const items = await Promise.all(dirs.map(async (id) => {
    const dir = getSessionDir(id);
    const metaPath = path.join(dir, 'meta.json');
    const promptPath = path.join(dir, 'prompt.txt');
    const imageJpg = path.join(dir, FILE_IMAGE_JPG);
    const imagePng = path.join(dir, FILE_IMAGE_PNG);
    let meta: any = { id };
    try {
      const m = await fs.readFile(metaPath, 'utf-8');
      meta = JSON.parse(m);
    } catch {}
    let prompt = '';
    try { prompt = await fs.readFile(promptPath, 'utf-8'); } catch {}
    const hasJpg = fsSync.existsSync(imageJpg);
    const hasPng = fsSync.existsSync(imagePng);
    return {
      id,
      createdAt: meta.createdAt || 0,
      prompt,
      imageUrl: hasJpg ? `/files/${id}/${FILE_IMAGE_JPG}` : (hasPng ? `/files/${id}/${FILE_IMAGE_PNG}` : undefined),
    };
  }));
  // newest first
  items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return items;
};

export const markPrinted = async (id: string) => {
  const metaPath = path.join(getSessionDir(id), 'meta.json');
  try {
    const m = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
    m.printedAt = Date.now();
    await fs.writeFile(metaPath, JSON.stringify(m, null, 2));
  } catch (e) {
    logger.warn('Cannot mark printed for', id, e);
  }
};
