// business/infrastructure/controllers/ToggleSaveBusinessController.ts
import { Request, Response } from 'express';
import { ToggleSaveBusinessUseCase } from '../../application/use-cases/ToggleSaveBusinessUseCase'; // Asegúrate que esté en business/application/use-cases
import { BusinessUpdateError, BusinessUpdateErrorType } from '../../domain/errors/BusinessUpdateError'; // Importar error

export class ToggleSaveBusinessController {
    constructor(readonly toggleSaveBusinessUseCase: ToggleSaveBusinessUseCase) {}

    async run(req: Request, res: Response): Promise<Response> {
        const userId = (req as any).userId; // ID del usuario autenticado
        const businessId = req.params.businessId; // ID del negocio desde la URL

        if (!userId) {
            return res.status(401).send({ status: 'error', message: 'Authentication required.' });
        }
        if (!businessId) {
            return res.status(400).send({ status: 'error', message: 'Missing business ID parameter.' });
        }

        try {
            // El UseCase ahora devuelve el NUEVO estado (true si guardado, false si no) o lanza error
            const isSaved = await this.toggleSaveBusinessUseCase.run(userId, businessId);

            return res.status(200).send({
                status: 'success',
                message: `Business save status toggled successfully.`,
                data: {
                    businessId: businessId,
                    isSaved: isSaved // Devolver el nuevo estado
                }
            });

        } catch (error) {
            console.error(`Error toggling save for business ${businessId}, user ${userId}:`, error);
            if (error instanceof BusinessUpdateError) {
                 // Manejar errores específicos si el UseCase/Repo los lanza
                 switch(error.type) {
                     case BusinessUpdateErrorType.NotFound:
                          return res.status(404).send({ status: 'error', message: `Business with ID ${businessId} not found.`});
                     case BusinessUpdateErrorType.DatabaseError:
                     default:
                          return res.status(500).send({ status: 'error', message: error.message || 'Failed to toggle save status.' });
                 }
            }
            return res.status(500).send({ status: 'error', message: 'An unexpected error occurred.' });
        }
    }
}