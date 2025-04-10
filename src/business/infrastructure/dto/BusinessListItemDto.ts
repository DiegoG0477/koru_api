// business/infrastructure/dtos/BusinessListItemDto.ts
export interface BusinessListItemDto {
    id: string;
    name: string;
    imageUrl: string | null;
    category: string | null; // Nombre de la categoría
    location: string | null; // Nombre de municipio/estado combinado
    isOwned: boolean; // Siempre true para la lista de "Mis Negocios"
}