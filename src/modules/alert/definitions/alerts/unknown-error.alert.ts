import { BaseAlert } from '../base-alert';
import { formatDate } from '../../../../common/utils/formatDate';

export interface IUnknownErrorAlertData {
    error: string;
}
export class UnknownErrorAlert extends BaseAlert {
    private readonly data: IUnknownErrorAlertData;
    constructor(data: IUnknownErrorAlertData) {
        super();
        this.data = data;
    }
    getText(): string {
        return `⚠️ Unknown Alert Bot Error detected`;
    }
    getAttachment(): { source: Buffer; filename: string } | null {
        return {
            source: Buffer.from(this.data.error, 'utf-8'),
            filename: `unknown_error-${formatDate(new Date(), 'yyyy-mm-dd_hh-mm-ss')}.txt`,
        };
    }
}
