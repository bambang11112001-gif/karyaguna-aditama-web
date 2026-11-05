const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

const extensionsByMimeType = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
};

function createImageUpload(directoryName, options = {}) {
    const uploadDirectory = path.resolve(__dirname, '../uploads', directoryName);
    fs.mkdirSync(uploadDirectory, { recursive: true });

    const upload = multer({
        storage: multer.diskStorage({
            destination: uploadDirectory,
            filename: (req, file, callback) => {
                callback(null, `${randomUUID()}${extensionsByMimeType[file.mimetype]}`);
            }
        }),
        limits: {
            fileSize: 5 * 1024 * 1024,
            ...(options.multiple ? { files: options.maxFiles || 10 } : {})
        },
        fileFilter: (req, file, callback) => {
            if (!extensionsByMimeType[file.mimetype]) {
                callback(new Error('Foto harus berformat JPG, PNG, WEBP, atau GIF.'));
                return;
            }

            callback(null, true);
        }
    });

    return function uploadImage(req, res, next) {
        const uploadRequest = options.multiple
            ? upload.array(options.fieldName || 'images', options.maxFiles || 10)
            : upload.single(options.fieldName || 'image');
        uploadRequest(req, res, (error) => {
            if (!error) {
                next();
                return;
            }

            const uploadedFiles = [
                ...(Array.isArray(req.files) ? req.files : []),
                ...(req.file ? [req.file] : [])
            ];
            uploadedFiles.forEach((file) => {
                fs.unlink(file.path, (cleanupError) => {
                    if (cleanupError && cleanupError.code !== 'ENOENT') {
                        console.error('Error cleaning up rejected image upload:', cleanupError);
                    }
                });
            });

            const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
                ? 'Ukuran foto maksimal 5 MB.'
                : error instanceof multer.MulterError && error.code === 'LIMIT_FILE_COUNT'
                    ? `Maksimal ${options.maxFiles || 10} foto dapat diunggah sekaligus.`
                    : error instanceof multer.MulterError && error.code === 'LIMIT_UNEXPECTED_FILE' && options.multiple
                        ? `Maksimal ${options.maxFiles || 10} foto dapat diunggah sekaligus.`
                        : error.message;
            res.status(400).json({ success: false, message });
        });
    };
}

module.exports = createImageUpload;
