import RulesRepository from '../data_layer/RulesRepository';

class RulesService {
  constructor(private readonly repository: RulesRepository) {}

  createRule(id: string, owner: string, payload: { [key: string]: string }) {
    return this.repository.create(id, owner, payload);
  }

  getById(id: string) {
    return this.repository.getById(id);
  }
}

export default RulesService;
