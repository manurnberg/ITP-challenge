import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from 'src/infraestructure/http-server/api/controllers/company.controller';
import { RegisterCompanyUseCase } from 'src/core/application/services/register-company.usecase';
import { FindCompaniesRegisterUseCase } from 'src/core/application/services/list-registered-companies.usecase';
import { RegisterCompanyDto } from 'src/infraestructure/http-server/api/dtos/register-company.dto';
import { CompanyType } from 'src/core/domain/value-objects/company-type.vo';
import { CompaniesResponseDto } from 'src/infraestructure/http-server/api/dtos';
import { FindCompaniesWithRecentTransfersUseCase } from 'src/core/application/services/list-companies-with-transfers.usecase';

// Mock services
const mockRegisterCompanyUseCase = {
  execute: jest.fn(),
};
const mockFindCompaniesRegisterUseCase = {
  execute: jest.fn(),
};

const mockFindCompaniesWithRecentTransfersUseCase = {
  execute: jest.fn(),
};

describe('CompanyController', () => {
  let companyController: CompanyController;
  let findCompaniesWithRecentTransfersUseCase: FindCompaniesWithRecentTransfersUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: RegisterCompanyUseCase,
          useValue: mockRegisterCompanyUseCase,
        },
        {
          provide: FindCompaniesRegisterUseCase,
          useValue: mockFindCompaniesRegisterUseCase,
        },
        {
          provide: FindCompaniesWithRecentTransfersUseCase,
          useValue: mockFindCompaniesWithRecentTransfersUseCase,
        },
      ],
    }).compile();

    companyController = module.get<CompanyController>(CompanyController);
    findCompaniesWithRecentTransfersUseCase =
      module.get<FindCompaniesWithRecentTransfersUseCase>(
        FindCompaniesWithRecentTransfersUseCase,
      );
  });

  describe('create', () => {
    it('should call registerUseCase with correct parameters', async () => {
      const dto: RegisterCompanyDto = {
        name: 'Test Company',
        type: CompanyType.PYME,
      };
      await companyController.create(dto);
      expect(mockRegisterCompanyUseCase.execute).toHaveBeenCalledWith(
        dto.name,
        dto.type,
      );
    });

    it('should handle errors thrown by registerUseCase', async () => {
      mockRegisterCompanyUseCase.execute.mockRejectedValueOnce(
        new Error('Error registering company'),
      );
      const dto: RegisterCompanyDto = {
        name: 'Test Company',
        type: CompanyType.CORPORATE,
      };
      await expect(companyController.create(dto)).rejects.toThrow(
        'Error registering company',
      );
    });

    it('should handle empty body gracefully', async () => {
      const dto = {} as RegisterCompanyDto;
      await expect(companyController.create(dto)).resolves.not.toThrow();
      expect(mockRegisterCompanyUseCase.execute).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
  });

  describe('recent', () => {
    it('should call findCompaniesUseCase.execute', async () => {
      await companyController.recentCompanies();
      expect(mockFindCompaniesRegisterUseCase.execute).toHaveBeenCalled();
    });

    it('should return the result from findCompaniesUseCase', async () => {
      const mockResult = [{ name: 'Test Company', type: CompanyType.PYME }];
      mockFindCompaniesRegisterUseCase.execute.mockResolvedValueOnce(
        mockResult,
      );
      expect(await companyController.recentCompanies()).toBe(mockResult);
    });

    it('should handle errors thrown by findCompaniesUseCase', async () => {
      mockFindCompaniesRegisterUseCase.execute.mockRejectedValueOnce(
        new Error('Error finding companies'),
      );
      await expect(companyController.recentCompanies()).rejects.toThrow(
        'Error finding companies',
      );
    });
  });

  describe('getCompaniesWithTransfers', () => {
    it('should return companies with recent transfers successfully', async () => {
      const result: CompaniesResponseDto = {
        companies: [
          {
            id: '123',
            name: 'Company A',
            type: CompanyType.PYME,
            registeredAt: undefined,
          },
        ],
      };

      (
        findCompaniesWithRecentTransfersUseCase.execute as jest.Mock
      ).mockResolvedValue(result);

      expect(await companyController.recentTransfers()).toBe(result);
      expect(
        findCompaniesWithRecentTransfersUseCase.execute,
      ).toHaveBeenCalled();
    });

    it('should handle errors during fetching companies with recent transfers', async () => {
      (
        findCompaniesWithRecentTransfersUseCase.execute as jest.Mock
      ).mockImplementation(() => {
        throw new Error('Unable to fetch companies');
      });

      await expect(companyController.recentTransfers()).rejects.toThrow(
        'Unable to fetch companies',
      );
      expect(
        findCompaniesWithRecentTransfersUseCase.execute,
      ).toHaveBeenCalled();
    });
  });
});
