// business/infrastructure/utils/DataMapper.ts
import { Business } from "../../domain/model/Business";
import { BusinessResponseDto } from "../dto/BusinessResponseDto";
import { BusinessListItemDto } from "../dto/BusinessListItemDto";
import { User } from "../../../user/domain/entities/User"; // Para datos del dueño

// TODO: Obtener estos nombres de una fuente de datos real (DB, cache, etc.)
// Estos son solo placeholders
const getCategoryName = async (id: number): Promise<string | null> => ({1: 'Tecnología', 2: 'Restaurantes'}[id] || null);
const getMunicipalityName = async (id: string): Promise<string | null> => ({'MX-JAL-GDL': 'Guadalajara', 'MX-JAL-ZAP': 'Zapopan'}[id] || null);
const getStateNameFromMunicipality = async (muniId: string): Promise<string | null> => ({'MX-JAL-GDL': 'Jalisco', 'MX-JAL-ZAP': 'Jalisco'}[muniId] || null);
const formatLocation = (municipality: string | null, state: string | null): string | null => {
     if (municipality && state) return `${municipality}, ${state}`;
     return municipality ?? state;
}

export const mapBusinessToResponseDto = async (
    business: Business,
    owner: User | null // Pasar el objeto User del dueño
): Promise<BusinessResponseDto> => {

    // Obtener nombres de forma asíncrona (simulado)
    const categoryName = await getCategoryName(business.categoryId);
    const municipalityName = await getMunicipalityName(business.municipalityId);
    const stateName = await getStateNameFromMunicipality(business.municipalityId);

    const ownerInfo = owner ? {
        userId: owner.id,
        name: (owner.name || owner.last_name) ? `${owner.name ?? ''} ${owner.last_name ?? ''}`.trim() : 'Usuario Koru',
        email: owner.email, // El email SÍ está en User
        phone: null, // No está en el modelo User actual
        linkedInUrl: owner.linkedin_profile,
        profileImageUrl: owner.profile_image_url,
    } : null;

    return {
        id: business.id,
        name: business.name,
        description: business.description,
        investment: business.investment,
        profitPercentage: business.profitPercentage,
        categoryId: business.categoryId,
        categoryName: categoryName,
        municipalityId: business.municipalityId,
        municipalityName: municipalityName,
        stateName: stateName,
        businessModel: business.businessModel,
        monthlyIncome: business.monthlyIncome,
        imageUrls: [business.imageUrl], // Poner la única URL en un array
        ownerInfo: ownerInfo,
        // Estos campos vendrían de otras queries/joins en un repo más complejo
        isSavedByUser: business.isSavedByUser ?? false,
        isLikedByUser: business.isLikedByUser ?? false,
        savedCount: business.savedCount ?? 0,
        likeCount: business.likeCount ?? 0
    };
};

export const mapBusinessToListItemDto = async (business: Business, isOwned: boolean): Promise<BusinessListItemDto> => {
    // ... (obtener nombres de categoría/ubicación)
    const categoryName = await getCategoryName(business.categoryId);
    const municipalityName = await getMunicipalityName(business.municipalityId);
    const stateName = await getStateNameFromMunicipality(business.municipalityId);
    const location = formatLocation(municipalityName, stateName);

   return {
       id: business.id,
       name: business.name,
       imageUrl: business.imageUrl,
       category: categoryName,
       location: location,
       isOwned: isOwned // Usar el parámetro
   };
}