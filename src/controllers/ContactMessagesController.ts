import express from 'express';
import { getDatabase } from '../data_layer';

class ContactMessagesController {
  async list(_req: express.Request, res: express.Response) {
    const database = getDatabase();
    const messages = await database('feedback')
      .select(
        'id',
        'name',
        'email',
        'message',
        'attachments',
        'is_acknowledged',
        'created_at'
      )
      .orderBy('created_at', 'desc');
    return res.json(messages);
  }

  async acknowledge(req: express.Request, res: express.Response) {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const database = getDatabase();
    await database('feedback').where({ id }).update({ is_acknowledged: true });
    return res.status(200).send();
  }
}

export default ContactMessagesController;
