import { readFileSync } from 'fs';
import Workspace from '../../../../lib/parser/WorkSpace';
import { convertXLSXToHTML } from '../convertXLSXToHTML';
import { join } from 'path';

describe('convertXLSXToHTML', () => {
  beforeAll(() => {
    process.env.WORKSPACE_BASE = '/tmp';
  });

  it('should convert XLSX to HTML and save the file', async () => {
    const workspace = new Workspace(true, 'fs');
    const xlsxPath = join(__dirname, '../___mock/sim.xlsx');
    const buffer = readFileSync(xlsxPath);
    const html = convertXLSXToHTML(
      buffer,
      join(workspace.location, 'Simple.html')
    );
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Simple.html');
  });

  afterAll(() => {
    delete process.env.WORKSPACE_BASE;
  });
});
