'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { notificationAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Bell, BellOff, CheckCheck, AlertTriangle, Pill, Shield } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_ICON = {
  reminder:     { icon: Pill,          color: 'var(--clr-primary)' },
  missed:       { icon: AlertTriangle, color: 'var(--clr-warning)' },
  family_alert: { icon: AlertTriangle, color: 'var(--clr-danger)'  },
  verification: { icon: Shield,        color: 'var(--clr-success)' },
  system:       { icon: Bell,          color: 'var(--clr-muted)'   },
};

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tab, setTab] = useState('notifications');
  const [fetching, setFetching] = useState(true);

  const isStaff = ['caregiver', 'doctor', 'admin'].includes(user?.role);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    Promise.all([
      notificationAPI.getAll({ limit: 50 }),
      isStaff ? notificationAPI.getFamilyAlerts() : Promise.resolve({ data: { alerts: [] } }),
    ])
      .then(([nRes, aRes]) => {
        setNotifications(nRes.data.notifications);
        setAlerts(aRes.data.alerts);
      })
      .catch(() => toast.error('Could not load notifications.'))
      .finally(() => setFetching(false));
  }, [user]);

  const markAllRead = async () => {
    try {
      await notificationAPI.markRead([]);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read.');
    } catch {
      toast.error('Failed.');
    }
  };

  const resolveAlert = async (id) => {
    try {
      await notificationAPI.resolveAlert(id);
      setAlerts(prev => prev.filter(a => a._id !== id));
      toast.success('Alert resolved.');
    } catch {
      toast.error('Could not resolve.');
    }
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <AppShell title="Notifications">
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${tab === 'notifications' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setTab('notifications')}>
            Notifications {unread > 0 && (
              <span style={{
                background: 'var(--clr-danger)', color: '#fff',
                borderRadius: '50%', width: 18, height: 18, fontSize: '0.7rem',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{unread}</span>
            )}
          </button>
          {isStaff && (
            <button className={`btn ${tab === 'alerts' ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => setTab('alerts')}>
              Family Alerts {alerts.length > 0 && (
                <span style={{
                  background: 'var(--clr-danger)', color: '#fff',
                  borderRadius: '50%', width: 18, height: 18, fontSize: '0.7rem',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{alerts.length}</span>
              )}
            </button>
          )}
        </div>
        {tab === 'notifications' && unread > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : tab === 'notifications' ? (
        notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--clr-muted)' }}>
            <BellOff size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map(n => {
              const cfg = TYPE_ICON[n.type] || TYPE_ICON.system;
              const Icon = cfg.icon;
              return (
                <div key={n._id} className="card-sm" style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  borderLeft: n.isRead ? '2px solid transparent' : '2px solid var(--clr-primary)',
                  background: n.isRead ? 'var(--clr-surface)' : 'var(--clr-primary-lt)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.9rem', margin: 0 }}>{n.title}</p>
                    <p style={{ fontSize: '0.84rem', color: 'var(--clr-muted)', margin: '2px 0' }}>{n.body}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--clr-subtle)' }}>
                      {format(new Date(n.createdAt), 'dd MMM, hh:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        alerts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--clr-muted)' }}>
            <CheckCheck size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p>No active family alerts.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map(alert => (
              <div key={alert._id} className="card" style={{ borderLeft: '3px solid var(--clr-danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <span className="badge badge-danger" style={{ marginBottom: 8, textTransform: 'capitalize' }}>
                      {alert.alertType.replace('_', ' ')}
                    </span>
                    <p style={{ fontWeight: 700, marginTop: 4 }}>{alert.patient?.name}</p>
                    <p style={{ color: 'var(--clr-muted)', fontSize: '0.88rem', margin: '4px 0' }}>{alert.message}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--clr-subtle)' }}>
                      {format(new Date(alert.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                  <button className="btn btn-success btn-sm" onClick={() => resolveAlert(alert._id)}>
                    <CheckCheck size={14} /> Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </AppShell>
  );
}
