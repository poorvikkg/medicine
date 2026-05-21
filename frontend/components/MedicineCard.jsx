'use client';
import { Pill, Clock, CheckCircle2, XCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const statusConfig = {
  pending:  { badge: 'badge-info',    icon: Clock,         label: 'Upcoming' },
  taken:    { badge: 'badge-success', icon: CheckCircle2,  label: 'Taken' },
  missed:   { badge: 'badge-danger',  icon: XCircle,       label: 'Missed' },
  snoozed:  { badge: 'badge-warning', icon: Clock,         label: 'Snoozed' },
};

export default function MedicineCard({ log, showActions = false, onTake, status: forcedStatus }) {
  const medicine = log?.medicine || {};
  const statusKey = forcedStatus || log?.status || 'pending';
  const cfg = statusConfig[statusKey] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  const scheduledTime = log?.scheduledTime
    ? format(new Date(log.scheduledTime), 'hh:mm a')
    : '';

  return (
    <div className="medicine-card fade-in">
      {/* Image */}
      {medicine.medicineImage ? (
        <img
          src={medicine.medicineImage}
          alt={medicine.name}
          className="medicine-img"
        />
      ) : (
        <div className="medicine-img-placeholder">
          <Pill size={32} />
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{medicine.name || 'Unknown Medicine'}</h3>
          <span className={`badge ${cfg.badge}`}>
            <StatusIcon size={12} />
            {cfg.label}
          </span>
        </div>

        <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem', margin: '4px 0' }}>
          <strong>Dose:</strong> {medicine.dosage}
        </p>

        {medicine.instructions && (
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', margin: '2px 0' }}>
            <Info size={12} style={{ display: 'inline', marginRight: 4 }} />
            {medicine.instructions}
          </p>
        )}

        {scheduledTime && (
          <p style={{ color: 'var(--clr-text-subtle)', fontSize: '0.85rem', marginTop: 4 }}>
            <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
            Scheduled: {scheduledTime}
          </p>
        )}

        {/* Actions */}
        {showActions && statusKey === 'pending' && (
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-success btn-sm"
              onClick={onTake}
              id={`take-btn-${log?._id}`}
            >
              <CheckCircle2 size={16} />
              Mark as Taken
            </button>
            <Link
              href={`/verify?logId=${log?._id}`}
              className="btn btn-outline btn-sm"
            >
              📷 Verify
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
