import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { AddLinkModal, EditLinkModal } from './LinkAssetModal';
import type { Asset } from '../../../types';

// Component tests for link asset modals.
// AddLinkModal — tests the form → callback contract.
// EditLinkModal — tests pre-population and the label clearing behaviour
//   (clearing the label should send null, not undefined or empty string).
// This pattern extends to other modals — see DECISIONS.md for what
// would be added with more time.

const mockAsset: Asset = {
  id: 'asset-1',
  projectId: 'project-1',
  type: 'LINK',
  name: 'Matterport',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assetLink: {
    id: 'link-1',
    assetId: 'asset-1',
    url: 'https://matterport.com',
    label: 'Matterport',
  },
};

describe('AddLinkModal', () => {
  it('calls onSave with correct data when form is submitted', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(<AddLinkModal loading={false} onSave={onSave} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('https://example.com'), {
      target: { value: 'https://matterport.com' },
    });

    fireEvent.change(screen.getByPlaceholderText('Friendly name'), {
      target: { value: 'Matterport' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add Link' }));

    expect(onSave).toHaveBeenCalledWith({
      name: 'Matterport',
      url: 'https://matterport.com',
      label: 'Matterport',
    });
  });

  it('disables save button when URL is empty', () => {
    render(<AddLinkModal loading={false} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Add Link' })).toBeDisabled();
  });

  it('disables save button while loading', () => {
    render(<AddLinkModal loading={true} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText('Saving…')).toBeDisabled();
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();

    render(<AddLinkModal loading={false} onSave={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });
});

describe('EditLinkModal', () => {
  it('pre-populates fields with existing asset values', () => {
    render(<EditLinkModal asset={mockAsset} loading={false} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByDisplayValue('https://matterport.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Matterport')).toBeInTheDocument();
  });

  it('sends null when label is cleared', () => {
    const onSave = vi.fn();

    render(<EditLinkModal asset={mockAsset} loading={false} onSave={onSave} onClose={vi.fn()} />);

    // Clear the label field
    fireEvent.change(screen.getByDisplayValue('Matterport'), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ label: null })
    );
  });

  it('sends updated url and label when both are changed', () => {
    const onSave = vi.fn();

    render(<EditLinkModal asset={mockAsset} loading={false} onSave={onSave} onClose={vi.fn()} />);

    fireEvent.change(screen.getByDisplayValue('https://matterport.com'), {
      target: { value: 'https://pix4d.com' },
    });

    fireEvent.change(screen.getByDisplayValue('Matterport'), {
      target: { value: 'Pix4D' },
    });

    fireEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith({
      url: 'https://pix4d.com',
      label: 'Pix4D',
    });
  });
});