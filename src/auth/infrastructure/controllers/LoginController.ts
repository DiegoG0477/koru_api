// auth/infrastructure/controllers/LoginController.ts
import { Request, Response } from "express";
import { LoginUseCase  as LoginUserUseCase } from "../../application/use-cases/LoginUseCase";

export class LoginController {
    constructor(private loginUserUseCase: LoginUserUseCase) {}

    async run(req: Request, res: Response): Promise<Response> {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: "error", message: "Email and password are required" });
        }

        try {
            const authResult = await this.loginUserUseCase.run(email, password);

            if (authResult) {
                // Mapea AuthResult a LoginResponseDto (en este caso son idénticos)
                const responseData = {
                    accessToken: authResult.accessToken,
                    refreshToken: authResult.refreshToken,
                    tokenType: authResult.tokenType,
                    expiresIn: authResult.expiresIn
                };
                return res.status(200).json({
                    status: "success",
                    message: "User logged in successfully",
                    data: responseData, // Devolver el DTO
                });
            } else {
                return res.status(401).json({ status: "error", message: "Invalid credentials or user not found" });
            }
        } catch (error) {
            console.error("Error in LoginController:", error);
            return res.status(500).json({ status: "error", message: "An unexpected error occurred during login" });
        }
    }
}