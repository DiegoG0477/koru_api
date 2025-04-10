// business/domain/model/BusinessCreationData.ts
// Similar a AddBusinessRequestDto pero sin ID y con ownerId
export interface BusinessCreationData {
    ownerId: string;
    name: string;
    description: string;
    investment: number;
    profitPercentage: number;
    categoryId: number;
    municipalityId: string;
    businessModel: string;
    monthlyIncome: number;
    imageUrl?: string | null; // Puede ser nulo o asignado después de subir
}