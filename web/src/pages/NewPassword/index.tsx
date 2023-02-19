import { ErrorHandlerType } from '../../components/errors/helpers/types';
import NewPassordForm from '../../components/forms/NewPasswordForm';
import { Container } from '../../components/styled';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

function NewPasswordPage({ setErrorMessage }: Props) {
  return (
    <Container>
      <NewPassordForm setErrorMessage={setErrorMessage} />
    </Container>
  );
}

export default NewPasswordPage;
