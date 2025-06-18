import { CompanyType } from 'src/core/domain/value-objects/company-type.vo';

export interface ICompany {
  id: string;
  name: string;
  type: CompanyType;
  registeredAt: Date;
}

export interface ICompanies {
  companies: ICompany[];
}
