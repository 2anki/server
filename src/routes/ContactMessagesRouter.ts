import express from 'express';
import RequireOpsAccess from './middleware/RequireOpsAccess';
import ContactMessagesController from '../controllers/ContactMessagesController';

const ContactMessagesRouter = () => {
  const router = express.Router();
  const controller = new ContactMessagesController();

  router.get('/api/ops/contact-messages', RequireOpsAccess, (req, res) =>
    controller.list(req, res)
  );

  router.patch(
    '/api/ops/contact-messages/:id/acknowledge',
    RequireOpsAccess,
    (req, res) => controller.acknowledge(req, res)
  );

  return router;
};

export default ContactMessagesRouter;
