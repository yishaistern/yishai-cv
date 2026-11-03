import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SortableList } from './SortableList.tsx';

const items = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
];

function renderList(onMove = vi.fn<(from: number, to: number) => void>()) {
  render(
    <SortableList
      items={items}
      onMove={onMove}
      getLabel={(i) => i.label}
      renderItem={(i) => <span>{i.label}</span>}
    />,
  );
  return onMove;
}

describe('<SortableList>', () => {
  it('renders items in order through the render prop', () => {
    renderList();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      expect.stringContaining('Alpha'),
      expect.stringContaining('Beta'),
      expect.stringContaining('Gamma'),
    ]);
  });

  it('moves items with the keyboard-accessible arrow buttons', async () => {
    const onMove = renderList();
    await userEvent.click(screen.getByRole('button', { name: 'Move "Beta" up' }));
    expect(onMove).toHaveBeenCalledWith(1, 0);
    await userEvent.click(screen.getByRole('button', { name: 'Move "Beta" down' }));
    expect(onMove).toHaveBeenCalledWith(1, 2);
  });

  it('disables moves past either end', () => {
    renderList();
    expect(screen.getByRole('button', { name: 'Move "Alpha" up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move "Gamma" down' })).toBeDisabled();
  });

  it('shows the empty text when there are no items', () => {
    render(<SortableList items={[]} onMove={vi.fn<(from: number, to: number) => void>()} renderItem={() => null} emptyText="Nothing yet" />);
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
  });
});
