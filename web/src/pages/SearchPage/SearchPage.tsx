/* eslint-disable no-console */
import React from 'react';
import SearchContainer from './components/SearchContainer';
import useNotionData from './helpers/useNotionData';
import ConnectNotion from './components/ConnectNotion';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import { ErrorPresenter } from '../../components/errors/ErrorPresenter';
import styles from '../../styles/shared.module.css';

interface SearchPageProps {
  setError: ErrorHandlerType;
}

export function SearchPage({ setError }: SearchPageProps) {
  const notionData = useNotionData(get2ankiApi());

  const headerTitle = notionData.connected
    ? 'Search Notion'
    : 'Connect to Notion or upload manually';
  const headerSubtitle = notionData.connected
    ? 'Find a Notion page and convert it into an Anki deck.'
    : 'Link your Notion workspace to search pages, or upload files directly.';

  let content;
  if (notionData.loading) {
    content = <SkeletonList count={6} />;
  } else if (notionData.error) {
    content = (
      <ErrorPresenter error={notionData.error} onRetry={notionData.refetch} />
    );
  } else if (!notionData.connected) {
    content = (
      <ConnectNotion
        ready={!notionData.connected}
        connectionLink={notionData.connectionLink}
      />
    );
  } else {
    content = (
      <SearchContainer
        backend={get2ankiApi()}
        setError={setError}
        workSpace={notionData.workSpace}
      />
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>{headerTitle}</h1>
        <p className={styles.subtitle}>{headerSubtitle}</p>
      </header>
      {content}
    </div>
  );
}
