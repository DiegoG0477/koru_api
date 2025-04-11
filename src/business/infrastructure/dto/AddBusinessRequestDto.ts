// business/infrastructure/dtos/AddBusinessRequestDto.ts

/**
 * Data Transfer Object para la creación de un nuevo negocio.
 * Coincide con la estructura esperada por el endpoint POST /businesses
 * y con AddBusinessRequestDto.kt de la app Android.
 */
export interface AddBusinessRequestDto {
    name: string;
    description: string;
    /** Monto de inversión requerida (se espera como número) */
    investment: number;
    /** Porcentaje de ganancia estimada (se espera como número) */
    profitPercentage: number;
    /** ID numérico de la categoría (se espera como número) */
    categoryId: number;
    /** ID (string o número) del municipio (se espera como número según .kt) */
    municipalityId: string; // Ajustado a number para coincidir con .kt
    businessModel: string;
    /** Ingresos mensuales estimados (se espera como número) */
    monthlyIncome: number;
    /** URL de la imagen (opcional, puede venir del form-data o no) */
    imageUrl?: string | null;
}

/**
 * Validador simple para AddBusinessRequestDto (Ejemplo).
 * Puedes usar librerías como 'class-validator' para validaciones más robustas.
 */
export function isValidAddBusinessRequest(data: any): data is AddBusinessRequestDto {
    return (
        typeof data.name === 'string' && data.name.trim() !== '' &&
        typeof data.description === 'string' && data.description.trim() !== '' &&
        typeof data.investment === 'number' && data.investment >= 0 &&
        typeof data.profitPercentage === 'number' && data.profitPercentage >= 0 &&
        typeof data.categoryId === 'number' && Number.isInteger(data.categoryId) && data.categoryId > 0 &&
        typeof data.municipalityId === 'string',
        typeof data.businessModel === 'string' && data.businessModel.trim() !== '' &&
        typeof data.monthlyIncome === 'number' && data.monthlyIncome >= 0 &&
        (data.imageUrl === undefined || data.imageUrl === null || typeof data.imageUrl === 'string')
        // Añadir más validaciones según sea necesario (longitud de strings, rangos, etc.)
    );
}