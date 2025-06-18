import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { FindCompaniesWithRecentTransfersUseCase } from 'src/core/application/services/list-companies-with-transfers.usecase';
import { CompanyRepository } from 'src/core/domain/ports/company.repository';
import { GlobalLogger } from 'src/shared/logger/service/global-logger.service';
import { CompanyRepositoryToken } from 'src/core/domain/constants/company.repository.token';
import { CompanyType } from 'src/core/domain/value-objects/company-type.vo';
import { Company } from 'src/core/domain/entities/company.entity';

describe('FindCompaniesWithRecentTransfersUseCase', () => {
  let useCase: FindCompaniesWithRecentTransfersUseCase;
  let companyRepository: jest.Mocked<CompanyRepository>;
  let logger: jest.Mocked<GlobalLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindCompaniesWithRecentTransfersUseCase,
        {
          provide: CompanyRepositoryToken,
          useValue: {
            findById: jest.fn(),
            findCompanyIdsWithTransfersSince: jest.fn(),
          },
        },
        {
          provide: GlobalLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          } as Partial<GlobalLogger>,
        },
      ],
    }).compile();

    useCase = module.get(FindCompaniesWithRecentTransfersUseCase);
    companyRepository = module.get(
      CompanyRepositoryToken,
    ) as jest.Mocked<CompanyRepository>;
    logger = module.get(GlobalLogger) as jest.Mocked<GlobalLogger>;
  });

  it('should return companies with recent transfers', async () => {
    const now = new Date();

    const mockCompanies = [
      {
        id: '1',
        name: 'Company One',
        type: CompanyType.PYME,
        registeredAt: now,
      },
      {
        id: '2',
        name: 'Company Two',
        type: CompanyType.CORPORATE,
        registeredAt: now,
      },
    ];

    companyRepository.findCompanyIdsWithTransfersSince.mockResolvedValue(
      mockCompanies.map((c) => c.id),
    );

    companyRepository.findById.mockImplementation(async (id: string) => {
      const found = mockCompanies.find((c) => c.id === id);
      if (!found) return null;

      return new Company(
        found.id,
        found.name,
        found.type,
        false,
        found.registeredAt,
      );
    });

    const result = await useCase.execute();

    expect(result.companies).toEqual(
      mockCompanies.map(({ id, name }) => ({ id, name })),
    );
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining('Looking for companies with transfers since:'),
      'Find companies with recent transfers',
    );
    expect(logger.log).toHaveBeenCalledWith(
      'Found 2 companies with recent transfers',
      'Find companies with recent transfers',
    );
  });

  it('should handle no company ids returned by transfer repository', async () => {
    companyRepository.findCompanyIdsWithTransfersSince.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toMatchObject({ companies: [] });
    expect(logger.log).toHaveBeenCalledWith(
      'Found 0 companies with recent transfers',
      'Find companies with recent transfers',
    );
  });

  it('should handle some company ids not found in company repository', async () => {
    const mockCompanyIds = ['1', '2'];
    const now = new Date();

    const mockCompanies = [
      {
        id: '1',
        name: 'Company One',
        type: CompanyType.PYME,
        registeredAt: now,
      },
    ];

    companyRepository.findCompanyIdsWithTransfersSince.mockResolvedValue(
      mockCompanyIds,
    );
    companyRepository.findById.mockImplementation(async (id: string) => {
      const found = mockCompanies.find((c) => c.id === id);
      if (!found) return null;

      return new Company(
        found.id,
        found.name,
        found.type,
        false,
        found.registeredAt,
      );
    });

    const result = await useCase.execute();

    expect(result.companies).toEqual(
      mockCompanies.map(({ id, name }) => ({ id, name })),
    );
    expect(logger.log).toHaveBeenCalledWith(
      'Found 1 companies with recent transfers',
      'Find companies with recent transfers',
    );
  });

  it('should throw InternalServerErrorException if an error occurred', async () => {
    companyRepository.findCompanyIdsWithTransfersSince.mockRejectedValue(
      new Error('Repository Error'),
    );

    await expect(useCase.execute()).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Error while fetching companies with recent transfers',
      expect.any(String),
      'Find companies with recent transfers',
    );
  });
});
