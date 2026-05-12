import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ValueProp } from './ValueProp';

describe('ValueProp', () => {
  it('renders the "What is 2anki?" heading', () => {
    render(<ValueProp />);
    expect(
      screen.getByRole('heading', { level: 2, name: /what is 2anki/i })
    ).toBeInTheDocument();
  });

  it('lists all supported formats', () => {
    render(<ValueProp />);
    for (const format of ['Notion', 'HTML', 'Markdown', 'PDF', 'CSV', 'Word', 'PowerPoint', 'Excel']) {
      expect(screen.getByText(format)).toBeInTheDocument();
    }
  });

  it('renders three how-it-works steps', () => {
    render(<ValueProp />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Convert')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('renders step numbers 1, 2, 3', () => {
    render(<ValueProp />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
