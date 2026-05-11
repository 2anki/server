import LandingPage from './LandingPage';
import pdfCopy from './copy/pdf';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

export default function PdfToAnki({ setErrorMessage }: Readonly<Props>) {
  return <LandingPage copy={pdfCopy} setErrorMessage={setErrorMessage} />;
}
