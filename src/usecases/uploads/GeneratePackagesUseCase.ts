import Package from '../../lib/parser/Package';
import CardOption from '../../lib/parser/Settings/CardOption';
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
    settings: CardOption,
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
