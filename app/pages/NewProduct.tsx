import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { LeftSidebar } from '../components/LeftSidebar';
import { useRole } from '../context/RoleContext';
import { ProductFormData, INITIAL_FORM_DATA, getGlobalPriceCurve } from '../components/add-product/types';
import { StepCoreDetails } from '../components/add-product/StepCoreDetails';
import { StepVariantsPricing } from '../components/add-product/StepVariantsPricing';
import { StepDecoration } from '../components/add-product/StepDecoration';
import { StepAssets } from '../components/add-product/StepAssets';
import { StepReview, getValidationReport } from '../components/add-product/StepReview';
import { ActivationModal } from '../components/add-product/ActivationModal';

const STEP_LABELS = ['Core Details', 'Decoration', 'Pricing & Tiers', 'Assets', 'Review'];

/** Stable tier ids for new wizard state (`getGlobalPriceCurve` shapes the ladder; ids match form conventions). */
function initialPricingTiersFromSettings(): ProductFormData['pricingTiers'] {
  return getGlobalPriceCurve().map((t, i) => ({ ...t, id: String(i + 1) }));
}

export function NewProduct() {
  const navigate = useNavigate();
  const { currentRole, setCurrentRole } = useRole();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>(() => ({
    ...INITIAL_FORM_DATA,
    pricingTiers: initialPricingTiersFromSettings(),
  }));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('12:34 PM');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [activated, setActivated] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Auto-save simulation
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleFormUpdate = useCallback((updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updateKeys = Object.keys(updates);
    setErrors(prev => {
      const next = { ...prev };
      updateKeys.forEach(key => delete next[key]);
      return next;
    });
    // Trigger auto-save
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }));
    }, 1200);
  }, []);

  // Validation report
  const validationReport = getValidationReport(formData);

  // Completeness
  const completedFields = validationReport.totalComplete;
  const totalFields = validationReport.totalRequired;
  const completenessPercent = Math.round((completedFields / Math.max(totalFields, 1)) * 100);
  const completenessColor = completenessPercent >= 80 ? 'var(--jolly-success)' : completenessPercent >= 50 ? 'var(--jolly-warning)' : 'var(--jolly-destructive)';

  const handleNavigateStep = (step: number) => {
    if (step < 1 || step > 5) return;
    setCurrentStep(step);
    // Focus management: scroll to top
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinue = () => {
    // Warn about empty required fields but don't block
    if (currentStep < 5) {
      handleNavigateStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      handleNavigateStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }));
    }, 800);
  };

  const handleActivate = () => {
    if (validationReport.canActivate) {
      setShowActivationModal(true);
    }
  };

  const handleConfirmActivation = () => {
    setShowActivationModal(false);
    setActivated(true);
    // Redirect after a brief moment
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  // Success state after activation
  if (activated) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', backgroundColor: 'var(--jolly-bg)' }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#E8F5E9' }}
          >
            <CheckCircle2 size={32} style={{ color: 'var(--jolly-success)' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--jolly-text-body)' }}>
            Product Activated!
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--jolly-text-secondary)', marginTop: '8px' }}>
            {formData.productName || 'Your product'} is now live in the catalogue. Redirecting…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        backgroundColor: 'var(--jolly-bg)',
      }}
    >
      <LeftSidebar currentRole={currentRole} onRoleChange={setCurrentRole} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Compact header: title row + single slim toolbar (step + draft + progress + save) */}
        <header
          className="shrink-0 border-b"
          style={{ backgroundColor: 'var(--jolly-card)', borderColor: 'var(--jolly-border)' }}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="min-w-0">
              <Link
                to="/"
                className="text-[12px] hover:underline"
                style={{ color: 'var(--jolly-text-secondary)', textDecoration: 'none' }}
              >
                ← Products
              </Link>
              <h1
                className="mt-1 truncate text-[1.125rem] font-semibold leading-tight tracking-tight"
                style={{ color: 'var(--jolly-text-body)' }}
              >
                New product
              </h1>
            </div>
            <div
              className="flex shrink-0 items-center gap-1.5 text-[12px] max-md:pr-0"
              style={{ color: 'var(--jolly-text-secondary)' }}
              aria-live="polite"
            >
              {saveStatus === 'saving' && (
                <>
                  <Loader2 size={14} className="animate-spin" style={{ color: 'var(--jolly-text-disabled)' }} />
                  <span className="hidden sm:inline" style={{ color: 'var(--jolly-text-disabled)' }}>
                    Saving…
                  </span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check size={14} style={{ color: 'var(--jolly-success)' }} />
                  <span className="hidden sm:inline" style={{ color: 'var(--jolly-success)' }}>
                    Saved {lastSavedTime}
                  </span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <XCircle size={14} style={{ color: 'var(--jolly-destructive)' }} />
                  <span className="hidden sm:inline" style={{ color: 'var(--jolly-destructive)' }}>
                    Save failed
                  </span>
                </>
              )}
            </div>
          </div>

          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t px-5 py-2"
            style={{
              borderColor: 'var(--jolly-border)',
              backgroundColor: 'color-mix(in srgb, var(--jolly-bg) 65%, var(--jolly-card))',
            }}
          >
            <nav className="flex min-w-0 flex-[1_1_260px] items-center gap-0.5" aria-label="Wizard steps">
              <button
                type="button"
                aria-label="Previous step"
                disabled={currentStep <= 1}
                onClick={() => handleNavigateStep(currentStep - 1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--jolly-primary)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  borderColor: 'var(--jolly-border)',
                  backgroundColor: 'var(--jolly-card)',
                  color: 'var(--jolly-text-body)',
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <select
                id="wizard-step-select"
                aria-label={`Step ${currentStep} of ${STEP_LABELS.length}: ${STEP_LABELS[currentStep - 1]}`}
                className="min-h-8 min-w-0 flex-1 cursor-pointer rounded-md border px-2 py-1 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--jolly-primary)] focus-visible:ring-offset-1"
                style={{
                  borderColor: 'var(--jolly-border)',
                  backgroundColor: 'var(--jolly-card)',
                  color: 'var(--jolly-text-body)',
                }}
                value={currentStep}
                onChange={(e) => handleNavigateStep(Number(e.target.value))}
              >
                {STEP_LABELS.map((label, i) => (
                  <option key={label} value={i + 1}>
                    {i + 1}. {label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label="Next step"
                disabled={currentStep >= STEP_LABELS.length}
                onClick={() => handleNavigateStep(currentStep + 1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--jolly-primary)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  borderColor: 'var(--jolly-border)',
                  backgroundColor: 'var(--jolly-card)',
                  color: 'var(--jolly-text-body)',
                }}
              >
                <ChevronRight size={18} />
              </button>
            </nav>

            <div className="ml-auto flex min-w-0 flex-[1_1_200px] items-center justify-end gap-2 sm:pl-3">
              <span
                className="hidden min-[400px]:inline text-[12px] font-medium whitespace-nowrap"
                style={{ color: completenessColor }}
              >
                {completedFields}/{totalFields} required
              </span>
              <div className="flex max-w-[160px] flex-1 items-center gap-2">
                <div
                  className="min-w-[72px] flex-1 overflow-hidden rounded-full"
                  style={{ height: '4px', backgroundColor: 'var(--jolly-border)' }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${completenessPercent}%`,
                      backgroundColor: completenessColor,
                      transition: 'width 0.3s',
                      borderRadius: '9999px',
                    }}
                  />
                </div>
                <span
                  className="w-8 shrink-0 text-right text-[11px] tabular-nums"
                  style={{ color: 'var(--jolly-text-disabled)' }}
                >
                  {completenessPercent}%
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Form Area */}
        <div className="flex-1 overflow-y-auto" ref={mainContentRef}>
          <div className="max-w-[860px] mx-auto py-8 px-6 pb-32">
            {/* Step Title */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'var(--jolly-primary)',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {currentStep}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--jolly-text-body)' }}>
                  {STEP_LABELS[currentStep - 1]}
                </h2>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--jolly-text-secondary)', marginLeft: '41px' }}>
                {currentStep === 1 && 'Establish the product identity: name, supplier, category, source type, and visibility.'}
                {currentStep === 2 && 'Select the primary decoration method and supplier. Pricing tiers will auto-populate in the next step.'}
                {currentStep === 3 && 'Define variants and the full pricing model: MOQ tiers, costs, and margin targets.'}
                {currentStep === 4 && 'Upload product images and decoration method assets (templates, dielines, spec sheets).'}
                {currentStep === 5 && 'Review all data, check validation, and activate the product or save as draft.'}
              </p>
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <StepCoreDetails
                formData={formData}
                onUpdate={handleFormUpdate}
                errors={errors}
              />
            )}
            {currentStep === 2 && (
              <StepDecoration
                formData={formData}
                onUpdate={handleFormUpdate}
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <StepVariantsPricing
                formData={formData}
                onUpdate={handleFormUpdate}
                currentRole={currentRole}
                errors={errors}
              />
            )}
            {currentStep === 4 && (
              <StepAssets
                formData={formData}
                onUpdate={handleFormUpdate}
                errors={errors}
              />
            )}
            {currentStep === 5 && (
              <StepReview
                formData={formData}
                onNavigateToStep={handleNavigateStep}
                onActivate={handleActivate}
                validationReport={validationReport}
              />
            )}
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div
          className="flex items-center justify-between px-6 py-3 border-t"
          style={{
            backgroundColor: 'var(--jolly-card)',
            borderColor: 'var(--jolly-border)',
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            minHeight: '60px',
          }}
        >
          {/* Left: Back Button */}
          <div>
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 rounded"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--jolly-text-secondary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  height: '40px',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={16} />
                Back to {STEP_LABELS[currentStep - 2]}
              </button>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--jolly-border)',
                color: 'var(--jolly-text-body)',
                fontSize: '14px',
                fontWeight: 600,
                height: '40px',
                cursor: 'pointer',
              }}
            >
              Save Draft
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleContinue}
                className="flex items-center gap-2 px-5 py-2 rounded"
                style={{
                  backgroundColor: 'var(--jolly-primary)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  height: '40px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Continue to {STEP_LABELS[currentStep]}
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleActivate}
                disabled={!validationReport.canActivate}
                className="flex items-center gap-2 px-5 py-2 rounded"
                style={{
                  backgroundColor: validationReport.canActivate ? 'var(--jolly-success)' : 'var(--jolly-bg)',
                  color: validationReport.canActivate ? 'white' : 'var(--jolly-text-disabled)',
                  fontSize: '14px',
                  fontWeight: 600,
                  height: '40px',
                  border: 'none',
                  cursor: validationReport.canActivate ? 'pointer' : 'not-allowed',
                }}
              >
                Activate Product
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Activation Modal */}
      {showActivationModal && (
        <ActivationModal
          formData={formData}
          onConfirm={handleConfirmActivation}
          onCancel={() => setShowActivationModal(false)}
        />
      )}
    </div>
  );
}