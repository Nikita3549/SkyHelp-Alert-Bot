import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { BaseAlert } from './definitions/base-alert';
import { ISendAlertOptions } from './interfaces/send-alert-options.interface';

@Injectable()
export class AlertService {
    private readonly adminGroupId: string;
    constructor(
        @InjectBot() private readonly bot: Telegraf,
        private readonly configService: ConfigService,
    ) {
        this.adminGroupId = this.configService.getOrThrow('ADMIN_GROUP_ID');
    }

    async sendAlert(alert: BaseAlert) {
        const options = alert.getOptions();
        const attachment = alert.getAttachment();

        if (attachment) {
            await this.bot.telegram.sendDocument(
                this.adminGroupId,
                attachment,
                {
                    caption: alert.getText(),
                    ...options,
                },
            );
        } else {
            await this.bot.telegram.sendMessage(
                this.adminGroupId,
                alert.getText(),
                options,
            );
        }
    }
}
