// user/infrastructure/controllers/UpdateUserController.ts
import { Request, Response } from 'express';
import { UpdateUserUseCase, UpdateUserRequestData } from '../../application/use-cases/UpdateUserUseCase';
// Quitar import de UploadedFile si no se usa en otro lado

export class UpdateUserController {
    constructor(readonly updateUserUseCase: UpdateUserUseCase) {}

    async run(req: Request, res: Response): Promise<Response> {
        const userIdToUpdate = (req as any).userId;
        const textData = req.body;
        const profileImageFile = req.file || null; // <-- Acceder a req.file con multer

        if (!userIdToUpdate) {
            return res.status(401).send({ status: 'error', message: 'Authentication required.' });
        }

        if (Object.keys(textData).length === 0 && !profileImageFile) {
            return res.status(400).send({ status: 'error', message: 'No update data or profile image provided.' });
        }

        // Asegurarse que los nombres coincidan con lo que envía la app en el form-data (o JSON si no es form-data)
        const updateData: UpdateUserRequestData = {
            name: textData.firstName,
            last_name: textData.lastName,
            biography: textData.biography,
            linkedin_profile: textData.linkedinProfile,
            instagram_handle: textData.instagramHandle,
            profileImageFile: profileImageFile // Pasar el archivo de req.file
        };

        try {
            const updatedUser = await this.updateUserUseCase.run(userIdToUpdate, updateData);

            if (updatedUser) {
                 const responseUser = { // Formatear respuesta
                    userId: updatedUser.id,
                    firstName: updatedUser.name,
                    lastName: updatedUser.last_name,
                    email: updatedUser.email,
                    profileImageUrl: updatedUser.profile_image_url,
                    bio: updatedUser.biography,
                    linkedInUrl: updatedUser.linkedin_profile,
                    instagramUrl: updatedUser.instagram_handle ? `https://instagram.com/${updatedUser.instagram_handle}` : null,
                    joinDate: updatedUser.created_at?.toISOString()
                 };
                return res.status(200).send({
                    status: 'success',
                    message: 'User profile updated successfully.',
                    data: responseUser
                });
            } else {
                // Verificar si el usuario existe para diferenciar 404 de 500
                 const userExists = await this.updateUserUseCase.userRepository.getUserById(userIdToUpdate); // Acceso temporal
                if (!userExists) {
                     return res.status(404).send({ status: 'error', message: `User with ID ${userIdToUpdate} not found.` });
                } else {
                     return res.status(500).send({ status: 'error', message: 'Failed to update user profile.' });
                }
            }
        } catch (error) {
            console.error(`Error in UpdateUserController for ID ${userIdToUpdate}:`, error);
            return res.status(500).send({ status: 'error', message: 'An unexpected error occurred.' });
        }
    }
}