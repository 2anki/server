import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUserLocals } from '../../lib/hooks/useUserLocals';
import { SkeletonPage } from '../../components/Skeleton/Skeleton';
import { useSubscriptionStatus } from './hooks';
import {
  UserProfile,
  PlanDetails,
  SubscriptionManagement,
  AccountDeletion,
} from './components';
import useNotionData from '../SearchPage/helpers/useNotionData';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import sharedStyles from '../../styles/shared.module.css';
import styles from './AccountPage.module.css';

export default function AccountPage() {
  const { isLoading, data, refetch } = useUserLocals();
  const { subscriptionType, hasActivePlan } = useSubscriptionStatus(
    data?.locals
  );
  const notionData = useNotionData(get2ankiApi());
  const [searchParams, setSearchParams] = useSearchParams();
  const justSubscribed = searchParams.get('subscribed') === '1';
  const verifyError = searchParams.get('verify_error');
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'rate-limited'>('idle');

  const dismissSubscribedBanner = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('subscribed');
    setSearchParams(next, { replace: true });
  };

  const handleResend = async () => {
    setResendState('sending');
    try {
      await get2ankiApi().resendVerificationEmail();
      setResendState('sent');
    } catch {
      setResendState('rate-limited');
    }
  };

  if (isLoading) return <SkeletonPage rows={4} />;

  if (!data?.user?.email) {
    globalThis.location.href = '/login';
    return null;
  }

  const { user, locals } = data;

  return (
    <div className={styles.page}>
      <header className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.title}>Account</h1>
        <p className={sharedStyles.subtitle}>
          Manage your profile, plan, and connected services.
        </p>
      </header>

      {justSubscribed && (
        <div
          className={sharedStyles.alertSuccess}
          role="status"
          aria-live="polite"
        >
          <p>
            <strong>Thanks for subscribing!</strong> Your plan is active —
            you can see the details below.
          </p>
          <button
            type="button"
            className={sharedStyles.btnGhost}
            onClick={dismissSubscribedBanner}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className={styles.mainCard}>
        <UserProfile user={user} />

        {verifyError === 'expired' && (
          <div className={sharedStyles.alertDanger} role="alert">
            That verification link has expired. Links expire after 24 hours.{' '}
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={handleResend}
              disabled={resendState !== 'idle'}
            >
              {resendState === 'idle' && 'Send a new one'}
              {resendState === 'sending' && 'Sending…'}
              {resendState === 'sent' && 'Sent — check your inbox'}
              {resendState === 'rate-limited' && 'Try again in a minute'}
            </button>
          </div>
        )}

        {!data.user.email_verified && verifyError !== 'expired' && (
          <>
            <h2 className={styles.sectionTitle}>Email verification</h2>
            <div className={styles.planCard}>
              <div className={styles.planHeader}>
                <span className={styles.planName}>Not verified yet</span>
                <button
                  type="button"
                  className={styles.planButton}
                  onClick={handleResend}
                  disabled={resendState !== 'idle'}
                >
                  {resendState === 'idle' && 'Resend email'}
                  {resendState === 'sending' && 'Sending…'}
                  {resendState === 'sent' && 'Sent — check your inbox'}
                  {resendState === 'rate-limited' && 'Try again in a minute'}
                </button>
              </div>
            </div>
          </>
        )}

        <h2 className={styles.sectionTitle}>Plan details</h2>
        <PlanDetails subscriptionType={subscriptionType} />

        {notionData.connected && notionData.workSpace && (
          <>
            <h2 className={styles.sectionTitle}>Notion workspace</h2>
            <div className={styles.planCard}>
              <div className={styles.planHeader}>
                <span className={styles.planName}>{notionData.workSpace}</span>
                <a
                  href={notionData.connectionLink}
                  className={styles.planButton}
                >
                  Switch
                </a>
              </div>
            </div>
          </>
        )}

        <SubscriptionManagement
          user={user}
          locals={locals}
          hasActivePlan={hasActivePlan}
          onRefetch={refetch}
        />

        <AccountDeletion />

        <div className={styles.feedbackFooter}>
          <Link to="/feedback" className={sharedStyles.btnGhost}>
            Share your experience
          </Link>
        </div>
      </div>
    </div>
  );
}
