import cron from 'node-cron';
import { Knex } from 'knex'; // Assuming Knex is used for DB access
import { IEmailService, useDefaultEmailService } from '../services/EmailService/EmailService'; // Adjust path as needed
import db from '../data_layer'; // Assuming 'db' is your Knex instance, adjust path

const emailService: IEmailService = useDefaultEmailService();

// Schedule the task to run once a day, e.g., at 2 AM
// For testing, you might want a more frequent schedule like every minute: '* * * * *'
const cronJob = cron.schedule('0 2 * * *', async () => {
  console.log('Running job: Send First Week Emails');
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const usersToSendEmail = await db('users')
      .select('id', 'email', 'name', 'created_at')
      .where('created_at', '<=', sevenDaysAgo)
      .andWhereNull('first_week_email_sent_at');

    if (usersToSendEmail.length === 0) {
      console.log('No users to send first-week email to.');
      return;
    }

    console.log(`Found ${usersToSendEmail.length} user(s) to send first-week email.`);

    for (const user of usersToSendEmail) {
      try {
        await emailService.sendFirstWeekEmail(user.email, user.name);
        await db('users')
          .where('id', user.id)
          .update({ first_week_email_sent_at: new Date() });
        console.log(`Successfully sent first-week email to ${user.email} and updated timestamp.`);
      } catch (error) {
        console.error(`Failed to send first-week email to ${user.email} or update timestamp:`, error);
        // Decide on error handling: continue to next user or stop?
        // For now, it continues.
      }
    }
    console.log('Finished sending first-week emails.');
  } catch (error) {
    console.error('Error querying users for first-week email:', error);
  }
}, {
  scheduled: false // Don't start automatically, we'll start it in server.ts
});

export default cronJob;
