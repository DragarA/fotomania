import { memoryStorage } from 'multer';

export const invoiceStorage = memoryStorage();

export const invoiceFileFilter = (
    req: any,
    file: Express.Multer.File,
    cb: any
) => {
    const allowedMimes = ['application/pdf'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF files are allowed.`), false);
    }
};

export const INVOICE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
