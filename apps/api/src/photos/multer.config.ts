import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const photoStorage = diskStorage({
  destination: (req, file, cb) => {
    // Extract collectionId from route parameter
    // The route is /photos/upload/:collectionId
    const collectionId = req.params.collectionId;

    if (!collectionId) {
      return cb(new Error('Collection ID is required'), '');
    }

    const uploadPath = `./uploads/collections/${collectionId}`;

    // Create directory if it doesn't exist
    try {
      mkdirSync(uploadPath, { recursive: true });
    } catch (error) {
      // Directory already exists, ignore error
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const photoId = uuidv4();
    const ext = extname(file.originalname);
    cb(null, `${photoId}${ext}`);
  },
});

export const photoFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: any
) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};
