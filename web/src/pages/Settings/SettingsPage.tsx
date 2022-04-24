import { PageContainer } from '../../components/styled';

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="container content">
        <h2>Settings</h2>

        <p>todo items</p>
        <ul>
          <li>list all settings</li>
          <li>add delete button</li>
          <li>add make this the default button</li>
        </ul>
      </div>
    </PageContainer>
  );
}
