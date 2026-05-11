import LandingPage from './LandingPage';
import quizletCopy from './copy/quizlet';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

export default function QuizletToAnki({ setErrorMessage }: Readonly<Props>) {
  return <LandingPage copy={quizletCopy} setErrorMessage={setErrorMessage} />;
}
