// shared/middlewares/multerConfig.ts
import multer from 'multer';
import path from 'path';

// Configurar almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro de archivos (opcional pero recomendado) - Aceptar solo imágenes
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)!'));
        // O usar: cb(null, false); y manejar la ausencia del archivo en el controlador
    }
};

// Crear instancia de multer
export const uploadMemory = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB (ajustable)
    fileFilter: fileFilter
});

// Middleware específico para UN solo archivo llamado 'profileImage'
export const uploadProfileImage = uploadMemory.single('profileImage');
 // Middleware específico para UN solo archivo llamado 'businessImage' (para el futuro)
// export const uploadBusinessImage = uploadMemory.single('businessImage');