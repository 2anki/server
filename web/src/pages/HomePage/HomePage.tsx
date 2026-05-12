import { Navigate } from 'react-router-dom';
import HeroSection from './components/Sections/hero';
import UploadForm from '../UploadPage/components/UploadForm/UploadForm';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import heroStyles from './components/Sections/hero/Hero.module.css';
import { useSettingsCardsOptions } from '../../components/modals/SettingsModal/useSettingsCardsOptions';
import { ValueProp } from './components/ValueProp';
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
        <p className={styles.textCenter}>
          <strong>Try it now</strong> — drop any file to get started
        </p>
        <UploadForm setErrorMessage={setErrorMessage} />
        <p className={`${styles.smallDescription} ${styles.textCenter}`}>
          Supports Notion exports (.zip, .html), Markdown, PDF, CSV, Word, PowerPoint, and Excel.
        </p>
      </div>
      <ValueProp />
      <div className={styles.contentSection}>
        <h2 className={styles.subHeading}>Video walkthroughs</h2>
        <VideosAndDocs />
      </div>
    </div>
  );
}
