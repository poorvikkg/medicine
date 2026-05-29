'use client';
import { CheckCircle2, Clock, XCircle, Info, Volume2 } from 'lucide-react';
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

  const speakDetails = (e) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const text = `${med.name || 'Medicine'}. Dose: ${med.dosage}. Instructions: ${med.instructions || 'No special instructions'}. Scheduled for ${time}. Status is: ${cfg.label}.`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    u.rate = 0.85; // Slower speech rate for better clarity.
    window.speechSynthesis.speak(u);
  };

  return (
    <div className={`medicine-card card-${key}`} style={{ border: '3px solid #000000', padding: '24px' }}>
      {med.medicineImage ? (
        <img src={med.medicineImage} alt={med.name} className="medicine-img" style={{ width: '100px', height: '100px', border: '3px solid #000000' }} />
      ) : (
        <div className="medicine-img-placeholder" style={{ width: '100px', height: '100px', border: '3px solid #000000' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{med.name || 'Unknown Medicine'}</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button 
              onClick={speakDetails} 
              className="btn btn-outline btn-sm"
              style={{ padding: '6px 12px', display: 'inline-flex', gap: 6, fontSize: '0.95rem', border: '2px solid #000000' }}
              aria-label="Hear medicine details"
              title="Hear medicine details"
            >
              <Volume2 size={16} color="#000000" /> LISTEN
            </button>
            <span className={`badge ${cfg.badge}`} style={{ fontSize: '1.0rem', padding: '6px 12px', border: '2px solid #000000', fontWeight: 'bold' }}>
              {cfg.label.toUpperCase()}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '1.3rem', fontWeight: 700, margin: '6px 0', color: '#000000' }}>
          Dose: {med.dosage} {med.dosageUnit ? `(${med.dosageUnit})` : ''}
        </p>

        {med.instructions && (
          <p style={{ fontSize: '1.15rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, color: '#000000', fontWeight: 'bold' }}>
            <Info size={18} color="#000000" style={{ flexShrink: 0 }} /> Instructions: {med.instructions}
          </p>
        )}

        {time && (
          <p style={{ fontSize: '1.15rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, color: '#000000' }}>
            <Clock size={18} color="#000000" /> Take at: {time}
          </p>
        )}

        {showActions && (key === 'pending' || key === 'missed') && (
          <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={onTake} id={`take-${log?._id}`} style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
              {key === 'missed' ? 'MARK AS TAKEN' : 'I TOOK THIS'}
            </button>
            <Link href={`/verify?logId=${log?._id}`} className="btn btn-outline btn-sm" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
              CHECK PILL
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
