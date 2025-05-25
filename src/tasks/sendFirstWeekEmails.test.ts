import cron from 'node-cron';
import db from '../data_layer'; // Mock this
// IEmailService is not directly used in the test, but useDefaultEmailService is.
// Let's ensure the mock for useDefaultEmailService provides an object that satisfies IEmailService if needed by other parts of the code.
import { useDefaultEmailService } from '../services/EmailService/EmailService';

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    start: jest.fn(),
    stop: jest.fn(),
  }),
}));

// Mock data_layer (Knex instance)
const mockUpdate = jest.fn().mockResolvedValue(1);
const mockSelect = jest.fn(); // This will be configured per test

// This is a simplified mock. For more complex scenarios, you might need a more elaborate mock builder.
// The key is that db('users') returns an object that can chain .select().where().andWhereNull() for reads,
// and .where().update() for updates.
jest.mock('../data_layer', () => {
    const knexMock = {
        select: jest.fn().mockReturnThis(), // Allows chaining .select().where()...
        where: jest.fn().mockReturnThis(),  // Allows chaining .where().update() or .where().andWhereNull()
        andWhereNull: jest.fn(function() { // For .andWhereNull(), it should execute the select mock
             return mockSelect(); // mockSelect will return a Promise with the users array
        }),
        update: mockUpdate, // .update() is the final call in an update chain
    };
    return jest.fn((tableName: string) => {
        if (tableName === 'users') {
            // Reset select mock for each call to db('users') to avoid interference between SELECT and UPDATE setups
            // This is tricky; ideally, the mockSelect itself is configured just before it's needed.
            // For the SELECT query: db('users').select(...).where(...).andWhereNull(...)
            // For the UPDATE query: db('users').where(...).update(...)
            // We'll refine the mockSelect behavior directly in tests.
            return knexMock;
        }
        return {};
    });
});


// Mock EmailService
const mockSendFirstWeekEmail = jest.fn();
jest.mock('../services/EmailService/EmailService', () => ({
  useDefaultEmailService: jest.fn(() => ({ // This is the factory function
    sendFirstWeekEmail: mockSendFirstWeekEmail, // This is the method we care about
    // Add other methods from IEmailService if they were to be called by other parts of the system
    // that might be inadvertently triggered. For this specific test, only sendFirstWeekEmail is crucial.
    sendWelcomeEmail: jest.fn(),
    sendResetEmail: jest.fn(),
    sendConversionEmail: jest.fn(),
    sendConversionLinkEmail: jest.fn(),
    sendContactEmail: jest.fn(),
    sendVatNotificationEmail: jest.fn(),
    sendSubscriptionCancelledEmail: jest.fn(),
    sendSubscriptionScheduledCancellationEmail: jest.fn(),
  })),
}));

// Dynamically import the cron job to allow mocks to be set up first
let cronJobLogic: () => Promise<void>;

describe('sendFirstWeekEmails Cron Job', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Reset the select mock for different user scenarios
    // mockSelect.mockReset(); // This was causing issues; direct mockResolvedValue in tests is better

    // Re-import the module that sets up the cron job.
    // This ensures that the module uses the mocked dependencies.
    const jobModule = await import('./sendFirstWeekEmails'); // Assuming the cron job is default export or named export
    
    // cron.schedule is mocked. The first argument to the first call of cron.schedule is the scheduled function.
    if (jest.isMockFunction(cron.schedule) && (cron.schedule as jest.Mock).mock.calls.length > 0) {
        // The actual logic is the callback function passed to cron.schedule
        cronJobLogic = (cron.schedule as jest.Mock).mock.calls[0][1];
    } else {
        // Fallback or error if cron.schedule was not called as expected (e.g., if the module doesn't schedule on import)
        // This might happen if the cron job is conditionally scheduled or exported differently.
        // For this test structure, we assume `sendFirstWeekEmails.ts` calls `cron.schedule` on import.
        // If `sendFirstWeekEmails.ts` exports the job instance, we'd grab `job.task` or similar.
        // Based on the provided code, `sendFirstWeekEmails.ts` exports `cronJob` which has a start method.
        // The actual logic is an anonymous async function.
        // This part of the setup might need adjustment based on how `sendFirstWeekEmails.ts` is structured.
        // If `sendFirstWeekEmails.ts` exports the cron job instance (`cronJob` from the problem description),
        // and the logic is an anonymous function, this method of retrieval is correct.
        console.warn("cron.schedule was not called on module import, or mock is not set up as expected. Check sendFirstWeekEmails.ts structure.");
        // As a fallback, if the cronjob is exported, try to get the function from there (this depends on actual export)
        // cronJobLogic = jobModule.default; // or jobModule.cronJobLogic if it's a named export
         if (jobModule.default && typeof (jobModule.default as any).command === 'function') {
             cronJobLogic = (jobModule.default as any).command; // Hypothetical if using a library that stores command
         } else if ((cron.schedule as jest.Mock).mock.calls.length > 0) {
            cronJobLogic = (cron.schedule as jest.Mock).mock.calls[0][1];
         }
         else {
            throw new Error("Cron job logic could not be retrieved. Ensure sendFirstWeekEmails.ts calls cron.schedule upon import or export the logic directly.");
         }
    }
  });

  it('should query for users created 7 days ago and not yet emailed', async () => {
    // Configure the mock for the SELECT part of the query
    // db('users').select(...).where('created_at', '<=', sevenDaysAgo).andWhereNull('first_week_email_sent_at')
    mockSelect.mockResolvedValueOnce([]); // No users found
    
    await cronJobLogic();
    
    // Check that db('users') was called
    expect(db).toHaveBeenCalledWith('users');
    // Check that select was called (further checks on specific select args can be added if needed)
    const dbMockInstance = (db as jest.Mock).mock.results[0].value;
    expect(dbMockInstance.select).toHaveBeenCalled();
    expect(dbMockInstance.where).toHaveBeenCalledWith('created_at', '<=', expect.any(Date));
    expect(dbMockInstance.andWhereNull).toHaveBeenCalledWith('first_week_email_sent_at');
  });

  it('should send emails and update timestamps for eligible users', async () => {
    const fakeUser1 = { id: '1', email: 'user1@test.com', name: 'User One', created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) };
    const fakeUser2 = { id: '2', email: 'user2@test.com', name: 'User Two', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) };
    mockSelect.mockResolvedValueOnce([fakeUser1, fakeUser2]); // Mock the users returned by the select query

    mockSendFirstWeekEmail.mockResolvedValue(undefined); // Mock successful email sending
    mockUpdate.mockResolvedValue(1); // Mock successful database update

    await cronJobLogic();

    expect(mockSendFirstWeekEmail).toHaveBeenCalledTimes(2);
    expect(mockSendFirstWeekEmail).toHaveBeenCalledWith(fakeUser1.email, fakeUser1.name);
    expect(mockSendFirstWeekEmail).toHaveBeenCalledWith(fakeUser2.email, fakeUser2.name);
    
    // Check that db('users').where('id', user.id).update(...) was called for each user
    const dbMockInstance = (db as jest.Mock).mock.results[0].value; // For the select
    // For updates, db is called again for each user
    expect(db).toHaveBeenCalledTimes(1 + 2); // 1 for select, 2 for updates

    const updateCallArgs = (db as jest.Mock).mock.calls.slice(1); // Get calls related to updates

    expect(updateCallArgs[0][0]).toBe('users'); // First update call, table name
    const firstUpdateMockInstance = (db as jest.Mock).mock.results[1].value;
    expect(firstUpdateMockInstance.where).toHaveBeenCalledWith('id', fakeUser1.id);
    expect(firstUpdateMockInstance.update).toHaveBeenCalledWith({ first_week_email_sent_at: expect.any(Date) });

    expect(updateCallArgs[1][0]).toBe('users'); // Second update call
    const secondUpdateMockInstance = (db as jest.Mock).mock.results[2].value;
    expect(secondUpdateMockInstance.where).toHaveBeenCalledWith('id', fakeUser2.id);
    expect(secondUpdateMockInstance.update).toHaveBeenCalledWith({ first_week_email_sent_at: expect.any(Date) });
  });

  it('should handle errors when sending email to one user and continue with others', async () => {
    const fakeUser1 = { id: '1', email: 'user1@test.com', name: 'User One', created_at: new Date() };
    const fakeUser2 = { id: '2', email: 'user2@test.com', name: 'User Two', created_at: new Date() };
    mockSelect.mockResolvedValueOnce([fakeUser1, fakeUser2]);

    mockSendFirstWeekEmail.mockImplementation(async (email: string) => {
      if (email === fakeUser1.email) throw new Error('Failed to send');
      return undefined;
    });
    mockUpdate.mockResolvedValue(1);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await cronJobLogic();

    expect(mockSendFirstWeekEmail).toHaveBeenCalledTimes(2);
    expect(mockSendFirstWeekEmail).toHaveBeenCalledWith(fakeUser1.email, fakeUser1.name);
    expect(mockSendFirstWeekEmail).toHaveBeenCalledWith(fakeUser2.email, fakeUser2.name);

    // Only user2's timestamp should be updated
    const updateCallArgs = (db as jest.Mock).mock.calls.slice(1);
    expect(updateCallArgs.length).toBe(1); // Only one successful update chain
    const successfulUpdateMockInstance = (db as jest.Mock).mock.results[1].value; // Result of db('users') for user2
    expect(successfulUpdateMockInstance.where).toHaveBeenCalledWith('id', fakeUser2.id);
    expect(successfulUpdateMockInstance.update).toHaveBeenCalledWith({ first_week_email_sent_at: expect.any(Date) });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to send first-week email to ${fakeUser1.email} or update timestamp:`,
        expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  it('should log if no users are found', async () => {
    mockSelect.mockResolvedValueOnce([]); // No users found
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    await cronJobLogic();
    
    expect(consoleLogSpy).toHaveBeenCalledWith('No users to send first-week email to.');
    consoleLogSpy.mockRestore();
  });
});
