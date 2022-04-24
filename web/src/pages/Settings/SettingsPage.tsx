import { PageContainer } from '../../components/styled';

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="container content">
        <h2>Settings</h2>
        <p>
          The settings you apply here will be the default for new converts
          unless you set new rules.
        </p>
        <p>
          Settings defined on a page or database will be used. When no settings
          are set the ones here are used.
        </p>
        <ul>
          <li>list all settings</li>
          <li>add delete button</li>
          <li>add make this the default button</li>
        </ul>
      </div>
    </PageContainer>
  );
}
