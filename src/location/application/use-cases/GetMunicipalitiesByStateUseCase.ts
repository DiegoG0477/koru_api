import { LocationRepository } from "../../domain/repository/LocationRepository";
import { Municipality } from "../../domain/model/Municipality";

export class GetMunicipalitiesByStateUseCase {
    constructor(private readonly locationRepository: LocationRepository) {}
    async run(stateId: string): Promise<Municipality[] | null> {
         if (!stateId) return []; // Devolver vacío si no hay ID de estado
        try { return await this.locationRepository.getMunicipalitiesByState(stateId); }
        catch (error) { console.error(`Error in GetMunicipalitiesByStateUseCase for ${stateId}:`, error); return null; }
    }
}