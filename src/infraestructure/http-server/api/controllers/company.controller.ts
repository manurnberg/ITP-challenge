import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterCompanyUseCase } from 'src/core/application/services/register-company.usecase';
import { FindCompaniesRegisterUseCase } from 'src/core/application/services/list-registered-companies.usecase';
import { FindCompaniesWithRecentTransfersUseCase } from 'src/core/application/services/list-companies-with-transfers.usecase';
import {
  CompaniesResponseDto,
  CompanyResponseDto,
  RegisterCompanyDto,
} from '../dtos';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(
    private readonly registerUseCase: RegisterCompanyUseCase,
    private readonly findCompaniesUseCase: FindCompaniesRegisterUseCase,
    private readonly findCompanyTransfers: FindCompaniesWithRecentTransfersUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new company' })
  @ApiResponse({
    status: 201,
    description: 'Company successfully registered',
    type: CompanyResponseDto,
  })
  async create(@Body() body: RegisterCompanyDto): Promise<CompanyResponseDto> {
    return this.registerUseCase.execute(body.name, body.type);
  }

  @Get('registered-last-month')
  @ApiOperation({ summary: 'Get companies registered in the last month' })
  @ApiResponse({
    status: 200,
    description: 'List of recently registered companies',
    type: CompaniesResponseDto,
  })
  async recentCompanies(): Promise<CompaniesResponseDto> {
    return this.findCompaniesUseCase.execute();
  }

  @Get('with-transfers-last-month')
  @ApiOperation({ summary: 'Get companies with transfers in the last month' })
  @ApiResponse({
    status: 200,
    description: 'List of companies with recent transfers',
    type: CompaniesResponseDto,
  })
  async recentTransfers(): Promise<CompaniesResponseDto> {
    return this.findCompanyTransfers.execute();
  }
}
