import { Injectable } from '@nestjs/common';
import { CompanyRepository } from 'src/core/domain/ports/company.repository';
import { PrismaService } from '../database/orm/prisma/prisma.service';
import { Company } from 'src/core/domain/entities/company.entity';

@Injectable()
export class SqliteCompanyRepository extends CompanyRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(company: Company): Promise<void> {
    await this.prisma.company.create({ data: { ...company } });
  }

  async findById(id: string): Promise<Company | null> {
    const result = await this.prisma.company.findUnique({ where: { id } });
    return result
      ? new Company(
          result.id,
          result.name,
          result.type,
          result.hasRecentTransfers,
          result.registeredAt,
        )
      : null;
  }

  async findRegisteredLastMonth(): Promise<Company[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - 1);

    const results = await this.prisma.company.findMany({
      where: { registeredAt: { gte: since } },
    });

    return results.map(
      (r) =>
        new Company(r.id, r.name, r.type, r.hasRecentTransfers, r.registeredAt),
    );
  }

  async findCompanyIdsWithTransfersSince(date: Date): Promise<string[]> {
    const transfers = await this.prisma.company.findMany({
      where: {
        hasRecentTransfers: true,
        registeredAt: { gte: date },
      },
      select: {
        id: true,
      },
    });

    return transfers.map((t) => t.id);
  }
}
