// business/infrastructure/controllers/ToggleLikeBusinessController.ts
import { Request, Response } from 'express';
import { ToggleLikeBusinessUseCase } from '../../application/use-cases/ToggleLikeBusinessUseCase'; // Asegúrate que esté en business/application/use-cases
import { BusinessUpdateError, BusinessUpdateErrorType } from '../../domain/errors/BusinessUpdateError'; // Importar error

export class ToggleLikeBusinessController {
    constructor(readonly toggleLikeBusinessUseCase: ToggleLikeBusinessUseCase) {}

    async run(req: Request, res: Response): Promise<Response> {
        const userId = (req as any).userId;
        const businessId = req.params.businessId;

        if (!userId) {
            return res.status(401).send({ status: 'error', message: 'Authentication required.' });
        }
        if (!businessId) {
            return res.status(400).send({ status: 'error', message: 'Missing business ID parameter.' });
        }

        try {
            const isLiked = await this.toggleLikeBusinessUseCase.run(userId, businessId);

            return res.status(200).send({
                status: 'success',
                message: `Business like status toggled successfully.`,
                data: {
                    businessId: businessId,
                    isLiked: isLiked // Devolver el nuevo estado
                }
            });

        } catch (error) {
             console.error(`Error toggling like for business ${businessId}, user ${userId}:`, error);
             if (error instanceof BusinessUpdateError) {
                 switch(error.type) {
                     case BusinessUpdateErrorType.NotFound:
                          return res.status(404).send({ status: 'error', message: `Business with ID ${businessId} not found.`});
                     case BusinessUpdateErrorType.DatabaseError:
                     default:
                          return res.status(500).send({ status: 'error', message: error.message || 'Failed to toggle like status.' });
                 }
            }
            return res.status(500).send({ status: 'error', message: 'An unexpected error occurred.' });
        }
    }
}