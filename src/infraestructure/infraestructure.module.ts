import { Module } from '@nestjs/common';
import { CompanyController } from './http-server/api/controllers/company.controller';
import { PrismaService } from './database/orm/prisma/prisma.service';
import { SqliteCompanyRepository } from './adapters/sqlite-company.repository';
import { CompanyRepositoryToken } from '../core/domain/constants/company.repository.token';
import { RegisterCompanyUseCase } from 'src/core/application/services/register-company.usecase';
import { FindCompaniesWithRecentTransfersUseCase } from 'src/core/application/services/list-companies-with-transfers.usecase';
import { FindCompaniesRegisterUseCase } from 'src/core/application/services/list-registered-companies.usecase';
import { LoggerModule } from '../shared/logger/logger.module';
@Module({
  controllers: [CompanyController],
  providers: [
    PrismaService,
    RegisterCompanyUseCase,
    FindCompaniesWithRecentTransfersUseCase,
    FindCompaniesRegisterUseCase,
    {
      provide: CompanyRepositoryToken,
      useClass: SqliteCompanyRepository,
    },
  ],
  imports: [LoggerModule],
})
export class InfraestructureModule {}
