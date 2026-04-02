import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LeftSidebar } from '../components/LeftSidebar';
import { useRole } from '../context/RoleContext';
import {
  CheckCircle,
  RefreshCw,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// --- Data ---

const syncHistoryChart = [
  { day: 'Feb 28', status: 'success', conflicts: 2 },
  { day: 'Mar 1', status: 'success', conflicts: 1 },
  { day: 'Mar 2', status: 'success', conflicts: 0 },
  { day: 'Mar 3', status: 'success', conflicts: 3 },
  { day: 'Mar 4', status: 'success', conflicts: 1 },
  { day: 'Mar 5', status: 'success', conflicts: 0 },
  { day: 'Mar 6', status: 'success', conflicts: 2 },
  { day: 'Mar 7', status: 'success', conflicts: 0 },
  { day: 'Mar 8', status: 'success', conflicts: 1 },
  { day: 'Mar 9', status: 'success', conflicts: 0 },
  { day: 'Mar 10', status: 'partial', conflicts: 12 },
  { day: 'Mar 11', status: 'success', conflicts: 3 },
  { day: 'Mar 12', status: 'success', conflicts: 3 },
  { day: 'Mar 13', status: 'success', conflicts: 7 },
];

const syncHistoryTable = [
  { date: 'Today 06:00', status: 'success', label: 'Success', products: '4,821', conflicts: 7, duration: '2m 14s' },
  { date: 'Yesterday', status: 'success', label: 'Success', products: '4,809', conflicts: 3, duration: '2m 08s' },
  { date: 'Mar 10', status: 'partial', label: 'Partial', products: '4,815', conflicts: 12, duration: '2m 31s' },
  { date: 'Mar 9', status: 'success', label: 'Success', products: '4,802', conflicts: 0, duration: '2m 05s' },
  { date: 'Mar 8', status: 'success', label: 'Success', products: '4,798', conflicts: 1, duration: '2m 11s' },
  { date: 'Mar 7', status: 'success', label: 'Success', products: '4,790', conflicts: 0, duration: '1m 59s' },
];

interface ConflictRow {
  id: string;
  product: string;
  field: string;
  catalogueValue: string;
  appaValue: string;
  age: string;
  type: 'price' | 'stock' | 'discontinued';
}

const conflictsData: ConflictRow[] = [
  { id: '1', product: 'Metro Tote Bag (Natural)', field: 'Base Cost', catalogueValue: '$4.20', appaValue: '$4.55', age: '2 days', type: 'price' },
  { id: '2', product: 'Classic Cap', field: 'Lead Time', catalogueValue: '7 days', appaValue: '14 days', age: '3 days', type: 'price' },
  { id: '3', product: 'Slim Bottle 500ml', field: 'Stock', catalogueValue: 'In Stock', appaValue: 'Out of Stock', age: '1 day', type: 'stock' },
  { id: '4', product: 'Premium Pen Set', field: 'Unit Cost', catalogueValue: '$2.80', appaValue: '$3.10', age: '2 days', type: 'price' },
  { id: '5', product: 'Canvas Messenger', field: 'MOQ', catalogueValue: '50', appaValue: '100', age: '4 days', type: 'stock' },
  { id: '6', product: 'Recycled Notepad A5', field: 'Base Cost', catalogueValue: '$1.40', appaValue: '$1.55', age: '1 day', type: 'price' },
  { id: '7', product: 'Bamboo USB Drive', field: 'Status', catalogueValue: 'Active', appaValue: 'Discontinued', age: '1 day', type: 'discontinued' },
];

const coverageData = [
  { label: 'APPA Sourced', percent: 60, color: '#1F5C9E' },
  { label: 'Manual', percent: 20, color: '#888888' },
  { label: 'Bespoke', percent: 12, color: '#B8D4EE' },
  { label: 'Custom / Proposal-Only', percent: 8, color: '#FFF8E1', borderColor: '#7B5800' },
];

type FilterTab = 'all' | 'price' | 'stock' | 'discontinued';

// --- Component ---

export function AppaSyncDashboard() {
  const navigate = useNavigate();
  const { currentRole, setCurrentRole } = useRole();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedConflicts, setSelectedConflicts] = useState<Set<string>>(new Set());
  const [resolvedConflicts, setResolvedConflicts] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);

  const filteredConflicts = conflictsData.filter((c) => {
    if (resolvedConflicts.has(c.id)) return false;
    if (activeTab === 'all') return true;
    return c.type === activeTab;
  });

  const unresolvedConflicts = conflictsData.filter(c => !resolvedConflicts.has(c.id));
  const tabCounts = {
    all: unresolvedConflicts.length,
    price: unresolvedConflicts.filter((c) => c.type === 'price').length,
    stock: unresolvedConflicts.filter((c) => c.type === 'stock').length,
    discontinued: unresolvedConflicts.filter((c) => c.type === 'discontinued').length,
  };

  const toggleSelect = (id: string) => {
    setSelectedConflicts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedConflicts.size === filteredConflicts.length) {
      setSelectedConflicts(new Set());
    } else {
      setSelectedConflicts(new Set(filteredConflicts.map((c) => c.id)));
    }
  };

  const resolveConflict = (id: string) => {
    setResolvedConflicts(prev => new Set(prev).add(id));
    setSelectedConflicts(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const bulkAccept = () => {
    setResolvedConflicts(prev => {
      const next = new Set(prev);
      selectedConflicts.forEach(id => next.add(id));
      return next;
    });
    setSelectedConflicts(new Set());
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 3000);
  };

  const chartBarColor = (status: string) => {
    if (status === 'success') return 'var(--jolly-success)';
    if (status === 'partial') return 'var(--jolly-warning)';
    return 'var(--jolly-destructive)';
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'price', label: 'Price' },
    { key: 'stock', label: 'Stock' },
    { key: 'discontinued', label: 'Discontinued' },
  ];

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--jolly-bg)' }}>
      <LeftSidebar currentRole={currentRole} onRoleChange={setCurrentRole} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div
          className="bg-white border-b px-8 py-5 flex items-center justify-between"
          style={{ borderColor: 'var(--jolly-border)' }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--jolly-text-body)', lineHeight: '1.3' }}>
              APPA Sync
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--jolly-text-secondary)', marginTop: '2px' }}>
              Promodata integration &middot; ~60% of catalogue
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 border transition-colors"
              style={{
                borderColor: 'var(--jolly-primary)',
                color: 'var(--jolly-primary)',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: 600,
                height: '36px',
                borderRadius: '6px',
                opacity: isSyncing ? 0.6 : 1,
                cursor: isSyncing ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isSyncing) e.currentTarget.style.backgroundColor = 'var(--jolly-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Run manual sync'}
            </button>
            <div className="flex items-center gap-1.5" style={{ fontSize: '13px', color: 'var(--jolly-text-disabled)' }}>
              <CheckCircle size={15} style={{ color: 'var(--jolly-success)' }} />
              <span>Last sync: Today at 06:00 AM</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Status Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {/* Card 1 - Sync Status */}
            <div
              className="bg-white rounded p-5"
              style={{
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
                borderLeft: '4px solid var(--jolly-success)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: '40px', height: '40px', backgroundColor: '#E8F5E9' }}
                >
                  <CheckCircle size={22} style={{ color: 'var(--jolly-success)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-success)' }}>
                    Last sync successful
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--jolly-text-body)', marginTop: '2px' }}>
                    Today, 06:00 AM AEDT
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)', marginTop: '6px' }}>
                    Next sync in 18 hours
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 - Products Synced */}
            <div
              className="bg-white rounded p-5"
              style={{
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
                borderLeft: '4px solid var(--jolly-primary)',
              }}
            >
              <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--jolly-primary)', lineHeight: '1' }}>
                4,821
              </p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)', marginTop: '6px' }}>
                Products updated this sync
              </p>
              <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)', marginTop: '6px' }}>
                <span style={{ color: 'var(--jolly-success)' }}>+12 new</span>
                {' '}&nbsp;|&nbsp;{' '}
                <span style={{ color: 'var(--jolly-text-disabled)' }}>3 removed</span>
              </p>
            </div>

            {/* Card 3 - Conflicts */}
            <div
              className="bg-white rounded p-5"
              style={{
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
                borderLeft: '4px solid var(--jolly-warning)',
              }}
            >
              <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--jolly-warning)', lineHeight: '1' }}>
                {tabCounts.all}
              </p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)', marginTop: '6px' }}>
                Unresolved conflicts
              </p>
              <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)', marginTop: '6px' }}>
                3 new since last review
              </p>
              <button
                onClick={() => {
                  const el = document.getElementById('conflicts-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1 mt-2"
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--jolly-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Review conflicts <ArrowRight size={13} />
              </button>
            </div>

            {/* Card 4 - Discontinued */}
            <div
              className="bg-white rounded p-5"
              style={{
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
                borderLeft: '4px solid var(--jolly-destructive)',
              }}
            >
              <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--jolly-destructive)', lineHeight: '1' }}>
                4
              </p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-text-body)', marginTop: '6px' }}>
                Newly discontinued
              </p>
              <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)', marginTop: '6px' }}>
                Products archived automatically
              </p>
              <button
                className="flex items-center gap-1 mt-2"
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--jolly-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                View archived <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Main Content — Two-column split */}
          <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>
            {/* LEFT COLUMN — Conflicts Table (60%) */}
            <div className="flex-[3]" id="conflicts-section">
              <div
                className="bg-white rounded"
                style={{
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid var(--jolly-border)',
                }}
              >
                {/* Header */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
                      Conflicts Requiring Review{' '}
                      <span style={{ color: 'var(--jolly-text-disabled)', fontWeight: 400 }}>({tabCounts.all})</span>
                    </h2>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-1" style={{ borderBottom: '1px solid var(--jolly-border)', marginBottom: '-1px' }}>
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSelectedConflicts(new Set()); }}
                        className="px-3 pb-2 transition-colors"
                        style={{
                          fontSize: '13px',
                          fontWeight: activeTab === tab.key ? 600 : 400,
                          color: activeTab === tab.key ? 'var(--jolly-primary)' : 'var(--jolly-text-secondary)',
                          borderBottom: activeTab === tab.key ? '2px solid var(--jolly-primary)' : '2px solid transparent',
                          background: 'none',
                          cursor: 'pointer',
                          borderTop: 'none',
                          borderLeft: 'none',
                          borderRight: 'none',
                        }}
                      >
                        {tab.label} ({tabCounts[tab.key]})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--jolly-header-bg)' }}>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)', width: '40px' }}>
                          <input
                            type="checkbox"
                            checked={filteredConflicts.length > 0 && selectedConflicts.size === filteredConflicts.length}
                            onChange={toggleSelectAll}
                            className="cursor-pointer"
                            style={{ accentColor: 'var(--jolly-primary)' }}
                          />
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Product</th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Field</th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Catalogue Value</th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>APPA Value</th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Age</th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConflicts.map((row, i) => (
                        <tr
                          key={row.id}
                          style={{
                            backgroundColor: i % 2 === 0 ? '#FFFFFF' : 'var(--jolly-row-alt)',
                            borderTop: '1px solid var(--jolly-border)',
                          }}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedConflicts.has(row.id)}
                              onChange={() => toggleSelect(row.id)}
                              className="cursor-pointer"
                              style={{ accentColor: 'var(--jolly-primary)' }}
                            />
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--jolly-text-body)' }}>
                            {row.product}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-0.5 rounded"
                              style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                borderRadius: '4px',
                                backgroundColor: row.type === 'price' ? 'var(--jolly-warning-bg)' : row.type === 'stock' ? 'var(--jolly-surface)' : 'var(--jolly-destructive-bg)',
                                color: row.type === 'price' ? 'var(--jolly-warning)' : row.type === 'stock' ? 'var(--jolly-primary)' : 'var(--jolly-destructive)',
                              }}
                            >
                              {row.field}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: '14px', color: 'var(--jolly-text-body)' }}>
                            {row.catalogueValue}
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--jolly-warning)' }}>
                            {row.appaValue}
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: '13px', color: 'var(--jolly-text-disabled)' }}>
                            {row.age}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => resolveConflict(row.id)}
                                className="px-3 py-1 rounded transition-colors"
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  backgroundColor: 'var(--jolly-primary)',
                                  color: 'white',
                                  borderRadius: '4px',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                              >
                                Accept APPA
                              </button>
                              <button
                                onClick={() => resolveConflict(row.id)}
                                className="px-3 py-1 rounded border transition-colors"
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  backgroundColor: 'white',
                                  color: 'var(--jolly-text-secondary)',
                                  borderColor: 'var(--jolly-border)',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--jolly-bg)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                              >
                                Keep Catalogue
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredConflicts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--jolly-text-disabled)', fontSize: '14px' }}>
                            No conflicts to review in this category.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bulk action bar */}
                {filteredConflicts.length > 0 && (
                  <div
                    className="px-5 py-3 flex items-center justify-between border-t"
                    style={{ borderColor: 'var(--jolly-border)', backgroundColor: 'var(--jolly-bg)' }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={filteredConflicts.length > 0 && selectedConflicts.size === filteredConflicts.length}
                        onChange={toggleSelectAll}
                        className="cursor-pointer"
                        style={{ accentColor: 'var(--jolly-primary)' }}
                      />
                      <span style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)' }}>
                        {selectedConflicts.size > 0 ? `${selectedConflicts.size} selected` : 'Select all'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={bulkAccept}
                        disabled={selectedConflicts.size === 0}
                        className="px-4 rounded transition-colors"
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          height: '32px',
                          backgroundColor: selectedConflicts.size > 0 ? 'var(--jolly-primary)' : 'var(--jolly-border)',
                          color: selectedConflicts.size > 0 ? 'white' : 'var(--jolly-text-disabled)',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: selectedConflicts.size > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Accept all APPA values
                      </button>
                      <button
                        onClick={() => {
                          selectedConflicts.forEach(id => resolveConflict(id));
                          setSelectedConflicts(new Set());
                        }}
                        disabled={selectedConflicts.size === 0}
                        className="px-4 rounded border transition-colors"
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          height: '32px',
                          backgroundColor: 'white',
                          color: selectedConflicts.size > 0 ? 'var(--jolly-text-secondary)' : 'var(--jolly-text-disabled)',
                          borderColor: 'var(--jolly-border)',
                          borderRadius: '4px',
                          cursor: selectedConflicts.size > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Dismiss all
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN — Sync History & Health (40%) */}
            <div className="flex-[2] flex flex-col gap-6">
              {/* Sync History Chart */}
              <div
                className="bg-white rounded p-5"
                style={{
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid var(--jolly-border)',
                }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)', marginBottom: '16px' }}>
                  Sync History{' '}
                  <span style={{ color: 'var(--jolly-text-disabled)', fontWeight: 400, fontSize: '14px' }}>(last 14 days)</span>
                </h2>

                <div style={{ width: '100%', height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={syncHistoryChart} barCategoryGap="20%">
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: '#888888' }}
                        axisLine={{ stroke: '#DCDFE6' }}
                        tickLine={false}
                        interval={2}
                      />
                      <YAxis hide />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #DCDFE6',
                          borderRadius: '6px',
                          fontSize: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'conflicts') return [`${value} conflicts`, 'Conflicts'];
                          return [value, name];
                        }}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Bar dataKey="conflicts" radius={[3, 3, 0, 0]} maxBarSize={24}>
                        {syncHistoryChart.map((entry, index) => (
                          <Cell key={`cell-${entry.day}-${index}`} fill={chartBarColor(entry.status)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* History Table */}
                <div className="mt-4">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--jolly-border)' }}>
                        <th className="pb-2 text-left" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-disabled)' }}>Date</th>
                        <th className="pb-2 text-left" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-disabled)' }}>Status</th>
                        <th className="pb-2 text-right" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-disabled)' }}>Updated</th>
                        <th className="pb-2 text-right" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-disabled)' }}>Conflicts</th>
                        <th className="pb-2 text-right" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--jolly-text-disabled)' }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncHistoryTable.map((row, i) => (
                        <tr key={i} style={{ borderBottom: i < syncHistoryTable.length - 1 ? '1px solid var(--jolly-border)' : 'none' }}>
                          <td className="py-2" style={{ fontSize: '13px', color: 'var(--jolly-text-body)' }}>{row.date}</td>
                          <td className="py-2">
                            <span className="flex items-center gap-1" style={{ fontSize: '12px', fontWeight: 600, color: row.status === 'success' ? 'var(--jolly-success)' : 'var(--jolly-warning)' }}>
                              {row.status === 'success' ? '✓' : '⚠'} {row.label}
                            </span>
                          </td>
                          <td className="py-2 text-right" style={{ fontSize: '13px', color: 'var(--jolly-text-body)' }}>{row.products}</td>
                          <td className="py-2 text-right" style={{ fontSize: '13px', color: row.conflicts > 5 ? 'var(--jolly-warning)' : 'var(--jolly-text-body)' }}>{row.conflicts}</td>
                          <td className="py-2 text-right" style={{ fontSize: '13px', color: 'var(--jolly-text-disabled)' }}>{row.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Coverage Breakdown */}
              <div
                className="bg-white rounded p-5"
                style={{
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid var(--jolly-border)',
                }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)', marginBottom: '16px' }}>
                  Coverage Breakdown
                </h2>

                {/* Stacked Bar */}
                <div className="flex rounded overflow-hidden" style={{ height: '28px', borderRadius: '6px' }}>
                  {coverageData.map((seg) => (
                    <div
                      key={seg.label}
                      className="flex items-center justify-center"
                      style={{
                        width: `${seg.percent}%`,
                        backgroundColor: seg.color,
                        border: seg.borderColor ? `1px solid ${seg.borderColor}` : 'none',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: seg.color === '#FFF8E1' ? seg.borderColor : (seg.color === '#B8D4EE' || seg.color === '#888888') ? 'white' : 'white',
                      }}
                    >
                      {seg.percent}%
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {coverageData.map((seg) => (
                    <div key={seg.label} className="flex items-center gap-2">
                      <div
                        className="flex-shrink-0"
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '3px',
                          backgroundColor: seg.color,
                          border: seg.borderColor ? `1px solid ${seg.borderColor}` : '1px solid rgba(0,0,0,0.08)',
                        }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--jolly-text-secondary)' }}>
                        {seg.label}{' '}
                        <span style={{ fontWeight: 600, color: 'var(--jolly-text-body)' }}>{seg.percent}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}