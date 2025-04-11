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
            const resultQuery: any = await query(sql, params);
            // Check if query returned a result and has insertId
             if (!resultQuery || !resultQuery[0] || resultQuery[0].insertId === undefined) {
                 console.error("Business insertion failed, query result invalid or no insertId.");
                 return null;
             }
             const result = resultQuery[0]; // Access the actual result object

            if (result.insertId) {
                // Devolver el negocio recién creado buscándolo por ID
                // Pasamos ownerId para el contexto inicial de isLiked/isSaved (será false)
                return this.getBusinessById(result.insertId.toString(), data.ownerId);
            }
            console.error("Business insertion failed, no insertId found in result.");
            return null;
        } catch (error) {
            console.error("MySQL Error creating business:", error);
            // Devolver null para que el UseCase maneje el error
            return null;
        }
    }

    // --- getBusinessById ---
    async getBusinessById(businessId: string, requestingUserId?: string): Promise<Business> {
        const numericBusinessId = parseInt(businessId, 10);
        if (isNaN(numericBusinessId)) {
            throw new BusinessUpdateError(BusinessUpdateErrorType.ValidationError, "Invalid Business ID format.");
        }

        // --- Query principal para detalles del negocio y dueño ---
        const businessSql = `
            SELECT
                b.*,
                c.name AS categoryName,
                m.name AS municipalityName,
                s.name AS stateName,
                u.id AS ownerInfo_userId,
                u.first_name AS ownerInfo_firstName,
                u.last_name AS ownerInfo_lastName,
                u.email AS ownerInfo_email,
                u.linkedin_profile AS ownerInfo_linkedin,
                u.profile_image_url AS ownerInfo_profileImageUrl
            FROM businesses b
            LEFT JOIN categories c ON b.category_id = c.id
            LEFT JOIN municipalities m ON b.municipality_id = m.id
            LEFT JOIN states s ON m.state_id = s.id
            LEFT JOIN users u ON b.owner_id = u.id
            WHERE b.id = ?
        `;

        // --- Queries separadas para contadores y estado de usuario ---
        const countSql = `
            SELECT
                (SELECT COUNT(*) FROM user_liked_businesses ul WHERE ul.business_id = ?) AS likeCount,
                (SELECT COUNT(*) FROM user_saved_businesses us WHERE us.business_id = ?) AS savedCount
        `;
        let userStatusSql = '';
        const countParams = [numericBusinessId, numericBusinessId];
        const userStatusParams: number[] = [];
        const numericUserId = requestingUserId ? parseInt(requestingUserId, 10) : NaN;

        if (!isNaN(numericUserId)) {
            userStatusSql = `
                SELECT
                    (SELECT COUNT(*) > 0 FROM user_liked_businesses ul_user WHERE ul_user.business_id = ? AND ul_user.user_id = ?) AS isLiked,
                    (SELECT COUNT(*) > 0 FROM user_saved_businesses us_user WHERE us_user.business_id = ? AND us_user.user_id = ?) AS isSaved
            `;
            userStatusParams.push(numericBusinessId, numericUserId, numericBusinessId, numericUserId);
        }

        try {
            // Ejecutar query de detalles
            const businessResult: any = await query(businessSql, [numericBusinessId]);
             if (!businessResult || !businessResult[0] || businessResult[0].length === 0) {
                throw new BusinessUpdateError(BusinessUpdateErrorType.NotFound, `Business with ID ${businessId} not found.`);
            }
            const row = businessResult[0][0]; // Acceder a la primera fila

            // Ejecutar query de contadores
             const countResult: any = await query(countSql, countParams);
             const counts = (countResult && countResult[0] && countResult[0][0]) ? countResult[0][0] : { likeCount: 0, savedCount: 0 };
             const likeCount = Number(counts.likeCount) || 0;
             const savedCount = Number(counts.savedCount) || 0;


            // Ejecutar query de estado si hay usuario
            let isLiked = false;
            let isSaved = false;
            if (userStatusSql) {
                 const userStatusResult: any = await query(userStatusSql, userStatusParams);
                 const userStatus = (userStatusResult && userStatusResult[0] && userStatusResult[0][0]) ? userStatusResult[0][0] : { isLiked: false, isSaved: false };
                isLiked = Boolean(userStatus.isLiked);
                isSaved = Boolean(userStatus.isSaved);
            }

            // Mapear y DEVOLVER el objeto Business (ya no puede ser null)
            return new Business(
                row.id.toString(),
                row.owner_id.toString(),
                row.name,
                row.description,
                parseFloat(row.investment),
                parseFloat(row.profit_percentage),
                row.category_id,
                row.municipality_id, // Mantener como viene de DB (string)
                row.business_model,
                parseFloat(row.monthly_income),
                row.image_url,
                isSaved,
                isLiked,
                savedCount,
                likeCount,
                row.created_at,
                row.updated_at
                // Nota: categoryName, locationName, ownerInfo_* no están en el modelo Business base
                // Se usan en los mappers de la capa de infraestructura (utils/DataMapper)
            );

        } catch (error) {
            if (error instanceof BusinessUpdateError) throw error; // Relanzar si ya es del tipo correcto
            console.error(`MySQL Error fetching business by ID ${businessId}:`, error);
            throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, `Database error fetching business ${businessId}.`);
        }
    }
    // --- Fin getBusinessById ---


    async updateBusiness(businessId: string, ownerId: string, data: BusinessUpdateData): Promise<Business | null> {
         const numericBusinessId = parseInt(businessId, 10);
         const numericOwnerId = parseInt(ownerId, 10);
         if (isNaN(numericBusinessId) || isNaN(numericOwnerId)) {
              throw new BusinessUpdateError(BusinessUpdateErrorType.ValidationError, "Invalid Business or Owner ID format.");
         }

         // 1. Verificar propiedad ANTES de actualizar
         let currentBusiness: Business;
         try {
             currentBusiness = await this.getBusinessById(businessId, ownerId);
         } catch (error) {
             throw error; // Relanzar si getBusinessById falla (NotFound, DBError, etc.)
         }

         if (currentBusiness.ownerId !== ownerId) {
             throw new BusinessUpdateError(BusinessUpdateErrorType.Forbidden, `User ${ownerId} is not authorized to update business ${businessId}.`);
         }

         // 2. Construir query
         const setClauses: string[] = [];
         const params: any[] = [];

        // Mapear campos de BusinessUpdateData a columnas de DB
        if (data.name !== undefined) { setClauses.push("name = ?"); params.push(data.name); }
        if (data.description !== undefined) { setClauses.push("description = ?"); params.push(data.description); }
        if (data.investment !== undefined) { setClauses.push("investment = ?"); params.push(data.investment); }
        if (data.profitPercentage !== undefined) { setClauses.push("profit_percentage = ?"); params.push(data.profitPercentage); }
        if (data.categoryId !== undefined) { setClauses.push("category_id = ?"); params.push(data.categoryId); }
        if (data.municipalityId !== undefined) { setClauses.push("municipality_id = ?"); params.push(data.municipalityId); } // Asume string
        if (data.businessModel !== undefined) { setClauses.push("business_model = ?"); params.push(data.businessModel); }
        if (data.monthlyIncome !== undefined) { setClauses.push("monthly_income = ?"); params.push(data.monthlyIncome); }
        if (data.imageUrl !== undefined) { setClauses.push("image_url = ?"); params.push(data.imageUrl); } // Permitir null para borrar

         if (setClauses.length === 0) {
             console.warn(`UpdateBusiness called for ID ${businessId} with no data changes.`);
             return currentBusiness; // No hay cambios, devolver negocio actual
         }

         // Añadir timestamp de actualización
         setClauses.push("updated_at = CURRENT_TIMESTAMP");

         const sql = `UPDATE businesses SET ${setClauses.join(", ")} WHERE id = ? AND owner_id = ?`;
         params.push(numericBusinessId, numericOwnerId); // Añadir IDs al final

         try {
             const resultQuery: any = await query(sql, params);
             const result = resultQuery ? resultQuery[0] : null;

             if (result && result.affectedRows > 0) {
                 // Devolver el negocio actualizado buscándolo de nuevo
                 return this.getBusinessById(businessId, ownerId);
             } else {
                 // Podría ser que no se encontró (raro después del check) o no hubo cambios reales
                 console.warn(`Update business ${businessId} affected 0 rows. Maybe no actual changes or concurrency issue.`);
                 // Devolver el negocio sin cambios si no afectó filas pero no hubo error
                 if(result && result.affectedRows === 0) return currentBusiness;
                 // Lanzar error si el resultado es inesperado o nulo
                 throw new BusinessUpdateError(BusinessUpdateErrorType.ConcurrencyError, `Update affected 0 rows unexpectedly for business ID ${businessId}.`);
             }
         } catch (error) {
             if (error instanceof BusinessUpdateError) throw error;
             console.error(`MySQL Error updating business ID ${businessId}:`, error);
             throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, `Database error updating business ${businessId}.`);
         }
    }


    async deleteBusiness(businessId: string, ownerId: string): Promise<boolean> {
        const numericBusinessId = parseInt(businessId, 10);
        const numericOwnerId = parseInt(ownerId, 10);
         if (isNaN(numericBusinessId) || isNaN(numericOwnerId)) {
             console.error(`Invalid non-numeric ID passed to deleteBusiness: businessId=${businessId}, ownerId=${ownerId}`);
             return false;
         }

         const sql = "DELETE FROM businesses WHERE id = ? AND owner_id = ?";
         try {
            const resultQuery: any = await query(sql, [numericBusinessId, numericOwnerId]);
             const result = resultQuery ? resultQuery[0] : null;
            if (!result) {
                 console.error(`MySQL query for delete business ID ${businessId} returned null.`);
                 return false;
             }
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

        const sql = `
            SELECT *
            FROM businesses
            WHERE owner_id = ?
            ORDER BY created_at DESC`;
        try {
            const resultQuery: any = await query(sql, [numericOwnerId]);
             if (!resultQuery || !resultQuery[0]) {
                 console.error(`MySQL query for getBusinessesByOwner for owner ${ownerId} returned null or no rows array.`);
                 return []; // Devuelve array vacío en lugar de null si no hay negocios
             }
             const rows = resultQuery[0];

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
            return null; // Fallo de BD sí devuelve null
        }
    }

    async initiatePartnership(userId: string, businessId: string): Promise<boolean> {
        const numericUserId = parseInt(userId, 10);
        const numericBusinessId = parseInt(businessId, 10);
        if (isNaN(numericUserId) || isNaN(numericBusinessId)) return false;

        const sql = "INSERT IGNORE INTO partnerships (user_id, business_id) VALUES (?, ?)";
        try {
            const resultQuery: any = await query(sql, [numericUserId, numericBusinessId]);
             const result = resultQuery ? resultQuery[0] : null;
             if (!result) {
                 console.error(`MySQL query for initiatePartnership for user ${userId}, business ${businessId} returned null.`);
                 return false;
             }
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

         const sql = `
            SELECT b.*
            FROM businesses b
            JOIN partnerships p ON b.id = p.business_id
            WHERE p.user_id = ?
            ORDER BY p.initiated_at DESC`;
        try {
            const resultQuery: any = await query(sql, [numericUserId]);
            if (!resultQuery || !resultQuery[0]) {
                 console.error(`MySQL query for getPartneredBusinesses for user ${userId} returned null or no rows array.`);
                 return []; // Devolver vacío si no hay resultados
             }
             const rows = resultQuery[0];
            // Mapear resultados
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
            const resultQuery: any = await query(sql, [numericUserId]);
            if (!resultQuery || !resultQuery[0]) {
                 console.error(`MySQL query for getSavedBusinesses for user ${userId} returned null or no rows array.`);
                 return []; // Devolver vacío si no hay resultados
             }
             const rows = resultQuery[0];
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

        const checkSql = "SELECT COUNT(*) as count FROM user_saved_businesses WHERE user_id = ? AND business_id = ?";
        let isCurrentlySaved = false;
        try {
             const resultQuery: any = await query(checkSql, [numericUserId, numericBusinessId]);
             const checkResult = resultQuery && resultQuery[0] ? resultQuery[0][0] : null; // Obtener la primera fila
             if (!checkResult) throw new Error("Failed to check save status, query returned null or invalid.");
             isCurrentlySaved = checkResult.count > 0;
        } catch (error) {
             console.error("Error checking save status:", error);
             throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to check save status.");
        }

        let finalState: boolean;
        if (isCurrentlySaved) {
            const deleteSql = "DELETE FROM user_saved_businesses WHERE user_id = ? AND business_id = ?";
            try {
                const resultQuery: any = await query(deleteSql, [numericUserId, numericBusinessId]);
                 const deleteResult = resultQuery ? resultQuery[0] : null;
                 if (!deleteResult) throw new Error("Delete operation failed, query returned null.");
                finalState = !(deleteResult.affectedRows > 0);
                 if (deleteResult.affectedRows === 0) console.warn(`ToggleSave: No row found to delete for user ${userId}, business ${businessId}`);
            } catch (error) {
                console.error("Error unsaving business:", error);
                throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to unsave business.");
            }
        } else {
            const insertSql = "INSERT INTO user_saved_businesses (user_id, business_id) VALUES (?, ?)";
             try {
                const resultQuery: any = await query(insertSql, [numericUserId, numericBusinessId]);
                 const insertResult = resultQuery ? resultQuery[0] : null;
                 if (!insertResult) throw new Error("Insert operation failed, query returned null.");
                finalState = insertResult.affectedRows > 0;
             } catch (error) {
                console.error("Error saving business:", error);
                 // Podrías verificar si es error de FK por negocio no existente
                 // if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                 //     throw new BusinessUpdateError(BusinessUpdateErrorType.NotFound, "Business not found when trying to save.");
                 // }
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
         const checkSql = "SELECT COUNT(*) as count FROM user_liked_businesses WHERE user_id = ? AND business_id = ?";
         let isCurrentlyLiked = false;
         try {
             const resultQuery: any = await query(checkSql, [numericUserId, numericBusinessId]);
             const checkResult = resultQuery && resultQuery[0] ? resultQuery[0][0] : null;
              if (!checkResult) throw new Error("Failed to check like status, query returned null or invalid.");
              isCurrentlyLiked = checkResult.count > 0;
         } catch (error) { throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to check like status."); }

         let finalState: boolean;
         if (isCurrentlyLiked) {
             const deleteSql = "DELETE FROM user_liked_businesses WHERE user_id = ? AND business_id = ?";
             try {
                 const resultQuery: any = await query(deleteSql, [numericUserId, numericBusinessId]);
                  const deleteResult = resultQuery ? resultQuery[0] : null;
                  if (!deleteResult) throw new Error("Unlike operation failed, query returned null.");
                 finalState = !(deleteResult.affectedRows > 0);
                 if (deleteResult.affectedRows === 0) console.warn(`ToggleLike: No row found to delete for user ${userId}, business ${businessId}`);
             } catch (error) { throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to unlike business."); }
         } else {
             const insertSql = "INSERT INTO user_liked_businesses (user_id, business_id) VALUES (?, ?)";
              try {
                 const resultQuery: any = await query(insertSql, [numericUserId, numericBusinessId]);
                  const insertResult = resultQuery ? resultQuery[0] : null;
                  if (!insertResult) throw new Error("Like operation failed, query returned null.");
                 finalState = insertResult.affectedRows > 0;
              } catch (error) {
                 // if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                 //     throw new BusinessUpdateError(BusinessUpdateErrorType.NotFound, "Business not found when trying to like.");
                 // }
                 throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Failed to like business.");
              }
         }
         return finalState;
     }

     async getBusinessFeed(
        filters: Record<string, any>, // Parameter kept for signature, but not used for filtering
        page: number,              // Parameter kept for signature, but not used for offsetting
        limit: number,             // Parameter kept for signature, but not used for limiting results
        requestingUserId?: string
    ): Promise<PaginatedResult<Business> | null> {
        // offset is declared but will not be used in the main query
        //const offset = (page - 1) * limit;
        const numericUserId = requestingUserId ? parseInt(requestingUserId, 10) : NaN;

        // --- Construcción de Cláusulas WHERE y Parámetros de Filtro (INTENTIONALLY EMPTY) ---
        const whereClauses: string[] = []; // Kept empty to fetch all
        const filterParams: any[] = [];    // Kept empty as no filters are applied

        // --- Filter application logic is SKIPPED ---
        // if (filters.category_id) { ... } // Skipped
        // if (filters.max_investment) { ... } // Skipped

        // whereSql will be an empty string as whereClauses is empty
        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

        // --- Query de Conteo (Counts ALL businesses as whereSql is empty) ---
        // JOINs are kept as in the original structure, though might be redundant without filters
        let countSql = `
            SELECT COUNT(b.id) as total
            FROM businesses b
            LEFT JOIN categories c ON b.category_id = c.id
            LEFT JOIN municipalities m ON b.municipality_id = m.id
            LEFT JOIN states s ON m.state_id = s.id
            -- ${whereSql} will be empty here --
        `;

        // --- Query Principal (Fetches ALL businesses, ignores pagination) ---
        let mainSql = `
            SELECT
                b.*,
                c.name AS categoryName,
                m.name AS municipalityName,
                s.name AS stateName,
                u.id AS ownerInfo_userId,
                u.first_name AS ownerInfo_firstName,
                u.last_name AS ownerInfo_lastName,
                u.profile_image_url AS ownerInfo_profileImageUrl,
                COALESCE((SELECT COUNT(*) FROM user_liked_businesses ul WHERE ul.business_id = b.id), 0) AS likeCount,
                COALESCE((SELECT COUNT(*) FROM user_saved_businesses us WHERE us.business_id = b.id), 0) AS savedCount
                ${!isNaN(numericUserId) ? `,
                (SELECT COUNT(*) > 0 FROM user_liked_businesses ul_user WHERE ul_user.business_id = b.id AND ul_user.user_id = ?) AS isLikedByUser,
                (SELECT COUNT(*) > 0 FROM user_saved_businesses us_user WHERE us_user.business_id = b.id AND us_user.user_id = ?) AS isSavedByUser
                ` : ''}
            FROM businesses b
            LEFT JOIN categories c ON b.category_id = c.id
            LEFT JOIN municipalities m ON b.municipality_id = m.id
            LEFT JOIN states s ON m.state_id = s.id
            LEFT JOIN users u ON b.owner_id = u.id
            -- ${whereSql} will be empty here --
            ORDER BY b.created_at DESC
            -- LIMIT ? OFFSET ? is REMOVED to fetch all --
        `;

        // --- Construcción de Parámetros para Query Principal (Only UserID if needed) ---
        const mainQueryParams: any[] = [];
        if (!isNaN(numericUserId)) {
            mainQueryParams.push(numericUserId); // For isLikedByUser
            mainQueryParams.push(numericUserId); // For isSavedByUser
        }
        // --- Filter and Pagination params are NOT added ---
        // mainQueryParams.push(...filterParams); // Skipped
        // mainQueryParams.push(limit, offset);   // Skipped

        try {
            // Ejecutar query de conteo (filterParams is empty, counts all)
            const countResultQuery: any = await query(countSql, filterParams); // filterParams is []
            const countResult = countResultQuery?.[0]?.[0];
            if (!countResult || countResult.total === undefined) {
                // Use specific error type
                console.error("Count query failed or returned invalid structure:", countResultQuery);
                throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Count query failed or returned invalid structure.");
            }
            const totalItems = Number(countResult.total) || 0;

            // Si no hay items, devolver resultado vacío inmediatamente
            if (totalItems === 0) {
                // Return structure matching PaginatedResult
                return { items: [], hasMore: false, nextPage: null, totalItems: 0, totalPages: 0 };
            }

            // Ejecutar query principal (mainQueryParams only has userIds if applicable)
            const mainResultQuery: any = await query(mainSql, mainQueryParams);
            if (!mainResultQuery || !Array.isArray(mainResultQuery[0])) {
                 console.warn("Main feed query returned null or no rows array despite count > 0.");
                 // Use specific error type
                 throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Main feed query failed or returned no rows unexpectedly.");
            }
            const rows = mainResultQuery[0];

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
                requestingUserId ? Boolean(row.isSavedByUser) : undefined,
                requestingUserId ? Boolean(row.isLikedByUser) : undefined,
                Number(row.savedCount) || 0,
                Number(row.likeCount) || 0,
                row.created_at,
                row.updated_at
                // Pass joined data if the Business entity needs it
                // ...
            ));

            // --- Calculate pagination fields based on ALL results being fetched ---
            // Since we fetched all items, hasMore is always false, nextPage is null,
            // and totalPages is 1 (if items exist).
            const totalPages = totalItems > 0 ? 1 : 0; // Only one page containing all items
            const hasMore = false; // No more pages after this one
            const nextPage = null;  // No next page number

            // Return the PaginatedResult containing all businesses
            const result: PaginatedResult<Business> = {
                items: businesses,
                totalItems: totalItems, // Total count from the count query
                totalPages: totalPages,
                hasMore: hasMore,
                nextPage: nextPage,
                // Optional: include page/limit if your type requires it,
                // setting them to reflect the "single page" nature
                // page: 1,
                // limit: totalItems > 0 ? totalItems : limit // or just use the input limit
            };

            return result;

        } catch (error) {
            // Catch specific known errors first
            if (error instanceof BusinessUpdateError) {
                 throw error;
            }
            // Log generic errors and throw a typed error
            console.error("MySQL Error fetching business feed (all items mode):", error);
            throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Database error fetching business feed.");
            // return null; // Avoid returning null for database errors
        }
    }
}
    //     const offset = (page - 1) * limit;
    //     const numericUserId = requestingUserId ? parseInt(requestingUserId, 10) : NaN;

    //     // --- Construcción de Cláusulas WHERE y Parámetros de Filtro ---
    //     const whereClauses: string[] = [];
    //     const filterParams: any[] = []; // Solo para los filtros del WHERE

    //     if (filters.category_id) {
    //         whereClauses.push("b.category_id = ?");
    //         filterParams.push(filters.category_id);
    //     }
    //     if (filters.max_investment) {
    //         whereClauses.push("b.investment <= ?");
    //         filterParams.push(filters.max_investment);
    //     }
    //     // if (filters.nearby === true && ...) { ... }
    //     // ... otros filtros ...

    //     const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    //     // --- Query de Conteo ---
    //     // Usar los mismos JOINs que la query principal si los filtros dependen de ellos
    //     let countSql = `
    //         SELECT COUNT(b.id) as total
    //         FROM businesses b
    //         LEFT JOIN categories c ON b.category_id = c.id
    //         LEFT JOIN municipalities m ON b.municipality_id = m.id
    //         LEFT JOIN states s ON m.state_id = s.id
    //         ${whereSql}
    //     `;

    //     // --- Query Principal ---
    //     let mainSql = `
    //         SELECT
    //             b.*,
    //             c.name AS categoryName,
    //             m.name AS municipalityName,
    //             s.name AS stateName,
    //             u.id AS ownerInfo_userId,
    //             u.first_name AS ownerInfo_firstName,
    //             u.last_name AS ownerInfo_lastName,
    //             u.profile_image_url AS ownerInfo_profileImageUrl,
    //             COALESCE((SELECT COUNT(*) FROM user_liked_businesses ul WHERE ul.business_id = b.id), 0) AS likeCount,
    //             COALESCE((SELECT COUNT(*) FROM user_saved_businesses us WHERE us.business_id = b.id), 0) AS savedCount
    //             ${!isNaN(numericUserId) ? `,
    //             (SELECT COUNT(*) > 0 FROM user_liked_businesses ul_user WHERE ul_user.business_id = b.id AND ul_user.user_id = ?) AS isLikedByUser,
    //             (SELECT COUNT(*) > 0 FROM user_saved_businesses us_user WHERE us_user.business_id = b.id AND us_user.user_id = ?) AS isSavedByUser
    //             ` : ''}
    //         FROM businesses b
    //         LEFT JOIN categories c ON b.category_id = c.id
    //         LEFT JOIN municipalities m ON b.municipality_id = m.id
    //         LEFT JOIN states s ON m.state_id = s.id
    //         LEFT JOIN users u ON b.owner_id = u.id
    //         ${whereSql}
    //         ORDER BY b.created_at DESC
    //         LIMIT ? OFFSET ?
    //     `;

    //     // --- Construcción de Parámetros para Query Principal ---
    //     const mainQueryParams: any[] = [];
    //     if (!isNaN(numericUserId)) {
    //         mainQueryParams.push(numericUserId); // Para isLikedByUser
    //         mainQueryParams.push(numericUserId); // Para isSavedByUser
    //     }
    //     mainQueryParams.push(...filterParams); // Añadir parámetros de filtro
    //     mainQueryParams.push(limit, offset);   // Añadir paginación

    //     try {
    //         // Ejecutar query de conteo (solo con parámetros de filtro)
    //         const countResultQuery: any = await query(countSql, filterParams); // <-- CORRECTO
    //         const countResult = countResultQuery?.[0]?.[0];
    //         if (!countResult || countResult.total === undefined) {
    //             throw new Error("Count query failed or returned invalid structure.");
    //         }
    //         const totalItems = Number(countResult.total) || 0;

    //         // Si no hay items, devolver resultado vacío inmediatamente
    //         if (totalItems === 0) {
    //             return { items: [], hasMore: false, nextPage: null, totalItems: 0, totalPages: 0 };
    //         }

    //         // Ejecutar query principal (con todos los parámetros ordenados)
    //         const mainResultQuery: any = await query(mainSql, mainQueryParams); // <-- CORRECTO
    //         if (!mainResultQuery || !mainResultQuery[0]) {
    //              console.warn("Main feed query returned null or no rows array despite count > 0.");
    //              // Considerar esto un error si el conteo fue > 0
    //              throw new Error("Main feed query failed or returned no rows unexpectedly.");
    //         }
    //         const rows = mainResultQuery[0];

    //         // Mapear resultados a la entidad Business
    //         const businesses = rows.map((row: any) => new Business(
    //             row.id.toString(),
    //             row.owner_id.toString(),
    //             row.name,
    //             row.description,
    //             parseFloat(row.investment),
    //             parseFloat(row.profit_percentage),
    //             row.category_id,
    //             row.municipality_id,
    //             row.business_model,
    //             parseFloat(row.monthly_income),
    //             row.image_url,
    //             // Usar COALESCE o similar en SQL es más robusto que depender de que el campo exista en JS
    //             requestingUserId ? Boolean(row.isSavedByUser) : undefined, // isSavedByUser puede no existir si no hay userId
    //             requestingUserId ? Boolean(row.isLikedByUser) : undefined, // isLikedByUser puede no existir si no hay userId
    //             Number(row.savedCount) || 0,
    //             Number(row.likeCount) || 0,
    //             row.created_at,
    //             row.updated_at
    //         ));

    //         const hasMore = (offset + businesses.length) < totalItems;
    //         const nextPage = hasMore ? page + 1 : null;

    //         return {
    //             items: businesses,
    //             hasMore: hasMore,
    //             nextPage: nextPage,
    //             totalItems: totalItems,
    //             totalPages: Math.ceil(totalItems / limit)
    //         };

    //     } catch (error) {
    //         if (error instanceof BusinessUpdateError) throw error;
    //         console.error("MySQL Error fetching business feed:", error);
    //         // Lanzar un error genérico de base de datos en lugar de retornar null directamente
    //         throw new BusinessUpdateError(BusinessUpdateErrorType.DatabaseError, "Database error fetching business feed.");
    //         // return null; // Evitar devolver null aquí, dejar que el UseCase/Controller maneje la excepción
    //     }
    // }