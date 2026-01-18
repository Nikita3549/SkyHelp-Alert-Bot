import { Module } from '@nestjs/common';
import { HeartbeatService } from './heartbeat.service';
import { DockerMonitorModule } from '../docker-monitor/docker-monitor.module';
import { AlertModule } from '../alert/alert.module';
import { SystemModule } from '../system/system.module';
import { ExternalApiModule } from '../external-api/external-api.module';

@Module({
    imports: [
        DockerMonitorModule,
        AlertModule,
        SystemModule,
        ExternalApiModule,
    ],
    providers: [HeartbeatService],
})
export class HeartbeatModule {}
