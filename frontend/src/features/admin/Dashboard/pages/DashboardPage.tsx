import {
  ArrowUpRight,
  ChevronDown,
  Sprout,
  TrendingUp,
  Package,
  Users,
  User,
  UserPlus,
  CheckCircle2,
  Box,
  Star,
  HardDrive,
} from 'lucide-react';
import { useAdminSession } from '../../Auth/hooks/useAdminSession';

const PRIMARY = '#4F46E5';
const CHART_STOPS = [
  { label: 'Mon', value: 4100 },
  { label: 'Tue', value: 5200 },
  { label: 'Wed', value: 4800 },
  { label: 'Thu', value: 6862 },
  { label: 'Fri', value: 6100 },
  { label: 'Sat', value: 7200 },
  { label: 'Sun', value: 6800 },
] as const;

function SalesAreaChart() {
  const w = 640;
  const h = 200;
  const padX = 8;
  const padY = 16;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const values = CHART_STOPS.map((d) => d.value);
  const minV = Math.min(...values) * 0.84;
  const maxV = Math.max(...values) * 1.08;
  const range = maxV - minV || 1;

  const points = CHART_STOPS.map((d, i) => {
    const x = padX + (innerW * i) / (CHART_STOPS.length - 1);
    const y = padY + innerH - ((d.value - minV) / range) * innerH;
    return { x, y, ...d };
  });

  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `${lineD} L ${points[points.length - 1].x.toFixed(1)},${h - padY} L ${points[0].x.toFixed(1)},${h - padY} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-[200px] overflow-visible"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PRIMARY} stopOpacity="0.22" />
          <stop offset="100%" stopColor={PRIMARY} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#salesFill)" />
      <path d={lineD} fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Tooltip marker — May 15 */}
      {points[3] ? (
        <g>
          <circle cx={points[3].x} cy={points[3].y} r="6" fill="white" stroke={PRIMARY} strokeWidth="2" />
          <rect
            x={points[3].x - 42}
            y={points[3].y - 36}
            width="84"
            height="26"
            rx="8"
            fill="#1F2937"
            opacity="0.95"
          />
          <text
            x={points[3].x}
            y={points[3].y - 19}
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="600"
          >
            {points[3].value.toLocaleString()} birds
          </text>
        </g>
      ) : null}
    </svg>
  );
}

const KPI_CARDS = [
  {
    title: 'Total Farms',
    value: '12',
    delta: '+8.4%',
    icon: Sprout,
    iconWrap: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    title: 'Active Farmers',
    value: '84',
    delta: '+6.1%',
    icon: Users,
    iconWrap: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Broilers in Stock',
    value: '48,320',
    delta: '+11.8%',
    icon: Package,
    iconWrap: 'bg-orange-500/10 text-orange-600',
  },
  {
    title: 'Ready for Sale',
    value: '12,740',
    delta: '+9.2%',
    icon: TrendingUp,
    iconWrap: 'bg-violet-500/10 text-violet-600',
  },
] as const;

const INVENTORY_ITEMS = [
  { name: 'Starter Feed', qty: '2,400 bags', price: '1,200 on hand', tone: 'bg-amber-200' },
  { name: 'Grower Feed', qty: '1,860 bags', price: '920 on hand', tone: 'bg-orange-200' },
  { name: 'Finisher Feed', qty: '1,420 bags', price: '680 on hand', tone: 'bg-lime-200' },
  { name: 'Vaccines', qty: '540 doses', price: '60 left', tone: 'bg-sky-200' },
  { name: 'Medicines', qty: '180 packs', price: '24 left', tone: 'bg-rose-200' },
] as const;

const RECENT_DELIVERIES = [
  { id: 'Batch #B-104', customer: 'Babu', date: 'Jun 28, 2026', amount: '3,840 birds', status: 'Completed' as const },
  { id: 'Batch #B-103', customer: 'Raju', date: 'Jun 27, 2026', amount: '2,910 birds', status: 'In Transit' as const },
  { id: 'Batch #B-102', customer: 'Soman', date: 'Jun 26, 2026', amount: '4,220 birds', status: 'Completed' as const },
  { id: 'Batch #B-101', customer: 'Gopi', date: 'Jun 25, 2026', amount: '1,780 birds', status: 'Pending' as const },
  { id: 'Batch #B-100', customer: 'Ramesan', date: 'Jun 24, 2026', amount: '3,160 birds', status: 'Completed' as const },
] as const;

const ACTIVITY = [
  { Icon: UserPlus, text: 'New broiler batch arrived at Farm 3', time: '2 min ago', wrap: 'bg-blue-50 text-blue-600' },
  { Icon: CheckCircle2, text: 'Feed delivery completed for Farm 1', time: '15 min ago', wrap: 'bg-emerald-50 text-emerald-600' },
  { Icon: Box, text: 'Birds transferred to grow-out house', time: '1 hour ago', wrap: 'bg-violet-50 text-violet-600' },
  { Icon: Star, text: 'Veterinary inspection completed', time: '2 hours ago', wrap: 'bg-amber-50 text-amber-600' },
  { Icon: HardDrive, text: 'Daily farm report submitted', time: '4 hours ago', wrap: 'bg-gray-100 text-gray-600' },
] as const;

function statusPill(status: (typeof RECENT_DELIVERIES)[number]['status']) {
  const map = {
    Completed: 'bg-emerald-50/80 text-emerald-800',
    'In Transit': 'bg-sky-50/80 text-sky-800',
    Pending: 'bg-amber-50/80 text-amber-800',
  } as const;
  return map[status];
}

export default function DashboardPage() {
  const { admin } = useAdminSession();
  const greetName = admin?.name?.trim().split(/\s+/u)[0] || 'Admin';

  return (
    <div className="space-y-10 lg:space-y-12 pb-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div className="max-w-xl">
          <h1 className="text-xl sm:text-[1.35rem] font-semibold text-gray-900 tracking-tight">
            Welcome back, {greetName}
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-normal leading-relaxed">
            Here&apos;s what&apos;s happening on your broiler farm today.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200/90 bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50/80 transition-colors self-start shrink-0"
        >
          Jun 23 – Jun 29, 2026
          <ChevronDown size={16} className="text-gray-400" strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
        {KPI_CARDS.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-gray-200/70 p-6 lg:p-7 hover:border-gray-300/80 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">{card.title}</p>
                <p className="text-xl font-semibold text-gray-900 mt-3 tracking-tight tabular-nums">{card.value}</p>
                <div className="flex items-center gap-1 mt-4 text-[13px] font-medium text-emerald-600">
                  <ArrowUpRight size={15} strokeWidth={2} />
                  {card.delta}
                </div>
              </div>
              <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconWrap}`}>
                <card.icon size={19} strokeWidth={1.75} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        <div className="xl:col-span-7 bg-white rounded-xl border border-gray-200/70 p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-[15px] font-semibold text-gray-900">Bird growth trend</h2>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200/80 text-[13px] font-medium text-gray-600 bg-gray-50/50 hover:bg-gray-50 transition-colors self-start"
            >
              This week
              <ChevronDown size={15} className="text-gray-400" />
            </button>
          </div>
          <div className="pt-2 -mx-1">
            <SalesAreaChart />
          </div>
          <div className="flex justify-between text-[11px] font-medium text-gray-400 mt-4 px-0.5">
            {CHART_STOPS.map((d) => (
              <span key={d.label}>{d.label}</span>
            ))}
          </div>
        </div>

        <div className="xl:col-span-5 bg-white rounded-xl border border-gray-200/70 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-semibold text-gray-900">Feed &amp; supplies</h2>
            <button type="button" className="text-[13px] font-medium text-gray-600 hover:text-gray-900">
              View all
            </button>
          </div>
          <ul className="space-y-5">
            {INVENTORY_ITEMS.map((p) => (
              <li key={p.name} className="flex items-center gap-4">
                <div className={`size-10 rounded-lg shrink-0 ${p.tone} opacity-80`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-[12px] text-gray-500 mt-1">{p.qty}</p>
                </div>
                <span className="text-[13px] font-medium text-gray-900 shrink-0 tabular-nums">{p.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        <div className="xl:col-span-7 bg-white rounded-xl border border-gray-200/70 overflow-hidden">
          <div className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-gray-100">
            <h2 className="text-[15px] font-semibold text-gray-900">Recent deliveries</h2>
            <button type="button" className="text-[13px] font-medium text-gray-600 hover:text-gray-900">
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[32rem]">
              <thead>
                <tr className="text-left text-[11px] font-medium uppercase tracking-wide text-gray-400 bg-gray-50/60">
                  <th className="px-6 lg:px-8 py-3.5 font-medium">Batch</th>
                  <th className="px-4 py-3.5 font-medium">Farmer</th>
                  <th className="px-4 py-3.5 font-medium">Date</th>
                  <th className="px-4 py-3.5 font-medium">Weight</th>
                  <th className="px-6 lg:px-8 py-3.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {RECENT_DELIVERIES.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 lg:px-8 py-4 font-medium text-gray-900">{row.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="size-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <User size={13} strokeWidth={1.75} />
                        </span>
                        <span className="font-medium text-gray-800">{row.customer}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{row.date}</td>
                    <td className="px-4 py-4 font-medium text-gray-900 tabular-nums">{row.amount}</td>
                    <td className="px-6 lg:px-8 py-4 text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-medium ${statusPill(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-5 bg-white rounded-xl border border-gray-200/70 p-6 lg:p-8">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-6">Recent activity</h2>
          <ul className="space-y-0 relative">
            <span className="absolute left-[13px] top-2 bottom-2 w-px bg-gray-100" aria-hidden />
            {ACTIVITY.map((a) => (
              <li key={a.text} className="flex gap-4 relative">
                <span
                  className={`relative z-[1] size-7 rounded-full ring-4 ring-white flex items-center justify-center shrink-0 mt-0.5 ${a.wrap}`}
                  aria-hidden
                >
                  <a.Icon size={13} strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                  <p className="text-[13px] font-medium text-gray-900">{a.text}</p>
                  <p className="text-[12px] text-gray-400 mt-1">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
