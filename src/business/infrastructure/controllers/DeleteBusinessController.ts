// business/infrastructure/controllers/DeleteBusinessController.ts
import { Request, Response } from 'express';
import { DeleteBusinessUseCase } from '../../application/use-cases/DeleteBusinessUseCase';

export class DeleteBusinessController {
    constructor(readonly deleteBusinessUseCase: DeleteBusinessUseCase) {}

    async run(req: Request, res: Response): Promise<Response> {
        const businessId = req.params.id;
        const ownerId = (req as any).userId; // Del middleware de autenticación

        if (!ownerId) {
            return res.status(401).send({ status: 'error', message: 'Authentication required.' });
        }
         if (!businessId) {
            return res.status(400).send({ status: 'error', message: 'Missing business ID parameter.' });
        }

        try {
            const deleted = await this.deleteBusinessUseCase.run(businessId, ownerId);

            if (deleted) {
                return res.status(200).send({ // O 204 No Content
                    status: 'success',
                    message: `Business ${businessId} deleted successfully.`,
                });
            } else {
                // Falló: no encontrado o no autorizado
                return res.status(404).send({ // O 403
                    status: 'error',
                    message: `Failed to delete business ${businessId}. Not found or not authorized.`,
                });
            }
        } catch (error) {
            console.error(`Error in DeleteBusinessController for ID ${businessId}:`, error);
            return res.status(500).send({ status: 'error', message: 'An unexpected error occurred.' });
        }
    }
}