import { GenerativeModel, VertexAI } from '@google-cloud/vertexai';
import { SAFETY_SETTINGS, VERTEX_AI_CONFIG } from './constants';

export function setupVertexAI(): GenerativeModel {
  const vertexAI = new VertexAI({
    project: VERTEX_AI_CONFIG.project,
    location: VERTEX_AI_CONFIG.location,
  });

  return vertexAI.getGenerativeModel({
    model: VERTEX_AI_CONFIG.model,
    generationConfig: VERTEX_AI_CONFIG.generationConfig,
    safetySettings: SAFETY_SETTINGS,
  });
}
