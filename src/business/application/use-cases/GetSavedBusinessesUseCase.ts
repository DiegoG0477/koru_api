import { BusinessRepository } from "../../domain/BusinessRepository";
import { Business } from "../../domain/model/Business";

export class GetSavedBusinessesUseCase {
    constructor(private readonly businessRepository: BusinessRepository) {}

    async run(userId: string): Promise<Business[] | null> {
        try {
            return await this.businessRepository.getSavedBusinesses(userId);
        } catch (error) {
            console.error("Error in GetSavedBusinessesUseCase:", error);
            return null;
        }
    }
}