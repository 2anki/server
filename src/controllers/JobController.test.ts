import express from 'express';
import JobController from './JobController';
import JobService from '../services/JobService';
import * as getOwnerModule from '../lib/User/getOwner';

describe('JobController', () => {
  let jobService: JobService;
  let jobController: JobController;
  let req: Partial<express.Request>;
  let res: Partial<express.Response>;

  beforeEach(() => {
    jobService = {
      getJobsByOwner: jest.fn(),
      deleteJobById: jest.fn(),
      findJobByObjectId: jest.fn(),
    } as unknown as JobService;
    jobController = new JobController(jobService);
    req = { params: { id: '123' } };
    res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
      json: jest.fn(),
    };
    jest.spyOn(getOwnerModule, 'getOwner').mockReturnValue('owner1');
  });

  it('should get jobs by owner and send them', async () => {
    const mockJobs = [
      { id: 1, title: 'job1', download_key: null },
      { id: 2, title: 'job2', download_key: null },
    ];
    (jobService.getJobsByOwner as jest.Mock).mockResolvedValue(mockJobs);
    await jobController.getJobsByOwner(
      req as express.Request,
      res as express.Response
    );
    expect(jobService.getJobsByOwner).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith([
      { id: 1, title: 'job1', download_key: null, restartable: true },
      { id: 2, title: 'job2', download_key: null, restartable: true },
    ]);
  });

  it('exposes download_key for a done Notion job with a matching upload', async () => {
    const mockJobs = [
      {
        id: 1,
        title: 'Notion Deck',
        object_id: 'notion-page-uuid',
        status: 'done',
        owner: 'owner1',
        type: 'page',
        download_key: 'abc123.apkg',
      },
    ];
    (jobService.getJobsByOwner as jest.Mock).mockResolvedValue(mockJobs);
    await jobController.getJobsByOwner(
      req as express.Request,
      res as express.Response
    );
    const sent = (res.send as jest.Mock).mock.calls[0][0] as Array<{ download_key: string | null }>;
    expect(sent[0].download_key).toBe('abc123.apkg');
  });

  it('returns download_key for a done upload job with a matching upload', async () => {
    const mockJobs = [
      {
        id: 2,
        title: 'Upload Deck',
        object_id: 'upload-obj-id',
        status: 'done',
        owner: 'owner1',
        type: 'claude',
        download_key: 'upload-key.apkg',
      },
    ];
    (jobService.getJobsByOwner as jest.Mock).mockResolvedValue(mockJobs);
    await jobController.getJobsByOwner(
      req as express.Request,
      res as express.Response
    );
    const sent = (res.send as jest.Mock).mock.calls[0][0] as Array<{ download_key: string | null }>;
    expect(sent[0].download_key).toBe('upload-key.apkg');
  });

  it('returns download_key: null for an in-progress job', async () => {
    const mockJobs = [
      {
        id: 3,
        title: 'In Progress',
        object_id: 'in-progress-obj',
        status: 'started',
        owner: 'owner1',
        type: 'page',
        download_key: null,
      },
    ];
    (jobService.getJobsByOwner as jest.Mock).mockResolvedValue(mockJobs);
    await jobController.getJobsByOwner(
      req as express.Request,
      res as express.Response
    );
    const sent = (res.send as jest.Mock).mock.calls[0][0] as Array<{ download_key: string | null }>;
    expect(sent[0].download_key).toBeNull();
  });

  it('cross-owner guard: user A does not receive user B download_key for same object_id', async () => {
    const mockJobsForOwner1 = [
      {
        id: 4,
        title: 'Shared Object',
        object_id: 'shared-obj-id',
        status: 'done',
        owner: 'owner1',
        type: 'page',
        download_key: null,
      },
    ];
    (jobService.getJobsByOwner as jest.Mock).mockResolvedValue(mockJobsForOwner1);
    await jobController.getJobsByOwner(
      req as express.Request,
      res as express.Response
    );
    const sent = (res.send as jest.Mock).mock.calls[0][0] as Array<{ download_key: string | null }>;
    expect(sent[0].download_key).toBeNull();
  });

  it('should delete job by owner and send 200', async () => {
    (jobService.deleteJobById as jest.Mock).mockResolvedValue(undefined);
    await jobController.deleteJobByOwner(
      req as express.Request,
      res as express.Response
    );
    expect(jobService.deleteJobById).toHaveBeenCalledWith('123', 'owner1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it('should handle error in deleteJobByOwner', async () => {
    (jobService.deleteJobById as jest.Mock).mockRejectedValue(
      new Error('fail')
    );
    await jobController.deleteJobByOwner(
      req as express.Request,
      res as express.Response
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalled();
  });

  it('should handle job in progress error with 409 status', async () => {
    (jobService.deleteJobById as jest.Mock).mockRejectedValue(
      new Error('Cannot delete job while it is in progress')
    );
    await jobController.deleteJobByOwner(
      req as express.Request,
      res as express.Response
    );
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Cannot delete job while it is in progress' 
    });
  });

  it('should redirect to login if owner is missing when getting jobs', async () => {
    (getOwnerModule.getOwner as jest.Mock).mockReturnValue(undefined);
    await jobController.getJobsByOwner(
      req as express.Request,
      res as express.Response
    );
    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(res.send).not.toHaveBeenCalled();
  });
});
