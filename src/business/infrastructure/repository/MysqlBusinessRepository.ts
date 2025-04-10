// business/infrastructure/repository/MysqlBusinessRepository.ts
import { query } from "../../../shared/database/mysqlAdapter"; // Adaptar path
import { Business } from "../../domain/model/Business";
import { BusinessCreationData } from "../../domain/model/BusinessCreationData";
import { BusinessUpdateData } from "../../domain/model/BusinessUpdateData";
import { BusinessRepository } from "../../domain/BusinessRepository";
import { BusinessUpdateError, BusinessUpdateErrorType } from "../../domain/errors/BusinessUpdateError"; // Importar errores
import { PaginatedResult } from "../../domain/model/PaginatedResult";

export class MysqlBusinessRepository implements BusinessRepository {

    // No necesita inyectar UserRepository, la info del dueño se obtiene con JOIN

    async createBusiness(data: BusinessCreationData): Promise<Business | null> {
        const sql = `INSERT INTO businesses (owner_id, name, description, investment,
                        profit_percentage, category_id, municipality_id,
                        business_model, monthly_income, image_url)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            parseInt(data.ownerId, 10), // Asegurar INT para owner_id
            data.name, data.description, data.investment,
            data.profitPercentage, data.categoryId, // Asume categoryId ya es number
            data.municipalityId, // Asume municipalityId ya es string
            data.businessModel, data.monthlyIncome, data.imageUrl
        ];
        try {
            const [result]: any = await query(sql, params);
            if (result.insertId) {
                // Devolver el negocio recién creado buscándolo por ID
                // Pasamos ownerId para el contexto inicial de isLiked/isSaved (será false)
                return this.getBusinessById(result.insertId.toString(), data.ownerId);
            }
            console.error("Business insertion failed, no insertId returned.");
            return null;
        } catch (error) {
            console.error("MySQL Error creating business:", error);
            // Devolver null para que el UseCase maneje el error
            return null;
        }
    }

    async getBusinessById(businessId: string, requestingUserId?: string): Promise<Business> { // <-- Cambiar tipo de retorno
        const numericBusinessId = parseInt(businessId, 10);
        if (isNaN(numericBusinessId)) {
             throw new BusinessUpdateError(BusinessUpdateErrorType.ValidationError, "Invalid Business ID format.");
        }

        const businessSql = `...`; // Query igual que antes

        try {
            const [businessRows]: any = await query(businessSql, [numericBusinessId]);
            if (!businessRows || businessRows.length === 0) {
                // Lanzar error Not Found (como ya hacías)
                throw new BusinessUpdateError(BusinessUpdateErrorType.NotFound, `Business with ID ${businessId} not found.`);
            }
            const row = businessRows[0];

            // --- Obtener estado Like/Save y Contadores (igual que antes) ---
            let isLiked = false; let isSaved = false; let likeCount = 0; let savedCount = 0;
            // ... (queries para like/save) ...
            try {
                 // ... (ejecutar queries de like/save) ...
                  if (requestingUserId) {
                     const numericUserId = parseInt(requestingUserId, 10);
                     if (!isNaN(numericUserId)) {
                         const userStatusSql = `...`;
                         const [[userStatus]]: any = await query(userStatusSql, [numericBusinessId, numericUserId, numericBusinessId, numericUserId]);
                         isLiked = userStatus.isLiked > 0;
                         isSaved = userStatus.isSaved > 0;
                     }
                 }
                 const countSql = `...`;
                 const [[counts]]: any = await query(countSql, [numericBusinessId, numericBusinessId]);
                 likeCount = counts.likeCount;
                 savedCount = counts.savedCount;
             } catch (countError) {
                  console.error("Error fetching like/save status:", countError);
                  // Considerar si lanzar un error aquí o continuar con contadores/estado en 0/false
                  // throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to fetch like/save status.");
             }
            // --- Fin Obtener Like/Save ---


            // Mapear y DEVOLVER el objeto Business (ya no puede ser null)
            return new Business(
                row.id.toString(), row.owner_id.toString(), row.name, row.description,
                parseFloat(row.investment), parseFloat(row.profit_percentage), row.category_id,
                row.municipality_id, row.business_model, parseFloat(row.monthly_income),
                row.image_url, isSaved, isLiked, savedCount, likeCount,
                row.created_at, row.updated_at
            );

        } catch (error) {
            if (error instanceof BusinessUpdateError) throw error; // Relanzar si ya es del tipo correcto
            console.error(`MySQL Error fetching business by ID ${businessId}:`, error);
            throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, `Database error fetching business ${businessId}.`);
        }
    }

    async updateBusiness(businessId: string, ownerId: string, data: BusinessUpdateData): Promise<Business | null> { // <-- Aquí mantenemos | null por ahora
         // ... (parseo IDs igual) ...
         const numericBusinessId = parseInt(businessId, 10);
         const numericOwnerId = parseInt(ownerId, 10);
         // ... (check isNaN igual) ...

         // 1. Verificar propiedad ANTES de actualizar
         let currentBusiness: Business; // Ahora la asignación es válida porque getBusinessById devuelve Business
         try {
             // Esta llamada ahora devuelve Business o lanza error
             currentBusiness = await this.getBusinessById(businessId, ownerId);
         } catch (error) {
             // Si getBusinessById lanza error (NotFound, DBError), lo relanzamos
             throw error;
         }
         // Si llegamos aquí, currentBusiness existe. Ahora verificamos propiedad.
         if (currentBusiness.ownerId !== ownerId) {
             throw new BusinessUpdateError(BusinessUpdateErrorType.Forbidden, `User ${ownerId} is not authorized to update business ${businessId}.`);
         }

         // 2. Construir query (igual)
         const setClauses: string[] = []; const params: any[] = [];
         // ... (llenar setClauses y params igual) ...

         if (setClauses.length === 0) {
             return currentBusiness; // No hay cambios, devolver negocio actual
         }

         const sql = `UPDATE businesses SET ${setClauses.join(", ")} WHERE id = ? AND owner_id = ?`;
         params.push(numericBusinessId, numericOwnerId);

         try {
             const [result]: any = await query(sql, params);
             if (result.affectedRows > 0) {
                 // Devolver el negocio actualizado buscándolo de nuevo (devuelve Business o lanza error)
                 return this.getBusinessById(businessId, ownerId);
             } else {
                 // Si no afectó filas, es raro, lanzar error de concurrencia
                 console.warn(`Update business ${businessId} affected 0 rows unexpectedly.`);
                 throw new BusinessUpdateError(BusinessUpdateErrorType.ConcurrencyError, `Update affected 0 rows for business ID ${businessId}.`);
             }
         } catch (error) {
              // Capturar error de la query UPDATE
             if (error instanceof BusinessUpdateError) throw error; // Si ya es específico (raro aquí)
             console.error(`MySQL Error updating business ID ${businessId}:`, error);
             throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, `Database error updating business ${businessId}.`);
         }
    }


    async deleteBusiness(businessId: string, ownerId: string): Promise<boolean> {
        const numericBusinessId = parseInt(businessId, 10);
        const numericOwnerId = parseInt(ownerId, 10);
         if (isNaN(numericBusinessId) || isNaN(numericOwnerId)) {
             console.error(`Invalid non-numeric ID passed to deleteBusiness: businessId=${businessId}, ownerId=${ownerId}`);
             // Podríamos lanzar un error aquí también si quisiéramos
             return false;
         }

         // La FK con ON DELETE CASCADE en user_liked/saved_businesses se encarga de las relaciones
         const sql = "DELETE FROM businesses WHERE id = ? AND owner_id = ?";
         try {
            const [result]: any = await query(sql, [numericBusinessId, numericOwnerId]);
            if (result.affectedRows === 0) {
                 console.warn(`Attempted to delete business ${businessId} by owner ${ownerId}, but it was not found or owner mismatch.`);
            }
            return result.affectedRows > 0;
         } catch (error) {
            console.error(`MySQL Error deleting business ID ${businessId}:`, error);
            return false; // Indicar fallo
         }
    }

    async getBusinessesByOwner(ownerId: string): Promise<Business[] | null> {
        const numericOwnerId = parseInt(ownerId, 10);
        if (isNaN(numericOwnerId)) {
             console.error(`Invalid non-numeric ownerId passed to getBusinessesByOwner: ${ownerId}`);
             return null;
        }

        // No necesitamos JOINS complejos aquí, solo los negocios básicos
        const sql = `
            SELECT *
            FROM businesses
            WHERE owner_id = ?
            ORDER BY created_at DESC`;
        try {
            const [rows]: any = await query(sql, [numericOwnerId]);
            if (!rows) return null;

            // Mapear cada fila a la entidad Business (sin estado like/save)
            const businesses = rows.map((row: any) => new Business(
                row.id.toString(),
                row.owner_id.toString(),
                row.name,
                row.description,
                parseFloat(row.investment),
                parseFloat(row.profit_percentage),
                row.category_id,
                row.municipality_id,
                row.business_model,
                parseFloat(row.monthly_income),
                row.image_url,
                undefined, undefined, undefined, undefined, // Estado like/save no aplica aquí
                row.created_at,
                row.updated_at
            ));
            return businesses;

        } catch (error) {
            console.error(`MySQL Error fetching businesses for owner ${ownerId}:`, error);
            return null;
        }
    }

    async initiatePartnership(userId: string, businessId: string): Promise<boolean> {
        const numericUserId = parseInt(userId, 10);
        const numericBusinessId = parseInt(businessId, 10);
        if (isNaN(numericUserId) || isNaN(numericBusinessId)) return false;

        const sql = "INSERT IGNORE INTO partnerships (user_id, business_id) VALUES (?, ?)";
        try {
            const [result]: any = await query(sql, [numericUserId, numericBusinessId]);
            // affectedRows será 1 si se insertó, 0 si ya existía (por INSERT IGNORE)
            return result.affectedRows >= 0; // Devolvemos true incluso si ya existía (la intención se cumplió)
        } catch (error) {
            console.error(`MySQL Error initiating partnership for user ${userId}, business ${businessId}:`, error);
            return false;
        }
    }

    async getPartneredBusinesses(userId: string): Promise<Business[] | null> {
        const numericUserId = parseInt(userId, 10);
        if (isNaN(numericUserId)) return null;

        // Obtener negocios donde el usuario está en la tabla partnerships
         const sql = `
            SELECT b.* -- Seleccionar todos los campos de business
            FROM businesses b
            JOIN partnerships p ON b.id = p.business_id
            WHERE p.user_id = ?
            ORDER BY p.initiated_at DESC`; // Ordenar por más reciente
        try {
            const [rows]: any = await query(sql, [numericUserId]);
            if (!rows) return null;
            // Mapear resultados (sin estado like/save específico aquí)
            const businesses = rows.map((row: any) => new Business(
                row.id.toString(), row.owner_id.toString(), row.name, row.description,
                parseFloat(row.investment), parseFloat(row.profit_percentage), row.category_id,
                row.municipality_id, row.business_model, parseFloat(row.monthly_income),
                row.image_url, undefined, undefined, undefined, undefined,
                row.created_at, row.updated_at
            ));
            return businesses;
        } catch (error) {
            console.error(`MySQL Error fetching partnered businesses for user ${userId}:`, error);
            return null;
        }
    }

     async getSavedBusinesses(userId: string): Promise<Business[] | null> {
         const numericUserId = parseInt(userId, 10);
         if (isNaN(numericUserId)) return null;

         const sql = `
             SELECT b.*
             FROM businesses b
             JOIN user_saved_businesses sb ON b.id = sb.business_id
             WHERE sb.user_id = ?
             ORDER BY sb.saved_at DESC`;
         try {
             const [rows]: any = await query(sql, [numericUserId]);
             if (!rows) return null;
              const businesses = rows.map((row: any) => new Business(
                 row.id.toString(), row.owner_id.toString(), row.name, row.description,
                 parseFloat(row.investment), parseFloat(row.profit_percentage), row.category_id,
                 row.municipality_id, row.business_model, parseFloat(row.monthly_income),
                 row.image_url, true, undefined, undefined, undefined, // Marcar como guardado
                 row.created_at, row.updated_at
             ));
             return businesses;
         } catch (error) {
             console.error(`MySQL Error fetching saved businesses for user ${userId}:`, error);
             return null;
         }
     }

    // --- Implementación toggleSave / toggleLike ---
    async toggleSave(userId: string, businessId: string): Promise<boolean> {
        const numericUserId = parseInt(userId, 10);
        const numericBusinessId = parseInt(businessId, 10);
        if (isNaN(numericUserId) || isNaN(numericBusinessId)) {
            throw new BusinessUpdateError(BusinessUpdateErrorType.ValidationError, "Invalid User or Business ID.");
        }

        // 1. Verificar si ya existe
        const checkSql = "SELECT COUNT(*) as count FROM user_saved_businesses WHERE user_id = ? AND business_id = ?";
        let isCurrentlySaved = false;
        try {
             const [[checkResult]]: any = await query(checkSql, [numericUserId, numericBusinessId]);
             isCurrentlySaved = checkResult.count > 0;
        } catch (error) {
             console.error("Error checking save status:", error);
             throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to check save status.");
        }

        // 2. Insertar o Eliminar
        let finalState: boolean;
        if (isCurrentlySaved) {
            // Eliminar
            const deleteSql = "DELETE FROM user_saved_businesses WHERE user_id = ? AND business_id = ?";
            try {
                const [deleteResult]: any = await query(deleteSql, [numericUserId, numericBusinessId]);
                finalState = !(deleteResult.affectedRows > 0); // Será false si se eliminó correctamente
                 if (deleteResult.affectedRows === 0) console.warn(`ToggleSave: No row found to delete for user ${userId}, business ${businessId}`);
            } catch (error) {
                console.error("Error unsaving business:", error);
                throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to unsave business.");
            }
        } else {
            // Insertar
            const insertSql = "INSERT INTO user_saved_businesses (user_id, business_id) VALUES (?, ?)";
             try {
                const [insertResult]: any = await query(insertSql, [numericUserId, numericBusinessId]);
                finalState = insertResult.affectedRows > 0; // Será true si se insertó correctamente
             } catch (error) {
                console.error("Error saving business:", error);
                throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to save business.");
             }
        }
        return finalState;
    }

     async toggleLike(userId: string, businessId: string): Promise<boolean> {
         const numericUserId = parseInt(userId, 10);
         const numericBusinessId = parseInt(businessId, 10);
         if (isNaN(numericUserId) || isNaN(numericBusinessId)) {
             throw new BusinessUpdateError(BusinessUpdateErrorType.ValidationError, "Invalid User or Business ID.");
         }
         // Lógica idéntica a toggleSave, pero con la tabla user_liked_businesses
         const checkSql = "SELECT COUNT(*) as count FROM user_liked_businesses WHERE user_id = ? AND business_id = ?";
         let isCurrentlyLiked = false;
         try {
              const [[checkResult]]: any = await query(checkSql, [numericUserId, numericBusinessId]);
              isCurrentlyLiked = checkResult.count > 0;
         } catch (error) { throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to check like status."); }

         let finalState: boolean;
         if (isCurrentlyLiked) {
             const deleteSql = "DELETE FROM user_liked_businesses WHERE user_id = ? AND business_id = ?";
             try {
                 const [deleteResult]: any = await query(deleteSql, [numericUserId, numericBusinessId]);
                 finalState = !(deleteResult.affectedRows > 0);
                 if (deleteResult.affectedRows === 0) console.warn(`ToggleLike: No row found to delete for user ${userId}, business ${businessId}`);
             } catch (error) { throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to unlike business."); }
         } else {
             const insertSql = "INSERT INTO user_liked_businesses (user_id, business_id) VALUES (?, ?)";
              try {
                 const [insertResult]: any = await query(insertSql, [numericUserId, numericBusinessId]);
                 finalState = insertResult.affectedRows > 0;
              } catch (error) { throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to like business."); }
         }
         return finalState;
     }

     async getBusinessFeed(
        filters: Record<string, any>,
        page: number,
        limit: number,
        requestingUserId?: string
    ): Promise<PaginatedResult<Business> | null> {
        const offset = (page - 1) * limit;
        const numericUserId = requestingUserId ? parseInt(requestingUserId, 10) : null;

        // Construir query base con joins necesarios para DTO y filtrado
        let sql = `
            SELECT
                b.*,
                c.name AS categoryName,
                m.name AS municipalityName,
                s.name AS stateName,
                u.id AS ownerInfo_userId,
                u.first_name AS ownerInfo_firstName,
                u.last_name AS ownerInfo_lastName,
                u.profile_image_url AS ownerInfo_profileImageUrl,
                (SELECT COUNT(*) FROM user_liked_businesses ul WHERE ul.business_id = b.id) AS likeCount,
                (SELECT COUNT(*) FROM user_saved_businesses us WHERE us.business_id = b.id) AS savedCount
                ${requestingUserId ? `,
                (SELECT COUNT(*) > 0 FROM user_liked_businesses ul_user WHERE ul_user.business_id = b.id AND ul_user.user_id = ?) AS isLikedByUser,
                (SELECT COUNT(*) > 0 FROM user_saved_businesses us_user WHERE us_user.business_id = b.id AND us_user.user_id = ?) AS isSavedByUser
                ` : ''}
            FROM businesses b
            LEFT JOIN categories c ON b.category_id = c.id
            LEFT JOIN municipalities m ON b.municipality_id = m.id
            LEFT JOIN states s ON m.state_id = s.id
            LEFT JOIN users u ON b.owner_id = u.id
        `;

        const whereClauses: string[] = [];
        const params: any[] = [];

        // Añadir filtros dinámicamente
        if (filters.category_id) {
            whereClauses.push("b.category_id = ?");
            params.push(filters.category_id);
        }
        if (filters.max_investment) {
            whereClauses.push("b.investment <= ?");
            params.push(filters.max_investment);
        }
        // Añadir filtro 'nearby' si se implementa lógica geoespacial
        // if (filters.nearby === 'true' && filters.userLat && filters.userLon) {
        //     whereClauses.push("ST_Distance_Sphere(point(b.longitude, b.latitude), point(?, ?)) <= ?");
        //     params.push(filters.userLon, filters.userLat, NEARBY_RADIUS_METERS);
        // }
         // Añadir más filtros según sea necesario...

        // Añadir parámetros para isLiked/isSaved si existen
        if (requestingUserId && !isNaN(numericUserId as number)) {
             params.push(numericUserId); // Para isLikedByUser
             params.push(numericUserId); // Para isSavedByUser
        }


        if (whereClauses.length > 0) {
            sql += ` WHERE ${whereClauses.join(" AND ")}`;
        }

        // Query para contar el total de items con los mismos filtros
        let countSql = `SELECT COUNT(*) as total FROM businesses b `;
         if (whereClauses.length > 0) {
             // Reusar JOINs si son necesarios para filtrar, si no, quitarlos del count
             // LEFT JOIN categories c ON b.category_id = c.id ... etc
             countSql += ` WHERE ${whereClauses.join(" AND ")}`;
         }


        // Añadir orden y paginación a la query principal
        sql += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        try {
             // Ejecutar ambas queries (datos y conteo) - idealmente en paralelo o transacción si es crítico
             const [[countResult]]: any = await query(countSql, params.slice(0, params.length - (requestingUserId ? 4 : 2))); // Params sin limit/offset y sin IDs de user
             const totalItems = countResult.total;

            const [rows]: any = await query(sql, params); // Query con todos los params

            if (!rows) return null; // Error de DB

             // Mapear resultados a la entidad Business
             const businesses = rows.map((row: any) => new Business(
                 row.id.toString(),
                 row.owner_id.toString(),
                 row.name,
                 row.description,
                 parseFloat(row.investment),
                 parseFloat(row.profit_percentage),
                 row.category_id,
                 row.municipality_id,
                 row.business_model,
                 parseFloat(row.monthly_income),
                 row.image_url,
                 requestingUserId ? Boolean(row.isSavedByUser) : undefined, // Mapear estado like/save
                 requestingUserId ? Boolean(row.isLikedByUser) : undefined,
                 row.savedCount,
                 row.likeCount,
                 row.created_at,
                 row.updated_at
                 // Nombres de categoría/ubicación NO van en el modelo de dominio Business
                 // Los datos del dueño (ownerInfo_*) tampoco van directamente aquí
             ));

             const hasMore = (offset + businesses.length) < totalItems;
             const nextPage = hasMore ? page + 1 : null;

             return {
                 items: businesses,
                 hasMore: hasMore,
                 nextPage: nextPage,
                 // Podrías incluir totalItems y totalPages si la app los necesita
                 // totalItems: totalItems,
                 // totalPages: Math.ceil(totalItems / limit)
             };

        } catch (error) {
            console.error("MySQL Error fetching business feed:", error);
            return null;
        }
    }
}