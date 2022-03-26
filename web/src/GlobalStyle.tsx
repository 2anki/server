import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`

@font-face {
  font-family: 'Rubik';
  font-style: normal;
  font-weight: 400;
  src: url(fonts/Rubik/static/Rubik-Regular.ttf) format('truetype');
}

body {
  margin: 0;
  font-family: Rubik -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a, p, h2, h3, h4, h5, h6 {
  font-family: Rubik;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

@font-face {
  font-family: "Urbanist";
  src: url(fonts/Urbanist/static/Urbanist-Bold.ttf) format("truetype")
}

h1 {
  font-family: Urbanist;
}
`;

export default GlobalStyle;
