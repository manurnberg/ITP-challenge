import { Global, Module } from '@nestjs/common';
import { GlobalLogger } from './service/global-logger.service';
@Global()
@Module({
  providers: [GlobalLogger],
  exports: [GlobalLogger],
})
export class LoggerModule {}
