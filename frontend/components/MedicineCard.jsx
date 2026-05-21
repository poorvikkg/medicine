'use client';
import { CheckCircle2, Clock, XCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const STATUS = {
  pending: { badge: 'badge-info',    icon: Clock,        label: 'Pending' },
  taken:   { badge: 'badge-success', icon: CheckCircle2, label: 'Taken' },
  missed:  { badge: 'badge-danger',  icon: XCircle,      label: 'Missed' },
  snoozed: { badge: 'badge-warning', icon: Clock,        label: 'Snoozed' },
};

export default function MedicineCard({ log, showActions = false, onTake, status: forced }) {
  const med = log?.medicine || {};
  const key = forced || log?.status || 'pending';
  const cfg = STATUS[key] || STATUS.pending;
  const Icon = cfg.icon;
  const time = log?.scheduledTime ? format(new Date(log.scheduledTime), 'hh:mm a') : '';

  return (
    <div className="medicine-card fade-in">
      {med.medicineImage ? (
        <img src={med.medicineImage} alt={med.name} className="medicine-img" />
      ) : (
        <div className="medicine-img-placeholder">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>{med.name || 'Unknown'}</h3>
          <span className={`badge ${cfg.badge}`}>
            <Icon size={11} /> {cfg.label}
          </span>
        </div>

        <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem', margin: '4px 0 2px' }}>
          {med.dosage}
          {med.dosageUnit ? ` · ${med.dosageUnit}` : ''}
        </p>

        {med.instructions && (
          <p style={{ color: 'var(--clr-muted)', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Info size={12} style={{ flexShrink: 0 }} /> {med.instructions}
          </p>
        )}

        {time && (
          <p style={{ color: 'var(--clr-subtle)', fontSize: '0.8rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> Scheduled {time}
          </p>
        )}

        {showActions && key === 'pending' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-success btn-sm" onClick={onTake} id={`take-${log?._id}`}>
              <CheckCircle2 size={14} /> Mark Taken
            </button>
            <Link href={`/verify?logId=${log?._id}`} className="btn btn-outline btn-sm">
              Verify
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
