import { IEventsRepository } from '../../data_layer/EventsRepository';

export class EventsQueryService {
  constructor(private readonly repository: IEventsRepository) {}

  countByName(name: string, since: Date): Promise<number> {
    return this.repository.countByName(name, since);
  }

  countDistinctUsers(name: string, since: Date): Promise<number> {
    return this.repository.countDistinctUsers(name, since);
  }

  countByNameForUser(
    name: string,
    since: Date,
    userId: number | null,
    anonymousId: string | null
  ): Promise<number> {
    return this.repository.countByNameForUser(name, since, userId, anonymousId);
  }
}
