import { useState, useCallback } from 'react';
import {
  Plus, X, RefreshCw, Lock, Unlock, AlertTriangle, Info, ChevronDown,
  Save, Check, Pencil,
} from 'lucide-react';
import {
  DecoratorPricingData, PricingRowData, TierColumn,
  updateDecoratorPricing, makeNewRow, makeNewTier,
  ALL_DECORATION_METHODS,
} from '../../data/pricingMatrixStore';

interface PricingMatrixProps {
  decoratorName: string;
  data: DecoratorPricingData;
  onDataChange: (newData: DecoratorPricingData) => void;
}

// ─── Tier column header label ─────────────────────────────────────────────────
function tierLabel(t: TierColumn): string {
  if (t.maxQty === null) return `${t.minQty}+`;
  return `${t.minQty}–${t.maxQty}`;
}

// ─── APPA sync banner ─────────────────────────────────────────────────────────
function AppaBanner({ lastSync }: { lastSync?: string }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded mb-4"
      style={{
        backgroundColor: '#EBF3FB',
        border: '1px solid #BFDBF7',
        borderRadius: '6px',
      }}
    >
      <RefreshCw size={14} style={{ color: 'var(--jolly-primary)', marginTop: '1px', flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--jolly-primary)', margin: '0 0 2px' }}>
          APPA-Synced Pricing
        </p>
        <p style={{ fontSize: '12px', color: 'var(--jolly-text-secondary)', margin: 0, lineHeight: 1.5 }}>
          This decorator's pricing is managed by APPA. Last synced:{' '}
          <strong>{lastSync ?? '—'}</strong>.{' '}
          Manual edits here will be <strong>overwritten</strong> on the next APPA sync.
          Use the override toggle on each row to lock in manual values.
        </p>
      </div>
    </div>
  );
}

// ─── Method select dropdown ───────────────────────────────────────────────────
function MethodSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        border: '1px solid var(--jolly-border)',
        borderRadius: '6px',
        fontSize: '13px',
        height: '32px',
        padding: '0 8px',
        backgroundColor: disabled ? 'var(--jolly-bg)' : 'white',
        color: 'var(--jolly-text-body)',
        minWidth: '160px',
        cursor: disabled ? 'not-allowed' : 'default',
      }}
    >
      {ALL_DECORATION_METHODS.map(m => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>
  );
}

// ─── Numeric cell ─────────────────────────────────────────────────────────────
function CostCell({
  value,
  onChange,
  isAppa,
  locked,
}: {
  value: number;
  onChange: (v: number) => void;
  isAppa: boolean;
  locked: boolean;
}) {
  const readOnly = isAppa && locked;
  return (
    <div className="flex items-center" style={{ minWidth: '80px' }}>
      <span
        style={{
          padding: '0 6px',
          height: '32px',
          display: 'inline-flex',
          alignItems: 'center',
          border: '1px solid var(--jolly-border)',
          borderRight: 'none',
          borderRadius: '6px 0 0 6px',
          fontSize: '13px',
          backgroundColor: readOnly ? 'var(--jolly-bg)' : 'white',
          color: 'var(--jolly-text-disabled)',
        }}
      >
        $
      </span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value || ''}
        readOnly={readOnly}
        onChange={(e) => !readOnly && onChange(parseFloat(e.target.value) || 0)}
        placeholder="0.00"
        style={{
          width: '72px',
          height: '32px',
          border: '1px solid var(--jolly-border)',
          borderRadius: '0 6px 6px 0',
          fontSize: '13px',
          padding: '0 8px',
          backgroundColor: readOnly ? 'var(--jolly-bg)' : 'white',
          color: readOnly ? 'var(--jolly-text-disabled)' : 'var(--jolly-text-body)',
          cursor: readOnly ? 'not-allowed' : 'text',
          outline: 'none',
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PricingMatrix({ decoratorName, data, onDataChange }: PricingMatrixProps) {
  const { isAppaLinked, appaLastSync, tiers, rows } = data;

  // Per-row APPA lock state: true = locked (APPA controls), false = manual override
  const [appaLocked, setAppaLocked] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    rows.forEach(r => { init[r.id] = true; });
    return init;
  });

  // Track if we've saved recently for the save-indicator
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [removeRowConfirm, setRemoveRowConfirm] = useState<string | null>(null);
  const [removeTierConfirm, setRemoveTierConfirm] = useState<string | null>(null);
  const [editingTierIdx, setEditingTierIdx] = useState<number | null>(null);

  const persist = useCallback((updatedData: DecoratorPricingData) => {
    onDataChange(updatedData);
    updateDecoratorPricing(decoratorName, () => updatedData);
    const now = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    setSavedAt(now);
  }, [decoratorName, onDataChange]);

  // ── Row operations ────────────────────────────────────────────────────────

  const handleRowChange = (rowId: string, updates: Partial<PricingRowData>) => {
    const newRows = rows.map(r => r.id === rowId ? { ...r, ...updates } : r);
    persist({ ...data, rows: newRows });
  };

  const handleCostChange = (rowId: string, tierId: string, value: number) => {
    const newRows = rows.map(r =>
      r.id === rowId ? { ...r, costs: { ...r.costs, [tierId]: value } } : r,
    );
    persist({ ...data, rows: newRows });
  };

  const handleAddRow = () => {
    const usedMethods = rows.map(r => r.method);
    const available = ALL_DECORATION_METHODS.filter(m => !usedMethods.includes(m));
    const newRow = makeNewRow(available.length > 0 ? available : ALL_DECORATION_METHODS);
    const newRows = [...rows, newRow];
    setAppaLocked(prev => ({ ...prev, [newRow.id]: isAppaLinked }));
    persist({ ...data, rows: newRows });
  };

  const handleRemoveRow = (rowId: string) => {
    const newRows = rows.filter(r => r.id !== rowId);
    setRemoveRowConfirm(null);
    persist({ ...data, rows: newRows });
  };

  // ── Tier column operations ────────────────────────────────────────────────

  const handleAddTier = () => {
    const newTier = makeNewTier(tiers);
    persist({ ...data, tiers: [...tiers, newTier] });
  };

  const handleRemoveTier = (tierId: string) => {
    if (tiers.length <= 1) return;
    const newTiers = tiers.filter(t => t.id !== tierId);
    const newRows = rows.map(r => {
      const { [tierId]: _removed, ...rest } = r.costs;
      return { ...r, costs: rest };
    });
    setRemoveTierConfirm(null);
    persist({ ...data, tiers: newTiers, rows: newRows });
  };

  const handleTierChange = (tierId: string, field: 'minQty' | 'maxQty', value: number | null) => {
    const newTiers = tiers.map(t => t.id === tierId ? { ...t, [field]: value } : t);
    persist({ ...data, tiers: newTiers });
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const thStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--jolly-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '8px 10px',
    whiteSpace: 'nowrap',
    backgroundColor: 'var(--jolly-header-bg)',
    borderBottom: '1px solid var(--jolly-border)',
    textAlign: 'left',
  };

  const inputSm: React.CSSProperties = {
    border: '1px solid var(--jolly-border)',
    borderRadius: '6px',
    fontSize: '13px',
    height: '32px',
    padding: '0 8px',
    backgroundColor: 'white',
    color: 'var(--jolly-text-body)',
  };

  return (
    <div>
      {/* APPA banner */}
      {isAppaLinked && <AppaBanner lastSync={appaLastSync} />}

      {/* Manual badge */}
      {!isAppaLinked && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded mb-4"
          style={{
            backgroundColor: 'var(--jolly-bg)',
            border: '1px solid var(--jolly-border)',
            borderRadius: '6px',
            display: 'inline-flex',
          }}
        >
          <Pencil size={13} style={{ color: 'var(--jolly-text-secondary)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>
            Manual pricing — admin maintains all data for this decorator
          </span>
        </div>
      )}

      {/* Save indicator */}
      {savedAt && (
        <div className="flex items-center gap-1.5 mb-3" style={{ fontSize: '12px', color: 'var(--jolly-success)' }}>
          <Check size={13} />
          Saved {savedAt}
        </div>
      )}

      {/* Matrix table */}
      <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid var(--jolly-border)' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '100%', fontSize: '13px' }}>
          <thead>
            {/* Tier qty range edit row */}
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              {/* Fixed left columns spacer */}
              <td colSpan={3} style={{ padding: '4px 10px', borderBottom: '1px solid var(--jolly-border)' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--jolly-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Qty Breakpoints
                </span>
              </td>
              {/* Tier editable ranges */}
              {tiers.map((tier, idx) => (
                <td
                  key={tier.id}
                  style={{ padding: '4px 6px', borderBottom: '1px solid var(--jolly-border)', verticalAlign: 'middle' }}
                >
                  <div className="flex items-center gap-1">
                    {editingTierIdx === idx ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tier.minQty}
                          onChange={(e) => handleTierChange(tier.id, 'minQty', parseInt(e.target.value) || 0)}
                          style={{ ...inputSm, width: '56px', height: '24px', fontSize: '12px' }}
                        />
                        <span style={{ fontSize: '11px', color: 'var(--jolly-text-disabled)' }}>–</span>
                        <input
                          type="number"
                          value={tier.maxQty ?? ''}
                          onChange={(e) => handleTierChange(tier.id, 'maxQty', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="∞"
                          style={{ ...inputSm, width: '56px', height: '24px', fontSize: '12px' }}
                        />
                        <button
                          onClick={() => setEditingTierIdx(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                        >
                          <Check size={12} style={{ color: 'var(--jolly-success)' }} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingTierIdx(idx)}
                        className="flex items-center gap-1"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                          borderRadius: '4px', fontSize: '11px', color: 'var(--jolly-text-secondary)',
                        }}
                        title="Edit qty range"
                      >
                        {tierLabel(tier)}
                        <Pencil size={9} />
                      </button>
                    )}
                    {/* Remove tier button */}
                    {tiers.length > 1 && (
                      removeTierConfirm === tier.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRemoveTier(tier.id)}
                            style={{ background: 'var(--jolly-destructive)', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '10px', color: 'white', fontWeight: 600 }}
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => setRemoveTierConfirm(null)}
                            style={{ background: 'none', border: '1px solid var(--jolly-border)', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '10px', color: 'var(--jolly-text-secondary)' }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRemoveTierConfirm(tier.id)}
                          title="Remove this qty tier"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', opacity: 0.4, lineHeight: 1 }}
                        >
                          <X size={11} style={{ color: 'var(--jolly-destructive)' }} />
                        </button>
                      )
                    )}
                  </div>
                </td>
              ))}
              {/* Add tier column */}
              <td style={{ padding: '4px 6px', borderBottom: '1px solid var(--jolly-border)', verticalAlign: 'middle' }}>
                <button
                  onClick={handleAddTier}
                  title="Add quantity tier column"
                  className="flex items-center gap-1"
                  style={{
                    background: 'none', border: '1px dashed var(--jolly-border)',
                    borderRadius: '4px', cursor: 'pointer', padding: '2px 6px',
                    fontSize: '11px', color: 'var(--jolly-primary)', fontWeight: 600,
                  }}
                >
                  <Plus size={10} /> Add tier
                </button>
              </td>
              {/* Actions spacer */}
              <td style={{ padding: '4px 6px', borderBottom: '1px solid var(--jolly-border)' }} />
            </tr>

            {/* Main column headers */}
            <tr>
              <th style={{ ...thStyle, minWidth: '170px' }}>Decoration Method</th>
              <th style={{ ...thStyle, minWidth: '90px' }}>Code</th>
              <th style={{ ...thStyle, minWidth: '110px' }}>Setup Fee</th>
              {tiers.map(tier => (
                <th key={tier.id} style={{ ...thStyle, minWidth: '100px', textAlign: 'right' }}>
                  {tierLabel(tier)}
                  <div style={{ fontSize: '10px', fontWeight: 400, color: 'var(--jolly-text-disabled)', marginTop: '1px' }}>
                    per unit
                  </div>
                </th>
              ))}
              <th style={{ ...thStyle, minWidth: '40px' }} />
              {isAppaLinked && <th style={{ ...thStyle, minWidth: '80px' }}>Override</th>}
              <th style={{ ...thStyle, width: '40px' }} />
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={4 + tiers.length}
                  style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--jolly-text-disabled)', fontSize: '13px' }}
                >
                  No decoration types configured. Add one below.
                </td>
              </tr>
            )}

            {rows.map((row, idx) => {
              const isLocked = isAppaLinked && (appaLocked[row.id] !== false);
              const rowBg = idx % 2 === 0 ? 'white' : 'var(--jolly-row-alt)';

              return (
                <tr
                  key={row.id}
                  style={{
                    backgroundColor: rowBg,
                    borderTop: '1px solid var(--jolly-border)',
                    opacity: isLocked ? 0.9 : 1,
                  }}
                >
                  {/* Method */}
                  <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
                    <MethodSelect
                      value={row.method}
                      onChange={(v) => handleRowChange(row.id, { method: v })}
                      disabled={isLocked}
                    />
                  </td>

                  {/* Pricing code */}
                  <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
                    <input
                      type="text"
                      value={row.pricingCode}
                      onChange={(e) => !isLocked && handleRowChange(row.id, { pricingCode: e.target.value })}
                      readOnly={isLocked}
                      placeholder="e.g. P1"
                      style={{
                        ...inputSm,
                        width: '80px',
                        backgroundColor: isLocked ? 'var(--jolly-bg)' : 'white',
                        cursor: isLocked ? 'not-allowed' : 'text',
                        color: isLocked ? 'var(--jolly-text-disabled)' : 'var(--jolly-text-body)',
                      }}
                    />
                  </td>

                  {/* Setup fee */}
                  <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
                    <div className="flex items-center">
                      <span style={{
                        padding: '0 6px',
                        height: '32px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid var(--jolly-border)',
                        borderRight: 'none',
                        borderRadius: '6px 0 0 6px',
                        fontSize: '13px',
                        backgroundColor: isLocked ? 'var(--jolly-bg)' : 'white',
                        color: 'var(--jolly-text-disabled)',
                      }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.setupFee || ''}
                        readOnly={isLocked}
                        onChange={(e) => !isLocked && handleRowChange(row.id, { setupFee: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        style={{
                          width: '72px',
                          height: '32px',
                          border: '1px solid var(--jolly-border)',
                          borderRadius: '0 6px 6px 0',
                          fontSize: '13px',
                          padding: '0 8px',
                          backgroundColor: isLocked ? 'var(--jolly-bg)' : 'white',
                          color: isLocked ? 'var(--jolly-text-disabled)' : 'var(--jolly-text-body)',
                          cursor: isLocked ? 'not-allowed' : 'text',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </td>

                  {/* Cost per tier */}
                  {tiers.map(tier => (
                    <td key={tier.id} style={{ padding: '8px 10px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <CostCell
                        value={row.costs[tier.id] ?? 0}
                        onChange={(v) => handleCostChange(row.id, tier.id, v)}
                        isAppa={isAppaLinked}
                        locked={isLocked}
                      />
                    </td>
                  ))}

                  {/* Add tier spacer */}
                  <td />

                  {/* APPA lock toggle */}
                  {isAppaLinked && (
                    <td style={{ padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <button
                        onClick={() => setAppaLocked(prev => ({ ...prev, [row.id]: !prev[row.id] }))}
                        title={isLocked ? 'Click to override APPA pricing for this row' : 'Click to restore APPA control'}
                        className="flex items-center gap-1"
                        style={{
                          border: '1px solid',
                          borderColor: isLocked ? 'var(--jolly-border)' : 'var(--jolly-warning)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: isLocked ? 'var(--jolly-bg)' : '#FFFBEB',
                          color: isLocked ? 'var(--jolly-text-disabled)' : '#D97706',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isLocked
                          ? <><Lock size={10} /> APPA</>
                          : <><Unlock size={10} /> Manual</>}
                      </button>
                    </td>
                  )}

                  {/* Remove row */}
                  <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
                    {removeRowConfirm === row.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRemoveRow(row.id)}
                          style={{ background: 'var(--jolly-destructive)', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '3px 8px', fontSize: '11px', color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => setRemoveRowConfirm(null)}
                          style={{ background: 'none', border: '1px solid var(--jolly-border)', borderRadius: '4px', cursor: 'pointer', padding: '3px 6px', fontSize: '11px', color: 'var(--jolly-text-secondary)' }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRemoveRowConfirm(row.id)}
                        title="Remove decoration type"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                          borderRadius: '4px', lineHeight: 1, opacity: 0.5,
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.5'; }}
                      >
                        <X size={15} style={{ color: 'var(--jolly-destructive)' }} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Footer: add row */}
          <tfoot>
            <tr style={{ backgroundColor: 'var(--jolly-bg)', borderTop: '1px solid var(--jolly-border)' }}>
              <td colSpan={3 + tiers.length + 3} style={{ padding: '10px 12px' }}>
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-2"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--jolly-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '2px 0',
                  }}
                >
                  <Plus size={14} />
                  Add decoration type
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-start gap-4 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5" style={{ fontSize: '11px', color: 'var(--jolly-text-disabled)' }}>
          <Info size={11} />
          Setup fee is a one-time charge per job (e.g. screen setup, digitisation)
        </div>
        <div className="flex items-center gap-1.5" style={{ fontSize: '11px', color: 'var(--jolly-text-disabled)' }}>
          <Info size={11} />
          Unit costs are per-decorated-item at each quantity tier
        </div>
      </div>
    </div>
  );
}
