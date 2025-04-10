// src/business/infrastructure/utils/BusinessFeedMapper.ts
import { Business } from "../../domain/model/Business";
import { User } from "../../../user/domain/entities/User";
import { BusinessFeedItemDto } from "../dto/BusinessFeedItemDto";
import { OwnerDto } from "../dto/OwnerDto";

// --- Helpers (Asumiendo que existen y devuelven string | null) ---
// TODO: Reemplazar con lógica real para obtener nombres de DB o caché
const getCategoryName = async (id: number): Promise<string | null> => ({1: 'Tecnología', 2: 'Restaurantes', 3: 'Servicios', 4: 'Comercio Minorista', 5: 'Salud'}[id] || 'Categoría Desconocida');
const getMunicipalityName = async (id: string): Promise<string | null> => ({'MX-JAL-GDL': 'Guadalajara', 'MX-JAL-ZAP': 'Zapopan', 'MX-NLE-MTY': 'Monterrey'}[id] || null);
const getStateNameFromMunicipality = async (muniId: string): Promise<string | null> => ({'MX-JAL-GDL': 'Jalisco', 'MX-JAL-ZAP': 'Jalisco', 'MX-NLE-MTY': 'Nuevo León'}[muniId] || null);
const formatLocation = (municipality: string | null, state: string | null): string | null => {
    if (municipality && state) return `${municipality}, ${state}`;
    return municipality ?? state ?? null; // Devolver null si ambos son nulos
}

// Helper para formatear rango de inversión (Coincide con HomeMapper.kt)
function formatInvestmentRange(investment: number): string | null {
    if (investment <= 0) return null;
    // Usar Intl.NumberFormat para formateo localizado si es necesario
    const formatter = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });
    const investmentK = Math.round(investment / 1000);

    if (investmentK < 1) return "< 1k";
    if (investmentK <= 50) return `${formatter.format(0)}k - ${formatter.format(50)}k`;
    if (investmentK <= 100) return `${formatter.format(50)}k - ${formatter.format(100)}k`;
    // Añadir más rangos según la lógica de la app
    // if (investmentK <= 250) return "100k - 250k";
    return `> ${formatter.format(100)}k`;
}
// -----------------------------------------------------------------------


/**
 * Mapea una entidad Business (dominio) y su dueño (User) a un BusinessFeedItemDto (infraestructura/API).
 * @param business La entidad Business.
 * @param owner La entidad User del dueño (puede ser null si no se encontró).
 * @returns Un objeto BusinessFeedItemDto.
 */
export const mapBusinessToFeedItemDto = async (
    business: Business,
    owner: User | null
): Promise<BusinessFeedItemDto> => {

    // Resolver nombres asíncronamente
    const [categoryName, municipalityName, stateName] = await Promise.all([
        getCategoryName(business.categoryId),
        getMunicipalityName(business.municipalityId),
        getStateNameFromMunicipality(business.municipalityId)
    ]);

    // Formatear campos derivados
    const locationName = formatLocation(municipalityName, stateName);
    const investmentRange = formatInvestmentRange(business.investment);

    // Crear DTO del dueño
    const ownerInfo: OwnerDto | null = owner ? {
        userId: owner.id,
        // Construir nombre completo, manejar nulos
        name: [owner.name, owner.last_name].filter(Boolean).join(' ').trim() || null,
        profileImageUrl: owner.profile_image_url ?? null // Asegurar null si es undefined
    } : null;

    // Crear DTO del item del feed
    return {
        id: business.id,
        imageUrl: business.imageUrl ?? null, // Asegurar null
        title: business.name,
        categoryName: categoryName, // Usar valor resuelto
        locationName: locationName, // Usar valor resuelto
        investmentRange: investmentRange, // Usar valor formateado
        partnerCount: null, // TODO: Implementar lógica si es necesario
        // Acortar descripción y modelo si son muy largos
        description: business.description?.length > 150 ? business.description.substring(0, 147) + '...' : (business.description ?? null),
        businessModel: business.businessModel?.length > 100 ? business.businessModel.substring(0, 97) + '...' : (business.businessModel ?? null),
        owner: ownerInfo,
        // Usar Nullish Coalescing para asegurar 'null' si es 'undefined'
        savedCount: business.savedCount ?? null,
        likedCount: business.likeCount ?? null,
        isSavedByUser: business.isSavedByUser ?? null,
        isLikedByUser: business.isLikedByUser ?? null
    };
};