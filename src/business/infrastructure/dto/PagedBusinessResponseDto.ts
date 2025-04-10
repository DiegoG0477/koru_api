// business/infrastructure/dto/PagedBusinessResponseDto.ts
import { BusinessFeedItemDto } from "./BusinessFeedItemDto";
import { PaginationInfoDto } from "./PaginationInfoDto";

export interface PagedBusinessResponseDto {
    data: BusinessFeedItemDto[];
    pagination: PaginationInfoDto | null; // Puede ser nulo si no hay paginación
}