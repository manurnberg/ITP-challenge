import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Company } from '@prisma/client';
import { CompanyRepositoryToken } from 'src/core/domain/constants/company.repository.token';
import { GlobalLogger } from 'src/shared/logger/service/global-logger.service';
import { FindCompaniesRegisterUseCase } from 'src/core/application/services/list-registered-companies.usecase';
import { CompanyType } from 'src/core/domain/value-objects/company-type.vo';

const mockCompanyRepository = {
  findRegisteredLastMonth: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('FindCompaniesRegisterUseCase', () => {
  let useCase: FindCompaniesRegisterUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindCompaniesRegisterUseCase,
        {
          provide: CompanyRepositoryToken,
          useValue: mockCompanyRepository,
        },
        {
          provide: GlobalLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    useCase = module.get<FindCompaniesRegisterUseCase>(
      FindCompaniesRegisterUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of companies if repository call succeeds', async () => {
    const date = new Date();
    const companies: Company[] = [
      {
        id: '1',
        name: 'Company A',
        registeredAt: date,
        type: CompanyType.PYME,
        hasRecentTransfers: false,
      },
      {
        id: '2',
        name: 'Company B',
        registeredAt: date,
        type: CompanyType.CORPORATE,
        hasRecentTransfers: true,
      },
    ];

    mockCompanyRepository.findRegisteredLastMonth.mockResolvedValue(companies);

    const result = await useCase.execute();

    expect(result).toEqual({
      companies: companies.map(({ id, name, registeredAt, type }) => ({
        id,
        name,
        registeredAt,
        type,
      })),
    });
    expect(mockCompanyRepository.findRegisteredLastMonth).toHaveBeenCalledTimes(
      1,
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      `Fetched 2 companies registered last month`,
      'Find Companies with recent register',
    );
  });

  it('should throw InternalServerErrorException and log error if repository call fails', async () => {
    const error = new Error('Repository error');
    mockCompanyRepository.findRegisteredLastMonth.mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(mockCompanyRepository.findRegisteredLastMonth).toHaveBeenCalledTimes(
      1,
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error while fetching companies registered in the last month',
      error.stack,
      'Find Companies with recent register',
    );
  });

  it('should return an empty array if no companies were registered in the last month', async () => {
    const companies: Company[] = [];
    mockCompanyRepository.findRegisteredLastMonth.mockResolvedValue(companies);

    const result = await useCase.execute();

    expect(result).toEqual({ companies: [] });
    expect(mockCompanyRepository.findRegisteredLastMonth).toHaveBeenCalledTimes(
      1,
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      `Fetched 0 companies registered last month`,
      'Find Companies with recent register',
    );
  });
});
