import { Request, Response } from 'express';
import { sendError } from '../../lib/error/sendError';
import { IServiceSettings } from '../../services/SettingsService';
import { getOwner } from '../../lib/User/getOwner';
import supportedOptions from './supportedOptions';
import CardOption from '../../lib/parser/Settings/CardOption';

class CardOptionsController {
  constructor(private readonly service: IServiceSettings) {}

  async createSetting(req: Request, res: Response) {
    console.info(`/settings/create ${req.params.id}`);
    const { settings } = req.body;
    const owner = getOwner(res);

    try {
      await this.service.create({
        owner: owner,
        payload: settings,
        object_id: settings.object_id,
      });
      res.status(200).send();
    } catch (error) {
      sendError(error);
      res.status(400).send();
    }
  }

  async deleteSetting(req: Request, res: Response) {
    const owner = getOwner(res);
    const { id } = req.params;

    try {
      await this.service.delete(owner, id);
      res.status(200).send();
    } catch (error) {
      sendError(error);
      res.status(400).send();
    }
  }

  async findSetting(req: Request, res: Response) {
    console.debug(`find settings ${req.params.id}`);
    const { id } = req.params;

    if (!id) {
      return res.status(400).send();
    }

    try {
      const storedSettings = await this.service.getById(id);
      return res.json({ payload: storedSettings });
    } catch (error) {
      sendError(error);
      res.status(400).send();
    }
  }

  getDefaultSettingsCardOptions(source: 'client' | 'server') {
    if (source === 'client') {
      return this.getDefaultOptions()
        .map((option: CardOption) => {
          return { [option.key]: option.value.toString() };
        })
        .reduce((accumulator, current) => {
          return { ...accumulator, ...current };
        }, {});
    }
    return CardOption.LoadDefaultOptions();
  }

  getDefaultOptions() {
    return supportedOptions();
  }
}

export default CardOptionsController;
