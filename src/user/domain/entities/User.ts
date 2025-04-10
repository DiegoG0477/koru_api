// user/domain/entities/User.ts
export class User {
    constructor(
        readonly id: string,
        readonly email: string,
        // Quitamos password hash del modelo de dominio User, se maneja en Auth
        // readonly password?: string, // No necesario aquí
        public name: string | null, // Hacerlos 'public' si UpdateUseCase los modifica directamente
        public last_name: string | null, // o mantenerlos readonly y que el repo devuelva nueva instancia
        readonly birth_date: Date | null, // Usar Date si la DB devuelve Date
        readonly country_id: string | null,
        readonly state_id: string | null,
        readonly municipality_id: string | null,
        public profile_image_url: string | null,
        public biography: string | null,
        public linkedin_profile: string | null, // Guardar URL completa o handle? Decidamos URL
        public instagram_handle: string | null, // Guardar solo el handle
        readonly created_at?: Date,
        readonly updated_at?: Date
    ) {}
}