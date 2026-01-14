import { ISendAlertOptions } from '../interfaces/send-alert-options.interface';

export abstract class BaseAlert {
    abstract getText(): string;

    getAttachment(): { source: Buffer; filename: string } | null {
        return null;
    }

    getOptions(): ISendAlertOptions | undefined {
        return undefined;
    }
}
