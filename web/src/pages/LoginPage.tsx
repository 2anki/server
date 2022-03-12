import { useState } from 'react';
import styled from 'styled-components';
import RegisterForm from '../components/forms/RegisterForm';
import LoginForm from '../components/forms/LoginForm';
import ForgotPasswordForm from '../components/forms/ForgotPassword';

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
  return (
    <>
      <TopSection>
        {!isLogin && (
          <>
            Already have an account?
            <button type="button" className="button is-black" onClick={onClickLogin}>
              Beta access
            </button>
          </>
        )}
        {isLogin && (
          <>
            Need a new account?
            <button type="button" className="button is-black" onClick={onClickRegister}>
              Register
            </button>
          </>
        )}
      </TopSection>
      {!isLogin && !isForgot && <RegisterForm setErrorMessage={setErrorMessage} />}
      {isLogin && !isForgot
      && <LoginForm onForgotPassword={() => setIsForgot(true)} onError={setErrorMessage} />}
      {isForgot && <ForgotPasswordForm setError={setErrorMessage} />}
    </>
  );
}

export default LoginPage;
