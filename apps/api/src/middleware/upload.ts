import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env';
import { badRequest } from '../lib/errors';

/** Absolute path served statically at /uploads by app.ts. */
export const uploadsStaticPath = env.uploadsDir;

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function makeUploader(subdir: string) {
  const dest = path.join(env.uploadsDir, subdir);
  fs.mkdirSync(dest, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dest),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.bin';
        cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
      },
    }),
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME.has(file.mimetype)) {
        cb(badRequest('Unsupported file type — use jpg, png, webp, gif or svg'));
        return;
      }
      cb(null, true);
    },
  });
}

export const uploadAvatar = makeUploader('avatar');
export const uploadLogo = makeUploader('logo');

/** Public URL for a stored upload, e.g. /uploads/avatar/169...jpg */
export function uploadedUrl(subdir: string, filename: string): string {
  return `/uploads/${subdir}/${filename}`;
}
