import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { ITokenService } from "../../application/services/ITokenService";
import { AuthResult } from '../../domain/model/AuthResult';
import { AuthPayload } from '../../domain/model/AuthPayload'; // Payload del token

/**
 * Implementación de ITokenService usando JSON Web Tokens (JWT).
 * Lee la configuración (secretos, duración) desde variables de entorno.
 */
export class TokenService implements ITokenService {
    private readonly jwtSecret: Secret;
    private readonly accessTokenExpiresInSeconds: number;
    private readonly tokenType: string = "Bearer";
    // Opcional: Variables para Refresh Token
    // private readonly refreshTokenSecret: Secret;
    // private readonly refreshTokenExpiresIn: string; // ej: '7d'

    constructor() {
        // Cargar secretos y configuración desde variables de entorno o un archivo de configuración seguro
        this.jwtSecret = process.env.JWT_SECRET ?? 'default-auth-secret-change-me!'; // ¡CAMBIAR EN PRODUCCIÓN!
        // this.refreshTokenSecret = process.env.REFRESH_SECRET ?? 'default-refresh-secret-change-me!'; // ¡CAMBIAR EN PRODUCCIÓN!

        // Duración del token de acceso (ej: 1 hora en segundos)
        this.accessTokenExpiresInSeconds = parseInt(process.env.ACCESS_TOKEN_EXPIRATION_SECONDS ?? '3600', 10);
        // this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRATION ?? '7d';

        // Advertencias si se usan los secretos por defecto (solo para desarrollo)
        if (this.jwtSecret === 'default-auth-secret-change-me!') {
            console.warn("AUTH WARNING: Using default JWT secret. Set JWT_SECRET environment variable for production.");
        }
        // if (this.refreshTokenSecret === 'default-refresh-secret-change-me!') {
        //     console.warn("AUTH WARNING: Using default Refresh Token secret. Set REFRESH_SECRET environment variable for production.");
        // }
        if (!process.env.ACCESS_TOKEN_EXPIRATION_SECONDS) {
             console.warn(`AUTH WARNING: ACCESS_TOKEN_EXPIRATION_SECONDS not set. Defaulting to ${this.accessTokenExpiresInSeconds} seconds.`);
        }
    }

    async generateAuthResponse(userId: string): Promise<AuthResult> {
        if (!userId) {
            throw new Error("Cannot generate token response without a user ID.");
        }

        const payload: AuthPayload = { id: userId };

        const signOptions: SignOptions = {
            expiresIn: this.accessTokenExpiresInSeconds,
            // algorithm: 'HS256' // Opcional: especificar algoritmo (HS256 es el default)
        };

        try {
            // Generar Access Token
            const accessToken = jwt.sign(payload, this.jwtSecret, signOptions);

            // Generar Refresh Token (Opcional)
            // const refreshTokenPayload = { id: userId }; // Podría tener un payload diferente si es necesario
            // const refreshTokenOptions: SignOptions = { expiresIn: this.refreshTokenExpiresIn };
            // const refreshToken = jwt.sign(refreshTokenPayload, this.refreshTokenSecret, refreshTokenOptions);

            console.log(`Generated auth response for user ID: ${userId}`);

            // Construir y devolver el objeto AuthResult
            const authResult: AuthResult = {
                accessToken: accessToken,
                refreshToken: null, // Cambiar a `refreshToken` si se genera
                tokenType: this.tokenType,
                expiresIn: this.accessTokenExpiresInSeconds,
            };

            return authResult;

        } catch (error) {
            console.error(`Error generating JWT for user ID ${userId}:`, error);
            // Lanzar un error más específico podría ser útil
            throw new Error("Token generation failed.");
        }
    }

    // --- Métodos Adicionales (Opcional) ---

    /**
     * Verifica un token JWT y devuelve su payload si es válido.
     * @param token El token JWT a verificar.
     * @param secret El secreto usado para firmar el token (puede ser access o refresh).
     * @returns El payload decodificado o null si el token es inválido o ha expirado.
     */
    /*
    async verifyToken(token: string, secret: Secret = this.jwtSecret): Promise<AuthPayload | null> {
        try {
            const decoded = jwt.verify(token, secret);
            // Asegurarse que el payload tenga la estructura esperada (AuthPayload)
            if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
                 return decoded as AuthPayload;
             }
             console.warn("Token payload structure invalid:", decoded);
             return null;
        } catch (error) {
            console.error("Token verification failed:", error); // jwt.verify lanza errores específicos (TokenExpiredError, JsonWebTokenError)
            return null;
        }
    }
    */
}