import React, { useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Clock,
  FileDown,
  Globe,
  Image as ImageIcon,
  Inbox,
  IndianRupee,
  MessageSquare,
  RefreshCw,
  Scissors,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react';
import { BarChart, RankedBars } from './Charts';

const RANGES = [
  { id: '7', label: 'Last 7 days' },
  { id: '30', label: 'Last 30 days' },
  { id: '90', label: 'Last 90 days' },
  { id: 'all', label: 'All time' }
];

const rupees = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;
const compactRupees = (n) => {
  const v = Number(n) || 0;
  if (v >= 100000) return `₹${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `₹${v}`;
};
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// "+3 vs previous period" pill; hidden when there is nothing to compare against
function Delta({ current, previous, format = (v) => v }) {
  if (previous === null || previous === undefined) return <span>All recorded data</span>;
  const diff = current - previous;
  if (diff === 0) return <span className="pro-trend-pill neutral"><span>Same as previous period</span></span>;
  const up = diff > 0;
  return (
    <span className={`pro-trend-pill ${up ? 'up' : 'down'}`}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      <span>{up ? '+' : '−'}{format(Math.abs(diff))} vs previous period</span>
    </span>
  );
}

function Kpi({ label, value, icon, tone = 'gold', meta, onClick, title, valueColor }) {
  return (
    <div
      className={`pro-kpi-card ${onClick ? 'interactive' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={title}
    >
      <div className="pro-kpi-top">
        <span className="pro-kpi-label">{label}</span>
        <div className={`pro-kpi-icon-wrap ${tone}`}>{icon}</div>
      </div>
      <div className="pro-kpi-value" style={valueColor ? { color: valueColor } : undefined}>{value}</div>
      <div className="pro-kpi-meta">{meta}</div>
    </div>
  );
}

function ChartCard({ icon, title, subtitle, action, children }) {
  return (
    <div className="pro-card">
      <div className="pro-card-header">
        <div className="pro-card-title-group">
          {icon}
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="pro-card-body">{children}</div>
    </div>
  );
}

export default function DashboardOverview({ analytics, range, onRangeChange, loading, error, onRefresh, onOpenTab, actions }) {
  const [trendMetric, setTrendMetric] = useState('bookings');

  if (!analytics) {
    return (
      <div className="pro-card">
        <div className="pro-card-body chart-empty" style={{ height: 220, flexDirection: 'column', gap: 12 }}>
          <span>{error || 'Loading dashboard figures…'}</span>
          {error && (
            <button className="pro-btn pro-btn-secondary pro-btn-sm" onClick={onRefresh}>
              <RefreshCw size={13} />
              <span>Try again</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const k = analytics.kpis;
  const rangeLabel = RANGES.find(r => r.id === range)?.label.toLowerCase() || 'all time';
  const periodWord = range === 'all' ? 'all time' : `the ${rangeLabel}`;
  const icon = (Component) => <Component size={18} />;

  return (
    <div>
      {/* Range filter: one row, above everything it scopes */}
      <div className="pro-quick-actions-bar" style={{ marginBottom: 20 }}>
        <span className="pro-quick-actions-label">Period:</span>
        {RANGES.map(pill => (
          <button
            key={pill.id}
            className={`pro-pill-filter ${range === pill.id ? 'active' : ''}`}
            onClick={() => onRangeChange(pill.id)}
            aria-pressed={range === pill.id}
          >
            {pill.label}
          </button>
        ))}
        <button className="pro-quick-btn" style={{ marginLeft: 'auto' }} onClick={onRefresh} title="Reload the latest figures">
          <RefreshCw size={14} className={loading ? 'chart-spin' : ''} />
          <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
        </button>
      </div>

      {/* Needs attention today (independent of the period) */}
      <div className="dash-section-label">Today and coming up</div>
      <div className="pro-kpi-grid">
        <Kpi
          label="Today's appointments"
          value={k.todayAppointments}
          icon={icon(Clock)}
          meta={<span>{plural(k.next7Days, 'appointment')} in the next 7 days</span>}
          onClick={() => onOpenTab('bookings', { search: analytics.today })}
          title="Open today's appointments"
        />
        <Kpi
          label="Awaiting confirmation"
          value={k.pendingConfirmation}
          tone="amber"
          icon={icon(AlertCircle)}
          valueColor={k.pendingConfirmation > 0 ? 'var(--adm-warning-text)' : undefined}
          meta={<span>{k.overdue > 0 ? `${plural(k.overdue, 'past appointment')} still open` : 'Upcoming requests to confirm'}</span>}
          onClick={() => onOpenTab('bookings', { filter: 'pending' })}
          title="Open pending appointments"
        />
        <Kpi
          label="Upcoming booked value"
          value={rupees(k.pipelineValue)}
          icon={icon(CalendarCheck)}
          meta={<span>Pending and confirmed, from today</span>}
          onClick={() => onOpenTab('bookings', {})}
          title="Open appointments"
        />
        <Kpi
          label="New leads to answer"
          value={k.newLeadsOpen}
          tone="purple"
          icon={icon(Inbox)}
          meta={<span>Enquiries not yet contacted</span>}
          onClick={() => onOpenTab('leads', { status: 'new' })}
          title="Open new leads"
        />
      </div>

      <div className="dash-section-label">Performance · {rangeLabel}</div>
      <div className="pro-kpi-grid">
        <Kpi
          label="Bookings received"
          value={k.bookingsReceived}
          icon={icon(CalendarDays)}
          meta={<Delta current={k.bookingsReceived} previous={k.bookingsReceivedPrev} />}
        />
        <Kpi
          label="Revenue earned"
          value={rupees(k.revenueEarned)}
          tone="green"
          icon={icon(IndianRupee)}
          meta={<span>{plural(k.completedVisits, 'completed visit')}</span>}
          title="Total of appointments marked completed in this period"
        />
        <Kpi
          label="Booked value"
          value={rupees(k.bookedValue)}
          icon={icon(BarChart3)}
          meta={<span>Average {rupees(k.averageTicket)} per booking</span>}
          title="Value of all bookings received in this period, excluding cancellations"
        />
        <Kpi
          label="Leads received"
          value={k.leadsReceived}
          tone="purple"
          icon={icon(MessageSquare)}
          meta={k.leadConversionRate === null
            ? <span>No leads in this period</span>
            : <span>{k.leadConversionRate}% converted to bookings</span>}
        />
        <Kpi
          label="New clients"
          value={k.newClients}
          tone="green"
          icon={icon(Users)}
          meta={<span>{plural(k.totalClients, 'client')} in the directory</span>}
          onClick={() => onOpenTab('customers', {})}
          title="Open the client directory"
        />
        <Kpi
          label="Cancellation rate"
          value={k.cancellationRate === null ? '—' : `${k.cancellationRate}%`}
          tone="amber"
          icon={icon(AlertCircle)}
          meta={<span>Of bookings that have been actioned</span>}
        />
      </div>

      {/* Quick actions */}
      <div className="pro-quick-actions-bar">
        <span className="pro-quick-actions-label">Quick Actions:</span>
        <button className="pro-quick-btn" onClick={actions.newBooking}><Calendar size={14} /><span>Schedule Appointment</span></button>
        <button className="pro-quick-btn" onClick={actions.newLead}><MessageSquare size={14} /><span>Log WhatsApp Lead</span></button>
        <button className="pro-quick-btn" onClick={actions.newCustomer}><Users size={14} /><span>Add Client Profile</span></button>
        <button className="pro-quick-btn" onClick={actions.openMedia}><ImageIcon size={14} /><span>Update Webpage Media</span></button>
        <button className="pro-quick-btn" onClick={actions.exportBookings}><FileDown size={14} /><span>Export Bookings (CSV)</span></button>
      </div>

      {/* Trend + service mix */}
      <div className="pro-grid-3">
        <ChartCard
          icon={<BarChart3 size={18} style={{ color: 'var(--adm-primary)' }} />}
          title={trendMetric === 'bookings' ? 'Bookings received' : 'Booked value'}
          subtitle={`Per ${analytics.trendBucket}, by the date each booking was made · ${rangeLabel}`}
          action={(
            <div className="chart-toggle" role="group" aria-label="Chart measure">
              <button className={trendMetric === 'bookings' ? 'active' : ''} aria-pressed={trendMetric === 'bookings'} onClick={() => setTrendMetric('bookings')}>Bookings</button>
              <button className={trendMetric === 'value' ? 'active' : ''} aria-pressed={trendMetric === 'value'} onClick={() => setTrendMetric('value')}>Value</button>
            </div>
          )}
        >
          <BarChart
            data={analytics.trend}
            valueKey={trendMetric}
            isCount={trendMetric === 'bookings'}
            format={trendMetric === 'bookings' ? (v) => v : compactRupees}
            tooltipRows={(d) => [[d.bookings, d.bookings === 1 ? 'booking' : 'bookings'], [rupees(d.value), 'booked']]}
            ariaLabel={`Bar chart of ${trendMetric === 'bookings' ? 'bookings received' : 'booked value'} per ${analytics.trendBucket}`}
            emptyText={`No bookings were received in ${periodWord}.`}
          />
        </ChartCard>

        <ChartCard
          icon={<Scissors size={18} style={{ color: 'var(--adm-primary)' }} />}
          title="Most booked treatments"
          subtitle={`Share of bookings · ${rangeLabel}`}
        >
          <RankedBars
            rows={analytics.serviceMix}
            secondary={(row, share) => `${share}% · ${rupees(row.value)}`}
            emptyText={`No bookings in ${periodWord}.`}
          />
        </ChartCard>
      </div>

      {/* Schedule load + booking status */}
      <div className="pro-grid-3">
        <ChartCard
          icon={<CalendarDays size={18} style={{ color: 'var(--adm-primary)' }} />}
          title="Schedule for the next 14 days"
          subtitle="Appointments per day, pending and confirmed"
        >
          <BarChart
            data={analytics.schedule}
            valueKey="bookings"
            height={170}
            tooltipRows={(d) => [[d.confirmed, 'confirmed'], [d.pending, 'pending'], [rupees(d.value), 'booked']]}
            ariaLabel="Bar chart of appointments per day for the next 14 days"
            emptyText="No appointments are scheduled in the next 14 days."
          />
        </ChartCard>

        <ChartCard
          icon={<CalendarCheck size={18} style={{ color: 'var(--adm-primary)' }} />}
          title="Booking status"
          subtitle={`Bookings received · ${rangeLabel}`}
        >
          <RankedBars
            rows={analytics.statusBreakdown}
            capitalize
            secondary={(row, share) => `${share}% · ${rupees(row.value)}`}
            emptyText={`No bookings in ${periodWord}.`}
          />
        </ChartCard>
      </div>

      {/* Demand patterns + leads */}
      <div className="pro-grid-4">
        <ChartCard
          icon={<Clock size={18} style={{ color: 'var(--adm-primary)' }} />}
          title="Popular time slots"
          subtitle={`Bookings by start time · ${rangeLabel}`}
        >
          <RankedBars rows={analytics.timeSlots} emptyText={`No bookings in ${periodWord}.`} />
        </ChartCard>

        <ChartCard
          icon={<CalendarDays size={18} style={{ color: 'var(--adm-primary)' }} />}
          title="Busiest days of the week"
          subtitle={`Bookings by appointment day · ${rangeLabel}`}
        >
          <BarChart
            data={analytics.weekdays.map(d => ({ ...d, key: d.label }))}
            valueKey="count"
            height={150}
            tooltipRows={(d) => [[d.count, d.count === 1 ? 'booking' : 'bookings'], [rupees(d.value), 'booked']]}
            ariaLabel="Bar chart of bookings by day of the week"
            emptyText={`No bookings in ${periodWord}.`}
          />
        </ChartCard>

        <ChartCard
          icon={<Globe size={18} style={{ color: 'var(--adm-primary)' }} />}
          title="Where leads come from"
          subtitle={`Enquiries by channel · ${rangeLabel}`}
        >
          <RankedBars rows={analytics.leadSources} capitalize emptyText={`No leads in ${periodWord}.`} />
        </ChartCard>

        <ChartCard
          icon={<Inbox size={18} style={{ color: 'var(--adm-primary)' }} />}
          title="Lead pipeline"
          subtitle={`Enquiries by stage · ${rangeLabel}`}
        >
          <RankedBars rows={analytics.leadPipeline} capitalize emptyText={`No leads in ${periodWord}.`} />
        </ChartCard>
      </div>
    </div>
  );
}
