import express from 'express';

import { INDEX_FILE } from '../lib/constants';

class IndexController {
  public getIndex(_request: express.Request, response: express.Response) {
    response.sendFile(INDEX_FILE);
  }
}

export default IndexController;
