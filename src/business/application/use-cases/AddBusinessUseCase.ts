// business/application/use-cases/AddBusinessUseCase.ts
import { BusinessRepository } from "../../domain/BusinessRepository";
import { IStorageService } from "../../../shared/cloudstorage/IStorageService";
import { Business } from "../../domain/model/Business";
import { AddBusinessRequestDto } from "../../infrastructure/dto/AddBusinessRequestDto";// Usa DTO de API
//import { Express } from 'express'; // Para tipo de archivo Multer

export class AddBusinessUseCase {
    constructor(
        private readonly businessRepository: BusinessRepository,
        private readonly storageService: IStorageService
    ) {}

    /**
     * Ejecuta la lógica para añadir un nuevo negocio, incluyendo subida de imagen.
     * @param ownerId ID del usuario que crea el negocio.
     * @param data Datos del negocio desde el DTO.
     * @param imageFile (Opcional) Archivo de imagen subido.
     * @returns El negocio creado o null en caso de error.
     */
    async run(
        ownerId: string,
        data: AddBusinessRequestDto, // Recibe el DTO de la API
        imageFile: Express.Multer.File | null
    ): Promise<Business | null> {
        try {
            let imageUrl: string | null = null;

            // 1. Subir imagen si existe
            if (imageFile) {
                 // Crear nombre único (ej: business_<ownerId>_<timestamp>)
                 const fileName = `business_${ownerId}_${Date.now()}`;
                 imageUrl = await this.storageService.uploadFile(
                     imageFile,
                     'business_images/', // Ruta en Firebase
                     fileName
                 );
                 if (!imageUrl) {
                     console.error(`Failed to upload image for business ${data.name} by user ${ownerId}`);
                     // Decidir si fallar o continuar sin imagen
                     // return null; // Fallar si la imagen es obligatoria
                 }
            } else if (data.imageUrl) {
                // Si la app envía una URL directamente (menos común para creación)
                imageUrl = data.imageUrl;
            }


            // 2. Preparar datos para el repositorio (ya deberían ser compatibles)
            const creationData = {
                ownerId: ownerId,
                name: data.name,
                description: data.description,
                // Convertir IDs numéricos del DTO a number si es necesario
                investment: Number(data.investment),
                profitPercentage: Number(data.profitPercentage),
                categoryId: Number(data.categoryId),
                municipalityId: String(data.municipalityId), // Asumiendo que el repo espera string
                businessModel: data.businessModel,
                monthlyIncome: Number(data.monthlyIncome),
                imageUrl: imageUrl // Usar la URL subida o proporcionada
            };

            // 3. Llamar al repositorio para crear
            const createdBusiness = await this.businessRepository.createBusiness(creationData);

            return createdBusiness;

        } catch (error) {
            console.error("Error in AddBusinessUseCase:", error);
            return null;
        }
    }
}