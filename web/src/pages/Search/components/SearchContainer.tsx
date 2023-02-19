import { ErrorHandlerType } from '../../../components/errors/helpers/types';
import { PageContainer } from '../../../components/styled';
import Backend from '../../../lib/backend';
import LoadingIndicator from '../../../components/Loading';

import { NotionData } from '../helpers/useNotionData';
import useSearchQuery from '../helpers/useSearchQuery';
import SearchPresenter from './SearchPresenter';
import WorkSpaceHeader from './WorkspaceHeader';

interface SearchContentProps {
  backend: Backend;
  notionData: NotionData;
  setError: ErrorHandlerType;
}

export default function SearchContainer(props: SearchContentProps) {
  const { backend, notionData, setError } = props;
  const { myPages, inProgress, triggerSearch, isLoading, setSearchQuery } =
    useSearchQuery(backend, setError);
  
  if (isLoading) return <LoadingIndicator />;

  return (
    <PageContainer>
      <WorkSpaceHeader notionData={notionData} />
      <SearchPresenter
        setError={setError}
        myPages={myPages}
        inProgress={inProgress}
        setSearchQuery={setSearchQuery}
        triggerSearch={triggerSearch}
      />
    </PageContainer>
  );
}
