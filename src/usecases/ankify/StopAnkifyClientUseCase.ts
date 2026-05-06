import { RacService } from '../../services/ankify/RacService';

class StopAnkifyClientUseCase {
  constructor(private readonly rac: RacService) {}

  execute(id: number, owner: number): Promise<void> {
    return this.rac.stop(id, owner);
  }
}

export default StopAnkifyClientUseCase;
