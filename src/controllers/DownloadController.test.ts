import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import DownloadRouter from '../routes/DownloadRouter'; // Assuming this sets up the app or router
import dotenv from 'dotenv';

// Load environment variables from .env.test if it exists
dotenv.config({ path: '.env.test' });

// Set a default WORKSPACE_BASE if not already set in the environment for testing
const WORKSPACE_BASE_DEFAULT = path.join(__dirname, '..', '..', 'test_workspaces'); // Adjust as necessary
process.env.WORKSPACE_BASE = process.env.WORKSPACE_BASE || WORKSPACE_BASE_DEFAULT;

const app = express();
// Ensure body parsing middleware is used if your app normally uses it, although for GET it's not critical
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(DownloadRouter()); // Mount the download router

describe('DownloadController Integration Tests - /download/:id/zip', () => {
  const testWorkspaceId = 'test-workspace-zip';
  const workspacePath = path.join(process.env.WORKSPACE_BASE!, testWorkspaceId);
  const apkgFile1Name = 'test1.apkg';
  const apkgFile2Name = 'test2.apkg';
  const nonApkgFileName = 'notes.txt';
  const apkgFile1Path = path.join(workspacePath, apkgFile1Name);
  const apkgFile2Path = path.join(workspacePath, apkgFile2Name);
  const nonApkgFilePath = path.join(workspacePath, nonApkgFileName);

  beforeAll(() => {
    // Create workspace directory
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }
    // Create dummy .apkg files and one non-apkg file
    fs.writeFileSync(apkgFile1Path, 'dummy apkg content 1');
    fs.writeFileSync(apkgFile2Path, 'dummy apkg content 2');
    fs.writeFileSync(nonApkgFilePath, 'some notes');
  });

  afterAll(() => {
    // Clean up workspace directory
    if (fs.existsSync(workspacePath)) {
      fs.rmSync(workspacePath, { recursive: true, force: true });
    }
  });

  test('should download all .apkg files as a ZIP archive', async () => {
    const response = await request(app)
      .get(`/download/${testWorkspaceId}/zip`)
      .expect(200);

    expect(response.headers['content-type']).toBe('application/zip');
    expect(response.headers['content-disposition']).toBe(`attachment; filename="${testWorkspaceId}.zip"`);

    // Verify the ZIP content
    const zip = new AdmZip(response.body); // response.body will be a Buffer
    const zipEntries = zip.getEntries();

    expect(zipEntries.length).toBe(2); // Only .apkg files

    const entry1 = zipEntries.find(e => e.entryName === apkgFile1Name);
    expect(entry1).toBeDefined();
    if (entry1) {
      expect(entry1.getData().toString('utf8')).toBe('dummy apkg content 1');
    }

    const entry2 = zipEntries.find(e => e.entryName === apkgFile2Name);
    expect(entry2).toBeDefined();
    if (entry2) {
      expect(entry2.getData().toString('utf8')).toBe('dummy apkg content 2');
    }

    // Ensure non-apkg file is not included
    const nonApkgEntry = zipEntries.find(e => e.entryName === nonApkgFileName);
    expect(nonApkgEntry).toBeUndefined();
  });

  test('should return 404 if workspace ID does not exist', async () => {
    await request(app)
      .get('/download/nonexistent-workspace/zip')
      .expect(404);
  });

  test('should return 404 if workspace contains no .apkg files', async () => {
    const emptyWorkspaceId = 'empty-workspace';
    const emptyWorkspacePath = path.join(process.env.WORKSPACE_BASE!, emptyWorkspaceId);
    if (!fs.existsSync(emptyWorkspacePath)) {
      fs.mkdirSync(emptyWorkspacePath, { recursive: true });
    }
    fs.writeFileSync(path.join(emptyWorkspacePath, 'only_text.txt'), 'not an apkg');

    await request(app)
      .get(`/download/${emptyWorkspaceId}/zip`)
      .expect(404)
      .then(response => {
        expect(response.text).toBe('No .apkg files found in the workspace.');
      });
      
    if (fs.existsSync(emptyWorkspacePath)) {
      fs.rmSync(emptyWorkspacePath, { recursive: true, force: true });
    }
  });
});
