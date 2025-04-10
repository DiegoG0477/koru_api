// business/application/use-cases/UpdateBusinessUseCase.ts
import { BusinessRepository} from "../../domain/BusinessRepository";
import { BusinessUpdateData } from "../../domain/model/BusinessUpdateData";
import { IStorageService } from "../../../shared/cloudstorage/IStorageService";
import { Business } from "../../domain/model/Business";
import { UpdateBusinessRequestDto } from "../../infrastructure/dto/UpdateBusinessRequestDto";
//import { Express } from 'express';

export class UpdateBusinessUseCase {
    constructor(
        private readonly businessRepository: BusinessRepository,
        private readonly storageService: IStorageService
    ) {}

    /**
     * Ejecuta la lógica para actualizar un negocio.
     * @param businessId ID del negocio a actualizar.
     * @param ownerId ID del usuario que realiza la actualización (para autorización).
     * @param data Datos del DTO de actualización.
     * @param imageFile (Opcional) Nuevo archivo de imagen.
     * @returns El negocio actualizado o null si falla.
     */
    async run(
        businessId: string,
        ownerId: string,
        data: UpdateBusinessRequestDto,
        imageFile: Express.Multer.File | null
    ): Promise<Business | null> {
        try {
            let imageUrlToUpdate: string | null | undefined = data.imageUrl; // Mantener URL existente si no hay archivo nuevo

             // 1. Subir nueva imagen si se proporciona
             if (imageFile) {
                const fileName = `business_${ownerId}_${businessId}_${Date.now()}`;
                const uploadedUrl = await this.storageService.uploadFile(
                    imageFile,
                    'business_images/',
                    fileName
                );
                if (uploadedUrl) {
                    imageUrlToUpdate = uploadedUrl; // Usar la nueva URL
                    // TODO: Considerar eliminar la imagen antigua de Firebase si imageUrlToUpdate no es null y diferente de data.imageUrl original
                } else {
                    console.error(`Failed to upload new image for business ${businessId}. Update will proceed without changing image.`);
                    imageUrlToUpdate = undefined; // No intentar actualizar la URL si la subida falló
                }
             }

            // 2. Preparar datos para el repositorio
            const updatePayload: BusinessUpdateData = {};
            let hasUpdates = false;

            // Mapear campos del DTO a BusinessUpdateData (solo los presentes)
            if (data.name !== undefined) { updatePayload.name = data.name; hasUpdates = true; }
            if (data.description !== undefined) { updatePayload.description = data.description; hasUpdates = true; }
            if (data.investment !== undefined) { updatePayload.investment = Number(data.investment); hasUpdates = true; }
            if (data.profitPercentage !== undefined) { updatePayload.profitPercentage = Number(data.profitPercentage); hasUpdates = true; }
            if (data.categoryId !== undefined) { updatePayload.categoryId = Number(data.categoryId); hasUpdates = true; }
            if (data.municipalityId !== undefined) { updatePayload.municipalityId = String(data.municipalityId); hasUpdates = true; }
            if (data.businessModel !== undefined) { updatePayload.businessModel = data.businessModel; hasUpdates = true; }
            if (data.monthlyIncome !== undefined) { updatePayload.monthlyIncome = Number(data.monthlyIncome); hasUpdates = true; }
            if (imageUrlToUpdate !== undefined) { updatePayload.imageUrl = imageUrlToUpdate; hasUpdates = true; } // Incluir URL solo si se intentó actualizar

            if (!hasUpdates) {
                console.warn(`UpdateBusinessUseCase called for ID ${businessId} with no data changes.`);
                // Devolver el negocio actual si no hay nada que cambiar
                return this.businessRepository.getBusinessById(businessId, ownerId);
            }

            // 3. Llamar al repositorio para actualizar
            const updatedBusiness = await this.businessRepository.updateBusiness(
                businessId,
                ownerId,
                updatePayload
            );

            return updatedBusiness;

        } catch (error) {
            console.error(`Error in UpdateBusinessUseCase for ID ${businessId}:`, error);
            return null;
        }
    }
}