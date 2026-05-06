import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

import UploadForm from './UploadForm';

describe('UploadForm', () => {
  test('no null classes', () => {
    const { container } = render(<UploadForm setErrorMessage={vi.fn()} />);
    expect(container.querySelector('.null')).toBeNull();
  });
});
