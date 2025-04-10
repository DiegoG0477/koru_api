import { LocationRepository } from "../../domain/repository/LocationRepository";
import { Country } from "../../domain/model/Country";

export class GetAllCountriesUseCase {
    constructor(private readonly locationRepository: LocationRepository) {}
    async run(): Promise<Country[] | null> {
        try { return await this.locationRepository.getAllCountries(); }
        catch (error) { console.error("Error in GetAllCountriesUseCase:", error); return null; }
    }
}