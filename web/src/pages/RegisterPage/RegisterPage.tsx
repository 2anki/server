import RegisterForm from '../../components/forms/RegisterForm';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import { useSearchParams } from 'react-router-dom';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

export function RegisterPage({ setErrorMessage }: Props) {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  return <RegisterForm setErrorMessage={setErrorMessage} redirect={redirect} />;
}
