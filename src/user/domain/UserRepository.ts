// user/domain/UserRepository.ts
import { User } from "./entities/User";

export type UserProfileUpdateData = Partial<Pick<User,
    'name' |
    'last_name' |
    'profile_image_url' |
    'biography' |
    'linkedin_profile' |
    'instagram_handle'
>>;

export interface UserRepository {
    getUserByEmail(email: string): Promise<User | null>;
    getUserById(id: string): Promise<User | null>;
    updateUserProfile(id: string, data: UserProfileUpdateData): Promise<User | null>;

    // --- Métodos auxiliares para AuthRepository ---
    getUserPasswordHashByEmail(email: string): Promise<string | null>;

    /**
     * Crea un nuevo registro de usuario con todos los datos necesarios.
     * @param basicUserData Datos básicos sin contraseña.
     * @param hashedPassword El hash de la contraseña generado por EncryptPasswordService.
     * @param details Datos adicionales (ubicación, fecha nac.).
     * @returns El usuario creado (sin hash de contraseña) o null en caso de error.
     */
    createUser(
        basicUserData: Pick<User, 'email' | 'name' | 'last_name'>, // <-- SIN 'password'
        hashedPassword: string, // <-- Contraseña hasheada como parámetro separado
        details: { birthDate: string, countryId: string, stateId: string, municipalityId: string }
    ): Promise<Omit<User, 'password'> | null>; // <-- 'password' ya no existe en User, Omit es redundante pero seguro
}