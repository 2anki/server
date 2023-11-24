import Settings from '../../lib/parser/Settings';
import GeneratePackagesUseCase from '../../usecases/uploads/GeneratePackagesUseCase';
import { UploadedFile } from '../../lib/storage/types';

export const createPackages = async (
  files: UploadedFile[],
  patreon: boolean,
  body: { [key: string]: string } = {}
) => {
  const settings = new Settings(body);

  const useCase = new GeneratePackagesUseCase();
  const { packages } = await useCase.execute(patreon, files, settings);

  return packages;
};
