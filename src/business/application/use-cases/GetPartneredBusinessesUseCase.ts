import { BusinessRepository } from "../../domain/BusinessRepository";
import { Business } from "../../domain/model/Business";

export class GetPartneredBusinessesUseCase {
    constructor(private readonly businessRepository: BusinessRepository) {}

    async run(userId: string): Promise<Business[] | null> {
        try {
            return await this.businessRepository.getPartneredBusinesses(userId);
        } catch (error) {
            console.error("Error in GetPartneredBusinessesUseCase:", error);
            return null;
        }
    }
}