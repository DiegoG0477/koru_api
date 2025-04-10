import { LocationRepository } from "../../domain/repository/LocationRepository";
import { State } from "../../domain/model/State";

export class GetStatesByCountryUseCase {
    constructor(private readonly locationRepository: LocationRepository) {}
    async run(countryId: string): Promise<State[] | null> {
         if (!countryId) return []; // Devolver vacío si no hay ID de país
        try { return await this.locationRepository.getStatesByCountry(countryId); }
        catch (error) { console.error(`Error in GetStatesByCountryUseCase for ${countryId}:`, error); return null; }
    }
}