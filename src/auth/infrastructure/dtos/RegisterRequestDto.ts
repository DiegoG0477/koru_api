// auth/infrastructure/dtos/RegisterRequestDto.ts
export interface RegisterRequestDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: string; // "YYYY-MM-DD"
    countryId: string;
    stateId: string;
    municipalityId: string;
}