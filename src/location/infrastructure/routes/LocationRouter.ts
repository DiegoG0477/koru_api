// locations/infrastructure/routes/LocationRouter.ts
import express from 'express';
import {
    getAllCountriesController,
    getStatesByCountryController,
    getMunicipalitiesByStateController,
    getAllCategoriesController
} from '../location.dependencies'; // Importar desde dependencias de locations

const locationRouter = express.Router();

// GET /api/v1/locations/countries
locationRouter.get('/countries', (req, res) => getAllCountriesController.run(req, res));

// GET /api/v1/locations/states?countryId=MX
locationRouter.get('/states', (req, res) => getStatesByCountryController.run(req, res));

// GET /api/v1/locations/municipalities?stateId=MX-JAL
locationRouter.get('/municipalities', (req, res) => getMunicipalitiesByStateController.run(req, res));

// GET /api/v1/locations/categories
locationRouter.get('/categories', (req, res) => getAllCategoriesController.run(req, res));

export { locationRouter };