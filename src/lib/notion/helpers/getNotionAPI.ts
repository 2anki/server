import express from 'express';
import NotionAPIWrapper from '../NotionAPIWrapper';
import TokenHandler from '../../misc/TokenHandler';

export const getNotionAPI = async (
  req: express.Request,
  res: express.Response
): Promise<NotionAPIWrapper> => {
  console.debug(`Configuring Notion API for ${req.originalUrl}`);
  const token = await TokenHandler.GetNotionToken(res.locals.owner);
  return new NotionAPIWrapper(token!);
};
