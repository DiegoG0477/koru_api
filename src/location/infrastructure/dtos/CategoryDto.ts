// Coincide con core/data/dto/CategoryDto.kt
export interface CategoryDto {
    id: string; // Enviar ID como string
    name: string;
    icon: string | null; // Nombre del campo 'icon' como en .kt, puede ser null
}