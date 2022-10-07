export enum LINKEDIN_ERRORS {
  DISCONNECTED,
  INVALID_CREDENTIALS,
  DELAY,
}

export class LinkedinErrors {
  constructor(
    public text: string,
    public url?: string,
    public additional?: { values: LINKEDIN_ERRORS; more?: any }
  ) {}
}
