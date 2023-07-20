import path from 'path';
import os from 'os';

export const setupTests = () => {
  process.env.WORKSPACE_BASE = path.join(os.tmpdir(), 'workspaces');
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'time').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
};
