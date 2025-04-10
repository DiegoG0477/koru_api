// shared/cloudStorage/IStorageService.ts
// import { UploadedFile } from 'express-fileupload'; // <- Eliminar esta línea
//import { Express } from 'express'; // <- Importar el namespace Express

export interface IStorageService {
    uploadFile(
        file: Express.Multer.File, // <-- CAMBIAR TIPO AQUÍ
        destinationPath: string,
        publicFileName: string
    ): Promise<string | null>;
    // deleteFile(fileUrl: string): Promise<boolean>;
}