import express from 'express';
import NotionAPIWrapper from '../NotionAPIWrapper';
import NotionRepository from '../../../data_layer/NotionRespository';
import hashToken from '../../misc/hashToken';

export const getNotionAPI = async (
  req: express.Request,
  res: express.Response,
  repository: NotionRepository
): Promise<NotionAPIWrapper> => {
  console.time(`Configuring Notion API for ${req.originalUrl}`);
  const token = await repository.getNotionToken(res.locals.owner, hashToken);
  console.timeEnd(`Configuring Notion API for ${req.originalUrl}`);
  return new NotionAPIWrapper(token!, res.locals.owner);
};
