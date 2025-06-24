import UsersService from './UsersService';
import UsersRepository from '../data_layer/UsersRepository';
import { IEmailService } from './EmailService/EmailService';
import Users from '../data_layer/public/Users'; // Import the Users type

jest.mock('../data_layer/UsersRepository');

// Mock EmailService ensuring all methods from IEmailService are present
const mockSendWelcomeEmail = jest.fn().mockResolvedValue(undefined);
const mockSendFirstWeekEmail = jest.fn().mockResolvedValue(undefined); // Though not directly tested here, good to have
const mockSendResetEmail = jest.fn();
const mockSendConversionEmail = jest.fn();
const mockSendConversionLinkEmail = jest.fn();
const mockSendContactEmail = jest.fn().mockResolvedValue({ didSend: false });
const mockSendVatNotificationEmail = jest.fn().mockResolvedValue(undefined);
const mockSendSubscriptionCancelledEmail = jest.fn().mockResolvedValue(undefined);
const mockSendSubscriptionScheduledCancellationEmail = jest.fn().mockResolvedValue(undefined);

const MockEmailService = jest.fn<IEmailService, []>(() => ({
    sendWelcomeEmail: mockSendWelcomeEmail,
    sendFirstWeekEmail: mockSendFirstWeekEmail,
    sendResetEmail: mockSendResetEmail,
    sendConversionEmail: mockSendConversionEmail,
    sendConversionLinkEmail: mockSendConversionLinkEmail,
    sendContactEmail: mockSendContactEmail,
    sendVatNotificationEmail: mockSendVatNotificationEmail,
    sendSubscriptionCancelledEmail: mockSendSubscriptionCancelledEmail,
    sendSubscriptionScheduledCancellationEmail: mockSendSubscriptionScheduledCancellationEmail,
}));


describe('UsersService', () => {
  let usersService: UsersService;
  let mockUsersRepository: jest.Mocked<UsersRepository>;
  let mockEmailServiceInstance: jest.Mocked<IEmailService>;

  beforeEach(() => {
    // Instantiate the mock repository
    mockUsersRepository = new (UsersRepository as jest.Mock<UsersRepository>)(null as any) as jest.Mocked<UsersRepository>;
    // Instantiate the mock email service
    mockEmailServiceInstance = new MockEmailService() as jest.Mocked<IEmailService>;
    // Create a new UsersService instance with the mocks
    usersService = new UsersService(mockUsersRepository, mockEmailServiceInstance);
    
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should send a welcome email upon successful registration', async () => {
    const name = 'Test User';
    const email = 'test@example.com';
    const password = 'password123';
    const picture = 'avatar.png';
    // Define a mock user object that matches the Users type and includes all fields returned by createUser
    const mockNewUser: Users = { 
      id: '1', 
      name, 
      email, 
      password: 'hashedPassword', // createUser in repo would store hashed password
      picture, 
      created_at: new Date(), 
      updated_at: new Date(), 
      first_week_email_sent_at: null, 
      reset_token: null, 
      patreon: false, // Assuming default
      // owner: '1' // 'owner' is not a standard field in the Users table schema based on typical setups
    };

    // Mock createUser to return an array containing the new user object
    mockUsersRepository.createUser = jest.fn().mockResolvedValue([mockNewUser]);

    await usersService.register(name, password, email, picture);

    expect(mockUsersRepository.createUser).toHaveBeenCalledWith(name, password, email.toLowerCase(), picture);
    expect(mockEmailServiceInstance.sendWelcomeEmail).toHaveBeenCalledWith(email, name);
  });

  it('should still register user if welcome email fails', async () => {
    const name = 'Jane Doe';
    const email = 'jane@example.com';
    const password = 'securepassword';
    const picture = 'jane_avatar.png';
    const mockNewUser: Users = { 
      id: '2', 
      name, 
      email, 
      password: 'hashedPassword', 
      picture, 
      created_at: new Date(), 
      updated_at: new Date(), 
      first_week_email_sent_at: null, 
      reset_token: null, 
      patreon: false,
    };
    
    mockUsersRepository.createUser = jest.fn().mockResolvedValue([mockNewUser]);
    // mockEmailServiceInstance.sendWelcomeEmail is already a jest.fn(), just need to make it reject
    mockSendWelcomeEmail.mockRejectedValueOnce(new Error('Email failed to send'));

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(usersService.register(name, password, email, picture)).toResolve();
    
    expect(mockUsersRepository.createUser).toHaveBeenCalledWith(name, password, email.toLowerCase(), picture);
    expect(mockEmailServiceInstance.sendWelcomeEmail).toHaveBeenCalledWith(email, name);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Failed to send welcome email to: ${email}`,
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore(); // Restore console.error
  });

   it('should not send welcome email if createUser returns empty array or undefined', async () => {
    const name = 'No User';
    const email = 'nouser@example.com';
    const password = 'password';
    const picture = 'no.png';

    mockUsersRepository.createUser = jest.fn().mockResolvedValue([]); // Simulate user creation failure or no user returned

    await usersService.register(name, password, email, picture);

    expect(mockUsersRepository.createUser).toHaveBeenCalledWith(name, password, email.toLowerCase(), picture);
    expect(mockEmailServiceInstance.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('should not send welcome email if user data is missing name or email', async () => {
    const name = 'Partial User';
    const email = 'partial@example.com';
    const password = 'password';
    const picture = 'partial.png';
    const mockNewUserPartial: Partial<Users> = { id: '3' }; // Missing name and email

    mockUsersRepository.createUser = jest.fn().mockResolvedValue([mockNewUserPartial as Users]);

    await usersService.register(name, password, email, picture);

    expect(mockUsersRepository.createUser).toHaveBeenCalledWith(name, password, email.toLowerCase(), picture);
    expect(mockEmailServiceInstance.sendWelcomeEmail).not.toHaveBeenCalled();
     // Optionally, check for console.error call about missing data
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(consoleErrorSpy).toHaveBeenCalledWith(
        'User created but email or name is missing for welcome email.',
        mockNewUserPartial
    );
    consoleErrorSpy.mockRestore();
  });
});
