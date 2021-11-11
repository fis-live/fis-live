export class FisSignature {
    private readonly signature: string;
    private updateCount = 0;
    private errorCount = 0;
    private interval = 0;
    private startRequest = 0;

    public constructor() {
        const d = new Date();
        this.signature = d.getSeconds().toString() + d.getMilliseconds().toString() + '-fis';
    }

    public get(): string {
        const d = new Date();
        this.startRequest = d.getTime();
        return `${this.interval}-${this.errorCount}-${this.signature}-${this.updateCount}-${d.getMilliseconds()}`;
    }

    public success(): void {
        this.updateCount++;
        this.errorCount = 0;
        this.interval = (new Date()).getTime() - this.startRequest;
    }

    public error(): number {
        this.errorCount++;
        this.interval = (new Date()).getTime() - this.startRequest;
        return this.errorCount;
    }

    public reset(): void {
        this.updateCount = 0;
        this.errorCount = 0;
        this.interval = 0;
        this.startRequest = 0;
    }
}
