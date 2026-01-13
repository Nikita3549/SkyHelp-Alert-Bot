import { Injectable, OnModuleInit } from '@nestjs/common';
import Docker from 'dockerode';
import { ConfigService } from '@nestjs/config';
import { DockerEvent } from './interfaces/docker-event.interface';
import { AlertService } from '../alert/alert.service';
import { UnhealthyContainerAlert } from '../alert/definitions/alerts/unhealthy-container.alert';
import { cleanDockerLogs } from './utils/clean-docker-logs.util';
import { UnknownErrorAlert } from '../alert/definitions/alerts/unknown-error.alert';
import { DEV_CONTAINERS_PREFIX } from './constants/dev-containers-prefix';

@Injectable()
export class DockerMonitorService implements OnModuleInit {
    private readonly docker: Docker;
    constructor(
        private readonly configService: ConfigService,
        private readonly alertService: AlertService,
    ) {
        this.docker = new Docker({
            socketPath: this.configService.getOrThrow('DOCKER_SOCKET_PATH'),
        });
    }

    async onModuleInit() {
        await this.checkExistingContainers();

        await this.startMonitoring();
    }

    private async startMonitoring() {
        this.docker.getEvents(
            {
                filters: {
                    event: ['health_status'],
                },
            },
            (error, stream) => {
                if (error || !stream) {
                    this.alertService.sendAlert(
                        new UnknownErrorAlert({
                            error: error
                                ? JSON.stringify(error, null, 2)
                                : 'Empty variable stream',
                        }),
                    );
                    return;
                }

                stream.on('data', (chunk) => {
                    const event = JSON.parse(chunk.toString());
                    this.handleHealthEvent(event);
                });
            },
        );
    }
    private async handleHealthEvent(event: DockerEvent) {
        const container = event.Actor;
        const containerName = container.Attributes.name;
        const status = event.status.replace('health_status: ', '');

        console.log(
            `${containerName} ${status.replace('health_status: ', '')}`,
        );
        if (
            status == 'unhealthy' &&
            !status.startsWith(DEV_CONTAINERS_PREFIX)
        ) {
            await this.processUnhealthyContainer({
                id: container.ID,
                name: containerName,
            });
        }
    }

    async getContainerLogs(containerId: string): Promise<string> {
        const container = this.docker.getContainer(containerId);

        const logs = cleanDockerLogs(
            await container.logs({
                stderr: true,
                stdout: true,
                tail: 1000,
            }),
        );

        return logs;
    }

    private async checkExistingContainers() {
        try {
            const containers = await this.docker.listContainers();

            for (const containerInfo of containers) {
                const containerName = containerInfo.Names[0].replace('/', '');
                if (
                    containerInfo.Status.includes('unhealthy') &&
                    !containerName.startsWith(DEV_CONTAINERS_PREFIX)
                ) {
                    await this.processUnhealthyContainer({
                        id: containerInfo.Id,
                        name: containerName,
                    });
                }
            }
        } catch (e: unknown) {
            await this.alertService.sendAlert(
                new UnknownErrorAlert({
                    error: `Failed to check existing containers 
                    ${JSON.stringify(e, null, 2)}`,
                }),
            );
        }
    }

    private async processUnhealthyContainer(container: {
        id: string;
        name: string;
    }) {
        await this.alertService.sendAlert(
            new UnhealthyContainerAlert({
                containerName: container.name,
                logs: await this.getContainerLogs(container.id),
            }),
        );
    }
}
