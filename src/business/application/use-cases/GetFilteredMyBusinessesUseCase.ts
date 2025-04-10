import { BusinessRepository } from "../../domain/BusinessRepository";
import { Business } from "../../domain/model/Business";

export enum MyBusinessTypeFilter {
    OWNED = 'OWNED',
    PARTNERED = 'PARTNERED',
    SAVED = 'SAVED'
}

export class GetFilteredMyBusinessesUseCase {
    constructor(private readonly businessRepository: BusinessRepository) {}

    async run(userId: string, filter: MyBusinessTypeFilter): Promise<Business[] | null> {
        try {
            switch (filter) {
                case MyBusinessTypeFilter.OWNED:
                    return await this.businessRepository.getBusinessesByOwner(userId);
                case MyBusinessTypeFilter.PARTNERED:
                    return await this.businessRepository.getPartneredBusinesses(userId);
                case MyBusinessTypeFilter.SAVED:
                    return await this.businessRepository.getSavedBusinesses(userId);
                default:
                    // Devolver los propios por defecto o lanzar error?
                    console.warn(`Invalid filter type provided: ${filter}`);
                    return await this.businessRepository.getBusinessesByOwner(userId);
            }
        } catch (error) {
            console.error(`Error fetching filtered businesses for user ${userId}, filter ${filter}:`, error);
            return null;
        }
    }
}