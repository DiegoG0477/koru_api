// auth/infrastructure/repository/MysqlAuthRepository.ts
import { AuthRepository } from "../../domain/repository/AuthRepository";
import { UserRepository } from "../../../user/domain/UserRepository";
import { IEncryptPasswordService } from "../../domain/services/IEncryptPasswordService";
import { RegisterRequestDto } from "../dtos/RegisterRequestDto";
import { User } from "../../../user/domain/entities/User";

export class MysqlAuthRepository implements AuthRepository {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly encryptService: IEncryptPasswordService
    ) {}

    async verifyLoginCredentials(email: string, passwordInPlainText: string): Promise<string | null> {
        try {
            // Usa el método específico para obtener solo el hash
            const hashedPassword = await this.userRepository.getUserPasswordHashByEmail(email);
            if (!hashedPassword) return null;

            const isMatch = await this.encryptService.verifyPassword(passwordInPlainText, hashedPassword);
            if (!isMatch) return null;

            const user = await this.userRepository.getUserByEmail(email);
            return user?.id ?? null;
        } catch (error) {
            console.error("Error verifying login credentials:", error);
            return null;
        }
    }

    async registerUser(registrationData: RegisterRequestDto): Promise<Omit<User, 'password'> | null> {
         try {
            const hashedPassword = await this.encryptService.encodePassword(registrationData.password);

            // Llama al nuevo método createUser del UserRepository con parámetros separados
            const createdUser = await this.userRepository.createUser(
                { // Datos básicos (SIN password)
                    email: registrationData.email,
                    name: registrationData.firstName,
                    last_name: registrationData.lastName
                },
                hashedPassword, // <-- Pasar hash separado
                { // Detalles adicionales
                    birthDate: registrationData.birthDate,
                    countryId: registrationData.countryId,
                    stateId: registrationData.stateId,
                    municipalityId: registrationData.municipalityId
                }
            );

            return createdUser; // Devuelve el usuario creado (o null si falla)

        } catch (error) {
            console.error("Error delegating user creation in AuthRepository:", error);
            return null;
        }
    }
}