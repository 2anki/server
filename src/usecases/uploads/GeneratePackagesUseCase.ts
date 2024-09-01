import Package from '../../lib/parser/Package';
import Settings from '../../lib/parser/Settings';
import { UploadedFile } from '../../lib/storage/types';
import { Worker } from 'worker_threads';
import path from 'path';
import Workspace from '../../lib/parser/WorkSpace';

export interface PackageResult {
  packages: Package[];
}

class GeneratePackagesUseCase {
  execute(
    paying: boolean,
    files: UploadedFile[],
    settings: Settings,
    workspace: Workspace
  ): Promise<PackageResult> {
    return new Promise((resolve, reject) => {
      const data = { paying, files, settings, workspace };
      const workerPath = path.resolve(__dirname, './worker.js');
      const worker = new Worker(workerPath, { workerData: { data } });

      worker.on('message', (result: PackageResult) => resolve(result));
      worker.on('error', (error) => reject(error));
    });
  }
}

export default GeneratePackagesUseCase;
