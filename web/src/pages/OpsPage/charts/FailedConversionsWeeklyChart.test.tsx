import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, test } from 'vitest';

import FailedConversionsWeeklyChart from './FailedConversionsWeeklyChart';

describe('FailedConversionsWeeklyChart', () => {
  test('renders without crashing when given weekly points', () => {
    const { container } = render(
      <FailedConversionsWeeklyChart
        points={Array.from({ length: 4 }).map((_, i) => ({
          week: `2026-04-${String(7 + i * 7).padStart(2, '0')}`,
          count: i,
        }))}
      />
    );

    expect(container.firstChild).not.toBeNull();
  });

  test('renders without crashing on an empty list', () => {
    const { container } = render(<FailedConversionsWeeklyChart points={[]} />);

    expect(container.firstChild).not.toBeNull();
  });
});
