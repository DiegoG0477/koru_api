// locations/infrastructure/repository/MysqlLocationRepository.ts
import { query } from "../../../shared/database/mysqlAdapter";
import { LocationRepository } from "../../domain/repository/LocationRepository";
import { Country } from "../../domain/model/Country";
import { State } from "../../domain/model/State";
import { Municipality } from "../../domain/model/Municipality";
import { Category } from "../../domain/model/Category";

export class MysqlLocationRepository implements LocationRepository {

    async getAllCountries(): Promise<Country[] | null> {
        const sql = "SELECT id, name FROM countries ORDER BY name ASC";
        try {
            const [rows]: any = await query(sql, []);
            // Mapear directamente a la interfaz Country
            return rows.map((row: any) => ({ id: row.id, name: row.name }));
        } catch (error) {
            console.error("MySQL Error fetching countries:", error);
            return null;
        }
    }

    async getStatesByCountry(countryId: string): Promise<State[] | null> {
        const sql = "SELECT id, name, country_id FROM states WHERE country_id = ? ORDER BY name ASC";
        try {
            const [rows]: any = await query(sql, [countryId]);
             // Mapear directamente a la interfaz State
            return rows.map((row: any) => ({ id: row.id, name: row.name, countryId: row.country_id }));
        } catch (error) {
            console.error(`MySQL Error fetching states for country ${countryId}:`, error);
            return null;
        }
    }

    async getMunicipalitiesByState(stateId: string): Promise<Municipality[] | null> {
        const sql = "SELECT id, name, state_id FROM municipalities WHERE state_id = ? ORDER BY name ASC";
        try {
            const [rows]: any = await query(sql, [stateId]);
             // Mapear directamente a la interfaz Municipality
            return rows.map((row: any) => ({ id: row.id, name: row.name, stateId: row.state_id }));
        } catch (error) {
            console.error(`MySQL Error fetching municipalities for state ${stateId}:`, error);
            return null;
        }
    }

    async getAllCategories(): Promise<Category[] | null> {
        const sql = "SELECT id, name, icon_key FROM categories ORDER BY name ASC";
        try {
            const [rows]: any = await query(sql, []);
             // Mapear directamente a la interfaz Category
            return rows.map((row: any) => ({ id: row.id.toString(), name: row.name, iconKey: row.icon_key }));
        } catch (error) {
            console.error("MySQL Error fetching categories:", error);
            return null;
        }
    }
}