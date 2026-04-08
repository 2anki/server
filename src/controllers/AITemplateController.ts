import { Request, Response } from 'express';
import { AITemplateService } from '../services/AITemplateService';

export class AITemplateController {
  constructor(private readonly aiTemplateService: AITemplateService) {}

  async generate(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, stylePreset } = req.body;
      const result = await this.aiTemplateService.generateTemplate({
        prompt,
        stylePreset,
      });
      res.status(200).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate template';
      const status = message.includes('required')
        ? 400
        : message.includes('environment variable')
          ? 503
          : 500;
      res.status(status).json({ error: message });
    }
  }
}
