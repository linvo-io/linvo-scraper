interface String {
    black(): string;
    red(): string;
    green(): string;
    yellow(): string;
    blue(): string;
    magenta(): string;
    cyan(): string;
    white(): string;
}
declare const Reset = "\u001B[0m";
declare const colorWithReset: (color: string, str: string) => string;
