import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, test } from 'vitest';

import MetricCard, { formatNumberOrDash } from './MetricCard';

describe('MetricCard', () => {
  test('renders title and value', () => {
    render(<MetricCard title="MRR" value="$4,820" />);
    expect(screen.getByText('MRR')).toBeInTheDocument();
    expect(screen.getByText('$4,820')).toBeInTheDocument();
  });

  test('renders the footnote when provided', () => {
    render(
      <MetricCard
        title="MRR"
        value="$4,820"
        footnote="as of 14:32 (cache 412s old)"
      />
    );
    expect(
      screen.getByText('as of 14:32 (cache 412s old)')
    ).toBeInTheDocument();
  });

  test('omits the footnote element when not provided', () => {
    const { container } = render(<MetricCard title="MRR" value="$4,820" />);
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });
});

describe('formatNumberOrDash', () => {
  test('returns em-dash for null', () => {
    expect(formatNumberOrDash(null, (n) => `${n}`)).toBe('—');
  });

  test('applies the formatter for non-null values', () => {
    expect(formatNumberOrDash(42, (n) => `$${n}`)).toBe('$42');
  });

  test('treats zero as a real value, not absent', () => {
    expect(formatNumberOrDash(0, (n) => `${n}`)).toBe('0');
  });
});
