import express from 'express';
import RequireOpsAccess from './middleware/RequireOpsAccess';
import ContactMessagesController from '../controllers/ContactMessagesController';

const ContactMessagesRouter = () => {
  const router = express.Router();
  const controller = new ContactMessagesController();

  /**
   * @swagger
   * /api/ops/contact-messages:
   *   get:
   *     summary: List contact form submissions
   *     description: Returns all messages from the contact form, newest first (ops only)
   *     tags: [Ops]
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Array of contact messages
   *       404:
   *         description: Not found (non-ops user)
   */
  router.get('/api/ops/contact-messages', RequireOpsAccess, (req, res) =>
    controller.list(req, res)
  );

  /**
   * @swagger
   * /api/ops/contact-messages/{id}/acknowledge:
   *   patch:
   *     summary: Mark a contact message as read
   *     description: Sets is_acknowledged=true for the given message (ops only)
   *     tags: [Ops]
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Acknowledged
   *       400:
   *         description: Invalid id
   *       404:
   *         description: Not found (non-ops user)
   */
  router.patch(
    '/api/ops/contact-messages/:id/acknowledge',
    RequireOpsAccess,
    (req, res) => controller.acknowledge(req, res)
  );

  return router;
};

export default ContactMessagesRouter;
