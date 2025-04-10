// user/infrastructure/routes/UserRouter.ts
import express from "express";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { getUserByIdController, updateUserController } from "../user.dependencies";
import { uploadProfileImage } from "../../../middlewares/multerConfig"; // <-- Importar middleware Multer

const userRouter = express.Router();

// GET /api/v1/users/me
userRouter.get('/me', authMiddleware, (req, res) => {
    (req as any).params = { id: (req as any).userId };
    return getUserByIdController.run(req, res);
});

// PUT /api/v1/users/me - APLICAR MIDDLEWARE MULTER
// Espera un campo 'profileImage' en la petición form-data
userRouter.put(
    '/me',
    authMiddleware,
    uploadProfileImage, // <-- Aplicar middleware ANTES del controlador
    (req, res) => updateUserController.run(req, res)
);

export { userRouter };