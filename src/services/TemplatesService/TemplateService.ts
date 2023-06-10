import TemplatesRepository from '../../data_layer/TemplatesRepository';

export class TemplateService {
  constructor(private readonly repository: TemplatesRepository) {}

  create(owner: string, templates: unknown) {
    return this.repository.create({
      owner: owner,
      payload: templates,
    });
  }

  delete(owner: string) {
    return this.repository.delete(owner);
  }
}
