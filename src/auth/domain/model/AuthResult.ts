// auth/domain/model/AuthResult.ts
export interface AuthResult {
    accessToken: string;
    refreshToken?: string | null; // Opcional
    tokenType: string; // Ej: "Bearer"
    expiresIn: number; // Segundos
}