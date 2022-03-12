import NewPassordForm from '../components/forms/NewPassword';

interface Props {
  setErrorMessage: (message: string) => void;
}

function NewPasswordPage({ setErrorMessage }: Props) {
  return (
    <NewPassordForm setErrorMessage={setErrorMessage} />
  );
}

export default NewPasswordPage;
