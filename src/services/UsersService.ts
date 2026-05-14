import crypto from 'crypto';

import UsersRepository from '../data_layer/UsersRepository';
import Users from '../data_layer/public/Users';
import AuthenticationService from './AuthenticationService';
import { IEmailService } from './EmailService/EmailService';
import type { IMagicTokenRepository } from '../data_layer/MagicTokenRepository';

const MAGIC_LINK_RATE_LIMIT = 5;
const MAGIC_LINK_RATE_WINDOW_MS = 60 * 60 * 1000;
const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000;
const VERIFY_EMAIL_EXPIRY_MS = 24 * 60 * 60 * 1000;

export class MagicLinkRateLimitError extends Error {
  constructor() {
    super('Too many magic link requests');
    this.name = 'MagicLinkRateLimitError';
  }
}

class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly emailService: IEmailService,
    private readonly magicTokenRepository?: IMagicTokenRepository
  ) {}

  updatePassword(password: string, resetToken: string) {
    return this.repository.updatePassword(password, resetToken);
  }

  updateResetToken(userId: string, resetToken: string) {
    return this.repository.updateResetToken(userId, resetToken);
  }

  async sendResetEmail(email: string, authService: AuthenticationService) {
    const user = await this.repository.getByEmail(email);
    if (!user?.id) {
      console.debug('no user found');
      return;
    }
    console.debug('user found');

    const resetToken = await this.getOrCreateResetToken(user, authService);
    await this.emailService.sendResetEmail(email, resetToken);
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

  async register(
    name: string,
    password: string,
    email: string,
    signupOrigin?: string | null,
    skipEmailVerification?: boolean
  ) {
    const normalizedEmail = email.toLowerCase();
    const trimmedName = name?.trim() ?? '';
    const resolvedName =
      trimmedName.length > 0 ? trimmedName : normalizedEmail.split('@')[0];
    const rows = await this.repository.createUser(
      resolvedName,
      password,
      normalizedEmail,
      signupOrigin ?? null
    );
    const userId = Array.isArray(rows) ? rows[0]?.id : null;
    if (userId != null && this.magicTokenRepository != null && !skipEmailVerification) {
      const token = crypto.randomBytes(64).toString('hex');
      const expiresAt = new Date(Date.now() + VERIFY_EMAIL_EXPIRY_MS);
      await this.magicTokenRepository.create(
        token,
        Number(userId),
        'verify_email',
        expiresAt
      );
      await this.emailService.sendVerificationEmail(normalizedEmail, token);
    }
    return rows;
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


  updateLastLoginAt(id: string) {
    return this.repository.updateLastLoginAt(id);
  }

  async requestHostedAnkiAccess(
    owner: string
  ): Promise<{ ok: boolean; alreadyRequested?: boolean }> {
    const user = await this.repository.getById(owner);
    if (user?.email == null) {
      return { ok: false };
    }
    if (user.hosted_anki_requested_at != null) {
      return { ok: true, alreadyRequested: true };
    }
    const result = await this.emailService.sendHostedAnkiAccessRequestEmail(
      String(user.id),
      user.email
    );
    if (!result.didSend) {
      return { ok: false };
    }
    await this.repository.markHostedAnkiRequested(owner);
    return { ok: true };
  }

  markAnkifyWelcomeSeen(owner: string) {
    return this.repository.markAnkifyWelcomeSeen(owner);
  }

  markEmailVerified(userId: string) {
    return this.repository.markEmailVerified(userId);
  }

  async resendVerificationEmail(
    userId: string
  ): Promise<{ ok: true } | { ok: true; alreadyVerified: true }> {
    const user = await this.repository.getById(userId);
    if (user?.email_verified) {
      return { ok: true, alreadyVerified: true };
    }
    if (this.magicTokenRepository == null || user?.email == null) {
      return { ok: true };
    }
    const oneHourAgo = new Date(Date.now() - MAGIC_LINK_RATE_WINDOW_MS);
    const recentCount = await this.magicTokenRepository.countRecentByOwner(
      user.id,
      oneHourAgo
    );
    if (recentCount >= MAGIC_LINK_RATE_LIMIT) {
      throw new MagicLinkRateLimitError();
    }
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + VERIFY_EMAIL_EXPIRY_MS);
    await this.magicTokenRepository.create(token, user.id, 'verify_email', expiresAt);
    await this.emailService.sendVerificationEmail(user.email, token);
    return { ok: true };
  }

  markTrialStarted(userId: string) {
    return this.repository.markTrialStarted(userId);
  }

  async requestMagicLink(
    email: string,
    purpose: 'login' | 'password_reset'
  ): Promise<void> {
    if (this.magicTokenRepository == null) {
      return;
    }
    const user = await this.repository.getByEmail(email);
    if (user?.id == null) {
      return;
    }
    const oneHourAgo = new Date(Date.now() - MAGIC_LINK_RATE_WINDOW_MS);
    const recentCount = await this.magicTokenRepository.countRecentByOwner(
      user.id,
      oneHourAgo
    );
    if (recentCount >= MAGIC_LINK_RATE_LIMIT) {
      throw new MagicLinkRateLimitError();
    }
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MS);
    await this.magicTokenRepository.create(token, user.id, purpose, expiresAt);
    await this.emailService.sendMagicLinkEmail(email, token, purpose);
  }

  async verifyMagicToken(
    token: string
  ): Promise<{ userId: number; purpose: string } | null> {
    if (this.magicTokenRepository == null) {
      return null;
    }
    const record = await this.magicTokenRepository.findValidToken(token);
    if (record == null) {
      return null;
    }
    await this.magicTokenRepository.markUsed(token);
    return { userId: record.owner, purpose: record.purpose };
  }
}

export default UsersService;
