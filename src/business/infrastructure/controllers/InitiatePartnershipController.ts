import { Request, Response } from 'express';
import { InitiatePartnershipUseCase } from '../../application/use-cases/InitiatePartnershipUseCase';

export class InitiatePartnershipController {
    constructor(readonly useCase: InitiatePartnershipUseCase) {}
    async run(req: Request, res: Response): Promise<Response> {
        const userId = (req as any).userId;
        const businessId = req.params.businessId; // Tomar de params

        if (!userId) return res.status(401).send({ status: 'error', message: 'Authentication required.' });
        if (!businessId) return res.status(400).send({ status: 'error', message: 'Missing business ID.' });

        try {
            const success = await this.useCase.run(userId, businessId);
            if (success) {
                return res.status(200).send({ status: 'success', message: 'Partnership interest registered.' });
            } else {
                // Podría ser que el usuario es dueño, negocio no existe, o error DB
                return res.status(400).send({ status: 'error', message: 'Failed to register partnership interest.' });
            }
        } catch (error) {
             console.error("Error in InitiatePartnershipController:", error);
            return res.status(500).send({ status: 'error', message: 'An unexpected error occurred.' });
        }
    }
}