import { Handler } from 'express';
import { INDEX_FILE } from '../../lib/constants';

const search = function (): Handler {
  return (_req, res) => {
    res.sendFile(INDEX_FILE);
  };
};

export { search };
