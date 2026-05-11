import LandingPage from './LandingPage';
import notionCopy from './copy/notion';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

export default function NotionToAnki({ setErrorMessage }: Readonly<Props>) {
  return <LandingPage copy={notionCopy} setErrorMessage={setErrorMessage} />;
}
