import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import styled from "styled-components";

import NotionConnectPage from "./pages/NotionConnectPage";
import TemplatePage from "./pages/Templates/TemplatePage";
import UploadPage from "./pages/UploadPage";
import HomePage from "./pages/Home";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CardOptionsStore from "./store/Options";
import StoreContext from "./store/StoreContext";
import GlobalStyle from "./GlobalStyle";

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

/**
 TODOs
 - Use new component for external links <ExternalLink ...>
 */

function App() {
  const store = new CardOptionsStore();

  return (
    <>
      <GlobalStyle />
      <StoreContext.Provider value={store}>
        <Router>
          <Layout>
            <Header />
            <Container>
              <Switch>
                <Route path="/tm">
                  <TemplatePage />
                </Route>
                <Route path="/upload">
                  <UploadPage />
                </Route>
                <Route path="/connect-notion">
                  <NotionConnectPage />
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
