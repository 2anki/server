import NewPassordForm from '../../components/forms/NewPasswordForm';
import { Container } from '../../components/styled';

interface Props {
  setErrorMessage: (message: string) => void;
}

function NewPasswordPage({ setErrorMessage }: Props) {
  return (
    <Container>
      <NewPassordForm setErrorMessage={setErrorMessage} />
    </Container>
  );
}

export default NewPasswordPage;
