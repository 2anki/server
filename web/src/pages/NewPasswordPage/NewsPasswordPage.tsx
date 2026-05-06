import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import NewPassordForm from '../../components/forms/NewPasswordForm';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

export function NewPasswordPage({ setErrorMessage }: Props) {
  return <NewPassordForm setErrorMessage={setErrorMessage} />;
}
