// business/infrastructure/routes/BusinessRouter.ts
import express from 'express';
import { authMiddleware } from '../../../middlewares/authMiddleware'; // Ajustar path
import {
    addBusinessController,
    getBusinessDetailsController,
    updateBusinessController,
    deleteBusinessController,
    getMyBusinessesController,
    initiatePartnershipController, // Controlador de asociación
    toggleSaveBusinessController,  // Controlador de guardar
    toggleLikeBusinessController ,
    getBusinessFeedController  // Controlador de like
} from '../business.dependencies';
import { uploadMemory } from '../../../middlewares/multerConfig';

const businessRouter = express.Router();

businessRouter.get(
    '/feed',
    authMiddleware, // <-- Feed requiere autenticación para like/save status
    (req, res) => getBusinessFeedController.run(req, res) // <-- NUEVA RUTA
);

// --- OTHER BUSINESS ENDPOINTS ---
businessRouter.post('/', authMiddleware, uploadMemory.single('imageUrl'), (req, res) => addBusinessController.run(req, res));
businessRouter.get('/mine', authMiddleware, (req, res) => getMyBusinessesController.run(req, res));
businessRouter.get('/:id', authMiddleware, (req, res) => getBusinessDetailsController.run(req, res));
businessRouter.put('/:id', authMiddleware, uploadMemory.single('imageUrl'), (req, res) => updateBusinessController.run(req, res));
businessRouter.delete('/:id', authMiddleware, (req, res) => deleteBusinessController.run(req, res));
businessRouter.post('/:businessId/associate', authMiddleware, (req, res) => initiatePartnershipController.run(req, res));
businessRouter.post('/:businessId/save', authMiddleware, (req, res) => toggleSaveBusinessController.run(req, res));
businessRouter.post('/:businessId/like', authMiddleware, (req, res) => toggleLikeBusinessController.run(req, res));

export { businessRouter };