// Podría ir en business/domain/errors/BusinessUpdateError.ts
export enum BusinessUpdateErrorType {
    NotFound = 'NOT_FOUND',
    Forbidden = 'FORBIDDEN', // No autorizado
    ConcurrencyError = 'CONCURRENCY_ERROR', // Ej: alguien más modificó
    StorageError = 'STORAGE_ERROR', // Falla al subir imagen
    DatabaseError = 'DATABASE_ERROR', // Error general de BD
    ValidationError = 'VALIDATION_ERROR', // Datos inválidos pasados al Use Case
}

export class BusinessUpdateError extends Error {
    constructor(public type: BusinessUpdateErrorType, message: string) {
        super(message);
        this.name = 'BusinessUpdateError';
    }
}