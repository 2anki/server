import NotionAPIWrapper from '../../services/NotionService/NotionAPIWrapper';
import JobRepository from '../../data_layer/JobRepository';
import CustomExporter from '../../lib/parser/exporters/CustomExporter';
import CardOption from '../../lib/parser/Settings';
import { loadSettingsFromDatabase } from '../../lib/parser/Settings/loadSettingsFromDatabase';
import { getDatabase } from '../../data_layer';
import BlockHandler from '../../services/NotionService/BlockHandler/BlockHandler';
import ParserRules from '../../lib/parser/ParserRules';
import Workspace from '../../lib/parser/WorkSpace';

export interface CreateJobWorkSpaceUseCaseInput {
  id: string;
  owner: string;
  api: NotionAPIWrapper;
  jobRepository: JobRepository;
}

export interface CreateJobWorkSpaceUseCaseOutput {
  ws: Workspace; // Corrected type
  exporter: CustomExporter;
  settings: CardOption;
  bl: BlockHandler;
  rules: ParserRules;
}

export class CreateJobWorkSpaceUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(
    input: CreateJobWorkSpaceUseCaseInput
  ): Promise<CreateJobWorkSpaceUseCaseOutput> {
    const updateStatusResult = await this.jobRepository.updateJobStatus(
      input.id,
      input.owner,
      'step1_create_workspace',
      ''
    );

    if (!updateStatusResult) {
      throw new Error('Failed to update job status');
    }

    const { id, owner, api } = input;

    const ws = new Workspace(true, 'fs');
    console.debug(`using workspace ${ws.location}`);

    const exporter = new CustomExporter('', ws.location);
    // TODO: refactor loadSettingsFromDatabase out
    const settings = await loadSettingsFromDatabase(getDatabase(), owner, id);
    console.debug(`using settings ${JSON.stringify(settings, null, 2)}`);

    const bl = new BlockHandler(exporter, api, settings);
    // TODO: refactor ParserRules.load out
    const rules = await ParserRules.Load(owner, id);
    bl.useAll = rules.UNLIMITED;

    return { ws, exporter, settings, bl, rules };
  }
}
