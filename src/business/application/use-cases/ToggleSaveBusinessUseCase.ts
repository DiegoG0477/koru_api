import { BusinessRepository } from "../../domain/BusinessRepository";
import { BusinessUpdateError, BusinessUpdateErrorType } from "../../domain/errors/BusinessUpdateError";

export class ToggleSaveBusinessUseCase {
    constructor(private readonly businessRepository: BusinessRepository) {}

    async run(userId: string, businessId: string): Promise<boolean> {
        try {
            // Devuelve el *nuevo* estado guardado
            return await this.businessRepository.toggleSave(userId, businessId);
        } catch (error) {
            console.error("Error in ToggleSaveBusinessUseCase:", error);
            // Relanzar para que el controlador lo maneje
             if (error instanceof BusinessUpdateError) throw error;
             throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to toggle save status.");
        }
    }
}