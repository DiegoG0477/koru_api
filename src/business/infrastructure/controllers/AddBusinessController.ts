// business/infrastructure/controllers/AddBusinessController.ts
import { Request, Response } from 'express';
import { AddBusinessUseCase } from '../../application/use-cases/AddBusinessUseCase';
import { AddBusinessRequestDto, isValidAddBusinessRequest } from '../dto/AddBusinessRequestDto'; // Importar validador
// Quitar import de UploadedFile (ya no se usa explícitamente aquí)
import { mapBusinessToResponseDto } from '../utils/DataMapper';
import { UserRepository } from '../../../user/domain/UserRepository';

export class AddBusinessController {
    constructor(
        readonly addBusinessUseCase: AddBusinessUseCase,
        readonly userRepository: UserRepository
        ) {}

    async run(req: Request, res: Response): Promise<Response> {
        const ownerId = (req as any).userId;
        const data: AddBusinessRequestDto = req.body;
        const imageFile = req.file || null; // <-- Acceder a req.file para Multer

        if (!ownerId) {
            return res.status(401).send({ status: 'error', message: 'Authentication required.' });
        }

        // --- Validación Mejorada ---
        // 1. Convertir números que llegan como string desde form-data (si aplica)
        // Multer con form-data puede enviar números como strings. express.json() no.
        // Si usas form-data, necesitas convertir ANTES de validar.
        const dataToValidate = {
            ...data,
            // Intentar convertir a número, si falla, isNaN lo detectará abajo
            investment: data.investment !== undefined ? Number(data.investment) : undefined,
            profitPercentage: data.profitPercentage !== undefined ? Number(data.profitPercentage) : undefined,
            categoryId: data.categoryId !== undefined ? Number(data.categoryId) : undefined,
            municipalityId: data.municipalityId !== undefined ? String(data.municipalityId) : undefined,
            monthlyIncome: data.monthlyIncome !== undefined ? Number(data.monthlyIncome) : undefined,
        };

        // 2. Usar el validador de DTO (ajustado para recibir any)
        if (!isValidAddBusinessRequest(dataToValidate)) {
             // Reintentar validación por campos faltantes si la validación de tipo falla
             const requiredFields: (keyof AddBusinessRequestDto)[] = [
                'name', 'description', 'investment', 'profitPercentage',
                'categoryId', 'municipalityId', 'businessModel', 'monthlyIncome'
             ];
             const missingFields = requiredFields.filter(field => !(field in dataToValidate) || dataToValidate[field as keyof AddBusinessRequestDto] === undefined || dataToValidate[field as keyof AddBusinessRequestDto] === '');
              if(missingFields.length > 0){
                    return res.status(400).send({ status: 'error', message: `Missing or invalid required fields: ${missingFields.join(', ')}` });
              } else {
                    // Si no faltan campos pero isValid falla, es un problema de tipo/formato
                    return res.status(400).send({ status: 'error', message: 'Invalid data type provided for one or more fields.' });
              }
        }
        // --- Fin Validación ---


        // 3. Imagen requerida? (Según tu lógica Android - AddBusinessViewModel la valida)
        // Descomentar si la imagen es obligatoria para crear
        /*
        if (!imageFile && !data.imageUrl) { // Si no hay archivo Y no se envió una URL en el body
             return res.status(400).send({
                 status: 'error',
                 message: 'Business image is required.',
             });
        }
        */


        try {
            // Pasar los datos validados (y convertidos) al UseCase
            const createdBusiness = await this.addBusinessUseCase.run(ownerId, dataToValidate, imageFile);

            if (createdBusiness) {
                 const owner = await this.userRepository.getUserById(ownerId);
                 const responseDto = await mapBusinessToResponseDto(createdBusiness, owner);
                return res.status(201).send({
                    status: 'success',
                    message: 'Business created successfully',
                    data: responseDto
                });
            } else {
                // UseCase retornó null (posible error interno o validación fallida en UseCase)
                return res.status(400).send({
                    status: 'error',
                    message: 'Failed to create business.',
                });
            }
        } catch (error) {
            console.error("Error in AddBusinessController:", error);
            return res.status(500).send({ status: 'error', message: 'An unexpected error occurred.' });
        }
    }
}