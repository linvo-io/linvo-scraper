import { CDPSession, Page } from "puppeteer-core";
interface Data {
    token: string;
    account: string;
}
export declare class MultipleQueue {
    value: any;
    constructor(value: any);
}
export declare type CombinedData<T> = Data & T;
export interface LinkedinServicesInterface<T> {
    process: (page: Page, cdp: CDPSession, data: CombinedData<T>) => Promise<any>;
}
export {};
