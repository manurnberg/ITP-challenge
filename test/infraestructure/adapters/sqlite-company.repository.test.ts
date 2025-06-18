import { Test, TestingModule } from '@nestjs/testing';
import { SqliteCompanyRepository } from 'src/infraestructure/adapters/sqlite-company.repository';
import { PrismaService } from 'src/infraestructure/database/orm/prisma/prisma.service';
import { Company } from 'src/core/domain/entities/company.entity';
import { CompanyType } from 'src/core/domain/value-objects/company-type.vo';

const mockPrismaService = {
  company: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
} as unknown as PrismaService;

describe('SqliteCompanyRepository', () => {
  let repository: SqliteCompanyRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqliteCompanyRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<SqliteCompanyRepository>(SqliteCompanyRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a company', async () => {
      const date = new Date();
      const company = new Company(
        '1',
        'Test Company',
        CompanyType.CORPORATE,
        false,
        date,
      );
      await repository.save(company);
      expect(prismaService.company.create).toHaveBeenCalledWith({
        data: { ...company },
      });
    });

    it('should throw an error if company cannot be created', async () => {
      const date = new Date();
      (prismaService.company.create as jest.Mock).mockRejectedValueOnce(
        new Error('Create Error'),
      );
      const company = new Company(
        '1',
        'Test Company',
        CompanyType.PYME,
        true,
        date,
      );

      await expect(repository.save(company)).rejects.toThrow('Create Error');
    });
  });

  describe('findById', () => {
    it('should find a company by id', async () => {
      const date = new Date();
      const companyData = {
        id: '1',
        name: 'Test Company',
        type: CompanyType.PYME,
        hasRecentTransfers: true,
        registeredAt: date,
      };
      (prismaService.company.findUnique as jest.Mock).mockResolvedValueOnce(
        companyData,
      );

      const result = await repository.findById('1');
      expect(result).toEqual(
        new Company('1', 'Test Company', CompanyType.PYME, true, date),
      );
      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if company is not found', async () => {
      (prismaService.company.findUnique as jest.Mock).mockResolvedValueOnce(
        null,
      );

      const result = await repository.findById('1');
      expect(result).toBeNull();
      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('findRegisteredLastMonth', () => {
    it('should find companies registered last month', async () => {
      const dateNow = new Date();
      const dateLastMonth = new Date();
      dateLastMonth.setMonth(dateNow.getMonth() - 1);
      const companiesData = [
        {
          id: '1',
          name: 'Test Company 1',
          type: CompanyType.CORPORATE,
          hasRecentTransfers: false,
          registeredAt: dateNow,
        },
        {
          id: '2',
          name: 'Test Company 2',
          type: CompanyType.PYME,
          hasRecentTransfers: true,
          registeredAt: dateNow,
        },
      ];

      (prismaService.company.findMany as jest.Mock).mockResolvedValueOnce(
        companiesData,
      );

      const result = await repository.findRegisteredLastMonth();
      expect(result).toEqual([
        new Company(
          '1',
          'Test Company 1',
          CompanyType.CORPORATE,
          false,
          dateNow,
        ),
        new Company('2', 'Test Company 2', CompanyType.PYME, true, dateNow),
      ]);
      expect(prismaService.company.findMany).toHaveBeenCalledWith({
        where: { registeredAt: { gte: expect.any(Date) } },
      });
    });

    it('should return an empty array when no companies are found', async () => {
      (prismaService.company.findMany as jest.Mock).mockResolvedValueOnce([]);

      const result = await repository.findRegisteredLastMonth();
      expect(result).toEqual([]);
      expect(prismaService.company.findMany).toHaveBeenCalled();
    });
  });

  describe('findCompanyIdsWithTransfersSince', () => {
    it('should return companyIds of transfers since given date', async () => {
      const date = new Date();
      const expectedCompanyIds = ['123', '456'];

      (mockPrismaService.company.findMany as jest.Mock).mockResolvedValue([
        { id: '123' },
        { id: '456' },
      ]);

      const result = await repository.findCompanyIdsWithTransfersSince(date);
      expect(result).toEqual(expectedCompanyIds);
    });

    it('should return an empty array if no transfers are found since given date', async () => {
      const date = new Date();

      (mockPrismaService.company.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findCompanyIdsWithTransfersSince(date);
      expect(result).toEqual([]);
    });

    it('should throw an error if findMany fails', async () => {
      const date = new Date();

      (mockPrismaService.company.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(
        repository.findCompanyIdsWithTransfersSince(date),
      ).rejects.toThrow('Database error');
    });
  });
});
