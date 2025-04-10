import { Request, Response } from "express";
import { GetStatesByCountryUseCase } from "../../application/use-cases/GetStatesByCountryUseCase";
import { mapStateToDto } from "../utils/LocationMapper";

export class GetStatesByCountryController {
    constructor(private readonly useCase: GetStatesByCountryUseCase) {}
    async run(req: Request, res: Response): Promise<Response> {
        const countryId = req.query.countryId as string; // Tomar de query param
        if (!countryId) {
            return res.status(400).send({ status: 'error', message: 'Missing countryId query parameter.' });
        }
        try {
            const states = await this.useCase.run(countryId);
            if (states) {
                 // Devolver array vacío si no hay estados para ese país
                const dtos = states.map(mapStateToDto);
                return res.status(200).send({ status: 'success', data: dtos });
            }
             // Devolver 500 si el Use Case/Repo falló
             return res.status(500).send({ status: 'error', message: 'Failed to retrieve states.' });
        } catch (error) {
            console.error("Error in GetStatesByCountryController:", error);
            return res.status(500).send({ status: 'error', message: 'Internal server error.' });
        }
    }
}