import { useState } from "react";
import styled from "styled-components";
import RegisterForm from "../components/forms/RegisterForm";
import LoginForm from "../components/forms/LoginForm";
import ForgotPasswordForm from "../components/forms/ForgotPassword";

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  grid-gap: 1rem;
  padding: 1rem;
`;

const LoginPage = () => {
  const [isLogin, setLoginState] = useState(window.location.hash === "#login");
  const [isForgot, setIsForgot] = useState(window.location.hash === "#forgot");
  const onClickLogin = () => {
    setIsForgot(false);
    setLoginState(true);
    window.location.hash = "login";
  };
  const onClickRegister = () => {
    setIsForgot(false);
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
              Sign in
            </button>
          </>
        )}
        {isLogin && (
          <>
            Don't have an account?
            <button className="button is-black" onClick={onClickRegister}>
              Join Now
            </button>
          </>
        )}
      </TopSection>
      {!isLogin && !isForgot && <RegisterForm />}
      {isLogin && !isForgot && <LoginForm onForgot={() => setIsForgot(true)} />}
      {isForgot && <ForgotPasswordForm />}
    </>
  );
};

export default LoginPage;
