// user/infrastructure/user.dependencies.ts
import { GetUserByIdUseCase } from "../application/use-cases/GetUserByIdUseCase";
import { UpdateUserUseCase } from "../application/use-cases/UpdateUserUseCase";
import { GetUserByIdController } from "./controllers/GetUserByIdController";
import { UpdateUserController } from "./controllers/UpdateUserController";
import { MysqlUserRepository } from "./adapters/MysqlUserRepository";
import { FirebaseStorageService } from "../../shared/cloudstorage/FirebaseStorageService";

// --- Instanciaciones ---
export const mysqlUserRepository = new MysqlUserRepository();
export const firebaseStorageService = new FirebaseStorageService(); // Instanciar Storage Service

export const getUserByIdUseCase = new GetUserByIdUseCase(
    mysqlUserRepository
);

export const updateUserUseCase = new UpdateUserUseCase(
    mysqlUserRepository,
    firebaseStorageService // Inyectar Storage Service
);

export const getUserByIdController = new GetUserByIdController(getUserByIdUseCase);
export const updateUserController = new UpdateUserController(updateUserUseCase);