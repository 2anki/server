import express from 'express';
import { getDatabase } from '../../data_layer';
import AuthenticationService from '../../services/AuthenticationService';
import TokenRepository from '../../data_layer/TokenRepository';
import UsersRepository from '../../data_layer/UsersRepository';
import { configureUserLocal } from '../../routes/middleware/configureUserLocal';
import { sendIndex } from './sendIndex';
import { getDefaultEmailService } from '../../services/EmailService/EmailService';

class IndexController {
  public getIndex(request: express.Request, response: express.Response) {
    const database = getDatabase();
    const authService = new AuthenticationService(
      new TokenRepository(database),
      new UsersRepository(database)
    );
    configureUserLocal(request, response, authService, database).then(() => {
      sendIndex(response);
    });
  }

  async contactUs(req: express.Request, res: express.Response) {
    const { name, email, message } = req.body;
    console.info('Contact Us', name, email, message);
    if (!email || !message) {
      return res.status(400).send({ error: 'Missing email or message' });
    }

    const attachments = Array.isArray(req.files) ? req.files : [];
    const database = getDatabase();

    await database('feedback').insert({
      name,
      email,
      message,
      attachments: JSON.stringify(attachments.map((a) => a.originalname)),
    });

    const emailService = getDefaultEmailService();
    emailService.sendContactEmail(name, email, message, attachments).catch((err) => {
      console.error('Failed to send contact email notification', err);
    });

    return res.status(200).send();
  }
}

export default IndexController;
