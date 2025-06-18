import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';

@Injectable()
export class GlobalLogger extends ConsoleLogger {
  constructor(context?: string) {
    super(context);
  }

  override log(message: any, context?: string) {
    super.log(message, context || this.context);
  }

  override error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context || this.context);
  }

  override warn(message: any, context?: string) {
    super.warn(message, context || this.context);
  }

  override debug(message: any, context?: string) {
    super.debug?.(message, context || this.context);
  }

  override verbose(message: any, context?: string) {
    super.verbose?.(message, context || this.context);
  }

  setLogLevels(levels: LogLevel[]) {
    super.setLogLevels(levels);
  }
}
