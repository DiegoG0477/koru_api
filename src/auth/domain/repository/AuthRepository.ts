// auth/domain/repository/AuthRepository.ts
import { User } from "../../../user/domain/entities/User";
import { RegisterRequestDto } from "../../infrastructure/dtos/RegisterRequestDto"; // Necesita DTO de registro para crear
//import { AuthResult } from "../model/AuthResult";

export interface AuthRepository {
    /**
     * Verifica las credenciales de login.
     * @param email El email del usuario.
     * @param password La contraseña en texto plano.
     * @returns El ID del usuario si las credenciales son válidas, null si no.
     */
    verifyLoginCredentials(email: string, password: string): Promise<string | null>;

    /**
     * Registra un nuevo usuario en el sistema.
     * @param registrationData Datos completos del DTO de registro.
     * @returns El User creado (sin password) si el registro es exitoso, null si falla (ej: email duplicado).
     */
    registerUser(registrationData: RegisterRequestDto): Promise<Omit<User, 'password'> | null>;
}