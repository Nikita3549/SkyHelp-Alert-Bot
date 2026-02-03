import { Injectable } from '@nestjs/common';
import { IFlightStatusStats } from './interfaces/flight-status-stats.interface';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { FlightStatusSource } from './enums/flight-status-source.enum';

@Injectable()
export class FlightStatusService {
    private readonly pool: Pool;
    constructor(private readonly configService: ConfigService) {
        this.pool = new Pool({
            host: configService.getOrThrow('PROD_DATABASE_HOST'),
            port: configService.getOrThrow('PROD_DATABASE_PORT'),
            database: configService.getOrThrow('PROD_DATABASE_DBNAME'),
            user: configService.getOrThrow('PROD_DATABASE_USER'),
            password: configService.getOrThrow('PROD_DATABASE_PASSWORD'),
        });
    }

    async getStats(): Promise<IFlightStatusStats> {
        const { rows } = await this.pool.query<{
            month: string;
            source: string;
            total: string;
        }>(
            `SELECT 
            TRIM(TO_CHAR(requested_at, 'Month')) as month, 
            "flightStatusSource" as source,
            COUNT(*) as total
         FROM stats_flight_status_requests
         GROUP BY month, "flightStatusSource"
         ORDER BY month DESC, total DESC`,
        );

        const { rows: totalRows } = await this.pool.query<{
            count: string;
        }>(`SELECT COUNT(*) FROM stats_flight_status_requests`);

        return {
            total: parseInt(totalRows[0].count, 10),
            monthly: rows.map((r) => ({
                month: r.month,
                source: r.source as FlightStatusSource,
                amount: parseInt(r.total, 10),
            })),
        };
    }
}
