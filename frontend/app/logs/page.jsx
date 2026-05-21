'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { logAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Clock, ClipboardList, Shield } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const statusConfig = {
  taken:   { badge: 'badge-success', icon: CheckCircle2, label: 'Taken' },
  missed:  { badge: 'badge-danger',  icon: XCircle,      label: 'Missed' },
  pending: { badge: 'badge-info',    icon: Clock,         label: 'Pending' },
  snoozed: { badge: 'badge-warning', icon: Clock,         label: 'Snoozed' },
};

export default function LogsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    const params = { patientId: user._id, limit: 60 };
    if (filter !== 'all') params.status = filter;
    logAPI.getAll(params)
      .then(r => setLogs(r.data.logs))
      .catch(() => toast.error('Could not load history'))
      .finally(() => setFetching(false));
  }, [user, filter]);

  return (
    <AppShell title="Dose History">
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all','taken','missed','pending'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <ClipboardList size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <h3>No records found</h3>
          <p style={{ color: 'var(--clr-text-muted)', marginTop: 8 }}>
            {filter === 'all' ? 'Your dose history will appear here.' : `No ${filter} doses found.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {logs.map((log) => {
            const cfg = statusConfig[log.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            const med = log.medicine || {};
            return (
              <div key={log._id} className="card-sm" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {/* Status icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: log.status === 'taken' ? 'var(--clr-success-light)' : log.status === 'missed' ? 'var(--clr-danger-light)' : 'var(--clr-primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <StatusIcon size={22} color={
                    log.status === 'taken' ? 'var(--clr-success)' : log.status === 'missed' ? 'var(--clr-danger)' : 'var(--clr-primary)'
                  } />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700 }}>{med.name || 'Unknown'}</span>
                    <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--clr-text-muted)', margin: '2px 0' }}>
                    {med.dosage} &nbsp;·&nbsp;
                    Scheduled: {log.scheduledTime ? format(new Date(log.scheduledTime), 'dd MMM, hh:mm a') : '—'}
                  </p>
                  {log.takenTime && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--clr-success)' }}>
                      ✓ Taken at {format(new Date(log.takenTime), 'hh:mm a')}
                    </p>
                  )}
                </div>

                {/* Verify link for pending */}
                {log.status === 'pending' && (
                  <Link href={`/verify?logId=${log._id}`} className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
                    <Shield size={14} /> Verify
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
