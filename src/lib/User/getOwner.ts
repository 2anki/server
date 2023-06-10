import express from 'express';

export const getOwner = (response?: express.Response) =>
  response?.locals?.owner;
