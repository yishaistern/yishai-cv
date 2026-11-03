import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markup, parseMarkup } from './Markup.tsx';

describe('parseMarkup', () => {
  it('splits **bold** segments from plain text', () => {
    expect(parseMarkup('Hi **there** and **you**!')).toEqual([
      { text: 'Hi ', bold: false },
      { text: 'there', bold: true },
      { text: ' and ', bold: false },
      { text: 'you', bold: true },
      { text: '!', bold: false },
    ]);
  });

  it('leaves unmatched or empty markers as plain text', () => {
    expect(parseMarkup('a ** b')).toEqual([{ text: 'a ** b', bold: false }]);
    expect(parseMarkup('****')).toEqual([{ text: '****', bold: false }]);
  });
});

describe('<Markup>', () => {
  it('renders bold parts as <strong> and escapes HTML', () => {
    const { container } = render(
      <p>
        <Markup text={'**Lead** <img src=x onerror=alert(1)>'} />
      </p>,
    );
    expect(container.querySelector('strong')).toHaveTextContent('Lead');
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('<img src=x onerror=alert(1)>');
  });
});
