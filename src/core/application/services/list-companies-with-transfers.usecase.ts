import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CompaniesResponseDto } from 'src/infraestructure/http-server/api/dtos/companies-response.dto';
import { CompanyRepositoryToken } from 'src/core/domain/constants/company.repository.token';
import { CompanyRepository } from 'src/core/domain/ports/company.repository';
import {
  ICompanies,
  ICompany,
} from 'src/infraestructure/http-server/api/controllers/interfaces/company.interface';
import { GlobalLogger } from 'src/shared/logger/service/global-logger.service';

/**
 * Use case to find companies with transfers in the last month.
 *
 * @returns {Promise} Resolves with a list of companies including id and name.
 */
@Injectable()
export class FindCompaniesWithRecentTransfersUseCase {
  constructor(
    @Inject(CompanyRepositoryToken)
    private readonly companyRepository: CompanyRepository,
    private readonly logger: GlobalLogger,
  ) {}

  async execute(): Promise<ICompanies> {
    try {
      const since = new Date();
      since.setMonth(since.getMonth() - 1);

      this.logger.log(
        `Looking for companies with transfers since: ${since.toISOString()}`,
        'Find companies with recent transfers',
      );

      const companyIds =
        await this.companyRepository.findCompanyIdsWithTransfersSince(since);

      const companiesData: ICompany[] = (
        await Promise.all(
          companyIds.map(async (id) => {
            const company = await this.companyRepository.findById(id);
            if (company) {
              return {
                id: company.id,
                name: company.name,
              };
            }
            return null;
          }),
        )
      ).filter((company): company is ICompany => company !== null);

      this.logger.log(
        `Found ${companiesData.length} companies with recent transfers`,
        'Find companies with recent transfers',
      );

      return new CompaniesResponseDto(companiesData);
    } catch (error) {
      this.logger.error(
        'Error while fetching companies with recent transfers',
        error.stack,
        'Find companies with recent transfers',
      );
      throw new InternalServerErrorException(
        'Error while fetching companies with recent transfers',
      );
    }
  }
}
