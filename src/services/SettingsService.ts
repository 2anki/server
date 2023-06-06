import SettingsRepository from '../data_layer/SettingsRepository';
import { SettingsInitializer } from '../data_layer/public/Settings';

class SettingsService {
  constructor(private readonly repository: SettingsRepository) {}

  create({ owner, payload, object_id }: SettingsInitializer) {
    return this.repository.create({
      owner,
      payload,
      object_id,
    });
  }

  delete(owner: string, id: string) {
    return this.repository.delete(owner, id);
  }

  getById(id: string) {
    return this.repository.getById(id);
  }
}

export default SettingsService;
