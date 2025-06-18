import { Company } from '../entities/company.entity';

export abstract class CompanyRepository {
  abstract save(company: Company): Promise<void>;
  abstract findById(id: string): Promise<Company | null>;
  abstract findRegisteredLastMonth(): Promise<Company[]>;
  abstract findCompanyIdsWithTransfersSince(date: Date): Promise<string[]>;
}
