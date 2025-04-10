import dotenv from "dotenv";
dotenv.config(); // <-- ¡MUÉVELO AQUÍ! Al principio del todo

import express from "express";
import morgan from "morgan";
import { Signale } from "signale";
import { userRouter } from "./user/infrastructure/routes/UserRouter";
import { authRouter } from "./auth/infrastructure/routes/AuthRouter";
import { businessRouter } from "./business/infrastructure/routes/BusinessRouter";
import { locationRouter } from "./location/infrastructure/routes/LocationRouter";

const PORT = process.env.SERVER_PORT ?? 8080;

const app = express();
const signale = new Signale();

app.use(express.json());
app.use(morgan("dev"));

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    signale.warn('Cloudinary environment variables (CLOUD_NAME, API_KEY, API_SECRET) are not fully set. Uploads will likely fail.');
    // Consider exiting if Cloudinary is essential: process.exit(1);
}

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use('/businesses', businessRouter);
app.use('/locations', locationRouter);

app.listen(PORT, async () => {
    signale.success("Server online in port " + PORT);
});