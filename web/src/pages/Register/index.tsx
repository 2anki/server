import RegisterForm from '../../components/forms/RegisterForm';
import NavButtonCTA from '../../components/buttons/NavButtonCTA';
import { Container } from '../../components/styled';
import TopSection from './TopSection';
import { ErrorHandlerType } from '../../components/errors/helpers/types';
import { goToLoginPage } from './goToLoginPage';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

function RegisterPage({ setErrorMessage }: Props) {
  return (
    <Container>
      <TopSection onClick={goToLoginPage}>
        <span className="mx-2">Already have an account?</span>
        <NavButtonCTA href="/login#login">Sign in</NavButtonCTA>
      </TopSection>
      <RegisterForm setErrorMessage={setErrorMessage} />
    </Container>
  );
}

export default RegisterPage;
