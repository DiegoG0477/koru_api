import { Request, Response } from "express";
import { GetAllCountriesUseCase } from "../../application/use-cases/GetAllCountriesUseCase";
import { mapCountryToDto } from "../utils/LocationMapper";

export class GetAllCountriesController {
    constructor(private readonly useCase: GetAllCountriesUseCase) {}
    async run(req: Request, res: Response): Promise<Response> {
        try {
            const countries = await this.useCase.run();
            if (countries) {
                const dtos = countries.map(mapCountryToDto);
                return res.status(200).send({ status: 'success', data: dtos });
            }
            return res.status(404).send({ status: 'error', message: 'No countries found.' });
        } catch (error) {
             console.error("Error in GetAllCountriesController:", error);
             return res.status(500).send({ status: 'error', message: 'Internal server error.' });
        }
    }
}