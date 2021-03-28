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

function App() {
  return (
    <Layout>
      <Header />
      <div>
        <p>Content</p>
      </div>
      <Footer />
    </Layout>
  );
}

export default App;
