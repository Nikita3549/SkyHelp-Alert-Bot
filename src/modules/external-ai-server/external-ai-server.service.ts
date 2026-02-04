import { Injectable } from '@nestjs/common';
import { IAiServerStatusResponse } from './interfaces/ai-server-status-response.interface';
import axios from 'axios';
import { AlertService } from '../alert/alert.service';
import { IAiServerContainer } from './interfaces/ai-server-container.interface';
import { HealthStatus } from '../external-api/enums/health-status.enum';
import { AiServerContainers } from './enums/ai-server-containers.enum';
import { AiServiceStatusAlert } from '../alert/definitions/alerts/ai-service-status.alert';
import { IAiServerProcess } from './interfaces/ai-server-process.interface';
import { AiServerProcesses } from './enums/ai-server-processes.enum';
import { UnknownErrorAlert } from '../alert/definitions/alerts/unknown-error.alert';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExternalAiServerService {
    constructor(
        private readonly alertService: AlertService,
        private readonly configService: ConfigService,
    ) {}

    async ping() {
        const status = await this.getStatus();

        if (!status || !status?.docker_containers || !status.pm2_processes) {
            await this.alertService.sendAlert(
                new UnknownErrorAlert({
                    error: 'Failed to ping AI services',
                }),
            );
            return;
        }

        await this.processContainers(status.docker_containers);

        await this.processProcesses(status.pm2_processes);
    }

    private async getStatus(): Promise<IAiServerStatusResponse | null> {
        try {
            const { data } = await axios.get<IAiServerStatusResponse>(
                this.configService.getOrThrow(
                    'EXTERNAL_SERVICES_HEALTHCHECK_ENDPOINT',
                ),
            );

            return data;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    private async processContainers(
        containers: IAiServerContainer[],
    ): Promise<HealthStatus> {
        const expectedContainers = Object.values(AiServerContainers);

        const missingContainers = expectedContainers.filter(
            (requiredName) => !containers.some((c) => c.names == requiredName),
        );

        if (missingContainers.length > 0) {
            for (const containerName of missingContainers) {
                await this.alertService.sendAlert(
                    new AiServiceStatusAlert({
                        serviceName: containerName,
                        status: 'OFFLINE',
                    }),
                );
            }

            return HealthStatus.FAILED;
        }

        return HealthStatus.OK;
    }
    private async processProcesses(
        processes: IAiServerProcess[],
    ): Promise<HealthStatus> {
        const expectedProcesses = Object.values(AiServerProcesses);

        const missingProcesses = expectedProcesses.filter(
            (requiredName) => !processes.some((c) => c.name == requiredName),
        );

        if (missingProcesses.length > 0) {
            for (const processName of missingProcesses) {
                await this.alertService.sendAlert(
                    new AiServiceStatusAlert({
                        serviceName: processName,
                        status: 'OFFLINE',
                    }),
                );
            }

            return HealthStatus.FAILED;
        }

        return HealthStatus.OK;
    }
}
