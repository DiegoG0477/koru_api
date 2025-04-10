// business/infrastructure/dtos/BusinessResponseDto.ts

// DTO para la info del dueño (como en Android)
interface OwnerContactDto {
    userId: string;
    name: string | null; // Permitir nulo si first/last name pueden serlo
    email?: string | null; // Hacer opcional y nulo
    phone?: string | null;
    linkedInUrl?: string | null;
    profileImageUrl?: string | null;
}

// DTO principal (como en Android)
export interface BusinessResponseDto {
    id: string; // ID del negocio
    name: string;
    description: string;
    investment: number; // Usar number
    profitPercentage: number; // Usar number
    categoryId: number; // ID numérico
    categoryName?: string | null; // Nombre opcional (vendrá de JOIN)
    municipalityId: string; // ID string
    municipalityName?: string | null; // Nombre opcional (vendrá de JOIN)
    stateName?: string | null; // Nombre opcional (vendrá de JOIN)
    businessModel: string;
    monthlyIncome: number; // Usar number
    // Usamos imageUrls para ser como en Android, aunque solo guardemos una por ahora
    imageUrls: (string | null)[]; // Array que puede contener la URL o null
    ownerInfo?: OwnerContactDto | null; // Info del dueño (vendrá de JOIN con users)

    // Campos de estado (dependen del usuario que hace la request)
    isSavedByUser?: boolean;
    isLikedByUser?: boolean;
    savedCount?: number;
    likeCount?: number;
}