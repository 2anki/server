import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ReactHtmlParser from 'react-html-parser';
import { lazy, useMemo, useState } from 'react';
import styled from 'styled-components';

import UploadPage from './pages/UploadPage';
import HomePage from './pages/Home';

import Footer from './components/Footer';
import CardOptionsStore from './store/CardOptionsStore';
import StoreContext from './store/StoreContext';
import GlobalStyle from './GlobalStyle';

import NavigationBar from './components/NavigationBar';

const TemplatePage = lazy(() => import('./pages/Templates/TemplatePage'));
const PreSignupPage = lazy(() => import('./pages/PreSignupPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NewPasswordPage = lazy(() => import('./pages/NewPasswordPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const VerifyPage = lazy(() => import('./pages/VerifyPage'));
const ListUploadsPage = lazy(() => import('./pages/ListUploadsPage'));

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const Container = styled.div`
  display: block;
  flex: 1 0 auto;
`;

function App() {
  const store = useMemo(() => new CardOptionsStore(), []);
  const [errorMessage, setErrorMessage] = useState('');
  // TODO: show notification on save mesages, did save etc.

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
            <Container>
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
                  <ListUploadsPage setError={setErrorMessage} />
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
                  <UploadPage setErrorMessage={setErrorMessage} errorMessage={errorMessage} />
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
                <Route path="/">
                  <HomePage />
                </Route>
              </Switch>
            </Container>
            <Footer />
          </Layout>
        </Router>
      </StoreContext.Provider>
    </>
  );
}

export default App;
