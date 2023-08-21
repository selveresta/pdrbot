import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService extends ConsoleLogger {
    constructor() {
        super();
    }

    log(message: any, ...optionalParams: any[]): void {
        const m = '| INFO | ' + message;
        super.log(m);
    }

    error(message: any, stackOrContext?: string): void {
        const m = '| ERROR | ' + message;
        super.log(m);
    }

    warn(message: any, context?: string): void {
        const m = '| WARN | ' + message;
        super.log(m);
    }

    debug(message: any, context?: string): void {
        const m = '| DEBUG | ' + message;
        super.log(m);
    }

    verbose(message: any, context?: string): void {
        const m = '| VERBOSE | ' + message;
        super.log(m);
    }
}
