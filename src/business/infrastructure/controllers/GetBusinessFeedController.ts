// business/infrastructure/controllers/GetBusinessFeedController.ts
import { Request, Response } from 'express';
import { GetBusinessFeedUseCase, GetBusinessFeedOptions } from '../../application/use-cases/GetBusinessFeedUseCase';

export class GetBusinessFeedController {
    constructor(readonly getBusinessFeedUseCase: GetBusinessFeedUseCase) {}

    async run(req: Request, res: Response): Promise<Response> {
        const requestingUserId = (req as any).userId; // Opcional, del authMiddleware

        // Extraer parámetros de paginación y filtros de req.query
        const page = parseInt(req.query.page as string || '1', 10);
        const limit = parseInt(req.query.limit as string || '15', 10); // Coincidir con app?
        const filters: Record<string, any> = {};

        // Mapear query params a filtros esperados por el Use Case/Repo
        if (req.query.category_id) filters['category_id'] = req.query.category_id as string;
        if (req.query.max_investment) filters['max_investment'] = parseInt(req.query.max_investment as string, 10);
        if (req.query.nearby === 'true') filters['nearby'] = true; // La lógica geoespacial iría en el repo
        // Añadir más filtros aquí...

         if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return res.status(400).send({ status: 'error', message: 'Invalid pagination parameters (page/limit).' });
        }


        const options: GetBusinessFeedOptions = {
            page,
            limit,
            requestingUserId: requestingUserId, // Puede ser undefined si no hay auth
            filters: filters
        };

        try {
            const pagedResponse = await this.getBusinessFeedUseCase.run(options);

            if (pagedResponse) {
                // El Use Case ya devuelve el PagedBusinessResponseDto
                return res.status(200).send({
                    status: 'success',
                    message: 'Business feed retrieved successfully.',
                    data: pagedResponse.data, // Enviar solo el array de datos
                    pagination: pagedResponse.pagination // Enviar metadatos de paginación
                });
            } else {
                // Error en el UseCase/Repo
                return res.status(500).send({
                    status: 'error',
                    message: 'Failed to retrieve business feed.',
                });
            }
        } catch (error) {
            console.error("Error in GetBusinessFeedController:", error);
            return res.status(500).send({ status: 'error', message: 'An unexpected error occurred.' });
        }
    }
}