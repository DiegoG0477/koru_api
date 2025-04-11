// business/infrastructure/controllers/UpdateBusinessController.ts
import { Request, Response } from 'express';
import { UpdateBusinessUseCase } from '../../application/use-cases/UpdateBusinessUseCase';
import { UpdateBusinessRequestDto, isValidUpdateBusinessRequest } from '../dto/UpdateBusinessRequestDto';
import { mapBusinessToResponseDto } from '../utils/DataMapper';
import { UserRepository } from '../../../user/domain/UserRepository';
import { BusinessUpdateError, BusinessUpdateErrorType } from '../../domain/errors/BusinessUpdateError';
//import { Express } from 'express'; // Para tipo Multer

export class UpdateBusinessController {
    constructor(
        readonly updateBusinessUseCase: UpdateBusinessUseCase,
        readonly userRepository: UserRepository
    ) {}

    async run(req: Request, res: Response): Promise<Response> {
        const businessId = req.params.id;
        const ownerId = (req as any).userId; // ID del usuario autenticado
        const requestBodyData: UpdateBusinessRequestDto = req.body; // Datos de texto/JSON
        const imageFile : Express.Multer.File | null = req.file || null; // Archivo de Multer

        // --- Validaciones Preliminares ---
        if (!ownerId) {
            return res.status(401).send({ status: 'error', message: 'Authentication required.' });
        }
        if (!businessId) {
             return res.status(400).send({ status: 'error', message: 'Missing business ID parameter.' });
        }
        // Validar que hay algo que actualizar
        if (Object.keys(requestBodyData).length === 0 && !imageFile) {
            return res.status(400).send({ status: 'error', message: 'No update data or image provided.' });
        }

        // Convertir números si vienen como string (importante para form-data)
        const dataToValidate: UpdateBusinessRequestDto = {
            name: requestBodyData.name,
            description: requestBodyData.description,
            investment: requestBodyData.investment !== undefined ? Number(requestBodyData.investment) : undefined,
            profitPercentage: requestBodyData.profitPercentage !== undefined ? Number(requestBodyData.profitPercentage) : undefined,
            categoryId: requestBodyData.categoryId !== undefined ? Number(requestBodyData.categoryId) : undefined,
            //municipalityId: requestBodyData.municipalityId !== undefined ? Number(requestBodyData.municipalityId) : undefined, // Asegúrate que el DTO espera number
            businessModel: requestBodyData.businessModel,
            monthlyIncome: requestBodyData.monthlyIncome !== undefined ? Number(requestBodyData.monthlyIncome) : undefined,
            imageUrl: requestBodyData.imageUrl // Puede ser string, null, o undefined
        };

        // Validar tipos de datos (solo si hay datos de texto)
        if (Object.keys(dataToValidate).some(k => dataToValidate[k as keyof UpdateBusinessRequestDto] !== undefined) && !isValidUpdateBusinessRequest(dataToValidate)) {
             return res.status(400).send({ status: 'error', message: 'Invalid data type provided for one or more fields.' });
        }
        // --- Fin Validaciones ---

        try {
            // Llamar al UseCase. Ahora devuelve Business o lanza BusinessUpdateError.
            const updatedBusiness = await this.updateBusinessUseCase.run(
                businessId,
                ownerId,
                dataToValidate, // Pasar los datos potencialmente convertidos
                imageFile
            );

            // *** CORRECCIÓN: No necesitamos chequear por null aquí si el Use Case lanza error ***
            // if (updatedBusiness) { ... } else { ... } <-- Ya no es necesario este bloque else

            // Si llegamos aquí, updatedBusiness NO es null porque el UseCase lanzó error si algo falló.
            // TypeScript aún puede quejarse si la firma del UseCase *formalmente* dice "Business | null"
            // aunque en la práctica lance error. Podemos añadir una guarda por seguridad:
            if (!updatedBusiness) {
                 // Esto no debería suceder si el Use Case lanza errores correctamente
                 console.error(`UpdateUseCase returned null unexpectedly for business ${businessId}`);
                 throw new Error('Internal inconsistency: UpdateUseCase returned null without throwing error.');
            }

            // Obtener datos del dueño para completar el DTO de respuesta
            const owner = await this.userRepository.getUserById(ownerId);
            if (!owner) {
                 // Esto también es raro si el usuario está autenticado
                 console.error(`Could not find owner user data (ID: ${ownerId}) after successful business update.`);
                 // ¿Qué devolver? Podríamos devolver el negocio sin ownerInfo o un 500
                  return res.status(500).send({ status: 'error', message: 'Could not retrieve owner data.' });
            }

            // Mapear a DTO de respuesta
            const responseDto = await mapBusinessToResponseDto(updatedBusiness, owner);

            return res.status(200).send({
                status: 'success',
                message: 'Business updated successfully',
                data: responseDto
            });

        } catch (error) {
            // Capturar errores específicos lanzados por el Use Case o Repositorio
            console.error(`Error processing update for business ID ${businessId}:`, error);

            if (error instanceof BusinessUpdateError) {
                switch (error.type) {
                    case BusinessUpdateErrorType.NotFound:
                        return res.status(404).send({ status: 'error', message: error.message });
                    case BusinessUpdateErrorType.Forbidden:
                        return res.status(403).send({ status: 'error', message: error.message });
                    case BusinessUpdateErrorType.ValidationError:
                    case BusinessUpdateErrorType.StorageError: // Error al subir imagen
                        return res.status(400).send({ status: 'error', message: error.message });
                    case BusinessUpdateErrorType.DatabaseError:
                    case BusinessUpdateErrorType.ConcurrencyError: // Error de BD o concurrencia
                    default:
                        return res.status(500).send({ status: 'error', message: error.message || 'An internal server error occurred during update.' });
                }
            }

            // Capturar cualquier otro error inesperado
            return res.status(500).send({ status: 'error', message: 'An unexpected server error occurred.' });
        }
    }
}