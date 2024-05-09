import express from 'express';

import { getIndexFileContents } from './getIndexFileContents';
import { getDatabase } from '../../data_layer';
import AuthenticationService from '../../services/AuthenticationService';
import TokenRepository from '../../data_layer/TokenRepository';
import UsersRepository from '../../data_layer/UsersRepository';
import { configureUserLocal } from '../../routes/middleware/configureUserLocal';

class IndexController {
  public getIndex(request: express.Request, response: express.Response) {
    const database = getDatabase();
    const authService = new AuthenticationService(
      new TokenRepository(database),
      new UsersRepository(database)
    );
    configureUserLocal(request, response, authService, database).then(() => {
      response.send(
        getIndexFileContents(
          response.locals.patreon,
          response.locals.subscriber
        )
      );
    });
  }
}

export default IndexController;
