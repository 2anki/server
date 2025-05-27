import { createZipArchive } from './archive';
import fs from 'fs';
import path from 'path';
import stream from 'stream';
import AdmZip from 'adm-zip';
import { PassThrough } from 'stream';

// Helper function to collect stream data into a buffer
async function streamToBuffer(readableStream: stream.Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    readableStream.on('error', reject);
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

describe('createZipArchive', () => {
  const tempDir = path.join(__dirname, 'temp_test_files');
  const file1Path = path.join(tempDir, 'file1.txt');
  const file2Path = path.join(tempDir, 'file2.txt');
  const file1Content = 'This is file1.';
  const file2Content = 'This is file2, with more content.';

  beforeAll(() => {
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    // Create dummy files
    fs.writeFileSync(file1Path, file1Content);
    fs.writeFileSync(file2Path, file2Content);
  });

  afterAll(() => {
    // Clean up temp files and directory
    fs.unlinkSync(file1Path);
    fs.unlinkSync(file2Path);
    fs.rmdirSync(tempDir);
  });

  test('should create a ZIP archive with specified files', async () => {
    const filesToArchive = [
      { filePath: file1Path, name: 'file1.txt' },
      { filePath: file2Path, name: 'subfolder/file2_renamed.txt' },
    ];

    const zipStream = createZipArchive(filesToArchive);
    expect(zipStream).toBeInstanceOf(PassThrough); // Check if it returns a PassThrough stream

    const zipBuffer = await streamToBuffer(zipStream);

    // Verify the ZIP content
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();

    expect(zipEntries.length).toBe(2);

    // Entry 1: file1.txt
    const entry1 = zipEntries.find(e => e.entryName === 'file1.txt');
    expect(entry1).toBeDefined();
    if (entry1) {
      expect(entry1.getData().toString('utf8')).toBe(file1Content);
    }

    // Entry 2: subfolder/file2_renamed.txt
    const entry2 = zipEntries.find(e => e.entryName === 'subfolder/file2_renamed.txt');
    expect(entry2).toBeDefined();
    if (entry2) {
      expect(entry2.getData().toString('utf8')).toBe(file2Content);
    }
  });

  test('should handle non-existent files gracefully', async () => {
    const nonExistentFilePath = path.join(tempDir, 'nonexistent.txt');
    const filesToArchive = [
      { filePath: file1Path, name: 'file1.txt' },
      { filePath: nonExistentFilePath, name: 'nonexistent.txt' },
    ];

    // Mock console.error to check for the warning, as the current implementation logs an error.
    // In a more robust setup, the stream would emit an 'error' event for file not found,
    // which could be tested here.
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const zipStream = createZipArchive(filesToArchive);
    const zipBuffer = await streamToBuffer(zipStream);

    // Verify the ZIP content
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();

    expect(zipEntries.length).toBe(1); // Only file1.txt should be present

    const entry1 = zipEntries.find(e => e.entryName === 'file1.txt');
    expect(entry1).toBeDefined();
    if (entry1) {
      expect(entry1.getData().toString('utf8')).toBe(file1Content);
    }

    // Check if console.error was called for the missing file
    expect(consoleErrorSpy).toHaveBeenCalledWith(`File not found: ${nonExistentFilePath}, skipping.`);
    
    consoleErrorSpy.mockRestore(); // Restore original console.error
  });
});
