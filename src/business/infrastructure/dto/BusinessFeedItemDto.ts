// business/infrastructure/dto/BusinessFeedItemDto.ts
import { OwnerDto } from "./OwnerDto";

export interface BusinessFeedItemDto {
    id: string;
    imageUrl: string | null; // La URL principal
    title: string;
    categoryName: string | null;
    locationName: string | null; // "Municipio, Estado"
    investmentRange: string | null; // Formateado como "<50k", "50k-100k", etc.
    partnerCount: number | null; // Pendiente de implementar lógica/tabla
    description: string | null; // Descripción corta
    businessModel: string | null; // Modelo corto
    owner: OwnerDto | null; // Info resumida del dueño
    savedCount: number | null;
    likedCount: number | null;
    isSavedByUser: boolean | null; // Estado para el usuario actual
    isLikedByUser: boolean | null; // Estado para el usuario actual
}