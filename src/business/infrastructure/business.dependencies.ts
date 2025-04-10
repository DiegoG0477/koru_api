// business/infrastructure/business.dependencies.ts
import { AddBusinessUseCase } from "../application/use-cases/AddBusinessUseCase";
import { GetBusinessDetailsUseCase } from "../application/use-cases/GetBusinessDetailsUseCase";
import { UpdateBusinessUseCase } from "../application/use-cases/UpdateBusinessUseCase";
import { DeleteBusinessUseCase } from "../application/use-cases/DeleteBusinessUseCase";
//import { GetMyBusinessesUseCase } from "../application/use-cases/GetMyBusinessesUseCase"; // Obsoleto si usamos el filtrado
import { GetFilteredMyBusinessesUseCase } from "../application/use-cases/GetFilteredMyBusinessesUseCase"; // Usar este
import { InitiatePartnershipUseCase } from '../application/use-cases/InitiatePartnershipUseCase';
//import { GetPartneredBusinessesUseCase } from '../application/use-cases/GetPartneredBusinessesUseCase'; // Usado indirectamente por GetFiltered...
//import { GetSavedBusinessesUseCase } from '../application/use-cases/GetSavedBusinessesUseCase'; // Usado indirectamente por GetFiltered...
import { ToggleSaveBusinessUseCase } from '../application/use-cases/ToggleSaveBusinessUseCase';
import { ToggleLikeBusinessUseCase } from '../application/use-cases/ToggleLikeBusinessUseCase';
import { GetBusinessFeedUseCase } from "../application/use-cases/GetBusinessFeedUseCase";

import { AddBusinessController } from "./controllers/AddBusinessController";
import { GetBusinessDetailsController } from "./controllers/GetBusinessDetailsController";
import { UpdateBusinessController } from "./controllers/UpdateBusinessController";
import { DeleteBusinessController } from "./controllers/DeleteBusinessController";
import { GetMyBusinessesController } from "./controllers/GetMyBusinessesController"; // Este es el que usa el filtrado
import { InitiatePartnershipController } from './controllers/InitiatePartnershipController';
import { ToggleSaveBusinessController } from './controllers/ToggleSaveBusinessController'; // NUEVO
import { ToggleLikeBusinessController } from './controllers/ToggleLikeBusinessController'; // NUEVO
import { GetBusinessFeedController } from "./controllers/GetBusinessFeedController";

import { MysqlBusinessRepository } from "./repository/MysqlBusinessRepository";

// Importar dependencias necesarias
import { firebaseStorageService } from "../../shared/cloudstorage/firebaseStorage.dependencies";
import { mysqlUserRepository } from "../../user/infrastructure/user.dependencies";

// --- Instanciación del Repositorio ---
// MysqlBusinessRepository ahora no necesita UserRepository en constructor (se obtiene owner en controller/mapper)
// export const mysqlBusinessRepository = new MysqlBusinessRepository(mysqlUserRepository); // <- Versión anterior
export const mysqlBusinessRepository = new MysqlBusinessRepository(); // <- Nueva versión

// --- Instanciación de Casos de Uso ---
export const addBusinessUseCase = new AddBusinessUseCase(mysqlBusinessRepository, firebaseStorageService);
export const getBusinessDetailsUseCase = new GetBusinessDetailsUseCase(mysqlBusinessRepository);
export const updateBusinessUseCase = new UpdateBusinessUseCase(mysqlBusinessRepository, firebaseStorageService);
//export const deleteBusinessUseCase = new DeleteBusinessUseCase(mysqlBusinessRepository, firebaseStorageService);
export const deleteBusinessUseCase = new DeleteBusinessUseCase(mysqlBusinessRepository);
// export const getMyBusinessesUseCase = new GetMyBusinessesUseCase(mysqlBusinessRepository); // Ya no se usa directamente por el controller
export const getFilteredMyBusinessesUseCase = new GetFilteredMyBusinessesUseCase(mysqlBusinessRepository); // Usar este
export const initiatePartnershipUseCase = new InitiatePartnershipUseCase(mysqlBusinessRepository);
// GetPartnered y GetSaved son usados por GetFilteredMyBusinessesUseCase, no necesitan instancia separada aquí a menos que los llames directamente
export const toggleSaveBusinessUseCase = new ToggleSaveBusinessUseCase(mysqlBusinessRepository);
export const toggleLikeBusinessUseCase = new ToggleLikeBusinessUseCase(mysqlBusinessRepository);

export const getBusinessFeedUseCase = new GetBusinessFeedUseCase(mysqlBusinessRepository, mysqlUserRepository);

// --- Instanciación de Controladores ---
export const addBusinessController = new AddBusinessController(addBusinessUseCase, mysqlUserRepository); // Necesita UserRepo para mapear respuesta
export const getBusinessDetailsController = new GetBusinessDetailsController(getBusinessDetailsUseCase, mysqlUserRepository); // Necesita UserRepo
export const updateBusinessController = new UpdateBusinessController(updateBusinessUseCase, mysqlUserRepository); // Necesita UserRepo
export const deleteBusinessController = new DeleteBusinessController(deleteBusinessUseCase);
// Este controlador ahora usa el UseCase filtrado
export const getMyBusinessesController = new GetMyBusinessesController(getFilteredMyBusinessesUseCase);
export const initiatePartnershipController = new InitiatePartnershipController(initiatePartnershipUseCase);
export const toggleSaveBusinessController = new ToggleSaveBusinessController(toggleSaveBusinessUseCase); // NUEVO
export const toggleLikeBusinessController = new ToggleLikeBusinessController(toggleLikeBusinessUseCase); // NUEVO
export const getBusinessFeedController = new GetBusinessFeedController(getBusinessFeedUseCase);