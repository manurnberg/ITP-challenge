import { ApiProperty } from '@nestjs/swagger';
import { ICompany } from '../controllers/interfaces/company.interface';
import { CompanyResponseDto } from './company-response.dto';

export class CompaniesResponseDto {
  @ApiProperty({ type: [CompanyResponseDto] })
  companies: ICompany[];

  constructor(companies: ICompany[]) {
    this.companies = companies;
  }
}
