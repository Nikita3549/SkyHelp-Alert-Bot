import { FlightStatusSource } from '../enums/flight-status-source.enum';

export interface IFlightStatusStats {
    total: number;
    monthly: {
        month: string;
        amount: number;
        source: FlightStatusSource;
    }[];
}
