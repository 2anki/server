import ForgotPasswordForm from '../../components/forms/ForgotPasswordForm/ForgotPasswordForm';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

export function ForgotPasswordPage({ setErrorMessage }: Props) {
  return <ForgotPasswordForm setError={setErrorMessage} />;
}
