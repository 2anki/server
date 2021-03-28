import { Route, Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import styled from "styled-components"

import UploadPage from "./pages/Upload"
import HomePage from "./pages/Home"

import Header from "./components/Header"
import Footer from "./components/Footer"

const Layout = styled.div`
  display: flex;
   flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`

const Container = styled.div`
  display: block;
  flex: 1 0 auto;
  padding: 4rem;
`

function App() {
  const history = createBrowserHistory()
  return (
      <Router history={history}>
    <Layout>
      <Header />
      <Container>
        <Switch>
          <Route path="/">
            <HomePage />
            </Route>
          <Route path="/upload">
            <UploadPage />
            </Route>
        </Switch>
        
      </Container>
      <Footer />
    </Layout>
      </Router>
  );
}

export default App;
