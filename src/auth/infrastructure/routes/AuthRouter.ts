import express from "express";
// Importar los controladores desde las dependencias de AUTH
import { loginController, registerController } from "../auth.dependencies";

const authRouter = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario.
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve tokens.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponseDto' # Referencia al esquema DTO
 *       400:
 *         description: Faltan campos requeridos.
 *       401:
 *         description: Credenciales inválidas o usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
authRouter.post("/login", (req, res) => loginController.run(req, res));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequestDto' # Referencia al esquema DTO
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente, devuelve tokens (auto-login).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponseDto' # Devuelve lo mismo que login
 *       400:
 *         description: Datos inválidos, campos faltantes o email ya existe.
 *       500:
 *         description: Error interno del servidor.
 */
authRouter.post("/register", (req, res) => registerController.run(req, res));

// --- Componentes de Esquema para Swagger (poner en un archivo separado o al final) ---
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginResponseDto:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Token JWT de acceso.
 *         refreshToken:
 *           type: string
 *           nullable: true
 *           description: Token JWT de refresco (opcional).
 *         tokenType:
 *           type: string
 *           example: Bearer
 *           description: Tipo de token.
 *         expiresIn:
 *           type: integer
 *           format: int32
 *           description: Duración del token de acceso en segundos.
 *     RegisterRequestDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *         - birthDate
 *         - countryId
 *         - stateId
 *         - municipalityId
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Fecha en formato YYYY-MM-DD.
 *         countryId:
 *           type: string
 *           description: ID o código del país.
 *         stateId:
 *           type: string
 *           description: ID o código del estado/provincia.
 *         municipalityId:
 *           type: string
 *           description: ID o código del municipio/ciudad.
 */

export { authRouter };