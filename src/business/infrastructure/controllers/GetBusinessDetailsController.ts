// business/infrastructure/controllers/GetBusinessDetailsController.ts
import { Request, Response } from 'express';
import { GetBusinessDetailsUseCase } from '../../application/use-cases/GetBusinessDetailsUseCase';
import { mapBusinessToResponseDto } from '../utils/DataMapper';
import { UserRepository } from '../../../user/domain/UserRepository'; // Para obtener datos del dueño

export class GetBusinessDetailsController {
    constructor(
        readonly getBusinessDetailsUseCase: GetBusinessDetailsUseCase,
        readonly userRepository: UserRepository // Para obtener datos del dueño
    ) {}

    async run(req: Request, res: Response): Promise<Response> {
        const businessId = req.params.id;
        const requestingUserId = (req as any).userId; // ID del usuario autenticado (opcional)

        if (!businessId) {
            return res.status(400).send({ status: 'error', message: 'Missing business ID parameter.' });
        }

        try {
            const business = await this.getBusinessDetailsUseCase.run(businessId, requestingUserId);

            if (business) {
                // Obtener datos del dueño
                const owner = await this.userRepository.getUserById(business.ownerId);
                // Mapear a DTO
                const responseDto = await mapBusinessToResponseDto(business, owner);

                return res.status(200).send({
                    status: 'success',
                    message: 'Business details retrieved successfully.',
                    data: responseDto
                });
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: `Business with ID ${businessId} not found.`,
                });
            }
        } catch (error) {
            console.error(`Error in GetBusinessDetailsController for ID ${businessId}:`, error);
            return res.status(500).send({ status: 'error', message: 'An unexpected error occurred.' });
        }
    }
}