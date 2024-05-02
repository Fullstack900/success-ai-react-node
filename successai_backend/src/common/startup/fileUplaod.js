import multer from 'multer';

const multerConfig = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export default function getConfig() {
    return multerConfig.single("file");
}