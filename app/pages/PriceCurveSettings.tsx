import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import {
  Plus, X, Save, Copy, Trash2, Star, StarOff, AlertTriangle,
  Info, Settings, TrendingDown, CheckCircle2, ChevronRight,
  MoreHorizontal, Lock, Pencil,
} from 'lucide-react';
import { LeftSidebar } from '../components/LeftSidebar';
import { useRole } from '../context/RoleContext';
import {
  PricingTier, PriceCurveTemplate,
  getTemplates, saveTemplates,
} from '../components/add-product/types';
import { UserRole } from '../types';

const MAX_TIERS = 6;

// ── helpers ────────────────────────────────────────────────────────────────────

function makeTier(last?: PricingTier): PricingTier {
  return {
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    minQty: last ? (last.maxQty ? last.maxQty + 1 : 500) : 1,
    maxQty: null,
    unitCost: last ? Math.max(+(last.unitCost - 0.5).toFixed(2), 0.5) : 5.0,
  };
}

function makeDraftTemplate(base?: PriceCurveTemplate): PriceCurveTemplate {
  return {
    id: `tpl-${Date.now()}`,
    name: base ? `${base.name} (copy)` : 'New Template',
    description: base ? base.description : '',
    isDefault: false,
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tiers: base
      ? base.tiers.map(t => ({ ...t, id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }))
      : [makeTier()],
  };
}

function tierWarnings(tiers: PricingTier[]): string[] {
  const w: string[] = [];
  for (let i = 0; i < tiers.length - 1; i++) {
    const cur = tiers[i]; const next = tiers[i + 1];
    if (cur.maxQty !== null && next.minQty > cur.maxQty + 1)
      w.push(`Gap between T${i + 1} and T${i + 2}: qty ${cur.maxQty + 1}–${next.minQty - 1} not covered`);
    if (cur.maxQty !== null && next.minQty <= cur.maxQty)
      w.push(`Overlap between T${i + 1} and T${i + 2}`);
  }
  return w;
}

function qtyRangeLabel(tiers: PricingTier[]) {
  if (!tiers.length) return '—';
  const first = tiers[0].minQty;
  const last = tiers[tiers.length - 1];
  return `${first}–${last.maxQty ? last.maxQty : last.minQty + '+'}`;
}

// ── shared input style ─────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  border: '1px solid var(--jolly-border)',
  borderRadius: '6px',
  fontSize: '14px',
  height: '36px',
  padding: '0 10px',
  outline: 'none',
  backgroundColor: 'white',
};

// ── mini cost-curve bar chart ──────────────────────────────────────────────────

function CurveChart({ tiers, height = 64 }: { tiers: PricingTier[]; height?: number }) {
  if (!tiers.length) return null;
  const maxCost = Math.max(...tiers.map(t => t.unitCost));
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {tiers.map((tier, i) => {
        const pct = maxCost > 0 ? (tier.unitCost / maxCost) * 100 : 50;
        return (
          <div key={tier.id} className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
            <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--jolly-primary)', whiteSpace: 'nowrap' }}>
              ${tier.unitCost.toFixed(2)}
            </span>
            <div
              style={{
                width: '100%',
                height: `${pct}%`,
                minHeight: '4px',
                backgroundColor: 'var(--jolly-primary)',
                borderRadius: '3px 3px 0 0',
                opacity: 0.55 + 0.45 * (1 - i / Math.max(tiers.length - 1, 1)),
              }}
            />
            <span style={{ fontSize: '9px', color: 'var(--jolly-text-disabled)' }}>T{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── delete confirmation modal ──────────────────────────────────────────────────

function DeleteModal({
  template,
  onConfirm,
  onCancel,
}: {
  template: PriceCurveTemplate;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 100, backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={onCancel}
    >
      <div
        className="rounded p-6"
        style={{
          backgroundColor: 'var(--jolly-card)',
          borderRadius: '8px',
          width: '400px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 36, height: 36, backgroundColor: 'var(--jolly-destructive-bg)', flexShrink: 0 }}
          >
            <Trash2 size={16} style={{ color: 'var(--jolly-destructive)' }} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--jolly-text-body)' }}>
            Delete template?
          </h3>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--jolly-text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--jolly-text-body)' }}>{template.name}</strong> will be permanently removed.
          This won't affect products already using this curve.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            style={{
              padding: '0 16px', height: 36, borderRadius: 6,
              border: '1px solid var(--jolly-border)', background: 'white',
              fontSize: 14, fontWeight: 600, color: 'var(--jolly-text-secondary)', cursor: 'pointer',
            }}
          >Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0 16px', height: 36, borderRadius: 6,
              border: 'none', backgroundColor: 'var(--jolly-destructive)',
              fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer',
            }}
          >Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export function PriceCurveSettings() {
  const { currentRole, setCurrentRole } = useRole();
  const isAdmin = currentRole === 'admin';

  const [templates, setTemplates] = useState<PriceCurveTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PriceCurveTemplate | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveFlash, setSaveFlash] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PriceCurveTemplate | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load templates
  useEffect(() => {
    const t = getTemplates();
    setTemplates(t);
    const def = t.find(x => x.isDefault) ?? t[0];
    if (def) { setSelectedId(def.id); setDraft({ ...def, tiers: def.tiers.map(x => ({ ...x })) }); }
  }, []);

  // Close kebab menu on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenId(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Select a template to edit
  const selectTemplate = (tpl: PriceCurveTemplate) => {
    setSelectedId(tpl.id);
    setDraft({ ...tpl, tiers: tpl.tiers.map(t => ({ ...t })) });
    setDirty(false);
    setSaveFlash('');
  };

  // Draft mutations
  const mutateDraft = (fn: (d: PriceCurveTemplate) => PriceCurveTemplate) => {
    setDraft(prev => prev ? fn(prev) : prev);
    setDirty(true);
  };

  const handleTierChange = (id: string, field: keyof PricingTier, value: number | null) =>
    mutateDraft(d => ({ ...d, tiers: d.tiers.map(t => t.id === id ? { ...t, [field]: value } : t) }));

  const handleAddTier = () => {
    if (!draft || draft.tiers.length >= MAX_TIERS) return;
    mutateDraft(d => ({ ...d, tiers: [...d.tiers, makeTier(d.tiers[d.tiers.length - 1])] }));
  };

  const handleDeleteTier = (id: string) => {
    if (!draft || draft.tiers.length <= 1) return;
    mutateDraft(d => ({ ...d, tiers: d.tiers.filter(t => t.id !== id) }));
  };

  // Save current draft back to template list
  const handleSave = () => {
    if (!draft) return;
    const now = new Date().toISOString();
    const updated = { ...draft, updatedAt: now };
    const next = templates.map(t => t.id === updated.id ? updated : t);
    setTemplates(next);
    saveTemplates(next);
    setDirty(false);
    setSaveFlash('saved');
    setTimeout(() => setSaveFlash(''), 3000);
  };

  // Set as default
  const handleSetDefault = () => {
    if (!draft) return;
    mutateDraft(d => ({ ...d, isDefault: true }));
    // Save immediately so the UX is instant
    const now = new Date().toISOString();
    const updated: PriceCurveTemplate = { ...draft, isDefault: true, updatedAt: now };
    const next = templates.map(t =>
      t.id === updated.id ? updated : { ...t, isDefault: false }
    );
    setTemplates(next);
    saveTemplates(next);
    setDraft(updated);
    setDirty(false);
    setSaveFlash('default');
    setTimeout(() => setSaveFlash(''), 3000);
  };

  // Create blank template
  const handleNewTemplate = () => {
    const tpl = makeDraftTemplate();
    const next = [...templates, tpl];
    setTemplates(next);
    selectTemplate(tpl);
    setDirty(true);
  };

  // Duplicate
  const handleDuplicate = (tpl: PriceCurveTemplate) => {
    const copy = makeDraftTemplate(tpl);
    const next = [...templates, copy];
    setTemplates(next);
    selectTemplate(copy);
    setDirty(true);
    setMenuOpenId(null);
  };

  // Delete
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const next = templates.filter(t => t.id !== deleteTarget.id);
    // Ensure there's a default
    if (deleteTarget.isDefault && next.length > 0) next[0] = { ...next[0], isDefault: true };
    setTemplates(next);
    saveTemplates(next);
    if (selectedId === deleteTarget.id) {
      const fallback = next[0];
      if (fallback) selectTemplate(fallback);
      else { setSelectedId(null); setDraft(null); }
    }
    setDeleteTarget(null);
    setMenuOpenId(null);
  };

  const warnings = draft ? tierWarnings(draft.tiers) : [];
  const defaultTemplate = templates.find(t => t.isDefault);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', backgroundColor: 'var(--jolly-bg)' }}
    >
      <LeftSidebar currentRole={currentRole} onRoleChange={setCurrentRole as (r: UserRole) => void} />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--jolly-border)', backgroundColor: 'var(--jolly-card)' }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5">
            <Settings size={14} style={{ color: 'var(--jolly-text-disabled)' }} />
            <Link to="/settings" style={{ color: 'var(--jolly-text-secondary)', fontSize: '13px', textDecoration: 'none' }}>
              Settings
            </Link>
            <ChevronRight size={13} style={{ color: 'var(--jolly-text-disabled)' }} />
            <span style={{ color: 'var(--jolly-text-body)', fontSize: '13px', fontWeight: 600 }}>
              Price Curve Templates
            </span>
          </div>

          {/* Role guard badge */}
          {!isAdmin && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded"
              style={{ backgroundColor: 'var(--jolly-warning-bg)', border: '1px solid var(--jolly-warning)' }}
            >
              <Lock size={13} style={{ color: 'var(--jolly-warning)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-warning)' }}>
                Read-only — switch to Admin to edit
              </span>
            </div>
          )}
        </div>

        {/* ── Body: two-panel layout ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT: template list ─────────────────────────────────────── */}
          <div
            className="flex flex-col flex-shrink-0 border-r overflow-y-auto"
            style={{
              width: '280px',
              borderColor: 'var(--jolly-border)',
              backgroundColor: 'var(--jolly-card)',
            }}
          >
            {/* List header */}
            <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--jolly-border)' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TrendingDown size={15} style={{ color: 'var(--jolly-primary)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--jolly-text-body)' }}>
                    Templates
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded"
                    style={{ fontSize: '11px', fontWeight: 600, backgroundColor: 'var(--jolly-surface)', color: 'var(--jolly-primary)' }}
                  >
                    {templates.length}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={handleNewTemplate}
                    title="Create new template"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 6,
                      border: '1px solid var(--jolly-primary)',
                      backgroundColor: 'transparent', color: 'var(--jolly-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--jolly-text-secondary)' }}>
                Click a template to edit. One template is the <strong>default</strong> used in Add Product.
              </p>
            </div>

            {/* Template cards */}
            <div className="flex-1 py-2 px-2 space-y-1" ref={menuRef}>
              {templates.map(tpl => {
                const isSelected = tpl.id === selectedId;
                const isMenuOpen = menuOpenId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => selectTemplate(tpl)}
                    className="rounded relative group"
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--jolly-surface)' : 'transparent',
                      border: isSelected ? '1px solid var(--jolly-primary)' : '1px solid transparent',
                      borderRadius: '6px',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--jolly-bg)'; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  >
                    {/* Name row */}
                    <div className="flex items-center gap-2 mb-1 pr-6">
                      <span style={{
                        fontSize: '13px', fontWeight: 600,
                        color: isSelected ? 'var(--jolly-primary)' : 'var(--jolly-text-body)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {tpl.name}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {tpl.isDefault && (
                        <span
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                          style={{ fontSize: '10px', fontWeight: 700, backgroundColor: 'var(--jolly-primary)', color: 'white', borderRadius: '4px' }}
                        >
                          <Star size={9} />
                          DEFAULT
                        </span>
                      )}
                      {tpl.isBuiltIn && !tpl.isDefault && (
                        <span
                          style={{ fontSize: '10px', fontWeight: 600, color: 'var(--jolly-text-disabled)' }}
                        >
                          built-in
                        </span>
                      )}
                      <span style={{ fontSize: '11px', color: 'var(--jolly-text-secondary)' }}>
                        {tpl.tiers.length} tier{tpl.tiers.length !== 1 ? 's' : ''}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--jolly-text-disabled)' }}>·</span>
                      <span style={{ fontSize: '11px', color: 'var(--jolly-text-secondary)' }}>
                        {qtyRangeLabel(tpl.tiers)}
                      </span>
                    </div>

                    {/* Mini chart thumbnail */}
                    <div className="mt-2" style={{ opacity: isSelected ? 1 : 0.6 }}>
                      <CurveChart tiers={tpl.tiers} height={32} />
                    </div>

                    {/* Kebab menu button */}
                    {isAdmin && (
                      <div
                        className="absolute top-2 right-2"
                        onClick={e => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : tpl.id); }}
                      >
                        <button
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 24, height: 24, borderRadius: 4,
                            border: 'none', background: 'none', cursor: 'pointer',
                            color: 'var(--jolly-text-disabled)',
                          }}
                          title="More actions"
                        >
                          <MoreHorizontal size={14} />
                        </button>

                        {isMenuOpen && (
                          <div
                            className="absolute right-0 top-full mt-1 rounded border shadow-lg"
                            style={{
                              zIndex: 50, minWidth: '160px',
                              backgroundColor: 'var(--jolly-card)',
                              borderColor: 'var(--jolly-border)',
                              overflow: 'hidden',
                            }}
                          >
                            <button
                              onClick={e => { e.stopPropagation(); handleDuplicate(tpl); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50"
                              style={{ fontSize: '13px', fontWeight: 500, color: 'var(--jolly-text-body)', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                            >
                              <Copy size={13} /> Duplicate
                            </button>
                            {!tpl.isDefault && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  selectTemplate(tpl);
                                  // set default immediately
                                  const now = new Date().toISOString();
                                  const updated = { ...tpl, isDefault: true, updatedAt: now };
                                  const next = templates.map(x => x.id === tpl.id ? updated : { ...x, isDefault: false });
                                  setTemplates(next);
                                  saveTemplates(next);
                                  setDraft(updated);
                                  setMenuOpenId(null);
                                  setSaveFlash('default');
                                  setTimeout(() => setSaveFlash(''), 3000);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50"
                                style={{ fontSize: '13px', fontWeight: 500, color: 'var(--jolly-text-body)', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                              >
                                <Star size={13} /> Set as default
                              </button>
                            )}
                            {!tpl.isDefault && (
                              <button
                                onClick={e => { e.stopPropagation(); setDeleteTarget(tpl); setMenuOpenId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-red-50"
                                style={{ fontSize: '13px', fontWeight: 500, color: 'var(--jolly-destructive)', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderTop: '1px solid var(--jolly-border)' }}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {isAdmin && (
                <button
                  onClick={handleNewTemplate}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded hover:bg-gray-50"
                  style={{
                    fontSize: '13px', fontWeight: 600, color: 'var(--jolly-primary)',
                    border: '1px dashed var(--jolly-border)', background: 'none',
                    cursor: 'pointer', borderRadius: '6px', marginTop: '8px',
                  }}
                >
                  <Plus size={14} /> New template
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT: editor ───────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {draft ? (
              <div className="max-w-[780px] mx-auto py-6 px-6">

                {/* Toast feedback */}
                {saveFlash === 'saved' && (
                  <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded" style={{ backgroundColor: '#E8F5E9', border: '1px solid var(--jolly-success)', borderRadius: '6px' }}>
                    <CheckCircle2 size={15} style={{ color: 'var(--jolly-success)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--jolly-success)', fontWeight: 600 }}>Template saved successfully.</span>
                  </div>
                )}
                {saveFlash === 'default' && (
                  <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded" style={{ backgroundColor: '#EBF3FB', border: '1px solid var(--jolly-primary)', borderRadius: '6px' }}>
                    <Star size={15} style={{ color: 'var(--jolly-primary)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--jolly-primary)', fontWeight: 600 }}>
                      "{draft.name}" is now the default template — new products will use this curve.
                    </span>
                  </div>
                )}

                {/* Editor header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1 mr-4">
                    {/* Template name */}
                    {isAdmin ? (
                      <div className="flex items-center gap-2 mb-2">
                        <Pencil size={14} style={{ color: 'var(--jolly-text-disabled)', flexShrink: 0 }} />
                        <input
                          value={draft.name}
                          onChange={e => mutateDraft(d => ({ ...d, name: e.target.value }))}
                          placeholder="Template name"
                          style={{
                            ...inp,
                            fontSize: '20px',
                            fontWeight: 700,
                            color: 'var(--jolly-text-body)',
                            border: 'none',
                            borderBottom: '1px solid var(--jolly-border)',
                            borderRadius: 0,
                            paddingLeft: 0,
                            height: '32px',
                            backgroundColor: 'transparent',
                            flex: 1,
                          }}
                        />
                      </div>
                    ) : (
                      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--jolly-text-body)', marginBottom: '6px' }}>
                        {draft.name}
                      </h2>
                    )}

                    {/* Description */}
                    {isAdmin ? (
                      <input
                        value={draft.description}
                        onChange={e => mutateDraft(d => ({ ...d, description: e.target.value }))}
                        placeholder="Optional description…"
                        style={{ ...inp, width: '100%', fontSize: '13px', color: 'var(--jolly-text-secondary)' }}
                      />
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)' }}>{draft.description || '—'}</p>
                    )}

                    {/* Badges */}
                    <div className="flex items-center gap-2 mt-3">
                      {draft.isDefault && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--jolly-primary)', color: 'white', borderRadius: '4px' }}>
                          <Star size={10} /> DEFAULT TEMPLATE
                        </span>
                      )}
                      {draft.isBuiltIn && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ fontSize: '11px', fontWeight: 600, backgroundColor: 'var(--jolly-bg)', color: 'var(--jolly-text-disabled)', border: '1px solid var(--jolly-border)' }}>
                          <Lock size={10} /> Built-in
                        </span>
                      )}
                      {dirty && (
                        <span style={{ fontSize: '11px', color: 'var(--jolly-warning)', fontWeight: 600 }}>
                          Unsaved changes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!draft.isDefault && (
                        <button
                          onClick={handleSetDefault}
                          className="flex items-center gap-1.5 px-3 py-2 rounded"
                          style={{
                            border: '1px solid var(--jolly-border)',
                            backgroundColor: 'white',
                            color: 'var(--jolly-text-secondary)',
                            fontSize: '13px', fontWeight: 600, height: '36px', cursor: 'pointer',
                          }}
                          title="Make this the default template for Add Product"
                        >
                          <StarOff size={13} /> Set as default
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicate(draft)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded"
                        style={{
                          border: '1px solid var(--jolly-border)',
                          backgroundColor: 'white',
                          color: 'var(--jolly-text-secondary)',
                          fontSize: '13px', fontWeight: 600, height: '36px', cursor: 'pointer',
                        }}
                      >
                        <Copy size={13} /> Duplicate
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-1.5 px-4 py-2 rounded"
                        style={{
                          backgroundColor: dirty ? 'var(--jolly-primary)' : 'var(--jolly-bg)',
                          color: dirty ? 'white' : 'var(--jolly-text-disabled)',
                          border: 'none', fontSize: '13px', fontWeight: 600, height: '36px', cursor: dirty ? 'pointer' : 'default',
                          transition: 'background 0.15s',
                        }}
                      >
                        <Save size={13} /> Save
                      </button>
                    </div>
                  )}
                </div>

                {/* ── TIER TABLE ─────────────────────────────────────────── */}
                <div
                  className="rounded mb-4"
                  style={{
                    backgroundColor: 'var(--jolly-card)',
                    borderRadius: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Table header */}
                  <div
                    className="flex items-center justify-between px-5 py-3.5 border-b"
                    style={{ borderColor: 'var(--jolly-border)' }}
                  >
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
                        Tier Configuration
                      </span>
                      <span
                        className="ml-2 px-2 py-0.5 rounded"
                        style={{ fontSize: '11px', fontWeight: 600, backgroundColor: 'var(--jolly-surface)', color: 'var(--jolly-primary)' }}
                      >
                        {draft.tiers.length}/{MAX_TIERS}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)' }}>
                      Leave Max Qty blank on the last tier for no upper limit
                    </span>
                  </div>

                  <div className="px-5 py-4">
                    <div className="border rounded overflow-hidden" style={{ borderColor: 'var(--jolly-border)' }}>
                      <table className="w-full" style={{ fontSize: '14px' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--jolly-header-bg)' }}>
                            <th className="text-left py-2.5 px-4" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-secondary)', width: '56px' }}>Tier</th>
                            <th className="text-left py-2.5 px-4" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Min Qty</th>
                            <th className="text-left py-2.5 px-4" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Max Qty</th>
                            <th className="text-left py-2.5 px-4" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Default Unit Cost (AUD)</th>
                            {isAdmin && <th style={{ width: '44px' }} />}
                          </tr>
                        </thead>
                        <tbody>
                          {draft.tiers.map((tier, index) => (
                            <tr
                              key={tier.id}
                              style={{
                                backgroundColor: index % 2 === 0 ? 'white' : 'var(--jolly-row-alt)',
                                borderTop: '1px solid var(--jolly-border)',
                              }}
                            >
                              <td className="py-2.5 px-4">
                                <span
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: '28px', height: '22px',
                                    backgroundColor: 'var(--jolly-surface)',
                                    borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--jolly-primary)',
                                  }}
                                >
                                  T{index + 1}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                {isAdmin ? (
                                  <input type="number" min="1" value={tier.minQty}
                                    onChange={e => handleTierChange(tier.id, 'minQty', parseInt(e.target.value) || 0)}
                                    style={{ ...inp, width: '100px' }} />
                                ) : <span style={{ color: 'var(--jolly-text-body)' }}>{tier.minQty}</span>}
                              </td>
                              <td className="py-2.5 px-4">
                                {isAdmin ? (
                                  <input type="number" min="1" value={tier.maxQty ?? ''}
                                    onChange={e => handleTierChange(tier.id, 'maxQty', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder={index === draft.tiers.length - 1 ? 'No limit' : ''}
                                    style={{ ...inp, width: '130px' }} />
                                ) : <span style={{ color: 'var(--jolly-text-body)' }}>{tier.maxQty ?? '∞'}</span>}
                              </td>
                              <td className="py-2.5 px-4">
                                {isAdmin ? (
                                  <div className="flex items-center">
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                      width: '30px', height: '36px',
                                      border: '1px solid var(--jolly-border)', borderRight: 'none',
                                      borderRadius: '6px 0 0 6px',
                                      backgroundColor: 'var(--jolly-bg)',
                                      fontSize: '14px', color: 'var(--jolly-text-secondary)',
                                    }}>$</span>
                                    <input type="number" step="0.01" min="0" value={tier.unitCost}
                                      onChange={e => handleTierChange(tier.id, 'unitCost', parseFloat(e.target.value) || 0)}
                                      style={{ ...inp, borderRadius: '0 6px 6px 0', width: '90px' }} />
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--jolly-text-body)', fontFamily: 'monospace' }}>
                                    ${tier.unitCost.toFixed(2)}
                                  </span>
                                )}
                              </td>
                              {isAdmin && (
                                <td className="py-2.5 px-2">
                                  <button
                                    onClick={() => handleDeleteTier(tier.id)}
                                    disabled={draft.tiers.length <= 1}
                                    style={{
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      width: 28, height: 28, borderRadius: 4,
                                      border: 'none', background: 'none',
                                      cursor: draft.tiers.length <= 1 ? 'not-allowed' : 'pointer',
                                      opacity: draft.tiers.length <= 1 ? 0.25 : 1,
                                    }}
                                    title={draft.tiers.length <= 1 ? 'Cannot delete the only tier' : 'Remove tier'}
                                  >
                                    <X size={14} style={{ color: 'var(--jolly-destructive)' }} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Warnings */}
                    {warnings.map((w, i) => (
                      <div key={i} className="flex items-center gap-2 mt-2 p-2 rounded" style={{ backgroundColor: 'var(--jolly-warning-bg)', fontSize: '13px', color: 'var(--jolly-warning)' }}>
                        <AlertTriangle size={13} /> {w}
                      </div>
                    ))}

                    {/* Add tier / limit */}
                    {isAdmin && draft.tiers.length < MAX_TIERS ? (
                      <button
                        onClick={handleAddTier}
                        className="flex items-center gap-1.5 mt-3"
                        style={{ color: 'var(--jolly-primary)', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Plus size={14} /> Add tier (T{draft.tiers.length + 1})
                      </button>
                    ) : draft.tiers.length >= MAX_TIERS ? (
                      <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)', marginTop: '10px' }}>
                        Maximum of {MAX_TIERS} tiers reached.
                      </p>
                    ) : null}
                  </div>

                  {/* ── Cost Curve Preview ── */}
                  <div
                    className="mx-5 mb-5 p-4 rounded"
                    style={{ backgroundColor: 'var(--jolly-surface)', border: '1px solid var(--jolly-border)', borderRadius: '6px' }}
                  >
                    <p className="mb-3" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--jolly-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Cost Curve Preview
                    </p>
                    <CurveChart tiers={draft.tiers} height={80} />
                    <p style={{ fontSize: '11px', color: 'var(--jolly-text-disabled)', marginTop: '8px' }}>
                      Bar height proportional to unit cost — lower bars = better volume pricing.
                    </p>
                  </div>
                </div>

                {/* ── Danger zone (delete) ── */}
                {isAdmin && !draft.isDefault && (
                  <div
                    className="flex items-center justify-between px-5 py-4 rounded"
                    style={{
                      border: '1px solid #F5C6CB',
                      borderRadius: '6px',
                      backgroundColor: '#FFF5F5',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#C0392B' }}>Delete this template</p>
                      <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                        Existing products are not affected — only removes it from the template list.
                      </p>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(draft)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded"
                      style={{
                        border: '1px solid #F5C6CB', backgroundColor: 'white',
                        color: '#C0392B', fontSize: '13px', fontWeight: 600, cursor: 'pointer', height: '34px',
                      }}
                    >
                      <Trash2 size={13} /> Delete template
                    </button>
                  </div>
                )}

                {/* ── Info panel ── */}
                <div className="flex items-start gap-3 mt-5 p-4 rounded" style={{ backgroundColor: 'var(--jolly-surface)', border: '1px solid var(--jolly-border)', borderRadius: '6px' }}>
                  <Info size={15} style={{ color: 'var(--jolly-primary)', marginTop: '1px', flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--jolly-text-body)' }}>How templates work:</strong> In Add Product → Pricing, clicking
                    <em> "Apply Template"</em> shows all templates here. The <strong>default template</strong> is pre-applied automatically.
                    Changes here do not retroactively update existing products.
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--jolly-text-disabled)' }}>
                <TrendingDown size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <p style={{ fontSize: '14px', fontWeight: 600 }}>No template selected</p>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>Choose a template from the left panel to edit it.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          template={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
