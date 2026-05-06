import { useSearchParams } from 'react-router-dom';
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

  const dismissSubscribedBanner = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('subscribed');
    setSearchParams(next, { replace: true });
  };

  if (isLoading) return <SkeletonPage rows={4} />;

  if (!data?.user?.email) {
    window.location.href = '/login';
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
      </div>
    </div>
  );
}
