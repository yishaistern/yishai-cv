import type { ComponentProps } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../api.ts';
import { ToastProvider } from '../../hooks/useToast.tsx';
import { makeVersion } from '../../test/fixtures.ts';
import { Workspace } from './Workspace.tsx';

// Replace the HTTP layer; the component logic stays real.
vi.mock('../../api.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api.ts')>();
  return {
    ...actual,
    api: {
      listRevisions: vi.fn<typeof actual.api.listRevisions>(async () => []),
      updateVersion: vi.fn<typeof actual.api.updateVersion>(),
      getRevision: vi.fn<typeof actual.api.getRevision>(),
      restoreRevision: vi.fn<typeof actual.api.restoreRevision>(),
    },
  };
});

function renderWorkspace() {
  const version = makeVersion();
  type Props = ComponentProps<typeof Workspace>;
  const props = {
    onSaved: vi.fn<Props['onSaved']>(),
    onReplaced: vi.fn<Props['onReplaced']>(),
    onDirtyChange: vi.fn<Props['onDirtyChange']>(),
  };
  render(
    <ToastProvider>
      <Workspace version={version} {...props} />
    </ToastProvider>,
  );
  return { version, ...props };
}

beforeEach(() => {
  vi.mocked(api.updateVersion).mockReset();
});

describe('<Workspace>', () => {
  it('starts clean', () => {
    const { onDirtyChange } = renderWorkspace();
    expect(screen.getByText('✓ All changes saved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('marks edits as dirty, saves them with ⌘S, and records the note', async () => {
    const user = userEvent.setup();
    const { version, onSaved, onDirtyChange } = renderWorkspace();
    vi.mocked(api.updateVersion).mockImplementation(async (_id, body) => ({ ...version, ...body, data: body.data! }));

    const summary = screen.getByRole('textbox', { name: 'Summary' });
    await user.clear(summary);
    await user.type(summary, 'Shorter');
    expect(screen.getByText('● Unsaved changes')).toBeInTheDocument();
    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
    // The live preview shows the draft immediately.
    expect(screen.getAllByText('Shorter').length).toBeGreaterThan(1);

    await user.type(screen.getByRole('textbox', { name: 'Revision note' }), 'trim summary');
    await user.keyboard('{Meta>}s{/Meta}');

    await waitFor(() => expect(screen.getByText('✓ All changes saved')).toBeInTheDocument());
    expect(api.updateVersion).toHaveBeenCalledWith(
      version.id,
      expect.objectContaining({ note: 'trim summary', data: expect.objectContaining({ summary: 'Shorter' }) }),
    );
    expect(onSaved).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Revision note' })).toHaveValue('');
  });

  it('only sends metadata when the CV content did not change', async () => {
    const user = userEvent.setup();
    const { version } = renderWorkspace();
    vi.mocked(api.updateVersion).mockImplementation(async () => version);

    await user.type(screen.getByRole('textbox', { name: 'Target company' }), 'Acme');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(api.updateVersion).toHaveBeenCalledOnce());
    const body = vi.mocked(api.updateVersion).mock.calls[0]![1];
    expect(body.targetCompany).toBe('Acme');
    expect(body).not.toHaveProperty('data');
  });

  it('keeps the edits and stays dirty when saving fails', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    vi.mocked(api.updateVersion).mockRejectedValue(new Error('disk full'));

    await user.type(screen.getByRole('textbox', { name: 'Target company' }), 'Acme');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Save failed: disk full')).toBeInTheDocument();
    expect(screen.getByText('● Unsaved changes')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Target company' })).toHaveValue('Acme');
  });

  it('shows the version name in the document title', () => {
    renderWorkspace();
    expect(document.title).toBe('Base CV · CV Studio');
  });
});
