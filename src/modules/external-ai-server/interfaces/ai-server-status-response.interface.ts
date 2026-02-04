import { IAiServerProcess } from './ai-server-process.interface';
import { IAiServerContainer } from './ai-server-container.interface';

export interface IAiServerStatusResponse {
    timestamp: number;
    pm2_processes: IAiServerProcess[];
    docker_containers: IAiServerContainer[];
}
