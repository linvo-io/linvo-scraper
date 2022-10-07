import { Page } from 'puppeteer-core';
interface MessageOptions {
    label: string;
    value: string;
}
export declare class MessagesService {
    static _replace(content: string, name: string, value: string): string;
    messagesList(prospectName: string, page: Page): Promise<{
        from: string;
        message: any;
    }[]>;
    createMessage(message: string, params: MessageOptions[]): Promise<string>;
}
export {};
