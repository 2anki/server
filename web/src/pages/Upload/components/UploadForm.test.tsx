import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import UploadForm from './UploadForm';

describe('UploadForm', () => {
  test('download button is light by default', () => {
    const { container } = render(
      <UploadForm setErrorMessage={(error) => fail(error)} errorMessage="" />,
    );
    expect(container.querySelector('.button.cta.is-light')).toBeInTheDocument();
  });
  test('no null classes', () => {
    const { container } = render(
      <UploadForm setErrorMessage={(error) => fail(error)} errorMessage="" />,
    );
    expect(container.querySelector('.null')).toBeNull();
  });
});
