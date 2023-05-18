import express from 'express';
import DB from '../lib/storage/db';
import { purgeBlockCache } from '../routes/upload/purgeBlockCache';
import StorageHandler from '../lib/storage/StorageHandler';
import { sendError } from '../lib/error/sendError';
import { getAllMyJobs } from '../lib/storage/jobs/helpers/getAllStartedJobs.js';
import upload from '../routes/upload/upload';
import { getLimitMessage } from '../lib/misc/getLimitMessage';
import handleUpload from '../routes/upload/helpers/handleUpload';

const deleteUpload = async (req: express.Request, res: express.Response) => {
  const { key } = req.params;
  console.log('delete', key);
  if (!key) {
    return res.status(400).send();
  }
  try {
    const owner = res.locals.owner;
    await DB('uploads').del().where({ owner, key });
    await purgeBlockCache(owner);
    const s = new StorageHandler();
    await s.delete(key);
    console.log('done deleting', key);
  } catch (error) {
    sendError(error);
    return res.status(500).send();
  }
  return res.status(200).send();
};

const deleteJob = async (req: express.Request, res: express.Response) => {
  console.log('delete job', req.params.id);
  try {
    const id = req.params.id;
    await DB('jobs').delete().where({
      id: id,
      owner: res.locals.owner,
    });
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
    sendError(err);
  }
};

const getAllJobs = async (_req: express.Request, res: express.Response) => {
  console.debug('getting active jobs');
  const jobs = await getAllMyJobs(DB, res.locals.owner);
  res.send(jobs);
};

const getUploads = async (_req: express.Request, res: express.Response) => {
  console.debug('download mine');
  try {
    const uploads = await DB('uploads')
      .where({ owner: res.locals.owner })
      .orderBy('id', 'desc')
      .returning('*');
    res.json(uploads);
  } catch (error) {
    sendError(error);
    res.status(400);
  }
};

const file = (req: express.Request, res: express.Response) => {
  const storage = new StorageHandler();
  const handleUploadEndpoint = upload(res, storage);

  handleUploadEndpoint(req, res, (error) => {
    if (error) {
      let msg = error.message;
      if (msg === 'File too large') {
        msg = getLimitMessage();
      } else {
        sendError(error);
      }
      return res.status(500).send(msg);
    }
    handleUpload(storage, req, res);
  });
};

const UploadController = {
  deleteUpload,
  deleteJob,
  getAllJobs,
  getUploads,
  file,
};

export default UploadController;
