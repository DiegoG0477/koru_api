// auth/application/use-cases/RegisterUseCase.ts
import { AuthRepository } from "../../domain/repository/AuthRepository";
import { ITokenService } from "../services/ITokenService";
import { RegisterRequestDto } from "../../infrastructure/dtos/RegisterRequestDto"; // Usa el DTO de entrada
import { AuthResult } from "../../domain/model/AuthResult";

export class RegisterUseCase {
    constructor(
        readonly authRepository: AuthRepository, // Usa repo de Auth
        readonly tokenService: ITokenService
    ) {}

    /**
     * Ejecuta el flujo de registro.
     * @returns AuthResult si el registro es exitoso (incluye auto-login), null si falla.
     */
    async run(data: RegisterRequestDto): Promise<AuthResult | null> {
        try {
            // 1. Validación básica del DTO (se puede expandir)
            if (!data.email.includes('@') || data.password.length < 8) {
                 console.warn("Invalid data received for registration:", data.email);
                 return null; // Falla de validación temprana
            }
             if (isNaN(Date.parse(data.birthDate))) {
                 console.error("Invalid birth date format during registration:", data.birthDate);
                 return null;
             }
             // TODO: Validar IDs de ubicación si es posible/necesario

            // 2. Intentar registrar usando el AuthRepository
            const registeredUser = await this.authRepository.registerUser(data);

            if (!registeredUser || !registeredUser.id) {
                // El repositorio ya debería haber logueado el error (ej: duplicado)
                return null; // Falla en el registro
            }

            // 3. Generar respuesta de autenticación (auto-login)
            const authResponse = await this.tokenService.generateAuthResponse(registeredUser.id);

            return authResponse;

        } catch (error) {
            console.error("Error in RegisterUseCase:", error);
            return null;
        }
    }
}