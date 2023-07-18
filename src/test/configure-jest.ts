import path from 'path';
import os from 'os';

export const setupTests = () => {
  process.env.WORKSPACE_BASE = path.join(os.tmpdir(), 'workspaces');
  jest.spyOn(console, 'log').mockImplementation(() => {});
};
