import { render, screen } from '@testing-library/react';
import App from './App';

test('renders 2anki.net title', () => {
  render(<App />);
  const linkElement = screen.getAllByText(/Notion to Anki/i)[0];
  expect(linkElement).toBeInTheDocument();
});
