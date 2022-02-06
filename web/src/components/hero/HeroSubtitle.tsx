import styled from "styled-components"

import HeroTitle from './HeroTitle';

const HeroSubtitle = styled(HeroTitle)`
display: block;
 text-align: center;
  background: linear-gradient(#6B5EFF, 70%, #5397F5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
    @media (max-width: 1024px) {
      text-align: left;
    }
`

export default HeroSubtitle;