// auth/infrastructure/dtos/LoginResponseDto.ts
export interface LoginResponseDto {
    accessToken: string;
    refreshToken?: string | null;
    tokenType: string;
    expiresIn: number; // Segundos
}