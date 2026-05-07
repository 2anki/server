import { AnkifyNotionSubscriptionsRepositoryInterface } from '../../data_layer/ankify/AnkifyNotionSubscriptionsRepository';

export class DeleteNotionSubscriptionUseCase {
  constructor(
    private readonly repo: AnkifyNotionSubscriptionsRepositoryInterface
  ) {}

  async execute(id: number, owner: number): Promise<void> {
    await this.repo.deleteById(id, owner);
  }
}
