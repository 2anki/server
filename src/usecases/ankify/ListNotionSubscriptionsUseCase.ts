import { AnkifyNotionSubscription } from '../../entities/ankify';
import { AnkifyNotionSubscriptionsRepositoryInterface } from '../../data_layer/ankify/AnkifyNotionSubscriptionsRepository';

export class ListNotionSubscriptionsUseCase {
  constructor(
    private readonly repo: AnkifyNotionSubscriptionsRepositoryInterface
  ) {}

  execute(owner: number): Promise<AnkifyNotionSubscription[]> {
    return this.repo.listByOwner(owner);
  }
}
