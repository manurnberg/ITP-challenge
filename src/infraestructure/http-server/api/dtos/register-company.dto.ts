import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { CompanyType } from 'src/core/domain/value-objects/company-type.vo';

export class RegisterCompanyDto {
  @ApiProperty({
    example: 'Tech Corp',
    description: 'Name of the company',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    enum: CompanyType,
    description: 'Type of the company',
    example: CompanyType.PYME,
  })
  @IsNotEmpty({ message: 'Type is required' })
  @Type(() => String)
  type: CompanyType;
}
