// auth/infrastructure/controllers/RegisterController.ts
import { Request, Response } from 'express';
import { RegisterUseCase as RegisterUserUseCase } from '../../application/use-cases/RegisterUseCase';
import { RegisterRequestDto } from '../dtos/RegisterRequestDto';

export class RegisterController {
    constructor(readonly registerUserUseCase: RegisterUserUseCase) {}

    async run(req: Request, res: Response): Promise<Response> {
        const data: RegisterRequestDto = req.body;

        // Validación básica (el Use Case también valida)
        if (!data.email || !data.password || !data.firstName || !data.lastName || !data.birthDate || !data.countryId || !data.stateId || !data.municipalityId) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }

        try {
            const authResult = await this.registerUserUseCase.run(data);

            if (authResult) {
                 // Mapea AuthResult a LoginResponseDto
                 const responseData = {
                    accessToken: authResult.accessToken,
                    refreshToken: authResult.refreshToken,
                    tokenType: authResult.tokenType,
                    expiresIn: authResult.expiresIn
                };
                return res.status(201).send({
                    status: 'success',
                    message: 'User registered successfully.',
                    data: responseData, // Devuelve el DTO de login
                });
            } else {
                return res.status(400).send({
                    status: 'error',
                    message: 'User registration failed (e.g., email already exists or invalid data).',
                });
            }
        } catch (error) {
            console.error("Error in RegisterController:", error);
            return res.status(500).send({ status: 'error', message: 'An unexpected error occurred during registration.' });
        }
    }
}