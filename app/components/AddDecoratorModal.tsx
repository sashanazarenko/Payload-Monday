import { useState, useCallback } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  User,
  Palette,
  Settings,
  AlertCircle,
  Star,
  Printer,
  Layers,
  Stamp,
  Zap,
  MapPin,
  Phone,
  Mail,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
} from 'lucide-react';

// --- Types (same as DecoratorMatrix) ---

type DecorationMethod =
  | 'Screen Print'
  | 'Embroidery'
  | 'DTG'
  | 'Laser Engrave'
  | 'Pad Print'
  | 'Sublimation'
  | 'Deboss'
  | 'UV Print'
  | 'Heat Transfer';

type PriceLevel = 'Budget' | 'Standard' | 'Premium';

interface FormData {
  // Step 1
  name: string;
  code: string;
  location: string;
  state: string;
  website: string;
  priceLevel: PriceLevel;
  // Step 2
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  // Step 3
  methods: DecorationMethod[];
  preferredFor: DecorationMethod[];
  productCategories: string[];
  // Step 4
  minOrder: string;
  avgLeadDays: string;
  rushAvailable: boolean;
  rushLeadDays: string;
  notes: string;
}

interface StepErrors {
  [key: string]: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  code: '',
  location: '',
  state: '',
  website: '',
  priceLevel: 'Standard',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  methods: [],
  preferredFor: [],
  productCategories: [],
  minOrder: '',
  avgLeadDays: '',
  rushAvailable: false,
  rushLeadDays: '',
  notes: '',
};

const ALL_METHODS: DecorationMethod[] = [
  'Screen Print',
  'Embroidery',
  'DTG',
  'Laser Engrave',
  'Pad Print',
  'Sublimation',
  'Deboss',
  'UV Print',
  'Heat Transfer',
];

const ALL_CATEGORIES = [
  'Apparel',
  'Bags',
  'Headwear',
  'Drinkware',
  'Tech',
  'Pens',
  'Towels',
  'Leather Goods',
  'Awards',
  'Notebooks',
  'Mousepads',
  'Promotional',
];

const AU_STATES = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

const STEPS = [
  { key: 'details', label: 'Supplier Details', icon: Building2 },
  { key: 'contact', label: 'Contact', icon: User },
  { key: 'capabilities', label: 'Capabilities', icon: Palette },
  { key: 'operations', label: 'Operations', icon: Settings },
];

const methodIcons: Record<string, React.ReactNode> = {
  'Screen Print': <Printer size={14} />,
  Embroidery: <Layers size={14} />,
  DTG: <Palette size={14} />,
  'Laser Engrave': <Zap size={14} />,
  'Pad Print': <Stamp size={14} />,
  Sublimation: <Palette size={14} />,
  Deboss: <Stamp size={14} />,
  'UV Print': <Zap size={14} />,
  'Heat Transfer': <Printer size={14} />,
};

const priceLevelConfig: Record<string, { bg: string; text: string; desc: string }> = {
  Budget: { bg: '#E8F5E9', text: '#217346', desc: 'Lowest cost, basic quality' },
  Standard: { bg: '#EBF3FB', text: '#1F5C9E', desc: 'Balanced cost & quality' },
  Premium: { bg: '#FFF8E1', text: '#7B5800', desc: 'Highest quality, premium pricing' },
};

// --- Shared sub-components ---

function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--jolly-text-body)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--jolly-destructive)' }}>*</span>}
      </label>
      {children}
      {error && (
        <p
          className="flex items-center gap-1"
          style={{ fontSize: '12px', color: 'var(--jolly-destructive)', fontWeight: 500 }}
        >
          <AlertCircle size={12} /> {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)' }}>{hint}</p>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  prefix,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: boolean;
  type?: string;
  prefix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {prefix && (
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center"
          style={{ color: 'var(--jolly-text-disabled)' }}
        >
          {prefix}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: '36px',
          border: `1px solid ${error ? 'var(--jolly-destructive)' : 'var(--jolly-border)'}`,
          borderRadius: '6px',
          paddingLeft: prefix ? '36px' : '12px',
          paddingRight: '12px',
          fontSize: '14px',
          color: 'var(--jolly-text-body)',
          outline: 'none',
          backgroundColor: 'white',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--jolly-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(31,92,158,0.15)';
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'var(--jolly-destructive)'
            : 'var(--jolly-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        height: '36px',
        border: `1px solid ${error ? 'var(--jolly-destructive)' : 'var(--jolly-border)'}`,
        borderRadius: '6px',
        padding: '0 12px',
        fontSize: '14px',
        color: value ? 'var(--jolly-text-body)' : 'var(--jolly-text-disabled)',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ======================
// STEP COMPONENTS
// ======================

function Step1SupplierDetails({
  form,
  setForm,
  errors,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  errors: StepErrors;
}) {
  return (
    <div className="space-y-5">
      {/* Callout */}
      <div
        className="flex items-start gap-3 p-4 rounded"
        style={{
          backgroundColor: 'var(--jolly-surface)',
          border: '1px solid var(--jolly-accent)',
          borderRadius: '6px',
        }}
      >
        <Info size={16} style={{ color: 'var(--jolly-primary)', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13px', color: 'var(--jolly-primary)', fontWeight: 500 }}>
          Enter the core details for this decoration supplier. The code will be used as a short
          identifier across the system.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <FormField label="Business Name" required error={errors.name}>
          <TextInput
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g. Print Co Melbourne"
            error={!!errors.name}
          />
        </FormField>

        <FormField
          label="Supplier Code"
          required
          error={errors.code}
          hint="3-letter uppercase code"
        >
          <TextInput
            value={form.code}
            onChange={(v) => setForm({ ...form, code: v.toUpperCase().slice(0, 4) })}
            placeholder="e.g. PCM"
            error={!!errors.code}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <FormField label="City / Location" required error={errors.location}>
          <TextInput
            value={form.location}
            onChange={(v) => setForm({ ...form, location: v })}
            placeholder="e.g. Melbourne"
            error={!!errors.location}
            prefix={<MapPin size={14} />}
          />
        </FormField>

        <FormField label="State" required error={errors.state}>
          <SelectInput
            value={form.state}
            onChange={(v) => setForm({ ...form, state: v })}
            placeholder="Select state…"
            options={AU_STATES.map((s) => ({ value: s, label: s }))}
            error={!!errors.state}
          />
        </FormField>
      </div>

      <FormField label="Website" hint="Optional">
        <TextInput
          value={form.website}
          onChange={(v) => setForm({ ...form, website: v })}
          placeholder="e.g. printcomelb.com.au"
          prefix={<Globe size={14} />}
        />
      </FormField>

      {/* Price Level */}
      <FormField label="Price Level" required>
        <div className="grid grid-cols-3 gap-3">
          {(['Budget', 'Standard', 'Premium'] as PriceLevel[]).map((level) => {
            const cfg = priceLevelConfig[level];
            const selected = form.priceLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setForm({ ...form, priceLevel: level })}
                className="flex flex-col items-start p-3 rounded transition-all"
                style={{
                  border: `2px solid ${selected ? cfg.text : 'var(--jolly-border)'}`,
                  borderRadius: '6px',
                  backgroundColor: selected ? cfg.bg : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: selected ? cfg.text : 'var(--jolly-text-body)',
                    }}
                  >
                    {level}
                  </span>
                  {selected && (
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: cfg.text,
                      }}
                    >
                      <Check size={11} stroke="white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--jolly-text-secondary)' }}>
                  {cfg.desc}
                </span>
              </button>
            );
          })}
        </div>
      </FormField>
    </div>
  );
}

function Step2Contact({
  form,
  setForm,
  errors,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  errors: StepErrors;
}) {
  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 p-4 rounded"
        style={{
          backgroundColor: 'var(--jolly-surface)',
          border: '1px solid var(--jolly-accent)',
          borderRadius: '6px',
        }}
      >
        <Info size={16} style={{ color: 'var(--jolly-primary)', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13px', color: 'var(--jolly-primary)', fontWeight: 500 }}>
          Provide the primary contact person for this decorator. This information will be used for
          order coordination and enquiries.
        </p>
      </div>

      {/* Contact avatar preview */}
      <div
        className="flex items-center gap-4 p-4 rounded"
        style={{
          border: '1px solid var(--jolly-border)',
          borderRadius: '6px',
          backgroundColor: 'var(--jolly-bg)',
        }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--jolly-surface)',
          }}
        >
          <span
            style={{ fontSize: '16px', fontWeight: 700, color: 'var(--jolly-primary)' }}
          >
            {form.contactName
              ? form.contactName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : '??'}
          </span>
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
            {form.contactName || 'Contact Name'}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)' }}>
            Primary Contact · {form.name || 'Supplier Name'}
          </p>
        </div>
      </div>

      <FormField label="Contact Name" required error={errors.contactName}>
        <TextInput
          value={form.contactName}
          onChange={(v) => setForm({ ...form, contactName: v })}
          placeholder="e.g. Mark Thompson"
          error={!!errors.contactName}
          prefix={<User size={14} />}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-5">
        <FormField label="Email Address" required error={errors.contactEmail}>
          <TextInput
            value={form.contactEmail}
            onChange={(v) => setForm({ ...form, contactEmail: v })}
            placeholder="e.g. mark@printco.com.au"
            error={!!errors.contactEmail}
            type="email"
            prefix={<Mail size={14} />}
          />
        </FormField>

        <FormField label="Phone Number" required error={errors.contactPhone}>
          <TextInput
            value={form.contactPhone}
            onChange={(v) => setForm({ ...form, contactPhone: v })}
            placeholder="e.g. +61 3 9123 4567"
            error={!!errors.contactPhone}
            prefix={<Phone size={14} />}
          />
        </FormField>
      </div>
    </div>
  );
}

function Step3Capabilities({
  form,
  setForm,
  errors,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  errors: StepErrors;
}) {
  const toggleMethod = (m: DecorationMethod) => {
    const has = form.methods.includes(m);
    const newMethods = has ? form.methods.filter((x) => x !== m) : [...form.methods, m];
    // Also remove from preferred if removed from methods
    const newPreferred = has
      ? form.preferredFor.filter((x) => x !== m)
      : form.preferredFor;
    setForm({ ...form, methods: newMethods, preferredFor: newPreferred });
  };

  const togglePreferred = (m: DecorationMethod) => {
    const has = form.preferredFor.includes(m);
    setForm({
      ...form,
      preferredFor: has ? form.preferredFor.filter((x) => x !== m) : [...form.preferredFor, m],
    });
  };

  const toggleCategory = (c: string) => {
    const has = form.productCategories.includes(c);
    setForm({
      ...form,
      productCategories: has
        ? form.productCategories.filter((x) => x !== c)
        : [...form.productCategories, c],
    });
  };

  return (
    <div className="space-y-6">
      {/* Decoration Methods */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--jolly-text-body)',
            }}
          >
            Decoration Methods <span style={{ color: 'var(--jolly-destructive)' }}>*</span>
          </label>
          <span style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)' }}>
            {form.methods.length} selected
          </span>
        </div>
        {errors.methods && (
          <p
            className="flex items-center gap-1 mb-2"
            style={{ fontSize: '12px', color: 'var(--jolly-destructive)', fontWeight: 500 }}
          >
            <AlertCircle size={12} /> {errors.methods}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          {ALL_METHODS.map((m) => {
            const selected = form.methods.includes(m);
            const isPreferred = form.preferredFor.includes(m);
            return (
              <div
                key={m}
                className="relative rounded transition-all"
                style={{
                  border: `2px solid ${selected ? 'var(--jolly-primary)' : 'var(--jolly-border)'}`,
                  borderRadius: '6px',
                  backgroundColor: selected ? 'var(--jolly-surface)' : 'white',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleMethod(m)}
                  className="w-full flex items-center gap-2 px-3 py-2.5"
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: selected
                        ? 'none'
                        : '2px solid var(--jolly-border)',
                      backgroundColor: selected ? 'var(--jolly-primary)' : 'white',
                    }}
                  >
                    {selected && <Check size={12} stroke="white" strokeWidth={3} />}
                  </div>
                  <span
                    style={{
                      color: 'var(--jolly-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {methodIcons[m]}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: selected ? 600 : 400,
                      color: selected ? 'var(--jolly-primary)' : 'var(--jolly-text-body)',
                    }}
                  >
                    {m}
                  </span>
                </button>
                {/* Star to mark as preferred */}
                {selected && (
                  <button
                    type="button"
                    onClick={() => togglePreferred(m)}
                    title={isPreferred ? 'Remove preferred' : 'Mark as preferred'}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    <Star
                      size={14}
                      fill={isPreferred ? '#F59E0B' : 'none'}
                      stroke={isPreferred ? '#F59E0B' : 'var(--jolly-text-disabled)'}
                      strokeWidth={2}
                    />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p
          className="flex items-center gap-1 mt-2"
          style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)' }}
        >
          <Star size={10} fill="#F59E0B" stroke="#F59E0B" /> Click the star icon to mark a method
          as preferred for this supplier.
        </p>
      </div>

      {/* Product Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--jolly-text-body)',
            }}
          >
            Product Categories <span style={{ color: 'var(--jolly-destructive)' }}>*</span>
          </label>
          <span style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)' }}>
            {form.productCategories.length} selected
          </span>
        </div>
        {errors.productCategories && (
          <p
            className="flex items-center gap-1 mb-2"
            style={{ fontSize: '12px', color: 'var(--jolly-destructive)', fontWeight: 500 }}
          >
            <AlertCircle size={12} /> {errors.productCategories}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((c) => {
            const selected = form.productCategories.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCategory(c)}
                className="px-3 py-1.5 rounded transition-all"
                style={{
                  border: `1.5px solid ${selected ? 'var(--jolly-primary)' : 'var(--jolly-border)'}`,
                  borderRadius: '20px',
                  backgroundColor: selected ? 'var(--jolly-surface)' : 'white',
                  fontSize: '13px',
                  fontWeight: selected ? 600 : 400,
                  color: selected ? 'var(--jolly-primary)' : 'var(--jolly-text-body)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {selected && <Check size={12} strokeWidth={3} />}
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step4Operations({
  form,
  setForm,
  errors,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  errors: StepErrors;
}) {
  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 p-4 rounded"
        style={{
          backgroundColor: 'var(--jolly-surface)',
          border: '1px solid var(--jolly-accent)',
          borderRadius: '6px',
        }}
      >
        <Info size={16} style={{ color: 'var(--jolly-primary)', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13px', color: 'var(--jolly-primary)', fontWeight: 500 }}>
          Configure operational constraints. These values affect order routing and lead time
          estimates across proposals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <FormField
          label="Minimum Order Quantity"
          required
          error={errors.minOrder}
          hint="Minimum units per order"
        >
          <TextInput
            value={form.minOrder}
            onChange={(v) => setForm({ ...form, minOrder: v.replace(/\D/g, '') })}
            placeholder="e.g. 50"
            error={!!errors.minOrder}
          />
        </FormField>

        <FormField
          label="Average Lead Time (days)"
          required
          error={errors.avgLeadDays}
          hint="Standard turnaround in business days"
        >
          <TextInput
            value={form.avgLeadDays}
            onChange={(v) => setForm({ ...form, avgLeadDays: v.replace(/\D/g, '') })}
            placeholder="e.g. 10"
            error={!!errors.avgLeadDays}
          />
        </FormField>
      </div>

      {/* Rush toggle */}
      <div
        className="p-4 rounded"
        style={{
          border: '1px solid var(--jolly-border)',
          borderRadius: '6px',
          backgroundColor: form.rushAvailable ? '#F0FFF4' : 'white',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap
              size={18}
              style={{
                color: form.rushAvailable ? 'var(--jolly-success)' : 'var(--jolly-text-disabled)',
              }}
            />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
                Rush Orders Available
              </p>
              <p style={{ fontSize: '12px', color: 'var(--jolly-text-secondary)' }}>
                Can this supplier handle expedited turnaround?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm({ ...form, rushAvailable: !form.rushAvailable, rushLeadDays: '' })
            }
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: form.rushAvailable
                ? 'var(--jolly-success)'
                : 'var(--jolly-border)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: '3px',
                left: form.rushAvailable ? '23px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>
        {form.rushAvailable && (
          <div className="mt-4 pl-9">
            <FormField
              label="Rush Lead Time (days)"
              required
              error={errors.rushLeadDays}
              hint="Expedited turnaround in business days"
            >
              <TextInput
                value={form.rushLeadDays}
                onChange={(v) => setForm({ ...form, rushLeadDays: v.replace(/\D/g, '') })}
                placeholder="e.g. 3"
                error={!!errors.rushLeadDays}
              />
            </FormField>
          </div>
        )}
      </div>

      {/* Notes */}
      <FormField label="Internal Notes" hint="Optional. Visible only to admins.">
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any special instructions, caveats, or quality notes…"
          rows={4}
          style={{
            width: '100%',
            border: '1px solid var(--jolly-border)',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '14px',
            color: 'var(--jolly-text-body)',
            outline: 'none',
            backgroundColor: 'white',
            resize: 'vertical',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--jolly-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(31,92,158,0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--jolly-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </FormField>
    </div>
  );
}

// --- Review Step ---

function ReviewStep({ form }: { form: FormData }) {
  const cfg = priceLevelConfig[form.priceLevel];
  return (
    <div className="space-y-5">
      {/* Success banner */}
      <div
        className="flex items-start gap-3 p-4 rounded"
        style={{
          backgroundColor: '#E8F5E9',
          border: '1px solid #A5D6A7',
          borderRadius: '6px',
        }}
      >
        <CheckCircle2
          size={16}
          style={{ color: 'var(--jolly-success)', flexShrink: 0, marginTop: '1px' }}
        />
        <p style={{ fontSize: '13px', color: 'var(--jolly-success)', fontWeight: 500 }}>
          All required fields are complete. Review the details below and click "Create Decorator" to
          add this supplier to the matrix.
        </p>
      </div>

      {/* Details Summary */}
      <div
        className="rounded overflow-hidden"
        style={{
          border: '1px solid var(--jolly-border)',
          borderRadius: '6px',
        }}
      >
        {/* Section: Supplier */}
        <div
          className="px-5 py-3"
          style={{ backgroundColor: 'var(--jolly-header-bg)', borderBottom: '1px solid var(--jolly-border)' }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--jolly-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Supplier Details
          </p>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
            <ReviewRow label="Business Name" value={form.name} />
            <ReviewRow label="Code" value={form.code} />
            <ReviewRow label="Location" value={`${form.location}, ${form.state}`} />
            <ReviewRow label="Price Level" value={form.priceLevel} badge={cfg} />
            {form.website && <ReviewRow label="Website" value={form.website} />}
          </div>
        </div>

        {/* Section: Contact */}
        <div
          className="px-5 py-3"
          style={{ backgroundColor: 'var(--jolly-header-bg)', borderTop: '1px solid var(--jolly-border)', borderBottom: '1px solid var(--jolly-border)' }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--jolly-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Contact
          </p>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
            <ReviewRow label="Name" value={form.contactName} />
            <ReviewRow label="Email" value={form.contactEmail} />
            <ReviewRow label="Phone" value={form.contactPhone} />
          </div>
        </div>

        {/* Section: Capabilities */}
        <div
          className="px-5 py-3"
          style={{ backgroundColor: 'var(--jolly-header-bg)', borderTop: '1px solid var(--jolly-border)', borderBottom: '1px solid var(--jolly-border)' }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--jolly-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Capabilities
          </p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)', marginBottom: '6px' }}>
              Methods
            </p>
            <div className="flex flex-wrap gap-1.5">
              {form.methods.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 px-2 py-0.5"
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: form.preferredFor.includes(m)
                      ? 'var(--jolly-primary)'
                      : 'var(--jolly-surface)',
                    color: form.preferredFor.includes(m) ? 'white' : 'var(--jolly-primary)',
                    borderRadius: '4px',
                    border: form.preferredFor.includes(m)
                      ? 'none'
                      : '1px solid var(--jolly-accent)',
                  }}
                >
                  {m}
                  {form.preferredFor.includes(m) && (
                    <Star size={9} fill="white" stroke="white" />
                  )}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)', marginBottom: '6px' }}>
              Categories
            </p>
            <p style={{ fontSize: '13px', color: 'var(--jolly-text-body)' }}>
              {form.productCategories.join(', ')}
            </p>
          </div>
        </div>

        {/* Section: Operations */}
        <div
          className="px-5 py-3"
          style={{ backgroundColor: 'var(--jolly-header-bg)', borderTop: '1px solid var(--jolly-border)', borderBottom: '1px solid var(--jolly-border)' }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--jolly-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Operations
          </p>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
            <ReviewRow label="Min Order" value={`${form.minOrder} units`} />
            <ReviewRow label="Avg Lead Time" value={`${form.avgLeadDays} days`} />
            <ReviewRow
              label="Rush"
              value={
                form.rushAvailable ? `Available (${form.rushLeadDays} days)` : 'Not available'
              }
            />
          </div>
          {form.notes && (
            <div className="mt-3">
              <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)', marginBottom: '4px' }}>
                Notes
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--jolly-text-body)',
                  fontStyle: 'italic',
                }}
              >
                {form.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: { bg: string; text: string };
}) {
  return (
    <div>
      <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)', marginBottom: '2px' }}>
        {label}
      </p>
      {badge ? (
        <span
          className="inline-flex px-2 py-0.5"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: badge.bg,
            color: badge.text,
            borderRadius: '4px',
          }}
        >
          {value}
        </span>
      ) : (
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--jolly-text-body)' }}>
          {value}
        </p>
      )}
    </div>
  );
}

// ======================
// MAIN MODAL COMPONENT
// ======================

interface AddDecoratorModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (decorator: any) => void;
}

export function AddDecoratorModal({ open, onClose, onCreated }: AddDecoratorModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<StepErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isReview = step === STEPS.length;
  const totalSteps = STEPS.length + 1; // 4 data steps + 1 review

  const validateStep = useCallback(
    (s: number): StepErrors => {
      const e: StepErrors = {};
      if (s === 0) {
        if (!form.name.trim()) e.name = 'Business name is required';
        if (!form.code.trim()) e.code = 'Supplier code is required';
        else if (form.code.length < 2) e.code = 'Code must be at least 2 characters';
        if (!form.location.trim()) e.location = 'Location is required';
        if (!form.state) e.state = 'State is required';
      }
      if (s === 1) {
        if (!form.contactName.trim()) e.contactName = 'Contact name is required';
        if (!form.contactEmail.trim()) e.contactEmail = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.contactEmail))
          e.contactEmail = 'Enter a valid email address';
        if (!form.contactPhone.trim()) e.contactPhone = 'Phone number is required';
      }
      if (s === 2) {
        if (form.methods.length === 0) e.methods = 'Select at least one decoration method';
        if (form.productCategories.length === 0)
          e.productCategories = 'Select at least one category';
      }
      if (s === 3) {
        if (!form.minOrder.trim()) e.minOrder = 'Min order quantity is required';
        else if (parseInt(form.minOrder) < 1) e.minOrder = 'Must be at least 1';
        if (!form.avgLeadDays.trim()) e.avgLeadDays = 'Lead time is required';
        else if (parseInt(form.avgLeadDays) < 1) e.avgLeadDays = 'Must be at least 1 day';
        if (form.rushAvailable && !form.rushLeadDays.trim())
          e.rushLeadDays = 'Rush lead time is required';
      }
      return e;
    },
    [form]
  );

  const handleNext = () => {
    const errs = validateStep(step);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep(step - 1);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newDecorator = {
        id: `DEC-${String(Date.now()).slice(-3)}`,
        name: form.name,
        code: form.code,
        location: form.location,
        state: form.state,
        methods: form.methods,
        preferredFor: form.preferredFor,
        productCategories: form.productCategories,
        minOrder: parseInt(form.minOrder),
        avgLeadDays: parseInt(form.avgLeadDays),
        rushAvailable: form.rushAvailable,
        rushLeadDays: form.rushAvailable ? parseInt(form.rushLeadDays) : undefined,
        qualityRating: 0,
        onTimeRate: 0,
        status: 'Onboarding' as const,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        website: form.website || undefined,
        priceLevel: form.priceLevel,
        lastOrderDate: '—',
        totalOrders: 0,
        notes: form.notes || undefined,
        isAppaLinked: false,
        reviewFrequencyMonths: 12 as const,
        lastReviewedDate: undefined as string | undefined,
      };
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        onCreated(newDecorator);
        resetAndClose();
      }, 1800);
    }, 1200);
  };

  const resetAndClose = () => {
    setStep(0);
    setForm(INITIAL_FORM);
    setErrors({});
    setIsSubmitting(false);
    setShowSuccess(false);
    onClose();
  };

  if (!open) return null;

  // Success overlay
  if (showSuccess) {
    return (
      <>
        <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} />
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="bg-white rounded flex flex-col items-center p-10"
            style={{
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              pointerEvents: 'auto',
              width: '400px',
            }}
          >
            <div
              className="flex items-center justify-center mb-5"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#E8F5E9',
              }}
            >
              <CheckCircle2 size={32} style={{ color: 'var(--jolly-success)' }} />
            </div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--jolly-text-body)',
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              Decorator Created!
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--jolly-text-secondary)',
                textAlign: 'center',
                lineHeight: '1.5',
              }}
            >
              <strong>{form.name}</strong> ({form.code}) has been added to the matrix with
              "Onboarding" status.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={resetAndClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded flex flex-col"
          style={{
            width: '720px',
            maxHeight: '90vh',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--jolly-border)' }}
          >
            <div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--jolly-text-body)',
                  margin: 0,
                }}
              >
                Add New Decorator
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)', marginTop: '2px' }}>
                {isReview
                  ? 'Review & confirm'
                  : `Step ${step + 1} of ${STEPS.length} — ${STEPS[step].label}`}
              </p>
            </div>
            <button
              onClick={resetAndClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid var(--jolly-border)',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} style={{ color: 'var(--jolly-text-secondary)' }} />
            </button>
          </div>

          {/* Step Indicator */}
          <div
            className="px-4 py-4 flex items-center justify-center gap-0 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--jolly-border)', backgroundColor: 'var(--jolly-bg)', overflowX: 'auto' }}
          >
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const completed = i < step;
              const active = i === step && !isReview;
              return (
                <div key={s.key} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      // Only go back, not forward without validation
                      if (i < step) {
                        setErrors({});
                        setStep(i);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded"
                    style={{
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: active
                        ? 'white'
                        : 'transparent',
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: i < step ? 'pointer' : 'default',
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: completed
                          ? 'var(--jolly-success)'
                          : active
                          ? 'var(--jolly-primary)'
                          : 'var(--jolly-border)',
                        flexShrink: 0,
                      }}
                    >
                      {completed ? (
                        <Check size={12} stroke="white" strokeWidth={3} />
                      ) : (
                        <Icon size={12} stroke={active ? 'white' : 'var(--jolly-text-disabled)'} />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: active ? 600 : 400,
                        color: active
                          ? 'var(--jolly-text-body)'
                          : completed
                          ? 'var(--jolly-success)'
                          : 'var(--jolly-text-disabled)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        width: '24px',
                        height: '2px',
                        backgroundColor: i < step ? 'var(--jolly-success)' : 'var(--jolly-border)',
                        margin: '0 2px',
                        borderRadius: '1px',
                      }}
                    />
                  )}
                </div>
              );
            })}
            {/* Review indicator */}
            <div className="flex items-center">
              <div
                style={{
                  width: '24px',
                  height: '2px',
                  backgroundColor: isReview ? 'var(--jolly-success)' : 'var(--jolly-border)',
                  margin: '0 2px',
                  borderRadius: '1px',
                }}
              />
              <div
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{
                  borderRadius: '6px',
                  backgroundColor: isReview ? 'white' : 'transparent',
                  boxShadow: isReview ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isReview ? 'var(--jolly-primary)' : 'var(--jolly-border)',
                  }}
                >
                  <CheckCircle2
                    size={12}
                    stroke={isReview ? 'white' : 'var(--jolly-text-disabled)'}
                  />
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isReview ? 600 : 400,
                    color: isReview ? 'var(--jolly-text-body)' : 'var(--jolly-text-disabled)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Review
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto px-6 py-6" style={{ minHeight: 0 }}>
            {step === 0 && <Step1SupplierDetails form={form} setForm={setForm} errors={errors} />}
            {step === 1 && <Step2Contact form={form} setForm={setForm} errors={errors} />}
            {step === 2 && <Step3Capabilities form={form} setForm={setForm} errors={errors} />}
            {step === 3 && <Step4Operations form={form} setForm={setForm} errors={errors} />}
            {isReview && <ReviewStep form={form} />}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderTop: '1px solid var(--jolly-border)' }}
          >
            <div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5"
                  style={{
                    height: '36px',
                    padding: '0 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--jolly-border)',
                    backgroundColor: 'white',
                    color: 'var(--jolly-text-body)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={15} /> Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--jolly-border)',
                  backgroundColor: 'white',
                  color: 'var(--jolly-text-secondary)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              {isReview ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                  style={{
                    height: '36px',
                    padding: '0 24px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isSubmitting
                      ? 'var(--jolly-text-disabled)'
                      : 'var(--jolly-success)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="inline-block"
                        style={{
                          width: '14px',
                          height: '14px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      Creating…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} /> Create Decorator
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5"
                  style={{
                    height: '36px',
                    padding: '0 24px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--jolly-primary)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Continue <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}