import { BaseAlert } from '../base-alert';
import { IRamStatus } from '../../../system/interfaces/ram-status.interface';
import { IContainersStatus } from '../../../docker-monitor/interfaces/system-status.interface';
import { ISSDStatus } from '../../../system/interfaces/ssd-status.interface';
import { ISendAlertOptions } from '../../interfaces/send-alert-options.interface';
import { getSystemResourcesMessage } from '../../utils/get-system-resources-message.util';
import { HealthStatus } from '../../../external-api/enums/health-status.enum';
import { IExternalApiStatus } from '../../../external-api/interfaces/external-api-status.interface';

interface IDailyReportData {
    ramStatus: IRamStatus;
    ssdStatus: ISSDStatus;
    containersStatus: IContainersStatus;
    externalApisStatus: IExternalApiStatus[];
}

export class DailyReportAlert extends BaseAlert {
    private readonly data: IDailyReportData;

    constructor(data: IDailyReportData) {
        super();
        this.data = data;
    }

    getText(): string {
        const { ssdStatus, ramStatus, containersStatus, externalApisStatus } =
            this.data;

        const apiSection = externalApisStatus.map((item) => {
            const icon = item.status === HealthStatus.OK ? '✅' : '❌';
            return `${icon} *${item.api}:* ${item.status}`;
        });

        const message = [
            `☀️ *Good morning!*`,
            '',
            `📦 *Containers:* ${containersStatus.running} / ${containersStatus.total}`,
            `🟢 *Healthy:* ${containersStatus.total - containersStatus.unhealthy}`,
            '',
            getSystemResourcesMessage(ssdStatus, ramStatus),
            '',
            `🌐 *External APIs:*`,
            ...apiSection,
            '',
            `_All systems are monitored_`,
        ].join('\n');

        return message;
    }

    getOptions(): ISendAlertOptions | undefined {
        return {
            parse_mode: 'Markdown',
        };
    }
}
