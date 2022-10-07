export declare enum LINKEDIN_ERRORS {
    DISCONNECTED = 0,
    INVALID_CREDENTIALS = 1,
    DELAY = 2
}
export declare class LinkedinErrors {
    text: string;
    url?: string;
    additional?: {
        values: LINKEDIN_ERRORS;
        more?: any;
    };
    constructor(text: string, url?: string, additional?: {
        values: LINKEDIN_ERRORS;
        more?: any;
    });
}
