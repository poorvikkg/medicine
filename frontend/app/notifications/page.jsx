'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { notificationAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Bell, BellOff, CheckCheck, AlertTriangle, Pill, Shield } from 'lucide-react';
import { format } from 'date-fns';

const typeIcon = {
  reminder:      { Icon: Pill,          color: 'var(--clr-primary)' },
  missed:        { Icon: AlertTriangle, color: 'var(--clr-warning)' },
  family_alert:  { Icon: AlertTriangle, color: 'var(--clr-danger)' },
  verification:  { Icon: Shield,        color: 'var(--clr-success)' },
  system:        { Icon: Bell,          color: 'var(--clr-text-muted)' },
};

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tab, setTab] = useState('notifications');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    const isCaregiver = ['caregiver','doctor','admin'].includes(user.role);
    Promise.all([
      notificationAPI.getAll({ limit: 50 }),
      isCaregiver ? notificationAPI.getFamilyAlerts() : Promise.resolve({ data: { alerts: [] } }),
    ])
      .then(([nRes, aRes]) => {
        setNotifications(nRes.data.notifications);
        setAlerts(aRes.data.alerts);
      })
      .catch(() => toast.error('Could not load notifications'))
      .finally(() => setFetching(false));
  }, [user]);

  const markAllRead = async () => {
    try {
      await notificationAPI.markRead([]);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed to mark as read'); }
  };

  const resolveAlert = async (id) => {
    try {
      await notificationAPI.resolveAlert(id);
      setAlerts(prev => prev.filter(a => a._id !== id));
      toast.success('Alert resolved');
    } catch { toast.error('Could not resolve alert'); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isCaregiver = ['caregiver','doctor','admin'].includes(user?.role);

  return (
    <AppShell title="Notifications">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`btn ${tab === 'notifications' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('notifications')}>
            <Bell size={16} /> Notifications {unreadCount > 0 && <span className="badge badge-danger" style={{ padding: '2px 7px', fontSize: '0.75rem' }}>{unreadCount}</span>}
          </button>
          {isCaregiver && (
            <button className={`btn ${tab === 'alerts' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('alerts')}>
              <AlertTriangle size={16} /> Family Alerts {alerts.length > 0 && <span className="badge badge-danger" style={{ padding: '2px 7px', fontSize: '0.75rem' }}>{alerts.length}</span>}
            </button>
          )}
        </div>
        {tab === 'notifications' && unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : tab === 'notifications' ? (
        notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <BellOff size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <h3>No notifications yet</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map((n) => {
              const cfg = typeIcon[n.type] || typeIcon.system;
              return (
                <div key={n._id} className="card-sm" style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  background: n.isRead ? 'var(--clr-surface)' : 'var(--clr-primary-light)',
                  borderLeft: n.isRead ? '' : '3px solid var(--clr-primary)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--clr-border)',
                  }}>
                    <cfg.Icon size={18} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: n.isRead ? 500 : 700, margin: 0 }}>{n.title}</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', margin: '3px 0' }}>{n.body}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-subtle)' }}>
                      {format(new Date(n.createdAt), 'dd MMM, hh:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // Family alerts tab
        alerts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <CheckCheck size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <h3>No active family alerts</h3>
            <p style={{ color: 'var(--clr-text-muted)', marginTop: 8 }}>All patients are on track! 🎉</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.map((alert) => (
              <div key={alert._id} className="card" style={{ borderLeft: '4px solid var(--clr-danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <AlertTriangle size={18} color="var(--clr-danger)" />
                      <span className="badge badge-danger" style={{ textTransform: 'capitalize' }}>{alert.alertType.replace('_', ' ')}</span>
                    </div>
                    <p style={{ fontWeight: 700 }}>{alert.patient?.name}</p>
                    <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', margin: '4px 0' }}>{alert.message}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-subtle)' }}>
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
