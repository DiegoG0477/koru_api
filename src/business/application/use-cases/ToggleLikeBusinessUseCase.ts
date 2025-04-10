import { BusinessRepository } from "../../domain/BusinessRepository";
import { BusinessUpdateError, BusinessUpdateErrorType } from "../../domain/errors/BusinessUpdateError";

export class ToggleLikeBusinessUseCase {
    constructor(private readonly businessRepository: BusinessRepository) {}

    async run(userId: string, businessId: string): Promise<boolean> {
         try {
            // Devuelve el *nuevo* estado likeado
            return await this.businessRepository.toggleLike(userId, businessId);
        } catch (error) {
            console.error("Error in ToggleLikeBusinessUseCase:", error);
            if (error instanceof BusinessUpdateError) throw error;
             throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to toggle like status.");
        }
    }
}