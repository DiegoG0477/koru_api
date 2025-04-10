// user/infrastructure/user.dependencies.ts
import { GetUserByIdUseCase } from "../application/use-cases/GetUserByIdUseCase";
import { UpdateUserUseCase } from "../application/use-cases/UpdateUserUseCase";
import { GetUserByIdController } from "./controllers/GetUserByIdController";
import { UpdateUserController } from "./controllers/UpdateUserController";
import { MysqlUserRepository } from "./adapters/MysqlUserRepository";
import { cloudinaryStorageService } from "../../shared/cloudstorage/cloudinary.dependencies";

// --- Instanciaciones ---
export const mysqlUserRepository = new MysqlUserRepository();
export const getUserByIdUseCase = new GetUserByIdUseCase(
    mysqlUserRepository
);

export const updateUserUseCase = new UpdateUserUseCase(
    mysqlUserRepository,
    cloudinaryStorageService
);

export const getUserByIdController = new GetUserByIdController(getUserByIdUseCase);
export const updateUserController = new UpdateUserController(updateUserUseCase);