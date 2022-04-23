import { useContext } from 'react';
import { PageContainer } from '../../components/styled';
import StoreContext from '../../store/StoreContext';
import Menu from '../Search/components/Menu/Menu';

export default function SettingsPage() {
  const store = useContext(StoreContext);
  return (
    <PageContainer>
      <Menu favorites={store.favorites} />
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
