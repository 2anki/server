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

  register(name: string, password: string, email: string, picture: string) {
    return this.repository.createUser(
      name,
      password,
      email.toLowerCase(),
      picture
    );
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

  updateLastLoginAt(id: string) {
    return this.repository.updateLastLoginAt(id);
  }
}

export default UsersService;
