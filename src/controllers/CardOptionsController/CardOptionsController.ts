import { Request, Response } from 'express';
import { IServiceSettings } from '../../services/SettingsService';
import { getOwner } from '../../lib/User/getOwner';
import supportedOptions from './supportedOptions';
import CardOption from '../../lib/parser/Settings/CardOption';
import { CardOptionDetail } from './CardOptionDetail';

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
      console.info('Create setting failed');
      console.error(error);
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
      console.info('Delete setting failed');
      console.error(error);
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
      console.info('Get setting failed');
      console.error(error);
      res.status(400).send();
    }
  }

  getDefaultCardOptions(source: 'client' | 'server') {
    if (source === 'client') {
      return this.getDefaultCardOptionDetails()
        .map((option: CardOptionDetail) => {
          return { [option.key]: option.value.toString() };
        })
        .reduce((accumulator, current) => {
          return { ...accumulator, ...current };
        }, {});
    }
    return CardOption.LoadDefaultOptions();
  }

  getDefaultCardOptionDetails() {
    return supportedOptions();
  }
}

export default CardOptionsController;
