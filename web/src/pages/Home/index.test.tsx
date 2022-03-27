import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import { Router } from 'react-router-dom';

import Home from '.';

jest.mock('react-router-dom', () => ({
    __esModule: true,
    useLocation: jest.fn().mockReturnValue({
      pathname: '/another-route',
      search: '',
      hash: '',
      state: null,
      key: '5nvxpbdafa',
    }),
  }));

describe("Home", () => {
    it("renders without crashing", () => {
        render(<Router><Home /></Router>);
        const newsLink = screen.getByText(/READ MORE NEWS/i);
        expect(newsLink).toHaveAttribute("href", "https://2anki.net/news");
    })
})