import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ReactHtmlParser from 'react-html-parser';
import { lazy, useMemo, useState } from 'react';
import styled from 'styled-components';

import UploadPage from './pages/Upload';
import HomePage from './pages/Home';

import Footer from './components/Footer';
import CardOptionsStore from './store/CardOptionsStore';
import StoreContext from './store/StoreContext';
import GlobalStyle from './GlobalStyle';
import { NavigationBar } from './components/NavigationBar/NavigationBar';
import SettingsPage from './pages/Settings';
import ImportPage from './pages/Import/ImportPage';

const TemplatePage = lazy(() => import('./pages/Templates'));
const PreSignupPage = lazy(() => import('./pages/Register'));
const SearchPage = lazy(() => import('./pages/Search'));
const LoginPage = lazy(() => import('./pages/Login'));
const NewPasswordPage = lazy(() => import('./pages/NewPassword'));
const LearnPage = lazy(() => import('./pages/Learn'));
const VerifyPage = lazy(() => import('./pages/Verify'));
const MyUploadsPage = lazy(() => import('./pages/MyUploads'));

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

function App() {
  const store = useMemo(() => new CardOptionsStore(), []);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <>
      <GlobalStyle />
      <StoreContext.Provider value={store}>
        <Router>
          <Layout>
            {/* We don't want a header on the sign-up page */}
            <Route
              render={({ location }) => (location.pathname.match(/^(?!.*(login|search|signup)).*$/) ? (
                <NavigationBar />
              ) : null)}
            />
            {errorMessage && (
              <div className="is-info notification is-light my-4">
                <button
                  aria-label="dismiss error message"
                  type="button"
                  className="delete"
                  onClick={() => setErrorMessage(null)}
                />
                <div>
                  {ReactHtmlParser(errorMessage)}
                </div>
              </div>
            )}
            <Switch>
              <Route path="/uploads">
                <MyUploadsPage setError={setErrorMessage} />
              </Route>
              <Route path="/verify">
                <VerifyPage />
              </Route>
              <Route path="/learn">
                <LearnPage setError={setErrorMessage} />
              </Route>
              <Route path="/tm">
                <TemplatePage />
              </Route>
              <Route path="/upload">
                <UploadPage setErrorMessage={setErrorMessage} />
              </Route>
              <Route path="/pre-signup">
                <PreSignupPage />
              </Route>
              <Route path="/search">
                <SearchPage />
              </Route>
              <Route path="/login">
                <LoginPage setErrorMessage={setErrorMessage} />
              </Route>
              <Route path="/users/r/:id">
                <NewPasswordPage setErrorMessage={setErrorMessage} />
              </Route>
              <Route path="/settings">
                <SettingsPage />
              </Route>
              <Route path="/import">
                <ImportPage />
              </Route>
              <Route path="/">
                <HomePage />
              </Route>
            </Switch>
            <Footer />
          </Layout>
        </Router>
      </StoreContext.Provider>
    </>
  );
}

export default App;
