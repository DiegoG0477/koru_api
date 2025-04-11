// business/infrastructure/dtos/UpdateBusinessRequestDto.ts

/**
 * Data Transfer Object para la actualización de un negocio existente.
 * Coincide con la estructura esperada por el endpoint PUT /businesses/:id
 * y con UpdateBusinessRequestDto.kt de la app Android (aunque aquí son opcionales).
 * Todos los campos son opcionales, solo se enviarán los que se quieran modificar.
 */
export interface UpdateBusinessRequestDto {
    name?: string;
    description?: string;
    /** Monto de inversión requerida (si se actualiza) */
    investment?: number;
    /** Porcentaje de ganancia estimada (si se actualiza) */
    profitPercentage?: number;
    /** ID numérico de la categoría (si se actualiza) */
    categoryId?: number;
    /** ID (string o número) del municipio (si se actualiza, esperado como número) */
    municipalityId?: string; // Ajustado a number
    businessModel?: string;
    /** Ingresos mensuales estimados (si se actualiza) */
    monthlyIncome?: number;
    /**
     * URL de la imagen. Puede ser:
     * - undefined/no enviado: No se cambia la imagen.
     * - null: Se quiere eliminar la imagen existente.
     * - string: Se proporciona una nueva URL (menos común si se sube archivo).
     * (La subida de archivo se maneja por separado con req.files).
     */
    imageUrl?: string | null;
}

/**
 * Validador simple para UpdateBusinessRequestDto (Ejemplo).
 */
export function isValidUpdateBusinessRequest(data: any): data is UpdateBusinessRequestDto {
    // Verifica que al menos un campo válido esté presente y que los tipos sean correctos si existen
     let isValid = false;
     if (data.name !== undefined) { if(typeof data.name !== 'string' || data.name.trim() === '') return false; isValid = true; }
     if (data.description !== undefined) { if(typeof data.description !== 'string') return false; isValid = true; }
     if (data.investment !== undefined) { if(typeof data.investment !== 'number' || data.investment < 0) return false; isValid = true; }
     if (data.profitPercentage !== undefined) { if(typeof data.profitPercentage !== 'number' || data.profitPercentage < 0) return false; isValid = true; }
     if (data.categoryId !== undefined) { if(typeof data.categoryId !== 'number' || !Number.isInteger(data.categoryId) || data.categoryId <= 0) return false; isValid = true; }
     if (data.municipalityId !== undefined) { if(typeof data.municipalityId !== 'number' || !Number.isInteger(data.municipalityId) || data.municipalityId <= 0) return false; isValid = true; } // Ajustado a number
     if (data.businessModel !== undefined) { if(typeof data.businessModel !== 'string') return false; isValid = true; }
     if (data.monthlyIncome !== undefined) { if(typeof data.monthlyIncome !== 'number' || data.monthlyIncome < 0) return false; isValid = true; }
     if (data.imageUrl !== undefined && data.imageUrl !== null) { if(typeof data.imageUrl !== 'string') return false; isValid = true; }
     if (data.imageUrl === null) { isValid = true; } // Permitir enviar null para borrar

     // Debe haber al menos un campo válido para que la petición tenga sentido (o un archivo subido)
     return isValid;
     // Nota: Esta validación no considera el archivo subido (req.file). El controlador debe verificar eso.
}