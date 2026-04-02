import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Check,
  Circle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { LeftSidebar } from '../components/LeftSidebar';
import { useRole } from '../context/RoleContext';
import { ProductFormData, INITIAL_FORM_DATA, StepInfo } from '../components/add-product/types';
import { StepCoreDetails } from '../components/add-product/StepCoreDetails';
import { StepVariantsPricing } from '../components/add-product/StepVariantsPricing';
import { StepDecoration } from '../components/add-product/StepDecoration';
import { StepAssets } from '../components/add-product/StepAssets';
import { StepReview, getValidationReport } from '../components/add-product/StepReview';
import { ActivationModal } from '../components/add-product/ActivationModal';

const STEP_LABELS = ['Core Details', 'Decoration', 'Pricing & Tiers', 'Assets', 'Review'];

export function NewProduct() {
  const navigate = useNavigate();
  const { currentRole, setCurrentRole } = useRole();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);
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

  // Step status calculation
  const getStepStatus = (step: number): StepInfo['status'] => {
    if (step === currentStep) return 'in-progress';
    const stepItems = validationReport.items.filter(i => i.step === step);
    if (stepItems.length === 0) return 'not-started';
    if (stepItems.some(i => i.status === 'error')) return 'error';
    if (stepItems.some(i => i.status === 'warning')) return 'complete-with-warning';
    if (stepItems.every(i => i.status === 'pass')) return 'complete';
    return 'in-progress';
  };

  const steps: StepInfo[] = STEP_LABELS.map((label, i) => ({
    number: i + 1,
    label,
    status: getStepStatus(i + 1),
  }));

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

  // Step status pill styles
  const getStepPillStyle = (step: StepInfo) => {
    const base = {
      fontSize: '12px',
      fontWeight: 600 as const,
      borderRadius: '16px',
      cursor: 'pointer' as const,
      border: 'none' as const,
      transition: 'all 0.15s',
    };

    switch (step.status) {
      case 'complete':
        return { ...base, backgroundColor: 'var(--jolly-success)', color: 'white' };
      case 'complete-with-warning':
        return { ...base, backgroundColor: '#F5A623', color: 'white' };
      case 'in-progress':
        return { ...base, backgroundColor: 'var(--jolly-primary)', color: 'white' };
      case 'error':
        return { ...base, backgroundColor: 'var(--jolly-destructive)', color: 'white' };
      default:
        return { ...base, backgroundColor: 'var(--jolly-bg)', color: 'var(--jolly-text-disabled)', border: '1px solid var(--jolly-border)' };
    }
  };

  const getStepIcon = (step: StepInfo) => {
    switch (step.status) {
      case 'complete':
        return <Check size={14} />;
      case 'complete-with-warning':
        return <AlertTriangle size={14} />;
      case 'error':
        return <XCircle size={14} />;
      case 'in-progress':
        return <Circle size={14} fill="white" />;
      default:
        return <Circle size={14} />;
    }
  };

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
        {/* Top Bar with Breadcrumb & Step Progress */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{
            backgroundColor: 'var(--jolly-card)',
            borderColor: 'var(--jolly-border)',
            minHeight: '72px',
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/"
                className="hover:underline"
                style={{ color: 'var(--jolly-text-secondary)', fontSize: '13px', textDecoration: 'none' }}
              >
                Products
              </Link>
              <span style={{ color: 'var(--jolly-text-disabled)', fontSize: '13px' }}>/</span>
              <span style={{ color: 'var(--jolly-text-body)', fontSize: '13px' }}>New Product</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--jolly-text-body)' }}>
              Add New Product
            </h1>
          </div>

          {/* Step Progress Indicator */}
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => handleNavigateStep(step.number)}
                  className="flex items-center gap-2 px-3 py-1.5"
                  style={getStepPillStyle(step)}
                  aria-current={step.status === 'in-progress' ? 'step' : undefined}
                  aria-label={`Step ${step.number}: ${step.label} — ${step.status}`}
                >
                  {getStepIcon(step)}
                  <span className="hidden lg:inline">{step.label}</span>
                  <span className="lg:hidden">{step.number}</span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className="mx-1"
                    style={{
                      width: '20px',
                      height: '2px',
                      backgroundColor: step.status === 'complete' || step.status === 'complete-with-warning' ? 'var(--jolly-success)' : 'var(--jolly-border)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Persistent Status Bar */}
        <div
          className="flex items-center justify-between px-6 border-b"
          style={{
            backgroundColor: '#F9FAFB',
            borderColor: 'var(--jolly-border)',
            height: '40px',
            flexShrink: 0,
          }}
        >
          {/* Left: Product Name */}
          <div style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)' }}>
            {formData.productName ? (
              <span>Editing: <strong style={{ color: 'var(--jolly-text-body)' }}>{formData.productName.length > 40 ? formData.productName.slice(0, 40) + '…' : formData.productName}</strong></span>
            ) : (
              <span style={{ fontStyle: 'italic' }}>New product (unsaved)</span>
            )}
          </div>

          {/* Centre: Completeness */}
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '13px', color: completenessColor, fontWeight: 500 }}>
              {completedFields} of {totalFields} required fields complete
            </span>
            <div className="flex items-center gap-2" style={{ width: '120px' }}>
              <div
                className="flex-1 rounded-full overflow-hidden"
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
              <span style={{ fontSize: '11px', color: 'var(--jolly-text-disabled)', whiteSpace: 'nowrap' }}>
                {completenessPercent}%
              </span>
            </div>
          </div>

          {/* Right: Save Status */}
          <div className="flex items-center gap-2" style={{ fontSize: '13px' }}>
            {saveStatus === 'saving' && (
              <>
                <Loader2 size={14} className="animate-spin" style={{ color: 'var(--jolly-text-disabled)' }} />
                <span style={{ color: 'var(--jolly-text-disabled)' }}>Saving…</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check size={14} style={{ color: 'var(--jolly-success)' }} />
                <span style={{ color: 'var(--jolly-success)' }}>Draft saved {lastSavedTime}</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <XCircle size={14} style={{ color: 'var(--jolly-destructive)' }} />
                <span style={{ color: 'var(--jolly-destructive)' }}>Save failed</span>
              </>
            )}
          </div>
        </div>

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