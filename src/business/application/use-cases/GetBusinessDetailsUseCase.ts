// business/application/use-cases/GetBusinessDetailsUseCase.ts
import { BusinessRepository } from "../../domain/BusinessRepository";
import { Business } from "../../domain/model/Business";

export class GetBusinessDetailsUseCase {
    constructor(
        private readonly businessRepository: BusinessRepository
    ) {}

    /**
     * Obtiene los detalles de un negocio.
     * @param businessId ID del negocio.
     * @param requestingUserId (Opcional) ID del usuario para obtener estado like/save.
     * @returns El negocio o null si no se encuentra.
     */
    async run(businessId: string, requestingUserId?: string): Promise<Business | null> {
        try {
            const business = await this.businessRepository.getBusinessById(businessId, requestingUserId);
            return business;
        } catch (error) {
            console.error(`Error in GetBusinessDetailsUseCase for ID ${businessId}:`, error);
            return null;
        }
    }
}