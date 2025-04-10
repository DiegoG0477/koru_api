// business/infrastructure/controllers/GetMyBusinessesController.ts
import { Request, Response } from 'express';
// Cambiar UseCase importado
import { GetFilteredMyBusinessesUseCase, MyBusinessTypeFilter } from '../../application/use-cases/GetFilteredMyBusinessesUseCase';
import { mapBusinessToListItemDto } from '../utils/DataMapper';

export class GetMyBusinessesController {
    // Cambiar constructor para usar el nuevo UseCase
    constructor(readonly getFilteredMyBusinessesUseCase: GetFilteredMyBusinessesUseCase) {}

    async run(req: Request, res: Response): Promise<Response> {
        const ownerId = (req as any).userId;
        // Obtener filtro de query param, default a OWNED
        const filterQuery = (req.query.filter as string)?.toUpperCase();
        let filterType: MyBusinessTypeFilter;

        // Validar filtro
        switch (filterQuery) {
            case 'OWNED': filterType = MyBusinessTypeFilter.OWNED; break;
            case 'PARTNERED': filterType = MyBusinessTypeFilter.PARTNERED; break;
            case 'SAVED': filterType = MyBusinessTypeFilter.SAVED; break;
            default: filterType = MyBusinessTypeFilter.OWNED; // Default si no se especifica o es inválido
        }


        if (!ownerId) {
            return res.status(401).send({ status: 'error', message: 'Authentication required.' });
        }

        try {
            // Llamar al nuevo UseCase con el filtro
            const businesses = await this.getFilteredMyBusinessesUseCase.run(ownerId, filterType);

            if (businesses) {
                // Mapear cada negocio al DTO de lista
                const responseData = await Promise.all(
                    businesses.map(business => mapBusinessToListItemDto(
                        business,
                        filterType === MyBusinessTypeFilter.OWNED // Pasar si es Owned para el flag 'isOwned' del DTO
                    ))
                );
                return res.status(200).send({
                    status: 'success',
                    message: 'User businesses retrieved successfully.',
                    data: responseData
                });
            } else {
                return res.status(500).send({ status: 'error', message: 'Failed to retrieve user businesses.' });
            }
        } catch (error) {
            console.error(`Error in GetMyBusinessesController for owner ${ownerId}, filter ${filterType}:`, error);
            return res.status(500).send({ status: 'error', message: 'An unexpected error occurred.' });
        }
    }
}
