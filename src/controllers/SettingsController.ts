import { Request, Response } from 'express';
import TokenRepository from '../data_layer/TokenRepository';
import SettingsRepository from '../data_layer/SettingsRepository';
import { sendError } from '../lib/error/sendError';

class SettingsController {
  constructor(private repository: SettingsRepository) {
    this.repository = repository;
  }

  async createSetting(req: Request, res: Response) {
    console.info(`/settings/create ${req.params.id}`);
    const { settings } = req.body;
    const access = await new TokenRepository().getAccessToken(req);
    this.repository
      .create({
        owner: access.owner.toString(),
        payload: settings,
        object_id: settings.object_id,
      })
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        sendError(err);
        res.status(400).send();
      });
  }

  async deleteSetting(req: Request, res: Response) {
    const access = await new TokenRepository().getAccessToken(req);
    this.repository
      .delete(access.owner, req.params.id)
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        sendError(err);
        res.status(400).send();
      });
  }

  async findSetting(req: Request, res: Response) {
    console.debug(`find settings ${req.params.id}`);
    const { id } = req.params;

    if (!id) {
      return res.status(400).send();
    }

    const storedSettings = await this.repository.getById(id);
    return res.json({ payload: storedSettings });
  }
}

export default SettingsController;
