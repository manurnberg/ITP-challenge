import { CompanyType } from 'src/core/domain/value-objects/company-type.vo';
import { ICompany } from '../controllers/interfaces/company.interface';
import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponseDto implements ICompany {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: CompanyType;

  @ApiProperty()
  registeredAt: Date;
}
