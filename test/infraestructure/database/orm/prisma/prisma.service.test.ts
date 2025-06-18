import { PrismaService } from 'src/infraestructure/database/orm/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { ConfigManager } from 'src/infraestructure/config/config-manager';
import { jest } from '@jest/globals';

jest.mock('@prisma/client', () => {
  const $connect = jest.fn();
  const $disconnect = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect,
      $disconnect,
      onModuleInit: async () => $connect(),
      onModuleDestroy: async () => $disconnect(),
      datasources: {
        db: {
          url: '',
        },
      },
    })),
  };
});

jest.mock('src/infraestructure/config/config-manager', () => {
  return {
    ConfigManager: {
      get: jest.fn().mockImplementation((key: string, defaultValue: string) => {
        if (key === 'DATABASE_URL')
          return process.env.DATABASE_URL || defaultValue;
        return defaultValue;
      }),
    },
  };
});

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should call $connect on onModuleInit', async () => {
    await prismaService.onModuleInit();
    expect(prismaService.$connect).toHaveBeenCalled();
  });

  it('should call $disconnect on onModuleDestroy', async () => {
    await prismaService.onModuleDestroy();
    expect(prismaService.$disconnect).toHaveBeenCalled();
  });

  it('should initialize with correct database url from environment variable or default', () => {
    const defaultUrl = 'file:./dev.db';
    process.env.DATABASE_URL = 'mysql://user:password@localhost:3306/mydb';
    jest.clearAllMocks();
    prismaService = new PrismaService();
    expect(ConfigManager.get).toHaveBeenCalledWith('DATABASE_URL', defaultUrl);
    expect(
      ((PrismaClient as jest.Mock).mock.calls[0][0] as any).datasources.db.url,
    ).toBe('mysql://user:password@localhost:3306/mydb');

    delete process.env.DATABASE_URL;
    jest.clearAllMocks();
    prismaService = new PrismaService();
    expect(ConfigManager.get).toHaveBeenCalledWith('DATABASE_URL', defaultUrl);
    expect(
      ((PrismaClient as jest.Mock).mock.calls[0][0] as any).datasources.db.url,
    ).toBe(defaultUrl);
  });
});
