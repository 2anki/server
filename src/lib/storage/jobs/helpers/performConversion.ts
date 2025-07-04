import express from 'express';

import StorageHandler from '../../StorageHandler';
import { Knex } from 'knex';
import NotionAPIWrapper from '../../../../services/NotionService/NotionAPIWrapper';
import { isPaying } from '../../../isPaying';
import JobRepository from '../../../../data_layer/JobRepository';
import { FindOrCreateJobUseCase } from '../../../../usecases/jobs/FindOrCreateJobUseCase';
import { CheckInProgressJobUseCase } from '../../../../usecases/jobs/CheckInProgressJobUseCase';
import { CheckJobLimitUseCase } from '../../../../usecases/jobs/CheckJobLimitUseCase';
import { CancelJobUseCase } from '../../../../usecases/jobs/CancelJobUseCase';
import { StartJobUseCase } from '../../../../usecases/jobs/StartJobUseCase';
import { CreateJobWorkSpaceUseCase } from '../../../../usecases/jobs/CreateJobWorkSpaceUseCase';
import { CreateFlashcardsForJobUseCase } from '../../../../usecases/jobs/CreateFlashcardsForJobUseCase';
import { SetJobFailedUseCase } from '../../../../usecases/jobs/SetJobFailedUseCase';
import { BuildDeckForJobUseCase } from '../../../../usecases/jobs/BuildDeckForJobUseCase';
import { CompleteJobUseCase } from '../../../../usecases/jobs/CompleteJobUseCase';
import { NotifyUserUseCase } from '../../../../usecases/jobs/NotifyUserUseCase';

interface ConversionRequest {
  title: string;
  api: NotionAPIWrapper;
  id: string;
  owner: string;
  res: express.Response | null;
  type?: string;
}

export default async function performConversion(
  database: Knex,
  { title, api, id, owner, res, type }: ConversionRequest
) {
  console.log(`Performing conversion for ${id}`);
  // We need to keep track of whether the user is waiting for a response
  let waitingResponse = true;

  const storage = new StorageHandler();
  const jobRepository = new JobRepository(database);

  const findOrCreateJobUseCase = new FindOrCreateJobUseCase(jobRepository);

  const job = await findOrCreateJobUseCase.execute({
    id,
    owner,
    title,
    type: type || 'conversion',
  });

  try {
    const checkInProgress = new CheckInProgressJobUseCase(jobRepository);
    const hasInProgressJob = await checkInProgress.execute(id, owner);
    if (!hasInProgressJob) {
      console.log(`job ${id} was not started. Job is already active.`);
      return res ? res.redirect('/uploads') : null;
    }

    const checkLimit = new CheckJobLimitUseCase(jobRepository);
    // Max jobs allowed for free users
    const maxJobs = !isPaying(res?.locals) ? 1 : Infinity;
    const canCreateJob = await checkLimit.execute({ owner, maxJobs });

    if (!canCreateJob) {
      const cancelJob = new CancelJobUseCase(jobRepository);
      await cancelJob.execute({
        id,
        owner,
        reason: 'You have reached the limit of free jobs. Max 1 at a time.',
      });
      return res ? res.redirect('/uploads') : null;
    }

    console.log(`job ${id} is not active, starting`);
    const startJob = new StartJobUseCase(jobRepository);
    await startJob.execute({ id, owner });

    /**
     * We do not know how long the job takes to complete, so we need to
     * give the user a response immediately.
     */
    if (res) {
      waitingResponse = false;
      res.status(200).send();
    }

    const createWorkSpace = new CreateJobWorkSpaceUseCase(jobRepository);
    const { ws, exporter, settings, bl, rules } = await createWorkSpace.execute(
      { api, id, owner, jobRepository }
    );

    const createFlashcards = new CreateFlashcardsForJobUseCase(jobRepository);
    const decks = await createFlashcards.execute({
      bl,
      id,
      owner,
      rules,
      settings,
      type,
    });
    if (!decks || decks.length === 0) {
      const setJobFailed = new SetJobFailedUseCase(jobRepository);
      await setJobFailed.execute(
        id,
        owner,
        'No decks created, please try again or contact support with' +
          id +
          '.' +
          job.id
      );
      return;
    }

    const buildDeck = new BuildDeckForJobUseCase(jobRepository);
    const { size, key, apkg } = await buildDeck.execute({
      bl,
      exporter,
      decks,
      ws,
      settings,
      storage,
      id,
      owner,
    });

    const notifyUser = new NotifyUserUseCase(jobRepository);
    await notifyUser.execute({
      owner,
      rules,
      db: database,
      size,
      key,
      id,
      apkg,
    });

    const completeJob = new CompleteJobUseCase(jobRepository);
    await completeJob.execute(id, owner);
  } catch (error) {
    const failedJob = new SetJobFailedUseCase(jobRepository);
    await failedJob.execute(id, owner, 'Technical error ' + error);

    // The User is still waiting and has not received a response yet
    if (waitingResponse) {
      res?.status(400).send('conversion failed.');
    }
    console.error(error);
  }
}
