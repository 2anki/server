import TemplatesRepository from '../../data_layer/TemplatesRepository';

export class TemplateService {
  constructor(private readonly repository: TemplatesRepository) {}

  create(owner: string, templates: unknown) {
    return this.repository.create({
      owner,
      payload: templates,
    });
  }

  findByOwner(owner: string) {
    return this.repository.findByOwner(owner);
  }

  delete(owner: string) {
    return this.repository.delete(owner);
  }
}
