import { Request } from 'express';
import multer, { StorageEngine } from 'multer';
import path from "path";
import fs from 'fs';

const maxSize: number = 2 * 1024 * 1024; // 2MB
const __basedir = path.resolve();

// Configuración del almacenamiento para imágenes de tickets
const ticketStorage: StorageEngine = multer.diskStorage({
    destination: (request: Request, file: Express.Multer.File, cb) => {
        // const uploadPath = path.join(__basedir, "/assets/uploads/tickets/");
        const uploadPath = path.join(__basedir, "/assets/uploads/");

        // Crear directorio si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (request: Request, file: Express.Multer.File, cb) => {
        const uploadPath = path.join(__basedir, "/assets/uploads/");
        const filePath = path.join(uploadPath, file.originalname);

        // Si el archivo ya existe, agregar timestamp (en caso de que otro usuario suba la misma imagen)
        if (fs.existsSync(filePath)) {
            const timestamp = Date.now(); // Obtener timestamp actual
            const ext = path.extname(file.originalname); // Obtener extensión del archivo
            const name = path.basename(file.originalname, ext); // Obtener nombre del archivo sin extensión
            cb(null, `${name}_${timestamp}${ext}`); // Nuevo nombre con timestamp (ej: imagen_1632345678901.jpg)
        } else {

            // Si no el archivo no existe, simplemente usar el nombre original
            cb(null, file.originalname);
        }
    },
});

// Configuración de multer para tickets (múltiples archivos)
const uploadTicketImages = multer({
    storage: ticketStorage,
    limits: {
        fileSize: maxSize,
        files: 5 // Máximo 5 archivos
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen.'));
        }
    }
}).array('images', 5); // a diferencia de ImageCofig.ts donde es sola imagen, aquí es un array de imágenes. 

export default uploadTicketImages;