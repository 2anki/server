import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { lazy } from 'react';
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
  const store = new CardOptionsStore();

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
              <Switch>
                <Route path="/uploads">
                  <ListUploadsPage />
                </Route>
                <Route path="/verify">
                  <VerifyPage />
                </Route>
                <Route path="/learn">
                  <LearnPage />
                </Route>
                <Route path="/tm">
                  <TemplatePage />
                </Route>
                <Route path="/upload">
                  <UploadPage />
                </Route>
                <Route path="/pre-signup">
                  <PreSignupPage />
                </Route>
                <Route path="/search">
                  <SearchPage />
                </Route>
                <Route path="/login">
                  <LoginPage />
                </Route>
                <Route path="/users/r/:id">
                  <NewPasswordPage />
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
