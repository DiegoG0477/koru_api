import { BusinessCreationData } from "./BusinessCreationData";
// Campos que se permiten actualizar (parcial)
export type BusinessUpdateData = Partial<Omit<BusinessCreationData, 'ownerId'>>;
// Omitimos ownerId porque no debería cambiarse en una actualización normal
// Se podría permitir cambiar categoryId, municipalityId si tiene sentido