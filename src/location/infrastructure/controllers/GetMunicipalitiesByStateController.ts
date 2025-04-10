import { Request, Response } from "express";
import { GetMunicipalitiesByStateUseCase } from "../../application/use-cases/GetMunicipalitiesByStateUseCase";
import { mapMunicipalityToDto } from "../utils/LocationMapper";

export class GetMunicipalitiesByStateController {
    constructor(private readonly useCase: GetMunicipalitiesByStateUseCase) {}
    async run(req: Request, res: Response): Promise<Response> {
        const stateId = req.query.stateId as string; // Tomar de query param
        if (!stateId) {
             return res.status(400).send({ status: 'error', message: 'Missing stateId query parameter.' });
        }
        try {
            const municipalities = await this.useCase.run(stateId);
            if (municipalities) {
                const dtos = municipalities.map(mapMunicipalityToDto);
                return res.status(200).send({ status: 'success', data: dtos });
            }
             return res.status(500).send({ status: 'error', message: 'Failed to retrieve municipalities.' });
        } catch (error) {
             console.error("Error in GetMunicipalitiesByStateController:", error);
             return res.status(500).send({ status: 'error', message: 'Internal server error.' });
        }
    }
}