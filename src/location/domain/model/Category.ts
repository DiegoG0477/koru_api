export interface Category {
    id: string; // Usar string aunque la DB sea INT para consistencia
    name: string;
    iconKey: string | null; // Permitir nulo si la columna lo permite
}