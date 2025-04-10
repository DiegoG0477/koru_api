// src/shared/domain/PaginatedResult.ts

/**
 * Estructura genérica para resultados paginados en la capa de dominio.
 */
export interface PaginatedResult<T> {
    /** Los items de la página actual. */
    items: T[];
    /** Indica si hay más páginas disponibles después de la actual. */
    hasMore: boolean;
    /** El número de la siguiente página a solicitar, o null si no hay más. */
    nextPage: number | null;
    /** (Opcional) Número total de items encontrados con los filtros aplicados. */
    totalItems?: number;
    /** (Opcional) Número total de páginas disponibles. */
    totalPages?: number;
}