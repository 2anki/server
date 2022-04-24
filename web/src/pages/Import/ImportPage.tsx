import { PageContainer } from '../../components/styled';

export default function ImportPage() {
  return (
    <PageContainer>
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
