// locations/infrastructure/utils/LocationMapper.ts
import { Country } from "../../domain/model/Country";
import { State } from "../../domain/model/State";
import { Municipality } from "../../domain/model/Municipality";
import { Category } from "../../domain/model/Category";
import { CountryDto } from "../dtos/CountryDto";
import { StateDto } from "../dtos/StateDto";
import { MunicipalityDto } from "../dtos/MunicipalityDto";
import { CategoryDto } from "../dtos/CategoryDto";

export function mapCountryToDto(country: Country): CountryDto {
    return { id: country.id, name: country.name };
}

export function mapStateToDto(state: State): StateDto {
    // El DTO de Android no pide countryId
    return { id: state.id, name: state.name };
}

export function mapMunicipalityToDto(municipality: Municipality): MunicipalityDto {
    // El DTO de Android sí pide stateId
    return { id: municipality.id, name: municipality.name, stateId: municipality.stateId };
}

export function mapCategoryToDto(category: Category): CategoryDto {
    // El DTO de Android llama al campo 'icon'
    return { id: category.id, name: category.name, icon: category.iconKey };
}