import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, test } from 'vitest';

import ReEngagementReasonsChart from './ReEngagementReasonsChart';

describe('ReEngagementReasonsChart', () => {
  test('renders without crashing when given points', () => {
    const { container } = render(
      <ReEngagementReasonsChart
        points={[
          { stopped_reason: 'Switched to another tool', count: 6 },
          { stopped_reason: 'No longer studying', count: 3 },
        ]}
      />
    );
    expect(container.firstChild).not.toBeNull();
  });

  test('renders without crashing on an empty list', () => {
    const { container } = render(<ReEngagementReasonsChart points={[]} />);
    expect(container.firstChild).not.toBeNull();
  });
});
