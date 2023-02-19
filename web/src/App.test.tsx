import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders 2anki.net about', () => {
  render(<App />);
  const linkElement = screen.getByText(/What is 2anki/i);
  expect(linkElement).toBeInTheDocument();
});
