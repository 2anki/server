import { Navigate } from 'react-router-dom';
import HeroSection from './components/Sections/hero';
import UploadForm from '../UploadPage/components/UploadForm/UploadForm';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import heroStyles from './components/Sections/hero/Hero.module.css';
import { useSettingsCardsOptions } from '../../components/modals/SettingsModal/useSettingsCardsOptions';
import { HomePageAnonHeader } from './components/HomePageAnonHeader';
import { VideosAndDocs } from './components/VideosAndDocs';
import styles from '../../styles/shared.module.css';

interface HomePageProps {
  setErrorMessage: ErrorHandlerType;
  isLoggedIn: boolean;
}

export function HomePage({
  setErrorMessage,
  isLoggedIn,
}: Readonly<HomePageProps>) {
  useSettingsCardsOptions(null);

  if (isLoggedIn) {
    return <Navigate to="/upload" replace />;
  }

  return (
    <div>
      <HeroSection />
      <div className={heroStyles.formSection}>
        <UploadForm setErrorMessage={setErrorMessage} />
      </div>
      <div className={styles.contentSection}>
        <HomePageAnonHeader />
        <VideosAndDocs />
        <p>Happy learning!</p>
      </div>
    </div>
  );
}
