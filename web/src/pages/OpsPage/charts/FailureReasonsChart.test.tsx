import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, test } from 'vitest';

import FailureReasonsChart from './FailureReasonsChart';

describe('FailureReasonsChart', () => {
  test('renders without crashing when given points', () => {
    const { container } = render(
      <FailureReasonsChart
        points={[
          { reason: 'Notion timeout', count: 12 },
          { reason: 'Parser crash', count: 5 },
        ]}
      />
    );

    expect(container.firstChild).not.toBeNull();
  });

  test('renders without crashing on an empty list', () => {
    const { container } = render(<FailureReasonsChart points={[]} />);

    expect(container.firstChild).not.toBeNull();
  });
});
