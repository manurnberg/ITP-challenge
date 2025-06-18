import { CompanyRepository } from 'src/core/domain/ports/company.repository';
import { Company } from 'src/core/domain/entities/company.entity';
import { CompanyType } from 'src/core/domain/value-objects/company-type.vo';
import { randomUUID } from 'crypto';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CompanyRepositoryToken } from 'src/core/domain/constants/company.repository.token';
import { GlobalLogger } from 'src/shared/logger/service/global-logger.service';
import { ICompany } from 'src/infraestructure/http-server/api/controllers/interfaces/company.interface';

/**
 * Use case to register a new company.
 *
 * @param {string} name - The name of the company.
 * @param {CompanyType} type - The type of the company (e.g. PYME or CORPORATE).
 * @returns {Promise} Resolves with the created company's data.
 */
@Injectable()
export class RegisterCompanyUseCase {
  constructor(
    @Inject(CompanyRepositoryToken)
    private readonly companyRepository: CompanyRepository,
    private readonly logger: GlobalLogger,
  ) {}

  async execute(name: string, type: CompanyType): Promise<ICompany> {
    const randomHasRecentTransfers = Math.random() < 0.5;
    const company = new Company(
      randomUUID(),
      name,
      type,
      randomHasRecentTransfers,
      new Date(),
    );

    try {
      await this.companyRepository.save(company);
      this.logger.log(
        `Company registered: id=${company.id}, name=${company.name}`,
        'Register Company',
      );

      const mappedCompany: ICompany = {
        id: company.id,
        name: company.name,
        type: company.type as CompanyType,
        registeredAt: company.registeredAt,
      };
      return mappedCompany;
    } catch (error) {
      this.logger.error(
        `Failed to register company: ${error.message}`,
        error.stack,
        'Register Company',
      );
      throw new InternalServerErrorException('Error registering company');
    }
  }
}
