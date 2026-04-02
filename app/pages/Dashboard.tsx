import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { LeftSidebar } from '../components/LeftSidebar';
import { useRole } from '../context/RoleContext';
import { useDecoratorReview } from '../context/DecoratorReviewContext';
import { INITIAL_DECORATORS } from '../data/decoratorsSeed';
import {
  ArrowRight,
  Plus,
  Upload,
  Pencil,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// --- Data ---

type FilterTab = 'all' | 'decoration' | 'images' | 'pricing' | 'assets';

interface IncompleteProduct {
  id: string;
  name: string;
  missing: string[];
  category: string;
  supplier: string;
  lastUpdated: string;
  type: FilterTab[];
}

const incompleteProducts: IncompleteProduct[] = [
  { id: '1', name: 'Bamboo Pen Set', missing: ['Decoration specs', 'Assets'], category: 'Writing', supplier: "Leed's", lastUpdated: '3 days ago', type: ['decoration', 'assets'] },
  { id: '2', name: '5-Panel Cap Structured', missing: ['Decoration specs'], category: 'Headwear', supplier: 'Headwear AU', lastUpdated: '5 days ago', type: ['decoration'] },
  { id: '3', name: 'Classic Notebook A5', missing: ['Product image'], category: 'Stationery', supplier: 'JournalCo', lastUpdated: '1 week ago', type: ['images'] },
  { id: '4', name: 'Reusable Tote Natural', missing: ['Base pricing'], category: 'Bags', supplier: 'BagCo', lastUpdated: '2 days ago', type: ['pricing'] },
  { id: '5', name: 'Vacuum Flask 750ml', missing: ['Decoration specs', 'Product image'], category: 'Drinkware', supplier: 'DrinkTech', lastUpdated: '4 days ago', type: ['decoration', 'images'] },
  { id: '6', name: 'Cork Wireless Charger', missing: ['Assets', 'Pricing'], category: 'Tech', supplier: 'TechGear AU', lastUpdated: '6 days ago', type: ['assets', 'pricing'] },
  { id: '7', name: 'Recycled Lanyard 20mm', missing: ['Decoration specs'], category: 'Accessories', supplier: 'LanyardPro', lastUpdated: '1 week ago', type: ['decoration'] },
  { id: '8', name: 'Premium Metal Pen', missing: ['Product image', 'Assets'], category: 'Writing', supplier: "Leed's", lastUpdated: '3 days ago', type: ['images', 'assets'] },
];

const lifecycleData = [
  { name: 'Active', value: 5254, color: '#1F5C9E', percent: '72%' },
  { name: 'Draft', value: 312, color: '#AAAAAA', percent: '4%' },
  { name: 'Proposal-Only', value: 89, color: '#7C3AED', percent: '1%' },
  { name: 'Archived', value: 1599, color: '#D4D4D4', percent: '22%' },
];

const categoryData = [
  { name: 'Bags', count: 1240 },
  { name: 'Apparel', count: 1050 },
  { name: 'Drinkware', count: 890 },
  { name: 'Writing', count: 620 },
  { name: 'Tech', count: 510 },
  { name: 'Headwear', count: 440 },
  { name: 'Other', count: 504 },
];

const activityFeed = [
  { user: 'Alex K.', action: 'activated', target: '"Recycled Cotton Tote"', time: '2 hours ago', chip: null },
  { user: 'APPA sync', action: 'updated', target: '4,821 products', time: '4 hours ago', chip: 'APPA' },
  { user: 'Maria F.', action: 'updated margin floor for', target: '"Drinkware" category', time: 'Yesterday', chip: null },
  { user: null, action: '4 products archived (discontinued)', target: null, time: 'Yesterday', chip: null },
  { user: 'Tom B.', action: 'added custom product', target: '"Custom Embroidered Cap — Client X"', time: 'Yesterday', chip: null },
];

const tabCounts = {
  all: 73,
  decoration: 41,
  images: 31,
  pricing: 18,
  assets: 12,
};

// --- Circular Gauge Component ---
function CircularGauge({ value, size = 160 }: { value: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* Text */}
      <text
        x={size / 2}
        y={size / 2 - 6}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        style={{ fontSize: '42px', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {value}%
      </text>
      <text
        x={size / 2}
        y={size / 2 + 24}
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(255,255,255,0.7)"
        style={{ fontSize: '12px', fontWeight: 400, fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        complete
      </text>
    </svg>
  );
}

// --- Main Component ---
export function Dashboard() {
  const navigate = useNavigate();
  const { currentRole, setCurrentRole } = useRole();
  const { getDashboardReviewRows, dismissReviewAlert } = useDecoratorReview();
  const visiblePricingReviews = useMemo(
    () => getDashboardReviewRows(INITIAL_DECORATORS),
    [getDashboardReviewRows],
  );
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = incompleteProducts.filter((p) => {
    if (activeTab === 'all') return true;
    return p.type.includes(activeTab);
  });

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredProducts.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'decoration', label: 'Decoration' },
    { key: 'images', label: 'Images' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'assets', label: 'Assets' },
  ];

  const maxCategory = Math.max(...categoryData.map((d) => d.count));

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--jolly-bg)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <LeftSidebar currentRole={currentRole} onRoleChange={setCurrentRole} />

      <div className="flex-1 overflow-auto">
        {/* Greeting Bar */}
        <div
          className="bg-white border-b px-8 py-5"
          style={{ borderColor: 'var(--jolly-border)' }}
        >
          <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
            Good morning, Alex 👋
          </p>
          <p style={{ fontSize: '14px', color: 'var(--jolly-text-secondary)', marginTop: '2px' }}>
            Here's your catalogue health overview.
          </p>
        </div>

        <div className="p-8">
          {/* HERO — Overall Health Score */}
          <div
            className="rounded mb-6 px-8 py-6 flex items-center justify-between"
            style={{
              backgroundColor: 'var(--jolly-primary)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(31,92,158,0.25)',
            }}
          >
            {/* Left: Gauge */}
            <div className="flex items-center gap-6">
              <CircularGauge value={94} size={140} />
              <div>
                <p style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>
                  Catalogue Completeness
                </p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
                  4,939 of 5,254 active products fully complete
                </p>
              </div>
            </div>

            {/* Middle: Mini stat pills */}
            <div className="flex flex-col gap-2">
              {[
                '73 missing decoration specs',
                '31 missing images',
                '18 missing pricing',
              ].map((stat) => (
                <div
                  key={stat}
                  className="px-3 py-1.5 rounded"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {stat}
                </div>
              ))}
            </div>

            {/* Right: Link */}
            <button
              className="flex items-center gap-1.5"
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                whiteSpace: 'nowrap',
              }}
            >
              View all incomplete <ArrowRight size={14} />
            </button>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {/* Card 1 — Active Products */}
            <div
              className="bg-white rounded p-5"
              style={{
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Products
              </p>
              <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--jolly-primary)', lineHeight: '1', marginTop: '8px' }}>
                5,254
              </p>
              <p style={{ fontSize: '12px', color: 'var(--jolly-success)', marginTop: '8px', fontWeight: 500 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>▲ +12 this week</span>
              </p>
            </div>

            {/* Card 2 — Pending Review */}
            <div
              className="bg-white rounded p-5"
              style={{
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pending Review
              </p>
              <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--jolly-warning)', lineHeight: '1', marginTop: '8px' }}>
                18
              </p>
              <p style={{ fontSize: '12px', color: 'var(--jolly-warning)', marginTop: '8px', fontWeight: 500 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>▲ +3 today</span>
              </p>
            </div>

            {/* Card 3 — APPA Conflicts */}
            <div
              className="bg-white rounded p-5"
              style={{
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                APPA Conflicts
              </p>
              <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--jolly-warning)', lineHeight: '1', marginTop: '8px' }}>
                7
              </p>
              <button
                onClick={() => navigate('/appa-sync')}
                className="flex items-center gap-1 mt-2"
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--jolly-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Review now <ArrowRight size={13} />
              </button>
            </div>

            {/* Card 4 — Products Quoted */}
            <div
              className="bg-white rounded p-5"
              style={{
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Products Quoted (7d)
              </p>
              <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--jolly-text-disabled)', lineHeight: '1', marginTop: '8px' }}>
                412
              </p>
              <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)', marginTop: '8px', fontWeight: 400 }}>
                Informational
              </p>
            </div>
          </div>

          {/* Main Content — Two columns */}
          <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>
            {/* LEFT COLUMN (65%) */}
            <div className="flex flex-col gap-6" style={{ minWidth: 0, width: '65%' }}>
              {/* Incomplete Products Table */}
              <div
                className="bg-white rounded"
                style={{
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid var(--jolly-border)',
                }}
              >
                <div className="px-5 pt-5 pb-4">
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
                    Incomplete Products — Priority Fields
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)', marginTop: '4px' }}>
                    Products missing required fields that may affect quoting or production.
                  </p>

                  {/* Filter Tabs */}
                  <div className="flex gap-1 mt-4" style={{ borderBottom: '1px solid var(--jolly-border)', marginBottom: '-1px' }}>
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSelectedRows(new Set()); }}
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
                            checked={filteredProducts.length > 0 && selectedRows.size === filteredProducts.length}
                            onChange={toggleSelectAll}
                            className="cursor-pointer"
                            style={{ accentColor: 'var(--jolly-primary)' }}
                          />
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Product Name</th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Missing</th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Category</th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Supplier</th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Last Updated</th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jolly-text-secondary)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((row, i) => (
                        <tr
                          key={row.id}
                          style={{
                            backgroundColor: i % 2 === 0 ? '#FFFFFF' : 'var(--jolly-row-alt)',
                            borderTop: '1px solid var(--jolly-border)',
                            height: '48px',
                          }}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(row.id)}
                              onChange={() => toggleRow(row.id)}
                              className="cursor-pointer"
                              style={{ accentColor: 'var(--jolly-primary)' }}
                            />
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--jolly-text-body)' }}>
                            {row.name}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {row.missing.map((m) => (
                                <span
                                  key={m}
                                  className="px-2 py-0.5"
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    borderRadius: '4px',
                                    backgroundColor: 'var(--jolly-warning-bg)',
                                    color: 'var(--jolly-warning)',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)' }}>
                            {row.category}
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)' }}>
                            {row.supplier}
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: '13px', color: 'var(--jolly-text-disabled)' }}>
                            {row.lastUpdated}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              className="flex items-center gap-1 px-3 py-1 rounded transition-colors"
                              style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                backgroundColor: 'var(--jolly-primary)',
                                color: 'white',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                            >
                              Complete <ArrowRight size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bulk Actions & Pagination */}
                <div
                  className="px-5 py-3 flex items-center justify-between border-t"
                  style={{ borderColor: 'var(--jolly-border)', backgroundColor: 'var(--jolly-bg)' }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filteredProducts.length > 0 && selectedRows.size === filteredProducts.length}
                      onChange={toggleSelectAll}
                      className="cursor-pointer"
                      style={{ accentColor: 'var(--jolly-primary)' }}
                    />
                    <span style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)' }}>
                      {selectedRows.size > 0 ? `${selectedRows.size} selected` : 'Select all'}
                    </span>
                    {selectedRows.size > 0 && (
                      <select
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          height: '30px',
                          borderRadius: '4px',
                          border: '1px solid var(--jolly-border)',
                          padding: '0 8px',
                          color: 'var(--jolly-text-body)',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                        }}
                      >
                        <option>Assign to admin...</option>
                        <option>Alex K.</option>
                        <option>Maria F.</option>
                        <option>Tom B.</option>
                      </select>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '13px', color: 'var(--jolly-text-disabled)' }}>
                      Page {currentPage} of 10
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded border"
                      style={{
                        borderColor: 'var(--jolly-border)',
                        backgroundColor: 'white',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.4 : 1,
                      }}
                    >
                      <ChevronLeft size={16} style={{ color: 'var(--jolly-text-secondary)' }} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
                      disabled={currentPage === 10}
                      className="p-1 rounded border"
                      style={{
                        borderColor: 'var(--jolly-border)',
                        backgroundColor: 'white',
                        cursor: currentPage === 10 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 10 ? 0.4 : 1,
                      }}
                    >
                      <ChevronRight size={16} style={{ color: 'var(--jolly-text-secondary)' }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div
                className="bg-white rounded p-5"
                style={{
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid var(--jolly-border)',
                }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)', marginBottom: '16px' }}>
                  Recent Activity
                </h2>
                <div className="flex flex-col">
                  {activityFeed.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 relative" style={{ paddingBottom: i < activityFeed.length - 1 ? '20px' : '0' }}>
                      {/* Timeline dot and line */}
                      <div className="flex flex-col items-center flex-shrink-0" style={{ width: '16px' }}>
                        <div
                          className="rounded-full flex-shrink-0"
                          style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: item.chip === 'APPA' ? 'var(--jolly-primary)' : i % 2 === 0 ? 'var(--jolly-success)' : 'var(--jolly-accent)',
                            marginTop: '5px',
                          }}
                        />
                        {i < activityFeed.length - 1 && (
                          <div
                            style={{
                              width: '1px',
                              flex: 1,
                              backgroundColor: 'var(--jolly-border)',
                              marginTop: '4px',
                              minHeight: '20px',
                            }}
                          />
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '14px', color: 'var(--jolly-text-body)', lineHeight: '1.5' }}>
                          {item.user && (
                            <span style={{ fontWeight: 600 }}>{item.user}</span>
                          )}
                          {item.user && ' '}
                          {item.action}
                          {item.target && ' '}
                          {item.target && (
                            <span style={{ fontWeight: 500 }}>{item.target}</span>
                          )}
                          {item.chip && (
                            <span
                              className="inline-block ml-2 px-2 py-0.5 rounded"
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                borderRadius: '4px',
                                backgroundColor: 'var(--jolly-surface)',
                                color: 'var(--jolly-primary)',
                                verticalAlign: 'middle',
                              }}
                            >
                              {item.chip}
                            </span>
                          )}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--jolly-text-disabled)', marginTop: '2px' }}>
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (35%) */}
            <div className="flex flex-col gap-6" style={{ minWidth: 0, width: '35%' }}>
              {/* Lifecycle Status Breakdown */}
              <div
                className="bg-white rounded p-5"
                style={{
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid var(--jolly-border)',
                }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)', marginBottom: '16px' }}>
                  Lifecycle Status Breakdown
                </h2>
                <div className="flex flex-col items-center gap-5 xl:flex-row xl:items-center xl:gap-4">
                  {/* Donut Chart */}
                  <div className="flex-shrink-0">
                    <PieChart width={180} height={180}>
                      <Pie
                        data={lifecycleData}
                        cx={90}
                        cy={90}
                        innerRadius={52}
                        outerRadius={78}
                        dataKey="value"
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {lifecycleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-col gap-3 w-full xl:flex-1">
                    {lifecycleData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="flex-shrink-0"
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '3px',
                            backgroundColor: item.color,
                          }}
                        />
                        <div className="flex-1 flex items-baseline justify-between">
                          <span style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)' }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--jolly-text-body)' }}>
                            {item.value.toLocaleString()} <span style={{ fontWeight: 400, color: 'var(--jolly-text-disabled)', fontSize: '12px' }}>({item.percent})</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products by Category */}
              <div
                className="bg-white rounded p-5"
                style={{
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid var(--jolly-border)',
                }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)', marginBottom: '16px' }}>
                  Products by Category
                </h2>
                <div className="flex flex-col gap-3">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span
                        style={{
                          fontSize: '13px',
                          color: 'var(--jolly-text-secondary)',
                          width: '80px',
                          flexShrink: 0,
                          textAlign: 'right',
                        }}
                      >
                        {cat.name}
                      </span>
                      <div className="flex-1 relative" style={{ height: '20px', backgroundColor: 'var(--jolly-bg)', borderRadius: '4px' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${(cat.count / maxCategory) * 100}%`,
                            backgroundColor: 'var(--jolly-primary)',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--jolly-text-body)',
                          width: '48px',
                          flexShrink: 0,
                          textAlign: 'right',
                        }}
                      >
                        {cat.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div
                className="rounded p-5"
                style={{
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  border: '1px solid var(--jolly-border)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)', margin: 0 }}>
                    Pricing Reviews
                  </h2>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--jolly-warning)' }}>
                    {visiblePricingReviews.length} due
                  </span>
                </div>
                {visiblePricingReviews.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--jolly-text-secondary)', margin: 0 }}>
                    All decorator pricing reviews are up to date.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {visiblePricingReviews.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 rounded" style={{ border: '1px solid var(--jolly-border)', backgroundColor: item.status === 'overdue' ? '#FFFBFB' : '#FFFBEB' }}>
                        <div>
                          <button
                            onClick={() => navigate('/decorators')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600, color: 'var(--jolly-primary)', textDecoration: 'underline' }}
                          >
                            {item.decorator}
                          </button>
                          <p style={{ fontSize: '12px', margin: '2px 0 0', color: item.status === 'overdue' ? 'var(--jolly-destructive)' : 'var(--jolly-warning)' }}>
                            {item.dueLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => dismissReviewAlert(item.id)}
                          style={{ background: 'none', border: '1px solid var(--jolly-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', color: 'var(--jolly-text-secondary)', padding: '4px 8px' }}
                        >
                          Dismiss
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div
                className="rounded p-5"
                style={{
                  borderRadius: '6px',
                  backgroundColor: 'var(--jolly-bg)',
                  border: '1px solid var(--jolly-border)',
                }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--jolly-text-body)', marginBottom: '16px' }}>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Add new product', icon: <Plus size={16} />, path: '/products/new' },
                    { label: 'Bulk import', icon: <Upload size={16} />, path: '/bulk-import' },
                    { label: 'Manage decorators', icon: <Pencil size={16} />, path: '/decorators' },
                    { label: 'Run APPA sync', icon: <RefreshCw size={16} />, path: '/appa-sync' },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() => action.path && navigate(action.path)}
                      className="flex items-center gap-2 px-4 border rounded transition-colors"
                      style={{
                        height: '40px',
                        borderColor: 'var(--jolly-border)',
                        backgroundColor: 'white',
                        color: 'var(--jolly-primary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        justifyContent: 'flex-start',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--jolly-surface)';
                        e.currentTarget.style.borderColor = 'var(--jolly-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = 'var(--jolly-border)';
                      }}
                    >
                      {action.icon}
                      {action.label}
                    </button>
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