import { AnkifyClient } from '../../entities/ankify';
import { RacService } from '../../services/ankify/RacService';

class ProvisionAnkifyClientUseCase {
  constructor(private readonly rac: RacService) {}

  execute(owner: number): Promise<AnkifyClient> {
    return this.rac.provision(owner);
  }
}

export default ProvisionAnkifyClientUseCase;
