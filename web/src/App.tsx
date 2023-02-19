import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { lazy, useMemo, useState } from 'react';

import '@fremtind/jkl-accordion/accordion.min.css';
import '@fremtind/jkl-alert-message/alert-message.min.css';

import { useCookies } from 'react-cookie';
import { captureException } from '@sentry/react';
import UploadPage from './pages/Upload';
import HomePage from './pages/Home';

import Footer from './components/Footer';
import CardOptionsStore from './store/CardOptionsStore';
import StoreContext from './store/StoreContext';
import GlobalStyle from './GlobalStyle';
import ImportPage from './pages/Import/ImportPage';
import isOfflineMode from './lib/isOfflineMode';
import { ErrorType } from './components/errors/helpers/types';
import DebugPage from './pages/Debug';
import FavoritesPage from './pages/Favorites';
import { PageLayout } from './components/Layout/PageLayout';
import DeleteAccountPage from './pages/Delete';

const RegisterPage = lazy(() => import('./pages/Register'));
const SearchPage = lazy(() => import('./pages/Search'));
const LoginPage = lazy(() => import('./pages/Login'));
const NewPasswordPage = lazy(() => import('./pages/NewPassword'));
const MyUploadsPage = lazy(() => import('./pages/MyUploads'));

function App() {
  const [cookies, setCookie] = useCookies(['token']);
  if (isOfflineMode() && !cookies.token) {
    setCookie('token', '?');
  }

  const loadDefaults = localStorage.getItem('skip-defaults') !== 'true';
  const oldStore = useMemo(() => new CardOptionsStore(loadDefaults), []);
  const [apiError, setError] = useState<ErrorType | null>(null);
  const handledError = (error: ErrorType) => {
    const errorMessage = typeof error === 'string' ? new Error(error) : error;
    captureException(errorMessage);
    setError(errorMessage);
  };

  return (
    <>
      <GlobalStyle />
      <StoreContext.Provider value={oldStore}>
        <Router>
          <PageLayout error={apiError}>
            <Switch>
              <Route path="/favorites">
                <FavoritesPage setError={handledError} />
              </Route>
              <Route path="/uploads">
                <MyUploadsPage setError={handledError} />
              </Route>
              <Route path="/upload">
                <UploadPage setErrorMessage={handledError} />
              </Route>
              <Route path="/register">
                <RegisterPage setErrorMessage={handledError} />
              </Route>
              <Route path="/search">
                <SearchPage setError={handledError} />
              </Route>
              <Route path="/login">
                <LoginPage setErrorMessage={handledError} />
              </Route>
              <Route path="/users/r/:id">
                <NewPasswordPage setErrorMessage={handledError} />
              </Route>
              <Route path="/import">
                <ImportPage />
              </Route>
              <Route path="/debug">
                <DebugPage />
              </Route>
              <Route path="/delete-account">
                <DeleteAccountPage setError={handledError} />
              </Route>
              <Route path="/">
                <HomePage />
              </Route>
            </Switch>
            <Footer />
          </PageLayout>
        </Router>
      </StoreContext.Provider>
    </>
  );
}

export default App;
