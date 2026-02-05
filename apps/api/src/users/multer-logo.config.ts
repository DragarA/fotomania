import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { extname } from 'path';
import { Request } from 'express';

export const LOGO_MAX_SIZE = 2 * 1024 * 1024; // 2MB

export const logoStorage = diskStorage({
    destination: (req: Request, file, cb) => {
        const userId = (req.user as any)?.id;
        if (!userId) {
            return cb(new Error('User not authenticated'), '');
        }
        const dir = `./uploads/logos/${userId}`;
        // Ensure directory exists before multer writes to it
        mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req: Request, file, cb) => {
        const ext = extname(file.originalname);
        cb(null, `logo${ext}`);
    },
});

export const logoFileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: any,
) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                'Invalid file type. Only JPG, PNG, and WebP are allowed.',
            ),
            false,
        );
    }
};
