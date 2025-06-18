import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CompanyRepository } from 'src/core/domain/ports/company.repository';
import { CompanyRepositoryToken } from 'src/core/domain/constants/company.repository.token';
import { GlobalLogger } from 'src/shared/logger/service/global-logger.service';
import {
  ICompanies,
  ICompany,
} from 'src/infraestructure/http-server/api/controllers/interfaces/company.interface';
import { CompanyType } from 'src/core/domain/value-objects/company-type.vo';

/**
 * Use case to fetch companies registered in the last month.
 *
 * @returns {Promise} Resolves with a list of companies including id, name, type, and registration date.
 */
@Injectable()
export class FindCompaniesRegisterUseCase {
  constructor(
    @Inject(CompanyRepositoryToken)
    private readonly companyRepository: CompanyRepository,
    private readonly logger: GlobalLogger,
  ) {}

  async execute(): Promise<ICompanies> {
    try {
      const companies = await this.companyRepository.findRegisteredLastMonth();
      this.logger.log(
        `Fetched ${companies.length} companies registered last month`,
        'Find Companies with recent register',
      );
      const mappedCompanies: ICompany[] = companies.map((company) => ({
        id: company.id,
        name: company.name,
        type: company.type as CompanyType,
        registeredAt: company.registeredAt,
      }));
      return { companies: mappedCompanies };
    } catch (error) {
      this.logger.error(
        'Error while fetching companies registered in the last month',
        error.stack || error.message,
        'Find Companies with recent register',
      );
      throw new InternalServerErrorException(
        'Error while fetching companies registered in the last month',
      );
    }
  }
}
