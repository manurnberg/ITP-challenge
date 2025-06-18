import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { InfraestructureModule } from './infraestructure/infraestructure.module';

@Module({
  imports: [CoreModule, InfraestructureModule],
})
export class AppModule {}
