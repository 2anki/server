import { Handler } from 'express';
import { INDEX_FILE } from '../../lib/constants';
import TokenHandler from '../../lib/misc/TokenHandler';

const login = function (): Handler {
  return async (req, res) => {
    const user = await TokenHandler.GetUserFrom(req.cookies.token);
    if (!user) {
      res.sendFile(INDEX_FILE);
    } else {
      res.redirect('/search');
    }
  };
};

export { login };
