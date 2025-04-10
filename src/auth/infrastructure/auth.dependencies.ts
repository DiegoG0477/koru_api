// auth/infrastructure/auth.dependencies.ts
import { LoginUseCase as LoginUserUseCase } from "../application/use-cases/LoginUseCase";
import { RegisterUseCase } from "../application/use-cases/RegisterUseCase"; // Nombre corregido
import { LoginController } from "./controllers/LoginController";
import { RegisterController } from "./controllers/RegisterController";
import { BcryptService } from "../../security/bcrypt";
import { EncryptPasswordService } from "./services/EncryptPasswordService";
import { TokenService } from "./services/TokenService";
import { mysqlUserRepository } from "../../user/infrastructure/user.dependencies"; // Repo de User
import { MysqlAuthRepository } from "./repository/MysqlAuthRepository"; // NUEVO Repo de Auth

// --- Instanciación de Servicios de Auth ---
const bcryptService = new BcryptService();
export const encryptPasswordService = new EncryptPasswordService(bcryptService);
export const tokenService = new TokenService();

// --- Instanciación del Repositorio de Auth ---
// Necesita el repo de User y el servicio de encryptación
export const mysqlAuthRepository = new MysqlAuthRepository(mysqlUserRepository, encryptPasswordService);

// --- Instanciación de Casos de Uso de Auth ---
// Ahora dependen del repo de Auth
export const loginUserUseCase = new LoginUserUseCase(
    mysqlAuthRepository, // Usa repo de Auth
    tokenService
);
export const registerUserUseCase = new RegisterUseCase( // Nombre corregido
    mysqlAuthRepository, // Usa repo de Auth
    tokenService
);

// --- Instanciación de Controladores de Auth ---
export const loginController = new LoginController(loginUserUseCase);
export const registerController = new RegisterController(registerUserUseCase);