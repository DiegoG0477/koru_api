// user/infrastructure/adapters/MysqlUserRepository.ts
import { query } from "../../../shared/database/mysqlAdapter";
import { User } from "../../domain/entities/User";
import { UserRepository, UserProfileUpdateData } from "../../domain/UserRepository";

export class MysqlUserRepository implements UserRepository {

    // --- IMPLEMENTACIÓN MÉTODOS AUXILIARES PARA AUTH ---
    async getUserPasswordHashByEmail(email: string): Promise<string | null> {
        // ... (sin cambios)
        const sql = "SELECT password FROM users WHERE email = ?";
        try {
            const [rows]: any = await query(sql, [email]);
            return (rows && rows.length > 0) ? rows[0].password : null;
        } catch (error) {
            console.error("Error fetching password hash:", error);
            return null;
        }
    }

    async createUser(
        basicUserData: Pick<User, 'email' | 'name' | 'last_name'>, // <-- Sin password
        hashedPassword: string, // <-- Recibe hash como parámetro
        details: { birthDate: string, countryId: string, stateId: string, municipalityId: string }
    ): Promise<Omit<User, 'password'> | null> { // <-- Omit ya no es estrictamente necesario pero no daña
        const sql = `INSERT INTO users(
                        email, password, first_name, last_name,
                        birth_date, country_id, state_id, municipality_id
                     ) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            basicUserData.email, hashedPassword, // <-- Usar el hash recibido
            basicUserData.name, basicUserData.last_name,
            details.birthDate, details.countryId, details.stateId, details.municipalityId
        ];
        try {
            const [result]: any = await query(sql, params);
            if (result.insertId) {
                // Devolver el objeto sin el password hash
                // Mapear a la estructura Omit<User, 'password'> (o User si lo prefieres)
                return {
                    id: result.insertId.toString(),
                    email: basicUserData.email,
                    name: basicUserData.name,
                    last_name: basicUserData.last_name,
                    birth_date: new Date(details.birthDate), // Convertir string a Date
                    country_id: details.countryId,
                    state_id: details.stateId,
                    municipality_id: details.municipalityId,
                    profile_image_url: null,
                    biography: null,
                    linkedin_profile: null,
                    instagram_handle: null,
                    // created_at y updated_at no se devuelven aquí, se obtienen con GET
                };
            }
            return null;
        } catch (error: any) {
            console.error("Error in createUser:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                console.error(`Duplicate email entry attempt: ${basicUserData.email}`);
            }
            return null;
        }
    }
    // --- FIN MÉTODOS AUXILIARES ---


    // --- MÉTODOS PÚBLICOS DE USER REPOSITORY (GET/UPDATE) ---
    async getUserByEmail(email: string): Promise<User | null> {
         const sql = `SELECT id, email, first_name, last_name, birth_date,
                             country_id, state_id, municipality_id, profile_image_url,
                             biography, linkedin_profile, instagram_handle, created_at, updated_at
                      FROM users WHERE email = ?`;
        try {
            const [rows]: any = await query(sql, [email]);
            if (rows && rows.length > 0) {
                return this.mapRowToUser(rows[0]);
            }
            return null;
        } catch (error) {
            console.error("Error in getUserByEmail:", error);
            return null;
        }
    }

    async getUserById(id: string): Promise<User | null> {
         const sql = `SELECT id, email, first_name, last_name, birth_date,
                            country_id, state_id, municipality_id, profile_image_url,
                            biography, linkedin_profile, instagram_handle, created_at, updated_at
                      FROM users WHERE id = ?`;
         try {
             const [rows]: any = await query(sql, [id]);
             if (rows && rows.length > 0) {
                 return this.mapRowToUser(rows[0]);
             }
             return null;
         } catch (error) {
             console.error("Error in getUserById:", error);
             return null;
         }
    }

    async updateUserProfile(id: string, data: UserProfileUpdateData): Promise<User | null> {
        // ... (implementación sin cambios)
         const setClauses: string[] = [];
         const params: any[] = [];
         if (data.name !== undefined) { setClauses.push("first_name = ?"); params.push(data.name); }
         if (data.last_name !== undefined) { setClauses.push("last_name = ?"); params.push(data.last_name); }
         if (data.profile_image_url !== undefined) { setClauses.push("profile_image_url = ?"); params.push(data.profile_image_url); }
         if (data.biography !== undefined) { setClauses.push("biography = ?"); params.push(data.biography); }
         if (data.linkedin_profile !== undefined) { setClauses.push("linkedin_profile = ?"); params.push(data.linkedin_profile); }
         if (data.instagram_handle !== undefined) { setClauses.push("instagram_handle = ?"); params.push(data.instagram_handle); }

         if (setClauses.length === 0) {
              return this.getUserById(id);
         }
         const sql = `UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`;
         params.push(id);
         try {
             const [result]: any = await query(sql, params);
             if (result.affectedRows > 0) {
                 return await this.getUserById(id);
             } else {
                 console.warn(`Update user profile ID ${id} found no matching row.`);
                 return null;
             }
         } catch (error) {
             console.error(`Error in updateUserProfile for ID ${id}:`, error);
             return null;
         }
    }

    // Helper para mapear (sin cambios)
    private mapRowToUser(row: any): User {
         return new User(
             row.id.toString(), row.email, row.first_name, row.last_name, row.birth_date,
             row.country_id, row.state_id, row.municipality_id, row.profile_image_url,
             row.biography, row.linkedin_profile, row.instagram_handle, row.created_at, row.updated_at
         );
    }
}