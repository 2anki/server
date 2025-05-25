import UsersRepository from '../data_layer/UsersRepository';
import Users from '../data_layer/public/Users';
import AuthenticationService from './AuthenticationService';
import { IEmailService } from './EmailService/EmailService';

class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly emailService: IEmailService
  ) {}

  updatePassword(password: string, resetToken: string) {
    return this.repository.updatePassword(password, resetToken);
  }

  async sendResetEmail(email: string, authService: AuthenticationService) {
    const user = await this.repository.getByEmail(email);
    if (!user?.id) {
      console.debug('no user found');
      return;
    }
    console.debug('user found');

    const resetToken = await this.getOrCreateResetToken(user, authService);
    this.emailService.sendResetEmail(email, resetToken);
  }

  private async getOrCreateResetToken(
    user: Users,
    authService: AuthenticationService
  ) {
    if (user.reset_token) {
      return user.reset_token;
    }
    const resetToken = authService.newResetToken();
    await this.repository.updateResetToken(user.id.toString(), resetToken);
    return resetToken;
  }

  getUserFrom(email: string) {
    return this.repository.getByEmail(email);
  }

  async register(name: string, password: string, email: string, picture: string) {
    const createdUsers = await this.repository.createUser(
      name,
      password,
      email.toLowerCase(),
      picture
    );

    if (createdUsers && createdUsers.length > 0) {
      const newUser = createdUsers[0];
      try {
        // Ensure newUser has name and email, which it should based on the previous modification
        if (newUser.email && newUser.name) {
          await this.emailService.sendWelcomeEmail(newUser.email, newUser.name);
        } else {
          // This case should ideally not happen if createUser returns name and email
          console.error('User created but email or name is missing for welcome email.', newUser);
        }
      } catch (emailError) {
        console.error(
          `Failed to send welcome email to: ${newUser.email}`,
          emailError
        );
        // Decide if this failure should affect the registration process
        // For now, just log it and do not break registration.
      }
    } else {
      // Handle the case where user creation might have failed or returned an unexpected result
      console.error('User creation failed or returned no user data.');
      // Potentially throw an error here or return a specific error response
      // For now, we'll let the original return value (which would be undefined or empty array) propagate
    }
    return createdUsers; // Return the result of createUser as the original method did
  }

  deleteUser(owner: any) {
    return this.repository.deleteUser(owner);
  }

  updateSubscriptionLinkedEmail(owner: string, email: string) {
    return this.repository.linkCurrentUserWithEmail(owner, email);
  }

  updateSubScriptionEmailUsingPrimaryEmail(email: string, newEmail: string) {
    return this.repository.updateSubScriptionEmailUsingPrimaryEmail(
      email,
      newEmail
    );
  }

  getSubscriptionLinkedEmail(owner: string) {
    return this.repository.getSubscriptionLinkedEmail(owner);
  }

  async checkSubscriptionEmailExists(email: string): Promise<boolean> {
    const subscription =
      await this.repository.checkSubscriptionEmailExists(email);
    return !!subscription;
  }

  getUserById(owner: string): Promise<Users> {
    return this.repository.getById(owner);
  }

  updatePicture(id: string, picture: string) {
    return this.repository.updatePicture(id, picture);
  }
}

export default UsersService;
