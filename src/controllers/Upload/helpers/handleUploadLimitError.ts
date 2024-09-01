import express from 'express';
import { useDefaultEmailService } from '../../../services/EmailService/EmailService';
import UsersService from '../../../services/UsersService';
import UsersRepository from '../../../data_layer/UsersRepository';
import { getDatabase } from '../../../data_layer';
import { shouldRedirect } from '../../../lib/misc/ErrorHandler';

export const handleUploadLimitError = async (
  req: express.Request,
  response: express.Response
) => {
  const owner = response.locals.owner;

  // If the user is already logged in, redirect to the pricing page
  if (owner) {
    const database = getDatabase();
    const emailService = useDefaultEmailService();
    const usersService = new UsersService(
      new UsersRepository(database),
      emailService
    );

    const user = await usersService.getUserById(response.locals.owner);

    if (user && shouldRedirect(req)) {
      return response.redirect('/pricing?error=upload_limit_exceeded');
    } else {
      return response.status(400).send('Upload limit exceeded');
    }
  }

  if (shouldRedirect(req)) {
    response.redirect('/login?error=upload_limit_exceeded');
  } else {
    response.status(400).send('Upload limit exceeded');
  }
};
