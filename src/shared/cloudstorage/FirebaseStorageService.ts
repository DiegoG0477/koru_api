// shared/cloudStorage/FirebaseStorageService.ts
import * as admin from 'firebase-admin';
import { IStorageService } from './IStorageService';
import path from 'path';
//import { Express } from 'express'; // Importar namespace

export class FirebaseStorageService implements IStorageService {
    private bucket;

    constructor() {
        // ... (inicialización sin cambios) ...
        try {
            this.bucket = admin.storage().bucket();
            if (!this.bucket) {
                throw new Error("Firebase Storage bucket not available.");
            }
            console.log("FirebaseStorageService initialized with bucket:", this.bucket.name);
        } catch (error) {
             console.error("Failed to get Firebase Storage bucket:", error);
             throw error;
        }
    }

    async uploadFile(
        file: Express.Multer.File, // <-- Tipo actualizado
        destinationPath: string,
        publicFileName: string
    ): Promise<string | null> {
        if (!file || !file.buffer) { // <-- Verificar buffer
            console.error("FirebaseStorageService: No file buffer provided for upload.");
            return null;
        }

        const cleanDestinationPath = destinationPath.endsWith('/') ? destinationPath : `${destinationPath}/`;
        const extension = path.extname(file.originalname).toLowerCase(); // <-- Usar originalname para extensión
        const filePath = `${cleanDestinationPath}${publicFileName}${extension}`;
        const fileUpload = this.bucket.file(filePath);

        console.log(`Uploading ${file.originalname} to ${filePath}...`); // <-- Usar originalname

        try {
            await fileUpload.save(file.buffer, { // <-- Usar file.buffer
                metadata: {
                    contentType: file.mimetype, // <-- Usar file.mimetype
                },
                public: true, // <-- Revisar reglas de seguridad
            });

            // Construir URL pública (o usar getSignedUrl)
            const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;

            console.log(`File uploaded successfully to: ${publicUrl}`);
            return publicUrl;

        } catch (error) {
            console.error(`Error uploading file to Firebase Storage (${filePath}):`, error);
            return null;
        }
    }
    // ... deleteFile si es necesario ...
}