import { useContext } from 'react';
import { PageContainer } from '../../components/styled';
import StoreContext from '../../store/StoreContext';
import Menu from '../Search/components/Menu/Menu';

export default function ImportPage() {
  const store = useContext(StoreContext);
  return (
    <PageContainer>
      <Menu favorites={store.favorites} />
      <div className="container content">
        <h1>Import</h1>
        <hr />
        <p>Our main focus right now is to get better support for Notion.</p>
        <p>More formats are on the roadmap like:</p>
        <ul>
          <li>APKG → Notion</li>
          <li>CSV → Anki</li>
          <li>TSV → Anki</li>
          <li>PDF → Anki</li>
          <li>YouTube → Anki</li>
        </ul>
      </div>
    </PageContainer>
  );
}
