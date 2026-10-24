import { render } from '@testing-library/react';
import { highlightMatches } from '../../src/features/messages/highlightMatches';

describe('highlightMatches', () => {
  it('wraps the matching substring in a <mark>, case-insensitively', () => {
    const { container } = render(<>{highlightMatches('Hello World', 'world')}</>);

    const mark = container.querySelector('mark');
    expect(mark).toBeTruthy();
    expect(mark?.textContent).toBe('World');
  });

  it('returns the original text unchanged when the query is empty', () => {
    const { container } = render(<>{highlightMatches('Hello World', '  ')}</>);

    expect(container.querySelector('mark')).toBeNull();
    expect(container.textContent).toBe('Hello World');
  });

  it('highlights every occurrence of the query', () => {
    const { container } = render(<>{highlightMatches('cat cat cat', 'cat')}</>);

    expect(container.querySelectorAll('mark')).toHaveLength(3);
  });
});
