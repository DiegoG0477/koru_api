// auth/application/use-cases/LoginUseCase.ts
import { AuthRepository } from "../../domain/repository/AuthRepository";
import { ITokenService } from "../services/ITokenService";
import { AuthResult } from "../../domain/model/AuthResult";

export class LoginUseCase {
    constructor(
        readonly authRepository: AuthRepository, // Usa el repo de Auth
        readonly tokenService: ITokenService
    ) {}

    /**
     * Ejecuta el flujo de login.
     * @returns AuthResult si el login es exitoso, null si falla.
     */
    async run(email: string, password: string): Promise<AuthResult | null> {
        try {
            // 1. Verificar credenciales usando el AuthRepository
            const userId = await this.authRepository.verifyLoginCredentials(email, password);

            if (!userId) {
                console.warn(`Login failed for email: ${email}`);
                return null; // Credenciales inválidas o usuario no existe
            }

            // 2. Generar la respuesta con los tokens
            const authResponse = await this.tokenService.generateAuthResponse(userId);

            return authResponse;

        } catch (error) {
            console.error("Error in LoginUserUseCase:", error);
            return null;
        }
    }
}