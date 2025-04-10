import { LocationRepository } from "../../domain/repository/LocationRepository";
import { Category } from "../../domain/model/Category";

export class GetAllCategoriesUseCase {
    constructor(private readonly locationRepository: LocationRepository) {}
    async run(): Promise<Category[] | null> {
        try { return await this.locationRepository.getAllCategories(); }
        catch (error) { console.error("Error in GetAllCategoriesUseCase:", error); return null; }
    }
}