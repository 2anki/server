import LandingPage from './LandingPage';
import markdownCopy from './copy/markdown';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

export default function MarkdownToAnki({ setErrorMessage }: Readonly<Props>) {
  return <LandingPage copy={markdownCopy} setErrorMessage={setErrorMessage} />;
}
