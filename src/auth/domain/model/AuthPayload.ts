// auth/domain/model/AuthPayload.ts
export interface AuthPayload {
    id: string; // El ID del usuario (como string)
    // Podrías añadir roles u otros datos si los necesitas verificar en el middleware
    // role?: string;
}