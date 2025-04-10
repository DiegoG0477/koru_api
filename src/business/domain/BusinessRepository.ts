import { Business } from "./model/Business";
import { BusinessCreationData } from "./model/BusinessCreationData";
import { BusinessUpdateData } from "./model/BusinessUpdateData";
import { PaginatedResult } from "./model/PaginatedResult";

export interface BusinessRepository {
    /**
     * Crea un nuevo negocio en la base de datos.
     * @param data Los datos para crear el negocio.
     * @returns El negocio creado o null si falla.
     */
    createBusiness(data: BusinessCreationData): Promise<Business | null>;

    /**
     * Obtiene los detalles completos de un negocio por su ID.
     * Incluye información del dueño y potencialmente estado de like/save para un usuario específico.
     * @param businessId ID del negocio.
     * @param requestingUserId (Opcional) ID del usuario que realiza la petición (para isLiked/isSaved).
     * @returns El negocio o null si no se encuentra.
     */
    getBusinessById(businessId: string, requestingUserId?: string): Promise<Business>;

    /**
     * Actualiza un negocio existente.
     * @param businessId ID del negocio a actualizar.
     * @param ownerId ID del dueño que intenta actualizar (para autorización).
     * @param data Los campos a actualizar.
     * @returns El negocio actualizado o null si no se encuentra, no autorizado, o falla.
     */
    updateBusiness(businessId: string, ownerId: string, data: BusinessUpdateData): Promise<Business | null>;

    /**
     * Elimina un negocio.
     * @param businessId ID del negocio a eliminar.
     * @param ownerId ID del dueño que intenta eliminar (para autorización).
     * @returns true si se eliminó, false si no se encontró o no autorizado.
     */
    deleteBusiness(businessId: string, ownerId: string): Promise<boolean>;

    /**
     * Obtiene una lista de negocios que pertenecen a un usuario específico.
     * @param ownerId ID del usuario propietario.
     * @returns Lista de negocios o null si hay error.
     */
    getBusinessesByOwner(ownerId: string): Promise<Business[] | null>;

    initiatePartnership(userId: string, businessId: string): Promise<boolean>; // <-- NUEVO

    /**
     * Obtiene los negocios con los que un usuario se ha asociado (mostró interés).
     * @param userId ID del usuario.
     * @returns Lista de negocios o null si hay error.
     */
    getPartneredBusinesses(userId: string): Promise<Business[] | null>; // <-- NUEVO (para "Mis Negocios")

    /**
     * Obtiene los negocios guardados por un usuario.
     * @param userId ID del usuario.
     * @returns Lista de negocios o null si hay error.
     */
    getSavedBusinesses(userId: string): Promise<Business[] | null>; // <-- NUEVO (para "Mis Negocios")


    // --- Métodos para Likes/Saves (NECESARIOS PARA HOME) ---
     /**
      * Alterna el estado "guardado" de un negocio para un usuario.
      * @returns El nuevo estado (true si ahora está guardado, false si no). Lanza error si falla.
      */
     toggleSave(userId: string, businessId: string): Promise<boolean>;

     /**
      * Alterna el estado "like" de un negocio para un usuario.
      * @returns El nuevo estado (true si ahora tiene like, false si no). Lanza error si falla.
      */
     toggleLike(userId: string, businessId: string): Promise<boolean>;

     getBusinessFeed(
        filters: Record<string, any>,
        page: number,
        limit: number,
        requestingUserId?: string
    ): Promise<PaginatedResult<Business> | null>;
}