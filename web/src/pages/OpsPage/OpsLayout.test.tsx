import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, test } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import OpsLayout from './OpsLayout';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/ops" element={<OpsLayout />}>
          <Route index element={<div data-testid="engineering">eng</div>} />
          <Route
            path="business"
            element={<div data-testid="business">biz</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('OpsLayout', () => {
  test('renders both tab links', () => {
    renderAt('/ops');
    expect(screen.getByRole('link', { name: 'Engineering' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Business' })).toBeInTheDocument();
  });

  test('marks Engineering active on /ops', () => {
    renderAt('/ops');
    const engineering = screen.getByRole('link', { name: 'Engineering' });
    const business = screen.getByRole('link', { name: 'Business' });
    expect(engineering).toHaveAttribute('aria-current', 'page');
    expect(business).not.toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('engineering')).toBeInTheDocument();
  });

  test('marks Business active on /ops/business', () => {
    renderAt('/ops/business');
    const engineering = screen.getByRole('link', { name: 'Engineering' });
    const business = screen.getByRole('link', { name: 'Business' });
    expect(business).toHaveAttribute('aria-current', 'page');
    expect(engineering).not.toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('business')).toBeInTheDocument();
  });

  test('clicking the Business tab updates the URL and renders BusinessTab', () => {
    renderAt('/ops');
    expect(screen.getByTestId('engineering')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Business' }));

    expect(screen.getByTestId('business')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Business' })
    ).toHaveAttribute('aria-current', 'page');
  });
});
