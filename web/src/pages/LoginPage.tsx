import { useState } from 'react';
import styled from 'styled-components';
import RegisterForm from '../components/forms/RegisterForm';
import LoginForm from '../components/forms/LoginForm';
import ForgotPasswordForm from '../components/forms/ForgotPassword';
import NavButtonCTA from '../components/buttons/NavButtonCTA';

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  grid-gap: 1rem;
  padding: 1rem;
`;

interface Props {
  setErrorMessage: (message: string) => void;
}

function LoginPage({ setErrorMessage }: Props) {
  const [isLogin, setLoginState] = useState(window.location.hash === '#login');
  const [isForgot, setIsForgot] = useState(window.location.hash === '#forgot');
  const onClickLogin = () => {
    setIsForgot(false);
    setLoginState(true);
    window.location.hash = 'login';
  };
  const onClickRegister = () => {
    setIsForgot(false);
    setLoginState(false);
    window.location.hash = 'register';
  };
  const login = <LoginForm onForgotPassword={() => setIsForgot(true)} onError={setErrorMessage} />;
  return (
    <>
      {!isLogin && (
      <TopSection onClick={() => onClickLogin()}>
        <span className="mx-2">Already have an account?</span>
        <NavButtonCTA href="/login#login">Sign in</NavButtonCTA>
      </TopSection>
      )}
      {isLogin && (
      <TopSection onClick={onClickRegister}>
        Don&apos;t have an account?
        <NavButtonCTA href="/login#register">
          Join Now
        </NavButtonCTA>
      </TopSection>
      )}
      {!isLogin && !isForgot && <RegisterForm setErrorMessage={setErrorMessage} />}
      {isLogin && !isForgot && login }
      {isForgot && <ForgotPasswordForm setError={setErrorMessage} />}
    </>
  );
}

export default LoginPage;
