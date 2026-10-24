import { render, screen } from '@testing-library/react';
import { MessageContent } from '../../src/features/messages/MessageContent';

describe('MessageContent', () => {
  it('renders bold text and inline code', () => {
    render(<MessageContent content="This is **bold** and `code`" />);

    expect(screen.getByText('bold').tagName).toBe('STRONG');
    expect(screen.getByText('code').tagName).toBe('CODE');
  });

  it('renders an @mention as a highlighted span rather than a link', () => {
    render(<MessageContent content="hello @bob_card8 there" />);

    const mention = screen.getByText('@bob_card8');
    expect(mention.tagName).toBe('SPAN');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('syntax-highlights a fenced code block', () => {
    render(<MessageContent content={'```js\nconst x = 1;\n```'} />);

    const code = document.querySelector('pre code');
    expect(code).toBeTruthy();
    expect(code?.className).toContain('language-js');
  });
});
