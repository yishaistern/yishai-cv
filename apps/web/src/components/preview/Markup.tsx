import { Fragment, type ReactNode } from 'react';

// A piece of parsed text: either plain or bold.
export interface MarkupPart {
  text: string;
  bold: boolean;
}

// Matches **something** (non-greedy, so "**a** and **b**" gives two matches).
// The capturing group makes String.split() keep the matched parts in the result.
const BOLD_RE = /(\*\*[^*]+?\*\*)/g;

/** Turns "Hi **there**" into [{text:'Hi ', bold:false}, {text:'there', bold:true}]. */
export function parseMarkup(text: string): MarkupPart[] {
  return text
    .split(BOLD_RE)
    .filter((piece) => piece !== '') // split leaves empty strings at the edges
    .map((piece) =>
      piece.startsWith('**') && piece.endsWith('**') && piece.length > 4
        ? { text: piece.slice(2, -2), bold: true }
        : { text: piece, bold: false },
    );
}

/**
 * Renders text with **bold** markup as real React elements.
 * No dangerouslySetInnerHTML: React escapes plain strings for us, so user text
 * can never inject HTML.
 */
export function Markup({ text }: { text: string }): ReactNode {
  // Returning an array of nodes is fine in React; each needs a `key`.
  // Here the index is an OK key because the list is derived from a string and
  // never reordered on its own. <Fragment> lets us attach a key to plain text
  // without adding an extra DOM element (a <span> could pick up CV styles).
  return parseMarkup(text).map((part, i) =>
    part.bold ? <strong key={i}>{part.text}</strong> : <Fragment key={i}>{part.text}</Fragment>,
  );
}
