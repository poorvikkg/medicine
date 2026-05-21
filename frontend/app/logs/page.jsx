'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { logAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Clock, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const STATUS = {
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
    Promise.resolve().then(() => setFetching(true));
    const params = { patientId: user._id, limit: 60 };
    if (filter !== 'all') params.status = filter;
    logAPI.getAll(params)
      .then(r => setLogs(r.data.logs))
      .catch(() => toast.error('Could not load history.'))
      .finally(() => {
        Promise.resolve().then(() => setFetching(false));
      });
  }, [user, filter]);

  const filters = ['all', 'taken', 'missed', 'pending'];

  return (
    <AppShell title="Dose History">
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--clr-muted)' }}>
          <ClipboardList size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p>{filter === 'all' ? 'Your dose history will appear here.' : `No ${filter} doses found.`}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map(log => {
            const cfg = STATUS[log.status] || STATUS.pending;
            const Icon = cfg.icon;
            const med = log.medicine || {};
            return (
              <div key={log._id} className="card-sm" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: log.status === 'taken' ? 'var(--clr-success-lt)' : log.status === 'missed' ? 'var(--clr-danger-lt)' : 'var(--clr-primary-lt)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={log.status === 'taken' ? 'var(--clr-success)' : log.status === 'missed' ? 'var(--clr-danger)' : 'var(--clr-primary)'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{med.name || 'Unknown'}</span>
                    <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--clr-muted)', margin: '2px 0' }}>
                    {med.dosage} · {log.scheduledTime ? format(new Date(log.scheduledTime), 'dd MMM, hh:mm a') : ''}
                  </p>
                  {log.takenTime && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--clr-success)' }}>
                      Taken at {format(new Date(log.takenTime), 'hh:mm a')}
                    </p>
                  )}
                </div>
                {log.status === 'pending' && (
                  <Link href={`/verify?logId=${log._id}`} className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
                    Verify
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
