import express from 'express';
import { EventsController } from '../controllers/EventsController';
import { TrackEventUseCase } from '../usecases/events/TrackEventUseCase';
import { getEventsSink } from '../services/events/eventsSinkInstance';
import { anonIdMiddleware } from './middleware/anonIdMiddleware';
import { optionalAuthMiddleware } from './middleware/optionalAuthMiddleware';

const EventsRouter = () => {
  const router = express.Router();
  const sink = getEventsSink();
  const useCase = new TrackEventUseCase(sink);
  const controller = new EventsController(useCase);

  router.post(
    '/api/events/track',
    anonIdMiddleware,
    optionalAuthMiddleware,
    (req, res) => controller.track(req, res)
  );

  return router;
};

export default EventsRouter;
