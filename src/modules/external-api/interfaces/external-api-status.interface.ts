import { ExternalApis } from '../enums/external-apis.enum';
import { HealthStatus } from '../enums/health-status.enum';

export interface IExternalApiStatus {
    api: ExternalApis;
    status: HealthStatus;
}
