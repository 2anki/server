import sgMail from '@sendgrid/mail';
import { EmailService, UnimplementedEmailService, IEmailService } from './EmailService'; // Assuming EmailService is exported
import { WELCOME_EMAIL_TEMPLATE, FIRST_WEEK_EMAIL_TEMPLATE, DEFAULT_SENDER, SUPPORT_EMAIL_ADDRESS } from './constants';

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 200 }]), // Mock successful send
}));

// Mock constants to ensure tests are not dependent on actual file reading
jest.mock('./constants', () => {
  const originalConstants = jest.requireActual('./constants');
  return {
    ...originalConstants,
    WELCOME_EMAIL_TEMPLATE: '<h1>Welcome, {{name}}!</h1><p>Welcome content.</p>',
    FIRST_WEEK_EMAIL_TEMPLATE: '<h1>Hi {{name}}, week one!</h1><p>First week content.</p>',
    // DEFAULT_SENDER and SUPPORT_EMAIL_ADDRESS will be used from originalConstants
  };
});


describe('EmailService', () => {
  const apiKey = 'test-api-key';
  // DEFAULT_SENDER is loaded from the mocked constants, which gets it from originalConstants
  const defaultSender = DEFAULT_SENDER;
  let emailService: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();
    emailService = new EmailService(apiKey, defaultSender);
    // Ensure API key is set for each test if EmailService constructor calls it
    // sgMail.setApiKey(apiKey); // Already called in constructor, mock tracks this
  });

  it('should set the SendGrid API key on construction', () => {
    expect(sgMail.setApiKey).toHaveBeenCalledWith(apiKey);
  });

  it('should send a welcome email with correct parameters', async () => {
    const email = 'test@example.com';
    const name = 'Test User';
    await emailService.sendWelcomeEmail(email, name);

    expect(sgMail.send).toHaveBeenCalledWith({
      to: email,
      from: defaultSender,
      subject: 'Welcome to 2anki.net!',
      text: 'Welcome, Test User! Welcome content.', // Cheerio derived text
      html: '<h1>Welcome, Test User!</h1><p>Welcome content.</p>',
      replyTo: SUPPORT_EMAIL_ADDRESS,
    });
  });

  it('should send a first-week email with correct parameters', async () => {
    const email = 'test@example.com';
    const name = 'Test User';
    await emailService.sendFirstWeekEmail(email, name);

    expect(sgMail.send).toHaveBeenCalledWith({
      to: email,
      from: defaultSender,
      subject: 'Your First Week with 2anki.net',
      text: 'Hi Test User, week one! First week content.', // Cheerio derived text
      html: '<h1>Hi Test User, week one!</h1><p>First week content.</p>',
      replyTo: SUPPORT_EMAIL_ADDRESS,
    });
  });

  it('should use "there" if name is not provided for welcome email', async () => {
    const email = 'test@example.com';
    await emailService.sendWelcomeEmail(email, ''); // Test with empty string
    expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
      html: '<h1>Welcome, there!</h1><p>Welcome content.</p>',
      text: 'Welcome, there! Welcome content.',
    }));

    await emailService.sendWelcomeEmail(email, null as any); // Test with null
        expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
      html: '<h1>Welcome, there!</h1><p>Welcome content.</p>',
      text: 'Welcome, there! Welcome content.',
    }));
  });

  it('should use "there" if name is not provided for first-week email', async () => {
    const email = 'test@example.com';
    await emailService.sendFirstWeekEmail(email, ''); // Test with empty string
    expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
      html: '<h1>Hi there, week one!</h1><p>First week content.</p>',
      text: 'Hi there, week one! First week content.',
    }));

    await emailService.sendFirstWeekEmail(email, null as any); // Test with null
        expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
      html: '<h1>Hi there, week one!</h1><p>First week content.</p>',
      text: 'Hi there, week one! First week content.',
    }));
  });
});

describe('UnimplementedEmailService', () => {
  let service: IEmailService;

  beforeEach(() => {
    service = new UnimplementedEmailService();
    jest.spyOn(console, 'info').mockImplementation(() => {}); // Suppress console.info
  });

  afterEach(() => {
    (console.info as jest.Mock).mockRestore();
  });

  it('sendWelcomeEmail should run without error and log info', () => {
    expect(() => service.sendWelcomeEmail('test@example.com', 'Test')).not.toThrow();
    expect(console.info).toHaveBeenCalledWith('sendWelcomeEmail not handled', 'test@example.com', 'Test');
  });

  it('sendFirstWeekEmail should run without error and log info', () => {
    expect(() => service.sendFirstWeekEmail('test@example.com', 'Test')).not.toThrow();
    expect(console.info).toHaveBeenCalledWith('sendFirstWeekEmail not handled', 'test@example.com', 'Test');
  });

  // Add similar tests for all other methods of IEmailService
  it('sendResetEmail should run without error', () => {
    expect(() => service.sendResetEmail('test@example.com', 'token')).not.toThrow();
  });
  it('sendConversionEmail should run without error', () => {
    expect(() => service.sendConversionEmail('test@example.com', 'file.txt', Buffer.from(''))).not.toThrow();
  });
  it('sendConversionLinkEmail should run without error', () => {
    expect(() => service.sendConversionLinkEmail('test@example.com', 'file.txt', 'link')).not.toThrow();
  });
  it('sendContactEmail should run without error', async () => {
    await expect(service.sendContactEmail('name', 'email', 'msg', [])).resolves.toEqual({ didSend: false });
  });
  it('sendVatNotificationEmail should run without error', async () => {
    await expect(service.sendVatNotificationEmail('email', 'eur', 'name')).resolves.toBeUndefined();
  });
  it('sendSubscriptionCancelledEmail should run without error', async () => {
    await expect(service.sendSubscriptionCancelledEmail('email', 'name', 'subId')).resolves.toBeUndefined();
  });
  it('sendSubscriptionScheduledCancellationEmail should run without error', async () => {
    await expect(service.sendSubscriptionScheduledCancellationEmail('email', 'name', new Date())).resolves.toBeUndefined();
  });
});
