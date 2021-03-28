import './App.css';

import styled from "styled-components"

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
  return (
    <Layout>
      <Header />
      <Container>
        <p>Content</p>
      </Container>
      <Footer />
    </Layout>
  );
}

export default App;
