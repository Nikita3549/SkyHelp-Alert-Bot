import { BaseAlert } from '../base-alert';
import { ISendAlertOptions } from '../../interfaces/send-alert-options.interface';

export interface IAiServerExternalService {
    status: string;
    serviceName: string;
}

export class AiServiceStatusAlert extends BaseAlert {
    private readonly data: IAiServerExternalService;

    constructor(data: IAiServerExternalService) {
        super();
        this.data = data;
    }

    getText(): string {
        const icon = '🚨';
        const title = '*EXTERNAL SERVICE DOWN*';

        // Форматируем время и экранируем спецсимволы для MarkdownV2
        const mskTime = new Date()
            .toLocaleString('ru-RU', {
                timeZone: 'Europe/Moscow',
            })
            .replace(/\./g, '\\.')
            .replace(/-/g, '\\-')
            .replace(/:/g, '\\:');

        const message = [
            `${icon} ${title} ${icon}`,
            `\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`,
            `🔌 *Service:* \`${this.data.serviceName}\``,
            `❌ *Status:* \`${this.data.status.toUpperCase()}\``,
            `⏰ *Time:* \`${mskTime}\``,
            `\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`,
        ].join('\n');

        return message;
    }

    getOptions(): ISendAlertOptions | undefined {
        return {
            parse_mode: 'MarkdownV2',
        };
    }
}
