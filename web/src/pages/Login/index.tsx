import { useState } from 'react';
import LoginForm from '../../components/forms/LoginForm';
import ForgotPasswordForm from '../../components/forms/ForgotPasswordForm';
import NavButtonCTA from '../../components/buttons/NavButtonCTA';
import { Container } from '../../components/styled';
import TopSection from './TopSection';
import { ErrorHandlerType } from '../../components/errors/helpers/types';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

function LoginPage({ setErrorMessage }: Props) {
  const [isForgot, setIsForgot] = useState(window.location.hash === '#forgot');
  const onClickRegister = () => {
    window.location.href = '/register';
  };
  const login = (
    <LoginForm
      onForgotPassword={() => setIsForgot(true)}
      onError={setErrorMessage}
    />
  );
  return (
    <Container>
      <TopSection onClick={onClickRegister}>
        Don&apos;t have an account?
        <NavButtonCTA href="/login#register">Join Now</NavButtonCTA>
      </TopSection>
      {!isForgot && login}
      {isForgot && <ForgotPasswordForm setError={setErrorMessage} />}
    </Container>
  );
}

export default LoginPage;
