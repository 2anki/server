import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { lazy } from "react";
import styled from "styled-components";

import UploadPage from "./pages/UploadPage";
import HomePage from "./pages/Home";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CardOptionsStore from "./store/Options";
import StoreContext from "./store/StoreContext";
import GlobalStyle from "./GlobalStyle";

import NewBanner from "./components/NewBanner";

const TemplatePage = lazy(() => import("./pages/Templates/TemplatePage"));
const PreSignupPage = lazy(() => import("./pages/PreSignupPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NewPasswordPage = lazy(() => import("./pages/NewPasswordPage"));

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const Container = styled.div`
  display: block;
  flex: 1 0 auto;
  padding: 4rem;
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
              render={({ location }) =>
                location.pathname.match(
                  /^(?!.*(login|dashboard|signup)).*$/
                ) ? (
                  <Header />
                ) : null
              }
            ></Route>
            <Container>
              <Route
                render={({ location }) =>
                  location.pathname !== "/pre-signup" ? <NewBanner /> : null
                }
              />
              <Switch>
                <Route path="/tm">
                  <TemplatePage />
                </Route>
                <Route path="/upload">
                  <UploadPage />
                </Route>
                <Route path="/pre-signup">
                  <PreSignupPage />
                </Route>
                <Route path="/dashboard">
                  <DashboardPage />
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
