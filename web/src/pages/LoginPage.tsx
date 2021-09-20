import { useState } from "react";
import styled from "styled-components";
import RegisterForm from "../components/forms/RegisterForm";

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  grid-gap: 1rem;
`;

const LoginPage = () => {
  const [isLogin, setLoginState] = useState(window.location.hash === "#login");
  const onClickLogin = () => {
    setLoginState(true);
    window.location.hash = "login";
  };
  const onClickRegister = () => {
    setLoginState(false);
    window.location.hash = "register";
  };
  return (
    <>
      <TopSection>
        {!isLogin && (
          <>
            Already have an account?
            <button className="button is-black" onClick={onClickLogin}>
              Log in
            </button>
          </>
        )}
        {isLogin && (
          <>
            Don't have an account?
            <button className="button is-black" onClick={onClickRegister}>
              Log in
            </button>
          </>
        )}
      </TopSection>
      {!isLogin && <RegisterForm />}
      {isLogin && <p>Coming soon</p>}
    </>
  );
};

export default LoginPage;
