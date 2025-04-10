import { BusinessRepository } from "../../domain/BusinessRepository";

export class InitiatePartnershipUseCase {
    constructor(private readonly businessRepository: BusinessRepository) {}

    async run(userId: string, businessId: string): Promise<boolean> {
        try {
            // Podría añadir validación aquí (ej: ¿el negocio existe? ¿el usuario no es el dueño?)
            // const business = await this.businessRepository.getBusinessById(businessId);
            // if (!business) return false; // Negocio no existe
            // if (business.ownerId === userId) return false; // No asociarse consigo mismo

            return await this.businessRepository.initiatePartnership(userId, businessId);
        } catch (error) {
            console.error("Error in InitiatePartnershipUseCase:", error);
            return false;
        }
    }
}