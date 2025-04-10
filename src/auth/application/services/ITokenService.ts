import { AuthResult } from "../../domain/model/AuthResult";

/**
 * Define el contrato para los servicios encargados de generar
 * la respuesta de autenticación, incluyendo los tokens necesarios.
 */
export interface ITokenService {
    /**
     * Genera la respuesta de autenticación completa (incluyendo tokens).
     * @param userId El ID del usuario para incluir en el payload del token.
     * @returns Una promesa que resuelve a un objeto AuthResult que contiene los detalles del token.
     * @throws Error si la generación de tokens falla por alguna razón (ej. secreto JWT inválido).
     */
    generateAuthResponse(userId: string): Promise<AuthResult>;
}