import { CDPSession, Page } from "puppeteer-core";

interface Data {
  token: string;
  account: string;
}

export class MultipleQueue {
  constructor(public value: any) {}
}

export type CombinedData<T> = Data & T;
export interface LinkedinServicesInterface<T> {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  process: (page: Page, cdp: CDPSession, data: CombinedData<T>) => Promise<any>;
}
