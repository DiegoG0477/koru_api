import { Request, Response } from "express";
import { GetAllCategoriesUseCase } from "../../application/use-cases/GetAllCategoriesUseCase";
import { mapCategoryToDto } from "../utils/LocationMapper";

export class GetAllCategoriesController {
    constructor(private readonly useCase: GetAllCategoriesUseCase) {}
    async run(req: Request, res: Response): Promise<Response> {
        try {
            const categories = await this.useCase.run();
            if (categories) {
                const dtos = categories.map(mapCategoryToDto);
                return res.status(200).send({ status: 'success', data: dtos });
            }
             return res.status(404).send({ status: 'error', message: 'No categories found.' });
        } catch (error) {
             console.error("Error in GetAllCategoriesController:", error);
             return res.status(500).send({ status: 'error', message: 'Internal server error.' });
        }
    }
}