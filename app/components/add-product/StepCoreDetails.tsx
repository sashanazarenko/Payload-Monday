import { useState } from 'react';
import { Info, Sparkles, Loader2 } from 'lucide-react';
import { ProductFormData, SUPPLIERS, CATEGORIES, SUBCATEGORIES } from './types';

interface StepCoreDetailsProps {
  formData: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
}

export function StepCoreDetails({ formData, onUpdate, errors }: StepCoreDetailsProps) {
  const [appaLoading, setAppaLoading] = useState(false);
  const [appaFilled, setAppaFilled] = useState(false);

  const handleAppaLookup = () => {
    if (!formData.supplier || !formData.supplierSku) return;
    setAppaLoading(true);
    // Simulate APPA pre-fill
    setTimeout(() => {
      onUpdate({
        productName: 'Metro Canvas Tote Bag',
        category: 'Bags & Totes',
        subcategory: 'Tote Bags',
        description: 'Premium 12oz canvas tote bag with reinforced handles and internal pocket. Available in Natural and Black. OEKO-TEX certified cotton.',
        internalSku: 'AS-CT001',
      });
      setAppaLoading(false);
      setAppaFilled(true);
    }, 1800);
  };

  const subcategories = formData.category ? SUBCATEGORIES[formData.category] || [] : [];

  const inputStyle = (fieldName: string) => ({
    border: `1px solid ${errors[fieldName] ? 'var(--jolly-destructive)' : 'var(--jolly-border)'}`,
    fontSize: '14px',
    height: '36px',
    borderRadius: '6px',
    backgroundColor: 'white',
  });

  const AppaChip = () => (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
      style={{
        backgroundColor: 'var(--jolly-surface)',
        color: 'var(--jolly-primary)',
        fontSize: '11px',
        fontWeight: 600,
      }}
    >
      <Sparkles size={10} />
      APPA
    </span>
  );

  return (
    <div className="space-y-6">
      {/* APPA Lookup Banner */}
      <div
        className="flex items-center justify-between p-4 rounded"
        style={{
          backgroundColor: 'var(--jolly-surface)',
          borderRadius: '6px',
          border: '1px solid var(--jolly-accent)',
        }}
      >
        <div className="flex items-start gap-3">
          <Sparkles size={20} style={{ color: 'var(--jolly-primary)', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
              APPA Auto-Fill Available
            </p>
            <p style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)', marginTop: '2px' }}>
              Select a supplier and enter a supplier SKU, then click &quot;Lookup&quot; to auto-fill product details from APPA.
            </p>
          </div>
        </div>
        <button
          onClick={handleAppaLookup}
          disabled={!formData.supplier || !formData.supplierSku || appaLoading}
          className="flex items-center gap-2 px-4 py-2 rounded whitespace-nowrap"
          style={{
            backgroundColor: formData.supplier && formData.supplierSku && !appaLoading ? 'var(--jolly-primary)' : 'var(--jolly-bg)',
            color: formData.supplier && formData.supplierSku && !appaLoading ? 'white' : 'var(--jolly-text-disabled)',
            fontSize: '14px',
            fontWeight: 600,
            height: '36px',
            border: 'none',
            cursor: formData.supplier && formData.supplierSku && !appaLoading ? 'pointer' : 'not-allowed',
          }}
        >
          {appaLoading ? <Loader2 size={16} className="animate-spin" /> : null}
          {appaLoading ? 'Looking up…' : 'Lookup'}
        </button>
      </div>

      {appaFilled && (
        <div
          className="flex items-center gap-2 p-3 rounded"
          style={{
            backgroundColor: '#E8F5E9',
            borderRadius: '6px',
            fontSize: '14px',
            color: 'var(--jolly-success)',
          }}
        >
          <Info size={16} />
          APPA pre-fill complete. Fields marked with the APPA chip were auto-populated. Review and adjust as needed.
        </div>
      )}

      {/* Product Identity Section */}
      <div
        className="rounded"
        style={{
          backgroundColor: 'var(--jolly-card)',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--jolly-border)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
            Product Identity
          </h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Product Name */}
          <div>
            <label className="flex items-center gap-2 mb-2" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
              Product Name <span style={{ color: 'var(--jolly-destructive)' }}>*</span>
              {appaFilled && <AppaChip />}
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => onUpdate({ productName: e.target.value })}
              placeholder="e.g. Metro Canvas Tote Bag"
              className="w-full px-4 py-2"
              style={inputStyle('productName')}
            />
            {errors.productName && (
              <p style={{ fontSize: '12px', color: 'var(--jolly-destructive)', marginTop: '4px' }}>{errors.productName}</p>
            )}
          </div>

          {/* Supplier & SKU Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
                Supplier <span style={{ color: 'var(--jolly-destructive)' }}>*</span>
              </label>
              <select
                value={formData.supplier}
                onChange={(e) => onUpdate({ supplier: e.target.value })}
                className="w-full px-4 py-2"
                style={inputStyle('supplier')}
              >
                <option value="">Select supplier</option>
                {SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.supplier && (
                <p style={{ fontSize: '12px', color: 'var(--jolly-destructive)', marginTop: '4px' }}>{errors.supplier}</p>
              )}
            </div>
            <div>
              <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
                Supplier SKU <span style={{ color: 'var(--jolly-destructive)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.supplierSku}
                onChange={(e) => onUpdate({ supplierSku: e.target.value })}
                placeholder="e.g. AS-1001"
                className="w-full px-4 py-2"
                style={inputStyle('supplierSku')}
              />
              {errors.supplierSku && (
                <p style={{ fontSize: '12px', color: 'var(--jolly-destructive)', marginTop: '4px' }}>{errors.supplierSku}</p>
              )}
            </div>
          </div>

          {/* Internal SKU */}
          <div>
            <label className="flex items-center gap-2 mb-2" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
              Internal SKU <span style={{ color: 'var(--jolly-destructive)' }}>*</span>
              {appaFilled && <AppaChip />}
            </label>
            <input
              type="text"
              value={formData.internalSku}
              onChange={(e) => onUpdate({ internalSku: e.target.value })}
              placeholder="Auto-generated or enter manually"
              className="w-full px-4 py-2"
              style={inputStyle('internalSku')}
            />
            {errors.internalSku && (
              <p style={{ fontSize: '12px', color: 'var(--jolly-destructive)', marginTop: '4px' }}>{errors.internalSku}</p>
            )}
          </div>
        </div>
      </div>

      {/* Classification Section */}
      <div
        className="rounded"
        style={{
          backgroundColor: 'var(--jolly-card)',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--jolly-border)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
            Classification
          </h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 mb-2" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
                Category <span style={{ color: 'var(--jolly-destructive)' }}>*</span>
                {appaFilled && <AppaChip />}
              </label>
              <select
                value={formData.category}
                onChange={(e) => onUpdate({ category: e.target.value, subcategory: '' })}
                className="w-full px-4 py-2"
                style={inputStyle('category')}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && (
                <p style={{ fontSize: '12px', color: 'var(--jolly-destructive)', marginTop: '4px' }}>{errors.category}</p>
              )}
            </div>
            <div>
              <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
                Subcategory
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => onUpdate({ subcategory: e.target.value })}
                disabled={!formData.category}
                className="w-full px-4 py-2"
                style={{
                  ...inputStyle('subcategory'),
                  backgroundColor: !formData.category ? 'var(--jolly-bg)' : 'white',
                  cursor: !formData.category ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="">Select subcategory</option>
                {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Product Type */}
          <div>
            <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
              Product Type <span style={{ color: 'var(--jolly-destructive)' }}>*</span>
            </label>
            <div className="flex gap-3">
              {[
                { value: 'standard', label: 'Standard', desc: 'Uses standard decoration workflow' },
                { value: 'bespoke', label: 'Bespoke', desc: 'Custom add-ons, manual pricing logic' },
                { value: 'appa', label: 'APPA', desc: 'APPA-linked standard product' },
                { value: 'proposal-only', label: 'Proposal Only', desc: 'Minimum viable data, non-storefront' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    const updates: Partial<ProductFormData> = { source: option.value as ProductFormData['source'] };
                    updates.isProposalOnly = option.value === 'proposal-only';
                    onUpdate(updates);
                  }}
                  className="flex-1 p-3 rounded text-left"
                  style={{
                    border: `2px solid ${formData.source === option.value ? 'var(--jolly-primary)' : 'var(--jolly-border)'}`,
                    backgroundColor: formData.source === option.value ? 'var(--jolly-surface)' : 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>{option.label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--jolly-text-secondary)', marginTop: '2px' }}>{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Proposal-only info banner */}
          {formData.source === 'proposal-only' && (
            <div
              className="flex items-start gap-2 p-3 rounded"
              style={{
                backgroundColor: 'var(--jolly-warning-bg)',
                borderRadius: '6px',
                fontSize: '14px',
                color: 'var(--jolly-warning)',
              }}
            >
              <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Proposal-only products are excluded from storefront publishing and catalogue browsing.</span>
            </div>
          )}
        </div>
      </div>

      {/* Visibility & Description */}
      <div
        className="rounded"
        style={{
          backgroundColor: 'var(--jolly-card)',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--jolly-border)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
            Visibility & Description
          </h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => onUpdate({ isNonPublic: !formData.isNonPublic })}
                className="relative inline-flex items-center rounded-full cursor-pointer transition-colors"
                style={{
                  width: '44px',
                  height: '24px',
                  backgroundColor: formData.isNonPublic ? 'var(--jolly-primary)' : 'var(--jolly-border)',
                }}
              >
                <div
                  className="absolute rounded-full bg-white transition-transform"
                  style={{
                    width: '20px',
                    height: '20px',
                    transform: formData.isNonPublic ? 'translateX(22px)' : 'translateX(2px)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>Non-public</span>
                <p style={{ fontSize: '12px', color: 'var(--jolly-text-secondary)' }}>Hide from public website CMS feed</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => {
                  if (formData.source !== 'proposal-only') {
                    onUpdate({ isProposalOnly: !formData.isProposalOnly });
                  }
                }}
                className="relative inline-flex items-center rounded-full transition-colors"
                style={{
                  width: '44px',
                  height: '24px',
                  backgroundColor: formData.isProposalOnly ? 'var(--jolly-primary)' : 'var(--jolly-border)',
                  cursor: formData.source === 'proposal-only' ? 'not-allowed' : 'pointer',
                  opacity: formData.source === 'proposal-only' ? 0.6 : 1,
                }}
              >
                <div
                  className="absolute rounded-full bg-white transition-transform"
                  style={{
                    width: '20px',
                    height: '20px',
                    transform: formData.isProposalOnly ? 'translateX(22px)' : 'translateX(2px)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>Proposal-Only</span>
                <p style={{ fontSize: '12px', color: 'var(--jolly-text-secondary)' }}>
                  {formData.source === 'proposal-only' ? 'Locked ON for Proposal-only products' : 'Only available for specific proposals'}
                </p>
              </div>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 mb-2" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
              Product Description <span style={{ color: 'var(--jolly-destructive)' }}>*</span>
              {appaFilled && <AppaChip />}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Enter a product description visible to sales reps and on the public website (if enabled)"
              rows={4}
              className="w-full px-4 py-3"
              style={{
                border: `1px solid ${errors.description ? 'var(--jolly-destructive)' : 'var(--jolly-border)'}`,
                fontSize: '14px',
                borderRadius: '6px',
                resize: 'vertical',
              }}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p style={{ fontSize: '12px', color: 'var(--jolly-destructive)' }}>{errors.description}</p>
              ) : (
                <span />
              )}
              <span style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)' }}>
                {formData.description.length}/500
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}