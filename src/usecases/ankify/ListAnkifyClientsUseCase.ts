import { AnkifyClient } from '../../entities/ankify';
import { RacService } from '../../services/ankify/RacService';

class ListAnkifyClientsUseCase {
  constructor(private readonly rac: RacService) {}

  execute(owner: number): Promise<AnkifyClient[]> {
    return this.rac.list(owner);
  }
}

export default ListAnkifyClientsUseCase;
