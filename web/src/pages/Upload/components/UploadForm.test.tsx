import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import UploadForm from './UploadForm';

describe('UploadForm', () => {
  test('download button is light by default', () => {
    const { container } = render(
      <UploadForm setErrorMessage={(error) => fail(error)} />
    );
    expect(container.querySelector('.button.cta.is-light')).toBeInTheDocument();
  });

  test('no null classes', () => {
    const { container } = render(
      <UploadForm setErrorMessage={(error) => fail(error)} />
    );
    expect(container.querySelector('.null')).toBeNull();
  });

  test('download button is disabled', () => {
    render(<UploadForm setErrorMessage={(error) => fail(error)} />);
    expect(document.querySelector('.button.cta')).toBeDisabled();
  });
});
