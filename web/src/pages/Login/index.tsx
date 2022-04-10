import { useState } from 'react';
import RegisterForm from '../../components/forms/RegisterForm';
import LoginForm from '../../components/forms/LoginForm';
import ForgotPasswordForm from '../../components/forms/ForgotPasswordForm';
import NavButtonCTA from '../../components/buttons/NavButtonCTA';
import { Container } from '../../components/styled';
import TopSection from './TopSection';

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
    <Container>
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
    </Container>
  );
}

export default LoginPage;
