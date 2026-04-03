import { useState } from 'react';
import { Check, AlertTriangle, X as XIcon, ChevronDown, ChevronUp, Edit, Package, Tag, Printer, Image } from 'lucide-react';
import { ProductFormData, DEFAULT_APPA_FREIGHT, websiteStorefrontPackComplete, isProposalOnlyProduct } from './types';

interface StepReviewProps {
  formData: ProductFormData;
  onNavigateToStep: (step: number) => void;
  onActivate: () => void;
  validationReport: ValidationReport;
}

interface ValidationItem {
  field: string;
  step: number;
  status: 'pass' | 'warning' | 'error';
  message: string;
}

export interface ValidationReport {
  items: ValidationItem[];
  canActivate: boolean;
  totalRequired: number;
  totalComplete: number;
}

export function getValidationReport(formData: ProductFormData): ValidationReport {
  const items: ValidationItem[] = [];

  // Step 1 validations
  if (formData.productName) {
    items.push({ field: 'Product Name', step: 1, status: 'pass', message: 'Provided' });
  } else {
    items.push({ field: 'Product Name', step: 1, status: 'error', message: 'Required — missing' });
  }

  if (formData.supplier) {
    items.push({ field: 'Supplier', step: 1, status: 'pass', message: 'Provided' });
  } else {
    items.push({ field: 'Supplier', step: 1, status: 'error', message: 'Required — missing' });
  }

  if (formData.supplierSku) {
    items.push({ field: 'Supplier SKU', step: 1, status: 'pass', message: 'Provided' });
  } else {
    items.push({ field: 'Supplier SKU', step: 1, status: 'error', message: 'Required — missing' });
  }

  if (formData.internalSku) {
    items.push({ field: 'Internal SKU', step: 1, status: 'pass', message: 'Provided' });
  } else {
    items.push({ field: 'Internal SKU', step: 1, status: 'error', message: 'Required — missing' });
  }

  if (formData.category) {
    items.push({ field: 'Category', step: 1, status: 'pass', message: formData.category });
  } else {
    items.push({ field: 'Category', step: 1, status: 'error', message: 'Required — missing' });
  }

  if (formData.description) {
    items.push({ field: 'Description', step: 1, status: 'pass', message: `${formData.description.length} chars` });
  } else {
    items.push({ field: 'Description', step: 1, status: 'error', message: 'Required — missing' });
  }

  // Step 2 — Decoration (was Step 3)
  if (formData.primaryDecorationMethod && formData.primaryDecoratorSupplier) {
    items.push({ field: 'Primary Decoration', step: 2, status: 'pass', message: `${formData.primaryDecorationMethod} via ${formData.primaryDecoratorSupplier}` });
  } else if (formData.primaryDecorationMethod || formData.primaryDecoratorSupplier) {
    items.push({ field: 'Primary Decoration', step: 2, status: 'warning', message: 'Method or supplier not fully selected' });
  } else {
    items.push({ field: 'Primary Decoration', step: 2, status: 'warning', message: 'No decoration selected — recommended for activation' });
  }

  if (formData.decorationMethods.length > 0) {
    const preferred = formData.decorationMethods.find(d => d.preferred);
    items.push({ field: 'Decoration Detail', step: 2, status: 'pass', message: `${formData.decorationMethods.length} method(s) — Preferred: ${preferred?.method || 'None'}` });
    const methodsWithoutDecorator = formData.decorationMethods.filter(d => !d.decorator);
    if (methodsWithoutDecorator.length > 0) {
      items.push({ field: 'Decorator Assignment', step: 2, status: 'warning', message: `${methodsWithoutDecorator.length} method(s) missing decorator` });
    }
  }

  // Step 3 — Pricing & Tiers (was Step 2)
  if (formData.variants.length > 0) {
    items.push({ field: 'Variants', step: 3, status: 'pass', message: `${formData.variants.length} variant(s)` });
  } else {
    items.push({ field: 'Variants', step: 3, status: 'error', message: 'At least one variant required' });
  }

  if (formData.pricingTiers.length > 0 && formData.pricingTiers.some(t => t.unitCost > 0)) {
    const decoratorRows = formData.pricingTiers.filter(t => t.source === 'decorator').length;
    const tierMsg = decoratorRows > 0
      ? `${formData.pricingTiers.length} tier(s) — ${decoratorRows} from rate card`
      : `${formData.pricingTiers.length} tier(s)`;
    items.push({ field: 'Pricing Tiers', step: 3, status: 'pass', message: tierMsg });
  } else {
    items.push({ field: 'Pricing Tiers', step: 3, status: 'error', message: 'At least one tier with cost required' });
  }

  if (formData.marginTarget > 0) {
    if (formData.marginTarget < formData.marginFloor) {
      items.push({ field: 'Margin Target', step: 3, status: 'warning', message: `${formData.marginTarget}% — below floor (${formData.marginFloor}%)` });
    } else {
      items.push({ field: 'Margin Target', step: 3, status: 'pass', message: `${formData.marginTarget}%` });
    }
  } else {
    items.push({ field: 'Margin Target', step: 3, status: 'error', message: 'Required — missing' });
  }

  // Step 4 validations
  const blankImages = formData.assets.filter(a => a.category === 'blank' && a.status === 'complete');
  const proposalOnly = isProposalOnlyProduct(formData);
  if (blankImages.length > 0) {
    items.push({ field: 'Blank Product Images', step: 4, status: 'pass', message: `${blankImages.length} image(s)` });
  } else if (proposalOnly) {
    items.push({ field: 'Blank Product Images', step: 4, status: 'error', message: 'Required for proposal-only products' });
  } else {
    items.push({ field: 'Blank Product Images', step: 4, status: 'warning', message: 'Recommended — no images uploaded' });
  }

  if (formData.liveOnWebsite) {
    const packOk = websiteStorefrontPackComplete(formData.assets);
    if (packOk) {
      items.push({ field: 'Website storefront images', step: 4, status: 'pass', message: 'Tile, hover, and variant images present' });
    } else {
      const need: string[] = [];
      if (!formData.assets.some(a => a.category === 'website_tile' && a.status === 'complete')) need.push('tile');
      if (!formData.assets.some(a => a.category === 'website_hover' && a.status === 'complete')) need.push('hover');
      if (!formData.assets.some(a => a.category === 'website_variant' && a.status === 'complete')) need.push('variant');
      items.push({
        field: 'Website storefront images',
        step: 4,
        status: 'error',
        message: `Live on website requires: ${need.join(', ')} image(s)`,
      });
    }
  }

  const totalRequired = items.filter(i => i.status === 'error' || i.status === 'pass').length;
  const totalComplete = items.filter(i => i.status === 'pass').length;
  const canActivate = items.filter(i => i.status === 'error').length === 0;

  return { items, canActivate, totalRequired, totalComplete };
}

export function StepReview({ formData, onNavigateToStep, onActivate, validationReport }: StepReviewProps) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true, 2: true, 3: true, 4: true,
  });

  const toggleSection = (step: number) => {
    setExpandedSections(prev => ({ ...prev, [step]: !prev[step] }));
  };

  const getStepStatus = (step: number): 'complete' | 'warning' | 'error' => {
    const stepItems = validationReport.items.filter(i => i.step === step);
    if (stepItems.some(i => i.status === 'error')) return 'error';
    if (stepItems.some(i => i.status === 'warning')) return 'warning';
    return 'complete';
  };

  const StatusIcon = ({ status }: { status: 'complete' | 'warning' | 'error' }) => {
    if (status === 'complete') return <Check size={16} style={{ color: 'var(--jolly-success)' }} />;
    if (status === 'warning') return <AlertTriangle size={16} style={{ color: 'var(--jolly-warning)' }} />;
    return <XIcon size={16} style={{ color: 'var(--jolly-destructive)' }} />;
  };

  const StatusLabel = ({ status }: { status: 'complete' | 'warning' | 'error' }) => {
    const labels = { complete: 'Complete', warning: 'Incomplete', error: 'Missing required' };
    const colors = { complete: 'var(--jolly-success)', warning: 'var(--jolly-warning)', error: 'var(--jolly-destructive)' };
    return (
      <span style={{ fontSize: '12px', fontWeight: 600, color: colors[status] }}>
        {labels[status]}
      </span>
    );
  };

  const appaFreightReview = formData.source === 'appa' ? (formData.appaFreight ?? DEFAULT_APPA_FREIGHT) : null;

  const sections = [
    {
      step: 1,
      title: 'Core Details',
      icon: <Package size={18} />,
      content: (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <DetailRow label="Product Name" value={formData.productName || '—'} />
          <DetailRow label="Supplier" value={formData.supplier || '—'} />
          <DetailRow label="Supplier SKU" value={formData.supplierSku || '—'} />
          <DetailRow label="Internal SKU" value={formData.internalSku || '—'} />
          <DetailRow label="Category" value={formData.category || '—'} />
          <DetailRow label="Subcategory" value={formData.subcategory || '—'} />
          <DetailRow label="Source" value={formData.source} />
          <DetailRow label="Non-public" value={formData.isNonPublic ? 'Yes' : 'No'} />
          <DetailRow label="Proposal-Only" value={formData.isProposalOnly ? 'Yes' : 'No'} />
          <div className="col-span-2">
            <DetailRow label="Description" value={formData.description || '—'} />
          </div>
        </div>
      ),
    },
    {
      step: 2,
      title: 'Decoration',
      icon: <Printer size={18} />,
      content: (
        <div className="space-y-3">
          <DetailRow label="Primary Decoration" value={formData.primaryDecorationMethod ? `${formData.primaryDecorationMethod} via ${formData.primaryDecoratorSupplier || '—'}` : '—'} />
          {formData.decorationMethods.map(method => (
            <div key={method.id} className="p-3 rounded border" style={{ borderColor: 'var(--jolly-border)', borderRadius: '6px' }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>{method.method}</span>
                {method.preferred && (
                  <span className="px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--jolly-primary)', color: 'white', fontSize: '11px', fontWeight: 600, borderRadius: '4px' }}>
                    Preferred
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                <DetailRow label="Decorator" value={method.decorator || '—'} small />
                <DetailRow label="Print Area" value={method.printAreaWidth && method.printAreaHeight ? `${method.printAreaWidth} × ${method.printAreaHeight} mm` : '—'} small />
                <DetailRow label="Max Colours" value={method.maxColors ? String(method.maxColors) : '—'} small />
                <DetailRow label="Setup Cost" value={method.setupCost ? `$${method.setupCost.toFixed(2)}` : '—'} small />
                <DetailRow label="Run Cost" value={method.runCost ? `$${method.runCost.toFixed(2)}/unit` : '—'} small />
              </div>
            </div>
          ))}
          {formData.decorationMethods.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--jolly-text-disabled)', fontStyle: 'italic' }}>No decoration methods added</p>
          )}
        </div>
      ),
    },
    {
      step: 3,
      title: 'Variants & Pricing',
      icon: <Tag size={18} />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <DetailRow label="Variants" value={`${formData.variants.length} variant(s)`} />
            <DetailRow label="Pricing Tiers" value={`${formData.pricingTiers.length} tier(s)`} />
            <DetailRow label="Margin Target" value={`${formData.marginTarget}%`} />
            <DetailRow label="Margin Floor" value={`${formData.marginFloor}%`} />
            {appaFreightReview ? (
              <>
                <DetailRow
                  label="Freight (APPA)"
                  value={`${appaFreightReview.lineLabel} — ${appaFreightReview.lineSubtitle}`}
                />
                <DetailRow
                  label="Shipping (per order)"
                  value={`$${appaFreightReview.perOrderAmount.toFixed(2)} × ${appaFreightReview.perOrderQuantity}`}
                />
              </>
            ) : (
              <>
                <DetailRow label="Supplier is Decorator" value={formData.supplierIsDecorator ? 'Yes' : 'No'} />
                {!formData.supplierIsDecorator && (
                  <DetailRow label="Freight — Supplier → Decorator" value={`$${formData.freightLeg1.toFixed(2)} / unit`} />
                )}
                <DetailRow
                  label={formData.supplierIsDecorator ? 'Freight — Supplier/Dec → Jolly HQ' : 'Freight — Decorator → Jolly HQ'}
                  value={`$${formData.freightLeg2.toFixed(2)} / unit`}
                />
              </>
            )}
            <DetailRow label="Rush Fee" value={`$${formData.rushFee.toFixed(2)} / unit`} />
            <DetailRow label="Min Order Qty" value={String(formData.minOrderQty)} />
            <DetailRow label="Max Order Qty" value={formData.maxOrderQty ? String(formData.maxOrderQty) : 'No limit'} />
          </div>
          {formData.pricingTiers.length > 0 && (
            <div className="border rounded overflow-hidden" style={{ borderColor: 'var(--jolly-border)' }}>
              <table className="w-full" style={{ fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--jolly-header-bg)' }}>
                    <th className="text-left py-2 px-3" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Tier</th>
                    <th className="text-left py-2 px-3" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Range</th>
                    <th className="text-right py-2 px-3" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Unit Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.pricingTiers.map((tier, i) => (
                    <tr key={tier.id} style={{ borderTop: '1px solid var(--jolly-border)' }}>
                      <td className="py-2 px-3" style={{ color: 'var(--jolly-text-disabled)' }}>T{i + 1}</td>
                      <td className="py-2 px-3" style={{ color: 'var(--jolly-text-body)' }}>{tier.minQty}–{tier.maxQty ?? '∞'}</td>
                      <td className="py-2 px-3 text-right" style={{ color: 'var(--jolly-text-body)', fontFamily: 'monospace' }}>${tier.unitCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
    {
      step: 4,
      title: 'Assets',
      icon: <Image size={18} />,
      content: (
        <div className="space-y-3">
          <DetailRow label="Live on website" value={formData.liveOnWebsite ? 'Yes' : 'No'} />
          <DetailRow label="Website — Tile" value={`${formData.assets.filter(a => a.category === 'website_tile' && a.status === 'complete').length} file(s)`} />
          <DetailRow label="Website — Hover" value={`${formData.assets.filter(a => a.category === 'website_hover' && a.status === 'complete').length} file(s)`} />
          <DetailRow label="Website — Variants" value={`${formData.assets.filter(a => a.category === 'website_variant' && a.status === 'complete').length} file(s)`} />
          <DetailRow label="Blank Product Images" value={`${formData.assets.filter(a => a.category === 'blank' && a.status === 'complete').length} file(s)`} />
          <DetailRow label="Lifestyle Images" value={`${formData.assets.filter(a => a.category === 'lifestyle' && a.status === 'complete').length} file(s)`} />
          {formData.decorationMethods.map(method => (
            <DetailRow
              key={method.id}
              label={`${method.method} Assets`}
              value={`${formData.assets.filter(a => a.category === 'decoration' && a.decorationMethodId === method.id && a.status === 'complete').length} file(s)`}
            />
          ))}
        </div>
      ),
    },
  ];

  const errorCount = validationReport.items.filter(i => i.status === 'error').length;
  const warningCount = validationReport.items.filter(i => i.status === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Validation Report */}
      <div
        className="rounded p-5"
        style={{
          backgroundColor: errorCount > 0 ? 'var(--jolly-destructive-bg)' : warningCount > 0 ? 'var(--jolly-warning-bg)' : '#E8F5E9',
          border: `1px solid ${errorCount > 0 ? 'var(--jolly-destructive)' : warningCount > 0 ? '#E6C300' : 'var(--jolly-success)'}`,
          borderRadius: '6px',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
            {errorCount > 0 ? 'Validation Errors' : warningCount > 0 ? 'Validation Warnings' : 'All Checks Passed'}
          </h3>
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: errorCount > 0 ? 'var(--jolly-destructive)' : warningCount > 0 ? 'var(--jolly-warning)' : 'var(--jolly-success)',
          }}>
            {validationReport.totalComplete} of {validationReport.totalRequired} required fields complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4 rounded-full overflow-hidden" style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <div
            style={{
              height: '100%',
              width: `${(validationReport.totalComplete / Math.max(validationReport.totalRequired, 1)) * 100}%`,
              backgroundColor: errorCount > 0 ? 'var(--jolly-destructive)' : warningCount > 0 ? 'var(--jolly-warning)' : 'var(--jolly-success)',
              transition: 'width 0.3s',
              borderRadius: '9999px',
            }}
          />
        </div>

        {/* Individual items */}
        <div className="space-y-1.5">
          {validationReport.items.filter(i => i.status !== 'pass').map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-1.5 px-3 rounded"
              style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '4px' }}
            >
              <div className="flex items-center gap-2">
                {item.status === 'error' ? <XIcon size={14} style={{ color: 'var(--jolly-destructive)' }} /> : <AlertTriangle size={14} style={{ color: 'var(--jolly-warning)' }} />}
                <span style={{ fontSize: '13px', color: 'var(--jolly-text-body)' }}>{item.field}</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '12px', color: item.status === 'error' ? 'var(--jolly-destructive)' : 'var(--jolly-warning)' }}>{item.message}</span>
                <button
                  onClick={() => onNavigateToStep(item.step)}
                  style={{ fontSize: '12px', color: 'var(--jolly-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Fix →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Sections */}
      {sections.map(section => {
        const status = getStepStatus(section.step);
        const isExpanded = expandedSections[section.step];

        return (
          <div
            key={section.step}
            className="rounded"
            style={{
              backgroundColor: 'var(--jolly-card)',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleSection(section.step)}
              style={{ borderBottom: isExpanded ? '1px solid var(--jolly-border)' : 'none' }}
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={status} />
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
                    Step {section.step}: {section.title}
                  </span>
                </div>
                <StatusLabel status={status} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigateToStep(section.step); }}
                  className="flex items-center gap-1 px-2 py-1 rounded"
                  style={{
                    border: '1px solid var(--jolly-border)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--jolly-primary)',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <Edit size={12} />
                  Edit
                </button>
                {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--jolly-text-disabled)' }} /> : <ChevronDown size={18} style={{ color: 'var(--jolly-text-disabled)' }} />}
              </div>
            </div>

            {isExpanded && (
              <div className="p-6">
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <span style={{ fontSize: small ? '11px' : '12px', color: 'var(--jolly-text-secondary)', fontWeight: 500 }}>{label}</span>
      <p style={{ fontSize: small ? '13px' : '14px', color: 'var(--jolly-text-body)', marginTop: '1px' }}>{value}</p>
    </div>
  );
}