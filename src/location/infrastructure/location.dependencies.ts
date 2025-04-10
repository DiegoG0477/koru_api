// locations/infrastructure/location.dependencies.ts
import { MysqlLocationRepository } from './repository/MysqlLocationRepository';
import { GetAllCountriesUseCase } from '../application/use-cases/GetAllCountriesUseCase';
import { GetStatesByCountryUseCase } from '../application/use-cases/GetStatesByCountryUseCase';
import { GetMunicipalitiesByStateUseCase } from '../application/use-cases/GetMunicipalitiesByStateUseCase';
import { GetAllCategoriesUseCase } from '../application/use-cases/GetAllCategoriesUseCase';
import { GetAllCountriesController } from './controllers/GetAllCountriesController';
import { GetStatesByCountryController } from './controllers/GetStatesByCountryController';
import { GetMunicipalitiesByStateController } from './controllers/GetMunicipalitiesByStateController';
import { GetAllCategoriesController } from './controllers/GetAllCategoriesController';

// --- Repositorio ---
export const mysqlLocationRepository = new MysqlLocationRepository();

// --- Casos de Uso ---
export const getAllCountriesUseCase = new GetAllCountriesUseCase(mysqlLocationRepository);
export const getStatesByCountryUseCase = new GetStatesByCountryUseCase(mysqlLocationRepository);
export const getMunicipalitiesByStateUseCase = new GetMunicipalitiesByStateUseCase(mysqlLocationRepository);
export const getAllCategoriesUseCase = new GetAllCategoriesUseCase(mysqlLocationRepository);

// --- Controladores ---
export const getAllCountriesController = new GetAllCountriesController(getAllCountriesUseCase);
export const getStatesByCountryController = new GetStatesByCountryController(getStatesByCountryUseCase);
export const getMunicipalitiesByStateController = new GetMunicipalitiesByStateController(getMunicipalitiesByStateUseCase);
export const getAllCategoriesController = new GetAllCategoriesController(getAllCategoriesUseCase);