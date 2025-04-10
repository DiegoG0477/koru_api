import dotenv from "dotenv";
dotenv.config(); // <-- ¡MUÉVELO AQUÍ! Al principio del todo

import express from "express";
import morgan from "morgan";
import { Signale } from "signale";
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// --- BLOQUE DE INICIALIZACIÓN DE FIREBASE ---
try {
    // Ahora process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH debería estar definido
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
    if (!serviceAccountPath) {
        // Este error ya no debería ocurrir si la variable está en .env
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable not set, even after dotenv.config(). Check .env file.');
    }

    // OJO: Usar require() dentro de un try/catch puede ser menos ideal en TS.
    // Considera leer el archivo de forma asíncrona si es posible,
    // pero para la inicialización síncrona está bien.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require(serviceAccountPath) as ServiceAccount;

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Asegúrate de que FIREBASE_STORAGE_BUCKET también esté en tu .env si lo necesitas
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
}
// --- FIN BLOQUE FIREBASE ---

import { userRouter } from "./user/infrastructure/routes/UserRouter";
import { authRouter } from "./auth/infrastructure/routes/AuthRouter";
import { businessRouter } from "./business/infrastructure/routes/BusinessRouter";
import { locationRouter } from "./location/infrastructure/routes/LocationRouter";

// dotenv.config(); // <--- Quita la línea de aquí

const PORT = process.env.SERVER_PORT ?? 8080;

const app = express();
const signale = new Signale();

app.use(express.json());
app.use(morgan("dev"));
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use('/businesses', businessRouter);
app.use('/locations', locationRouter);

app.listen(PORT, async () => {
    signale.success("Server online in port " + PORT);
});