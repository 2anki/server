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
    } as any;
    jobController = new JobController(jobService);
    req = { params: { id: '123' } };
    res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    };
    jest.spyOn(getOwnerModule, 'getOwner').mockReturnValue('owner1');
  });

  it('should get jobs by owner and send them', async () => {
    (jobService.getJobsByOwner as jest.Mock).mockResolvedValue([
      'job1',
      'job2',
    ]);
    await jobController.getJobsByOwner(
      req as express.Request,
      res as express.Response
    );
    expect(jobService.getJobsByOwner).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(['job1', 'job2']);
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
