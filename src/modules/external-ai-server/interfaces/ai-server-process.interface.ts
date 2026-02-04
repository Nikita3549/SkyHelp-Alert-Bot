import { AiServerProcesses } from '../enums/ai-server-processes.enum';

export interface IAiServerProcess {
    id: number;
    name: AiServerProcesses;
    status: string;
    uptime_seconds: number;
    memory_mb: number;
    cpu: number;
}
