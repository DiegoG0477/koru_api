// business/infrastructure/dto/PaginationInfoDto.ts
export interface PaginationInfoDto {
    currentPage?: number | null; // Hacer opcionales si no siempre se devuelven
    totalPages?: number | null;
    totalItems?: number | null;
    limit?: number | null;
    nextPage?: number | null;
    hasMore?: boolean | null;
}