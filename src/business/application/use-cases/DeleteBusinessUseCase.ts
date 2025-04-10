// business/application/use-cases/DeleteBusinessUseCase.ts
import { BusinessRepository } from "../../domain/BusinessRepository";
//import { IStorageService } from "../../../shared/cloudstorage/IStorageService"; // Para borrar imagen

export class DeleteBusinessUseCase {
    constructor(
        private readonly businessRepository: BusinessRepository,
        //private readonly storageService: IStorageService // Opcional si borras imagen
    ) {}

    /**
     * Elimina un negocio, incluyendo su imagen si existe.
     * @param businessId ID del negocio a eliminar.
     * @param ownerId ID del usuario que realiza la acción (para autorización).
     * @returns true si se eliminó, false si no.
     */
    async run(businessId: string, ownerId: string): Promise<boolean> {
        try {
            // Opcional: Obtener URL de imagen ANTES de borrar para eliminarla de Firebase
            // const business = await this.businessRepository.getBusinessById(businessId);
            // const imageUrlToDelete = business?.imageUrl;

            const deleted = await this.businessRepository.deleteBusiness(businessId, ownerId);

            if (deleted) {
                console.log(`Business ${businessId} deleted successfully by owner ${ownerId}.`);
                // Opcional: Intentar borrar la imagen de Firebase
                // if (imageUrlToDelete) {
                //     const imageDeleted = await this.storageService.deleteFile(imageUrlToDelete);
                //     if (!imageDeleted) {
                //         console.warn(`Business ${businessId} deleted, but failed to delete image: ${imageUrlToDelete}`);
                //     }
                // }
            } else {
                 console.warn(`Failed to delete business ${businessId}. Not found or not authorized for owner ${ownerId}.`);
            }
            return deleted;

        } catch (error) {
            console.error(`Error in DeleteBusinessUseCase for ID ${businessId}:`, error);
            return false;
        }
    }
}