// business/domain/model/Business.ts
export class Business {
    constructor(
        // IDs son string para consistencia con otras entidades y evitar conversiones constantes
        readonly id: string,
        public ownerId: string, // ID del usuario propietario
        public name: string,
        public description: string,
        public investment: number, // Usar number para cálculos
        public profitPercentage: number,
        public categoryId: number, // ID numérico de la categoría
        public municipalityId: string, // ID string del municipio
        public businessModel: string,
        public monthlyIncome: number,
        public imageUrl: string | null,
        // Campos relacionados con la interacción del usuario (podrían venir de joins o subqueries)
        public isSavedByUser?: boolean, // Opcional, depende de cómo se obtenga
        public isLikedByUser?: boolean, // Opcional
        public savedCount?: number,     // Opcional
        public likeCount?: number,      // Opcional
        // Timestamps
        readonly createdAt?: Date,
        readonly updatedAt?: Date
    ) {}
}