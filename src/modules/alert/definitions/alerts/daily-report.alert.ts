import { BaseAlert } from '../base-alert';
import { IRamStatus } from '../../../system/interfaces/ram-status.interface';
import { IContainersStatus } from '../../../docker-monitor/interfaces/system-status.interface';
import { ISSDStatus } from '../../../system/interfaces/ssd-status.interface';

interface IDailyReportData {
    ramStatus: IRamStatus;
    ssdStatus: ISSDStatus;
    containersStatus: IContainersStatus;
}

export class DailyReportAlert extends BaseAlert {
    private readonly data: IDailyReportData;
    constructor(data: IDailyReportData) {
        super();
        this.data = data;
    }

    getText(): string {
        const ssd = this.data.ssdStatus;
        const ram = this.data.ramStatus;
        const containers = this.data.containersStatus;

        const systemStatusIcon =
            Number(ssd.usedPercentage) >= 90 || Number(ram.usedPercentage) >= 90
                ? '⚠️'
                : '✅';
        const getStatusEmoji = (percentage: number | string) => {
            const p = Number(percentage);
            if (p >= 90) return '🔴';
            if (p >= 75) return '🟡';
            return '🟢';
        };

        const message = [
            `☀️ *Good morning!*`,
            '',
            `📦 *Containers:* ${containers.running} / ${containers.total}`,
            `🟢 *Healthy:* ${containers.total - containers.unhealthy}`,
            '',
            `🖥 *System Resources ${systemStatusIcon}:*`,

            `${getStatusEmoji(ssd.usedPercentage)} *Disk:* ${ssd.usedPercentage}% — ${ssd.usedGB}/${ssd.totalGB} GB (${ssd.freeGB}GB free)`,

            `${getStatusEmoji(ram.usedPercentage)} *RAM:* ${ram.usedPercentage}% — ${ram.usedGB}/${ram.totalGB} GB (${ram.availableGB}GB available)`,

            ...(Number(ram.availableGB) < 0.5
                ? ['', '‼️ *Low RAM warning!* Check your containers.']
                : []),

            '',
            `_All systems are monitored_`,
        ].join('\n');

        return message;
    }
}
