import express from 'express';

import { INotionRepository } from '../../data_layer/NotionRespository';
import { IUploadRepository } from '../../data_layer/UploadRespository';
import NotionTokens from '../../data_layer/public/NotionTokens';
import Uploads from '../../data_layer/public/Uploads';
import NotionService from '../../services/NotionService';
import UploadService from '../../services/UploadService';
import UploadController from './UploadController';

describe('Upload file', () => {
  test('upload failed is caught', () => {
    // Arrange
    const repository: IUploadRepository = {
      deleteUpload: function (owner: number, _key: string): Promise<number> {
        return Promise.resolve(1);
      },
      getUploadsByOwner: function (owner: number): Promise<Uploads[]> {
        return Promise.resolve([]);
      },
      update: function (
        owner: number,
        filename: string,
        key: string,
        size_mb: number
      ): Promise<Uploads[]> {
        return Promise.resolve([]);
      },
    };
    const notionRepository: INotionRepository = {
      getNotionData: function (owner: string | number): Promise<NotionTokens> {
        return Promise.resolve({ owner: 1, token: '...' } as NotionTokens);
      },
      saveNotionToken: function (
        user: number,
        data: { [key: string]: string },
        hash: (token: string) => string
      ): Promise<boolean> {
        return Promise.resolve(true);
      },
      getNotionToken: function (owner: string): Promise<string> {
        return Promise.resolve('...');
      },
      deleteBlocksByOwner: function (owner: number): Promise<number> {
        return Promise.resolve(owner);
      },
      deleteNotionData(owner: number): Promise<boolean> {
        return Promise.resolve(true);
      },
    };
    const uploadService = new UploadService(repository);
    const notionService = new NotionService(notionRepository);
    const uploadController = new UploadController(uploadService, notionService);

    // Act
    const setHTTPStatusCode = (code: number) => expect(code).toBe(400);

    // Assert
    uploadController.file(
      {} as express.Request,
      {
        status: (code) => setHTTPStatusCode(code),
      } as express.Response
    );
  });
});
