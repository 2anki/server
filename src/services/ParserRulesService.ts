import ParserRulesRepository from '../data_layer/ParserRulesRepository';

class ParserRulesService {
  constructor(private readonly repository: ParserRulesRepository) {}

  createRule(id: string, owner: string, payload: { [key: string]: string }) {
    return this.repository.create(id, owner, payload);
  }

  getById(id: string) {
    return this.repository.getById(id);
  }
}

export default ParserRulesService;
