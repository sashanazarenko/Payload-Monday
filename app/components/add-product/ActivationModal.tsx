import { X } from 'lucide-react';
import { ProductFormData } from './types';

interface ActivationModalProps {
  formData: ProductFormData;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ActivationModal({ formData, onConfirm, onCancel }: ActivationModalProps) {
  const productName = formData.productName || 'Untitled Product';
  const isNonPublic = formData.isNonPublic;
  const isProposalOnly = formData.isProposalOnly;

  let bodyText = `This product will become visible to all internal users in the catalogue and available for quoting. The website CMS feed will include it unless Non-public is enabled.`;
  if (isNonPublic) {
    bodyText = `This product will be visible to internal users only. It will not appear on the public website.`;
  }
  if (isProposalOnly) {
    bodyText = `This product will be saved as Proposal-Only. It will not appear in standard catalogue searches but can be added to proposals.`;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className="relative rounded"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '480px',
          maxWidth: '90vw',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--jolly-border)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--jolly-text-body)' }}>
            Activate {productName}?
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded hover:bg-gray-100"
          >
            <X size={20} style={{ color: 'var(--jolly-text-secondary)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p style={{ fontSize: '14px', color: 'var(--jolly-text-body)', lineHeight: '1.6' }}>
            {bodyText}
          </p>

          {/* Flags Summary */}
          <div className="mt-4 flex gap-3">
            {isNonPublic && (
              <span
                className="px-3 py-1.5 rounded"
                style={{
                  backgroundColor: 'var(--jolly-warning-bg)',
                  color: 'var(--jolly-warning)',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '4px',
                }}
              >
                Non-public
              </span>
            )}
            {isProposalOnly && (
              <span
                className="px-3 py-1.5 rounded"
                style={{
                  backgroundColor: 'var(--jolly-surface)',
                  color: 'var(--jolly-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '4px',
                }}
              >
                Proposal-Only
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--jolly-border)' }}>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded"
            style={{
              border: '1px solid var(--jolly-border)',
              color: 'var(--jolly-text-body)',
              fontSize: '14px',
              fontWeight: 600,
              height: '40px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            Go back
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded"
            style={{
              backgroundColor: 'var(--jolly-success)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              height: '40px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Confirm Activation
          </button>
        </div>
      </div>
    </div>
  );
}
