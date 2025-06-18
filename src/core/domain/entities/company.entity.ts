export class Company {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: string,
    public readonly hasRecentTransfers: boolean,
    public readonly registeredAt: Date = new Date(),
  ) {}
}
