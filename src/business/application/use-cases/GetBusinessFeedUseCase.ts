// src/business/application/use-cases/GetBusinessFeedUseCase.ts
import { BusinessRepository } from "../../domain/BusinessRepository";
import { UserRepository } from "../../../user/domain/UserRepository";
import { PaginatedResult } from "../../domain/model/PaginatedResult"; // Importar tipo genérico
import { Business } from "../../domain/model/Business";
import { PagedBusinessResponseDto } from "../../infrastructure/dto/PagedBusinessResponseDto";
import { mapBusinessToFeedItemDto } from "../../infrastructure/utils/BusinessFeedMapper"; // Importar mapper correcto

// Opciones de Paginación y Filtro (Interfaz sin cambios)
export interface GetBusinessFeedOptions {
    page: number;
    limit: number;
    requestingUserId?: string;
    filters: Record<string, any>;
}

export class GetBusinessFeedUseCase {
    constructor(
        private readonly businessRepository: BusinessRepository,
        private readonly userRepository: UserRepository
    ) {}

    /**
     * Obtiene el feed de negocios paginado y filtrado.
     * @param options Opciones de filtrado y paginación.
     * @returns Un PagedBusinessResponseDto o null si ocurre un error grave.
     */
    async run(options: GetBusinessFeedOptions): Promise<PagedBusinessResponseDto | null> {
        try {
            // 1. Obtener resultado paginado de *entidades* Business desde el repositorio
            const paginatedBusinessesResult: PaginatedResult<Business> | null = await this.businessRepository.getBusinessFeed(
                options.filters,
                options.page,
                options.limit,
                options.requestingUserId
            );

            // Manejar error del repositorio
            if (!paginatedBusinessesResult) {
                console.error("GetBusinessFeedUseCase: Repository returned null.");
                return null;
            }

            // 2. Mapear cada entidad Business a un BusinessFeedItemDto
            const businessFeedItemsPromises = paginatedBusinessesResult.items.map(async (business: any) => {
                const owner = await this.userRepository.getUserById(business.ownerId);
                // mapBusinessToFeedItemDto ahora maneja null/undefined correctamente
                return mapBusinessToFeedItemDto(business, owner);
            });
            // Esperar a que todas las promesas de mapeo (incluyendo fetch de dueño y lookups) terminen
            const businessFeedItems = await Promise.all(businessFeedItemsPromises);

            // 3. Construir la respuesta final PagedBusinessResponseDto
            const response: PagedBusinessResponseDto = {
                data: businessFeedItems, // La lista de DTOs mapeados
                pagination: { // Información de paginación del resultado del repositorio
                    currentPage: options.page,
                    totalPages: paginatedBusinessesResult.totalPages, // Si el repo lo calcula
                    totalItems: paginatedBusinessesResult.totalItems, // Si el repo lo calcula
                    limit: options.limit,
                    nextPage: paginatedBusinessesResult.nextPage,
                    hasMore: paginatedBusinessesResult.hasMore,
                },
            };

            return response;

        } catch (error) {
            // Capturar errores inesperados durante el proceso
            console.error("Error in GetBusinessFeedUseCase:", error);
            return null; // Indicar fallo general
        }
    }
}