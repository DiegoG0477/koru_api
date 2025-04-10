import { Country } from "../model/Country";
import { State } from "../model/State";
import { Municipality } from "../model/Municipality";
import { Category } from "../model/Category";

export interface LocationRepository {
    getAllCountries(): Promise<Country[] | null>;
    getStatesByCountry(countryId: string): Promise<State[] | null>;
    getMunicipalitiesByState(stateId: string): Promise<Municipality[] | null>;
    getAllCategories(): Promise<Category[] | null>;
}