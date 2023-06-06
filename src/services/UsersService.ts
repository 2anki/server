import UsersRepository from '../data_layer/UsersRepository';
import EmailHandler from '../lib/email/EmailHandler';
import Users from '../schemas/public/Users';
import AuthenticationService from './AuthenticationService';

class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  updatePassword(password: string, resetToken: string) {
    return this.repository.updatePassword(password, resetToken);
  }

  async sendResetEmail(email: string, authService: AuthenticationService) {
    const user = await this.repository.getByEmail(email);
    if (!user || !user.id) {
      console.debug('no user found');
      return;
    }
    console.debug('user found');

    const resetToken = await this.getOrCreateResetToken(user, authService);
    await EmailHandler.SendResetEmail(email, resetToken);
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

  register(name: string, password: string, email: any) {
    return this.repository.createUser(name, password, email);
  }

  deleteUser(owner: any) {
    return this.repository.deleteUser(owner);
  }
}

export default UsersService;
