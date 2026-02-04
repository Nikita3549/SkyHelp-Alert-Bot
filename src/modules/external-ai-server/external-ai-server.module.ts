import { Module } from '@nestjs/common';
import { ExternalAiServerService } from './external-ai-server.service';
import { AlertModule } from '../alert/alert.module';

@Module({
    imports: [AlertModule],
    providers: [ExternalAiServerService],
    exports: [ExternalAiServerService],
})
export class ExternalAiServerModule {}
