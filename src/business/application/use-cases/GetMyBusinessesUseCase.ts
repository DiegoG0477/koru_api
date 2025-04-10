// business/application/use-cases/GetMyBusinessesUseCase.ts
import { BusinessRepository } from "../../domain/BusinessRepository";
import { Business } from "../../domain/model/Business";

export class GetMyBusinessesUseCase {
    constructor(
        private readonly businessRepository: BusinessRepository
    ) {}

    /**
     * Obtiene todos los negocios pertenecientes a un usuario específico.
     * @param ownerId ID del usuario propietario.
     * @returns Lista de negocios o null en caso de error.
     */
    async run(ownerId: string): Promise<Business[] | null> {
        try {
            const businesses = await this.businessRepository.getBusinessesByOwner(ownerId);
            return businesses; // Devuelve la lista (puede ser vacía) o null
        } catch (error) {
            console.error(`Error in GetMyBusinessesUseCase for owner ${ownerId}:`, error);
            return null;
        }
    }
}