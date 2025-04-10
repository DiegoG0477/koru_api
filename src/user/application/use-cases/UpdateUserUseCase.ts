// user/application/use-cases/UpdateUserUseCase.ts
import { User } from "../../domain/entities/User";
import { UserRepository, UserProfileUpdateData } from "../../domain/UserRepository";
import { IStorageService } from "../../../shared/cloudstorage/IStorageService";
//import { Express } from 'express'; // <- Importar namespace

export interface UpdateUserRequestData {
    // ... (otros campos sin cambios) ...
    name?: string | null;
    last_name?: string | null;
    biography?: string | null;
    linkedin_profile?: string | null;
    instagram_handle?: string | null;
    profileImageFile?: Express.Multer.File | null; // <-- Tipo actualizado
}

export class UpdateUserUseCase {
    constructor(
        readonly userRepository: UserRepository,
        readonly storageService: IStorageService
    ) {}

    async run(id: string, data: UpdateUserRequestData): Promise<User | null> {
        try {
            // ... (lógica de subida y actualización sin cambios, ya usa file.buffer, etc.) ...
            if (!id) {
                console.warn("UpdateUserUseCase called without ID.");
                return null;
            }

            let uploadedImageUrl: string | null | undefined = undefined;

            if (data.profileImageFile) {
                const fileName = `user_${id}_${Date.now()}`;
                uploadedImageUrl = await this.storageService.uploadFile(
                    data.profileImageFile,
                    'profile_pictures/',
                    fileName
                );
                if (!uploadedImageUrl) {
                    console.error(`Failed to upload profile image for user ${id}. Proceeding without image update.`);
                }
            }

            const dataToUpdate: UserProfileUpdateData = {};
            let hasUpdates = false;

            if (data.name !== undefined) { dataToUpdate.name = data.name; hasUpdates = true; }
            if (data.last_name !== undefined) { dataToUpdate.last_name = data.last_name; hasUpdates = true; }
            if (data.biography !== undefined) { dataToUpdate.biography = data.biography; hasUpdates = true; }
            if (data.linkedin_profile !== undefined) { dataToUpdate.linkedin_profile = data.linkedin_profile; hasUpdates = true; }
            if (data.instagram_handle !== undefined) { dataToUpdate.instagram_handle = data.instagram_handle; hasUpdates = true; }
            if (uploadedImageUrl !== undefined) {
                dataToUpdate.profile_image_url = uploadedImageUrl;
                hasUpdates = true;
            }

            if (!hasUpdates) {
                 console.warn(`UpdateUserUseCase called for ID ${id} with no actual data changes.`);
                 return await this.userRepository.getUserById(id);
            }

            const updatedUser = await this.userRepository.updateUserProfile(id, dataToUpdate);

            return updatedUser;

        } catch (error) {
            console.error(`Error in UpdateUserUseCase for ID ${id}:`, error);
            return null;
        }
    }
}