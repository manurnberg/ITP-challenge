import { Test, TestingModule } from '@nestjs/testing';
import { RegisterCompanyUseCase } from 'src/core/application/services/register-company.usecase';
import { CompanyRepository } from 'src/core/domain/ports/company.repository';
import { Company } from 'src/core/domain/entities/company.entity';
import { CompanyRepositoryToken } from 'src/core/domain/constants/company.repository.token';
import { GlobalLogger } from 'src/shared/logger/service/global-logger.service';
import { InternalServerErrorException } from '@nestjs/common';
import { CompanyType } from 'src/core/domain/value-objects/company-type.vo';

const mockCompanyRepository = () => ({
  save: jest.fn(),
});

const mockGlobalLogger = () => ({
  log: jest.fn(),
  error: jest.fn(),
});

describe('RegisterCompanyUseCase', () => {
  let useCase: RegisterCompanyUseCase;
  let companyRepository;
  let logger: GlobalLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterCompanyUseCase,
        { provide: CompanyRepositoryToken, useFactory: mockCompanyRepository },
        { provide: GlobalLogger, useFactory: mockGlobalLogger },
      ],
    }).compile();

    useCase = module.get<RegisterCompanyUseCase>(RegisterCompanyUseCase);
    companyRepository = module.get<CompanyRepository>(CompanyRepositoryToken);
    logger = module.get<GlobalLogger>(GlobalLogger);
  });

  describe('execute', () => {
    const companyName = 'TestCompany';
    const companyType = CompanyType.PYME;

    it('should successfully register a company', async () => {
      companyRepository.save.mockResolvedValue(undefined);

      const result = await useCase.execute(companyName, companyType);

      expect(companyRepository.save).toHaveBeenCalledWith(expect.any(Company));
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Company registered'),
        'Register Company',
      );
      expect(result.name).toBe(companyName);
      expect(result.type).toBe(companyType);
    });

    it('should throw an error if company saving fails', async () => {
      companyRepository.save.mockRejectedValue(new Error('Failed to save'));

      await expect(useCase.execute(companyName, companyType)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to register company'),
        expect.any(String),
        'Register Company',
      );
    });

    it('should log detailed error if saving throws an error', async () => {
      const error = new Error('Database error');
      companyRepository.save.mockRejectedValue(error);

      await expect(useCase.execute(companyName, companyType)).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        `Failed to register company: ${error.message}`,
        error.stack,
        'Register Company',
      );
    });
  });
});
