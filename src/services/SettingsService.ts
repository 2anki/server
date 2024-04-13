import SettingsRepository from '../data_layer/SettingsRepository';
import { SettingsInitializer } from '../data_layer/public/Settings';

export interface IServiceSettings {
  create: (settings: SettingsInitializer) => Promise<number[]>;
  delete: (owner: string, id: string) => Promise<void>;
  getById: (id: string) => Promise<SettingsInitializer>;
}

class SettingsService implements IServiceSettings {
  constructor(private readonly repository: SettingsRepository) {}

  create({ owner, payload, object_id }: SettingsInitializer) {
    return new Promise<number[]>((resolve, reject) => {
      return this.repository
        .create({
          owner,
          payload,
          object_id,
        })
        .then((settings) => {
          resolve(settings);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  delete(owner: string, id: string) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.repository.delete(owner, id);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  getById(id: string) {
    return this.repository.getById(id);
  }
}

export default SettingsService;
